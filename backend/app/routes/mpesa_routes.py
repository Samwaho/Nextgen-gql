import strawberry
from typing import Optional, Dict, Any, List
from datetime import datetime, timedelta
from bson import ObjectId
from ..config.database import db
from ..utils.decorators import login_required
from ..utils.mpesa import MpesaIntegration
from ..schemas.mpesa_schemas import (
    MpesaTransaction, TransactionFilter, TransactionStatus, 
    TransactionType, CustomerPaymentInput, CommandID
)
from strawberry.types import Info

# Types
@strawberry.type
class MpesaResponse:
    success: bool
    message: str
    transaction_id: Optional[str] = None
    reference: Optional[str] = None

@strawberry.input
class MpesaTransactionInput:
    amount: float
    phone: str
    reference: str
    remarks: Optional[str] = None
    receiver_shortcode: Optional[str] = None  # For B2B transactions

# Database Helper Functions
async def get_agency_mpesa(agency_id: str) -> Optional[MpesaIntegration]:
    """Get M-Pesa integration instance for an agency."""
    collection = db.get_collection("agencies")
    agency = await collection.find_one({"_id": ObjectId(agency_id)})
    if agency:
        return MpesaIntegration(agency)
    return None

async def get_agency_by_shortcode(shortcode: str) -> Dict[str, Any]:
    """Find agency by M-Pesa shortcode."""
    agencies = db.get_collection("agencies")
    agency = await agencies.find_one({
        "$or": [
            {"mpesa_shortcode": shortcode},
            {"mpesa_b2c_shortcode": shortcode},
            {"mpesa_b2b_shortcode": shortcode}
        ]
    })
    if not agency:
        return None
    return agency

async def find_transaction(reference: str, shortcode: str) -> Dict[str, Any]:
    """Find a transaction by reference and shortcode."""
    transactions = db.get_collection("mpesa_transactions")
    return await transactions.find_one({
        "reference": reference,
        "status": TransactionStatus.PENDING.value
    })

async def update_transaction_status(
    transaction_id: str,
    status: TransactionStatus,
    mpesa_data: Dict[str, Any]
) -> None:
    """Update transaction status and M-Pesa response data."""
    transactions = db.get_collection("mpesa_transactions")
    update_data = {
        "status": status.value,
        "updated_at": datetime.utcnow(),
        "response_data": mpesa_data
    }
    
    if status == TransactionStatus.COMPLETED:
        update_data["completed_at"] = datetime.utcnow()
        update_data["mpesa_receipt"] = mpesa_data.get("TransID")
    
    await transactions.update_one(
        {"_id": ObjectId(transaction_id)},
        {"$set": update_data}
    )

async def update_customer_subscription(
    customer_id: str,
    package_id: str,
    months: int = 1
) -> None:
    """Update customer subscription after successful payment."""
    customers = db.get_collection("customers")
    now = datetime.utcnow()
    
    # Get current customer data
    customer = await customers.find_one({"_id": ObjectId(customer_id)})
    if not customer:
        return
    
    # Calculate new expiry date
    current_expiry = customer.get("expiry")
    if current_expiry and current_expiry > now:
        new_expiry = current_expiry + timedelta(days=30 * months)
    else:
        new_expiry = now + timedelta(days=30 * months)
    
    # Update customer subscription
    await customers.update_one(
        {"_id": ObjectId(customer_id)},
        {
            "$set": {
                "package": package_id,
                "expiry": new_expiry,
                "status": "active",
                "updated_at": now
            }
        }
    )

# Callback Handlers
async def process_mpesa_callback(
    data: Dict[str, Any],
    status: TransactionStatus
) -> Dict[str, Any]:
    """Generic handler for M-Pesa callbacks."""
    try:
        # Get the business shortcode and reference
        shortcode = data.get("BusinessShortCode")
        reference = data.get("BillRefNumber")
        
        if not shortcode or not reference:
            return {
                "ResultCode": 1,
                "ResultDesc": "Missing required fields"
            }
        
        # Find the transaction
        transaction = await find_transaction(reference, shortcode)
        if not transaction:
            return {
                "ResultCode": 1,
                "ResultDesc": "Transaction not found"
            }
        
        # Update transaction status
        await update_transaction_status(
            str(transaction["_id"]),
            status,
            data
        )
        
        # For completed transactions, update customer subscription if applicable
        if (status == TransactionStatus.COMPLETED and 
            transaction.get("customer_id") and 
            transaction.get("package_id")):
            await update_customer_subscription(
                transaction["customer_id"],
                transaction["package_id"],
                transaction.get("months", 1)
            )
        
        return {
            "ResultCode": 0,
            "ResultDesc": "Success"
        }
    except Exception as e:
        return {
            "ResultCode": 1,
            "ResultDesc": str(e)
        }

async def handle_confirmation(data: Dict[str, Any]) -> Dict[str, Any]:
    """Handle M-Pesa confirmation callback."""
    return await process_mpesa_callback(data, TransactionStatus.COMPLETED)

async def handle_validation(data: Dict[str, Any]) -> Dict[str, Any]:
    """Handle M-Pesa validation callback."""
    return await process_mpesa_callback(data, TransactionStatus.VALIDATED)

async def handle_timeout(data: Dict[str, Any]) -> Dict[str, Any]:
    """Handle M-Pesa timeout callback."""
    return await process_mpesa_callback(data, TransactionStatus.TIMEOUT)

# GraphQL Queries and Mutations
@strawberry.type
class Query:
    @strawberry.field
    @login_required
    async def mpesa_transactions(
        self, info: Info, filter: Optional[TransactionFilter] = None
    ) -> List[MpesaTransaction]:
        """Get M-Pesa transactions for the agency."""
        agency_id = info.context.agency_id
        if filter is None:
            filter = TransactionFilter(agency_id=agency_id)
        else:
            filter.agency_id = agency_id
            
        transactions = db.get_collection("mpesa_transactions")
        query = {}
        
        if filter.agency_id:
            query["agency_id"] = filter.agency_id
        if filter.type:
            query["type"] = filter.type
        if filter.status:
            query["status"] = filter.status
        if filter.reference:
            query["reference"] = filter.reference
        if filter.phone:
            query["phone"] = filter.phone
        if filter.mpesa_receipt:
            query["mpesa_receipt"] = filter.mpesa_receipt
        
        # Date range filter
        date_query = {}
        if filter.start_date:
            date_query["$gte"] = filter.start_date
        if filter.end_date:
            date_query["$lte"] = filter.end_date
        if date_query:
            query["created_at"] = date_query
        
        cursor = transactions.find(query).sort("created_at", -1)
        transactions_data = await cursor.to_list(None)
        
        return [
            MpesaTransaction(
                id=str(t["_id"]),
                agency_id=t["agency_id"],
                type=t["type"],
                amount=t["amount"],
                phone=t.get("phone"),
                reference=t["reference"],
                remarks=t.get("remarks"),
                status=t["status"],
                mpesa_receipt=t.get("mpesa_receipt"),
                receiver_shortcode=t.get("receiver_shortcode"),
                response_data=t.get("response_data"),
                created_at=t["created_at"],
                completed_at=t.get("completed_at"),
                updated_at=t.get("updated_at"),
                customer_id=t.get("customer_id"),
                package_id=t.get("package_id"),
                months=t.get("months"),
                command_id=t.get("command_id"),
                conversation_id=t.get("conversation_id"),
                originator_conversation_id=t.get("originator_conversation_id")
            ) for t in transactions_data
        ] 