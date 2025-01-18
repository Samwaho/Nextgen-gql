from typing import Optional, List
from datetime import datetime
from bson import ObjectId
import strawberry
from ..schemas.package_schemas import (
    Package, PackageInput, PackageUpdateInput,
    ServiceType, RateLimit
)
from ..radius.client import RadiusGraphQLClient
from ..radius.models import RateLimit as RadiusRateLimit
from ..config.database import db

async def get_packages(agency_id: Optional[str] = None) -> List[Package]:
    collection = db.get_collection("packages")
    query = {"agency": agency_id} if agency_id else {}
    packages_data = await collection.find(query).sort("created_at", -1).to_list(None)
    
    return [
        Package(
            id=str(package["_id"]),
            name=package["name"],
            price=package.get("price", 0.0),
            type=ServiceType(package.get("type", "pppoe")),
            rate_limit=RateLimit(
                rx_rate=package.get("rate_limit", {}).get("rx_rate", "1M"),
                tx_rate=package.get("rate_limit", {}).get("tx_rate", "1M"),
                burst_rx_rate=package.get("rate_limit", {}).get("burst_rx_rate"),
                burst_tx_rate=package.get("rate_limit", {}).get("burst_tx_rate"),
                burst_threshold_rx=package.get("rate_limit", {}).get("burst_threshold_rx"),
                burst_threshold_tx=package.get("rate_limit", {}).get("burst_threshold_tx"),
                burst_time=package.get("rate_limit", {}).get("burst_time")
            ),
            radius_profile=package.get("radius_profile", package.get("name", "")),
            agency=package.get("agency", ""),
            created_at=package.get("created_at", datetime.utcnow()),
            updated_at=package.get("updated_at")
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
                price=package.get("price", 0.0),
                type=ServiceType(package.get("type", "pppoe")),
                rate_limit=RateLimit(
                    rx_rate=package.get("rate_limit", {}).get("rx_rate", "1M"),
                    tx_rate=package.get("rate_limit", {}).get("tx_rate", "1M"),
                    burst_rx_rate=package.get("rate_limit", {}).get("burst_rx_rate"),
                    burst_tx_rate=package.get("rate_limit", {}).get("burst_tx_rate"),
                    burst_threshold_rx=package.get("rate_limit", {}).get("burst_threshold_rx"),
                    burst_threshold_tx=package.get("rate_limit", {}).get("burst_threshold_tx"),
                    burst_time=package.get("rate_limit", {}).get("burst_time")
                ),
                radius_profile=package.get("radius_profile", package.get("name", "")),
                agency=package.get("agency", ""),
                created_at=package.get("created_at", datetime.utcnow()),
                updated_at=package.get("updated_at")
            )
    except:
        return None
    return None

async def create_package(package_input: PackageInput, agency_id: str) -> Package:
    collection = db.get_collection("packages")
    now = datetime.utcnow()
    
    # Create RADIUS profile first
    radius_client = RadiusGraphQLClient()
    try:
        profile_name = package_input.radius_profile or package_input.name
        try:
            # Format rate limit for RADIUS with proper units
            rx_rate = f"{package_input.rate_limit.rx_rate}M"
            tx_rate = f"{package_input.rate_limit.tx_rate}M"
            rate_limit_str = f"{rx_rate}/{tx_rate}"

            if any([package_input.rate_limit.burst_rx_rate, package_input.rate_limit.burst_tx_rate,
                   package_input.rate_limit.burst_threshold_rx, package_input.rate_limit.burst_threshold_tx,
                   package_input.rate_limit.burst_time]):
                burst_rx = f"{package_input.rate_limit.burst_rx_rate}M" if package_input.rate_limit.burst_rx_rate else rx_rate
                burst_tx = f"{package_input.rate_limit.burst_tx_rate}M" if package_input.rate_limit.burst_tx_rate else tx_rate
                threshold_rx = f"{package_input.rate_limit.burst_threshold_rx}M" if package_input.rate_limit.burst_threshold_rx else rx_rate
                threshold_tx = f"{package_input.rate_limit.burst_threshold_tx}M" if package_input.rate_limit.burst_threshold_tx else tx_rate
                burst_time = f"{package_input.rate_limit.burst_time}s" if package_input.rate_limit.burst_time else "1s"
                
                rate_limit_str += f" {burst_rx}/{burst_tx}"
                rate_limit_str += f" {threshold_rx}/{threshold_tx}"
                rate_limit_str += f" {burst_time}"

            # Create RADIUS profile using client method
            radius_rate_limit = RadiusRateLimit(
                rx_rate=rx_rate,
                tx_rate=tx_rate,
                burst_rx_rate=burst_rx if 'burst_rx' in locals() else None,
                burst_tx_rate=burst_tx if 'burst_tx' in locals() else None,
                burst_threshold_rx=threshold_rx if 'threshold_rx' in locals() else None,
                burst_threshold_tx=threshold_tx if 'threshold_tx' in locals() else None,
                burst_time=burst_time if 'burst_time' in locals() else None
            )
            
            profile = await radius_client.create_profile(
                name=profile_name,
                service_type=package_input.type,
                rate_limit=radius_rate_limit,
                description=f"Profile for package {package_input.name}"
            )
            if not profile:
                raise ValueError("RADIUS server returned unsuccessful response")

        except Exception as e:
            raise ValueError(f"Failed to create RADIUS profile: {str(e)}")
        
        # Create package in database
        package_data = {
            "name": package_input.name,
            "price": package_input.price,
            "type": package_input.type.value.lower(),
            "rate_limit": {
                "rx_rate": rx_rate,
                "tx_rate": tx_rate,
                "burst_rx_rate": burst_rx if 'burst_rx' in locals() else None,
                "burst_tx_rate": burst_tx if 'burst_tx' in locals() else None,
                "burst_threshold_rx": threshold_rx if 'threshold_rx' in locals() else None,
                "burst_threshold_tx": threshold_tx if 'threshold_tx' in locals() else None,
                "burst_time": burst_time if 'burst_time' in locals() else None
            },
            "radius_profile": profile_name,
            "agency": agency_id,
            "created_at": now,
            "updated_at": now
        }
        
        result = await collection.insert_one(package_data)
        package_data["_id"] = result.inserted_id
        
        return Package(
            id=str(package_data["_id"]),
            name=package_data["name"],
            price=package_data["price"],
            type=ServiceType(package_data["type"]),
            rate_limit=RateLimit(**package_data["rate_limit"]),
            radius_profile=package_data["radius_profile"],
            agency=package_data["agency"],
            created_at=package_data["created_at"],
            updated_at=package_data["updated_at"]
        )
    except Exception as e:
        # If anything fails, ensure we clean up the RADIUS profile if it was created
        try:
            await radius_client.delete_profile(profile_name)
        except:
            pass  # Ignore cleanup errors
        raise e
    finally:
        await radius_client.close()

async def update_package(package_id: str, package_input: PackageInput) -> Package:
    collection = db.get_collection("packages")
    now = datetime.utcnow()

    # Get existing package
    package_data = await collection.find_one({"_id": ObjectId(package_id)})
    if not package_data:
        raise ValueError(f"Package with id {package_id} not found")

    # Format rate limit for RADIUS with proper units
    rx_rate = f"{package_input.rate_limit.rx_rate}M"
    tx_rate = f"{package_input.rate_limit.tx_rate}M"
    rate_limit_str = f"{rx_rate}/{tx_rate}"

    if any([package_input.rate_limit.burst_rx_rate, package_input.rate_limit.burst_tx_rate,
            package_input.rate_limit.burst_threshold_rx, package_input.rate_limit.burst_threshold_tx,
            package_input.rate_limit.burst_time]):
        burst_rx = f"{package_input.rate_limit.burst_rx_rate}M" if package_input.rate_limit.burst_rx_rate else rx_rate
        burst_tx = f"{package_input.rate_limit.burst_tx_rate}M" if package_input.rate_limit.burst_tx_rate else tx_rate
        threshold_rx = f"{package_input.rate_limit.burst_threshold_rx}M" if package_input.rate_limit.burst_threshold_rx else rx_rate
        threshold_tx = f"{package_input.rate_limit.burst_threshold_tx}M" if package_input.rate_limit.burst_threshold_tx else tx_rate
        burst_time = f"{package_input.rate_limit.burst_time}s" if package_input.rate_limit.burst_time else "1s"
        
        rate_limit_str += f" {burst_rx}/{burst_tx}"
        rate_limit_str += f" {threshold_rx}/{threshold_tx}"
        rate_limit_str += f" {burst_time}"

    # Update RADIUS profile
    radius_client = RadiusGraphQLClient()
    try:
        profile_name = package_input.radius_profile or package_input.name
        old_profile_name = package_data.get("radius_profile")

        # Create RADIUS rate limit object
        radius_rate_limit = RadiusRateLimit(
            rx_rate=rx_rate,
            tx_rate=tx_rate,
            burst_rx_rate=burst_rx if 'burst_rx' in locals() else None,
            burst_tx_rate=burst_tx if 'burst_tx' in locals() else None,
            burst_threshold_rx=threshold_rx if 'threshold_rx' in locals() else None,
            burst_threshold_tx=threshold_tx if 'threshold_tx' in locals() else None,
            burst_time=burst_time if 'burst_time' in locals() else None
        )

        # If profile name changed, create new profile and delete old one
        if profile_name != old_profile_name:
            # Create new profile
            profile = await radius_client.create_profile(
                name=profile_name,
                service_type=package_input.type,
                rate_limit=radius_rate_limit,
                description=f"Profile for package {package_input.name}"
            )
            if not profile:
                raise ValueError("RADIUS server returned unsuccessful response")
            
            # Delete old profile if it exists
            if old_profile_name:
                try:
                    await radius_client.delete_profile(old_profile_name)
                except:
                    pass  # Ignore deletion errors for old profile
        else:
            # Update existing profile
            profile = await radius_client.update_profile(
                name=profile_name,
                service_type=package_input.type,
                rate_limit=radius_rate_limit,
                description=f"Profile for package {package_input.name}"
            )
            if not profile:
                raise ValueError("RADIUS server returned unsuccessful response")

        # Update package in database
        update_data = {
            "name": package_input.name,
            "price": package_input.price,
            "type": package_input.type.value.lower(),
            "rate_limit": {
                "rx_rate": rx_rate,
                "tx_rate": tx_rate,
                "burst_rx_rate": burst_rx if 'burst_rx' in locals() else None,
                "burst_tx_rate": burst_tx if 'burst_tx' in locals() else None,
                "burst_threshold_rx": threshold_rx if 'threshold_rx' in locals() else None,
                "burst_threshold_tx": threshold_tx if 'threshold_tx' in locals() else None,
                "burst_time": burst_time if 'burst_time' in locals() else None
            },
            "radius_profile": profile_name,
            "updated_at": now
        }

        result = await collection.update_one(
            {"_id": ObjectId(package_id)},
            {"$set": update_data}
        )

        if result.modified_count == 0:
            raise ValueError(f"Failed to update package with id {package_id}")

        # Get updated package
        package_data = await collection.find_one({"_id": ObjectId(package_id)})
        return Package(
            id=str(package_data["_id"]),
            name=package_data["name"],
            price=package_data["price"],
            type=ServiceType(package_data["type"]),
            rate_limit=RateLimit(**package_data["rate_limit"]),
            radius_profile=package_data["radius_profile"],
            agency=package_data["agency"],
            created_at=package_data["created_at"],
            updated_at=package_data["updated_at"]
        )
    except Exception as e:
        # If anything fails and we created a new profile, clean it up
        if profile_name != old_profile_name:
            try:
                await radius_client.delete_profile(profile_name)
            except:
                pass  # Ignore cleanup errors
        raise e
    finally:
        await radius_client.close()

async def delete_package(id: str) -> bool:
    collection = db.get_collection("packages")
    
    # Get package first to get the RADIUS profile name
    package = await get_package(id)
    if not package:
        return False
    
    # Delete RADIUS profile first
    radius_client = RadiusGraphQLClient()
    try:
        await delete_radius_profile(radius_client, package.radius_profile)
        
        # Delete package from database
        try:
            result = await collection.delete_one({"_id": ObjectId(id)})
            return result.deleted_count > 0
        except:
            return False
    finally:
        await radius_client.close()

@strawberry.type
class Query:
    @strawberry.field
    async def packages(self, agency_id: Optional[str] = None) -> List[Package]:
        return await get_packages(agency_id)

    @strawberry.field
    async def package(self, id: str) -> Optional[Package]:
        return await get_package(id)

@strawberry.type
class Mutation:
    @strawberry.mutation
    async def create_package(self, package_input: PackageInput, agency_id: str) -> Package:
        return await create_package(package_input, agency_id)

    @strawberry.mutation
    async def update_package(self, id: str, package_input: PackageInput) -> Package:
        return await update_package(id, package_input)

    @strawberry.mutation
    async def delete_package(self, id: str) -> bool:
        return await delete_package(id)
