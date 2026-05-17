from datetime import datetime, timezone
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models.coupon import Coupon
from app.schemas.coupon import CouponValidateOut

router = APIRouter(prefix="/api/coupons", tags=["coupons"])


@router.get("/validate/{code}", response_model=CouponValidateOut)
async def validate_coupon(code: str, db: AsyncSession = Depends(get_db)):
    coupon = await db.get(Coupon, code.upper())
    if not coupon or coupon.used:
        return CouponValidateOut(valid=False, message="Invalid or already used")
    if coupon.expires_at and coupon.expires_at.replace(tzinfo=timezone.utc) < datetime.now(timezone.utc):
        return CouponValidateOut(valid=False, message="Coupon expired")
    return CouponValidateOut(valid=True, code=coupon.code, discount=coupon.discount,
                             type=coupon.type, message="Valid coupon")
