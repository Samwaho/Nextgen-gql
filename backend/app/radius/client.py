from typing import Optional, List, Dict, Any
import httpx
from .models import ServiceType, RateLimit, Profile, UserProfile
from . import queries
from ..config.settings import settings

class RadiusGraphQLClient:
    """Client for interacting with the RADIUS GraphQL API"""

    def __init__(self, base_url: str = settings.RADIUS_API_URL):
        """Initialize the client with the GraphQL endpoint URL"""
        self.base_url = base_url
        self.client = httpx.AsyncClient()

    async def close(self):
        """Close the HTTP client"""
        await self.client.aclose()

    async def execute_query(self, query: str, variables: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """Execute a GraphQL query"""
        response = await self.client.post(
            self.base_url,
            json={"query": query, "variables": variables or {}}
        )
        response.raise_for_status()
        return response.json()

    # Profile Queries
    async def get_profile(self, name: str) -> Optional[Profile]:
        """Get a profile by name"""
        result = await self.execute_query(queries.GET_PROFILE, {"name": name})
        if result.get("data", {}).get("profile"):
            data = result["data"]["profile"]
            return Profile(
                name=data["name"],
                service_type=ServiceType(data["serviceType"]),
                description=data["description"],
                rate_limit=RateLimit(**{
                    k: v for k, v in data["rateLimit"].items() if v is not None
                }),
                ip_pool=data["ipPool"]
            )
        return None

    async def get_all_profiles(self) -> List[Profile]:
        """Get all profiles"""
        result = await self.execute_query(queries.GET_ALL_PROFILES)
        profiles = []
        for data in result.get("data", {}).get("profiles", []):
            profiles.append(Profile(
                name=data["name"],
                service_type=ServiceType(data["serviceType"]),
                description=data["description"],
                rate_limit=RateLimit(**{
                    k: v for k, v in data["rateLimit"].items() if v is not None
                }),
                ip_pool=data["ipPool"]
            ))
        return profiles

    async def get_profile_users(self, profile_name: str) -> List[UserProfile]:
        """Get all users assigned to a profile"""
        result = await self.execute_query(
            queries.GET_PROFILE_USERS,
            {"profileName": profile_name}
        )
        return [
            UserProfile(**user)
            for user in result.get("data", {}).get("profileUsers", [])
        ]

    # Profile Mutations
    async def create_profile(
        self,
        name: str,
        service_type: ServiceType,
        rate_limit: RateLimit,
        description: Optional[str] = None,
        ip_pool: Optional[str] = None
    ) -> Profile:
        """Create a new profile"""
        variables = {
            "profile": {
                "name": name,
                "serviceType": service_type,
                "description": description,
                "rateLimit": {
                    "rxRate": rate_limit.rx_rate,
                    "txRate": rate_limit.tx_rate,
                    "burstRxRate": rate_limit.burst_rx_rate,
                    "burstTxRate": rate_limit.burst_tx_rate,
                    "burstThresholdRx": rate_limit.burst_threshold_rx,
                    "burstThresholdTx": rate_limit.burst_threshold_tx,
                    "burstTime": rate_limit.burst_time
                },
                "ipPool": ip_pool
            }
        }
        result = await self.execute_query(queries.CREATE_PROFILE, variables)
        data = result["data"]["createProfile"]
        return Profile(
            name=data["name"],
            service_type=ServiceType(data["serviceType"]),
            description=data["description"],
            rate_limit=RateLimit(**{
                k: v for k, v in data["rateLimit"].items() if v is not None
            }),
            ip_pool=data["ipPool"]
        )

    async def update_profile(
        self,
        name: str,
        service_type: Optional[ServiceType] = None,
        rate_limit: Optional[RateLimit] = None,
        description: Optional[str] = None,
        ip_pool: Optional[str] = None
    ) -> Profile:
        """Update an existing profile"""
        variables = {
            "name": name,
            "profile": {
                "serviceType": service_type,
                "description": description,
                "rateLimit": {
                    "rxRate": rate_limit.rx_rate,
                    "txRate": rate_limit.tx_rate,
                    "burstRxRate": rate_limit.burst_rx_rate,
                    "burstTxRate": rate_limit.burst_tx_rate,
                    "burstThresholdRx": rate_limit.burst_threshold_rx,
                    "burstThresholdTx": rate_limit.burst_threshold_tx,
                    "burstTime": rate_limit.burst_time
                } if rate_limit else None,
                "ipPool": ip_pool
            }
        }
        result = await self.execute_query(queries.UPDATE_PROFILE, variables)
        data = result["data"]["updateProfile"]
        return Profile(
            name=data["name"],
            service_type=ServiceType(data["serviceType"]),
            description=data["description"],
            rate_limit=RateLimit(**{
                k: v for k, v in data["rateLimit"].items() if v is not None
            }),
            ip_pool=data["ipPool"]
        )

    async def delete_profile(self, name: str) -> bool:
        """Delete a profile"""
        result = await self.execute_query(queries.DELETE_PROFILE, {"name": name})
        return result["data"]["deleteProfile"]

    async def assign_profile_to_user(
        self,
        username: str,
        profile_name: str,
        priority: int = 1,
        use_check_attribute: bool = False,
        replace_existing: bool = True
    ) -> UserProfile:
        """Assign a profile to a user"""
        variables = {
            "input": {
                "username": username,
                "profileName": profile_name,
                "priority": priority,
                "useCheckAttribute": use_check_attribute,
                "replaceExisting": replace_existing
            }
        }
        result = await self.execute_query(queries.ASSIGN_PROFILE_TO_USER, variables)
        data = result["data"]["assignProfileToUser"]
        return UserProfile(**data)

    async def remove_profile_from_user(self, username: str, profile_name: str) -> bool:
        """Remove a profile from a user"""
        variables = {
            "username": username,
            "profileName": profile_name
        }
        result = await self.execute_query(queries.REMOVE_PROFILE_FROM_USER, variables)
        return result["data"]["removeProfileFromUser"] 