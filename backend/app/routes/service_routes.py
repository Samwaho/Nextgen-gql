from ..config.database import db
from ..schemas.service_schemas import Service, ServiceInput, ServiceUpdateInput, Tier
from typing import List, Optional
from datetime import datetime
import strawberry
from bson import ObjectId
from ..utils.decorators import login_required, role_required, has_role
from strawberry.types import Info

@strawberry.type
class Query:
    @strawberry.field
    @login_required
    async def services(self, info: Info) -> List[Service]:
        """Get all services"""
        collection = db.get_collection("services")
        services_data = await collection.find({}).to_list(None)
        return [
            Service(
                id=str(service["_id"]),
                name=service["name"],
                tiers=[
                    Tier(
                        name=tier["name"],
                        price=tier["price"],
                        features=tier["features"]
                    ) for tier in service["tiers"]
                ],
                created_at=service.get("created_at", datetime.utcnow()),
                updated_at=service.get("updated_at")
            ) for service in services_data
        ]

    @strawberry.field
    @login_required
    async def service(self, info: Info, id: str) -> Optional[Service]:
        """Get a specific service by ID"""
        collection = db.get_collection("services")
        try:
            service = await collection.find_one({"_id": ObjectId(id)})
            if service:
                return Service(
                    id=str(service["_id"]),
                    name=service["name"],
                    tiers=[
                        Tier(
                            name=tier["name"],
                            price=tier["price"],
                            features=tier["features"]
                        ) for tier in service["tiers"]
                    ],
                    created_at=service.get("created_at", datetime.utcnow()),
                    updated_at=service.get("updated_at")
                )
        except:
            return None
        return None

@strawberry.type
class Mutation:
    @strawberry.mutation
    @login_required  # Temporarily disabled login requirement
    @role_required("admin")
    async def create_service(self, info: Info, service_input: ServiceInput) -> Service:
        """Create a new service (admin only)"""
        collection = db.get_collection("services")
        now = datetime.utcnow()
        
        if not service_input.tiers:
            raise ValueError("At least one tier is required")
            
        service_data = {
            "name": service_input.name,
            "tiers": [
                {
                    "name": tier.name,
                    "price": tier.price,
                    "features": tier.features
                } for tier in service_input.tiers
            ],
            "created_at": now,
            "updated_at": now
        }
        
        result = await collection.insert_one(service_data)
        return Service(
            id=str(result.inserted_id),
            name=service_input.name,
            tiers=[
                Tier(
                    name=tier.name,
                    price=tier.price,
                    features=tier.features
                ) for tier in service_input.tiers
            ],
            created_at=now,
            updated_at=now
        )

    @strawberry.mutation
    @login_required
    @role_required("admin")
    async def update_service(self, info: Info, id: str, service_input: ServiceUpdateInput) -> Optional[Service]:
        """Update an existing service (admin only)"""
        collection = db.get_collection("services")
        update_data = {
            "updated_at": datetime.utcnow()
        }
        
        if service_input.name is not None:
            update_data["name"] = service_input.name
        if service_input.tiers is not None:
            update_data["tiers"] = [
                {
                    "name": tier.name,
                    "price": tier.price,
                    "features": tier.features
                } for tier in service_input.tiers
            ]
        
        try:
            if update_data:
                result = await collection.find_one_and_update(
                    {"_id": ObjectId(id)},
                    {"$set": update_data},
                    return_document=True
                )
                if result:
                    return Service(
                        id=str(result["_id"]),
                        name=result["name"],
                        tiers=[
                            Tier(
                                name=tier["name"],
                                price=tier["price"],
                                features=tier["features"]
                            ) for tier in result["tiers"]
                        ],
                        created_at=result.get("created_at", datetime.utcnow()),
                        updated_at=result.get("updated_at")
                    )
        except:
            return None
        return None
    
    @strawberry.mutation
    @login_required
    @role_required("admin")
    async def delete_service(self, info: Info, id: str) -> bool:
        """Delete a service (admin only)"""
        collection = db.get_collection("services")
        try:
            result = await collection.delete_one({"_id": ObjectId(id)})
            return result.deleted_count > 0
        except:
            return False