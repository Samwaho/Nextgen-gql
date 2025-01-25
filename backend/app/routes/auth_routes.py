import strawberry
from typing import Optional
from datetime import timedelta, datetime
from passlib.hash import bcrypt
from ..config.database import db
from ..schemas.auth_schema import LoginInput, SignupInput, GoogleAuthInput, AuthResponse, Token
from ..utils.auth import create_access_token, verify_google_token
from ..config.settings import settings
from bson import ObjectId
from google.oauth2 import id_token
from google.auth.transport.requests import Request as GoogleRequest
from fastapi import APIRouter, Request
from fastapi.responses import RedirectResponse
import requests
from google_auth_oauthlib.flow import Flow
import json

async def authenticate_user(email: str, password: str) -> Optional[dict]:
    collection = db.get_collection("users")
    user = await collection.find_one({"email": email})
    
    if not user:
        return None
    
    if not bcrypt.verify(password, user["password"]):
        return None
    
    return user

async def create_user_from_google(google_user: dict) -> dict:
    collection = db.get_collection("users")
    
    # Check if user already exists
    existing_user = await collection.find_one({"email": google_user["email"]})
    if existing_user:
        return existing_user

    # Create new user
    user_data = {
        "name": google_user["name"],
        "email": google_user["email"],
        "is_verified": True,  # Google users are pre-verified
        "roles": ["user"],
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow(),
        "is_active": True,
        "auth_provider": "google"
    }
    
    result = await collection.insert_one(user_data)
    user_data["_id"] = result.inserted_id
    return user_data

@strawberry.type
class AuthMutation:
    @strawberry.mutation
    async def login(self, input: LoginInput) -> AuthResponse:
        user = await authenticate_user(input.email, input.password)
        
        if not user:
            return AuthResponse(
                success=False,
                message="Invalid email or password"
            )
        
        if not user.get("is_active", True):
            return AuthResponse(
                success=False,
                message="User account is disabled"
            )

        access_token = create_access_token(
            data={
                "sub": str(user["_id"]),
                "id": str(user["_id"]),
                "roles": user.get("roles", ["user"])
            },
            expires_delta=timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
        )

        return AuthResponse(
            success=True,
            token=Token(access_token=access_token)
        )

    @strawberry.mutation
    async def signup(self, input: SignupInput) -> AuthResponse:
        collection = db.get_collection("users")
        
        # Check if email already exists
        if await collection.find_one({"email": input.email}):
            return AuthResponse(
                success=False,
                message="Email already registered"
            )
        
        # Create new user
        user_data = {
            "name": input.name,
            "email": input.email,
            "password": bcrypt.hash(input.password),
            "roles": ["user"],
            "address": input.address,
            "phone": input.phone,
            "agency": input.agency,
            "is_verified": False,
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow(),
            "is_active": True,
            "auth_provider": "local"
        }
        
        result = await collection.insert_one(user_data)
        user_data["_id"] = result.inserted_id

        # Generate token
        access_token = create_access_token(
            data={
                "sub": str(user_data["_id"]),
                "id": str(user_data["_id"]),
                "roles": user_data["roles"]
            }
        )

        return AuthResponse(
            success=True,
            token=Token(access_token=access_token)
        )

    @strawberry.mutation
    async def google_auth(self, input: GoogleAuthInput) -> AuthResponse:
        try:
            # Create a proper request object
            request = GoogleRequest()
            
            # Verify the Google token
            idinfo = id_token.verify_oauth2_token(
                input.token, 
                request,
                settings.GOOGLE_CLIENT_ID,
                clock_skew_in_seconds=60  # Allow for some clock skew
            )
            
            # Check if token is expired
            if datetime.fromtimestamp(idinfo["exp"]) < datetime.utcnow():
                return AuthResponse(
                    success=False,
                    message="Token has expired"
                )

            # Verify email is verified by Google
            if not idinfo.get("email_verified"):
                return AuthResponse(
                    success=False,
                    message="Email not verified by Google"
                )

            # Create or get user
            user = await create_user_from_google({
                "name": idinfo["name"],
                "email": idinfo["email"],
                "picture": idinfo.get("picture"),
                "given_name": idinfo.get("given_name"),
                "family_name": idinfo.get("family_name")
            })

            # Generate token with appropriate expiry
            access_token = create_access_token(
                data={
                    "sub": str(user["_id"]),
                    "id": str(user["_id"]),
                    "roles": user.get("roles", ["user"]),
                    "email": user["email"]
                },
                expires_delta=timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
            )

            return AuthResponse(
                success=True,
                token=Token(access_token=access_token)
            )

        except ValueError as e:
            error_msg = str(e)
            if "Token expired" in error_msg:
                return AuthResponse(
                    success=False,
                    message="Authentication token has expired. Please try logging in again."
                )
            elif "Invalid token" in error_msg:
                return AuthResponse(
                    success=False,
                    message="Invalid authentication token. Please try logging in again."
                )
            return AuthResponse(
                success=False,
                message="Failed to verify Google token. Please try again."
            )
        except Exception as e:
            print(f"Unexpected error during Google authentication: {str(e)}")
            return AuthResponse(
                success=False,
                message="An unexpected error occurred. Please try again later."
            )

    @strawberry.mutation
    async def logout(self) -> AuthResponse:
        # In a stateless JWT setup, client-side logout is sufficient
        # Server-side logout would be needed for token blacklisting
        return AuthResponse(success=True)

