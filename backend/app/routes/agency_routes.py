import strawberry
from typing import List, Optional
from datetime import datetime
from bson import ObjectId
from ..config.database import db
from ..schemas.agency_schemas import Agency, AgencyInput, AgencyUpdateInput, MpesaEnvironment, MpesaTransactionType
from ..utils.decorators import login_required, role_required
from ..utils.mpesa import MpesaIntegration
from ..utils.encryption import encrypt_mpesa_credentials, decrypt_mpesa_credentials
from strawberry.types import Info
import requests
import base64
import json

async def get_agencies() -> List[Agency]:
    collection = db.get_collection("agencies")
    agencies_data = await collection.find({}).to_list(None)
    return [
        Agency(
            id=str(agency["_id"]),
            name=agency["name"],
            address=agency.get("address"),
            phone=agency.get("phone"),
            email=agency.get("email"),
            website=agency.get("website"),
            logo=agency.get("logo"),
            banner=agency.get("banner"),
            description=agency.get("description"),
            mpesa_shortcode=agency.get("mpesa_shortcode"),
            mpesa_env=agency.get("mpesa_env"),
            mpesa_b2c_shortcode=agency.get("mpesa_b2c_shortcode"),
            mpesa_b2b_shortcode=agency.get("mpesa_b2b_shortcode"),
            mpesa_initiator_name=agency.get("mpesa_initiator_name"),
            created_at=agency.get("created_at", datetime.utcnow()),
            updated_at=agency.get("updated_at")
        ) for agency in agencies_data
    ]

async def get_agency(id: str) -> Optional[Agency]:
    collection = db.get_collection("agencies")
    try:
        agency = await collection.find_one({"_id": ObjectId(id)})
        if agency:
            return Agency(
                id=str(agency["_id"]),
                name=agency["name"],
                address=agency.get("address"),
                phone=agency.get("phone"),
                email=agency.get("email"),
                website=agency.get("website"),
                logo=agency.get("logo"),
                banner=agency.get("banner"),
                description=agency.get("description"),
                mpesa_shortcode=agency.get("mpesa_shortcode"),
                mpesa_env=agency.get("mpesa_env"),
                mpesa_b2c_shortcode=agency.get("mpesa_b2c_shortcode"),
                mpesa_b2b_shortcode=agency.get("mpesa_b2b_shortcode"),
                mpesa_initiator_name=agency.get("mpesa_initiator_name"),
                created_at=agency.get("created_at", datetime.utcnow()),
                updated_at=agency.get("updated_at")
            )
    except:
        return None
    return None

async def create_agency(info: Info, agency_input: AgencyInput) -> Agency:
    collection = db.get_collection("agencies")
    users_collection = db.get_collection("users")
    now = datetime.utcnow()
    
    # Create the agency with additional M-Pesa fields
    agency_data = {
        "name": agency_input.name,
        "address": agency_input.address,
        "phone": agency_input.phone,
        "email": agency_input.email,
        "website": agency_input.website,
        "logo": agency_input.logo,
        "banner": agency_input.banner,
        "description": agency_input.description,
        "mpesa_consumer_key": agency_input.mpesa_consumer_key,
        "mpesa_consumer_secret": agency_input.mpesa_consumer_secret,
        "mpesa_shortcode": agency_input.mpesa_shortcode,
        "mpesa_passkey": agency_input.mpesa_passkey,
        "mpesa_env": agency_input.mpesa_env,
        "mpesa_b2c_shortcode": agency_input.mpesa_b2c_shortcode,
        "mpesa_b2b_shortcode": agency_input.mpesa_b2b_shortcode,
        "mpesa_initiator_name": agency_input.mpesa_initiator_name,
        "mpesa_initiator_password": agency_input.mpesa_initiator_password,
        "created_at": now,
        "updated_at": now
    }
    
    # Encrypt sensitive M-Pesa credentials before saving
    agency_data = encrypt_mpesa_credentials(agency_data)
    
    result = await collection.insert_one(agency_data)
    agency_id = str(result.inserted_id)
    agency_data["id"] = agency_id
    
    # Initialize M-Pesa integration with decrypted credentials
    if agency_input.mpesa_consumer_key and agency_input.mpesa_shortcode:
        decrypted_data = decrypt_mpesa_credentials(agency_data)
        mpesa = MpesaIntegration(decrypted_data)
        access_token = await mpesa.get_access_token()
        if access_token:
            await mpesa.register_urls(access_token)
    
    # Update the authenticated user with the new agency ID
    user_id = ObjectId(info.context.user_id)
    await users_collection.update_one(
        {"_id": user_id},
        {"$set": {
            "agency": agency_id,
            "updated_at": now
        }}
    )
    
    # Return Agency without sensitive fields
    return Agency(
        id=agency_data["id"],
        name=agency_data["name"],
        address=agency_data.get("address"),
        phone=agency_data.get("phone"),
        email=agency_data.get("email"),
        website=agency_data.get("website"),
        logo=agency_data.get("logo"),
        banner=agency_data.get("banner"),
        description=agency_data.get("description"),
        mpesa_shortcode=agency_data.get("mpesa_shortcode"),
        mpesa_env=agency_data.get("mpesa_env"),
        mpesa_b2c_shortcode=agency_data.get("mpesa_b2c_shortcode"),
        mpesa_b2b_shortcode=agency_data.get("mpesa_b2b_shortcode"),
        mpesa_initiator_name=agency_data.get("mpesa_initiator_name"),
        created_at=agency_data["created_at"],
        updated_at=agency_data["updated_at"]
    )

