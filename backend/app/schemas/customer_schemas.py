from typing import Optional
from datetime import datetime
import strawberry

@strawberry.type
class CustomerPackage:
    id: str
    name: str
    serviceType: str

@strawberry.type
class AccountingData:
    username: str
    sessionId: str = strawberry.field(name="sessionId")
    status: str
    sessionTime: int = strawberry.field(name="sessionTime")
    inputOctets: int = strawberry.field(name="inputOctets")
    outputOctets: int = strawberry.field(name="outputOctets")
    inputPackets: int = strawberry.field(name="inputPackets")
    outputPackets: int = strawberry.field(name="outputPackets")
    inputGigawords: int = strawberry.field(name="inputGigawords")
    outputGigawords: int = strawberry.field(name="outputGigawords")
    calledStationId: str = strawberry.field(name="calledStationId")
    callingStationId: str = strawberry.field(name="callingStationId")
    terminateCause: str = strawberry.field(name="terminateCause")
    nasIpAddress: str = strawberry.field(name="nasIpAddress")
    nasIdentifier: str = strawberry.field(name="nasIdentifier")
    nasPort: str = strawberry.field(name="nasPort")
    nasPortType: str = strawberry.field(name="nasPortType")
    serviceType: str = strawberry.field(name="serviceType")
    framedProtocol: str = strawberry.field(name="framedProtocol")
    framedIpAddress: str = strawberry.field(name="framedIpAddress")
    idleTimeout: int = strawberry.field(name="idleTimeout")
    sessionTimeout: int = strawberry.field(name="sessionTimeout")
    mikrotikRateLimit: str = strawberry.field(name="mikrotikRateLimit")
    timestamp: datetime
    totalInputBytes: int = strawberry.field(name="totalInputBytes")
    totalOutputBytes: int = strawberry.field(name="totalOutputBytes")
    totalBytes: int = strawberry.field(name="totalBytes")
    inputMbytes: float = strawberry.field(name="inputMbytes")
    outputMbytes: float = strawberry.field(name="outputMbytes")
    totalMbytes: float = strawberry.field(name="totalMbytes")
    sessionTimeHours: float = strawberry.field(name="sessionTimeHours")

@strawberry.type
class Customer:
    id: str
    name: str
    email: str
    phone: str
    username: str
    address: Optional[str]
    agency: str
    package: Optional[CustomerPackage]
    status: str
    expiry: datetime
    password: str  # PPPoE password
    createdAt: datetime = strawberry.field(name="createdAt")
    updatedAt: Optional[datetime] = strawberry.field(name="updatedAt")

@strawberry.input
class CustomerInput:
    name: str
    email: str
    phone: str
    username: str
    password: str
    address: Optional[str] = None
    package: Optional[str] = None
    status: Optional[str] = "inactive"
    expiry: datetime

@strawberry.input
class CustomerUpdateInput:
    name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    username: Optional[str] = None
    address: Optional[str] = None
    package: Optional[str] = None
    status: Optional[str] = None
    expiry: Optional[datetime] = None
    password: Optional[str] = None
