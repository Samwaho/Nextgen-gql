from typing import Optional, List
from datetime import datetime
from ..types.user import User
from ...db import database, metadata
import sqlalchemy as sa
from sqlalchemy.sql import select, and_

# RADIUS attribute constants
RADIUS_ATTRIBUTES = {
    "password": "Cleartext-Password",
    "download_speed": "Mikrotik-Rate-Limit",
    "expiry": "Expiration",
    "simultaneous_use": "Simultaneous-Use"
}

# Database tables
metadata = sa.MetaData()

radcheck = sa.Table(
    "radcheck",
    metadata,
    sa.Column("id", sa.Integer, primary_key=True),
    sa.Column("username", sa.String(64)),
    sa.Column("attribute", sa.String(64)),
    sa.Column("op", sa.String(2)),
    sa.Column("value", sa.String(253)),
)

radreply = sa.Table(
    "radreply",
    metadata,
    sa.Column("id", sa.Integer, primary_key=True),
    sa.Column("username", sa.String(64)),
    sa.Column("attribute", sa.String(64)),
    sa.Column("op", sa.String(2)),
    sa.Column("value", sa.String(253)),
)

async def get_user_by_username(username: str) -> Optional[User]:
    query = select([radcheck]).where(
        and_(
            radcheck.c.username == username,
            radcheck.c.attribute == RADIUS_ATTRIBUTES["password"]
        )
    )
    user = await database.fetch_one(query)
    if not user:
        return None

    # Get rate limit
    rate_query = select([radreply]).where(
        and_(
            radreply.c.username == username,
            radreply.c.attribute == RADIUS_ATTRIBUTES["download_speed"]
        )
    )
    rate_limit = await database.fetch_one(rate_query)
    
    # Get expiry date
    expiry_query = select([radcheck]).where(
        and_(
            radcheck.c.username == username,
            radcheck.c.attribute == RADIUS_ATTRIBUTES["expiry"]
        )
    )
    expiry = await database.fetch_one(expiry_query)

    # Get simultaneous use
    sim_query = select([radcheck]).where(
        and_(
            radcheck.c.username == username,
            radcheck.c.attribute == RADIUS_ATTRIBUTES["simultaneous_use"]
        )
    )
    sim_use = await database.fetch_one(sim_query)

    rate_parts = rate_limit["value"].split("/") if rate_limit else ["0M", "0M"]
    expiry_date = datetime.strptime(expiry["value"], "%Y-%m-%d") if expiry else datetime.now()

    return User(
        username=username,
        download_speed=rate_parts[0],
        upload_speed=rate_parts[1],
        expiry_date=expiry_date,
        simultaneous_use=int(sim_use["value"]) if sim_use else 1,
        is_active=expiry_date > datetime.now() if expiry else False,
        created_at=datetime.now()
    )

async def get_all_users() -> List[User]:
    query = """
    SELECT DISTINCT rc.username,
           (SELECT value FROM radreply WHERE username = rc.username AND attribute = 'Mikrotik-Rate-Limit') as rate_limit,
           (SELECT value FROM radcheck WHERE username = rc.username AND attribute = 'Expiration') as expiry_date,
           (SELECT value FROM radcheck WHERE username = rc.username AND attribute = 'Simultaneous-Use') as simultaneous_use
    FROM radcheck rc
    """
    users = await database.fetch_all(query=query)
    
    return [
        User(
            username=user["username"],
            download_speed=user["rate_limit"].split("/")[0] if user["rate_limit"] else "0M",
            upload_speed=user["rate_limit"].split("/")[1] if user["rate_limit"] else "0M",
            expiry_date=datetime.strptime(user["expiry_date"], "%Y-%m-%d") if user["expiry_date"] else datetime.now(),
            simultaneous_use=int(user["simultaneous_use"]) if user["simultaneous_use"] else 1,
            is_active=datetime.strptime(user["expiry_date"], "%Y-%m-%d") > datetime.now() if user["expiry_date"] else False,
            created_at=datetime.now()
        )
        for user in users
    ] 