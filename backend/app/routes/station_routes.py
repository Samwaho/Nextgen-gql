import strawberry
from typing import List, Optional
from datetime import datetime
from bson import ObjectId
from ..config.database import db
from ..schemas.station_schemas import Station, StationInput, StationUpdateInput
from ..utils.decorators import login_required, role_required
from strawberry.types import Info

async def get_stations(agency_id: Optional[str] = None) -> List[Station]:
    collection = db.get_collection("stations")
    customers_collection = db.get_collection("customers")
    query = {"agency": agency_id} if agency_id else {}
    stations_data = await collection.find(query).sort("created_at", -1).to_list(None)
    
    # Get customer counts for each station
    stations_with_counts = []
    for station in stations_data:
        customer_count = await customers_collection.count_documents({"station": str(station["_id"])})
        stations_with_counts.append({
            **station,
            "total_customers": customer_count
        })
    
    return [
        Station(
            id=str(station["_id"]),
            name=station["name"],
            location=station["location"],
            address=station["address"],
            coordinates=station.get("coordinates"),
            buildingType=station["building_type"],
            totalCustomers=station["total_customers"],
            contactPerson=station.get("contact_person"),
            contactPhone=station.get("contact_phone"),
            notes=station.get("notes"),
            agency=station["agency"],
            status=station.get("status", "active"),
            createdAt=station.get("created_at", datetime.utcnow()),
            updatedAt=station.get("updated_at")
        ) for station in stations_with_counts
    ]

async def get_station(id: str) -> Optional[Station]:
    collection = db.get_collection("stations")
    customers_collection = db.get_collection("customers")
    try:
        station = await collection.find_one({"_id": ObjectId(id)})
        if station:
            customer_count = await customers_collection.count_documents({"station": str(station["_id"])})
            return Station(
                id=str(station["_id"]),
                name=station["name"],
                location=station["location"],
                address=station["address"],
                coordinates=station.get("coordinates"),
                buildingType=station["building_type"],
                totalCustomers=customer_count,
                contactPerson=station.get("contact_person"),
                contactPhone=station.get("contact_phone"),
                notes=station.get("notes"),
                agency=station["agency"],
                status=station.get("status", "active"),
                createdAt=station.get("created_at", datetime.utcnow()),
                updatedAt=station.get("updated_at")
            )
    except:
        return None
    return None

async def create_station(station_input: StationInput, agency_id: str) -> Station:
    collection = db.get_collection("stations")
    now = datetime.utcnow()
    
    station_data = {
        "name": station_input.name,
        "location": station_input.location,
        "address": station_input.address,
        "coordinates": station_input.coordinates,
        "building_type": station_input.buildingType,
        "contact_person": station_input.contactPerson,
        "contact_phone": station_input.contactPhone,
        "notes": station_input.notes,
        "agency": agency_id,
        "status": station_input.status or "active",
        "created_at": now,
        "updated_at": now
    }

    result = await collection.insert_one(station_data)
    station_data["_id"] = result.inserted_id
    station_data["total_customers"] = 0
    
    return Station(
        id=str(station_data["_id"]),
        name=station_data["name"],
        location=station_data["location"],
        address=station_data["address"],
        coordinates=station_data.get("coordinates"),
        buildingType=station_data["building_type"],
        totalCustomers=0,
        contactPerson=station_data.get("contact_person"),
        contactPhone=station_data.get("contact_phone"),
        notes=station_data.get("notes"),
        agency=station_data["agency"],
        status=station_data["status"],
        createdAt=station_data["created_at"],
        updatedAt=station_data["updated_at"]
    )

async def update_station(id: str, station_input: StationUpdateInput) -> Optional[Station]:
    collection = db.get_collection("stations")
    customers_collection = db.get_collection("customers")
    update_data = {
        "updated_at": datetime.utcnow()
    }
    
    for field, db_field in [
        ("name", "name"),
        ("location", "location"),
        ("address", "address"),
        ("coordinates", "coordinates"),
        ("buildingType", "building_type"),
        ("contactPerson", "contact_person"),
        ("contactPhone", "contact_phone"),
        ("notes", "notes"),
        ("status", "status")
    ]:
        value = getattr(station_input, field)
        if value is not None:
            update_data[db_field] = value
    
    try:
        result = await collection.find_one_and_update(
            {"_id": ObjectId(id)},
            {"$set": update_data},
            return_document=True
        )
        if result:
            customer_count = await customers_collection.count_documents({"station": str(result["_id"])})
            return Station(
                id=str(result["_id"]),
                name=result["name"],
                location=result["location"],
                address=result["address"],
                coordinates=result.get("coordinates"),
                buildingType=result["building_type"],
                totalCustomers=customer_count,
                contactPerson=result.get("contact_person"),
                contactPhone=result.get("contact_phone"),
                notes=result.get("notes"),
                agency=result["agency"],
                status=result.get("status", "active"),
                createdAt=result.get("created_at", datetime.utcnow()),
                updatedAt=result.get("updated_at")
            )
    except:
        return None
    return None

async def delete_station(id: str) -> bool:
    collection = db.get_collection("stations")
    customers_collection = db.get_collection("customers")
    
    # Check if there are any customers associated with this station
    customer_count = await customers_collection.count_documents({"station": id})
    if customer_count > 0:
        raise ValueError("Cannot delete station with associated customers")
    
    try:
        result = await collection.delete_one({"_id": ObjectId(id)})
        return result.deleted_count > 0
    except:
        return False

@strawberry.type
class Query:
    @strawberry.field
    @login_required
    async def stations(self, info: Info) -> List[Station]:
        agency_id = info.context.user.get("agency")
        return await get_stations(agency_id)

    @strawberry.field
    @login_required
    async def station(self, info: Info, id: str) -> Optional[Station]:
        return await get_station(id)

@strawberry.type
class Mutation:
    @strawberry.mutation
    @login_required
    async def create_station(self, info: Info, station_input: StationInput) -> Station:
        agency_id = info.context.user.get("agency")
        return await create_station(station_input, agency_id)

    @strawberry.mutation
    @login_required
    async def update_station(
        self, info: Info, id: str, station_input: StationUpdateInput
    ) -> Optional[Station]:
        return await update_station(id, station_input)
    
    @strawberry.mutation
    @login_required
    async def delete_station(self, info: Info, id: str) -> bool:
        return await delete_station(id)

# Create the schema
schema = strawberry.Schema(query=Query, mutation=Mutation)
