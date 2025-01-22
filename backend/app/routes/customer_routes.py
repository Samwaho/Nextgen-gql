import strawberry
from typing import List, Optional
from datetime import datetime
from bson import ObjectId
from ..config.database import db
from ..schemas.customer_schemas import Customer, CustomerInput, CustomerUpdateInput
from ..utils.decorators import login_required, role_required
from strawberry.types import Info

async def get_customers(agency_id: Optional[str] = None) -> List[Customer]:
    collection = db.get_collection("customers")
    query = {"agency": agency_id} if agency_id else {}
    customers_data = await collection.find(query).sort("created_at", -1).to_list(None)
    return [
        Customer(
            id=str(customer["_id"]),
            name=customer["name"],
            email=customer["email"],
            phone=customer["phone"],
            username=customer["username"],
            address=customer.get("address"),
            agency=customer["agency"],
            package=customer.get("package"),
            status=customer.get("status", "inactive"),
            expiry=customer["expiry"],
            radiusUsername=customer.get("radius_username"),
            created_at=customer.get("created_at", datetime.utcnow()),
            updated_at=customer.get("updated_at")
        ) for customer in customers_data
    ]

async def get_customer(id: str) -> Optional[Customer]:
    collection = db.get_collection("customers")
    try:
        customer = await collection.find_one({"_id": ObjectId(id)})
        if customer:
            return Customer(
                id=str(customer["_id"]),
                name=customer["name"],
                email=customer["email"],
                phone=customer["phone"],
                username=customer["username"],
                address=customer.get("address"),
                agency=customer["agency"],
                package=customer.get("package"),
                status=customer.get("status", "inactive"),
                expiry=customer["expiry"],
                radiusUsername=customer.get("radius_username"),
                created_at=customer.get("created_at", datetime.utcnow()),
                updated_at=customer.get("updated_at")
            )
    except:
        return None
    return None

async def create_customer(customer_input: CustomerInput, agency_id: str) -> Customer:
    collection = db.get_collection("customers")
    now = datetime.utcnow()
    
    # Verify package exists if specified
    if customer_input.package:
        package = await db.get_collection("packages").find_one({"_id": ObjectId(customer_input.package)})
        if not package:
            raise ValueError("Invalid package ID")
    
    # Generate RADIUS username if not provided
    radius_username = customer_input.radiusUsername
    if not radius_username:
        # Use username as RADIUS username if not specified
        radius_username = customer_input.username
        
        # Ensure RADIUS username is unique
        while await collection.find_one({"radius_username": radius_username}):
            radius_username = f"{customer_input.username}_{now.timestamp()}"
    
    customer_data = {
        "name": customer_input.name,
        "email": customer_input.email,
        "phone": customer_input.phone,
        "username": customer_input.username,
        "password": customer_input.password,
        "address": customer_input.address,
        "agency": agency_id,
        "package": customer_input.package,
        "status": customer_input.status or "inactive",
        "expiry": customer_input.expiry,
        "radius_username": radius_username,
        "created_at": now,
        "updated_at": now
    }
    
    result = await collection.insert_one(customer_data)
    customer_data["_id"] = result.inserted_id
    
    return Customer(
        id=str(customer_data["_id"]),
        name=customer_data["name"],
        email=customer_data["email"],
        phone=customer_data["phone"],
        username=customer_data["username"],
        address=customer_data.get("address"),
        agency=customer_data["agency"],
        package=customer_data.get("package"),
        status=customer_data["status"],
        expiry=customer_data["expiry"],
        radiusUsername=customer_data["radius_username"],
        created_at=customer_data["created_at"],
        updated_at=customer_data["updated_at"]
    )

async def update_customer(id: str, customer_input: CustomerUpdateInput) -> Optional[Customer]:
    collection = db.get_collection("customers")
    update_data = {
        "updated_at": datetime.utcnow()
    }
    
    # Verify package exists if being updated
    if customer_input.package:
        package = await db.get_collection("packages").find_one({"_id": ObjectId(customer_input.package)})
        if not package:
            raise ValueError("Invalid package ID")
    
    # Handle RADIUS username update
    if customer_input.radiusUsername:
        # Check if new RADIUS username is unique
        existing = await collection.find_one({
            "radius_username": customer_input.radiusUsername,
            "_id": {"$ne": ObjectId(id)}
        })
        if existing:
            raise ValueError("RADIUS username already exists")
    
    for field in [
        "name", "email", "phone", "username", "address",
        "package", "status", "expiry"
    ]:
        value = getattr(customer_input, field)
        if value is not None:
            update_data[field] = value
    
    # Handle RADIUS username separately
    if customer_input.radiusUsername is not None:
        update_data["radius_username"] = customer_input.radiusUsername
    
    try:
        result = await collection.find_one_and_update(
            {"_id": ObjectId(id)},
            {"$set": update_data},
            return_document=True
        )
        if result:
            return Customer(
                id=str(result["_id"]),
                name=result["name"],
                email=result["email"],
                phone=result["phone"],
                username=result["username"],
                address=result.get("address"),
                agency=result["agency"],
                package=result.get("package"),
                status=result.get("status", "inactive"),
                expiry=result["expiry"],
                radiusUsername=result.get("radius_username"),
                created_at=result.get("created_at", datetime.utcnow()),
                updated_at=result.get("updated_at")
            )
    except:
        return None
    return None

async def delete_customer(id: str) -> bool:
    collection = db.get_collection("customers")
    try:
        result = await collection.delete_one({"_id": ObjectId(id)})
        return result.deleted_count > 0
    except:
        return False

@strawberry.type
class Query:
    @strawberry.field
    @login_required
    async def customers(self, info: Info) -> List[Customer]:
        agency_id = info.context.user.get("agency")
        return await get_customers(agency_id)

    @strawberry.field
    @login_required
    async def customer(self, info: Info, id: str) -> Optional[Customer]:
        return await get_customer(id)

@strawberry.type
class Mutation:
    @strawberry.mutation
    @login_required
    async def create_customer(self, info: Info, customer_input: CustomerInput) -> Customer:
        agency_id = info.context.user.get("agency")
        return await create_customer(customer_input, agency_id)

    @strawberry.mutation
    @login_required
    async def update_customer(
        self, info: Info, id: str, customer_input: CustomerUpdateInput
    ) -> Optional[Customer]:
        return await update_customer(id, customer_input)
    
    @strawberry.mutation
    @login_required
    async def delete_customer(self, info: Info, id: str) -> bool:
        return await delete_customer(id)
