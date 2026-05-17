from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models.coupon import Coupon
from app.routers.deps import require_admin
from app.schemas.coupon import CouponCreate, CouponOut

router = APIRouter(prefix="/api/admin/coupons", tags=["admin-coupons"])


@router.get("", response_model=list[CouponOut])
async def list_coupons(db: AsyncSession = Depends(get_db), _=Depends(require_admin)):
    return (await db.execute(select(Coupon).order_by(Coupon.created_at.desc()))).scalars().all()


@router.post("", response_model=CouponOut)
async def create_coupon(body: CouponCreate, db: AsyncSession = Depends(get_db), _=Depends(require_admin)):
    existing = await db.get(Coupon, body.code.upper())
    if existing:
        raise HTTPException(status_code=400, detail="Coupon code already exists")
    coupon = Coupon(code=body.code.upper(), discount=body.discount, type=body.type, expires_at=body.expires_at)
    db.add(coupon)
    await db.commit()
    await db.refresh(coupon)
    return coupon


@router.delete("/{code}", status_code=204)
async def delete_coupon(code: str, db: AsyncSession = Depends(get_db), _=Depends(require_admin)):
    coupon = await db.get(Coupon, code.upper())
    if coupon:
        await db.delete(coupon)
        await db.commit()
