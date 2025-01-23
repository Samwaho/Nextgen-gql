from fastapi import APIRouter, HTTPException, Depends, Response, Request
from typing import Dict, Optional
from ..models.radius_models import RadiusProfile
from motor.motor_asyncio import AsyncIOMotorDatabase
from datetime import datetime
from bson import ObjectId
from ..config.database import db
import logging
import json

# Configure logging
logging.basicConfig(
    level=logging.DEBUG,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger("radius_routes")

router = APIRouter(prefix="/radius", tags=["radius"])

async def get_database() -> AsyncIOMotorDatabase:
    return db.get_database()

def format_radius_response(data: Dict) -> Dict:
    """Format response according to FreeRADIUS REST module specs"""
    logger.debug(f"Starting to format RADIUS response with raw data: {json.dumps(data, default=str)}")
    
    response = {
        "control": {},
        "reply": {}
    }
    
    # Control attributes that should go in the control section
    control_attrs = {
        "Cleartext-Password",
        "NT-Password",
        "LM-Password",
        "Password-With-Header",
        "Auth-Type"
    }
    
    # Log each attribute as it's processed
    for key, value in data.items():
        logger.debug(f"Processing attribute: {key} = {value}")
        if key in control_attrs:
            if isinstance(value, dict):
                logger.debug(f"Adding control attribute {key} as dict: {value}")
                response["control"][key] = value
            else:
                formatted_value = {"value": [str(value)], "op": ":="}
                logger.debug(f"Adding control attribute {key} with formatted value: {formatted_value}")
                response["control"][key] = formatted_value
        else:
            if isinstance(value, dict):
                logger.debug(f"Adding reply attribute {key} as dict: {value}")
                response["reply"][key] = value
            else:
                formatted_value = {"value": [str(value)], "op": ":="}
                logger.debug(f"Adding reply attribute {key} with formatted value: {formatted_value}")
                response["reply"][key] = formatted_value
    
    logger.debug("Final RADIUS response:")
    logger.debug(f"Control attributes: {json.dumps(response['control'], default=str, indent=2)}")
    logger.debug(f"Reply attributes: {json.dumps(response['reply'], default=str, indent=2)}")
    return response

@router.post("/authorize")
async def radius_authorize(
    request: Request,
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """
    FreeRADIUS authorization endpoint
    POST /radius/authorize
    """
    logger.info("Processing authorization request")
    
    try:
        body = await request.json()
        logger.debug(f"Received JSON body: {json.dumps(body, default=str)}")
    except:
        body = {}
        logger.debug("No JSON body found, will try form data")
    
    username = body.get("username", "")
    if not username:
        # Extract from User-Name if not in body
        form = await request.form()
        username = form.get("User-Name", "")
        logger.debug(f"Got username from form data: {username}")
    
    if not username:
        logger.warning("No username provided in request")
        response = format_radius_response({
            "Reply-Message": "Login invalid"
        })
        logger.debug("Sending login invalid response:")
        logger.debug(json.dumps(response, default=str, indent=2))
        return response
    
    # Find customer by username
    logger.debug(f"Looking up customer with username: {username}")
    # Query the isp_manager database's customers collection
    customer = await db.get_collection("customers").find_one({
        "username": username
    })
    
    logger.debug(f"Raw customer data from DB: {json.dumps(customer, default=str) if customer else 'None'}")
    
    if not customer:
        logger.warning(f"Customer not found: {username}")
        response = format_radius_response({
            "Reply-Message": "Login invalid"
        })
        logger.debug("Sending login invalid response:")
        logger.debug(json.dumps(response, default=str, indent=2))
        return response
    
    logger.debug(f"Found customer: {json.dumps(customer, default=str)}")
    
    # Check if customer is active
    if customer.get("status") != "active":
        logger.warning(f"Customer {username} is not active. Status: {customer.get('status')}")
        response = format_radius_response({
            "Reply-Message": "Login disabled"
        })
        logger.debug("Sending login disabled response:")
        logger.debug(json.dumps(response, default=str, indent=2))
        return response
    
    # Check if customer's package has expired
    if customer.get("expiry") and datetime.utcnow() > customer["expiry"]:
        logger.warning(f"Customer {username} package expired. Expiry: {customer.get('expiry')}")
        response = format_radius_response({
            "Reply-Message": "Access time expired"
        })
        logger.debug("Sending access expired response:")
        logger.debug(json.dumps(response, default=str, indent=2))
        return response

    # Build response according to FreeRADIUS REST module specs
    logger.debug("Building successful authorization response")
    reply = {
        "Cleartext-Password": customer["password"],
        "Auth-Type": "MS-CHAP"  # Explicitly set Auth-Type for MS-CHAP
    }
    logger.debug(f"Initial reply attributes: {json.dumps(reply, default=str, indent=2)}")
    
    # If customer has a package, get package details
    if customer.get("package"):
        logger.debug(f"Looking up package for customer {username}: {customer['package']}")
        package = await db.get_collection("packages").find_one({"_id": ObjectId(customer["package"])})
        if package:
            logger.debug(f"Found package: {json.dumps(package, default=str)}")
            # Convert package to RadiusProfile
            profile = RadiusProfile(
                name=package.get("name", "default"),
                download_speed=package["download_speed"],
                upload_speed=package["upload_speed"],
                burst_download=package.get("burst_download"),
                burst_upload=package.get("burst_upload"),
                threshold_download=package.get("threshold_download"),
                threshold_upload=package.get("threshold_upload"),
                burst_time=package.get("burst_time"),
                service_type=package.get("service_type"),
                address_pool=package.get("address_pool"),
                session_timeout=package.get("session_timeout"),
                idle_timeout=package.get("idle_timeout"),
                priority=package.get("priority"),
                vlan_id=package.get("vlan_id")
            )
            
            # Add profile attributes
            logger.debug("Adding bandwidth attributes")
            reply.update({
                "WISPr-Bandwidth-Max-Down": profile.download_speed,
                "WISPr-Bandwidth-Max-Up": profile.upload_speed
            })
            logger.debug(f"Reply after bandwidth attributes: {json.dumps(reply, default=str, indent=2)}")
            
            # Add additional profile attributes
            logger.debug("Adding additional profile attributes")
            for attr in profile.to_radius_attributes():
                if attr.name not in reply:
                    logger.debug(f"Adding attribute {attr.name} = {attr.value}")
                    reply[attr.name] = attr.value
            
            logger.debug(f"Final reply before formatting: {json.dumps(reply, default=str, indent=2)}")
        else:
            logger.warning(f"Package not found for customer {username}: {customer['package']}")
    
    logger.info(f"Authorization successful for {username}")
    response = format_radius_response(reply)
    logger.debug("Sending successful authorization response:")
    logger.debug(json.dumps(response, default=str, indent=2))
    return response

@router.post("/auth")
async def radius_authenticate(
    request: Request,
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """
    FreeRADIUS authentication endpoint
    POST /radius/auth
    """
    logger.info("Processing authentication request")
    
    try:
        body = await request.json()
        logger.debug(f"Received JSON body: {json.dumps(body, default=str)}")
    except:
        body = {}
        logger.debug("No JSON body found, will try form data")
    
    # Try to get credentials from JSON body first, then form data
    username = body.get("username")
    password = body.get("password")
    
    if not username or not password:
        form = await request.form()
        username = form.get("User-Name")
        password = form.get("User-Password")
        logger.debug(f"Got credentials from form data: username={username}")
    
    if not username or not password:
        logger.warning("Missing username or password")
        return format_radius_response({
            "Reply-Message": "Login invalid"
        })
    
    # Find customer by username
    logger.debug(f"Looking up customer with username: {username}")
    customer = await db.customers.find_one({
        "username": username
    })
    
    if not customer:
        logger.warning(f"Customer not found: {username}")
        return format_radius_response({
            "Reply-Message": "Login invalid"
        })
    
    # Check password
    if customer["password"] != password:
        logger.warning(f"Invalid password for customer: {username}")
        return format_radius_response({
            "Reply-Message": "Wrong Password"
        })
    
    # Check if customer is active
    if customer.get("status") != "active":
        logger.warning(f"Customer {username} is not active. Status: {customer.get('status')}")
        return format_radius_response({
            "Reply-Message": "Login disabled"
        })
    
    # Check if customer's package has expired
    if customer.get("expiry") and datetime.utcnow() > customer["expiry"]:
        logger.warning(f"Customer {username} package expired. Expiry: {customer.get('expiry')}")
        return format_radius_response({
            "Reply-Message": "Access time expired"
        })
    
    logger.info(f"Authentication successful for {username}")
    return Response(status_code=204)

@router.post("/user/{username}/sessions/{session_id}")
async def radius_accounting(
    username: str,
    session_id: str,
    request: Request,
    action: str,
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """
    FreeRADIUS accounting endpoint
    POST /user/{username}/sessions/{session_id}?action=preacct|accounting
    """
    logger.info(f"Processing accounting request for {username}, session {session_id}, action {action}")
    
    if action not in ["preacct", "accounting"]:
        logger.error(f"Invalid accounting action: {action}")
        return Response(status_code=400)
    
    try:
        body = await request.json()
        logger.debug(f"Received JSON body: {json.dumps(body, default=str)}")
    except:
        body = {}
        logger.debug("No JSON body found, will try form data")
        
    # Get accounting data from form if not in JSON
    if not body:
        form = await request.form()
        body = dict(form)
        logger.debug(f"Got form data: {json.dumps(body, default=str)}")
    
    # Add username and session_id to body
    body["username"] = username
    body["session_id"] = session_id
    body["timestamp"] = datetime.utcnow()
    
    # Store accounting data
    try:
        await db.accounting.insert_one(body)
        logger.info(f"Stored accounting data for {username}, session {session_id}")
        return Response(status_code=204)
    except Exception as e:
        logger.error(f"Failed to store accounting data: {str(e)}")
        return Response(status_code=500)

@router.post("/user/{username}/mac/{called_station_id}")
async def radius_post_auth(
    username: str,
    called_station_id: str,
    action: str,
    request: Request,
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """
    FreeRADIUS post-auth endpoint
    POST /user/{username}/mac/{called_station_id}?action=post-auth|pre-proxy|post-proxy
    """
    logger.info(f"Processing post-auth request for {username}, MAC {called_station_id}, action {action}")
    
    if action not in ["post-auth", "pre-proxy", "post-proxy"]:
        logger.error(f"Invalid post-auth action: {action}")
        return Response(status_code=400)
    
    try:
        body = await request.json()
        logger.debug(f"Received JSON body: {json.dumps(body, default=str)}")
    except:
        body = {}
        logger.debug("No JSON body found, will try form data")
        
    # Get post-auth data from form if not in JSON
    if not body:
        form = await request.form()
        body = dict(form)
        logger.debug(f"Got form data: {json.dumps(body, default=str)}")
    
    # Add username and called_station_id to body
    body["username"] = username
    body["called_station_id"] = called_station_id
    body["timestamp"] = datetime.utcnow()
    
    # Store post-auth data
    try:
        await db.post_auth.insert_one(body)
        logger.info(f"Stored post-auth data for {username}, MAC {called_station_id}")
        return Response(status_code=204)
    except Exception as e:
        logger.error(f"Failed to store post-auth data: {str(e)}")
        return Response(status_code=500) 