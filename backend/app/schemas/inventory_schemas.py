from typing import Optional
from datetime import datetime
import strawberry

@strawberry.type
class Inventory:
    id: str
    name: str
    description: str
    price: float
    stock: int
    category: str
    agency: str
    created_at: datetime
    updated_at: Optional[datetime]

@strawberry.input
class InventoryInput:
    name: str
    description: str
    price: float
    stock: int
    category: str

@strawberry.input
class InventoryUpdateInput:
    name: Optional[str] = None
    description: Optional[str] = None
    price: Optional[float] = None
    stock: Optional[int] = None
    category: Optional[str] = None
