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

@router.post("/accounting")
async def radius_accounting(
    request: Request,
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """
    FreeRADIUS accounting endpoint
    POST /radius/accounting
    """
    try:
        # Try to get JSON data first
        try:
            body = await request.json()
            logger.info(f"Received accounting JSON data: {json.dumps(body, default=str)}")
        except json.JSONDecodeError:
            # If not JSON, try form data
            form = await request.form()
            body = dict(form)
            logger.info(f"Received accounting form data: {json.dumps(body, default=str)}")
        
        # Get required fields with fallbacks for both formats
        username = body.get("username", body.get("User-Name"))
        session_id = body.get("session_id", body.get("Acct-Session-Id"))
        status = body.get("status", body.get("Acct-Status-Type"))
        
        if not username or not session_id or not status:
            logger.error("Missing required fields in accounting request")
            return Response(status_code=400)
        
        # Get customer details
        customer = await db.get_collection("customers").find_one({
            "username": username
        })
        
        if not customer:
            logger.error(f"Customer not found for accounting: {username}")
            return Response(status_code=404)

        def safe_int(value, default=0):
            """Safely convert value to int, return default if empty or invalid"""
            if not value or value == "":
                return default
            try:
                return int(value)
            except (ValueError, TypeError):
                return default
        
        # Structure accounting data
        accounting_data = {
            "username": username,
            "session_id": session_id,
            "customer_id": str(customer["_id"]),
            "agency": customer["agency"],
            "package": customer.get("package"),
            "status": status,
            "session_time": safe_int(body.get("Acct-Session-Time", body.get("session_time", 0))),
            "input_octets": safe_int(body.get("Acct-Input-Octets", body.get("input_octets", 0))),
            "output_octets": safe_int(body.get("Acct-Output-Octets", body.get("output_octets", 0))),
            "input_packets": safe_int(body.get("Acct-Input-Packets", body.get("input_packets", 0))),
            "output_packets": safe_int(body.get("Acct-Output-Packets", body.get("output_packets", 0))),
            "input_gigawords": safe_int(body.get("Acct-Input-Gigawords", body.get("input_gigawords", 0))),
            "output_gigawords": safe_int(body.get("Acct-Output-Gigawords", body.get("output_gigawords", 0))),
            "called_station_id": body.get("Called-Station-Id", body.get("called_station_id", "")),
            "calling_station_id": body.get("Calling-Station-Id", body.get("calling_station_id", "")),
            "terminate_cause": body.get("Acct-Terminate-Cause", body.get("terminate_cause", "")),
            "nas_ip_address": body.get("NAS-IP-Address", body.get("nas_ip_address", "")),
            "nas_identifier": body.get("NAS-Identifier", body.get("nas_identifier", "")),
            "nas_port": body.get("NAS-Port", body.get("nas_port", "")),
            "nas_port_type": body.get("NAS-Port-Type", body.get("nas_port_type", "")),
            "service_type": body.get("Service-Type", body.get("service_type", "")),
            "framed_protocol": body.get("Framed-Protocol", body.get("framed_protocol", "")),
            "framed_ip_address": body.get("Framed-IP-Address", body.get("framed_ip_address", "")),
            "idle_timeout": safe_int(body.get("Idle-Timeout", body.get("idle_timeout", 0))),
            "session_timeout": safe_int(body.get("Session-Timeout", body.get("session_timeout", 0))),
            "mikrotik_rate_limit": body.get("Mikrotik-Rate-Limit", body.get("mikrotik_rate_limit", "")),
            "timestamp": datetime.utcnow()
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
            # Update or create a single record per username
            result = await db.get_collection("accounting").update_one(
                {
                    "username": username  # Only use username as the unique key
                },
                {
                    "$set": {
                        **accounting_data,
                        "last_update": datetime.utcnow(),
                        "last_session_id": session_id,
                        "last_status": status
                    }
                },
                upsert=True
            )
            
            if result.upserted_id:
                logger.info(f"Created new accounting record for {username}")
            else:
                logger.info(f"Updated existing accounting record for {username}")
            
            # Update customer's last_seen and usage_stats if this is a stop record
            if status == "Stop":
                update_data = {
                    "last_seen": accounting_data["timestamp"],
                    "last_session": {
                        "session_id": session_id,
                        "start_time": accounting_data["timestamp"] - timedelta(seconds=accounting_data["session_time"]),
                        "end_time": accounting_data["timestamp"],
                        "duration": accounting_data["session_time"],
                        "input_bytes": total_input,
                        "output_bytes": total_output,
                        "terminate_cause": accounting_data["terminate_cause"],
                        "framed_ip": accounting_data["framed_ip_address"],
                        "rate_limit": accounting_data["mikrotik_rate_limit"]
                    }
                }
                
                # Update customer's usage stats
                result = await db.get_collection("customers").update_one(
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
                logger.info(f"Updated customer {username} usage stats: {result.modified_count} document(s) modified")
            
            return Response(status_code=204)
            
        except Exception as e:
            logger.error(f"Failed to store accounting data: {str(e)}")
            return Response(status_code=500)
            
    except Exception as e:
        logger.error(f"Error processing accounting request: {str(e)}")
        return Response(status_code=500)

@router.post("/post-auth")
async def radius_post_auth(
    request: Request,
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """
    FreeRADIUS post-auth endpoint
    POST /radius/post-auth
    """
    try:
        # Try to get JSON data first
        try:
            body = await request.json()
            logger.info(f"Received post-auth JSON data: {json.dumps(body, default=str)}")
        except json.JSONDecodeError:
            # If not JSON, try form data
            form = await request.form()
            body = dict(form)
            logger.info(f"Received post-auth form data: {json.dumps(body, default=str)}")
        
        # Get required fields with fallbacks for both formats
        username = body.get("username", body.get("User-Name"))
        if not username:
            logger.error("Missing username in post-auth request")
            return Response(status_code=400)
            
        # Get customer details
        customer = await db.get_collection("customers").find_one({
            "username": username
        })
        
        # Structure post-auth data
        post_auth_data = {
            "username": username,
            "called_station_id": body.get("Called-Station-Id", body.get("called_station_id", "")),
            "calling_station_id": body.get("Calling-Station-Id", body.get("calling_station_id", "")),
            "packet_type": body.get("Packet-Type", body.get("packet_type", "")),
            "reply_message": body.get("Reply-Message", body.get("reply_message", "")),
            "timestamp": datetime.utcnow(),
            "raw_data": body,
            "agency": customer["agency"] if customer else None,
            "status": "success" if customer else "failed"
        }
        
        # Store post-auth data
        try:
            result = await db.get_collection("post_auth").insert_one(post_auth_data)
            logger.info(f"Stored post-auth record {result.inserted_id} for {username}")
            return Response(status_code=204)
            
        except Exception as e:
            logger.error(f"Failed to store post-auth data: {str(e)}")
            return Response(status_code=500)
            
    except Exception as e:
        logger.error(f"Error processing post-auth request: {str(e)}")
        return Response(status_code=500) 