from typing import Optional
from datetime import datetime
import strawberry

@strawberry.type
class CustomerPackage:
    id: str
    name: str
    serviceType: str

@strawberry.type
class Customer:
    id: str
    name: str
    email: str
    phone: str
    username: str
    address: Optional[str]
    agency: str
    package: Optional[CustomerPackage]
    status: str
    expiry: datetime
    password: str  # PPPoE password
    createdAt: datetime = strawberry.field(name="createdAt")
    updatedAt: Optional[datetime] = strawberry.field(name="updatedAt")

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
    password: Optional[str] = None
