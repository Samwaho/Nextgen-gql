import strawberry
from typing import List, Optional
from datetime import datetime
from bson import ObjectId

from ..config.database import db
from ..schemas.employee_schemas import Employee, EmployeeInput, EmployeeUpdateInput
from ..schemas.notification_schemas import NotificationInput
from ..routes.notification_routes import create_notification
from ..utils.decorators import login_required, role_required
from strawberry.types import Info

async def get_staff_members(agency_id: Optional[str] = None) -> List[Employee]:
    collection = db.get_collection("employees")
    query = {"agency": agency_id} if agency_id else {}
    employees_data = await collection.find(query).sort("created_at", -1).to_list(None)
    return [
        Employee(
            id=str(employee["_id"]),
            name=employee["name"],
            email=employee["email"],
            username=employee["username"],
            phone=employee["phone"],
            role=employee["role"],
            agency=employee["agency"],
            createdAt=employee.get("created_at", datetime.utcnow()),
            updatedAt=employee.get("updated_at")
        ) for employee in employees_data
    ]

async def get_staff_member(id: str) -> Optional[Employee]:
    collection = db.get_collection("employees")
    try:
        employee = await collection.find_one({"_id": ObjectId(id)})
        if employee:
            return Employee(
                id=str(employee["_id"]),
                name=employee["name"],
                email=employee["email"],
                username=employee["username"],
                phone=employee["phone"],
                role=employee["role"],
                agency=employee["agency"],
                createdAt=employee.get("created_at", datetime.utcnow()),
                updatedAt=employee.get("updated_at")
            )
    except:
        return None
    return None

async def create_staff_member(employee_input: EmployeeInput, agency_id: str, user_id: str) -> Employee:
    collection = db.get_collection("employees")
    now = datetime.utcnow()
    
    employee_data = {
        "name": employee_input.name,
        "email": employee_input.email,
        "username": employee_input.username,
        "password": employee_input.password,  # Note: Should be hashed in production
        "phone": employee_input.phone,
        "role": employee_input.role,
        "agency": agency_id,
        "created_at": now,
        "updated_at": now
    }
    
    result = await collection.insert_one(employee_data)
    employee_data["_id"] = result.inserted_id
    
    # Create notification for new staff member
    await create_notification(
        NotificationInput(
            type="employee_created",
            title="New Staff Member Created",
            message=f"Staff member {employee_input.name} has been created with role '{employee_input.role}'",
            entity_id=str(result.inserted_id),
            entity_type="employee",
            user_id=user_id,
            is_read=False
        ),
        agency_id,
        user_id
    )
    
    return Employee(
        id=str(employee_data["_id"]),
        name=employee_data["name"],
        email=employee_data["email"],
        username=employee_data["username"],
        phone=employee_data["phone"],
        role=employee_data["role"],
        agency=employee_data["agency"],
        createdAt=employee_data["created_at"],
        updatedAt=employee_data["updated_at"]
    )

async def update_staff_member(id: str, employee_input: EmployeeUpdateInput, agency_id: str, user_id: str) -> Optional[Employee]:
    collection = db.get_collection("employees")
    update_data = {
        "updated_at": datetime.utcnow()
    }
    
    for field in ["name", "email", "username", "phone", "role"]:
        value = getattr(employee_input, field)
        if value is not None:
            update_data[field] = value
    
    try:
        result = await collection.find_one_and_update(
            {"_id": ObjectId(id)},
            {"$set": update_data},
            return_document=True
        )
        if result:
            # Create notification for staff member update
            changes = [field for field in update_data.keys() if field != "updated_at"]
            if changes:
                await create_notification(
                    NotificationInput(
                        type="employee_updated",
                        title="Staff Member Updated",
                        message=f"Staff member {result['name']} has been updated. Changed fields: {', '.join(changes)}",
                        entity_id=str(result["_id"]),
                        entity_type="employee",
                        user_id=user_id,
                        is_read=False
                    ),
                    result["agency"],
                    user_id
                )
            
            return Employee(
                id=str(result["_id"]),
                name=result["name"],
                email=result["email"],
                username=result["username"],
                phone=result["phone"],
                role=result["role"],
                agency=result["agency"],
                createdAt=result.get("created_at", datetime.utcnow()),
                updatedAt=result.get("updated_at")
            )
    except:
        return None
    return None

async def delete_staff_member(id: str, agency_id: str, user_id: str) -> bool:
    collection = db.get_collection("employees")
    try:
        # Get employee details before deletion for notification
        employee = await collection.find_one({"_id": ObjectId(id)})
        if employee:
            result = await collection.delete_one({"_id": ObjectId(id)})
            if result.deleted_count > 0:
                # Create notification for staff member deletion
                await create_notification(
                    NotificationInput(
                        type="employee_deleted",
                        title="Staff Member Deleted",
                        message=f"Staff member {employee['name']} has been deleted",
                        entity_id=str(employee["_id"]),
                        entity_type="employee",
                        user_id=user_id,
                        is_read=False
                    ),
                    employee["agency"],
                    user_id
                )
                return True
        return False
    except:
        return False

@strawberry.type
class Query:
    @strawberry.field(name="staffMembers")
    @login_required
    @role_required("admin")
    async def staff_members(self, info: Info) -> List[Employee]:
        agency_id = info.context.user.get("agency")
        return await get_staff_members(agency_id)

    @strawberry.field(name="staffMember")
    @login_required
    @role_required("admin")
    async def staff_member(self, info: Info, id: str) -> Optional[Employee]:
        return await get_staff_member(id)

@strawberry.type
class Mutation:
    @strawberry.mutation(name="createStaffMember")
    @login_required
    @role_required("admin")
    async def create_staff_member(self, info: Info, employee_input: EmployeeInput) -> Employee:
        agency_id = info.context.user.get("agency")
        user_id = str(info.context.user.get("_id"))  # Convert ObjectId to string
        return await create_staff_member(employee_input, agency_id, user_id)

    @strawberry.mutation(name="updateStaffMember")
    @login_required
    @role_required("admin")
    async def update_staff_member(
        self, info: Info, id: str, employee_input: EmployeeUpdateInput
    ) -> Optional[Employee]:
        agency_id = info.context.user.get("agency")
        user_id = str(info.context.user.get("_id"))  # Convert ObjectId to string
        return await update_staff_member(id, employee_input, agency_id, user_id)
    
    @strawberry.mutation(name="deleteStaffMember")
    @login_required
    @role_required("admin")
    async def delete_staff_member(self, info: Info, id: str) -> bool:
        agency_id = info.context.user.get("agency")
        user_id = str(info.context.user.get("_id"))  # Convert ObjectId to string
        return await delete_staff_member(id, agency_id, user_id)
