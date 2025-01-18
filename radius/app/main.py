from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import strawberry
from strawberry.fastapi import GraphQLRouter
import logging
from .db import database, check_connection
from .graphql.schema import schema

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Create FastAPI app
app = FastAPI(title="FreeRADIUS GraphQL API")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create GraphQL router
graphql_app = GraphQLRouter(schema)

# Include GraphQL router
app.include_router(graphql_app, prefix="/graphql")

@app.on_event("startup")
async def startup():
    logger.info("Starting up application...")
    try:
        await database.connect()
        logger.info("Successfully connected to database")
    except Exception as e:
        logger.error(f"Failed to connect to database: {str(e)}")
        raise

@app.on_event("shutdown")
async def shutdown():
    logger.info("Shutting down application...")
    try:
        await database.disconnect()
        logger.info("Successfully disconnected from database")
    except Exception as e:
        logger.error(f"Error disconnecting from database: {str(e)}")

# Root endpoint
@app.get("/")
async def root():
    # Check database connection
    is_connected = await check_connection()
    return {
        "message": "FreeRADIUS GraphQL API is running",
        "database_connected": is_connected,
        "endpoints": {
            "graphql": "/graphql",
            "graphiql": "/graphql"
        }
    }
