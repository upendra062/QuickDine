from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models.settings import RestaurantSetting

router = APIRouter(prefix="/api/settings", tags=["settings"])


@router.get("")
async def get_settings(db: AsyncSession = Depends(get_db)) -> dict:
    rows = (await db.execute(select(RestaurantSetting))).scalars().all()
    return {r.key: r.value for r in rows}
