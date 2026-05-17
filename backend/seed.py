"""Run: python seed.py — seeds default admin, tables, menu, settings, and coupons."""
import asyncio

from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

from app.config import settings
from app.models.coupon import Coupon
from app.models.menu import MenuCategory, MenuItem
from app.models.settings import RestaurantSetting
from app.models.table import Table
from app.models.user import Admin
from app.services.auth import hash_password

engine = create_async_engine(settings.DATABASE_URL)
Session = async_sessionmaker(engine, expire_on_commit=False)

CATEGORIES = [
    {"id": "starters", "name": "Starters", "emoji": "🥗", "color": "#ff6b6b", "display_order": 1},
    {"id": "main", "name": "Main Course", "emoji": "🍛", "color": "#fbbf24", "display_order": 2},
    {"id": "desserts", "name": "Desserts", "emoji": "🍰", "color": "#f472b6", "display_order": 3},
    {"id": "drinks", "name": "Drinks", "emoji": "🥤", "color": "#00c6ff", "display_order": 4},
    {"id": "combos", "name": "Combos", "emoji": "🍱", "color": "#00ff87", "display_order": 5},
]

ITEMS = [
    {"cat_id": "starters", "name": "Paneer Tikka", "description": "Marinated cottage cheese grilled to perfection", "price": 299, "is_veg": True, "tag": "Bestseller", "img_url": "https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=400&q=80", "display_order": 1},
    {"cat_id": "starters", "name": "Crispy Calamari", "description": "Golden fried squid with lemon aioli", "price": 349, "is_veg": False, "tag": "Chef Pick", "img_url": "https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=400&q=80", "display_order": 2},
    {"cat_id": "starters", "name": "Bruschetta", "description": "Toasted bread with tomatoes & basil", "price": 199, "is_veg": True, "img_url": "https://images.unsplash.com/photo-1572695157366-5e585ab2b69f?w=400&q=80", "display_order": 3},
    {"cat_id": "main", "name": "Butter Chicken", "description": "Rich tomato-based curry with tender chicken", "price": 449, "is_veg": False, "tag": "Bestseller", "img_url": "https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=400&q=80", "display_order": 1},
    {"cat_id": "main", "name": "Dal Makhani", "description": "Slow-cooked black lentils in buttery sauce", "price": 329, "is_veg": True, "img_url": "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400&q=80", "display_order": 2},
    {"cat_id": "main", "name": "Grilled Salmon", "description": "Norwegian salmon with herb butter & veggies", "price": 699, "is_veg": False, "tag": "Premium", "img_url": "https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=400&q=80", "display_order": 3},
    {"cat_id": "main", "name": "Margherita Pizza", "description": "Classic Italian with fresh mozzarella & basil", "price": 399, "is_veg": True, "img_url": "https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?w=400&q=80", "display_order": 4},
    {"cat_id": "desserts", "name": "Gulab Jamun", "description": "Soft milk dumplings in sugar syrup", "price": 149, "is_veg": True, "tag": "Popular", "img_url": "https://images.unsplash.com/photo-1589308078059-be1415eab4c3?w=400&q=80", "display_order": 1},
    {"cat_id": "desserts", "name": "Chocolate Lava Cake", "description": "Warm chocolate cake with molten center", "price": 249, "is_veg": True, "tag": "Must Try", "img_url": "https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=400&q=80", "display_order": 2},
    {"cat_id": "desserts", "name": "Mango Kulfi", "description": "Traditional Indian frozen dessert with mango", "price": 129, "is_veg": True, "img_url": "https://images.unsplash.com/photo-1570197788417-0e82375c9371?w=400&q=80", "display_order": 3},
    {"cat_id": "drinks", "name": "Mango Lassi", "description": "Chilled yogurt drink with fresh mango", "price": 149, "is_veg": True, "img_url": "https://images.unsplash.com/photo-1544145945-f90425340c7e?w=400&q=80", "display_order": 1},
    {"cat_id": "drinks", "name": "Cold Brew Coffee", "description": "Smooth 24-hour cold brew with cream", "price": 199, "is_veg": True, "tag": "New", "img_url": "https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=400&q=80", "display_order": 2},
    {"cat_id": "drinks", "name": "Virgin Mojito", "description": "Refreshing mint lime soda", "price": 129, "is_veg": True, "img_url": "https://images.unsplash.com/photo-1546173159-315724a31696?w=400&q=80", "display_order": 3},
    {"cat_id": "combos", "name": "Family Feast", "description": "Butter chicken + Dal + 4 Naans + Dessert", "price": 1299, "is_veg": False, "tag": "Best Value", "img_url": "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=400&q=80", "display_order": 1},
    {"cat_id": "combos", "name": "Veg Thali", "description": "Dal + Paneer + Rice + Roti + Dessert + Lassi", "price": 599, "is_veg": True, "tag": "Popular", "img_url": "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&q=80", "display_order": 2},
]

DEFAULT_SETTINGS = {
    "rest_name": "NOVA Eats",
    "tagline": "Smart Dining, Redefined",
    "tax_rate": "5",
    "voice_enabled": "true",
    "points_per_rupee": "1",
    "points_value": "0.1",
    "min_redemption": "100",
}

DEFAULT_COUPONS = [
    {"code": "NOVA20", "discount": 20, "type": "percent"},
    {"code": "FLAT50", "discount": 50, "type": "flat"},
    {"code": "WELCOME10", "discount": 10, "type": "percent"},
]


async def seed():
    async with Session() as db:
        # Admin
        admin = await db.get(Admin, 1)
        if not admin:
            db.add(Admin(username="admin", password_hash=hash_password("nova123"), role="admin"))

        # Tables (20 tables)
        for i in range(1, 21):
            if not await db.get(Table, i):
                db.add(Table(id=i, name=str(i)))

        # Categories
        for cat in CATEGORIES:
            if not await db.get(MenuCategory, cat["id"]):
                db.add(MenuCategory(**cat))

        await db.flush()

        # Items
        items_exist = (await db.execute(
            __import__("sqlalchemy", fromlist=["select"]).select(MenuItem)
        )).scalars().first()
        if not items_exist:
            for item in ITEMS:
                db.add(MenuItem(**item))

        # Settings
        for key, value in DEFAULT_SETTINGS.items():
            if not await db.get(RestaurantSetting, key):
                db.add(RestaurantSetting(key=key, value=value))

        # Coupons
        for cp in DEFAULT_COUPONS:
            if not await db.get(Coupon, cp["code"]):
                db.add(Coupon(**cp))

        await db.commit()
        print("✅ Database seeded successfully")


if __name__ == "__main__":
    asyncio.run(seed())
