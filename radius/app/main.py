from fastapi import FastAPI, HTTPException
from .config.database import db
import logging
from .routes import radius_routes
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI(title="Radius API")

# Database connection events
@app.on_event("startup")
async def startup_db_client():
    """Initialize database connection"""
    try:
        await db.connect_to_database()
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
        await db.verify_connection()
        return {"status": "healthy", "database": "connected"}
    except Exception as e:
        logger.error(f"Health check failed: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Database connection failed: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=9000, reload=True)
