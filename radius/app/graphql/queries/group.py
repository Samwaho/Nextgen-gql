import strawberry
from typing import List, Optional
from ..types.group import Group
from ..resolvers.group import get_group_by_name, get_all_groups

@strawberry.type
class GroupQuery:
    @strawberry.field
    async def group(self, groupname: str) -> Optional[Group]:
        return await get_group_by_name(groupname)

    @strawberry.field
    async def groups(self) -> List[Group]:
        return await get_all_groups() 