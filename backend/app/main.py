from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config.database import db
import logging
from strawberry.fastapi import GraphQLRouter
from app.routes.user_routes import Query as UserQuery, Mutation as UserMutation
from app.routes.auth_routes import AuthMutation, router as auth_router
from app.routes.agency_routes import Query as AgencyQuery, Mutation as AgencyMutation
from app.routes.employee_routes import Query as EmployeeQuery, Mutation as EmployeeMutation
from app.routes.customer_routes import Query as CustomerQuery, Mutation as CustomerMutation
from app.routes.inventory_routes import Query as InventoryQuery, Mutation as InventoryMutation
from app.routes.package_routes import Query as PackageQuery, Mutation as PackageMutation
from app.middleware.auth_middleware import get_context
from app.middleware.context import CustomContext
import strawberry
from app.config.settings import settings
import sys
from fastapi import HTTPException
import socket

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(sys.stdout),
        logging.FileHandler('app.log')
    ]
)

logger = logging.getLogger(__name__)

# Create Schema
@strawberry.type
class Query(UserQuery, AgencyQuery, EmployeeQuery, CustomerQuery, InventoryQuery, PackageQuery):
    pass

@strawberry.type
class Mutation(UserMutation, AuthMutation, AgencyMutation, EmployeeMutation, CustomerMutation, InventoryMutation, PackageMutation):
    pass

schema = strawberry.Schema(query=Query, mutation=Mutation)

# Create FastAPI app
app = FastAPI(
    title="ISP Manager API",
    description="API for ISP Management System with GraphQL",
    version="1.0.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Add GraphQL route
graphql_app = GraphQLRouter(
    schema,
    context_getter=get_context
)
app.include_router(graphql_app, prefix="/graphql")
app.include_router(auth_router)

@app.on_event("startup")
async def startup_db_client():
    try:
        # Check DNS resolution
        try:
            dns_result = socket.gethostbyname_ex("cluster0.pmmww.mongodb.net")
            logger.info(f"DNS lookup successful: {dns_result[2]}")
        except socket.gaierror as e:
            logger.error(f"DNS lookup failed: {str(e)}")
        
        logger.info("Initializing database connection...")
        await db.connect_to_database()
        logger.info("Application startup complete")
    except Exception as e:
        logger.error("Failed to initialize database")
        logger.debug(f"Detailed error: {str(e)}", exc_info=True)
        logger.warning("Application starting in limited mode without database")

@app.on_event("shutdown")
async def shutdown_db_client():
    logger.info("Shutting down application...")
    await db.close_database_connection()

@app.get("/health")
async def health_check():
    """
    Health check endpoint that verifies database connection
    """
    try:
        if db.client is None:
            raise HTTPException(status_code=503, detail="Database connection not initialized")
        await db.client.admin.command('ping')
        return {"status": "healthy", "database": "connected"}
    except Exception as e:
        raise HTTPException(status_code=503, detail=f"Database health check failed: {str(e)}")

@app.get("/")
async def root():
    return {
        "message": "Welcome to ISP Manager API",
        "documentation": {
            "graphql_playground": "/graphql",
            "openapi": "/docs",
            "redoc": "/redoc"
        },
        "endpoints": {
            "users": "/users",
            "agencies": "/agencies",
            "health": "/health"
        }
    }
