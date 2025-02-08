import strawberry
from typing import Dict, List, Optional
from datetime import datetime
from strawberry.scalars import JSON

@strawberry.type
class Tier:
    name: str
    price: float
    features: List[str] = strawberry.field(description="List of features")

@strawberry.input
class TierInput:
    name: str
    price: float
    features: List[str] = strawberry.field(description="List of features")

@strawberry.type
class Service:
    id: str
    name: str
    tiers: List[Tier]
    created_at: datetime
    updated_at: Optional[datetime] = None

@strawberry.input
class ServiceInput:
    name: str
    tiers: List[TierInput]

@strawberry.input
class ServiceUpdateInput:
    name: Optional[str] = None
    tiers: Optional[List[TierInput]] = None

