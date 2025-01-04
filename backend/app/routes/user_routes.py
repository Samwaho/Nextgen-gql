from ..config.database import db
from ..schemas.user_schema import User, UserInput, UserUpdateInput
from typing import List, Optional
from datetime import datetime
import strawberry
from passlib.hash import bcrypt
from bson import ObjectId
from ..utils.decorators import login_required, role_required, has_role
from strawberry.types import Info

async def get_users() -> List[User]:
    collection = db.get_collection("users")
    users_data = await collection.find({}).to_list(None)
    return [
        User(
            id=str(user["_id"]),
            name=user["name"],
            email=user["email"],
            roles=user.get("roles", ["user"]),
            address=user.get("address"),
            phone=user.get("phone"),
            agency=user.get("agency"),
            is_verified=user.get("is_verified", False),
            created_at=user.get("created_at", datetime.utcnow()),
            updated_at=user.get("updated_at"),
            is_active=user.get("is_active", True)
        ) for user in users_data
    ]

async def get_user(id: str) -> Optional[User]:
    collection = db.get_collection("users")
    try:
        user = await collection.find_one({"_id": ObjectId(id)})
        if user:
            return User(
                id=str(user["_id"]),
                name=user["name"],
                email=user["email"],
                roles=user.get("roles", ["user"]),
                address=user.get("address"),
                phone=user.get("phone"),
                agency=user.get("agency"),
                is_verified=user.get("is_verified", False),
                created_at=user.get("created_at", datetime.utcnow()),
                updated_at=user.get("updated_at"),
                is_active=user.get("is_active", True)
            )
    except:
        return None
    return None

async def create_user(user_input: UserInput) -> User:
    collection = db.get_collection("users")
    now = datetime.utcnow()
    user_data = {
        "name": user_input.name,
        "email": user_input.email,
        "password": bcrypt.hash(user_input.password),
        "roles": user_input.roles or ["user"],
        "address": user_input.address,
        "phone": user_input.phone,
        "agency": user_input.agency,
        "is_verified": False,
        "created_at": now,
        "updated_at": now,
        "is_active": True
    }
    result = await collection.insert_one(user_data)
    user_data["id"] = str(result.inserted_id)
    return User(**user_data)

async def update_user(id: str, user_input: UserUpdateInput) -> Optional[User]:
    collection = db.get_collection("users")
    update_data = {
        "updated_at": datetime.utcnow()
    }
    
    # Only include fields that are actually being updated
    for field in ["name", "email", "address", "phone", "agency", "roles", "is_active", "is_verified"]:
        value = getattr(user_input, field)
        if value is not None:
            update_data[field] = value
    
    try:
        if update_data:
            result = await collection.find_one_and_update(
                {"_id": ObjectId(id)},
                {"$set": update_data},
                return_document=True
            )
            if result:
                return User(
                    id=str(result["_id"]),
                    name=result["name"],
                    email=result["email"],
                    roles=result.get("roles", ["user"]),
                    address=result.get("address"),
                    phone=result.get("phone"),
                    agency=result.get("agency"),
                    is_verified=result.get("is_verified", False),
                    created_at=result.get("created_at", datetime.utcnow()),
                    updated_at=result.get("updated_at"),
                    is_active=result.get("is_active", True)
                )
    except:
        return None
    return None

async def delete_user(id: str) -> bool:
    collection = db.get_collection("users")
    try:
        result = await collection.delete_one({"_id": ObjectId(id)})
        return result.deleted_count > 0
    except:
        return False

@strawberry.type
class Query:
    @strawberry.field
    @login_required
    async def current_user(self, info: Info) -> Optional[User]:
        """Get the currently authenticated user"""
        try:
            user = info.context.user
            if not user:
                return None
            
            return User(
                id=str(user["_id"]),
                name=user["name"],
                email=user["email"],
                agency=user.get("agency"),
                roles=user.get("roles", ["user"]),
                address=user.get("address"),
                phone=user.get("phone"),
                is_verified=user.get("is_verified", False),
                created_at=user.get("created_at", datetime.utcnow()),
                updated_at=user.get("updated_at"),
                is_active=user.get("is_active", True)
            )
        except Exception as e:
            print(f"Error in current_user resolver: {str(e)}")
            return None

    @strawberry.field
    @login_required
    @role_required("admin")
    async def users(self, info: Info) -> List[User]:
        return await get_users()

    @strawberry.field
    @login_required
    async def user(self, info: Info, id: str) -> Optional[User]:
        # Users can only access their own profile unless they're admin
        if not has_role(info, "admin") and str(info.context.user["_id"]) != id:
            raise Exception("Not authorized")
        return await get_user(id)

@strawberry.type
class Mutation:
    @strawberry.mutation
    async def create_user(self, user_input: UserInput) -> User:
        return await create_user(user_input)

    @strawberry.mutation
    @login_required
    async def update_user(self, info: Info, id: str, user_input: UserUpdateInput) -> Optional[User]:
        if not has_role(info, "admin") and str(info.context.user["_id"]) != id:
            raise Exception("Not authorized")
        return await update_user(id, user_input)
    
    @strawberry.mutation
    @login_required
    @role_required("admin")
    async def delete_user(self, info: Info, id: str) -> bool:
        return await delete_user(id) 