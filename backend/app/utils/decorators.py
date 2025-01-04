from functools import wraps
from typing import Any, Callable
from strawberry.types import Info
from ..middleware.auth_middleware import is_authenticated

def has_role(info: Info, role: str) -> bool:
    user = info.context.user
    if not user:
        return False
    return role in user.get("roles", [])

def login_required(resolver: Callable) -> Callable:
    @wraps(resolver)
    async def wrapper(root: Any, info: Info, *args, **kwargs) -> Any:
        if not is_authenticated(info):
            raise Exception("Authentication required")
        return await resolver(root, info, *args, **kwargs)
    return wrapper

def role_required(role: str):
    def decorator(resolver: Callable) -> Callable:
        @wraps(resolver)
        async def wrapper(root: Any, info: Info, *args, **kwargs) -> Any:
            if not has_role(info, role):
                raise Exception(f"Role '{role}' required")
            return await resolver(root, info, *args, **kwargs)
        return wrapper
    return decorator 