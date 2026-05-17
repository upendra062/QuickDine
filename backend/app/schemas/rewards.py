from datetime import datetime
from pydantic import BaseModel


class RewardsOut(BaseModel):
    phone: str
    name: str
    points: int
    total_spent: float
    coupons: list["UserCouponOut"]


class UserCouponOut(BaseModel):
    id: int
    code: str
    points_used: int
    discount: float
    used: bool
    expires_at: datetime | None

    model_config = {"from_attributes": True}


class RedeemRequest(BaseModel):
    phone: str
    points_to_redeem: int


class RedeemOut(BaseModel):
    code: str
    discount: float
    points_used: int
    expires_at: datetime


class RewardConfig(BaseModel):
    points_per_rupee: float = 1.0
    points_value: float = 0.1
    min_redemption: int = 100
