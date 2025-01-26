from typing import Optional
from datetime import datetime
import strawberry

@strawberry.type
class Notification:
    id: str
    type: str  # e.g., "customer_created", "customer_updated", etc.
    title: str
    message: str
    entity_id: Optional[str]  # ID of related entity (customer, package, etc.)
    entity_type: Optional[str]  # Type of related entity
    agency: str
    user_id: str  # ID of the user who performed the action
    user_name: Optional[str] = None  # Name of the user who performed the action
    is_read: bool
    createdAt: datetime = strawberry.field(name="createdAt")
    updatedAt: Optional[datetime] = strawberry.field(name="updatedAt")

@strawberry.input
class NotificationInput:
    type: str
    title: str
    message: str
    entity_id: Optional[str] = None
    entity_type: Optional[str] = None
    user_id: Optional[str] = None
    is_read: bool = False

@strawberry.input
class NotificationUpdateInput:
    is_read: Optional[bool] = None
