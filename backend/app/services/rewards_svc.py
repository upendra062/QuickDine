import random
import string
from datetime import datetime, timedelta, timezone

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.coupon import Coupon, UserCoupon
from app.models.settings import RestaurantSetting
from app.models.user import LoyaltyUser


async def _get_config(db: AsyncSession) -> dict:
    rows = await db.execute(
        select(RestaurantSetting).where(
            RestaurantSetting.key.in_(["points_per_rupee", "points_value", "min_redemption"])
        )
    )
    cfg = {r.key: float(r.value) for r in rows.scalars()}
    return {
        "points_per_rupee": cfg.get("points_per_rupee", 1.0),
        "points_value": cfg.get("points_value", 0.1),
        "min_redemption": int(cfg.get("min_redemption", 100)),
    }


async def add_points(db: AsyncSession, phone: str, name: str, amount: float) -> int:
    cfg = await _get_config(db)
    pts = int(amount * cfg["points_per_rupee"])
    user = await db.get(LoyaltyUser, phone)
    if user:
        user.points += pts
        user.total_spent += amount
    else:
        user = LoyaltyUser(phone=phone, name=name, points=pts, total_spent=amount)
        db.add(user)
    await db.commit()
    return user.points


async def redeem_points(db: AsyncSession, phone: str, points_to_redeem: int) -> Coupon | None:
    cfg = await _get_config(db)
    if points_to_redeem < cfg["min_redemption"]:
        return None
    user = await db.get(LoyaltyUser, phone)
    if not user or user.points < points_to_redeem:
        return None

    rupee_value = int(points_to_redeem * cfg["points_value"])
    code = "RWD" + phone[-4:] + "".join(random.choices(string.digits, k=4))
    expires = datetime.now(timezone.utc) + timedelta(days=90)

    user.points -= points_to_redeem
    coupon = Coupon(code=code, discount=rupee_value, type="flat", expires_at=expires, source="user_reward")
    user_coupon = UserCoupon(
        phone=phone, code=code, points_used=points_to_redeem,
        discount=rupee_value, expires_at=expires,
    )
    db.add(coupon)
    db.add(user_coupon)
    await db.commit()
    await db.refresh(coupon)
    return coupon
