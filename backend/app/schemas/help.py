from datetime import datetime
from pydantic import BaseModel


class HelpCreate(BaseModel):
    table_id: int
    guest_name: str
    type: str
    message: str = ""


class HelpOut(BaseModel):
    id: int
    table_id: int
    guest_name: str
    type: str
    message: str
    status: str
    created_at: datetime
    resolved_at: datetime | None

    model_config = {"from_attributes": True}
