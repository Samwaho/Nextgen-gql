from fastapi import APIRouter, HTTPException, Depends, Response, Request
from typing import Dict
from ..models.radius_models import RadiusProfile
from motor.motor_asyncio import AsyncIOMotorDatabase
from datetime import datetime
from bson import ObjectId
from ..config.database import radius_db

router = APIRouter(prefix="/radius", tags=["radius"])

async def get_database() -> AsyncIOMotorDatabase:
    return radius_db.get_database()

@router.get("/user/{username}/mac/{called_station_id}")
async def radius_authenticate(
    request: Request,
    username: str,
    called_station_id: str,
    action: str,
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """
    FreeRADIUS authentication/authorization endpoint
    GET /user/{username}/mac/{called_station_id}?action=authenticate|authorize
    """
    if action not in ["authenticate", "authorize"]:
        raise HTTPException(status_code=400, detail="Invalid action")
    
    # Find customer by username
    customer = await db.customers.find_one({
        "username": username,
        "status": "active"  # Only authenticate active customers
    })
    
    if not customer:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    # Check if customer's package has expired
    if customer.get("expiry") and datetime.utcnow() > customer["expiry"]:
        raise HTTPException(status_code=401, detail="Package expired")

    # Start with basic reply structure
    reply = {
        "control:Cleartext-Password": customer["password"],
        "reply": {}
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
            for attr in profile.to_radius_attributes():
                reply["reply"][attr.name] = attr.value
    
    # Add MS-CHAP specific attributes
    if action == "authorize":
        reply["control:Auth-Type"] = "MS-CHAP"
        reply["control:MS-CHAP-Use-NTLM-Auth"] = "yes"
    
    return reply

@router.post("/user/{username}/sessions/{session_id}")
async def radius_accounting(
    username: str,
    session_id: str,
    action: str,
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """
    FreeRADIUS accounting endpoint
    POST /user/{username}/sessions/{session_id}?action=preacct|accounting
    """
    if action not in ["preacct", "accounting"]:
        raise HTTPException(status_code=400, detail="Invalid action")
    
    # For now, just acknowledge the accounting request
    return Response(status_code=204)

@router.post("/user/{username}/mac/{called_station_id}")
async def radius_post_auth(
    username: str,
    called_station_id: str,
    action: str,
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """
    FreeRADIUS post-auth endpoint
    POST /user/{username}/mac/{called_station_id}?action=post-auth|pre-proxy|post-proxy
    """
    if action not in ["post-auth", "pre-proxy", "post-proxy"]:
        raise HTTPException(status_code=400, detail="Invalid action")
    
    # For now, just acknowledge the post-auth request
    return Response(status_code=204) 