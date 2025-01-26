from typing import Optional
from datetime import datetime
import strawberry

@strawberry.type
class Station:
    id: str
    name: str
    location: str
    address: str
    coordinates: Optional[str]  # Format: "latitude,longitude"
    buildingType: str = strawberry.field(name="buildingType")  # e.g., "apartment", "office", "house"
    totalCustomers: int = strawberry.field(name="totalCustomers", default=0)
    contactPerson: Optional[str] = strawberry.field(name="contactPerson")
    contactPhone: Optional[str] = strawberry.field(name="contactPhone")
    notes: Optional[str]
    agency: str
    status: str
    createdAt: datetime = strawberry.field(name="createdAt")
    updatedAt: Optional[datetime] = strawberry.field(name="updatedAt")

@strawberry.input
class StationInput:
    name: str
    location: str
    address: str
    coordinates: Optional[str] = None
    buildingType: str
    contactPerson: Optional[str] = None
    contactPhone: Optional[str] = None
    notes: Optional[str] = None
    status: Optional[str] = "active"

@strawberry.input
class StationUpdateInput:
    name: Optional[str] = None
    location: Optional[str] = None
    address: Optional[str] = None
    coordinates: Optional[str] = None
    buildingType: Optional[str] = None
    contactPerson: Optional[str] = None
    contactPhone: Optional[str] = None
    notes: Optional[str] = None
    status: Optional[str] = None
