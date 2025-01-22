from fastapi import APIRouter, HTTPException, Depends, Response
from typing import Dict
from ..models.radius_models import RadiusProfile
from motor.motor_asyncio import AsyncIOMotorDatabase
from datetime import datetime
from bson import ObjectId
from ..config.database import radius_db

router = APIRouter(prefix="/radius", tags=["radius"])

async def get_database() -> AsyncIOMotorDatabase:
    return radius_db.get_database()

@router.post("/auth", status_code=204)
async def radius_authenticate(request: Dict, db: AsyncIOMotorDatabase = Depends(get_database)):
    """
    FreeRADIUS authentication endpoint
    Expected request format:
    {
        "username": "user",
        "password": "pass"
    }
    """
    username = request.get("username")
    password = request.get("password")
    
    if not username or not password:
        raise HTTPException(status_code=400, detail="Missing username or password")
    
    # Find customer by radiusUsername
    customer = await db.customers.find_one({
        "radius_username": username,
        "status": "active"  # Only authenticate active customers
    })
    
    if not customer:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    # Check if customer's package has expired
    if customer.get("expiry") and datetime.utcnow() > customer["expiry"]:
        raise HTTPException(status_code=401, detail="Package expired")
    
    # TODO: Implement proper password verification
    # For now, using direct comparison (you should use proper password hashing)
    if password != customer.get("password"):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    return Response(status_code=204)

@router.post("/authorize")
async def radius_authorize(request: Dict, db: AsyncIOMotorDatabase = Depends(get_database)):
    """
    FreeRADIUS authorization endpoint
    Expected request format:
    {
        "username": "user"
    }
    Returns user attributes based on their package profile
    """
    username = request.get("username")
    
    if not username:
        raise HTTPException(status_code=400, detail="Missing username")
    
    # Find customer by radiusUsername
    customer = await db.customers.find_one({
        "radius_username": username,
        "status": "active"
    })
    
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")
    
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
        package = await db.packages.find_one({"_id": ObjectId(customer["package"])})
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
    
    return reply 