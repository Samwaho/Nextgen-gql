import strawberry
from typing import Optional
from datetime import datetime
from pymongo import MongoClient
from bson import ObjectId
from ..config.database import db
from ..utils.decorators import login_required

@strawberry.type
class Agency:
    id: str
    name: str

@strawberry.type
class User:
    id: str
    name: str
    email: str
    agency: Optional[Agency] = None

@strawberry.type
class Token:
    access_token: str
    token_type: str = "bearer"

@strawberry.type
class TokenData:
    user_id: str
    roles: list[str]

@strawberry.input
class LoginInput:
    email: str
    password: str

@strawberry.input
class SignupInput:
    name: str
    email: str
    password: str
    address: Optional[str] = None
    phone: Optional[str] = None
    agency: Optional[str] = None

@strawberry.input
class GoogleAuthInput:
    token: str

@strawberry.type
class AuthResponse:
    success: bool
    token: Optional[Token] = None
    message: Optional[str] = None 

@strawberry.type
class Query:
    @strawberry.field
    @login_required
    async def user(self, info) -> User:
        if not info.context.user:
            raise Exception("Not authenticated")
            
        user = info.context.user
        
        user_data = {
            "id": str(user["_id"]),
            "name": user["name"],
            "email": user["email"],
            "agency": None  # Default to None
        }
        
        # If user has an agency reference, fetch the agency details
        if "agency" in user and user["agency"]:
            try:
                agency_collection = db.get_collection("agencies")
                agency = await agency_collection.find_one({"_id": ObjectId(user["agency"])})
                if agency:
                    user_data["agency"] = Agency(
                        id=str(agency["_id"]),
                        name=agency["name"]
                    )
            except Exception as e:
                print(f"Error fetching agency: {str(e)}")
                
        return User(**user_data)
