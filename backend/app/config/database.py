from motor.motor_asyncio import AsyncIOMotorClient
from ..config.settings import settings
from typing import Optional
import logging
import asyncio
from pymongo.errors import ConnectionFailure, ConfigurationError, ServerSelectionTimeoutError

logger = logging.getLogger(__name__)

class Database:
    client: Optional[AsyncIOMotorClient] = None
    MAX_RETRIES = 3
    RETRY_DELAY = 5  # seconds
    
    @classmethod
    async def connect_to_database(cls):
        retries = 0
        while retries < cls.MAX_RETRIES:
            try:
                if retries > 0:
                    logger.info(f"Retrying connection (Attempt {retries + 1}/{cls.MAX_RETRIES})")
                
                cls.client = AsyncIOMotorClient(
                    settings.MONGODB_URL,
                    serverSelectionTimeoutMS=5000,
                    connectTimeoutMS=5000,
                    retryWrites=True
                )
                # Ping the database to verify the connection
                await cls.client.admin.command('ping')
                if retries > 0:
                    logger.info("Successfully reconnected to MongoDB")
                return
            except (ConnectionFailure, ConfigurationError, ServerSelectionTimeoutError) as e:
                retries += 1
                if retries < cls.MAX_RETRIES:
                    logger.warning(f"Connection attempt failed: {str(e)}")
                    logger.info(f"Waiting {cls.RETRY_DELAY} seconds before retry...")
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
            try:
                cls.client.close()
                cls.client = None
            except Exception as e:
                logger.error(f"Error closing database connection: {str(e)}")
                raise

    @classmethod
    def get_database(cls):
        """
        Get database instance
        """
        if cls.client is None:
            raise ConnectionError("Database client not initialized")
        return cls.client[settings.DATABASE_NAME]

    @classmethod
    def get_collection(cls, collection_name: str):
        """
        Get collection from database
        """
        return cls.get_database()[collection_name]

# Database instance
db = Database()
