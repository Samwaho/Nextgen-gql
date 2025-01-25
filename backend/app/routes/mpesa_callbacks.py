from fastapi import APIRouter, Request
from typing import Dict, Any
from .mpesa_routes import handle_confirmation, handle_validation, handle_timeout

router = APIRouter(prefix="/api/mpesa", tags=["mpesa"])

@router.post("/confirmation")
async def mpesa_confirmation(request: Request) -> Dict[str, Any]:
    """Handle M-Pesa confirmation callback."""
    try:
        data = await request.json()
        return await handle_confirmation(data)
    except Exception as e:
        return {
            "ResultCode": 1,
            "ResultDesc": f"Error processing confirmation: {str(e)}"
        }

@router.post("/validation")
async def mpesa_validation(request: Request) -> Dict[str, Any]:
    """Handle M-Pesa validation callback."""
    try:
        data = await request.json()
        return await handle_validation(data)
    except Exception as e:
        return {
            "ResultCode": 1,
            "ResultDesc": f"Error processing validation: {str(e)}"
        }

@router.post("/timeout")
async def mpesa_timeout(request: Request) -> Dict[str, Any]:
    """Handle M-Pesa timeout callback."""
    try:
        data = await request.json()
        return await handle_timeout(data)
    except Exception as e:
        return {
            "ResultCode": 1,
            "ResultDesc": f"Error processing timeout: {str(e)}"
        }

@router.post("/result")
async def mpesa_result(request: Request) -> Dict[str, Any]:
    """Handle M-Pesa result callback (reuses confirmation handler)."""
    try:
        data = await request.json()
        return await handle_confirmation(data)
    except Exception as e:
        return {
            "ResultCode": 1,
            "ResultDesc": f"Error processing result: {str(e)}"
        } 