import hashlib
import hmac

import razorpay

from app.config import settings

_client = razorpay.Client(auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET))


def create_order(amount_inr: float, receipt: str) -> dict:
    return _client.order.create({
        "amount": int(amount_inr * 100),
        "currency": "INR",
        "receipt": receipt,
    })


def verify_signature(razorpay_order_id: str, razorpay_payment_id: str, signature: str) -> bool:
    body = f"{razorpay_order_id}|{razorpay_payment_id}"
    expected = hmac.new(
        settings.RAZORPAY_KEY_SECRET.encode(),
        body.encode(),
        hashlib.sha256,
    ).hexdigest()
    return hmac.compare_digest(expected, signature)
