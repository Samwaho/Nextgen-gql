from typing import Optional
import strawberry
from datetime import datetime

@strawberry.type
class User:
    id: str
    email: str
    username: str
    role: str
    agency: Optional[str] = None
    createdAt: datetime = strawberry.field(name="createdAt")
    updatedAt: Optional[datetime] = strawberry.field(name="updatedAt")

@strawberry.type
class Token:
    accessToken: str = strawberry.field(name="accessToken")

@strawberry.type
class AuthResponse:
    success: bool
    token: Optional[Token] = None
    message: Optional[str] = None
    user: Optional[User] = None

@strawberry.input
class LoginInput:
    email: str
    password: str 