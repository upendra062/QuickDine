from datetime import datetime, timedelta, timezone
from fastapi import APIRouter, Depends
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models.order import Order, OrderItem
from app.models.user import LoyaltyUser
from app.routers.deps import require_admin

router = APIRouter(prefix="/api/admin/analytics", tags=["admin-analytics"])


@router.get("")
async def get_analytics(db: AsyncSession = Depends(get_db), _=Depends(require_admin)):
    now = datetime.now(timezone.utc)
    today_start = now.replace(hour=0, minute=0, second=0, microsecond=0)

    orders = (await db.execute(select(Order))).scalars().all()
    today_orders = [o for o in orders if o.created_at >= today_start.replace(tzinfo=None)]

    revenue_7d = []
    for i in range(6, -1, -1):
        day = now - timedelta(days=i)
        day_start = day.replace(hour=0, minute=0, second=0, microsecond=0)
        day_end = day_start + timedelta(days=1)
        day_orders = [o for o in orders if day_start.replace(tzinfo=None) <= o.created_at < day_end.replace(tzinfo=None)]
        revenue_7d.append({
            "date": day_start.strftime("%b %d"),
            "revenue": sum(o.total for o in day_orders),
            "orders": len(day_orders),
        })

    item_counts: dict[str, dict] = {}
    for order in orders:
        for item in (order.items or []):
            iid = str(item.get("id"))
            if iid not in item_counts:
                item_counts[iid] = {"name": item.get("name"), "count": 0, "revenue": 0}
            item_counts[iid]["count"] += item.get("qty", 1)
            item_counts[iid]["revenue"] += item.get("price", 0) * item.get("qty", 1)

    popular = sorted(item_counts.values(), key=lambda x: x["count"], reverse=True)[:5]

    top_users = (await db.execute(
        select(LoyaltyUser).order_by(LoyaltyUser.points.desc()).limit(10)
    )).scalars().all()

    return {
        "today_revenue": sum(o.total for o in today_orders),
        "today_orders": len(today_orders),
        "total_revenue": sum(o.total for o in orders),
        "total_orders": len(orders),
        "revenue_7d": revenue_7d,
        "popular_items": popular,
        "top_customers": [{"phone": u.phone, "name": u.name, "points": u.points, "spent": u.total_spent} for u in top_users],
    }
