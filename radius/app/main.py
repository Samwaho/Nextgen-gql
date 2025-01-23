from fastapi import FastAPI, HTTPException
from .config.database import db
import logging
from .routes import radius_routes

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
    logger.info("Starting up Radius API")
    await db.connect_to_database()

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
