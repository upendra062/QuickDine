from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models.order import Order
from app.models.payment import Payment
from app.schemas.payment import PaymentCreate, PaymentOut, PaymentVerify
from app.services import razorpay_svc, rewards_svc
from app.ws.manager import manager

router = APIRouter(prefix="/api/payment", tags=["payment"])


@router.post("/create", response_model=dict)
async def create_payment(body: PaymentCreate, db: AsyncSession = Depends(get_db)):
    order = await db.get(Order, body.order_id)
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    try:
        rz_order = razorpay_svc.create_order(body.amount, body.order_id)
    except Exception:
        raise HTTPException(status_code=502, detail="Payment gateway error")

    payment = Payment(order_id=body.order_id, method=body.method, amount=body.amount,
                      razorpay_order_id=rz_order["id"])
    db.add(payment)
    await db.commit()
    return {"razorpay_order_id": rz_order["id"], "amount": int(body.amount * 100)}


@router.post("/verify", response_model=PaymentOut)
async def verify_payment(body: PaymentVerify, db: AsyncSession = Depends(get_db)):
    if not razorpay_svc.verify_signature(body.razorpay_order_id, body.razorpay_payment_id, body.razorpay_signature):
        raise HTTPException(status_code=400, detail="Invalid payment signature")

    order = await db.get(Order, body.order_id)
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    payment = order.payment
    if payment:
        payment.razorpay_payment_id = body.razorpay_payment_id
        payment.status = "paid"
    order.status = "preparing"
    await db.commit()

    if order.phone:
        from app.models.user import LoyaltyUser
        user = await db.get(LoyaltyUser, order.phone)
        name = user.name if user else order.guest_name
        await rewards_svc.add_points(db, order.phone, name, order.total)

    await manager.broadcast_many(["kitchen", "admin"], {
        "type": "status_change",
        "data": {"id": order.id, "status": "preparing"},
    })

    await db.refresh(payment)
    return payment
