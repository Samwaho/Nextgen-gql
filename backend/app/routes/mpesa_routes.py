import strawberry
from typing import Optional, Dict, Any, List
from datetime import datetime, timedelta
from bson import ObjectId
from ..config.database import db
from ..utils.decorators import login_required
from ..utils.mpesa import MpesaIntegration
from ..schemas.mpesa_schemas import (
    MpesaTransaction, TransactionFilter, TransactionStatus, 
    TransactionType, CustomerPaymentInput
)
from strawberry.types import Info

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

async def get_agency_mpesa(agency_id: str) -> Optional[MpesaIntegration]:
    collection = db.get_collection("agencies")
    agency = await collection.find_one({"_id": ObjectId(agency_id)})
    if agency:
        return MpesaIntegration(agency)
    return None

async def save_transaction(
    agency_id: str,
    transaction_type: str,
    amount: float,
    reference: str,
    phone: Optional[str] = None,
    remarks: Optional[str] = None,
    receiver_shortcode: Optional[str] = None,
    customer_id: Optional[str] = None,
    package_id: Optional[str] = None,
    months: Optional[int] = None
) -> str:
    """Save a new M-Pesa transaction to the database."""
    transactions = db.get_collection("mpesa_transactions")
    now = datetime.utcnow()
    
    transaction_data = {
        "agency_id": agency_id,
        "type": transaction_type,
        "amount": amount,
        "reference": reference,
        "status": TransactionStatus.PENDING.value,
        "created_at": now,
        "updated_at": now
    }
    
    if phone:
        transaction_data["phone"] = phone
    if remarks:
        transaction_data["remarks"] = remarks
    if receiver_shortcode:
        transaction_data["receiver_shortcode"] = receiver_shortcode
    if customer_id:
        transaction_data["customer_id"] = customer_id
    if package_id:
        transaction_data["package_id"] = package_id
    if months:
        transaction_data["months"] = months
        
    result = await transactions.insert_one(transaction_data)
    return str(result.inserted_id)

async def get_transactions(filter_params: TransactionFilter) -> List[MpesaTransaction]:
    """Get M-Pesa transactions based on filter parameters."""
    transactions = db.get_collection("mpesa_transactions")
    query = {}
    
    if filter_params.agency_id:
        query["agency_id"] = filter_params.agency_id
    if filter_params.type:
        query["type"] = filter_params.type
    if filter_params.status:
        query["status"] = filter_params.status
    if filter_params.reference:
        query["reference"] = filter_params.reference
    if filter_params.phone:
        query["phone"] = filter_params.phone
    
    # Date range filter
    date_query = {}
    if filter_params.start_date:
        date_query["$gte"] = filter_params.start_date
    if filter_params.end_date:
        date_query["$lte"] = filter_params.end_date
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
            updated_at=t.get("updated_at")
        ) for t in transactions_data
    ]

@strawberry.type
class Query:
    @strawberry.field
    @login_required
    async def mpesa_balance(self, info: Info) -> MpesaResponse:
        agency_id = info.context.agency_id
        mpesa = await get_agency_mpesa(agency_id)
        if not mpesa:
            return MpesaResponse(success=False, message="Agency not found")
        
        access_token = await mpesa.get_access_token()
        if not access_token:
            return MpesaResponse(success=False, message="Failed to get access token")
        
        result = await mpesa.check_balance(access_token)
        if "error" in result:
            return MpesaResponse(success=False, message=str(result["error"]))
            
        return MpesaResponse(success=True, message="Balance retrieved successfully")

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
        return await get_transactions(filter)

