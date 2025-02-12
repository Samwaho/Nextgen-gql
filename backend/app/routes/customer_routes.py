import strawberry
from typing import List, Optional
from datetime import datetime
from bson import ObjectId
from ..config.database import db
from ..schemas.customer_schemas import Customer, CustomerInput, CustomerUpdateInput, CustomerPackage, CustomerStation, AccountingData
from ..schemas.notification_schemas import NotificationInput
from ..routes.notification_routes import create_notification
from ..utils.decorators import login_required, role_required
from strawberry.types import Info

async def get_customers(agency_id: Optional[str] = None) -> List[Customer]:
    collection = db.get_collection("customers")
    query = {"agency": agency_id} if agency_id else {}
    customers_data = await collection.find(query).sort("created_at", -1).to_list(None)
    
    # Get all unique package and station IDs
    package_ids = {ObjectId(customer.get("package")) for customer in customers_data if customer.get("package")}
    station_ids = {ObjectId(customer.get("station")) for customer in customers_data if customer.get("station")}
    
    # Fetch all packages and stations in one query each
    packages = {}
    stations = {}
    
    if package_ids:
        packages_data = await db.get_collection("packages").find({"_id": {"$in": list(package_ids)}}).to_list(None)
        packages = {str(package["_id"]): package for package in packages_data}
    
    if station_ids:
        stations_data = await db.get_collection("stations").find({"_id": {"$in": list(station_ids)}}).to_list(None)
        stations = {str(station["_id"]): station for station in stations_data}
    
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
            station=CustomerStation(
                id=str(stations[customer["station"]]["_id"]),
                name=stations[customer["station"]]["name"],
                location=stations[customer["station"]]["location"],
                address=stations[customer["station"]]["address"]
            ) if customer.get("station") and customer["station"] in stations else None,
            status=customer.get("status", "inactive"),
            expiry=customer["expiry"],
            password=customer.get("password", ""),
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
            
            # Fetch station details if customer has a station
            station = None
            if customer.get("station"):
                station_data = await db.get_collection("stations").find_one({"_id": ObjectId(customer["station"])})
                if station_data:
                    station = CustomerStation(
                        id=str(station_data["_id"]),
                        name=station_data["name"],
                        location=station_data["location"],
                        address=station_data["address"]
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
                station=station,
                status=customer.get("status", "inactive"),
                expiry=customer["expiry"],
                password=customer.get("password", ""),
                createdAt=customer.get("created_at", datetime.utcnow()),
                updatedAt=customer.get("updated_at")
            )
    except:
        return None
    return None

async def create_customer(customer_input: CustomerInput, agency_id: str, user_id: str) -> Customer:
    collection = db.get_collection("customers")
    now = datetime.utcnow()
    
    # Verify package exists if specified
    package_data = None
    if customer_input.package:
        package_data = await db.get_collection("packages").find_one({"_id": ObjectId(customer_input.package)})
        if not package_data:
            raise ValueError("Invalid package ID")
    
    # Verify station exists if specified
    station_data = None
    if customer_input.station:
        station_data = await db.get_collection("stations").find_one({"_id": ObjectId(customer_input.station)})
        if not station_data:
            raise ValueError("Invalid station ID")
    
    customer_data = {
        "name": customer_input.name,
        "email": customer_input.email,
        "phone": customer_input.phone,
        "username": customer_input.username,
        "password": customer_input.password,
        "address": customer_input.address,
        "agency": agency_id,
        "package": customer_input.package,
        "station": customer_input.station,
        "status": customer_input.status or "inactive",
        "expiry": customer_input.expiry,
        "created_at": now,
        "updated_at": now
    }

    result = await collection.insert_one(customer_data)
    customer_data["_id"] = result.inserted_id
    
    # Create package object if exists
    package = None
    if package_data:
        package = CustomerPackage(
            id=str(package_data["_id"]),
            name=package_data["name"],
            serviceType=package_data["service_type"]
        )
    
    # Create station object if exists
    station = None
    if station_data:
        station = CustomerStation(
            id=str(station_data["_id"]),
            name=station_data["name"],
            location=station_data["location"],
            address=station_data["address"]
        )
    
    # Create notification for new customer
    await create_notification(
        NotificationInput(
            type="customer_created",
            title="New Customer Created",
            message=f"Customer with username '{customer_input.username}' has been created",
            entity_id=str(result.inserted_id),
            entity_type="customer",
            user_id=user_id,
            is_read=False
        ),
        agency_id,
        user_id
    )
    
    return Customer(
        id=str(customer_data["_id"]),
        name=customer_data["name"],
        email=customer_data["email"],
        phone=customer_data["phone"],
        username=customer_data["username"],
        address=customer_data.get("address"),
        agency=customer_data["agency"],
        package=package,
        station=station,
        status=customer_data["status"],
        expiry=customer_data["expiry"],
        password=customer_data["password"],
        createdAt=customer_data["created_at"],
        updatedAt=customer_data["updated_at"]
    )

