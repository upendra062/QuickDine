import io

import qrcode
from qrcode.image.pil import PilImage

from app.config import settings


def generate_table_qr(table_id: int) -> bytes:
    url = f"{settings.FRONTEND_URL}/?table={table_id}"
    img = qrcode.make(url, image_factory=PilImage)
    buf = io.BytesIO()
    img.save(buf, format="PNG")
    return buf.getvalue()
