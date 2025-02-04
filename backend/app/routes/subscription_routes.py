from ..config.database import db
from ..schemas.subscription_schema import Subscription, SubscriptionInput, SubscriptionUpdateInput
from ..schemas.service_schemas import Service
from ..schemas.user_schema import User
from typing import List, Optional
from datetime import datetime
import strawberry
from bson import ObjectId
from ..utils.decorators import login_required, role_required, has_role
from strawberry.types import Info

async def get_service_by_id(service_id: str) -> Optional[Service]:
    collection = db.get_collection("services")
    try:
        service = await collection.find_one({"_id": ObjectId(service_id)})
        if service:
            return Service(
                id=str(service["_id"]),
                name=service["name"],
                tiers=service["tiers"],
                created_at=service.get("created_at"),
                updated_at=service.get("updated_at")
            )
    except:
        return None
    return None

async def get_user_by_id(user_id: str) -> Optional[User]:
    collection = db.get_collection("users")
    try:
        user = await collection.find_one({"_id": ObjectId(user_id)})
        if user:
            return User(
                id=str(user["_id"]),
                name=user["name"],
                email=user["email"],
                roles=user.get("roles", ["user"]),
                address=user.get("address"),
                phone=user.get("phone"),
                agency=user.get("agency"),
                is_verified=user.get("is_verified", False),
                created_at=user.get("created_at"),
                updated_at=user.get("updated_at"),
                is_active=user.get("is_active", True)
            )
    except:
        return None
    return None

async def get_subscriptions() -> List[Subscription]:
    collection = db.get_collection("subscriptions")
    subscriptions_data = await collection.find({}).to_list(None)
    subscriptions = []
    
    for sub in subscriptions_data:
        subscription = Subscription(
            id=str(sub["_id"]),
            user_id=sub["user_id"],
            service_id=sub["service_id"],
            tier_name=sub["tier_name"],
            status=sub["status"],
            start_date=sub["start_date"],
            end_date=sub.get("end_date"),
            created_at=sub.get("created_at", datetime.utcnow()),
            updated_at=sub.get("updated_at")
        )
        # Resolve related fields
        subscription.service = await get_service_by_id(sub["service_id"])
        subscription.user = await get_user_by_id(sub["user_id"])
        subscriptions.append(subscription)
    
    return subscriptions

async def get_subscription(id: str) -> Optional[Subscription]:
    collection = db.get_collection("subscriptions")
    try:
        sub = await collection.find_one({"_id": ObjectId(id)})
        if sub:
            subscription = Subscription(
                id=str(sub["_id"]),
                user_id=sub["user_id"],
                service_id=sub["service_id"],
                tier_name=sub["tier_name"],
                status=sub["status"],
                start_date=sub["start_date"],
                end_date=sub.get("end_date"),
                created_at=sub.get("created_at", datetime.utcnow()),
                updated_at=sub.get("updated_at")
            )
            # Resolve related fields
            subscription.service = await get_service_by_id(sub["service_id"])
            subscription.user = await get_user_by_id(sub["user_id"])
            return subscription
    except:
        return None
    return None

async def get_user_subscriptions(user_id: str) -> List[Subscription]:
    collection = db.get_collection("subscriptions")
    subscriptions_data = await collection.find({"user_id": user_id}).to_list(None)
    subscriptions = []
    
    for sub in subscriptions_data:
        subscription = Subscription(
            id=str(sub["_id"]),
            user_id=sub["user_id"],
            service_id=sub["service_id"],
            tier_name=sub["tier_name"],
            status=sub["status"],
            start_date=sub["start_date"],
            end_date=sub.get("end_date"),
            created_at=sub.get("created_at", datetime.utcnow()),
            updated_at=sub.get("updated_at")
        )
        # Resolve related fields
        subscription.service = await get_service_by_id(sub["service_id"])
        subscription.user = await get_user_by_id(sub["user_id"])
        subscriptions.append(subscription)
    
    return subscriptions

