from pydantic_settings import BaseSettings
import os
from typing import Optional
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

class Settings(BaseSettings):
    # MongoDB Settings
    MONGODB_URL: str = os.getenv("MONGODB_URL", "mongodb://localhost:27017")
    DATABASE_NAME: str = os.getenv("DATABASE_NAME", "isp_manager")
    
    # Security
    SECRET_KEY: str = os.getenv("SECRET_KEY")
    if not SECRET_KEY:
        raise ValueError("SECRET_KEY environment variable is not set")
    
    ALGORITHM: str = os.getenv("ALGORITHM", "HS256")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "30"))
    
    # API URLs
    RADIUS_API_URL: str = os.getenv("RADIUS_API_URL", "http://localhost:9000/graphql")
    ROUTEROS_API_URL: str = os.getenv("ROUTEROS_API_URL", "http://localhost/routeros")
    FRONTEND_URL: str = os.getenv("FRONTEND_URL", "http://localhost")
    
    # MikroTik Settings
    MIKROTIK_HOST: str = os.getenv("MIKROTIK_HOST", "")
    MIKROTIK_API_USER: str = os.getenv("MIKROTIK_API_USER", "")
    MIKROTIK_API_PASSWORD: str = os.getenv("MIKROTIK_API_PASSWORD", "")
    
    # Email Settings (Optional)
    MAIL_USERNAME: Optional[str] = os.getenv("MAIL_USERNAME")
    MAIL_PASSWORD: Optional[str] = os.getenv("MAIL_PASSWORD")
    MAIL_FROM: Optional[str] = os.getenv("MAIL_FROM")
    MAIL_PORT: int = int(os.getenv("MAIL_PORT", "587"))
    MAIL_SERVER: Optional[str] = os.getenv("MAIL_SERVER")
    MAIL_TLS: bool = os.getenv("MAIL_TLS", "True").lower() == "true"
    MAIL_SSL: bool = os.getenv("MAIL_SSL", "False").lower() == "true"
    
    # Gmail Settings
    GMAIL_USERNAME: Optional[str] = os.getenv("GMAIL_USERNAME")
    GMAIL_APP_PASSWORD: Optional[str] = os.getenv("GMAIL_APP_PASSWORD")
    
    # Google OAuth Settings
    GOOGLE_CLIENT_ID: Optional[str] = os.getenv("GOOGLE_CLIENT_ID")
    GOOGLE_CLIENT_SECRET: Optional[str] = os.getenv("GOOGLE_CLIENT_SECRET")
    
    # Security
    ENCRYPTION_KEY: Optional[str] = os.getenv("ENCRYPTION_KEY")
    
    # File Upload Settings
    UPLOAD_DIR: str = os.getenv("UPLOAD_DIR", "uploads")
    MAX_FILE_SIZE: int = int(os.getenv("MAX_FILE_SIZE", "5242880"))  # 5MB default
    
    # CORS Settings
    CORS_ORIGINS: list[str] = [
        "http://localhost:3000",
        "https://6b2bk651-80.uks1.devtunnels.ms"
    ]
    
    # API and Frontend URLs with ports
    API_URL: str = os.getenv("API_URL", "http://localhost:8000")
    FRONTEND_URL: str = os.getenv("FRONTEND_URL", "http://localhost:3000")
    
    # Google OAuth Settings
    GOOGLE_CLIENT_ID: str = os.getenv("GOOGLE_CLIENT_ID", "")
    GOOGLE_CLIENT_SECRET: str = os.getenv("GOOGLE_CLIENT_SECRET", "")
    
    class Config:
        env_file = ".env"
        case_sensitive = True
        extra = "allow"

    def validate_required_settings(self):
        """Validate that all required settings are present"""
        required_settings = {
            "SECRET_KEY": self.SECRET_KEY,
            "MONGODB_URL": self.MONGODB_URL,
            "DATABASE_NAME": self.DATABASE_NAME,
        }
        
        missing_settings = [key for key, value in required_settings.items() if not value]
        
        if missing_settings:
            raise ValueError(
                f"Missing required environment variables: {', '.join(missing_settings)}"
            )

settings = Settings()
settings.validate_required_settings()
