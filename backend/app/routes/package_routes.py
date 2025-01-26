import strawberry
from typing import List, Optional
from datetime import datetime
from bson import ObjectId
from ..config.database import db
from ..schemas.package_schemas import Package, PackageInput, PackageUpdateInput
from ..schemas.notification_schemas import NotificationInput
from ..routes.notification_routes import create_notification
from ..utils.decorators import login_required, role_required
from strawberry.types import Info

async def get_packages(agency_id: Optional[str] = None) -> List[Package]:
    collection = db.get_collection("packages")
    query = {"agency": agency_id} if agency_id else {}
    packages_data = await collection.find(query).sort("created_at", -1).to_list(None)
    return [
        Package(
            id=str(package["_id"]),
            name=package["name"],
            price=package["price"],
            # Network settings
            downloadSpeed=package["download_speed"],
            uploadSpeed=package["upload_speed"],
            # Burst configuration
            burstDownload=package.get("burst_download"),
            burstUpload=package.get("burst_upload"),
            thresholdDownload=package.get("threshold_download"),
            thresholdUpload=package.get("threshold_upload"),
            burstTime=package.get("burst_time"),
            # MikroTik service configuration
            serviceType=package.get("service_type"),
            addressPool=package.get("address_pool"),
            # Session management
            sessionTimeout=package.get("session_timeout"),
            idleTimeout=package.get("idle_timeout"),
            # QoS and VLAN
            priority=package.get("priority"),
            vlanId=package.get("vlan_id"),
            # Administrative
            agency=package["agency"],
            createdAt=package.get("created_at", datetime.utcnow()),
            updatedAt=package.get("updated_at")
        ) for package in packages_data
    ]

async def get_package(id: str) -> Optional[Package]:
    collection = db.get_collection("packages")
    try:
        package = await collection.find_one({"_id": ObjectId(id)})
        if package:
            return Package(
                id=str(package["_id"]),
                name=package["name"],
                price=package["price"],
                # Network settings
                downloadSpeed=package["download_speed"],
                uploadSpeed=package["upload_speed"],
                # Burst configuration
                burstDownload=package.get("burst_download"),
                burstUpload=package.get("burst_upload"),
                thresholdDownload=package.get("threshold_download"),
                thresholdUpload=package.get("threshold_upload"),
                burstTime=package.get("burst_time"),
                # MikroTik service configuration
                serviceType=package.get("service_type"),
                addressPool=package.get("address_pool"),
                # Session management
                sessionTimeout=package.get("session_timeout"),
                idleTimeout=package.get("idle_timeout"),
                # QoS and VLAN
                priority=package.get("priority"),
                vlanId=package.get("vlan_id"),
                # Administrative
                agency=package["agency"],
                createdAt=package.get("created_at", datetime.utcnow()),
                updatedAt=package.get("updated_at")
            )
    except:
        return None
    return None

async def create_package(package_input: PackageInput, agency_id: str, user_id: str) -> Package:
    collection = db.get_collection("packages")
    now = datetime.utcnow()
    
    package_data = {
        "name": package_input.name,
        "price": package_input.price,
        # Network settings
        "download_speed": package_input.downloadSpeed,
        "upload_speed": package_input.uploadSpeed,
        # Burst configuration
        "burst_download": package_input.burstDownload,
        "burst_upload": package_input.burstUpload,
        "threshold_download": package_input.thresholdDownload,
        "threshold_upload": package_input.thresholdUpload,
        "burst_time": package_input.burstTime,
        # MikroTik service configuration
        "service_type": package_input.serviceType,
        "address_pool": package_input.addressPool,
        # Session management
        "session_timeout": package_input.sessionTimeout,
        "idle_timeout": package_input.idleTimeout,
        # QoS and VLAN
        "priority": package_input.priority,
        "vlan_id": package_input.vlanId,
        # Administrative
        "agency": agency_id,
        "created_at": now,
        "updated_at": now
    }
    
    result = await collection.insert_one(package_data)
    package_data["_id"] = result.inserted_id
    
    # Create notification for new package
    await create_notification(
        NotificationInput(
            type="package_created",
            title="New Package Created",
            message=f"Package '{package_input.name}' has been created with {package_input.downloadSpeed}/{package_input.uploadSpeed} Mbps speeds",
            entity_id=str(result.inserted_id),
            entity_type="package",
            user_id=user_id,
            is_read=False
        ),
        agency_id,
        user_id
    )
    
    return Package(
        id=str(package_data["_id"]),
        name=package_data["name"],
        price=package_data["price"],
        # Network settings
        downloadSpeed=package_data["download_speed"],
        uploadSpeed=package_data["upload_speed"],
        # Burst configuration
        burstDownload=package_data.get("burst_download"),
        burstUpload=package_data.get("burst_upload"),
        thresholdDownload=package_data.get("threshold_download"),
        thresholdUpload=package_data.get("threshold_upload"),
        burstTime=package_data.get("burst_time"),
        # MikroTik service configuration
        serviceType=package_data.get("service_type"),
        addressPool=package_data.get("address_pool"),
        # Session management
        sessionTimeout=package_data.get("session_timeout"),
        idleTimeout=package_data.get("idle_timeout"),
        # QoS and VLAN
        priority=package_data.get("priority"),
        vlanId=package_data.get("vlan_id"),
        # Administrative
        agency=package_data["agency"],
        createdAt=package_data["created_at"],
        updatedAt=package_data["updated_at"]
    )

