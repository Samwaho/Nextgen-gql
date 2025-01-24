import requests
import base64
from typing import Dict, Any, Optional
from datetime import datetime
from ..config.mpesa import get_mpesa_settings
from .encryption import decrypt_mpesa_credentials

class MpesaIntegration:
    def __init__(self, agency_data: Dict[str, Any]):
        # Decrypt sensitive credentials
        decrypted_data = decrypt_mpesa_credentials(agency_data)
        
        self.consumer_key = decrypted_data.get("mpesa_consumer_key")
        self.consumer_secret = decrypted_data.get("mpesa_consumer_secret")
        self.shortcode = agency_data.get("mpesa_shortcode")  # Not encrypted
        self.b2c_shortcode = agency_data.get("mpesa_b2c_shortcode")  # Not encrypted
        self.b2b_shortcode = agency_data.get("mpesa_b2b_shortcode")  # Not encrypted
        self.passkey = decrypted_data.get("mpesa_passkey")
        self.env = agency_data.get("mpesa_env", "sandbox")  # Not encrypted
        self.initiator_name = agency_data.get("mpesa_initiator_name")  # Not encrypted
        self.initiator_password = decrypted_data.get("mpesa_initiator_password")
        self.base_url = "https://sandbox.safaricom.co.ke" if self.env == "sandbox" else "https://api.safaricom.co.ke"
        self.settings = get_mpesa_settings()
        
    async def get_access_token(self) -> Optional[str]:
        """Get M-Pesa API access token."""
        try:
            auth = base64.b64encode(f"{self.consumer_key}:{self.consumer_secret}".encode()).decode()
            headers = {"Authorization": f"Basic {auth}"}
            response = requests.get(
                f"{self.base_url}/oauth/v1/generate?grant_type=client_credentials",
                headers=headers
            )
            return response.json().get("access_token")
        except Exception as e:
            print(f"Error getting access token: {str(e)}")
            return None

    async def register_urls(self, access_token: str) -> Dict[str, Any]:
        """Register callback URLs for C2B transactions."""
        try:
            headers = {
                "Authorization": f"Bearer {access_token}",
                "Content-Type": "application/json"
            }
            data = {
                "ShortCode": self.shortcode,
                "ResponseType": "Completed",
                "ConfirmationURL": self.settings.get_confirmation_url(),
                "ValidationURL": self.settings.get_validation_url()
            }
            response = requests.post(
                f"{self.base_url}/mpesa/c2b/v1/registerurl",
                headers=headers,
                json=data
            )
            return response.json()
        except Exception as e:
            print(f"Error registering URLs: {str(e)}")
            return {"error": str(e)}

    async def initiate_c2b(
        self, access_token: str, amount: float, phone: str, reference: str
    ) -> Dict[str, Any]:
        """Initiate a Customer to Business (C2B) transaction."""
        try:
            headers = {
                "Authorization": f"Bearer {access_token}",
                "Content-Type": "application/json"
            }
            data = {
                "ShortCode": self.shortcode,
                "CommandID": "CustomerPayBillOnline",
                "Amount": str(amount),
                "Msisdn": phone,
                "BillRefNumber": reference
            }
            response = requests.post(
                f"{self.base_url}/mpesa/c2b/v1/simulate",
                headers=headers,
                json=data
            )
            return response.json()
        except Exception as e:
            print(f"Error initiating C2B transaction: {str(e)}")
            return {"error": str(e)}

    async def initiate_b2c(
        self, access_token: str, amount: float, phone: str, reference: str, remarks: str
    ) -> Dict[str, Any]:
        """Initiate a Business to Customer (B2C) transaction."""
        try:
            headers = {
                "Authorization": f"Bearer {access_token}",
                "Content-Type": "application/json"
            }
            data = {
                "InitiatorName": self.initiator_name,
                "SecurityCredential": self.initiator_password,  # Should be encrypted
                "CommandID": "BusinessPayment",
                "Amount": str(amount),
                "PartyA": self.b2c_shortcode,
                "PartyB": phone,
                "Remarks": remarks,
                "QueueTimeOutURL": self.settings.get_timeout_url(),
                "ResultURL": self.settings.get_result_url(),
                "Occasion": reference
            }
            response = requests.post(
                f"{self.base_url}/mpesa/b2c/v1/paymentrequest",
                headers=headers,
                json=data
            )
            return response.json()
        except Exception as e:
            print(f"Error initiating B2C transaction: {str(e)}")
            return {"error": str(e)}

    async def initiate_b2b(
        self, access_token: str, amount: float, receiver_shortcode: str,
        reference: str, remarks: str
    ) -> Dict[str, Any]:
        """Initiate a Business to Business (B2B) transaction."""
        try:
            headers = {
                "Authorization": f"Bearer {access_token}",
                "Content-Type": "application/json"
            }
            data = {
                "Initiator": self.initiator_name,
                "SecurityCredential": self.initiator_password,  # Should be encrypted
                "CommandID": "BusinessToBusinessPayment",
                "SenderIdentifierType": "4",  # Shortcode
                "RecieverIdentifierType": "4",  # Shortcode
                "Amount": str(amount),
                "PartyA": self.b2b_shortcode,
                "PartyB": receiver_shortcode,
                "AccountReference": reference,
                "Remarks": remarks,
                "QueueTimeOutURL": self.settings.get_timeout_url(),
                "ResultURL": self.settings.get_result_url()
            }
            response = requests.post(
                f"{self.base_url}/mpesa/b2b/v1/paymentrequest",
                headers=headers,
                json=data
            )
            return response.json()
        except Exception as e:
            print(f"Error initiating B2B transaction: {str(e)}")
            return {"error": str(e)}

    async def check_balance(self, access_token: str) -> Dict[str, Any]:
        """Check account balance."""
        try:
            headers = {
                "Authorization": f"Bearer {access_token}",
                "Content-Type": "application/json"
            }
            data = {
                "Initiator": self.initiator_name,
                "SecurityCredential": self.initiator_password,  # Should be encrypted
                "CommandID": "AccountBalance",
                "PartyA": self.shortcode,
                "IdentifierType": "4",  # Shortcode
                "Remarks": "Account balance query",
                "QueueTimeOutURL": self.settings.get_timeout_url(),
                "ResultURL": self.settings.get_result_url()
            }
            response = requests.post(
                f"{self.base_url}/mpesa/accountbalance/v1/query",
                headers=headers,
                json=data
            )
            return response.json()
        except Exception as e:
            print(f"Error checking balance: {str(e)}")
            return {"error": str(e)} 