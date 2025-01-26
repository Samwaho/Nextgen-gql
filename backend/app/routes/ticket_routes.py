import strawberry
from typing import List, Optional
from datetime import datetime
from bson import ObjectId
from ..config.database import db
from ..schemas.tickets_schemas import Ticket, TicketInput, TicketUpdateInput
from ..schemas.notification_schemas import NotificationInput
from ..routes.notification_routes import create_notification
from ..utils.decorators import login_required, role_required
from strawberry.types import Info

async def get_tickets(agency_id: Optional[str] = None) -> List[Ticket]:
    collection = db.get_collection("tickets")
    query = {"agency": agency_id} if agency_id else {}
    tickets_data = await collection.find(query).sort("created_at", -1).to_list(None)
    return [
        Ticket(
            id=str(ticket["_id"]),
            customer=ticket["customer"],
            assignedEmployee=ticket.get("assigned_employee"),
            status=ticket["status"],
            title=ticket["title"],
            description=ticket["description"],
            priority=ticket["priority"],
            agency=ticket["agency"],
            createdAt=ticket.get("created_at", datetime.utcnow()),
            updatedAt=ticket.get("updated_at")
        ) for ticket in tickets_data
    ]

async def get_ticket(id: str) -> Optional[Ticket]:
    collection = db.get_collection("tickets")
    try:
        ticket = await collection.find_one({"_id": ObjectId(id)})
        if ticket:
            return Ticket(
                id=str(ticket["_id"]),
                customer=ticket["customer"],
                assignedEmployee=ticket.get("assigned_employee"),
                status=ticket["status"],
                title=ticket["title"],
                description=ticket["description"],
                priority=ticket["priority"],
                agency=ticket["agency"],
                createdAt=ticket.get("created_at", datetime.utcnow()),
                updatedAt=ticket.get("updated_at")
            )
    except:
        return None
    return None

async def create_ticket(ticket_input: TicketInput, agency_id: str, user_id: str) -> Ticket:
    collection = db.get_collection("tickets")
    now = datetime.utcnow()
    
    ticket_data = {
        "customer": ticket_input.customer,
        "assigned_employee": ticket_input.assignedEmployee,
        "status": ticket_input.status,
        "title": ticket_input.title,
        "description": ticket_input.description,
        "priority": ticket_input.priority,
        "agency": agency_id,
        "created_at": now,
        "updated_at": now
    }
    
    result = await collection.insert_one(ticket_data)
    ticket_data["_id"] = result.inserted_id
    
    # Create notification for new ticket
    assignment_info = f" and assigned to {ticket_input.assignedEmployee}" if ticket_input.assignedEmployee else ""
    await create_notification(
        NotificationInput(
            type="ticket_created",
            title="New Support Ticket Created",
            message=f"Ticket '{ticket_input.title}' has been created with {ticket_input.priority} priority{assignment_info}",
            entity_id=str(result.inserted_id),
            entity_type="ticket",
            is_read=False
        ),
        agency_id,
        user_id
    )
    
    return Ticket(
        id=str(ticket_data["_id"]),
        customer=ticket_data["customer"],
        assignedEmployee=ticket_data.get("assigned_employee"),
        status=ticket_data["status"],
        title=ticket_data["title"],
        description=ticket_data["description"],
        priority=ticket_data["priority"],
        agency=ticket_data["agency"],
        createdAt=ticket_data["created_at"],
        updatedAt=ticket_data["updated_at"]
    )

