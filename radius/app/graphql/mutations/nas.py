import strawberry
from typing import Optional
from ..types.nas import NAS, NASCreateInput, NASUpdateInput
from ..resolvers.nas import get_nas_by_id, nas
from ...main import database

@strawberry.type
class NASMutation:
    @strawberry.mutation
    async def create_nas(self, nas_input: NASCreateInput) -> NAS:
        # Check if NAS exists
        query = nas.select().where(nas.c.nasname == nas_input.nasname)
        existing_nas = await database.fetch_one(query)
        if existing_nas:
            raise ValueError("NAS with this IP/hostname already exists")

        # Insert new NAS
        query = nas.insert().values(**nas_input.__dict__)
        last_record_id = await database.execute(query)
        
        # Return created NAS
        return await get_nas_by_id(last_record_id)

    @strawberry.mutation
    async def update_nas(self, nas_id: int, nas_input: NASUpdateInput) -> Optional[NAS]:
        # Check if NAS exists
        existing_nas = await get_nas_by_id(nas_id)
        if not existing_nas:
            raise ValueError("NAS not found")

        # Update NAS
        update_data = {k: v for k, v in nas_input.__dict__.items() if v is not None}
        if update_data:
            query = nas.update().where(nas.c.id == nas_id).values(update_data)
            await database.execute(query)

        return await get_nas_by_id(nas_id)

    @strawberry.mutation
    async def delete_nas(self, nas_id: int) -> bool:
        # Check if NAS exists
        existing_nas = await get_nas_by_id(nas_id)
        if not existing_nas:
            raise ValueError("NAS not found")

        # Delete NAS
        query = nas.delete().where(nas.c.id == nas_id)
        await database.execute(query)
        return True 