import strawberry
from typing import Optional
from .auth_schema import Query as AuthQuery, AuthMutation
from .agency_schemas import AgencyQuery, AgencyMutation

@strawberry.type
class Query(AuthQuery, AgencyQuery):
    pass

@strawberry.type
class Mutation(AuthMutation, AgencyMutation):
    pass

schema = strawberry.Schema(
    query=Query,
    mutation=Mutation
) 