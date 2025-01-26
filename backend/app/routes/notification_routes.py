import strawberry
from typing import List, Optional, Dict, Any
from datetime import datetime, timedelta
from bson import ObjectId
from ..config.database import db
from ..schemas.notification_schemas import Notification, NotificationInput, NotificationUpdateInput
from ..utils.decorators import login_required
from strawberry.types import Info

# Constants for optimization
MAX_NOTIFICATIONS_PER_AGENCY = 1000  # Maximum notifications to keep per agency
NOTIFICATION_RETENTION_DAYS = 30  # How long to keep notifications
NOTIFICATIONS_PER_PAGE = 50  # Number of notifications per page

async def cleanup_old_notifications(agency_id: str) -> None:
    """Clean up old notifications for an agency."""
    collection = db.get_collection("notifications")
    
    # Delete notifications older than retention period
    retention_date = datetime.utcnow() - timedelta(days=NOTIFICATION_RETENTION_DAYS)
    await collection.delete_many({
        "agency": agency_id,
        "created_at": {"$lt": retention_date}
    })
    
    # If still over limit, delete oldest notifications
    total_count = await collection.count_documents({"agency": agency_id})
    if total_count > MAX_NOTIFICATIONS_PER_AGENCY:
        excess_count = total_count - MAX_NOTIFICATIONS_PER_AGENCY
        cursor = collection.find(
            {"agency": agency_id}
        ).sort("created_at", 1).limit(excess_count)
        
        old_notifications = await cursor.to_list(None)
        if old_notifications:
            old_ids = [n["_id"] for n in old_notifications]
            await collection.delete_many({"_id": {"$in": old_ids}})

async def get_user_name(user_id: str) -> Optional[str]:
    """Get user name from users collection."""
    try:
        users = db.get_collection("users")
        user = await users.find_one({"_id": ObjectId(user_id)})
        if user:
            # Return the name if available, otherwise return username
            return user.get("name") or user.get("username")
    except:
        pass
    return None

async def get_notifications(
    agency_id: str,
    user_id: str,
    page: int = 1,
    per_page: int = NOTIFICATIONS_PER_PAGE,
    filter_read: Optional[bool] = None
) -> List[Notification]:
    """Get paginated notifications for an agency with optional read/unread filter."""
    collection = db.get_collection("notifications")
    
    # Build query to get notifications for this agency
    query = {
        "agency": agency_id
    }
    if filter_read is not None:
        query["is_read"] = filter_read
    
    # Calculate skip for pagination
    skip = (page - 1) * per_page
    
    # Get notifications with pagination
    notifications_data = await collection.find(query).sort(
        "created_at", -1
    ).skip(skip).limit(per_page).to_list(None)
    
    # Get user names for all notifications
    user_names = {}
    for notification in notifications_data:
        if notification.get("user_id") and notification["user_id"] not in user_names:
            user_names[notification["user_id"]] = await get_user_name(notification["user_id"])
    
    return [
        Notification(
            id=str(notification["_id"]),
            type=notification["type"],
            title=notification["title"],
            message=notification["message"],
            entity_id=notification.get("entity_id"),
            entity_type=notification.get("entity_type"),
            agency=notification["agency"],
            user_id=notification["user_id"],
            user_name=user_names.get(notification["user_id"]),  # Include user name
            is_read=notification["is_read"],
            createdAt=notification.get("created_at", datetime.utcnow()),
            updatedAt=notification.get("updated_at")
        ) for notification in notifications_data
    ]

async def get_notification(id: str, user_id: Optional[str] = None) -> Optional[Notification]:
    collection = db.get_collection("notifications")
    try:
        query = {"_id": ObjectId(id)}
        notification = await collection.find_one(query)
        if notification:
            # Get user name
            user_name = await get_user_name(notification["user_id"]) if notification.get("user_id") else None
            
            return Notification(
                id=str(notification["_id"]),
                type=notification["type"],
                title=notification["title"],
                message=notification["message"],
                entity_id=notification.get("entity_id"),
                entity_type=notification.get("entity_type"),
                agency=notification["agency"],
                user_id=notification["user_id"],
                user_name=user_name,  # Include user name
                is_read=notification["is_read"],
                createdAt=notification.get("created_at", datetime.utcnow()),
                updatedAt=notification.get("updated_at")
            )
    except:
        return None
    return None

