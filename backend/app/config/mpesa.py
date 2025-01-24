from pydantic_settings import BaseSettings
from functools import lru_cache

class MpesaSettings(BaseSettings):
    BASE_URL: str = "https://your-domain.com"  # Replace with your actual domain
    CALLBACK_BASE_URL: str = f"{BASE_URL}/api/mpesa"
    
    def get_callback_url(self, endpoint: str) -> str:
        """Get full callback URL for M-Pesa endpoints."""
        return f"{self.CALLBACK_BASE_URL}/{endpoint}"
    
    def get_confirmation_url(self) -> str:
        """Get confirmation URL."""
        return self.get_callback_url("confirmation")
    
    def get_validation_url(self) -> str:
        """Get validation URL."""
        return self.get_callback_url("validation")
    
    def get_timeout_url(self) -> str:
        """Get timeout URL."""
        return self.get_callback_url("timeout")
    
    def get_result_url(self) -> str:
        """Get result URL."""
        return self.get_callback_url("result")

    class Config:
        env_prefix = "MPESA_"

@lru_cache()
def get_mpesa_settings() -> MpesaSettings:
    return MpesaSettings() 