import strawberry
from typing import List, Optional
from datetime import datetime
from bson import ObjectId

from ..config.database import db
from ..schemas.inventory_schemas import Inventory, InventoryInput, InventoryUpdateInput
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

async def create_inventory(inventory_input: InventoryInput, agency_id: str) -> Inventory:
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

async def update_inventory(id: str, inventory_input: InventoryUpdateInput) -> Optional[Inventory]:
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

async def delete_inventory(id: str) -> bool:
    collection = db.get_collection("inventories")
    try:
        result = await collection.delete_one({"_id": ObjectId(id)})
        return result.deleted_count > 0
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
        return await create_inventory(inventory_input, agency_id)

    @strawberry.mutation
    @login_required
    async def update_inventory(
        self, info: Info, id: str, inventory_input: InventoryUpdateInput
    ) -> Optional[Inventory]:
        return await update_inventory(id, inventory_input)
    
    @strawberry.mutation
    @login_required
    async def delete_inventory(self, info: Info, id: str) -> bool:
        return await delete_inventory(id)