@strawberry.type
class Mutation:
    @strawberry.mutation
    @login_required
    async def initiate_c2b_payment(
        self, info: Info, transaction: MpesaTransactionInput
    ) -> MpesaResponse:
        agency_id = info.context.agency_id
        mpesa = await get_agency_mpesa(agency_id)
        if not mpesa:
            return MpesaResponse(success=False, message="Agency not found")
        
        access_token = await mpesa.get_access_token()
        if not access_token:
            return MpesaResponse(success=False, message="Failed to get access token")
        
        # Save transaction first
        transaction_id = await save_transaction(
            agency_id=agency_id,
            transaction_type=TransactionType.C2B.value,
            amount=transaction.amount,
            phone=transaction.phone,
            reference=transaction.reference
        )
        
        result = await mpesa.initiate_c2b(
            access_token,
            transaction.amount,
            transaction.phone,
            transaction.reference
        )
        
        if "error" in result:
            # Update transaction status to failed
            transactions = db.get_collection("mpesa_transactions")
            await transactions.update_one(
                {"_id": ObjectId(transaction_id)},
                {
                    "$set": {
                        "status": TransactionStatus.FAILED.value,
                        "response_data": result,
                        "updated_at": datetime.utcnow()
                    }
                }
            )
            return MpesaResponse(
                success=False,
                message=str(result["error"]),
                reference=transaction.reference
            )
        
        return MpesaResponse(
            success=True,
            message="Payment initiated successfully",
            transaction_id=transaction_id,
            reference=transaction.reference
        )

    @strawberry.mutation
    @login_required
    async def initiate_b2c_payment(
        self, info: Info, transaction: MpesaTransactionInput
    ) -> MpesaResponse:
        agency_id = info.context.agency_id
        mpesa = await get_agency_mpesa(agency_id)
        if not mpesa:
            return MpesaResponse(success=False, message="Agency not found")
        
        access_token = await mpesa.get_access_token()
        if not access_token:
            return MpesaResponse(success=False, message="Failed to get access token")
        
        # Save transaction first
        transaction_id = await save_transaction(
            agency_id=agency_id,
            transaction_type=TransactionType.B2C.value,
            amount=transaction.amount,
            phone=transaction.phone,
            reference=transaction.reference,
            remarks=transaction.remarks
        )
        
        result = await mpesa.initiate_b2c(
            access_token,
            transaction.amount,
            transaction.phone,
            transaction.reference,
            transaction.remarks or "B2C Payment"
        )
        
        if "error" in result:
            # Update transaction status to failed
            transactions = db.get_collection("mpesa_transactions")
            await transactions.update_one(
                {"_id": ObjectId(transaction_id)},
                {
                    "$set": {
                        "status": TransactionStatus.FAILED.value,
                        "response_data": result,
                        "updated_at": datetime.utcnow()
                    }
                }
            )
            return MpesaResponse(
                success=False,
                message=str(result["error"]),
                reference=transaction.reference
            )
        
        return MpesaResponse(
            success=True,
            message="Payment initiated successfully",
            transaction_id=transaction_id,
            reference=transaction.reference
        )

    @strawberry.mutation
    @login_required
    async def initiate_b2b_payment(
        self, info: Info, transaction: MpesaTransactionInput
    ) -> MpesaResponse:
        if not transaction.receiver_shortcode:
            return MpesaResponse(
                success=False,
                message="Receiver shortcode is required for B2B transactions"
            )
        
        agency_id = info.context.agency_id
        mpesa = await get_agency_mpesa(agency_id)
        if not mpesa:
            return MpesaResponse(success=False, message="Agency not found")
        
        access_token = await mpesa.get_access_token()
        if not access_token:
            return MpesaResponse(success=False, message="Failed to get access token")
        
        # Save transaction first
        transaction_id = await save_transaction(
            agency_id=agency_id,
            transaction_type=TransactionType.B2B.value,
            amount=transaction.amount,
            reference=transaction.reference,
            remarks=transaction.remarks,
            receiver_shortcode=transaction.receiver_shortcode
        )
        
        result = await mpesa.initiate_b2b(
            access_token,
            transaction.amount,
            transaction.receiver_shortcode,
            transaction.reference,
            transaction.remarks or "B2B Payment"
        )
        
        if "error" in result:
            # Update transaction status to failed
            transactions = db.get_collection("mpesa_transactions")
            await transactions.update_one(
                {"_id": ObjectId(transaction_id)},
                {
                    "$set": {
                        "status": TransactionStatus.FAILED.value,
                        "response_data": result,
                        "updated_at": datetime.utcnow()
                    }
                }
            )
            return MpesaResponse(
                success=False,
                message=str(result["error"]),
                reference=transaction.reference
            )
        
        return MpesaResponse(
            success=True,
            message="Payment initiated successfully",
            transaction_id=transaction_id,
            reference=transaction.reference
        )

    @strawberry.mutation
    @login_required
    async def initiate_customer_payment(
        self, info: Info, payment: CustomerPaymentInput
    ) -> MpesaResponse:
        """Initiate M-Pesa payment for customer subscription."""
        agency_id = info.context.agency_id
        
        # Verify customer exists and belongs to agency
        customers = db.get_collection("customers")
        customer = await customers.find_one({
            "_id": ObjectId(payment.customer_id),
            "agency": agency_id
        })
        if not customer:
            return MpesaResponse(success=False, message="Customer not found")
        
        # Verify package exists
        packages = db.get_collection("packages")
        package = await packages.find_one({"_id": ObjectId(payment.package_id)})
        if not package:
            return MpesaResponse(success=False, message="Package not found")
        
        mpesa = await get_agency_mpesa(agency_id)
        if not mpesa:
            return MpesaResponse(success=False, message="Agency not found")
        
        access_token = await mpesa.get_access_token()
        if not access_token:
            return MpesaResponse(success=False, message="Failed to get access token")
        
        # Generate reference number (combine customer ID and timestamp)
        reference = f"SUB{payment.customer_id[-6:]}{int(datetime.utcnow().timestamp())}"
        
        # Save transaction first
        transaction_id = await save_transaction(
            agency_id=agency_id,
            transaction_type=TransactionType.C2B.value,
            amount=payment.amount,
            phone=payment.phone,
            reference=reference,
            remarks=payment.remarks or f"Subscription payment for {customer['name']}",
            customer_id=payment.customer_id,
            package_id=payment.package_id,
            months=payment.months
        )
        
        result = await mpesa.initiate_c2b(
            access_token,
            payment.amount,
            payment.phone,
            reference
        )
        
        if "error" in result:
            # Update transaction status to failed
            transactions = db.get_collection("mpesa_transactions")
            await transactions.update_one(
                {"_id": ObjectId(transaction_id)},
                {
                    "$set": {
                        "status": TransactionStatus.FAILED.value,
                        "response_data": result,
                        "updated_at": datetime.utcnow()
                    }
                }
            )
            return MpesaResponse(
                success=False,
                message=str(result["error"]),
                reference=reference
            )
        
        return MpesaResponse(
            success=True,
            message="Payment initiated successfully",
            transaction_id=transaction_id,
            reference=reference
        )

