import strawberry
from typing import Optional, List
from datetime import datetime
from enum import Enum

@strawberry.enum
class MpesaEnvironment(Enum):
    SANDBOX = "sandbox"
    PRODUCTION = "production"

@strawberry.enum
class MpesaTransactionType(Enum):
    C2B = "c2b"
    B2C = "b2c"
    B2B = "b2b"

@strawberry.type
class Agency:
    id: str
    name: str
    address: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    website: Optional[str] = None
    logo: Optional[str] = None
    banner: Optional[str] = None
    description: Optional[str] = None
    mpesa_shortcode: Optional[str] = None
    mpesa_env: Optional[str] = None
    mpesa_b2c_shortcode: Optional[str] = None
    mpesa_b2b_shortcode: Optional[str] = None
    mpesa_initiator_name: Optional[str] = None
    mpesa_transaction_types: Optional[List[str]] = None
    mpesa_callback_url: Optional[str] = None
    mpesa_timeout_url: Optional[str] = None
    mpesa_result_url: Optional[str] = None
    created_at: datetime
    updated_at: Optional[datetime] = None
    # Sensitive fields excluded from type
    # mpesa_consumer_key, mpesa_consumer_secret, mpesa_passkey, mpesa_initiator_password

@strawberry.input
class AgencyInput:
    name: str
    address: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    website: Optional[str] = None
    logo: Optional[str] = None
    banner: Optional[str] = None
    description: Optional[str] = None
    mpesa_consumer_key: Optional[str] = None
    mpesa_consumer_secret: Optional[str] = None
    mpesa_shortcode: Optional[str] = None
    mpesa_passkey: Optional[str] = None
    mpesa_env: Optional[str] = None
    mpesa_b2c_shortcode: Optional[str] = None
    mpesa_b2b_shortcode: Optional[str] = None
    mpesa_initiator_name: Optional[str] = None
    mpesa_initiator_password: Optional[str] = None
    mpesa_transaction_types: Optional[List[str]] = None
    mpesa_callback_url: Optional[str] = None
    mpesa_timeout_url: Optional[str] = None
    mpesa_result_url: Optional[str] = None

@strawberry.input
class AgencyUpdateInput:
    name: Optional[str] = None
    address: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    website: Optional[str] = None
    logo: Optional[str] = None
    banner: Optional[str] = None
    description: Optional[str] = None
    mpesa_consumer_key: Optional[str] = None
    mpesa_consumer_secret: Optional[str] = None
    mpesa_shortcode: Optional[str] = None
    mpesa_passkey: Optional[str] = None
    mpesa_env: Optional[str] = None
    mpesa_b2c_shortcode: Optional[str] = None
    mpesa_b2b_shortcode: Optional[str] = None
    mpesa_initiator_name: Optional[str] = None
    mpesa_initiator_password: Optional[str] = None
    mpesa_transaction_types: Optional[List[str]] = None
    mpesa_callback_url: Optional[str] = None
    mpesa_timeout_url: Optional[str] = None
    mpesa_result_url: Optional[str] = None
