import strawberry
from typing import List, Optional
from datetime import datetime
from bson import ObjectId
from passlib.hash import bcrypt
from ..config.database import db
from ..schemas.customer_schemas import Customer, CustomerInput, CustomerUpdateInput, CustomerPackage
from ..utils.decorators import login_required, role_required
from strawberry.types import Info

async def get_customers(agency_id: Optional[str] = None) -> List[Customer]:
    collection = db.get_collection("customers")
    query = {"agency": agency_id} if agency_id else {}
    customers_data = await collection.find(query).sort("created_at", -1).to_list(None)
    
    # Get all unique package IDs
    package_ids = {customer.get("package") for customer in customers_data if customer.get("package")}
    
    # Fetch all packages in one query
    packages = {}
    if package_ids:
        packages_data = await db.get_collection("packages").find({"_id": {"$in": [ObjectId(pid) for pid in package_ids]}}).to_list(None)
        packages = {str(package["_id"]): package for package in packages_data}
    
    return [
        Customer(
            id=str(customer["_id"]),
            name=customer["name"],
            email=customer["email"],
            phone=customer["phone"],
            username=customer["username"],
            address=customer.get("address"),
            agency=customer["agency"],
            package=CustomerPackage(
                id=str(packages[customer["package"]]["_id"]),
                name=packages[customer["package"]]["name"],
                serviceType=packages[customer["package"]]["service_type"]
            ) if customer.get("package") and customer["package"] in packages else None,
            status=customer.get("status", "inactive"),
            expiry=customer["expiry"],
            displayPassword=customer.get("display_password", ""),
            createdAt=customer.get("created_at", datetime.utcnow()),
            updatedAt=customer.get("updated_at")
        ) for customer in customers_data
    ]

async def get_customer(id: str) -> Optional[Customer]:
    collection = db.get_collection("customers")
    try:
        customer = await collection.find_one({"_id": ObjectId(id)})
        if customer:
            # Fetch package details if customer has a package
            package = None
            if customer.get("package"):
                package_data = await db.get_collection("packages").find_one({"_id": ObjectId(customer["package"])})
                if package_data:
                    package = CustomerPackage(
                        id=str(package_data["_id"]),
                        name=package_data["name"],
                        serviceType=package_data["service_type"]
                    )
            
            return Customer(
                id=str(customer["_id"]),
                name=customer["name"],
                email=customer["email"],
                phone=customer["phone"],
                username=customer["username"],
                address=customer.get("address"),
                agency=customer["agency"],
                package=package,
                status=customer.get("status", "inactive"),
                expiry=customer["expiry"],
                displayPassword=customer.get("display_password", ""),
                createdAt=customer.get("created_at", datetime.utcnow()),
                updatedAt=customer.get("updated_at")
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
    
    customer_data = {
        "name": customer_input.name,
        "email": customer_input.email,
        "phone": customer_input.phone,
        "username": customer_input.username,
        "password": bcrypt.hash(customer_input.password),
        "display_password": customer_input.password,  # Store original password for display
        "address": customer_input.address,
        "agency": agency_id,
        "package": customer_input.package,
        "status": customer_input.status or "inactive",
        "expiry": customer_input.expiry,
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
        displayPassword=customer_data["display_password"],
        createdAt=customer_data["created_at"],
        updatedAt=customer_data["updated_at"]
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
    
    for field in [
        "name", "email", "phone", "username", "address",
        "package", "status", "expiry"
    ]:
        value = getattr(customer_input, field)
        if value is not None:
            update_data[field] = value
    
    # Handle password update separately
    if customer_input.password:
        update_data["password"] = bcrypt.hash(customer_input.password)
        update_data["display_password"] = customer_input.password
    
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
                displayPassword=result.get("display_password", ""),
                createdAt=result.get("created_at", datetime.utcnow()),
                updatedAt=result.get("updated_at")
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