# Callback handlers for M-Pesa webhooks
async def handle_validation(agency_id: str, data: Dict[str, Any]):
    """Handle M-Pesa validation callback."""
    # Implement validation logic here
    return {"ResultCode": "0", "ResultDesc": "Accepted"}

async def get_package_info(customer_id: Optional[str] = None, package_id: Optional[str] = None) -> Dict[str, Any]:
    """Get package information and validate it exists."""
    packages = db.get_collection("packages")
    package = None
    
    if package_id:
        package = await packages.find_one({"_id": ObjectId(package_id)})
    elif customer_id:
        # Get customer's current package
        customers = db.get_collection("customers")
        customer = await customers.find_one({"_id": ObjectId(customer_id)})
        if customer and customer.get("package"):
            package = await packages.find_one({"_id": ObjectId(customer["package"])})
    
    if not package:
        # Get the cheapest package as fallback
        package = await packages.find_one(
            {"service_type": "internet"},
            sort=[("price", 1)]
        )
    
    if not package:
        return None
    
    return {
        "id": str(package["_id"]),
        "name": package["name"],
        "price": float(package["price"]),
        "service_type": package["service_type"]
    }

async def validate_payment_amount(amount: float, package_price: float) -> tuple[bool, int, str]:
    """Validate payment amount and calculate number of months."""
    if amount < package_price:
        return False, 0, f"Amount paid ({amount}) is less than package price ({package_price})"
    
    months = int(amount / package_price)
    if months < 1:
        return False, 0, "Invalid number of months calculated"
    
    return True, months, "Valid payment"

