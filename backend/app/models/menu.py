from datetime import datetime
from sqlalchemy import Boolean, DateTime, Float, ForeignKey, Integer, String, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class MenuCategory(Base):
    __tablename__ = "menu_categories"

    id: Mapped[str] = mapped_column(String, primary_key=True)
    name: Mapped[str] = mapped_column(String, nullable=False)
    emoji: Mapped[str] = mapped_column(String, default="🍽️")
    color: Mapped[str] = mapped_column(String, default="#00ff87")
    display_order: Mapped[int] = mapped_column(Integer, default=0)

    items: Mapped[list["MenuItem"]] = relationship("MenuItem", back_populates="category", cascade="all, delete-orphan")


class MenuItem(Base):
    __tablename__ = "menu_items"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    cat_id: Mapped[str] = mapped_column(String, ForeignKey("menu_categories.id"), nullable=False)
    name: Mapped[str] = mapped_column(String, nullable=False)
    description: Mapped[str] = mapped_column(String, default="")
    price: Mapped[float] = mapped_column(Float, nullable=False)
    is_veg: Mapped[bool] = mapped_column(Boolean, default=True)
    tag: Mapped[str | None] = mapped_column(String, nullable=True)
    img_url: Mapped[str] = mapped_column(String, default="")
    available: Mapped[bool] = mapped_column(Boolean, default=True)
    display_order: Mapped[int] = mapped_column(Integer, default=0)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())

    category: Mapped["MenuCategory"] = relationship("MenuCategory", back_populates="items")
    reviews: Mapped[list["Review"]] = relationship("Review", back_populates="item")
