from motor.motor_asyncio import AsyncIOMotorClient
from typing import Optional
import logging
import asyncio
from pymongo.errors import ConnectionFailure, ConfigurationError, ServerSelectionTimeoutError
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

logger = logging.getLogger(__name__)

class RadiusDatabase:
    client: Optional[AsyncIOMotorClient] = None
    MAX_RETRIES = 3
    RETRY_DELAY = 2  # seconds
    
    @classmethod
    async def connect_to_database(cls):
        retries = 0
        while retries < cls.MAX_RETRIES:
            try:
                if retries > 0:
                    logger.info(f"Retrying connection (Attempt {retries + 1}/{cls.MAX_RETRIES})")
                
                # Use the same MongoDB URL as the main backend
                mongodb_url = os.getenv("MONGODB_URL", "mongodb://localhost:27017")
                database_name = os.getenv("DATABASE_NAME", "nextgn_db")
                
                cls.client = AsyncIOMotorClient(
                    mongodb_url,
                    serverSelectionTimeoutMS=5000,
                    connectTimeoutMS=5000,
                    maxPoolSize=10,
                    retryWrites=True,
                    retryReads=True
                )
                
                # Verify connection
                await cls.client.admin.command('ping')
                logger.info("Successfully connected to MongoDB")
                return
                
            except (ConnectionFailure, ConfigurationError, ServerSelectionTimeoutError) as e:
                retries += 1
                if retries < cls.MAX_RETRIES:
                    logger.warning(f"Connection attempt failed: {str(e)}")
                    await asyncio.sleep(cls.RETRY_DELAY)
                else:
                    logger.error("Max retries reached. Could not establish database connection")
                    raise
            except Exception as e:
                logger.error(f"Unexpected database error: {str(e)}")
                raise

    @classmethod
    async def close_database_connection(cls):
        if cls.client is not None:
            cls.client.close()
            cls.client = None

    @classmethod
    def get_database(cls):
        """Get database instance"""
        if cls.client is None:
            raise ConnectionError("Database client not initialized")
        return cls.client[os.getenv("DATABASE_NAME", "nextgn_db")]

# Database instance
radius_db = RadiusDatabase() 