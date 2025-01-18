import strawberry
from typing import List, Optional
from ..types.nas import NAS
from ..resolvers.nas import get_nas_by_id, get_all_nas

@strawberry.type
class NASQuery:
    @strawberry.field
    async def nas(self, nas_id: int) -> Optional[NAS]:
        return await get_nas_by_id(nas_id)

    @strawberry.field
    async def nas_devices(self) -> List[NAS]:
        return await get_all_nas() 