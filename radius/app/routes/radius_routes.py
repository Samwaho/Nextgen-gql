from fastapi import APIRouter, HTTPException, Depends, Response, Request
from typing import Dict, Optional
from ..models.radius_models import RadiusProfile
from motor.motor_asyncio import AsyncIOMotorDatabase
from datetime import datetime
from bson import ObjectId
from ..config.database import radius_db

router = APIRouter(prefix="/radius", tags=["radius"])

async def get_database() -> AsyncIOMotorDatabase:
    return radius_db.get_database()

def format_radius_response(data: Dict) -> Dict:
    """Format response according to FreeRADIUS REST module specs"""
    response = {}
    for key, value in data.items():
        if isinstance(value, (str, int, float, bool)):
            response[key] = {"value": [str(value)], "op": ":="}
        elif isinstance(value, (list, tuple)):
            response[key] = {"value": [str(x) for x in value], "op": ":="}
        elif isinstance(value, dict):
            response[key] = value
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
        return format_radius_response({
            "Reply-Message": "Login invalid"
        })
    
    # Find customer by username
    customer = await db.customers.find_one({
        "username": username
    })
    
    if not customer:
        return format_radius_response({
            "Reply-Message": "Login invalid"
        })
    
    # Check if customer is active
    if customer.get("status") != "active":
        return format_radius_response({
            "Reply-Message": "Login disabled"
        })
    
    # Check if customer's package has expired
    if customer.get("expiry") and datetime.utcnow() > customer["expiry"]:
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
        return format_radius_response({
            "Reply-Message": "Login invalid"
        })
    
    # Find customer by username
    customer = await db.customers.find_one({
        "username": username
    })
    
    if not customer:
        return format_radius_response({
            "Reply-Message": "Login invalid"
        })
    
    # Check password
    if customer["password"] != password:
        return format_radius_response({
            "Reply-Message": "Wrong Password"
        })
    
    # Check if customer is active
    if customer.get("status") != "active":
        return format_radius_response({
            "Reply-Message": "Login disabled"
        })
    
    # Check if customer's package has expired
    if customer.get("expiry") and datetime.utcnow() > customer["expiry"]:
        return format_radius_response({
            "Reply-Message": "Access time expired"
        })
    
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
    if action not in ["preacct", "accounting"]:
        return Response(status_code=400)
    
    try:
        body = await request.json()
    except:
        body = {}
        
    # Get accounting data from form if not in JSON
    if not body:
        form = await request.form()
        body = dict(form)
    
    # Add username and session_id to body
    body["username"] = username
    body["session_id"] = session_id
    body["timestamp"] = datetime.utcnow()
    
    # Store accounting data
    try:
        await db.accounting.insert_one(body)
        return Response(status_code=204)
    except Exception as e:
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
    if action not in ["post-auth", "pre-proxy", "post-proxy"]:
        return Response(status_code=400)
    
    try:
        body = await request.json()
    except:
        body = {}
        
    # Get post-auth data from form if not in JSON
    if not body:
        form = await request.form()
        body = dict(form)
    
    # Add username and called_station_id to body
    body["username"] = username
    body["called_station_id"] = called_station_id
    body["timestamp"] = datetime.utcnow()
    
    # Store post-auth data
    try:
        await db.post_auth.insert_one(body)
        return Response(status_code=204)
    except Exception as e:
        return Response(status_code=500) 