async def update_customer(id: str, customer_input: CustomerUpdateInput, agency_id: str, user_id: str) -> Optional[Customer]:
    collection = db.get_collection("customers")
    update_data = {
        "updated_at": datetime.utcnow()
    }
    
    # Verify package exists if being updated
    package_data = None
    if customer_input.package:
        package_data = await db.get_collection("packages").find_one({"_id": ObjectId(customer_input.package)})
        if not package_data:
            raise ValueError("Invalid package ID")
    
    # Verify station exists if being updated
    station_data = None
    if customer_input.station:
        station_data = await db.get_collection("stations").find_one({"_id": ObjectId(customer_input.station)})
        if not station_data:
            raise ValueError("Invalid station ID")
    
    for field in [
        "name", "email", "phone", "username", "address",
        "package", "station", "status", "expiry", "password"
    ]:
        value = getattr(customer_input, field)
        if value is not None:
            update_data[field] = value
    
    try:
        result = await collection.find_one_and_update(
            {"_id": ObjectId(id)},
            {"$set": update_data},
            return_document=True
        )
        if result:
            # Create notification for customer update
            changes = [field for field in update_data.keys() if field != "updated_at"]
            if changes:
                await create_notification(
                    NotificationInput(
                        type="customer_updated",
                        title="Customer Updated",
                        message=f"Customer with username '{result['username']}' has been updated. Changed fields: {', '.join(changes)}",
                        entity_id=str(result["_id"]),
                        entity_type="customer",
                        user_id=user_id,
                        is_read=False
                    ),
                    result["agency"],
                    user_id
                )
            
            # Create package object if exists
            package = None
            if result.get("package"):
                package_data = await db.get_collection("packages").find_one({"_id": ObjectId(result["package"])})
                if package_data:
                    package = CustomerPackage(
                        id=str(package_data["_id"]),
                        name=package_data["name"],
                        serviceType=package_data["service_type"]
                    )
            
            # Create station object if exists
            station = None
            if result.get("station"):
                station_data = await db.get_collection("stations").find_one({"_id": ObjectId(result["station"])})
                if station_data:
                    station = CustomerStation(
                        id=str(station_data["_id"]),
                        name=station_data["name"],
                        location=station_data["location"],
                        address=station_data["address"]
                    )
            
            return Customer(
                id=str(result["_id"]),
                name=result["name"],
                email=result["email"],
                phone=result["phone"],
                username=result["username"],
                address=result.get("address"),
                agency=result["agency"],
                package=package,
                station=station,
                status=result.get("status", "inactive"),
                expiry=result["expiry"],
                password=result.get("password", ""),
                createdAt=result.get("created_at", datetime.utcnow()),
                updatedAt=result.get("updated_at")
            )
    except:
        return None
    return None

async def delete_customer(id: str, agency_id: str, user_id: str) -> bool:
    collection = db.get_collection("customers")
    try:
        # Get customer details before deletion for notification
        customer = await collection.find_one({"_id": ObjectId(id)})
        if customer:
            result = await collection.delete_one({"_id": ObjectId(id)})
            if result.deleted_count > 0:
                # Create notification for customer deletion
                await create_notification(
                    NotificationInput(
                        type="customer_deleted",
                        title="Customer Deleted",
                        message=f"Customer with username '{customer['username']}' has been deleted",
                        entity_id=str(customer["_id"]),
                        entity_type="customer",
                        user_id=user_id,
                        is_read=False
                    ),
                    customer["agency"],
                    user_id
                )
                return True
        return False
    except:
        return False

