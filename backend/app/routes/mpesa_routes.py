import strawberry
from typing import Optional, Dict, Any, List
from datetime import datetime, timedelta
from bson import ObjectId
from ..config.database import db
from ..utils.decorators import login_required
from ..utils.mpesa import MpesaIntegration
from ..schemas.mpesa_schemas import (
    MpesaTransaction, TransactionFilter, TransactionStatus, 
    TransactionType, CustomerPaymentInput, CommandID, MpesaResponse, B2CPaymentInput, B2BPaymentInput
)
from strawberry.types import Info

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
        agency_id = info.context.user.get("agency")
        if not agency_id:
            raise Exception("Agency ID not found")
            
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
        
        # Get all unique customer IDs
        customer_ids = {ObjectId(t["customer_id"]) for t in transactions_data if t.get("customer_id")}
        
        # Fetch all customers in one query
        customers = {}
        if customer_ids:
            customers_data = await db.get_collection("customers").find({"_id": {"$in": list(customer_ids)}}).to_list(None)
            customers = {str(customer["_id"]): customer for customer in customers_data}
        
        return [
            MpesaTransaction(
                id=str(t["_id"]),
                agency_id=t["agency_id"],
                customer_id=t.get("customer_id"),
                customer_username=customers.get(t.get("customer_id", ""), {}).get("username"),
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
                package_id=t.get("package_id"),
                months=t.get("months"),
                command_id=t.get("command_id"),
                conversation_id=t.get("conversation_id"),
                originator_conversation_id=t.get("originator_conversation_id")
            ) for t in transactions_data
        ]

