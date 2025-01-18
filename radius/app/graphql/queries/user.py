import strawberry
from typing import List, Optional
from ..types.user import User
from ..resolvers.user import get_user_by_username, get_all_users

@strawberry.type
class UserQuery:
    @strawberry.field
    async def user(self, username: str) -> Optional[User]:
        return await get_user_by_username(username)

    @strawberry.field
    async def users(self) -> List[User]:
        return await get_all_users() 