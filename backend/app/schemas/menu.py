from pydantic import BaseModel


class CategoryOut(BaseModel):
    id: str
    name: str
    emoji: str
    color: str
    display_order: int

    model_config = {"from_attributes": True}


class MenuItemOut(BaseModel):
    id: int
    cat_id: str
    name: str
    description: str
    price: float
    is_veg: bool
    tag: str | None
    img_url: str
    available: bool
    display_order: int
    avg_rating: float | None = None
    review_count: int = 0

    model_config = {"from_attributes": True}


class MenuItemCreate(BaseModel):
    cat_id: str
    name: str
    description: str = ""
    price: float
    is_veg: bool = True
    tag: str | None = None
    img_url: str = ""
    available: bool = True
    display_order: int = 0


class MenuItemUpdate(BaseModel):
    cat_id: str | None = None
    name: str | None = None
    description: str | None = None
    price: float | None = None
    is_veg: bool | None = None
    tag: str | None = None
    img_url: str | None = None
    available: bool | None = None
    display_order: int | None = None


class CategoryCreate(BaseModel):
    id: str
    name: str
    emoji: str = "🍽️"
    color: str = "#00ff87"
    display_order: int = 0


class CategoryUpdate(BaseModel):
    name: str | None = None
    emoji: str | None = None
    color: str | None = None
    display_order: int | None = None


class MenuOut(BaseModel):
    categories: list[CategoryOut]
    items: list[MenuItemOut]
