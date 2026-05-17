from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models.premium import PremiumMember, PremiumPricing
from app.routers.deps import require_admin

router = APIRouter(prefix="/api/admin/premium", tags=["admin-premium"])


class MemberCreate(BaseModel):
    phone: str
    name: str


class PricingSet(BaseModel):
    item_id: int
    price: float


@router.get("/members")
async def list_members(db: AsyncSession = Depends(get_db), _=Depends(require_admin)):
    rows = (await db.execute(select(PremiumMember))).scalars().all()
    return [{"phone": m.phone, "name": m.name, "added_at": m.added_at, "expires_at": m.expires_at} for m in rows]


@router.post("/members", status_code=201)
async def add_member(body: MemberCreate, db: AsyncSession = Depends(get_db), _=Depends(require_admin)):
    existing = await db.get(PremiumMember, body.phone)
    if existing:
        raise HTTPException(status_code=400, detail="Already a premium member")
    db.add(PremiumMember(phone=body.phone, name=body.name))
    await db.commit()
    return {"ok": True}


@router.delete("/members/{phone}", status_code=204)
async def remove_member(phone: str, db: AsyncSession = Depends(get_db), _=Depends(require_admin)):
    member = await db.get(PremiumMember, phone)
    if member:
        await db.delete(member)
        await db.commit()


@router.get("/pricing")
async def get_pricing(db: AsyncSession = Depends(get_db), _=Depends(require_admin)):
    rows = (await db.execute(select(PremiumPricing))).scalars().all()
    return {r.item_id: r.price for r in rows}


@router.post("/pricing")
async def set_pricing(body: PricingSet, db: AsyncSession = Depends(get_db), _=Depends(require_admin)):
    row = await db.get(PremiumPricing, body.item_id)
    if row:
        row.price = body.price
    else:
        db.add(PremiumPricing(item_id=body.item_id, price=body.price))
    await db.commit()
    return {"ok": True}


@router.delete("/pricing/{item_id}", status_code=204)
async def delete_pricing(item_id: int, db: AsyncSession = Depends(get_db), _=Depends(require_admin)):
    row = await db.get(PremiumPricing, item_id)
    if row:
        await db.delete(row)
        await db.commit()
