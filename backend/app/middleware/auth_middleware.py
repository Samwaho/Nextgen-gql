from typing import Optional, Any, Callable
from strawberry.types import Info
from ..utils.auth import verify_token
from ..config.database import db
from bson import ObjectId
from fastapi import Request
import jwt
from app.config.settings import settings
from strawberry.fastapi import BaseContext
from functools import wraps

class Context(BaseContext):
    def __init__(self, request: Request, user: Optional[dict] = None):
        super().__init__()
        self.request = request
        self.user = user

async def get_context(request: Request):
    auth_header = request.headers.get('Authorization')
    context = Context(request=request)
    
    
    if auth_header and auth_header.startswith('Bearer '):
        try:
            token = auth_header.split(' ')[1]
            
            payload = verify_token(token)

            if payload and 'sub' in payload:
                collection = db.get_collection("users")
                user = await collection.find_one({"_id": ObjectId(payload['sub'])})
                if user:
                    context.user = user
                    context.user_id = str(user["_id"])
                else:
                    print("User not found in database")
            else:
                print("Invalid token payload")
        except (jwt.InvalidTokenError, Exception) as e:
            print(f"Auth error: {str(e)}")
    else:
        print("No Authorization header or invalid format")
    
    return context

def is_authenticated(info: Info) -> bool:
    return info.context.user is not None

def login_required(resolver: Callable) -> Callable:
    @wraps(resolver)
    async def wrapper(root: Any, info: Info, *args, **kwargs) -> Any:
        if not is_authenticated(info):
            raise Exception("Authentication required")
        return await resolver(root, info, *args, **kwargs)
    return wrapper