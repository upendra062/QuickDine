from datetime import datetime
from pydantic import BaseModel


class CouponCreate(BaseModel):
    code: str
    discount: float
    type: str = "percent"
    expires_at: datetime | None = None


class CouponOut(BaseModel):
    code: str
    discount: float
    type: str
    used: bool
    used_by_phone: str | None
    expires_at: datetime | None
    source: str
    created_at: datetime

    model_config = {"from_attributes": True}


class CouponValidateOut(BaseModel):
    valid: bool
    code: str | None = None
    discount: float | None = None
    type: str | None = None
    message: str = ""
