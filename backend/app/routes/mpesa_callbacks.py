from fastapi import APIRouter, Request, HTTPException
from typing import Dict, Any
from ..config.database import db
from bson import ObjectId
from .mpesa_routes import handle_confirmation, handle_validation, handle_timeout

router = APIRouter(prefix="/api/mpesa", tags=["mpesa"])

async def get_agency_by_shortcode(shortcode: str) -> Dict[str, Any]:
    """Find agency by M-Pesa shortcode."""
    agencies = db.get_collection("agencies")
    agency = await agencies.find_one({
        "$or": [
            {"mpesa_shortcode": shortcode},
            {"mpesa_b2c_shortcode": shortcode},
            {"mpesa_b2b_shortcode": shortcode}
        ]
    })
    if not agency:
        raise HTTPException(status_code=404, detail=f"No agency found for shortcode {shortcode}")
    return agency

@router.post("/confirmation")
async def mpesa_confirmation(request: Request) -> Dict[str, Any]:
    """Handle M-Pesa confirmation callback."""
    data = await request.json()
    
    # Get the business shortcode from the callback data
    shortcode = data.get("BusinessShortCode")
    if not shortcode:
        return {"ResultCode": "1", "ResultDesc": "Business shortcode not found"}
    
    try:
        # Find the agency by shortcode
        agency = await get_agency_by_shortcode(shortcode)
        agency_id = str(agency["_id"])
        
        # Process the confirmation
        return await handle_confirmation(agency_id, data)
    except HTTPException as e:
        return {"ResultCode": "1", "ResultDesc": str(e.detail)}
    except Exception as e:
        return {"ResultCode": "1", "ResultDesc": str(e)}

@router.post("/validation")
async def mpesa_validation(request: Request) -> Dict[str, Any]:
    """Handle M-Pesa validation callback."""
    data = await request.json()
    
    # Get the business shortcode from the callback data
    shortcode = data.get("BusinessShortCode")
    if not shortcode:
        return {"ResultCode": "1", "ResultDesc": "Business shortcode not found"}
    
    try:
        # Find the agency by shortcode
        agency = await get_agency_by_shortcode(shortcode)
        agency_id = str(agency["_id"])
        
        # Process the validation
        return await handle_validation(agency_id, data)
    except HTTPException as e:
        return {"ResultCode": "1", "ResultDesc": str(e.detail)}
    except Exception as e:
        return {"ResultCode": "1", "ResultDesc": str(e)}

@router.post("/timeout")
async def mpesa_timeout(request: Request) -> Dict[str, Any]:
    """Handle M-Pesa timeout callback."""
    data = await request.json()
    
    # Get the business shortcode from the callback data
    shortcode = data.get("BusinessShortCode")
    if not shortcode:
        return {"ResultCode": "1", "ResultDesc": "Business shortcode not found"}
    
    try:
        # Find the agency by shortcode
        agency = await get_agency_by_shortcode(shortcode)
        agency_id = str(agency["_id"])
        
        # Process the timeout
        return await handle_timeout(agency_id, data)
    except HTTPException as e:
        return {"ResultCode": "1", "ResultDesc": str(e.detail)}
    except Exception as e:
        return {"ResultCode": "1", "ResultDesc": str(e)}

@router.post("/result")
async def mpesa_result(request: Request) -> Dict[str, Any]:
    """Handle M-Pesa result callback."""
    data = await request.json()
    
    # Get the business shortcode from the callback data
    shortcode = data.get("BusinessShortCode")
    if not shortcode:
        return {"ResultCode": "1", "ResultDesc": "Business shortcode not found"}
    
    try:
        # Find the agency by shortcode
        agency = await get_agency_by_shortcode(shortcode)
        agency_id = str(agency["_id"])
        
        # Process the result (reuse confirmation handler)
        return await handle_confirmation(agency_id, data)
    except HTTPException as e:
        return {"ResultCode": "1", "ResultDesc": str(e.detail)}
    except Exception as e:
        return {"ResultCode": "1", "ResultDesc": str(e)} 