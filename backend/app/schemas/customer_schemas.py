from typing import Optional
from datetime import datetime
import strawberry

@strawberry.type
class Customer:
    id: str
    name: str
    email: str
    phone: str
    username: str
    address: Optional[str]
    agency: str
    package: Optional[str]
    status: str
    expiry: datetime
    radiusUsername: Optional[str]
    created_at: datetime
    updated_at: Optional[datetime]

@strawberry.input
class CustomerInput:
    name: str
    email: str
    phone: str
    username: str
    password: str
    address: Optional[str] = None
    package: Optional[str] = None
    status: Optional[str] = "inactive"
    expiry: datetime
    radiusUsername: Optional[str] = None

@strawberry.input
class CustomerUpdateInput:
    name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    username: Optional[str] = None
    address: Optional[str] = None
    package: Optional[str] = None
    status: Optional[str] = None
    expiry: Optional[datetime] = None
    radiusUsername: Optional[str] = None
