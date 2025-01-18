import strawberry
from typing import Optional, List
from enum import Enum

@strawberry.enum
class ServiceType(str, Enum):
    """Service types supported by the RADIUS server"""
    pppoe = "pppoe"
    hotspot = "hotspot"
    static = "static"
    dhcp = "dhcp"

@strawberry.type
class RateLimit:
    rx_rate: str
    tx_rate: str
    burst_rx_rate: Optional[str] = None
    burst_tx_rate: Optional[str] = None
    burst_threshold_rx: Optional[str] = None
    burst_threshold_tx: Optional[str] = None
    burst_time: Optional[str] = None

    def to_mikrotik_format(self) -> str:
        # Basic rate limit format: rx/tx
        rate_limit = f"{self.rx_rate}/{self.tx_rate}"
        
        # Add burst settings if any burst parameter is set
        if any([self.burst_rx_rate, self.burst_tx_rate, 
                self.burst_threshold_rx, self.burst_threshold_tx, 
                self.burst_time]):
            burst_rx = self.burst_rx_rate or self.rx_rate
            burst_tx = self.burst_tx_rate or self.tx_rate
            threshold_rx = self.burst_threshold_rx or self.rx_rate
            threshold_tx = self.burst_threshold_tx or self.tx_rate
            burst_time = self.burst_time or "1s"
            
            rate_limit += f" {burst_rx}/{burst_tx}"
            rate_limit += f" {threshold_rx}/{threshold_tx}"
            rate_limit += f" {burst_time}"
        
        return rate_limit

@strawberry.input
class RateLimitInput:
    rx_rate: str
    tx_rate: str
    burst_rx_rate: Optional[str] = None
    burst_tx_rate: Optional[str] = None
    burst_threshold_rx: Optional[str] = None
    burst_threshold_tx: Optional[str] = None
    burst_time: Optional[str] = None

    def to_mikrotik_format(self) -> str:
        # Basic rate limit format: rx/tx
        rate_limit = f"{self.rx_rate}/{self.tx_rate}"
        
        # Add burst settings if any burst parameter is set
        if any([self.burst_rx_rate, self.burst_tx_rate, 
                self.burst_threshold_rx, self.burst_threshold_tx, 
                self.burst_time]):
            burst_rx = self.burst_rx_rate or self.rx_rate
            burst_tx = self.burst_tx_rate or self.tx_rate
            threshold_rx = self.burst_threshold_rx or self.rx_rate
            threshold_tx = self.burst_threshold_tx or self.tx_rate
            burst_time = self.burst_time or "1s"
            
            rate_limit += f" {burst_rx}/{burst_tx}"
            rate_limit += f" {threshold_rx}/{threshold_tx}"
            rate_limit += f" {burst_time}"
        
        return rate_limit

@strawberry.type
class GroupCheckAttribute:
    id: int
    groupname: str
    attribute: str
    op: str = ":="
    value: str

@strawberry.type
class GroupReplyAttribute:
    id: int
    groupname: str
    attribute: str
    op: str = ":="
    value: str

@strawberry.type
class ProfileGroup:
    groupname: str
    check_attributes: List[GroupCheckAttribute]
    reply_attributes: List[GroupReplyAttribute]

@strawberry.type
class Profile:
    name: str
    service_type: ServiceType
    description: Optional[str] = None
    group: ProfileGroup
    rate_limit: RateLimit
    ip_pool: Optional[str] = None

@strawberry.type
class UserProfile:
    username: str
    profile_name: str
    priority: int = 1

@strawberry.input
class GroupAttributeInput:
    attribute: str
    op: str = ":="
    value: str

@strawberry.input
class ProfileCreateInput:
    name: str
    service_type: ServiceType
    description: Optional[str] = None
    rate_limit: Optional[RateLimitInput] = None
    ip_pool: Optional[str] = None
    check_attributes: Optional[List[GroupAttributeInput]] = None
    reply_attributes: Optional[List[GroupAttributeInput]] = None

@strawberry.input
class ProfileUpdateInput:
    service_type: Optional[ServiceType] = None
    description: Optional[str] = None
    rate_limit: Optional[RateLimitInput] = None
    ip_pool: Optional[str] = None
    check_attributes: Optional[List[GroupAttributeInput]] = None
    reply_attributes: Optional[List[GroupAttributeInput]] = None

@strawberry.input
class AssignProfileInput:
    username: str
    profile_name: str
    priority: Optional[int] = None
    replace_existing: bool = True
    use_check_attribute: bool = False 