async def get_customer_accounting(username: str) -> Optional[AccountingData]:
    collection = db.get_collection("accounting")
    try:
        accounting = await collection.find_one({"username": username})
        if accounting:
            return AccountingData(
                username=accounting["username"],
                sessionId=accounting["session_id"],
                status=accounting["status"],
                sessionTime=accounting["session_time"],
                inputOctets=accounting["input_octets"],
                outputOctets=accounting["output_octets"],
                inputPackets=accounting["input_packets"],
                outputPackets=accounting["output_packets"],
                inputGigawords=accounting["input_gigawords"],
                outputGigawords=accounting["output_gigawords"],
                calledStationId=accounting["called_station_id"],
                callingStationId=accounting["calling_station_id"],
                terminateCause=accounting["terminate_cause"],
                nasIpAddress=accounting["nas_ip_address"],
                nasIdentifier=accounting["nas_identifier"],
                nasPort=accounting["nas_port"],
                nasPortType=accounting["nas_port_type"],
                serviceType=accounting["service_type"],
                framedProtocol=accounting["framed_protocol"],
                framedIpAddress=accounting["framed_ip_address"],
                idleTimeout=accounting["idle_timeout"],
                sessionTimeout=accounting["session_timeout"],
                mikrotikRateLimit=accounting["mikrotik_rate_limit"],
                timestamp=accounting["timestamp"],
                totalInputBytes=accounting["total_input_bytes"],
                totalOutputBytes=accounting["total_output_bytes"],
                totalBytes=accounting["total_bytes"],
                inputMbytes=accounting["input_mbytes"],
                outputMbytes=accounting["output_mbytes"],
                totalMbytes=accounting["total_mbytes"],
                sessionTimeHours=accounting["session_time_hours"]
            )
    except Exception as e:
        print(f"Error fetching accounting data: {e}")
        return None
    return None

async def get_customer_accounting_history(username: str) -> List[AccountingData]:
    collection = db.get_collection("accounting")
    try:
        accounting_records = await collection.find(
            {"username": username}
        ).sort("timestamp", -1).to_list(None)
        
        return [
            AccountingData(
                username=record["username"],
                sessionId=record["session_id"],
                status=record["status"],
                sessionTime=record["session_time"],
                inputOctets=record["input_octets"],
                outputOctets=record["output_octets"],
                inputPackets=record["input_packets"],
                outputPackets=record["output_packets"],
                inputGigawords=record["input_gigawords"],
                outputGigawords=record["output_gigawords"],
                calledStationId=record["called_station_id"],
                callingStationId=record["calling_station_id"],
                terminateCause=record["terminate_cause"],
                nasIpAddress=record["nas_ip_address"],
                nasIdentifier=record["nas_identifier"],
                nasPort=record["nas_port"],
                nasPortType=record["nas_port_type"],
                serviceType=record["service_type"],
                framedProtocol=record["framed_protocol"],
                framedIpAddress=record["framed_ip_address"],
                idleTimeout=record["idle_timeout"],
                sessionTimeout=record["session_timeout"],
                mikrotikRateLimit=record["mikrotik_rate_limit"],
                timestamp=record["timestamp"],
                totalInputBytes=record["total_input_bytes"],
                totalOutputBytes=record["total_output_bytes"],
                totalBytes=record["total_bytes"],
                inputMbytes=record["input_mbytes"],
                outputMbytes=record["output_mbytes"],
                totalMbytes=record["total_mbytes"],
                sessionTimeHours=record["session_time_hours"]
            ) for record in accounting_records
        ]
    except Exception as e:
        print(f"Error fetching accounting history: {e}")
        return []

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

    @strawberry.field
    @login_required
    async def customer_accounting(self, info: Info, username: str) -> Optional[AccountingData]:
        return await get_customer_accounting(username)

    @strawberry.field
    @login_required
    async def customer_accounting_history(self, info: Info, username: str) -> List[AccountingData]:
        return await get_customer_accounting_history(username)

@strawberry.type
class Mutation:
    @strawberry.mutation
    @login_required
    async def create_customer(self, info: Info, customer_input: CustomerInput) -> Customer:
        agency_id = info.context.user.get("agency")
        user_id = str(info.context.user.get("_id"))  # Convert ObjectId to string
        return await create_customer(customer_input, agency_id, user_id)

    @strawberry.mutation
    @login_required
    async def update_customer(
        self, info: Info, id: str, customer_input: CustomerUpdateInput
    ) -> Optional[Customer]:
        agency_id = info.context.user.get("agency")
        user_id = str(info.context.user.get("_id"))  # Convert ObjectId to string
        return await update_customer(id, customer_input, agency_id, user_id)
    
    @strawberry.mutation
    @login_required
    async def delete_customer(self, info: Info, id: str) -> bool:
        agency_id = info.context.user.get("agency")
        user_id = str(info.context.user.get("_id"))  # Convert ObjectId to string
        return await delete_customer(id, agency_id, user_id)
