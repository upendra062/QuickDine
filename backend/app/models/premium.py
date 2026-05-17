from datetime import datetime
from sqlalchemy import DateTime, Float, ForeignKey, Integer, String, func
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base


class PremiumMember(Base):
    __tablename__ = "premium_members"

    phone: Mapped[str] = mapped_column(String, primary_key=True)
    name: Mapped[str] = mapped_column(String, nullable=False)
    added_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
    expires_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)


class PremiumPricing(Base):
    __tablename__ = "premium_pricing"

    item_id: Mapped[int] = mapped_column(Integer, ForeignKey("menu_items.id"), primary_key=True)
    price: Mapped[float] = mapped_column(Float, nullable=False)
