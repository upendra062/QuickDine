from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models.settings import RestaurantSetting
from app.models.user import LoyaltyUser
from app.routers.deps import require_admin
from app.schemas.rewards import RewardConfig

router = APIRouter(prefix="/api/admin/rewards", tags=["admin-rewards"])


@router.get("/users")
async def list_users(db: AsyncSession = Depends(get_db), _=Depends(require_admin)):
    users = (await db.execute(select(LoyaltyUser).order_by(LoyaltyUser.points.desc()))).scalars().all()
    return [{"phone": u.phone, "name": u.name, "points": u.points, "total_spent": u.total_spent} for u in users]


@router.get("/config", response_model=RewardConfig)
async def get_config(db: AsyncSession = Depends(get_db), _=Depends(require_admin)):
    rows = (await db.execute(select(RestaurantSetting).where(
        RestaurantSetting.key.in_(["points_per_rupee", "points_value", "min_redemption"])
    ))).scalars().all()
    cfg = {r.key: r.value for r in rows}
    return RewardConfig(
        points_per_rupee=float(cfg.get("points_per_rupee", 1.0)),
        points_value=float(cfg.get("points_value", 0.1)),
        min_redemption=int(float(cfg.get("min_redemption", 100))),
    )


@router.put("/config", response_model=RewardConfig)
async def update_config(body: RewardConfig, db: AsyncSession = Depends(get_db), _=Depends(require_admin)):
    updates = {
        "points_per_rupee": str(body.points_per_rupee),
        "points_value": str(body.points_value),
        "min_redemption": str(body.min_redemption),
    }
    for key, value in updates.items():
        row = await db.get(RestaurantSetting, key)
        if row:
            row.value = value
        else:
            db.add(RestaurantSetting(key=key, value=value))
    await db.commit()
    return body
