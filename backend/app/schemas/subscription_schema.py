import strawberry
from typing import Optional, List, Annotated
from datetime import datetime
from .service_schemas import Service, Tier

# Forward reference for User type
User = Annotated["User", strawberry.lazy(".user_schema")]

@strawberry.type
class Subscription:
    id: str
    user_id: str
    service_id: str
    tier_name: str
    status: str  # 'active', 'cancelled', 'expired'
    start_date: datetime
    end_date: Optional[datetime] = None
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    # Resolved fields
    @strawberry.field
    async def service(self, info) -> Optional[Service]:
        from ..routes.service_routes import get_service
        return await get_service(self.service_id)

    @strawberry.field
    async def user(self, info) -> Optional[User]:
        from ..routes.user_routes import get_user
        return await get_user(self.user_id)

@strawberry.input
class SubscriptionInput:
    service_id: str
    tier_name: str

@strawberry.input
class SubscriptionUpdateInput:
    status: Optional[str] = None
    end_date: Optional[datetime] = None

@strawberry.type
class Query:
    subscriptions: List[Subscription]
    subscription: Optional[Subscription]
    user_subscriptions: List[Subscription]

@strawberry.type
class Mutation:
    create_subscription: Subscription
    update_subscription: Optional[Subscription]
    cancel_subscription: Optional[Subscription] 