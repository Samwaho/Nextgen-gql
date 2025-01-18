from typing import Optional, List
from ..types.nas import NAS
from ...main import database
import sqlalchemy as sa
from sqlalchemy.sql import select

# Database table
metadata = sa.MetaData()

nas = sa.Table(
    "nas",
    metadata,
    sa.Column("id", sa.Integer, primary_key=True),
    sa.Column("nasname", sa.String(128), nullable=False),
    sa.Column("shortname", sa.String(32), nullable=False),
    sa.Column("type", sa.String(30)),
    sa.Column("ports", sa.Integer),
    sa.Column("secret", sa.String(60), nullable=False),
    sa.Column("server", sa.String(64)),
    sa.Column("community", sa.String(50)),
    sa.Column("description", sa.String(200)),
)

async def get_nas_by_id(nas_id: int) -> Optional[NAS]:
    query = select([nas]).where(nas.c.id == nas_id)
    result = await database.fetch_one(query)
    if not result:
        return None
    return NAS(**dict(result))

async def get_all_nas() -> List[NAS]:
    query = select([nas])
    results = await database.fetch_all(query)
    return [NAS(**dict(row)) for row in results] 