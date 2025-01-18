import strawberry
from typing import Optional

@strawberry.type
class NAS:
    id: int
    nasname: str
    shortname: str
    type: str
    ports: Optional[int] = None
    secret: str
    server: Optional[str] = None
    community: Optional[str] = None
    description: Optional[str] = None

@strawberry.input
class NASCreateInput:
    nasname: str
    shortname: str
    type: str = "other"
    ports: Optional[int] = None
    secret: str
    server: Optional[str] = None
    community: Optional[str] = None
    description: Optional[str] = None

@strawberry.input
class NASUpdateInput:
    shortname: Optional[str] = None
    type: Optional[str] = None
    ports: Optional[int] = None
    secret: Optional[str] = None
    server: Optional[str] = None
    community: Optional[str] = None
    description: Optional[str] = None 