@strawberry.type
class Mutation:
    @strawberry.mutation
    @login_required
    async def initiate_customer_payment(
        self, info: Info, input: CustomerPaymentInput
    ) -> MpesaResponse:
        """Initiate M-Pesa payment for a customer subscription."""
        agency_id = info.context.user.get("agency")
        if not agency_id:
            return MpesaResponse(
                success=False,
                message="Agency ID not found"
            )
        
        # Get agency M-Pesa integration
        mpesa = await get_agency_mpesa(agency_id)
        if not mpesa:
            return MpesaResponse(
                success=False,
                message="Agency M-Pesa integration not found"
            )
        
        try:
            # Generate unique reference
            reference = f"SUB{datetime.utcnow().strftime('%Y%m%d%H%M%S')}"
            
            # Create transaction record
            transactions = db.get_collection("mpesa_transactions")
            transaction = {
                "agency_id": agency_id,
                "customer_id": input.customer_id,
                "type": TransactionType.C2B.value,
                "amount": input.amount,
                "phone": input.phone,
                "reference": reference,
                "remarks": input.remarks,
                "status": TransactionStatus.PENDING.value,
                "package_id": input.package_id,
                "months": input.months,
                "command_id": CommandID.CUSTOMER_PAYBILL_ONLINE.value,
                "created_at": datetime.utcnow()
            }
            
            result = await transactions.insert_one(transaction)
            
            # Initiate M-Pesa payment
            access_token = await mpesa.get_access_token()
            if not access_token:
                return MpesaResponse(
                    success=False,
                    message="Failed to get M-Pesa access token"
                )
                
            response = await mpesa.initiate_payment(
                phone=input.phone,
                amount=input.amount,
                reference=reference,
                access_token=access_token
            )
            
            if response.get("ResponseCode") == "0":
                return MpesaResponse(
                    success=True,
                    message="Payment initiated successfully",
                    transaction_id=str(result.inserted_id),
                    reference=reference
                )
            else:
                return MpesaResponse(
                    success=False,
                    message=response.get("ResponseDescription", "Payment initiation failed")
                )
                
        except Exception as e:
            return MpesaResponse(
                success=False,
                message=str(e)
            )

    @strawberry.mutation
    @login_required
    async def initiate_b2c_payment(
        self, info: Info, input: B2CPaymentInput
    ) -> MpesaResponse:
        """Initiate Business to Customer (B2C) M-Pesa payment."""
        agency_id = info.context.user.get("agency")
        if not agency_id:
            return MpesaResponse(
                success=False,
                message="Agency ID not found"
            )
        
        # Get agency M-Pesa integration
        mpesa = await get_agency_mpesa(agency_id)
        if not mpesa:
            return MpesaResponse(
                success=False,
                message="Agency M-Pesa integration not found"
            )
        
        try:
            # Create transaction record
            transactions = db.get_collection("mpesa_transactions")
            transaction = {
                "agency_id": agency_id,
                "type": TransactionType.B2C.value,
                "amount": input.amount,
                "phone": input.phone,
                "reference": input.reference,
                "remarks": input.remarks,
                "status": TransactionStatus.PENDING.value,
                "command_id": CommandID.BUSINESS_PAYMENT.value,
                "created_at": datetime.utcnow()
            }
            
            result = await transactions.insert_one(transaction)
            
            # Initiate M-Pesa payment
            access_token = await mpesa.get_access_token()
            if not access_token:
                return MpesaResponse(
                    success=False,
                    message="Failed to get M-Pesa access token"
                )
                
            response = await mpesa.initiate_b2c(
                access_token=access_token,
                amount=input.amount,
                phone=input.phone,
                reference=input.reference,
                remarks=input.remarks
            )
            
            if response.get("ResponseCode") == "0":
                return MpesaResponse(
                    success=True,
                    message="B2C Payment initiated successfully",
                    transaction_id=str(result.inserted_id),
                    reference=input.reference
                )
            else:
                return MpesaResponse(
                    success=False,
                    message=response.get("ResponseDescription", "B2C Payment initiation failed")
                )
                
        except Exception as e:
            return MpesaResponse(
                success=False,
                message=str(e)
            )

    @strawberry.mutation
    @login_required
    async def initiate_b2b_payment(
        self, info: Info, input: B2BPaymentInput
    ) -> MpesaResponse:
        """Initiate Business to Business (B2B) M-Pesa payment."""
        agency_id = info.context.user.get("agency")
        if not agency_id:
            return MpesaResponse(
                success=False,
                message="Agency ID not found"
            )
        
        # Get agency M-Pesa integration
        mpesa = await get_agency_mpesa(agency_id)
        if not mpesa:
            return MpesaResponse(
                success=False,
                message="Agency M-Pesa integration not found"
            )
        
        try:
            # Create transaction record
            transactions = db.get_collection("mpesa_transactions")
            transaction = {
                "agency_id": agency_id,
                "type": TransactionType.B2B.value,
                "amount": input.amount,
                "receiver_shortcode": input.receiver_shortcode,
                "reference": input.reference,
                "remarks": input.remarks,
                "status": TransactionStatus.PENDING.value,
                "command_id": CommandID.BUSINESS_TO_BUSINESS.value,
                "created_at": datetime.utcnow()
            }
            
            result = await transactions.insert_one(transaction)
            
            # Initiate M-Pesa payment
            access_token = await mpesa.get_access_token()
            if not access_token:
                return MpesaResponse(
                    success=False,
                    message="Failed to get M-Pesa access token"
                )
                
            response = await mpesa.initiate_b2b(
                access_token=access_token,
                amount=input.amount,
                receiver_shortcode=input.receiver_shortcode,
                reference=input.reference,
                remarks=input.remarks
            )
            
            if response.get("ResponseCode") == "0":
                return MpesaResponse(
                    success=True,
                    message="B2B Payment initiated successfully",
                    transaction_id=str(result.inserted_id),
                    reference=input.reference
                )
            else:
                return MpesaResponse(
                    success=False,
                    message=response.get("ResponseDescription", "B2B Payment initiation failed")
                )
                
        except Exception as e:
            return MpesaResponse(
                success=False,
                message=str(e)
            ) 