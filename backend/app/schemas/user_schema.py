import strawberry
from datetime import datetime
from typing import Optional, List
from strawberry.scalars import JSON

@strawberry.type
class User:
    id: str
    name: str
    email: str
    roles: List[str] = strawberry.field(default_factory=lambda: ["user"])
    address: Optional[str] = None
    phone: Optional[str] = None
    agency: Optional[str] = None
    is_verified: bool = False
    created_at: datetime
    updated_at: Optional[datetime] = None
    is_active: bool = True
    # Security-sensitive fields are intentionally excluded from the GraphQL type
    # verification_code, reset_token, reset_token_expires, verification_expiry

@strawberry.input
class UserInput:
    name: str
    email: str
    password: str
    address: Optional[str] = None
    phone: Optional[str] = None
    agency: Optional[str] = None
    roles: Optional[List[str]] = None

@strawberry.input
class UserUpdateInput:
    name: Optional[str] = None
    email: Optional[str] = None
    address: Optional[str] = None
    phone: Optional[str] = None
    agency: Optional[str] = None
    roles: Optional[List[str]] = None
    is_active: Optional[bool] = None
    is_verified: Optional[bool] = None

@strawberry.type
class Query:
    users: List[User]
    user: Optional[User]

@strawberry.type
class Mutation:
    create_user: User
    update_user: Optional[User]
    delete_user: bool
