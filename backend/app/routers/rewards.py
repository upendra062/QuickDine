from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models.coupon import UserCoupon
from app.models.user import LoyaltyUser
from app.schemas.rewards import RedeemOut, RedeemRequest, RewardsOut, UserCouponOut
from app.services import rewards_svc

router = APIRouter(prefix="/api/rewards", tags=["rewards"])


@router.get("/{phone}", response_model=RewardsOut)
async def get_rewards(phone: str, db: AsyncSession = Depends(get_db)):
    user = await db.get(LoyaltyUser, phone)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    coupons = (await db.execute(select(UserCoupon).where(UserCoupon.phone == phone))).scalars().all()
    return RewardsOut(
        phone=user.phone, name=user.name, points=user.points,
        total_spent=user.total_spent, coupons=list(coupons),
    )


@router.post("/redeem", response_model=RedeemOut)
async def redeem_points(body: RedeemRequest, db: AsyncSession = Depends(get_db)):
    coupon = await rewards_svc.redeem_points(db, body.phone, body.points_to_redeem)
    if not coupon:
        raise HTTPException(status_code=400, detail="Insufficient points or below minimum redemption")
    return RedeemOut(code=coupon.code, discount=coupon.discount,
                     points_used=body.points_to_redeem, expires_at=coupon.expires_at)
