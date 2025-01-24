from fastapi import FastAPI, HTTPException
from .config.database import db
import logging
from .routes import radius_routes
from pymongo import ASCENDING, DESCENDING
from motor.motor_asyncio import AsyncIOMotorClient
from .config import settings

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI(title="Radius API")

async def create_collections_and_indexes():
    """Create collections and indexes if they don't exist"""
    try:
        # Create accounting collection with unique index
        await db.create_collection("accounting")
        await db.accounting.create_index([
            ("username", ASCENDING),
            ("session_id", ASCENDING),
            ("status", ASCENDING),
            ("timestamp", DESCENDING)
        ], unique=True)
        
        # Create indexes for efficient querying
        await db.accounting.create_index([
            ("agency", ASCENDING),
            ("timestamp", DESCENDING)
        ])
        await db.accounting.create_index([
            ("agency", ASCENDING),
            ("username", ASCENDING)
        ])
        await db.accounting.create_index([
            ("agency", ASCENDING),
            ("customer_id", ASCENDING)
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

# Database connection events
@app.on_event("startup")
async def startup_db_client():
    """Initialize database connection and create collections"""
    try:
        app.mongodb_client = AsyncIOMotorClient(settings.DB_URL)
        app.mongodb = app.mongodb_client[settings.DB_NAME]
        
        # Create collections and indexes
        await create_collections_and_indexes()
        
        logger.info("Connected to MongoDB")
    except Exception as e:
        logger.error(f"Failed to connect to MongoDB: {e}")
        raise e

@app.on_event("shutdown")
async def shutdown_db_client():
    logger.info("Shutting down Radius API")
    await db.close_database_connection()

# Include RADIUS routes
app.include_router(radius_routes.router)

# Health check endpoint
@app.get("/health")
async def health_check():
    try:
        # Verify database connection
        db_instance = db.get_database()
        await db_instance.command("ping")
        return {"status": "healthy", "database": "connected"}
    except Exception as e:
        logger.error(f"Health check failed: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Database connection failed: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=9000, reload=True)
