import random
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models.coupon import Coupon
from app.models.order import Order, OrderItem
from app.models.settings import RestaurantSetting
from app.models.table import Table
from app.schemas.order import OrderCreate, OrderOut
from app.ws.manager import manager

router = APIRouter(prefix="/api/orders", tags=["orders"])


async def _tax_rate(db: AsyncSession) -> float:
    row = await db.get(RestaurantSetting, "tax_rate")
    return float(row.value) / 100 if row else 0.05


@router.post("", response_model=OrderOut)
async def place_order(body: OrderCreate, db: AsyncSession = Depends(get_db)):
    table = await db.get(Table, body.table_id)
    if not table:
        raise HTTPException(status_code=404, detail="Table not found")

    subtotal = sum(i.price * i.qty for i in body.items)
    discount = 0.0

    if body.coupon_code:
        coupon = await db.get(Coupon, body.coupon_code.upper())
        if coupon and not coupon.used:
            discount = coupon.discount if coupon.type == "flat" else subtotal * coupon.discount / 100
            coupon.used = True
            coupon.used_by_phone = body.phone

    if body.points_redeemed > 0:
        cfg_row = await db.get(RestaurantSetting, "points_value")
        pv = float(cfg_row.value) if cfg_row else 0.1
        discount += body.points_redeemed * pv

    tax_rate = await _tax_rate(db)
    taxable = max(subtotal - discount, 0)
    tax = round(taxable * tax_rate, 2)
    total = round(taxable + tax, 2)

    order_id = f"T{body.table_id}-{random.randint(1000, 9999)}"
    order = Order(
        id=order_id, table_id=body.table_id, guest_name=body.guest_name,
        phone=body.phone, items=[i.model_dump() for i in body.items],
        subtotal=subtotal, tax=tax, discount=discount, total=total,
        pay_mode=body.pay_mode, coupon_code=body.coupon_code,
        points_redeemed=body.points_redeemed,
    )
    db.add(order)
    for i in body.items:
        db.add(OrderItem(order_id=order_id, item_id=i.id, item_name=i.name, qty=i.qty, unit_price=i.price))

    table.is_occupied = True
    await db.commit()
    await db.refresh(order)

    payload = {"type": "new_order", "data": {"id": order_id, "table_id": body.table_id, "guest_name": body.guest_name, "total": total, "status": "pending"}}
    await manager.broadcast_many(["kitchen", "admin"], payload)

    return order


@router.get("/{order_id}", response_model=OrderOut)
async def get_order(order_id: str, db: AsyncSession = Depends(get_db)):
    order = await db.get(Order, order_id)
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    return order


@router.get("", response_model=list[OrderOut])
async def list_orders(phone: str | None = None, table_id: int | None = None, db: AsyncSession = Depends(get_db)):
    q = select(Order).order_by(Order.created_at.desc())
    if phone:
        q = q.where(Order.phone == phone)
    if table_id:
        q = q.where(Order.table_id == table_id)
    rows = await db.execute(q)
    return rows.scalars().all()
