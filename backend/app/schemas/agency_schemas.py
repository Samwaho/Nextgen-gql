import strawberry
from typing import Optional
from datetime import datetime

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
    created_at: datetime
    updated_at: Optional[datetime] = None
    # Sensitive fields excluded from type
    # mpesa_consumer_key, mpesa_consumer_secret, mpesa_passkey

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
