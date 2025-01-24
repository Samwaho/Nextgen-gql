import strawberry
from typing import Optional, Dict, Any
from datetime import datetime
from enum import Enum

@strawberry.enum
class TransactionStatus(Enum):
    PENDING = "pending"
    COMPLETED = "completed"
    FAILED = "failed"
    CANCELLED = "cancelled"
    TIMEOUT = "timeout"

@strawberry.enum
class TransactionType(Enum):
    C2B = "c2b"
    B2C = "b2c"
    B2B = "b2b"

@strawberry.type
class MpesaTransaction:
    id: str
    agency_id: str
    customer_id: Optional[str] = None
    type: str
    amount: float
    phone: Optional[str] = None
    reference: str
    remarks: Optional[str] = None
    status: str
    mpesa_receipt: Optional[str] = None
    receiver_shortcode: Optional[str] = None
    response_data: Optional[Dict[str, Any]] = None
    created_at: datetime
    completed_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    package_id: Optional[str] = None
    months: Optional[int] = None

@strawberry.input
class TransactionFilter:
    agency_id: Optional[str] = None
    customer_id: Optional[str] = None
    type: Optional[str] = None
    status: Optional[str] = None
    reference: Optional[str] = None
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    phone: Optional[str] = None

@strawberry.input
class CustomerPaymentInput:
    customer_id: str
    package_id: str
    amount: float
    phone: str
    months: int = 1
    remarks: Optional[str] = None 