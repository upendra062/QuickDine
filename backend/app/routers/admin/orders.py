from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models.order import Order
from app.routers.deps import require_admin
from app.schemas.order import OrderOut, OrderStatusUpdate
from app.ws.manager import manager

router = APIRouter(prefix="/api/admin/orders", tags=["admin-orders"])

VALID_STATUSES = {"pending", "preparing", "ready", "served", "cancelled"}


@router.get("", response_model=list[OrderOut])
async def list_orders(
    status: str | None = None,
    table_id: int | None = None,
    db: AsyncSession = Depends(get_db),
    _=Depends(require_admin),
):
    q = select(Order).order_by(Order.created_at.desc())
    if status:
        q = q.where(Order.status == status)
    if table_id:
        q = q.where(Order.table_id == table_id)
    return (await db.execute(q)).scalars().all()


@router.put("/{order_id}/status", response_model=OrderOut)
async def update_status(order_id: str, body: OrderStatusUpdate, db: AsyncSession = Depends(get_db), _=Depends(require_admin)):
    if body.status not in VALID_STATUSES:
        raise HTTPException(status_code=400, detail="Invalid status")
    order = await db.get(Order, order_id)
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    order.status = body.status
    await db.commit()
    await db.refresh(order)
    await manager.broadcast_many(["kitchen", "admin", f"order_{order_id}"], {
        "type": "status_change",
        "data": {"id": order_id, "status": body.status},
    })
    return order