async def handle_confirmation(agency_id: str, data: Dict[str, Any]):
    """Handle M-Pesa confirmation callback."""
    transactions = db.get_collection("mpesa_transactions")
    customers = db.get_collection("customers")
    now = datetime.utcnow()
    
    # Get the account number (username) from the M-Pesa callback
    account_number = data.get("BillRefNumber")  # This is where username will be sent
    if not account_number:
        return {"ResultCode": "0", "ResultDesc": "Success"}
    
    # Find the customer by username
    customer = await customers.find_one({
        "username": account_number,
        "agency": agency_id
    })
    
    if not customer:
        print(f"No customer found with username {account_number}")
        return {"ResultCode": "0", "ResultDesc": "Success"}
    
    # Get the amount paid
    try:
        amount = float(data.get("TransAmount", 0))
    except (ValueError, TypeError):
        print(f"Invalid amount received: {data.get('TransAmount')}")
        return {"ResultCode": "0", "ResultDesc": "Success"}
    
    # Get package information
    package_info = await get_package_info(customer_id=str(customer["_id"]))
    if not package_info:
        print(f"No package found for customer {account_number}")
        return {"ResultCode": "0", "ResultDesc": "Success"}
    
    # Validate payment amount and get number of months
    is_valid, months, message = await validate_payment_amount(amount, package_info["price"])
    if not is_valid:
        print(message)
        return {"ResultCode": "0", "ResultDesc": "Success"}
    
    # Create a transaction record
    transaction_data = {
        "agency_id": agency_id,
        "customer_id": str(customer["_id"]),
        "type": TransactionType.C2B.value,
        "amount": amount,
        "phone": data.get("MSISDN"),  # Customer's phone number from M-Pesa
        "reference": account_number,  # Username used as reference
        "remarks": f"Payment for {months} month(s) subscription - {package_info['name']}",
        "status": TransactionStatus.COMPLETED.value,
        "mpesa_receipt": data.get("TransID"),
        "package_id": package_info["id"],
        "months": months,
        "created_at": now,
        "completed_at": now,
        "updated_at": now,
        "response_data": data
    }
    
    result = await transactions.insert_one(transaction_data)
    
    # Update customer subscription
    success = await update_customer_subscription(
        customer_id=str(customer["_id"]),
        package_id=package_info["id"],
        months=months,
        transaction_id=str(result.inserted_id)
    )
    
    if not success:
        print(f"Failed to update subscription for customer {account_number}")
    else:
        print(f"Successfully updated subscription for customer {account_number} - {months} month(s)")
    
    return {"ResultCode": "0", "ResultDesc": "Success"}

async def handle_timeout(agency_id: str, data: Dict[str, Any]):
    """Handle M-Pesa timeout callback."""
    transactions = db.get_collection("mpesa_transactions")
    now = datetime.utcnow()
    
    # Update transaction status to timeout
    await transactions.update_one(
        {"reference": data.get("BillRefNumber"), "agency_id": agency_id},
        {
            "$set": {
                "status": TransactionStatus.TIMEOUT.value,
                "updated_at": now,
                "response_data": data
            }
        }
    )
    return {"ResultCode": "0", "ResultDesc": "Success"}

async def update_customer_subscription(
    customer_id: str,
    package_id: str,
    months: int,
    transaction_id: str
) -> bool:
    """Update customer subscription after successful payment."""
    try:
        customers = db.get_collection("customers")
        customer = await customers.find_one({"_id": ObjectId(customer_id)})
        if not customer:
            return False

        now = datetime.utcnow()
        current_expiry = customer.get("expiry", now)
        
        # If current subscription has expired, start from now
        if current_expiry < now:
            current_expiry = now
            
        # Calculate new expiry date
        new_expiry = current_expiry + timedelta(days=30 * months)
        
        # Update customer
        await customers.update_one(
            {"_id": ObjectId(customer_id)},
            {
                "$set": {
                    "package": package_id,
                    "status": "active",
                    "expiry": new_expiry,
                    "updated_at": now
                }
            }
        )
        return True
    except Exception as e:
        print(f"Error updating customer subscription: {str(e)}")
        return False 