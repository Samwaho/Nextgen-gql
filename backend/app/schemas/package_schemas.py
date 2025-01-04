import strawberry
from typing import Optional
from datetime import datetime

@strawberry.type
class Package:
    id: str
    name: str
    price: float
    bandwidth: str
    type: str
    downloadSpeed: float
    uploadSpeed: float
    burstDownload: Optional[float] = None
    burstUpload: Optional[float] = None
    thresholdDownload: Optional[float] = None
    thresholdUpload: Optional[float] = None
    burstTime: Optional[int] = None
    radiusProfile: Optional[str] = None
    agency: str
    createdAt: datetime
    updatedAt: Optional[datetime] = None

@strawberry.input
class PackageInput:
    name: str
    price: float
    bandwidth: str
    type: str
    downloadSpeed: float
    uploadSpeed: float
    burstDownload: Optional[float] = None
    burstUpload: Optional[float] = None
    thresholdDownload: Optional[float] = None
    thresholdUpload: Optional[float] = None
    burstTime: Optional[int] = None
    radiusProfile: Optional[str] = None

@strawberry.input
class PackageUpdateInput:
    name: Optional[str] = None
    price: Optional[float] = None
    bandwidth: Optional[str] = None
    type: Optional[str] = None
    downloadSpeed: Optional[float] = None
    uploadSpeed: Optional[float] = None
    burstDownload: Optional[float] = None
    burstUpload: Optional[float] = None
    thresholdDownload: Optional[float] = None
    thresholdUpload: Optional[float] = None
    burstTime: Optional[int] = None
    radiusProfile: Optional[str] = None
