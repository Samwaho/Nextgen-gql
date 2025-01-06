from fastapi import FastAPI, HTTPException
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
from app.routes.ticket_routes import Query as TicketQuery, Mutation as TicketMutation
from app.middleware.auth_middleware import get_context
import strawberry
from app.config.settings import settings

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)

logger = logging.getLogger(__name__)

# Create Schema
@strawberry.type
class Query(
    UserQuery, AgencyQuery, EmployeeQuery, CustomerQuery,
    InventoryQuery, PackageQuery, TicketQuery
):
    pass

@strawberry.type
class Mutation(
    UserMutation, AuthMutation, AgencyMutation, EmployeeMutation,
    CustomerMutation, InventoryMutation, PackageMutation, TicketMutation
):
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
    expose_headers=["*"]
)

# Add GraphQL route
graphql_app = GraphQLRouter(schema, context_getter=get_context)
app.include_router(graphql_app, prefix="/graphql")
app.include_router(auth_router)

@app.on_event("startup")
async def startup_db_client():
    try:
        logger.info("Connecting to database...")
        await db.connect_to_database()
        logger.info("Database connection established")
    except Exception as e:
        logger.error(f"Failed to initialize database: {str(e)}")
        raise

@app.on_event("shutdown")
async def shutdown_db_client():
    await db.close_database_connection()
    logger.info("Database connection closed")

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    try:
        if not db.client:
            raise HTTPException(status_code=503, detail="Database not connected")
        await db.client.admin.command('ping')
        return {"status": "healthy", "database": "connected"}
    except Exception as e:
        raise HTTPException(status_code=503, detail=str(e))

@app.get("/")
async def root():
    return {
        "message": "Welcome to ISP Manager API",
        "docs": "/docs",
        "graphql": "/graphql"
    }
