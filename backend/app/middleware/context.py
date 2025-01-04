from strawberry.fastapi import BaseContext
from typing import Optional
from fastapi import Request

class CustomContext(BaseContext):
    def __init__(self, request: Request, user_id: Optional[str] = None):
        super().__init__()
        self.request = request
        self.user_id = user_id 