from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models.premium import PremiumMember
from app.models.table import Table
from app.models.user import LoyaltyUser
from app.schemas.auth import GuestSessionCreate, GuestSessionOut
from app.services.auth import create_token

router = APIRouter(prefix="/api/sessions", tags=["sessions"])


@router.post("", response_model=GuestSessionOut)
async def create_session(body: GuestSessionCreate, db: AsyncSession = Depends(get_db)):
    table = await db.get(Table, body.table_id)
    if not table:
        raise HTTPException(status_code=404, detail="Table not found")

    is_premium = False
    if body.phone:
        phone = body.phone.replace(" ", "").replace("-", "")
        member = await db.get(PremiumMember, phone)
        is_premium = member is not None

        user = await db.get(LoyaltyUser, phone)
        if not user:
            db.add(LoyaltyUser(phone=phone, name=body.name))
            await db.commit()

    token = create_token({
        "type": "guest",
        "name": body.name,
        "phone": body.phone,
        "table_id": body.table_id,
        "is_premium": is_premium,
    })

    return GuestSessionOut(
        access_token=token,
        name=body.name,
        phone=body.phone,
        table_id=body.table_id,
        is_premium=is_premium,
    )