async def update_package(id: str, package_input: PackageUpdateInput, agency_id: str, user_id: str) -> Optional[Package]:
    collection = db.get_collection("packages")
    update_data = {
        "updated_at": datetime.utcnow()
    }
    
    field_mappings = {
        "downloadSpeed": "download_speed",
        "uploadSpeed": "upload_speed",
        "burstDownload": "burst_download",
        "burstUpload": "burst_upload",
        "thresholdDownload": "threshold_download",
        "thresholdUpload": "threshold_upload",
        "burstTime": "burst_time",
        "serviceType": "service_type",
        "addressPool": "address_pool",
        "sessionTimeout": "session_timeout",
        "idleTimeout": "idle_timeout",
        "vlanId": "vlan_id"
    }
    
    for field, value in package_input.__dict__.items():
        if value is not None:
            db_field = field_mappings.get(field, field)
            update_data[db_field] = value
    
    try:
        result = await collection.find_one_and_update(
            {"_id": ObjectId(id)},
            {"$set": update_data},
            return_document=True
        )
        if result:
            # Create notification for package update
            changes = [field_mappings.get(field, field) for field in update_data.keys() if field != "updated_at"]
            if changes:
                # Special handling for speed changes
                speed_change = None
                if "download_speed" in changes or "upload_speed" in changes:
                    speed_change = f" Speed changed to {result['download_speed']}/{result['upload_speed']} Mbps."
                
                await create_notification(
                    NotificationInput(
                        type="package_updated",
                        title="Package Updated",
                        message=f"Package '{result['name']}' has been updated. Changed fields: {', '.join(changes)}.{speed_change if speed_change else ''}",
                        entity_id=str(result["_id"]),
                        entity_type="package",
                        user_id=user_id,
                        is_read=False
                    ),
                    result["agency"],
                    user_id
                )
            
            return Package(
                id=str(result["_id"]),
                name=result["name"],
                price=result["price"],
                # Network settings
                downloadSpeed=result["download_speed"],
                uploadSpeed=result["upload_speed"],
                # Burst configuration
                burstDownload=result.get("burst_download"),
                burstUpload=result.get("burst_upload"),
                thresholdDownload=result.get("threshold_download"),
                thresholdUpload=result.get("threshold_upload"),
                burstTime=result.get("burst_time"),
                # MikroTik service configuration
                serviceType=result.get("service_type"),
                addressPool=result.get("address_pool"),
                # Session management
                sessionTimeout=result.get("session_timeout"),
                idleTimeout=result.get("idle_timeout"),
                # QoS and VLAN
                priority=result.get("priority"),
                vlanId=result.get("vlan_id"),
                # Administrative
                agency=result["agency"],
                createdAt=result.get("created_at", datetime.utcnow()),
                updatedAt=result.get("updated_at")
            )
    except:
        return None
    return None

async def delete_package(id: str, agency_id: str, user_id: str) -> bool:
    collection = db.get_collection("packages")
    try:
        # Get package details before deletion for notification
        package = await collection.find_one({"_id": ObjectId(id)})
        if package:
            result = await collection.delete_one({"_id": ObjectId(id)})
            if result.deleted_count > 0:
                # Create notification for package deletion
                await create_notification(
                    NotificationInput(
                        type="package_deleted",
                        title="Package Deleted",
                        message=f"Package '{package['name']}' has been deleted",
                        entity_id=str(package["_id"]),
                        entity_type="package",
                        user_id=user_id,
                        is_read=False
                    ),
                    package["agency"],
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
    async def packages(self, info: Info) -> List[Package]:
        agency_id = info.context.user.get("agency")
        return await get_packages(agency_id)

    @strawberry.field
    @login_required
    async def package(self, info: Info, id: str) -> Optional[Package]:
        return await get_package(id)

@strawberry.type
class Mutation:
    @strawberry.mutation
    @login_required
    async def create_package(self, info: Info, package_input: PackageInput) -> Package:
        agency_id = info.context.user.get("agency")
        user_id = str(info.context.user.get("_id"))  # Convert ObjectId to string
        return await create_package(package_input, agency_id, user_id)

    @strawberry.mutation
    @login_required
    async def update_package(
        self, info: Info, id: str, package_input: PackageUpdateInput
    ) -> Optional[Package]:
        agency_id = info.context.user.get("agency")
        user_id = str(info.context.user.get("_id"))  # Convert ObjectId to string
        return await update_package(id, package_input, agency_id, user_id)
    
    @strawberry.mutation
    @login_required
    async def delete_package(self, info: Info, id: str) -> bool:
        agency_id = info.context.user.get("agency")
        user_id = str(info.context.user.get("_id"))  # Convert ObjectId to string
        return await delete_package(id, agency_id, user_id)
