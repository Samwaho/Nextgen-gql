import databases
import sqlalchemy
import logging
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(level=os.getenv('LOG_LEVEL', 'INFO'))
logger = logging.getLogger(__name__)

# Database configuration
DATABASE_URL = f"mysql+pymysql://{os.getenv('DB_USER')}:{os.getenv('DB_PASSWORD')}@{os.getenv('DB_HOST')}/{os.getenv('DB_NAME')}?charset=utf8mb4"
logger.info(f"Initializing database connection to: {os.getenv('DB_HOST')}")

database = databases.Database(
    DATABASE_URL,
    ssl=False,  # Disable SSL for now - enable if SSL is configured on the server
    min_size=5,
    max_size=20
)
metadata = sqlalchemy.MetaData()

# Add connection status check
async def check_connection():
    try:
        await database.connect()
        logger.info("Successfully connected to database")
        return True
    except Exception as e:
        logger.error(f"Failed to connect to database: {str(e)}")
        return False 