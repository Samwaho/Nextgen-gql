from cryptography.fernet import Fernet
from base64 import b64encode, b64decode
import os
from typing import Optional

# Get encryption key from environment variable or generate one
ENCRYPTION_KEY = os.getenv('ENCRYPTION_KEY')
if not ENCRYPTION_KEY:
    ENCRYPTION_KEY = Fernet.generate_key()
    print(f"Generated new encryption key: {ENCRYPTION_KEY.decode()}")
    print("Please set this as ENCRYPTION_KEY in your environment variables")

fernet = Fernet(ENCRYPTION_KEY)

def encrypt_value(value: str) -> str:
    """Encrypt a string value."""
    if not value:
        return value
    try:
        return b64encode(fernet.encrypt(value.encode())).decode()
    except Exception as e:
        print(f"Error encrypting value: {str(e)}")
        return value

def decrypt_value(encrypted_value: str) -> Optional[str]:
    """Decrypt an encrypted string value."""
    if not encrypted_value:
        return None
    try:
        return fernet.decrypt(b64decode(encrypted_value)).decode()
    except Exception as e:
        print(f"Error decrypting value: {str(e)}")
        return None

def encrypt_mpesa_credentials(data: dict) -> dict:
    """Encrypt sensitive M-Pesa credentials."""
    sensitive_fields = [
        "mpesa_consumer_key",
        "mpesa_consumer_secret",
        "mpesa_passkey",
        "mpesa_initiator_password"
    ]
    
    for field in sensitive_fields:
        if field in data and data[field]:
            data[field] = encrypt_value(data[field])
    
    return data

def decrypt_mpesa_credentials(data: dict) -> dict:
    """Decrypt sensitive M-Pesa credentials."""
    sensitive_fields = [
        "mpesa_consumer_key",
        "mpesa_consumer_secret",
        "mpesa_passkey",
        "mpesa_initiator_password"
    ]
    
    decrypted_data = data.copy()
    for field in sensitive_fields:
        if field in data and data[field]:
            decrypted_data[field] = decrypt_value(data[field])
    
    return decrypted_data 