from typing import Optional, List
from ..types.profile import (
    Profile, ProfileGroup, GroupCheckAttribute, GroupReplyAttribute,
    ServiceType, RateLimit, UserProfile
)
from ...main import database
import sqlalchemy as sa
from sqlalchemy.sql import select, and_

# Database tables
metadata = sa.MetaData()

radgroupcheck = sa.Table(
    "radgroupcheck",
    metadata,
    sa.Column("id", sa.Integer, primary_key=True),
    sa.Column("groupname", sa.String(64), nullable=False),
    sa.Column("attribute", sa.String(64)),
    sa.Column("op", sa.String(2), default=":="),
    sa.Column("value", sa.String(253)),
)

radgroupreply = sa.Table(
    "radgroupreply",
    metadata,
    sa.Column("id", sa.Integer, primary_key=True),
    sa.Column("groupname", sa.String(64), nullable=False),
    sa.Column("attribute", sa.String(64)),
    sa.Column("op", sa.String(2), default=":="),
    sa.Column("value", sa.String(253)),
)

radusergroup = sa.Table(
    "radusergroup",
    metadata,
    sa.Column("id", sa.Integer, primary_key=True),
    sa.Column("username", sa.String(64), nullable=False),
    sa.Column("groupname", sa.String(64), nullable=False),
    sa.Column("priority", sa.Integer, default=1),
)

radcheck = sa.Table(
    "radcheck",
    metadata,
    sa.Column("id", sa.Integer, primary_key=True),
    sa.Column("username", sa.String(64)),
    sa.Column("attribute", sa.String(64)),
    sa.Column("op", sa.String(2)),
    sa.Column("value", sa.String(253)),
)

def parse_rate_limit(value: str) -> RateLimit:
    """Parse MikroTik rate limit string into RateLimit object"""
    parts = value.split()
    
    # Basic rate limit
    rx_rate, tx_rate = parts[0].split("/")
    rate_limit = {
        "rx_rate": rx_rate,
        "tx_rate": tx_rate
    }
    
    # Burst settings if available
    if len(parts) >= 4:
        burst_rates = parts[1].split("/")
        burst_thresholds = parts[2].split("/")
        burst_times = parts[3].split("/")
        
        rate_limit.update({
            "burst_rx_rate": burst_rates[0],
            "burst_tx_rate": burst_rates[1],
            "burst_threshold_rx": burst_thresholds[0],
            "burst_threshold_tx": burst_thresholds[1],
            "burst_time": burst_times[0]  # Same for both directions
        })
    
    return RateLimit(**rate_limit)

async def get_profile_group(groupname: str) -> Optional[ProfileGroup]:
    """Get profile group with its attributes"""
    # Get check attributes
    check_query = select(radgroupcheck).where(radgroupcheck.c.groupname == groupname)
    check_attrs = await database.fetch_all(check_query)
    
    # Get reply attributes
    reply_query = select(radgroupreply).where(radgroupreply.c.groupname == groupname)
    reply_attrs = await database.fetch_all(reply_query)
    
    if not check_attrs and not reply_attrs:
        return None

    return ProfileGroup(
        groupname=groupname,
        check_attributes=[GroupCheckAttribute(**dict(attr)) for attr in check_attrs],
        reply_attributes=[GroupReplyAttribute(**dict(attr)) for attr in reply_attrs]
    )

async def get_profile_by_name(name: str) -> Optional[Profile]:
    """Get profile by name"""
    # Get profile group (profile name is used as group name)
    group = await get_profile_group(name)
    if not group:
        return None

    # Extract rate limit from reply attributes
    rate_limit_attr = next(
        (attr for attr in group.reply_attributes if attr.attribute == "Mikrotik-Rate-Limit"),
        None
    )
    rate_limit = parse_rate_limit(rate_limit_attr.value) if rate_limit_attr else RateLimit(rx_rate="0M", tx_rate="0M")

    # Extract IP pool
    ip_pool = next(
        (attr.value for attr in group.reply_attributes if attr.attribute == "Framed-Pool"),
        None
    )

    # Determine service type from check attributes
    service_type = ServiceType.pppoe  # Default to PPPoE
    if any(attr.attribute == "Framed-Protocol" and attr.value == "PPP" for attr in group.check_attributes):
        service_type = ServiceType.pppoe
    elif any(attr.attribute == "Mikrotik-Group" for attr in group.reply_attributes):
        service_type = ServiceType.hotspot

    return Profile(
        name=name,
        service_type=service_type,
        description=None,  # Description not stored in standard RADIUS schema
        group=group,
        rate_limit=rate_limit,
        ip_pool=ip_pool
    )

async def get_all_profiles() -> List[Profile]:
    """Get all profiles by getting unique group names"""
    query = select(
        sa.union(
            select(radgroupcheck.c.groupname).distinct(),
            select(radgroupreply.c.groupname).distinct()
        ).alias("groups").c.groupname
    )
    groups = await database.fetch_all(query)
    
    profiles = []
    for group in groups:
        profile = await get_profile_by_name(group['groupname'])
        if profile:
            profiles.append(profile)
    
    return profiles

async def get_profile_users(profile_name: str) -> List[UserProfile]:
    """Get all users assigned to a profile"""
    # Check users directly assigned to the profile group
    group_query = select([radusergroup]).where(radusergroup.c.groupname == profile_name)
    group_users = await database.fetch_all(group_query)
    
    # Check users with User-Profile attribute
    profile_query = select([radcheck]).where(
        and_(
            radcheck.c.attribute == "User-Profile",
            radcheck.c.value == profile_name
        )
    )
    profile_users = await database.fetch_all(profile_query)
    
    users = []
    # Add users from group assignments
    for user in group_users:
        users.append(UserProfile(
            username=user["username"],
            profile_name=profile_name,
            priority=user["priority"]
        ))
    
    # Add users from User-Profile attribute
    for user in profile_users:
        users.append(UserProfile(
            username=user["username"],
            profile_name=profile_name,
            priority=1  # Default priority for User-Profile assignments
        ))
    
    return users 