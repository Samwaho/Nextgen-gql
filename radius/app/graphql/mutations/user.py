import strawberry
from typing import Optional
from datetime import datetime
from ..types.user import User, UserCreateInput, UserUpdateInput
from ..resolvers.user import get_user_by_username, RADIUS_ATTRIBUTES
from ...db import database

@strawberry.type
class UserMutation:
    @strawberry.mutation
    async def create_user(self, user: UserCreateInput) -> User:
        async with database.transaction():
            # Check if user exists
            existing_user = await get_user_by_username(user.username)
            if existing_user:
                raise ValueError("Username already exists")

            # Insert password
            await database.execute(
                "INSERT INTO radcheck (username, attribute, op, value) VALUES (:username, :attribute, :op, :value)",
                {
                    "username": user.username,
                    "attribute": RADIUS_ATTRIBUTES["password"],
                    "op": ":=",
                    "value": user.password
                }
            )

            # Insert rate limit (bandwidth)
            rate_limit = f"{user.download_speed}/{user.upload_speed}"
            await database.execute(
                "INSERT INTO radreply (username, attribute, op, value) VALUES (:username, :attribute, :op, :value)",
                {
                    "username": user.username,
                    "attribute": RADIUS_ATTRIBUTES["download_speed"],
                    "op": ":=",
                    "value": rate_limit
                }
            )

            # Insert expiry date
            await database.execute(
                "INSERT INTO radcheck (username, attribute, op, value) VALUES (:username, :attribute, :op, :value)",
                {
                    "username": user.username,
                    "attribute": RADIUS_ATTRIBUTES["expiry"],
                    "op": ":=",
                    "value": user.expiry_date.strftime("%Y-%m-%d")
                }
            )

            # Insert simultaneous use limit
            await database.execute(
                "INSERT INTO radcheck (username, attribute, op, value) VALUES (:username, :attribute, :op, :value)",
                {
                    "username": user.username,
                    "attribute": RADIUS_ATTRIBUTES["simultaneous_use"],
                    "op": ":=",
                    "value": str(user.simultaneous_use)
                }
            )

            return User(
                username=user.username,
                download_speed=user.download_speed,
                upload_speed=user.upload_speed,
                expiry_date=user.expiry_date,
                simultaneous_use=user.simultaneous_use,
                is_active=True,
                created_at=datetime.now()
            )

    @strawberry.mutation
    async def update_user(self, username: str, user: UserUpdateInput) -> Optional[User]:
        async with database.transaction():
            existing_user = await get_user_by_username(username)
            if not existing_user:
                raise ValueError("User not found")

            # Update password if provided
            if user.password:
                await database.execute(
                    """
                    UPDATE radcheck 
                    SET value = :value
                    WHERE username = :username AND attribute = :attribute
                    """,
                    {
                        "username": username,
                        "attribute": RADIUS_ATTRIBUTES["password"],
                        "value": user.password
                    }
                )

            # Update rate limit if provided
            if user.download_speed and user.upload_speed:
                rate_limit = f"{user.download_speed}/{user.upload_speed}"
                await database.execute(
                    """
                    UPDATE radreply 
                    SET value = :value
                    WHERE username = :username AND attribute = :attribute
                    """,
                    {
                        "username": username,
                        "attribute": RADIUS_ATTRIBUTES["download_speed"],
                        "value": rate_limit
                    }
                )

            # Update expiry date if provided
            if user.expiry_date:
                await database.execute(
                    """
                    UPDATE radcheck 
                    SET value = :value
                    WHERE username = :username AND attribute = :attribute
                    """,
                    {
                        "username": username,
                        "attribute": RADIUS_ATTRIBUTES["expiry"],
                        "value": user.expiry_date.strftime("%Y-%m-%d")
                    }
                )

            # Update simultaneous use if provided
            if user.simultaneous_use:
                await database.execute(
                    """
                    UPDATE radcheck 
                    SET value = :value
                    WHERE username = :username AND attribute = :attribute
                    """,
                    {
                        "username": username,
                        "attribute": RADIUS_ATTRIBUTES["simultaneous_use"],
                        "value": str(user.simultaneous_use)
                    }
                )

            return await get_user_by_username(username)

    @strawberry.mutation
    async def delete_user(self, username: str) -> bool:
        async with database.transaction():
            existing_user = await get_user_by_username(username)
            if not existing_user:
                raise ValueError("User not found")

            # Delete from radcheck
            await database.execute(
                "DELETE FROM radcheck WHERE username = :username",
                {"username": username}
            )
            # Delete from radreply
            await database.execute(
                "DELETE FROM radreply WHERE username = :username",
                {"username": username}
            )

            return True 