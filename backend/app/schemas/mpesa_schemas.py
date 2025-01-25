import strawberry
from typing import Optional, Dict, Any, List
from datetime import datetime
from enum import Enum

@strawberry.enum
class TransactionStatus(Enum):
    PENDING = "pending"
    COMPLETED = "completed"
    FAILED = "failed"
    CANCELLED = "cancelled"
    TIMEOUT = "timeout"
    VALIDATED = "validated"
    INVALIDATED = "invalidated"

@strawberry.enum
class TransactionType(Enum):
    C2B = "c2b"  # Customer to Business
    B2C = "b2c"  # Business to Customer
    B2B = "b2b"  # Business to Business
    BALANCE = "balance"  # Account Balance Query

@strawberry.enum
class CommandID(Enum):
    CUSTOMER_PAYBILL_ONLINE = "CustomerPayBillOnline"
    BUSINESS_PAYMENT = "BusinessPayment"
    BUSINESS_TO_BUSINESS = "BusinessToBusinessPayment"
    ACCOUNT_BALANCE = "AccountBalance"

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
    command_id: Optional[str] = None
    conversation_id: Optional[str] = None
    originator_conversation_id: Optional[str] = None

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
    mpesa_receipt: Optional[str] = None

@strawberry.input
class CustomerPaymentInput:
    customer_id: str
    package_id: str
    amount: float
    phone: str
    months: int = 1
    remarks: Optional[str] = None

@strawberry.type
class MpesaCallback:
    """Base type for M-Pesa callbacks"""
    ResultCode: int
    ResultDesc: str
    TransactionType: Optional[str] = None
    TransID: Optional[str] = None
    TransTime: Optional[str] = None
    BusinessShortCode: str
    BillRefNumber: Optional[str] = None
    InvoiceNumber: Optional[str] = None
    OrgAccountBalance: Optional[str] = None
    ThirdPartyTransID: Optional[str] = None
    MSISDN: Optional[str] = None
    FirstName: Optional[str] = None
    MiddleName: Optional[str] = None
    LastName: Optional[str] = None
    TransAmount: Optional[float] = None
    CommandID: Optional[str] = None
    ConversationID: Optional[str] = None
    OriginatorConversationID: Optional[str] = None 