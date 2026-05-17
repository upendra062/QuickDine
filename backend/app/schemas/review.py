from datetime import datetime
from pydantic import BaseModel


class ReviewCreate(BaseModel):
    item_id: int
    order_id: str | None = None
    phone: str | None = None
    reviewer_name: str
    rating: int
    comment: str = ""


class ReviewOut(BaseModel):
    id: int
    item_id: int
    reviewer_name: str
    rating: int
    comment: str
    created_at: datetime

    model_config = {"from_attributes": True}
