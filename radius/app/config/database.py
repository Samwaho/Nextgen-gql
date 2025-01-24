from motor.motor_asyncio import AsyncIOMotorClient
from typing import Optional
import logging
import asyncio
from pymongo.errors import ConnectionFailure, ConfigurationError, ServerSelectionTimeoutError
import os
from dotenv import load_dotenv
from pymongo import ASCENDING, DESCENDING

# Load environment variables
load_dotenv()

logger = logging.getLogger(__name__)

class Database:
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
                
                # Initialize collections and indexes
                await cls.create_collections_and_indexes()
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
    async def create_collections_and_indexes(cls):
        """Create collections and indexes if they don't exist"""
        db = cls.get_database()
        try:
            # Create accounting collection with unique username index
            await db.create_collection("accounting")
            await db.accounting.create_index([("username", ASCENDING)], unique=True)
            
            # Create indexes for efficient querying
            await db.accounting.create_index([
                ("agency", ASCENDING),
                ("last_update", DESCENDING)
            ])
            
            logger.info("Created accounting collection and indexes")
        except Exception as e:
            if "already exists" not in str(e):
                logger.error(f"Error creating accounting collection: {e}")
                
        try:
            # Create post_auth collection with indexes
            await db.create_collection("post_auth")
            await db.post_auth.create_index([
                ("agency", ASCENDING),
                ("timestamp", DESCENDING)
            ])
            await db.post_auth.create_index([
                ("agency", ASCENDING),
                ("username", ASCENDING)
            ])
            logger.info("Created post_auth collection and indexes")
        except Exception as e:
            if "already exists" not in str(e):
                logger.error(f"Error creating post_auth collection: {e}")

    @classmethod
    async def verify_connection(cls):
        """Verify database connection is healthy"""
        db = cls.get_database()
        await db.command("ping")
        return True

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
        return cls.client[os.getenv("DATABASE_NAME", "isp_manager")]

    @classmethod
    def get_collection(cls, collection_name: str):
        """Get collection from database"""
        return cls.get_database()[collection_name]

# Database instance
db = Database() 