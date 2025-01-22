from pydantic import BaseModel, Field, validator
from typing import Optional, List

class RadiusAttribute(BaseModel):
    name: str
    value: str
    op: str = Field(default=":=")

class RadiusProfile(BaseModel):
    name: str
    # Network settings
    download_speed: float  # in Mbps
    upload_speed: float    # in Mbps
    # Burst configuration
    burst_download: Optional[float] = None  # in Mbps
    burst_upload: Optional[float] = None    # in Mbps
    threshold_download: Optional[float] = None  # in Mbps
    threshold_upload: Optional[float] = None    # in Mbps
    burst_time: Optional[int] = None  # in seconds
    # MikroTik service configuration
    service_type: Optional[str] = None  # pppoe, hotspot, dhcp, etc.
    address_pool: Optional[str] = None  # IP pool name in MikroTik
    # Session management
    session_timeout: Optional[int] = None  # in seconds
    idle_timeout: Optional[int] = None     # in seconds
    # QoS and VLAN
    priority: Optional[int] = None  # 1-8 for MikroTik queue priority
    vlan_id: Optional[int] = None    # VLAN ID if using VLANs
    
    @validator('priority')
    def validate_priority(cls, v):
        if v is not None and not (1 <= v <= 8):
            raise ValueError('Priority must be between 1 and 8')
        return v

    @validator('service_type')
    def validate_service_type(cls, v):
        if v is not None and v.lower() not in ['pppoe', 'hotspot', 'dhcp', 'static']:
            raise ValueError('Service type must be one of: pppoe, hotspot, dhcp, static')
        return v.lower() if v else None

    def to_radius_attributes(self) -> List[RadiusAttribute]:
        attributes = []
        
        # Basic speed limits with burst configuration
        rate_limit = f"{self.download_speed}M/{self.upload_speed}M"
        
        # Add burst settings if configured
        if all([self.burst_download, self.burst_upload, 
               self.threshold_download, self.threshold_upload, self.burst_time]):
            rate_limit = (f"{rate_limit} "
                         f"{self.burst_download}M/{self.burst_upload}M "
                         f"{self.threshold_download}M/{self.threshold_upload}M "
                         f"{self.burst_time}/{self.burst_time}")
        
        attributes.append(RadiusAttribute(name="Mikrotik-Rate-Limit", value=rate_limit))
        
        # Service type specific attributes
        if self.service_type:
            if self.service_type == 'pppoe':
                attributes.append(RadiusAttribute(name="Service-Type", value="Framed-User"))
                attributes.append(RadiusAttribute(name="Framed-Protocol", value="PPP"))
            elif self.service_type == 'hotspot':
                attributes.append(RadiusAttribute(name="Service-Type", value="Login-User"))
            elif self.service_type == 'dhcp':
                attributes.append(RadiusAttribute(name="Service-Type", value="Framed-User"))
                attributes.append(RadiusAttribute(name="Framed-Protocol", value="DHCP"))
        
        # Address pool
        if self.address_pool:
            attributes.append(RadiusAttribute(name="Framed-Pool", value=self.address_pool))
        
        # Session management
        if self.session_timeout:
            attributes.append(RadiusAttribute(name="Session-Timeout", value=str(self.session_timeout)))
        if self.idle_timeout:
            attributes.append(RadiusAttribute(name="Idle-Timeout", value=str(self.idle_timeout)))
        
        # QoS settings
        if self.priority:
            attributes.append(RadiusAttribute(name="Mikrotik-Queue-Priority", value=str(self.priority)))
        
        # VLAN configuration
        if self.vlan_id:
            attributes.extend([
                RadiusAttribute(name="Tunnel-Type", value="VLAN"),
                RadiusAttribute(name="Tunnel-Medium-Type", value="IEEE-802"),
                RadiusAttribute(name="Tunnel-Private-Group-Id", value=str(self.vlan_id))
            ])
        
        return attributes 