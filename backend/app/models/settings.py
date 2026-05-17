from sqlalchemy import String
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base


class RestaurantSetting(Base):
    __tablename__ = "restaurant_settings"

    key: Mapped[str] = mapped_column(String, primary_key=True)
    value: Mapped[str] = mapped_column(String, nullable=False)
