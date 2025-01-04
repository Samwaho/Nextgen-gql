from typing import Optional, Literal
from datetime import datetime
import strawberry

@strawberry.type
class Ticket:
    id: str
    customer: str
    assignedEmployee: Optional[str]
    status: str
    title: str
    description: str
    priority: str
    agency: str
    createdAt: datetime
    updatedAt: Optional[datetime]

@strawberry.input
class TicketInput:
    customer: str
    assignedEmployee: Optional[str] = None
    status: str = "open"
    title: str
    description: str
    priority: str = "medium"

@strawberry.input
class TicketUpdateInput:
    customer: Optional[str] = None
    assignedEmployee: Optional[str] = None
    status: Optional[str] = None
    title: Optional[str] = None
    description: Optional[str] = None
    priority: Optional[str] = None
