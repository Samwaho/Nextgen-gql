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

    def format_speed(self, speed_mbps: float) -> str:
        """Format speed in Mbps to MikroTik format with k/M suffix"""
        speed_kbps = int(speed_mbps * 1024)  # Convert Mbps to kbps
        if speed_kbps >= 1024:
            return f"{speed_kbps // 1024}M"
        return f"{speed_kbps}k"

    def get_rate_limit(self) -> str:
        """Get MikroTik rate limit string"""
        # Format base speeds
        upload = self.format_speed(self.upload_speed)
        download = self.format_speed(self.download_speed)
        
        # Format burst speeds (use base speeds if not specified)
        burst_up = self.format_speed(self.burst_upload) if self.burst_upload else upload
        burst_down = self.format_speed(self.burst_download) if self.burst_download else download
        
        # Format threshold speeds (use base speeds if not specified)
        threshold_up = self.format_speed(self.threshold_upload) if self.threshold_upload else upload
        threshold_down = self.format_speed(self.threshold_download) if self.threshold_download else download
        
        # Get burst time and priority
        burst_time = self.burst_time or '0'
        priority = self.priority or '8'
        
        # Build rate limit string
        return f"{upload}/{download} {burst_up}/{burst_down} {threshold_up}/{threshold_down} {burst_time}/{burst_time} {priority}"

    def to_radius_attributes(self) -> List[RadiusAttribute]:
        attributes = []
        
        # Add rate limit
        attributes.append(RadiusAttribute(name="Mikrotik-Rate-Limit", value=self.get_rate_limit()))
        
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