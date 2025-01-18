import strawberry
from typing import Optional, List
from ..types.group import Group, GroupCreateInput, GroupUpdateInput, UserGroupInput
from ..resolvers.group import get_group_by_name, radgroupcheck, radgroupreply, radusergroup
from ...main import database

@strawberry.type
class GroupMutation:
    @strawberry.mutation
    async def create_group(self, group: GroupCreateInput) -> Group:
        async with database.transaction():
            # Check if group exists
            existing_group = await get_group_by_name(group.groupname)
            if existing_group:
                raise ValueError("Group already exists")

            # Insert attributes
            for attr in group.attributes:
                if attr.type == "check":
                    await database.execute(
                        radgroupcheck.insert().values(
                            groupname=group.groupname,
                            attribute=attr.attribute,
                            op=attr.op,
                            value=attr.value
                        )
                    )
                elif attr.type == "reply":
                    await database.execute(
                        radgroupreply.insert().values(
                            groupname=group.groupname,
                            attribute=attr.attribute,
                            op=attr.op,
                            value=attr.value
                        )
                    )

            return await get_group_by_name(group.groupname)

    @strawberry.mutation
    async def update_group(self, groupname: str, group: GroupUpdateInput) -> Optional[Group]:
        async with database.transaction():
            existing_group = await get_group_by_name(groupname)
            if not existing_group:
                raise ValueError("Group not found")

            if group.attributes:
                # Delete existing attributes
                await database.execute(
                    radgroupcheck.delete().where(radgroupcheck.c.groupname == groupname)
                )
                await database.execute(
                    radgroupreply.delete().where(radgroupreply.c.groupname == groupname)
                )

                # Insert new attributes
                for attr in group.attributes:
                    if attr.type == "check":
                        await database.execute(
                            radgroupcheck.insert().values(
                                groupname=groupname,
                                attribute=attr.attribute,
                                op=attr.op,
                                value=attr.value
                            )
                        )
                    elif attr.type == "reply":
                        await database.execute(
                            radgroupreply.insert().values(
                                groupname=groupname,
                                attribute=attr.attribute,
                                op=attr.op,
                                value=attr.value
                            )
                        )

            return await get_group_by_name(groupname)

    @strawberry.mutation
    async def delete_group(self, groupname: str) -> bool:
        async with database.transaction():
            existing_group = await get_group_by_name(groupname)
            if not existing_group:
                raise ValueError("Group not found")

            # Delete group attributes
            await database.execute(
                radgroupcheck.delete().where(radgroupcheck.c.groupname == groupname)
            )
            await database.execute(
                radgroupreply.delete().where(radgroupreply.c.groupname == groupname)
            )
            # Delete user-group associations
            await database.execute(
                radusergroup.delete().where(radusergroup.c.groupname == groupname)
            )

            return True

    @strawberry.mutation
    async def assign_user_to_group(self, user_group: UserGroupInput) -> bool:
        async with database.transaction():
            # Check if user is already in group
            query = radusergroup.select().where(
                and_(
                    radusergroup.c.username == user_group.username,
                    radusergroup.c.groupname == user_group.groupname
                )
            )
            existing = await database.fetch_one(query)
            if existing:
                raise ValueError("User is already in this group")

            # Add user to group
            await database.execute(
                radusergroup.insert().values(
                    username=user_group.username,
                    groupname=user_group.groupname,
                    priority=user_group.priority
                )
            )

            return True

    @strawberry.mutation
    async def remove_user_from_group(self, username: str, groupname: str) -> bool:
        async with database.transaction():
            # Delete user-group association
            await database.execute(
                radusergroup.delete().where(
                    and_(
                        radusergroup.c.username == username,
                        radusergroup.c.groupname == groupname
                    )
                )
            )
            return True 