# Create an OAuth 2.0 flow instance
client_config = {
    "web": {
        "client_id": settings.GOOGLE_CLIENT_ID,
        "client_secret": settings.GOOGLE_CLIENT_SECRET,
        "auth_uri": "https://accounts.google.com/o/oauth2/auth",
        "token_uri": "https://oauth2.googleapis.com/token",
        "redirect_uris": [f"{settings.API_URL}/auth/google/callback"],
        "javascript_origins": [settings.FRONTEND_URL]
    }
}

# Initialize flow outside of the route handlers
flow = Flow.from_client_config(
    client_config=client_config,
    scopes=[
        "https://www.googleapis.com/auth/userinfo.email",
        "https://www.googleapis.com/auth/userinfo.profile",
        "openid"
    ]
)

router = APIRouter(prefix="/auth", tags=["auth"])

@router.get("/google/login")
async def google_login():
    flow.redirect_uri = f"{settings.API_URL}/auth/google/callback"
    authorization_url, state = flow.authorization_url(
        access_type="offline",
        include_granted_scopes="true",
        prompt="consent"
    )
    return RedirectResponse(authorization_url, status_code=307)

@router.get("/google/callback")
async def google_callback(request: Request):
    try:
        flow.redirect_uri = f"{settings.API_URL}/auth/google/callback"
        code = request.query_params.get("code")
        
        if not code:
            return RedirectResponse(
                f"{settings.FRONTEND_URL}/sign-in?error=missing_auth_code",
                status_code=307
            )
            
        try:
            flow.fetch_token(code=code)
        except Exception as e:
            return RedirectResponse(
                f"{settings.FRONTEND_URL}/sign-in?error=invalid_auth_code",
                status_code=307
            )

        credentials = flow.credentials
        if not credentials:
            return RedirectResponse(
                f"{settings.FRONTEND_URL}/sign-in?error=missing_credentials",
                status_code=307
            )
            
        if not credentials.id_token:
            return RedirectResponse(
                f"{settings.FRONTEND_URL}/sign-in?error=missing_id_token",
                status_code=307
            )

        # Get user info from Google to verify token is valid
        user_info_response = requests.get(
            "https://www.googleapis.com/oauth2/v3/userinfo",
            headers={"Authorization": f"Bearer {credentials.token}"}
        )
        
        if not user_info_response.ok:
            return RedirectResponse(
                f"{settings.FRONTEND_URL}/sign-in?error=invalid_token",
                status_code=307
            )

        # Redirect to frontend with the ID token
        return RedirectResponse(
            f"{settings.FRONTEND_URL}/login-success?token={credentials.id_token}",
            status_code=307
        )
        
    except Exception as e:
        error_type = "server_error"
        if "access_denied" in str(e).lower():
            error_type = "access_denied"
        elif "invalid_request" in str(e).lower():
            error_type = "invalid_request"
        return RedirectResponse(
            f"{settings.FRONTEND_URL}/sign-in?error={error_type}",
            status_code=307
        )