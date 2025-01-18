import strawberry
from typing import Optional, List

@strawberry.type
class RadGroupCheck:
    id: int
    groupname: str
    attribute: str
    op: str = ":="
    value: str

@strawberry.type
class RadGroupReply:
    id: int
    groupname: str
    attribute: str
    op: str = ":="
    value: str

@strawberry.type
class UserGroup:
    id: int
    username: str
    groupname: str
    priority: int = 1

@strawberry.type
class Group:
    groupname: str
    description: Optional[str]
    check_attributes: List[RadGroupCheck]
    reply_attributes: List[RadGroupReply]

@strawberry.input
class AttributeInput:
    type: str  # "check" or "reply"
    attribute: str
    value: str
    op: str = ":="

@strawberry.input
class GroupCreateInput:
    groupname: str
    description: Optional[str] = None
    attributes: List[AttributeInput]

@strawberry.input
class GroupUpdateInput:
    description: Optional[str] = None
    attributes: Optional[List[AttributeInput]] = None

@strawberry.input
class UserGroupInput:
    username: str
    groupname: str
    priority: int = 1 