import strawberry
from typing import Optional
from datetime import datetime

@strawberry.type
class Package:
    id: str
    name: str
    price: float
    # Network settings
    downloadSpeed: float  # in Mbps
    uploadSpeed: float    # in Mbps
    # Burst configuration (optional)
    burstDownload: Optional[float] = None  # in Mbps
    burstUpload: Optional[float] = None    # in Mbps
    thresholdDownload: Optional[float] = None  # in Mbps
    thresholdUpload: Optional[float] = None    # in Mbps
    burstTime: Optional[int] = None  # in seconds
    # MikroTik service configuration
    serviceType: Optional[str] = None  # pppoe, hotspot, dhcp, etc.
    addressPool: Optional[str] = None  # IP pool name in MikroTik
    # Session management
    sessionTimeout: Optional[int] = None  # in seconds
    idleTimeout: Optional[int] = None     # in seconds
    # QoS and VLAN
    priority: Optional[int] = None  # 1-8 for MikroTik queue priority
    vlanId: Optional[int] = None    # VLAN ID if using VLANs
    # Administrative
    agency: str
    createdAt: datetime
    updatedAt: Optional[datetime] = None

@strawberry.input
class PackageInput:
    name: str
    price: float
    # Network settings
    downloadSpeed: float
    uploadSpeed: float
    # Burst configuration (optional)
    burstDownload: Optional[float] = None
    burstUpload: Optional[float] = None
    thresholdDownload: Optional[float] = None
    thresholdUpload: Optional[float] = None
    burstTime: Optional[int] = None
    # MikroTik service configuration
    serviceType: Optional[str] = None
    addressPool: Optional[str] = None
    # Session management
    sessionTimeout: Optional[int] = None
    idleTimeout: Optional[int] = None
    # QoS and VLAN
    priority: Optional[int] = None
    vlanId: Optional[int] = None

@strawberry.input
class PackageUpdateInput:
    name: Optional[str] = None
    price: Optional[float] = None
    # Network settings
    downloadSpeed: Optional[float] = None
    uploadSpeed: Optional[float] = None
    # Burst configuration
    burstDownload: Optional[float] = None
    burstUpload: Optional[float] = None
    thresholdDownload: Optional[float] = None
    thresholdUpload: Optional[float] = None
    burstTime: Optional[int] = None
    # MikroTik service configuration
    serviceType: Optional[str] = None
    addressPool: Optional[str] = None
    # Session management
    sessionTimeout: Optional[int] = None
    idleTimeout: Optional[int] = None
    # QoS and VLAN
    priority: Optional[int] = None
    vlanId: Optional[int] = None
