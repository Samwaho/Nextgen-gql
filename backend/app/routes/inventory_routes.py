import strawberry
from typing import List, Optional
from datetime import datetime
from bson import ObjectId

from ..config.database import db
from ..schemas.inventory_schemas import Inventory, InventoryInput, InventoryUpdateInput
from ..schemas.notification_schemas import NotificationInput
from ..routes.notification_routes import create_notification
from ..utils.decorators import login_required, role_required
from strawberry.types import Info

async def get_inventories(agency_id: Optional[str] = None) -> List[Inventory]:
    collection = db.get_collection("inventories")
    query = {"agency": agency_id} if agency_id else {}
    inventories_data = await collection.find(query).sort("created_at", -1).to_list(None)
    return [
        Inventory(
            id=str(inventory["_id"]),
            name=inventory["name"],
            description=inventory["description"],
            price=inventory["price"],
            stock=inventory["stock"],
            category=inventory["category"],
            agency=inventory["agency"],
            created_at=inventory.get("created_at", datetime.utcnow()),
            updated_at=inventory.get("updated_at")
        ) for inventory in inventories_data
    ]

async def get_inventory(id: str) -> Optional[Inventory]:
    collection = db.get_collection("inventories")
    try:
        inventory = await collection.find_one({"_id": ObjectId(id)})
        if inventory:
            return Inventory(
                id=str(inventory["_id"]),
                name=inventory["name"],
                description=inventory["description"],
                price=inventory["price"],
                stock=inventory["stock"],
                category=inventory["category"],
                agency=inventory["agency"],
                created_at=inventory.get("created_at", datetime.utcnow()),
                updated_at=inventory.get("updated_at")
            )
    except:
        return None
    return None

async def create_inventory(inventory_input: InventoryInput, agency_id: str, user_id: str) -> Inventory:
    collection = db.get_collection("inventories")
    now = datetime.utcnow()
    
    inventory_data = {
        "name": inventory_input.name,
        "description": inventory_input.description,
        "price": inventory_input.price,
        "stock": inventory_input.stock,
        "category": inventory_input.category,
        "agency": agency_id,
        "created_at": now,
        "updated_at": now
    }
    
    result = await collection.insert_one(inventory_data)
    inventory_data["_id"] = result.inserted_id
    
    # Create notification for new inventory item
    await create_notification(
        NotificationInput(
            type="inventory_created",
            title="New Inventory Item Added",
            message=f"Inventory item '{inventory_input.name}' has been added with initial stock of {inventory_input.stock}",
            entity_id=str(result.inserted_id),
            entity_type="inventory",
            user_id=user_id,
            is_read=False
        ),
        agency_id,
        user_id
    )
    
    return Inventory(
        id=str(inventory_data["_id"]),
        name=inventory_data["name"],
        description=inventory_data["description"],
        price=inventory_data["price"],
        stock=inventory_data["stock"],
        category=inventory_data["category"],
        agency=inventory_data["agency"],
        created_at=inventory_data["created_at"],
        updated_at=inventory_data["updated_at"]
    )

async def update_inventory(id: str, inventory_input: InventoryUpdateInput, agency_id: str, user_id: str) -> Optional[Inventory]:
    collection = db.get_collection("inventories")
    update_data = {
        "updated_at": datetime.utcnow()
    }
    
    for field in ["name", "description", "price", "stock", "category"]:
        value = getattr(inventory_input, field)
        if value is not None:
            update_data[field] = value
    
    try:
        result = await collection.find_one_and_update(
            {"_id": ObjectId(id)},
            {"$set": update_data},
            return_document=True
        )
        if result:
            # Create notification for inventory update
            changes = [field for field in update_data.keys() if field != "updated_at"]
            if changes:
                # Special handling for stock updates
                stock_change = None
                if "stock" in changes:
                    old_stock = result.get("stock", 0)
                    new_stock = update_data["stock"]
                    stock_change = f" Stock changed from {old_stock} to {new_stock}."
                
                await create_notification(
                    NotificationInput(
                        type="inventory_updated",
                        title="Inventory Item Updated",
                        message=f"Inventory item '{result['name']}' has been updated. Changed fields: {', '.join(changes)}.{stock_change if stock_change else ''}",
                        entity_id=str(result["_id"]),
                        entity_type="inventory",
                        user_id=user_id,
                        is_read=False
                    ),
                    result["agency"],
                    user_id
                )
            
            return Inventory(
                id=str(result["_id"]),
                name=result["name"],
                description=result["description"],
                price=result["price"],
                stock=result["stock"],
                category=result["category"],
                agency=result["agency"],
                created_at=result.get("created_at", datetime.utcnow()),
                updated_at=result.get("updated_at")
            )
    except:
        return None
    return None

async def delete_inventory(id: str, agency_id: str, user_id: str) -> bool:
    collection = db.get_collection("inventories")
    try:
        # Get inventory details before deletion for notification
        inventory = await collection.find_one({"_id": ObjectId(id)})
        if inventory:
            result = await collection.delete_one({"_id": ObjectId(id)})
            if result.deleted_count > 0:
                # Create notification for inventory deletion
                await create_notification(
                    NotificationInput(
                        type="inventory_deleted",
                        title="Inventory Item Deleted",
                        message=f"Inventory item '{inventory['name']}' has been deleted",
                        entity_id=str(inventory["_id"]),
                        entity_type="inventory",
                        user_id=user_id,
                        is_read=False
                    ),
                    inventory["agency"],
                    user_id
                )
                return True
        return False
    except:
        return False

@strawberry.type
class Query:
    @strawberry.field
    @login_required
    async def inventories(self, info: Info) -> List[Inventory]:
        agency_id = info.context.user.get("agency")
        return await get_inventories(agency_id)

    @strawberry.field
    @login_required
    async def inventory(self, info: Info, id: str) -> Optional[Inventory]:
        return await get_inventory(id)

@strawberry.type
class Mutation:
    @strawberry.mutation
    @login_required
    async def create_inventory(self, info: Info, inventory_input: InventoryInput) -> Inventory:
        agency_id = info.context.user.get("agency")
        user_id = str(info.context.user.get("_id"))  # Convert ObjectId to string
        return await create_inventory(inventory_input, agency_id, user_id)

    @strawberry.mutation
    @login_required
    async def update_inventory(
        self, info: Info, id: str, inventory_input: InventoryUpdateInput
    ) -> Optional[Inventory]:
        agency_id = info.context.user.get("agency")
        user_id = str(info.context.user.get("_id"))  # Convert ObjectId to string
        return await update_inventory(id, inventory_input, agency_id, user_id)
    
    @strawberry.mutation
    @login_required
    async def delete_inventory(self, info: Info, id: str) -> bool:
        agency_id = info.context.user.get("agency")
        user_id = str(info.context.user.get("_id"))  # Convert ObjectId to string
        return await delete_inventory(id, agency_id, user_id)
