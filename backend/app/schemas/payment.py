from pydantic import BaseModel


class PaymentCreate(BaseModel):
    order_id: str
    amount: float
    method: str = "razorpay"


class PaymentVerify(BaseModel):
    order_id: str
    razorpay_order_id: str
    razorpay_payment_id: str
    razorpay_signature: str


class PaymentOut(BaseModel):
    id: int
    order_id: str
    method: str
    amount: float
    razorpay_order_id: str | None
    razorpay_payment_id: str | None
    status: str

    model_config = {"from_attributes": True}
