import strawberry
from datetime import datetime
from typing import Optional

@strawberry.type
class User:
    username: str
    download_speed: str
    upload_speed: str
    expiry_date: datetime
    simultaneous_use: int
    is_active: bool
    created_at: datetime
    ip_address: Optional[str] = None
    vlan_id: Optional[int] = None
    address_list: Optional[str] = None

@strawberry.input
class UserCreateInput:
    username: str
    password: str
    download_speed: str
    upload_speed: str
    expiry_date: datetime
    simultaneous_use: int = 1
    ip_address: Optional[str] = None
    vlan_id: Optional[int] = None
    address_list: Optional[str] = None

@strawberry.input
class UserUpdateInput:
    password: Optional[str] = None
    download_speed: Optional[str] = None
    upload_speed: Optional[str] = None
    expiry_date: Optional[datetime] = None
    simultaneous_use: Optional[int] = None
    is_active: Optional[bool] = None
    ip_address: Optional[str] = None
    vlan_id: Optional[int] = None
    address_list: Optional[str] = None 