async def create_subscription(user_id: str, subscription_input: SubscriptionInput) -> Subscription:
    collection = db.get_collection("subscriptions")
    now = datetime.utcnow()
    
    # Verify service and tier exist
    service = await get_service_by_id(subscription_input.service_id)
    if not service:
        raise ValueError("Service not found")
    
    tier_exists = any(tier.name == subscription_input.tier_name for tier in service.tiers)
    if not tier_exists:
        raise ValueError("Tier not found in service")
    
    subscription_data = {
        "user_id": user_id,
        "service_id": subscription_input.service_id,
        "tier_name": subscription_input.tier_name,
        "status": "active",
        "start_date": now,
        "created_at": now,
        "updated_at": now
    }
    
    result = await collection.insert_one(subscription_data)
    subscription_data["id"] = str(result.inserted_id)
    
    subscription = Subscription(**subscription_data)
    subscription.service = service
    subscription.user = await get_user_by_id(user_id)
    
    return subscription

async def update_subscription(id: str, subscription_update: SubscriptionUpdateInput) -> Optional[Subscription]:
    collection = db.get_collection("subscriptions")
    update_data = {
        "updated_at": datetime.utcnow()
    }
    
    if subscription_update.status is not None:
        update_data["status"] = subscription_update.status
    if subscription_update.end_date is not None:
        update_data["end_date"] = subscription_update.end_date
    
    try:
        if update_data:
            result = await collection.find_one_and_update(
                {"_id": ObjectId(id)},
                {"$set": update_data},
                return_document=True
            )
            if result:
                subscription = Subscription(
                    id=str(result["_id"]),
                    user_id=result["user_id"],
                    service_id=result["service_id"],
                    tier_name=result["tier_name"],
                    status=result["status"],
                    start_date=result["start_date"],
                    end_date=result.get("end_date"),
                    created_at=result.get("created_at", datetime.utcnow()),
                    updated_at=result.get("updated_at")
                )
                subscription.service = await get_service_by_id(result["service_id"])
                subscription.user = await get_user_by_id(result["user_id"])
                return subscription
    except:
        return None
    return None

async def cancel_subscription(id: str) -> Optional[Subscription]:
    now = datetime.utcnow()
    return await update_subscription(
        id,
        SubscriptionUpdateInput(status="cancelled", end_date=now)
    )

@strawberry.type
class Query:
    @strawberry.field
    @login_required
    @role_required("admin")
    async def subscriptions(self, info: Info) -> List[Subscription]:
        """Get all subscriptions (admin only)"""
        return await get_subscriptions()

    @strawberry.field
    @login_required
    async def subscription(self, info: Info, id: str) -> Optional[Subscription]:
        """Get a specific subscription"""
        subscription = await get_subscription(id)
        if not subscription:
            return None
        
        # Only admins or the subscription owner can view it
        if not (has_role(info, "admin") or str(info.context.user["_id"]) == subscription.user_id):
            raise Exception("Not authorized")
        
        return subscription

    @strawberry.field
    @login_required
    async def user_subscriptions(self, info: Info) -> List[Subscription]:
        """Get current user's subscriptions"""
        return await get_user_subscriptions(str(info.context.user["_id"]))

@strawberry.type
class Mutation:
    @strawberry.mutation
    @login_required
    async def create_subscription(self, info: Info, subscription_input: SubscriptionInput) -> Subscription:
        """Create a new subscription for the current user"""
        return await create_subscription(str(info.context.user["_id"]), subscription_input)

    @strawberry.mutation
    @login_required
    async def update_subscription(self, info: Info, id: str, subscription_update: SubscriptionUpdateInput) -> Optional[Subscription]:
        """Update a subscription (admin or owner only)"""
        subscription = await get_subscription(id)
        if not subscription:
            raise Exception("Subscription not found")
            
        # Only admins or the subscription owner can update it
        if not (has_role(info, "admin") or str(info.context.user["_id"]) == subscription.user_id):
            raise Exception("Not authorized")
            
        return await update_subscription(id, subscription_update)
    
    @strawberry.mutation
    @login_required
    async def cancel_subscription(self, info: Info, id: str) -> Optional[Subscription]:
        """Cancel a subscription (admin or owner only)"""
        subscription = await get_subscription(id)
        if not subscription:
            raise Exception("Subscription not found")
            
        # Only admins or the subscription owner can cancel it
        if not (has_role(info, "admin") or str(info.context.user["_id"]) == subscription.user_id):
            raise Exception("Not authorized")
            
        return await cancel_subscription(id) 