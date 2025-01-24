from fastapi import APIRouter, HTTPException, Depends, Response, Request
from typing import Dict, Optional
from ..models.radius_models import RadiusProfile
from motor.motor_asyncio import AsyncIOMotorDatabase
from datetime import datetime, timedelta
from bson import ObjectId
from ..config.database import db
import logging
import json

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger("radius_routes")

router = APIRouter(prefix="/radius", tags=["radius"])

async def get_database() -> AsyncIOMotorDatabase:
    return db.get_database()

def format_radius_response(data: Dict) -> Dict:
    """Format response according to FreeRADIUS REST module specs"""
    # FreeRADIUS expects a flat structure with control:XXX and reply:XXX
    response = {}
    
    # Control attributes that should go in the control section
    control_attrs = {
        "Cleartext-Password",
        "NT-Password",
        "LM-Password",
        "Password-With-Header",
        "Auth-Type"
    }
    
    for key, value in data.items():
        if key in control_attrs:
            if isinstance(value, dict):
                response[f"control:{key}"] = value
            else:
                response[f"control:{key}"] = {"value": [str(value)], "op": ":="}
        else:
            if isinstance(value, dict):
                response[f"reply:{key}"] = value
            else:
                response[f"reply:{key}"] = {"value": [str(value)], "op": ":="}
    
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
    except:
        body = {}
    
    username = body.get("username", "")
    if not username:
        # Extract from User-Name if not in body
        form = await request.form()
        username = form.get("User-Name", "")
    
    if not username:
        logger.warning("No username provided in request")
        return format_radius_response({
            "Reply-Message": "Login invalid"
        })
    
    # Find customer by username
    logger.info(f"Authorization request for user: {username}")
    customer = await db.get_collection("customers").find_one({
        "username": username
    })
    
    if not customer:
        logger.warning(f"Customer not found: {username}")
        return format_radius_response({
            "Reply-Message": "Login invalid"
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

    # Build response according to FreeRADIUS REST module specs
    reply = {
        "Cleartext-Password": customer["password"]
    }
    
    # If customer has a package, get package details
    if customer.get("package"):
        package = await db.get_collection("packages").find_one({"_id": ObjectId(customer["package"])})
        if package:
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
            reply.update({
                "WISPr-Bandwidth-Max-Down": profile.download_speed,
                "WISPr-Bandwidth-Max-Up": profile.upload_speed
            })
            
            # Add additional profile attributes
            for attr in profile.to_radius_attributes():
                if attr.name not in reply:
                    reply[attr.name] = attr.value
        else:
            logger.warning(f"Package not found for customer {username}: {customer['package']}")
    
    logger.info(f"Authorization successful for {username}")
    return format_radius_response(reply)

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
    except:
        body = {}
    
    # Try to get credentials from JSON body first, then form data
    username = body.get("username")
    password = body.get("password")
    
    if not username or not password:
        form = await request.form()
        username = form.get("User-Name")
        password = form.get("User-Password")
    
    if not username or not password:
        logger.warning("Missing username or password")
        return format_radius_response({
            "Reply-Message": "Login invalid"
        })
    
    # Find customer by username
    logger.info(f"Authentication request for user: {username}")
    customer = await db.get_collection("customers").find_one({
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
    except:
        body = {}
        
    # Get accounting data from form if not in JSON
    if not body:
        form = await request.form()
        body = dict(form)
    
    # Get customer details
    customer = await db.get_collection("customers").find_one({
        "username": username
    })
    
    if not customer:
        logger.error(f"Customer not found for accounting: {username}")
        return Response(status_code=404)
    
    # Structure accounting data
    accounting_data = {
        "username": username,
        "session_id": session_id,
        "customer_id": str(customer["_id"]),
        "agency": customer["agency"],
        "package": customer.get("package"),
        "status": body.get("Acct-Status-Type", ""),
        "session_time": int(body.get("Acct-Session-Time", 0)),
        "input_octets": int(body.get("Acct-Input-Octets", 0)),
        "output_octets": int(body.get("Acct-Output-Octets", 0)),
        "input_packets": int(body.get("Acct-Input-Packets", 0)),
        "output_packets": int(body.get("Acct-Output-Packets", 0)),
        "input_gigawords": int(body.get("Acct-Input-Gigawords", 0)),
        "output_gigawords": int(body.get("Acct-Output-Gigawords", 0)),
        "called_station_id": body.get("Called-Station-Id", ""),
        "calling_station_id": body.get("Calling-Station-Id", ""),
        "terminate_cause": body.get("Acct-Terminate-Cause", ""),
        "nas_ip_address": body.get("NAS-IP-Address", ""),
        "nas_identifier": body.get("NAS-Identifier", ""),
        "nas_port": body.get("NAS-Port", ""),
        "nas_port_type": body.get("NAS-Port-Type", ""),
        "service_type": body.get("Service-Type", ""),
        "framed_protocol": body.get("Framed-Protocol", ""),
        "framed_ip_address": body.get("Framed-IP-Address", ""),
        "timestamp": datetime.utcnow(),
        "raw_data": body  # Store complete raw data for reference
    }
    
    # Calculate total bytes (including gigawords)
    total_input = (accounting_data["input_gigawords"] * (2**32)) + accounting_data["input_octets"]
    total_output = (accounting_data["output_gigawords"] * (2**32)) + accounting_data["output_octets"]
    
    # Add calculated fields
    accounting_data.update({
        "total_input_bytes": total_input,
        "total_output_bytes": total_output,
        "total_bytes": total_input + total_output,
        "input_mbytes": round(total_input / (1024 * 1024), 2),
        "output_mbytes": round(total_output / (1024 * 1024), 2),
        "total_mbytes": round((total_input + total_output) / (1024 * 1024), 2),
        "session_time_hours": round(accounting_data["session_time"] / 3600, 2)
    })
    
    # Store accounting data
    try:
        # Store in accounting collection
        await db.get_collection("accounting").insert_one(accounting_data)
        
        # Update customer's last_seen and usage_stats if this is a stop record
        if accounting_data["status"] == "Stop":
            update_data = {
                "last_seen": accounting_data["timestamp"],
                "last_session": {
                    "session_id": session_id,
                    "start_time": accounting_data["timestamp"] - timedelta(seconds=accounting_data["session_time"]),
                    "end_time": accounting_data["timestamp"],
                    "duration": accounting_data["session_time"],
                    "input_bytes": total_input,
                    "output_bytes": total_output,
                    "terminate_cause": accounting_data["terminate_cause"]
                }
            }
            
            # Update customer's usage stats
            await db.get_collection("customers").update_one(
                {"_id": customer["_id"]},
                {
                    "$set": update_data,
                    "$inc": {
                        "total_sessions": 1,
                        "total_online_time": accounting_data["session_time"],
                        "total_input_bytes": total_input,
                        "total_output_bytes": total_output
                    }
                }
            )
        
        logger.info(f"Stored accounting data for {username}, session {session_id}, type {accounting_data['status']}")
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
    except:
        body = {}
        
    # Get post-auth data from form if not in JSON
    if not body:
        form = await request.form()
        body = dict(form)
    
    # Get customer details for agency info
    customer = await db.get_collection("customers").find_one({
        "username": username
    })
    
    if not customer:
        logger.error(f"Customer not found for post-auth: {username}")
        return Response(status_code=404)
    
    # Add metadata to body
    post_auth_data = {
        **body,
        "username": username,
        "called_station_id": called_station_id,
        "agency": customer["agency"],
        "customer_id": str(customer["_id"]),
        "timestamp": datetime.utcnow()
    }
    
    # Store post-auth data
    try:
        await db.get_collection("post_auth").insert_one(post_auth_data)
        logger.info(f"Stored post-auth data for {username}, MAC {called_station_id}")
        return Response(status_code=204)
    except Exception as e:
        logger.error(f"Failed to store post-auth data: {str(e)}")
        return Response(status_code=500) 