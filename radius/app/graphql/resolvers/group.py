from typing import Optional, List
from ..types.group import Group, RadGroupCheck, RadGroupReply
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

async def get_group_by_name(groupname: str) -> Optional[Group]:
    # Get check attributes
    check_query = select([radgroupcheck]).where(radgroupcheck.c.groupname == groupname)
    check_attrs = await database.fetch_all(check_query)
    
    # Get reply attributes
    reply_query = select([radgroupreply]).where(radgroupreply.c.groupname == groupname)
    reply_attrs = await database.fetch_all(reply_query)
    
    if not check_attrs and not reply_attrs:
        return None
        
    return Group(
        groupname=groupname,
        description=None,  # Description not stored in standard RADIUS schema
        check_attributes=[RadGroupCheck(**dict(attr)) for attr in check_attrs],
        reply_attributes=[RadGroupReply(**dict(attr)) for attr in reply_attrs]
    )

async def get_all_groups() -> List[Group]:
    # Get unique group names
    query = """
    SELECT DISTINCT groupname FROM (
        SELECT groupname FROM radgroupcheck
        UNION
        SELECT groupname FROM radgroupreply
    ) AS groups
    """
    groups = await database.fetch_all(query=query)
    
    return [
        await get_group_by_name(group['groupname'])
        for group in groups
    ] 