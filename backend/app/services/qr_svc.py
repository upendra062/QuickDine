import io

import qrcode
from qrcode.image.pure import PyPNGImage

from app.config import settings


def generate_table_qr(table_id: int) -> bytes:
    url = f"{settings.FRONTEND_URL}/?table={table_id}"
    img = qrcode.make(url, image_factory=PyPNGImage)
    buf = io.BytesIO()
    img.save(buf)
    return buf.getvalue()
