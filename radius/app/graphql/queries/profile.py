import strawberry
from typing import Optional, List
from ..types.profile import Profile, UserProfile
from ..resolvers.profile import get_profile_by_name, get_all_profiles, get_profile_users

@strawberry.type
class ProfileQuery:
    @strawberry.field
    async def profile(self, name: str) -> Optional[Profile]:
        """Get a profile by name"""
        return await get_profile_by_name(name)

    @strawberry.field
    async def profiles(self) -> List[Profile]:
        """Get all profiles"""
        return await get_all_profiles()

    @strawberry.field
    async def profile_users(self, profile_name: str) -> List[UserProfile]:
        """Get all users assigned to a profile"""
        return await get_profile_users(profile_name) 