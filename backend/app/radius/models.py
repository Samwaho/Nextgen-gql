from typing import Optional
from dataclasses import dataclass
from enum import Enum

class ServiceType(str, Enum):
    """Service types supported by the RADIUS server"""
    pppoe = "pppoe"
    hotspot = "hotspot"
    static = "static"
    dhcp = "dhcp"

@dataclass
class RateLimit:
    """Rate limiting configuration for user profiles"""
    rx_rate: str  # Download rate (e.g., "10M")
    tx_rate: str  # Upload rate (e.g., "5M")
    burst_rx_rate: Optional[str] = None  # Burst download rate
    burst_tx_rate: Optional[str] = None  # Burst upload rate
    burst_threshold_rx: Optional[str] = None  # Burst threshold download
    burst_threshold_tx: Optional[str] = None  # Burst threshold upload
    burst_time: Optional[str] = None  # Burst time (e.g., "10s")

    def to_mikrotik_format(self) -> str:
        """Convert rate limit settings to MikroTik format"""
        base = f"{self.rx_rate}/{self.tx_rate}"
        if all([
            self.burst_rx_rate, self.burst_tx_rate,
            self.burst_threshold_rx, self.burst_threshold_tx,
            self.burst_time
        ]):
            return (f"{base} {self.burst_rx_rate}/{self.burst_tx_rate} "
                   f"{self.burst_threshold_rx}/{self.burst_threshold_tx} "
                   f"{self.burst_time}/{self.burst_time}")
        return base

@dataclass
class Profile:
    """User profile configuration"""
    name: str
    service_type: ServiceType
    description: Optional[str]
    rate_limit: RateLimit
    ip_pool: Optional[str] = None

@dataclass
class UserProfile:
    """User-profile assignment"""
    username: str
    profile_name: str
    priority: int = 1 