async def update_agency(id: str, agency_input: AgencyUpdateInput) -> Optional[Agency]:
    collection = db.get_collection("agencies")
    update_data = {
        "updated_at": datetime.utcnow()
    }
    
    # Only include fields that are actually being updated
    for field in [
        "name", "address", "phone", "email", "website", "logo", "banner",
        "description", "mpesa_consumer_key", "mpesa_consumer_secret",
        "mpesa_shortcode", "mpesa_passkey", "mpesa_env", "mpesa_b2c_shortcode",
        "mpesa_b2b_shortcode", "mpesa_initiator_name", "mpesa_initiator_password"
    ]:
        value = getattr(agency_input, field, None)
        if value is not None:
            update_data[field] = value
    
    # Encrypt sensitive M-Pesa credentials if they are being updated
    update_data = encrypt_mpesa_credentials(update_data)
    
    try:
        if update_data:
            result = await collection.find_one_and_update(
                {"_id": ObjectId(id)},
                {"$set": update_data},
                return_document=True
            )
            if result:
                # Re-register M-Pesa URLs if M-Pesa credentials were updated
                mpesa_fields = ["mpesa_consumer_key", "mpesa_consumer_secret", "mpesa_shortcode"]
                if any(field in update_data for field in mpesa_fields):
                    decrypted_data = decrypt_mpesa_credentials(result)
                    mpesa = MpesaIntegration(decrypted_data)
                    access_token = await mpesa.get_access_token()
                    if access_token:
                        await mpesa.register_urls(access_token)
                
                return Agency(
                    id=str(result["_id"]),
                    name=result["name"],
                    address=result.get("address"),
                    phone=result.get("phone"),
                    email=result.get("email"),
                    website=result.get("website"),
                    logo=result.get("logo"),
                    banner=result.get("banner"),
                    description=result.get("description"),
                    mpesa_shortcode=result.get("mpesa_shortcode"),
                    mpesa_env=result.get("mpesa_env"),
                    mpesa_b2c_shortcode=result.get("mpesa_b2c_shortcode"),
                    mpesa_b2b_shortcode=result.get("mpesa_b2b_shortcode"),
                    mpesa_initiator_name=result.get("mpesa_initiator_name"),
                    created_at=result.get("created_at", datetime.utcnow()),
                    updated_at=result.get("updated_at")
                )
    except:
        return None
    return None

async def delete_agency(id: str) -> bool:
    collection = db.get_collection("agencies")
    try:
        result = await collection.delete_one({"_id": ObjectId(id)})
        return result.deleted_count > 0
    except:
        return False

@strawberry.type
class Query:
    @strawberry.field
    @login_required
    async def agencies(self, info: Info) -> List[Agency]:
        return await get_agencies()

    @strawberry.field
    @login_required
    async def agency(self, info: Info, id: str) -> Optional[Agency]:
        return await get_agency(id)

@strawberry.type
class Mutation:
    @strawberry.mutation
    @login_required
    async def create_agency(self, info: Info, agency_input: AgencyInput) -> Agency:
        return await create_agency(info, agency_input)

    @strawberry.mutation
    @login_required
    async def update_agency(
        self, info: Info, id: str, agency_input: AgencyUpdateInput
    ) -> Optional[Agency]:
        return await update_agency(id, agency_input)
    
    @strawberry.mutation
    @login_required
    async def delete_agency(self, info: Info, id: str) -> bool:
        return await delete_agency(id)
