from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models.offer import Offer
from app.routers.deps import require_admin

router = APIRouter(prefix="/api/admin/offers", tags=["admin-offers"])


class OfferCreate(BaseModel):
    emoji: str = "🎉"
    title: str
    subtitle: str = ""
    active: bool = True


@router.get("")
async def list_offers(db: AsyncSession = Depends(get_db), _=Depends(require_admin)):
    return (await db.execute(select(Offer))).scalars().all()


@router.post("", status_code=201)
async def create_offer(body: OfferCreate, db: AsyncSession = Depends(get_db), _=Depends(require_admin)):
    offer = Offer(**body.model_dump())
    db.add(offer)
    await db.commit()
    await db.refresh(offer)
    return offer


@router.put("/{offer_id}")
async def update_offer(offer_id: int, body: OfferCreate, db: AsyncSession = Depends(get_db), _=Depends(require_admin)):
    offer = await db.get(Offer, offer_id)
    if not offer:
        raise HTTPException(status_code=404, detail="Not found")
    for k, v in body.model_dump().items():
        setattr(offer, k, v)
    await db.commit()
    await db.refresh(offer)
    return offer


@router.delete("/{offer_id}", status_code=204)
async def delete_offer(offer_id: int, db: AsyncSession = Depends(get_db), _=Depends(require_admin)):
    offer = await db.get(Offer, offer_id)
    if offer:
        await db.delete(offer)
        await db.commit()
