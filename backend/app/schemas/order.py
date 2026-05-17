from datetime import datetime
from pydantic import BaseModel


class CartItem(BaseModel):
    id: int
    name: str
    price: float
    qty: int
    img_url: str = ""
    is_veg: bool = True


class OrderCreate(BaseModel):
    table_id: int
    guest_name: str
    phone: str | None = None
    items: list[CartItem]
    pay_mode: str = "pay_later"
    coupon_code: str | None = None
    points_redeemed: int = 0


class OrderItemOut(BaseModel):
    id: int
    item_id: int
    item_name: str
    qty: int
    unit_price: float

    model_config = {"from_attributes": True}


class OrderOut(BaseModel):
    id: str
    table_id: int
    guest_name: str
    phone: str | None
    items: list
    subtotal: float
    tax: float
    discount: float
    total: float
    pay_mode: str
    status: str
    coupon_code: str | None
    points_redeemed: int
    created_at: datetime

    model_config = {"from_attributes": True}


class OrderStatusUpdate(BaseModel):
    status: str
