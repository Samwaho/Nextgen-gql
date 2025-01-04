from typing import Optional, Literal
from datetime import datetime
import strawberry

@strawberry.type
class Employee:
    id: str
    name: str
    email: str
    username: str
    phone: str
    role: str
    agency: str
    createdAt: datetime = strawberry.field(name="createdAt")
    updatedAt: Optional[datetime] = strawberry.field(name="updatedAt")

@strawberry.input
class EmployeeInput:
    name: str
    email: str
    password: str
    username: str
    phone: str
    role: str = "employee"

@strawberry.input
class EmployeeUpdateInput:
    name: Optional[str] = None
    email: Optional[str] = None
    username: Optional[str] = None
    phone: Optional[str] = None
    role: Optional[str] = None