async def create_notification(notification_input: NotificationInput, agency_id: str, user_id: str) -> Notification:
    collection = db.get_collection("notifications")
    now = datetime.utcnow()
    
    notification_data = {
        "type": notification_input.type,
        "title": notification_input.title,
        "message": notification_input.message,
        "entity_id": notification_input.entity_id,
        "entity_type": notification_input.entity_type,
        "agency": agency_id,
        "user_id": user_id,
        "is_read": notification_input.is_read or False,
        "created_at": now,
        "updated_at": now
    }
    
    # Cleanup old notifications before adding new one
    await cleanup_old_notifications(agency_id)
    
    result = await collection.insert_one(notification_data)
    notification_data["_id"] = result.inserted_id
    
    # Get user name
    user_name = await get_user_name(user_id)
    
    return Notification(
        id=str(notification_data["_id"]),
        type=notification_data["type"],
        title=notification_data["title"],
        message=notification_data["message"],
        entity_id=notification_data.get("entity_id"),
        entity_type=notification_data.get("entity_type"),
        agency=notification_data["agency"],
        user_id=notification_data["user_id"],
        user_name=user_name,  # Include user name
        is_read=notification_data["is_read"],
        createdAt=notification_data["created_at"],
        updatedAt=notification_data["updated_at"]
    )

async def update_notification(id: str, notification_input: NotificationUpdateInput) -> Optional[Notification]:
    collection = db.get_collection("notifications")
    update_data = {
        "updated_at": datetime.utcnow()
    }
    
    if notification_input.is_read is not None:
        update_data["is_read"] = notification_input.is_read
    
    try:
        result = await collection.find_one_and_update(
            {"_id": ObjectId(id)},
            {"$set": update_data},
            return_document=True
        )
        if result:
            # Get user name
            user_name = await get_user_name(result["user_id"]) if result.get("user_id") else None
            
            return Notification(
                id=str(result["_id"]),
                type=result["type"],
                title=result["title"],
                message=result["message"],
                entity_id=result.get("entity_id"),
                entity_type=result.get("entity_type"),
                agency=result["agency"],
                user_id=result["user_id"],
                user_name=user_name,  # Include user name
                is_read=result["is_read"],
                createdAt=result.get("created_at", datetime.utcnow()),
                updatedAt=result.get("updated_at")
            )
    except:
        return None
    return None

async def delete_notification(id: str) -> bool:
    collection = db.get_collection("notifications")
    try:
        result = await collection.delete_one({"_id": ObjectId(id)})
        return result.deleted_count > 0
    except:
        return False

async def mark_all_as_read(agency_id: str) -> bool:
    """Mark all notifications as read for an agency."""
    collection = db.get_collection("notifications")
    try:
        result = await collection.update_many(
            {"agency": agency_id, "is_read": False},
            {"$set": {"is_read": True, "updated_at": datetime.utcnow()}}
        )
        return result.modified_count > 0
    except:
        return False

async def get_unread_count(agency_id: str, user_id: str) -> int:
    """Get count of unread notifications for an agency and user."""
    collection = db.get_collection("notifications")
    query = {
        "agency": agency_id,
        "is_read": False,
        "$or": [
            {"user_id": user_id},
            {"user_id": None}
        ]
    }
    return await collection.count_documents(query)

@strawberry.type
class Query:
    @strawberry.field
    @login_required
    async def notifications(
        self, 
        info: Info,
        user_id: str,
        page: int = 1,
        filter_read: Optional[bool] = None
    ) -> List[Notification]:
        agency_id = info.context.user.get("agency")
        return await get_notifications(agency_id, user_id, page, NOTIFICATIONS_PER_PAGE, filter_read)

    @strawberry.field
    @login_required
    async def notification(self, info: Info, id: str, user_id: str) -> Optional[Notification]:
        return await get_notification(id, user_id)
        
    @strawberry.field
    @login_required
    async def unread_notifications_count(self, info: Info, user_id: str) -> int:
        agency_id = info.context.user.get("agency")
        return await get_unread_count(agency_id, user_id)

@strawberry.type
class Mutation:
    @strawberry.mutation
    @login_required
    async def create_test_notification(self, info: Info, user_id: str) -> Notification:
        """Create a test notification for debugging purposes."""
        agency_id = info.context.user.get("agency")
        
        notification_input = NotificationInput(
            type="test_notification",
            title="Test Notification",
            message="This is a test notification for debugging purposes",
            is_read=False
        )
        
        return await create_notification(notification_input, agency_id, user_id)

    @strawberry.mutation
    @login_required
    async def create_notification(self, info: Info, notification_input: NotificationInput) -> Notification:
        agency_id = info.context.user.get("agency")
        user_id = str(info.context.user.get("_id"))  # The user who performed the action
        return await create_notification(notification_input, agency_id, user_id)

    @strawberry.mutation
    @login_required
    async def update_notification(
        self, info: Info, id: str, notification_input: NotificationUpdateInput, user_id: str
    ) -> Optional[Notification]:
        return await update_notification(id, notification_input)

    @strawberry.mutation
    @login_required
    async def delete_notification(self, info: Info, id: str, user_id: str) -> bool:
        return await delete_notification(id)
        
    @strawberry.mutation
    @login_required
    async def mark_all_notifications_as_read(self, info: Info, user_id: str) -> bool:
        agency_id = info.context.user.get("agency")
        return await mark_all_as_read(agency_id)
