from fastapi import FastAPI, HTTPException
from .config.database import db
import logging
from .routes import radius_routes
from pymongo import ASCENDING, DESCENDING

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
        db_instance = db.get_database()
        
        # Create accounting collection with indexes
        await db_instance.create_collection("accounting")
        # Primary indexes for agency-based queries
        await db_instance.accounting.create_index([
            ("agency", ASCENDING),
            ("timestamp", DESCENDING)
        ])
        await db_instance.accounting.create_index([
            ("agency", ASCENDING),
            ("username", ASCENDING)
        ])
        await db_instance.accounting.create_index([
            ("agency", ASCENDING),
            ("customer_id", ASCENDING)
        ])
        # Secondary indexes for specific queries
        await db_instance.accounting.create_index([("session_id", ASCENDING)])
        await db_instance.accounting.create_index([("status", ASCENDING)])
        await db_instance.accounting.create_index([
            ("agency", ASCENDING),
            ("username", ASCENDING),
            ("timestamp", DESCENDING)
        ])
        logger.info("Created accounting collection and indexes")
        
        # Create post_auth collection with indexes
        await db_instance.create_collection("post_auth")
        # Primary indexes for agency-based queries
        await db_instance.post_auth.create_index([
            ("agency", ASCENDING),
            ("timestamp", DESCENDING)
        ])
        await db_instance.post_auth.create_index([
            ("agency", ASCENDING),
            ("username", ASCENDING)
        ])
        # Secondary indexes for specific queries
        await db_instance.post_auth.create_index([("called_station_id", ASCENDING)])
        await db_instance.post_auth.create_index([
            ("agency", ASCENDING),
            ("username", ASCENDING),
            ("timestamp", DESCENDING)
        ])
        logger.info("Created post_auth collection and indexes")
        
    except Exception as e:
        # Collection might already exist - that's okay
        if not "already exists" in str(e):
            logger.error(f"Error creating collections: {str(e)}")
            raise

# Database connection events
@app.on_event("startup")
async def startup_db_client():
    logger.info("Starting up Radius API")
    await db.connect_to_database()
    await create_collections_and_indexes()

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
