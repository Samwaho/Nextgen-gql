import strawberry
from typing import List, Optional
from datetime import datetime
from bson import ObjectId
from ..config.database import db
from ..schemas.tickets_schemas import Ticket, TicketInput, TicketUpdateInput
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

async def create_ticket(ticket_input: TicketInput, agency_id: str) -> Ticket:
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

async def update_ticket(id: str, ticket_input: TicketUpdateInput) -> Optional[Ticket]:
    collection = db.get_collection("tickets")
    update_data = {
        "updated_at": datetime.utcnow()
    }
    
    for field in [
        "customer", "status", "title",
        "description", "priority"
    ]:
        value = getattr(ticket_input, field)
        if value is not None:
            update_data[field] = value
    
    if hasattr(ticket_input, 'assignedEmployee'):
        update_data["assigned_employee"] = ticket_input.assignedEmployee
    
    try:
        result = await collection.find_one_and_update(
            {"_id": ObjectId(id)},
            {"$set": update_data},
            return_document=True
        )
        if result:
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
    except:
        return None
    return None

async def delete_ticket(id: str) -> bool:
    collection = db.get_collection("tickets")
    try:
        result = await collection.delete_one({"_id": ObjectId(id)})
        return result.deleted_count > 0
    except:
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
        return await create_ticket(ticket_input, agency_id)

    @strawberry.mutation
    @login_required
    async def update_ticket(
        self, info: Info, id: str, ticket_input: TicketUpdateInput
    ) -> Optional[Ticket]:
        return await update_ticket(id, ticket_input)
    
    @strawberry.mutation
    @login_required
    async def delete_ticket(self, info: Info, id: str) -> bool:
        return await delete_ticket(id)
