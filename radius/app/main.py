from fastapi import FastAPI, HTTPException
from .config.database import radius_db
import logging
from .routes import radius_routes

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI(title="Radius API")

# Database connection events
@app.on_event("startup")
async def startup_db_client():
    await radius_db.connect_to_database()

@app.on_event("shutdown")
async def shutdown_db_client():
    await radius_db.close_database_connection()

# Include RADIUS routes
app.include_router(radius_routes.router)

# Root endpoint
@app.get("/")
async def root():
    return {"message": "Welcome to Radius API"}

# Health check endpoint
@app.get("/health")
async def health_check():
    try:
        # Verify database connection
        db = radius_db.get_database()
        await db.command("ping")
        return {"status": "healthy", "database": "connected"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database connection failed: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
