from typing import Optional, List
from ..types.profile import (
    Profile, ProfileGroup, GroupCheckAttribute, GroupReplyAttribute,
    ServiceType, RateLimit, UserProfile,
    ProfileCreateInput, ProfileUpdateInput, AssignProfileInput
)
from ..resolvers.profile import (
    radgroupcheck, radgroupreply, radusergroup, radcheck,
    get_profile_by_name, get_profile_group
)
from ...main import database
import sqlalchemy as sa
from sqlalchemy.sql import select, and_, or_

async def create_profile(input: ProfileCreateInput) -> Profile:
    """Create a new profile using group-based approach"""
    # Check if profile (group) already exists
    existing = await get_profile_group(input.name)
    if existing:
        raise ValueError(f"Profile {input.name} already exists")

    async with database.transaction():
        # Add service type specific attributes
        check_attrs = []
        reply_attrs = []
        
        if input.service_type == ServiceType.pppoe:
            check_attrs.extend([
                {"attribute": "Service-Type", "value": "Framed-User"},
                {"attribute": "Framed-Protocol", "value": "PPP"}
            ])
        elif input.service_type == ServiceType.hotspot:
            reply_attrs.append({"attribute": "Mikrotik-Group", "value": "hotspot"})

        # Add rate limit if specified
        if input.rate_limit:
            reply_attrs.append({
                "attribute": "Mikrotik-Rate-Limit",
                "value": input.rate_limit.to_mikrotik_format()
            })

        # Add IP pool if specified
        if input.ip_pool:
            reply_attrs.append({
                "attribute": "Framed-Pool",
                "value": input.ip_pool
            })

        # Add any additional check attributes
        if input.check_attributes:
            check_attrs.extend([
                {"attribute": attr.attribute, "op": attr.op, "value": attr.value}
                for attr in input.check_attributes
            ])

        # Add any additional reply attributes
        if input.reply_attributes:
            reply_attrs.extend([
                {"attribute": attr.attribute, "op": attr.op, "value": attr.value}
                for attr in input.reply_attributes
            ])

        # Insert check attributes
        for attr in check_attrs:
            await database.execute(
                radgroupcheck.insert().values(
                    groupname=input.name,
                    **attr
                )
            )

        # Insert reply attributes
        for attr in reply_attrs:
            await database.execute(
                radgroupreply.insert().values(
                    groupname=input.name,
                    **attr
                )
            )

    return await get_profile_by_name(input.name)

async def update_profile(name: str, input: ProfileUpdateInput) -> Profile:
    """Update an existing profile"""
    # Check if profile exists
    existing = await get_profile_group(name)
    if not existing:
        raise ValueError(f"Profile {name} does not exist")

    async with database.transaction():
        # Delete existing attributes
        await database.execute(
            radgroupcheck.delete().where(radgroupcheck.c.groupname == name)
        )
        await database.execute(
            radgroupreply.delete().where(radgroupreply.c.groupname == name)
        )

        # Add service type specific attributes
        check_attrs = []
        reply_attrs = []
        
        if input.service_type == ServiceType.pppoe:
            check_attrs.extend([
                {"attribute": "Service-Type", "value": "Framed-User"},
                {"attribute": "Framed-Protocol", "value": "PPP"}
            ])
        elif input.service_type == ServiceType.hotspot:
            reply_attrs.append({"attribute": "Mikrotik-Group", "value": "hotspot"})

        # Add rate limit if specified
        if input.rate_limit:
            reply_attrs.append({
                "attribute": "Mikrotik-Rate-Limit",
                "value": input.rate_limit.to_mikrotik_format()
            })

        # Add IP pool if specified
        if input.ip_pool:
            reply_attrs.append({
                "attribute": "Framed-Pool",
                "value": input.ip_pool
            })

        # Add any additional check attributes
        if input.check_attributes:
            check_attrs.extend([
                {"attribute": attr.attribute, "op": attr.op, "value": attr.value}
                for attr in input.check_attributes
            ])

        # Add any additional reply attributes
        if input.reply_attributes:
            reply_attrs.extend([
                {"attribute": attr.attribute, "op": attr.op, "value": attr.value}
                for attr in input.reply_attributes
            ])

        # Insert check attributes
        for attr in check_attrs:
            await database.execute(
                radgroupcheck.insert().values(
                    groupname=name,
                    **attr
                )
            )

        # Insert reply attributes
        for attr in reply_attrs:
            await database.execute(
                radgroupreply.insert().values(
                    groupname=name,
                    **attr
                )
            )

    return await get_profile_by_name(name)

async def delete_profile(name: str) -> bool:
    """Delete a profile and its attributes"""
    # Check if profile exists
    existing = await get_profile_group(name)
    if not existing:
        return False

    async with database.transaction():
        # Delete profile attributes
        await database.execute(
            radgroupcheck.delete().where(radgroupcheck.c.groupname == name)
        )
        await database.execute(
            radgroupreply.delete().where(radgroupreply.c.groupname == name)
        )
        
        # Remove profile assignments
        await database.execute(
            radusergroup.delete().where(radusergroup.c.groupname == name)
        )
        await database.execute(
            radcheck.delete().where(
                and_(
                    radcheck.c.attribute == "User-Profile",
                    radcheck.c.value == name
                )
            )
        )

    return True

async def assign_profile_to_user(input: AssignProfileInput) -> UserProfile:
    """Assign a profile to a user"""
    # Check if profile exists
    profile = await get_profile_by_name(input.profile_name)
    if not profile:
        raise ValueError(f"Profile {input.profile_name} does not exist")

    async with database.transaction():
        # Remove any existing profile assignments for this user
        if input.replace_existing:
            await database.execute(
                radusergroup.delete().where(radusergroup.c.username == input.username)
            )
            await database.execute(
                radcheck.delete().where(
                    and_(
                        radcheck.c.username == input.username,
                        radcheck.c.attribute == "User-Profile"
                    )
                )
            )

        # Add new profile assignment
        if input.use_check_attribute:
            await database.execute(
                radcheck.insert().values(
                    username=input.username,
                    attribute="User-Profile",
                    op=":=",
                    value=input.profile_name
                )
            )
        else:
            await database.execute(
                radusergroup.insert().values(
                    username=input.username,
                    groupname=input.profile_name,
                    priority=input.priority or 1
                )
            )

    return UserProfile(
        username=input.username,
        profile_name=input.profile_name,
        priority=input.priority or 1
    )

async def remove_profile_from_user(username: str, profile_name: str) -> bool:
    """Remove a profile assignment from a user"""
    async with database.transaction():
        # Remove group assignment
        await database.execute(
            radusergroup.delete().where(
                and_(
                    radusergroup.c.username == username,
                    radusergroup.c.groupname == profile_name
                )
            )
        )
        
        # Remove User-Profile attribute
        await database.execute(
            radcheck.delete().where(
                and_(
                    radcheck.c.username == username,
                    radcheck.c.attribute == "User-Profile",
                    radcheck.c.value == profile_name
                )
            )
        )

    return True 