import strawberry
from typing import Optional
from datetime import datetime
from enum import Enum

@strawberry.enum
class ServiceType(str, Enum):
    """Service types supported by the RADIUS server"""
    @classmethod
    def _missing_(cls, value):
        # Handle case-insensitive lookup
        for member in cls:
            if member.value.lower() == str(value).lower():
                return member
        return None
        
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

@strawberry.type
class Package:
    id: str
    name: str
    price: float
    type: ServiceType
    rate_limit: RateLimit
    radius_profile: str  # Name of the RADIUS profile
    agency: str
    created_at: datetime
    updated_at: Optional[datetime] = None

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

@strawberry.input
class PackageInput:
    name: str
    price: float
    type: ServiceType
    rate_limit: RateLimitInput
    radius_profile: Optional[str] = None  # If not provided, will use package name

@strawberry.input
class PackageUpdateInput:
    name: Optional[str] = None
    price: Optional[float] = None
    type: Optional[ServiceType] = None
    rate_limit: Optional[RateLimitInput] = None
    radius_profile: Optional[str] = None
