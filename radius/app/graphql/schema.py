import strawberry
from typing import Optional, List
from .types.user import User
from .types.nas import NAS
from .types.profile import Profile, UserProfile
from .queries.user import UserQuery
from .queries.nas import NASQuery
from .queries.profile import ProfileQuery
from .mutations.user import UserMutation
from .mutations.nas import NASMutation
from .mutations.profile import (
    create_profile, update_profile, delete_profile,
    assign_profile_to_user, remove_profile_from_user,
    ProfileCreateInput, ProfileUpdateInput, AssignProfileInput
)

@strawberry.type
class Query(UserQuery, NASQuery, ProfileQuery):
    pass

@strawberry.type
class Mutation(UserMutation, NASMutation):
    # Profile mutations
    @strawberry.mutation
    async def create_profile(self, profile: ProfileCreateInput) -> Profile:
        return await create_profile(profile)

    @strawberry.mutation
    async def update_profile(self, name: str, profile: ProfileUpdateInput) -> Profile:
        return await update_profile(name, profile)

    @strawberry.mutation
    async def delete_profile(self, name: str) -> bool:
        return await delete_profile(name)

    @strawberry.mutation
    async def assign_profile_to_user(self, input: AssignProfileInput) -> UserProfile:
        return await assign_profile_to_user(input)

    @strawberry.mutation
    async def remove_profile_from_user(self, username: str, profile_name: str) -> bool:
        return await remove_profile_from_user(username, profile_name)

schema = strawberry.Schema(query=Query, mutation=Mutation) 