async def update_ticket(id: str, ticket_input: TicketUpdateInput, agency_id: str, user_id: str) -> Optional[Ticket]:
    collection = db.get_collection("tickets")
    now = datetime.utcnow()
    
    # Build update data
    update_data = {
        "updated_at": now
    }
    
    # Track changes for notification message
    changes = []
    
    if ticket_input.status is not None:
        update_data["status"] = ticket_input.status
        changes.append(f"Status changed to '{ticket_input.status}'")
    
    if ticket_input.priority is not None:
        update_data["priority"] = ticket_input.priority
        changes.append(f"Priority changed to '{ticket_input.priority}'")
    
    if ticket_input.assignedEmployee is not None:
        update_data["assigned_employee"] = ticket_input.assignedEmployee
        changes.append(f"Assigned to {ticket_input.assignedEmployee}")
    
    if ticket_input.title is not None:
        update_data["title"] = ticket_input.title
        changes.append("Title updated")
    
    if ticket_input.description is not None:
        update_data["description"] = ticket_input.description
        changes.append("Description updated")
    
    try:
        result = await collection.find_one_and_update(
            {"_id": ObjectId(id)},
            {"$set": update_data},
            return_document=True
        )
        
        if result:
            # Create notification for ticket update
            changes_info = ", ".join(changes)
            await create_notification(
                NotificationInput(
                    type="ticket_updated",
                    title="Support Ticket Updated",
                    message=f"Ticket '{result['title']}' has been updated. {changes_info}",
                    entity_id=str(result["_id"]),
                    entity_type="ticket",
                    is_read=False
                ),
                agency_id,
                user_id
            )
            
            return Ticket(
                id=str(result["_id"]),
                customer=result["customer"],
                assignedEmployee=result.get("assigned_employee"),
                status=result["status"],
                title=result["title"],
                description=result["description"],
                priority=result["priority"],
                agency=result["agency"],
                createdAt=result.get("created_at", datetime.utcnow()),
                updatedAt=result.get("updated_at")
            )
    except Exception as e:
        print(f"Error updating ticket: {str(e)}")
        return None
    return None

async def delete_ticket(id: str, agency_id: str, user_id: str) -> bool:
    collection = db.get_collection("tickets")
    try:
        # Get ticket details before deletion for notification
        ticket = await collection.find_one({"_id": ObjectId(id)})
        if ticket:
            result = await collection.delete_one({"_id": ObjectId(id)})
            if result.deleted_count > 0:
                # Create notification for ticket deletion
                await create_notification(
                    NotificationInput(
                        type="ticket_deleted",
                        title="Support Ticket Deleted",
                        message=f"Ticket '{ticket['title']}' has been deleted",
                        entity_id=str(ticket["_id"]),
                        entity_type="ticket",
                        is_read=False
                    ),
                    agency_id,
                    user_id
                )
                return True
        return False
    except Exception as e:
        print(f"Error deleting ticket: {str(e)}")
        return False

@strawberry.type
class Query:
    @strawberry.field
    @login_required
    async def tickets(self, info: Info) -> List[Ticket]:
        agency_id = info.context.user.get("agency")
        return await get_tickets(agency_id)

    @strawberry.field
    @login_required
    async def ticket(self, info: Info, id: str) -> Optional[Ticket]:
        return await get_ticket(id)

@strawberry.type
class Mutation:
    @strawberry.mutation
    @login_required
    async def create_ticket(self, info: Info, ticket_input: TicketInput) -> Ticket:
        agency_id = info.context.user.get("agency")
        user_id = str(info.context.user.get("_id"))  # Convert ObjectId to string
        return await create_ticket(ticket_input, agency_id, user_id)

    @strawberry.mutation
    @login_required
    async def update_ticket(
        self, info: Info, id: str, ticket_input: TicketUpdateInput
    ) -> Optional[Ticket]:
        agency_id = info.context.user.get("agency")
        user_id = str(info.context.user.get("_id"))  # Convert ObjectId to string
        return await update_ticket(id, ticket_input, agency_id, user_id)
    
    @strawberry.mutation
    @login_required
    async def delete_ticket(self, info: Info, id: str) -> bool:
        agency_id = info.context.user.get("agency")
        user_id = str(info.context.user.get("_id"))  # Convert ObjectId to string
        return await delete_ticket(id, agency_id, user_id)
