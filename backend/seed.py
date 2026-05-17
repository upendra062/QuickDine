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
    {"id": "starters",  "name": "Starters",      "emoji": "🔥", "color": "#F97316", "display_order": 1},
    {"id": "main",      "name": "Main Course",    "emoji": "🍛", "color": "#F59E0B", "display_order": 2},
    {"id": "breads",    "name": "Breads & Rice",  "emoji": "🫓", "color": "#EAB308", "display_order": 3},
    {"id": "desserts",  "name": "Desserts",       "emoji": "🍮", "color": "#EC4899", "display_order": 4},
    {"id": "drinks",    "name": "Drinks",         "emoji": "🥤", "color": "#22C55E", "display_order": 5},
    {"id": "combos",    "name": "Chef Specials",  "emoji": "👨‍🍳", "color": "#A855F7", "display_order": 6},
    {"id": "bar",       "name": "Premium Bar",    "emoji": "🍷", "color": "#7C3AED", "display_order": 7},
]

ITEMS = [
    # ── Starters ──────────────────────────────────────────────────────────────
    {
        "cat_id": "starters", "name": "Seekh Kebab", "display_order": 1,
        "description": "Spiced minced lamb on skewers, charcoal-grilled to perfection",
        "price": 320, "is_veg": False, "tag": "Bestseller",
        "img_url": "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=400&q=80",
    },
    {
        "cat_id": "starters", "name": "Paneer Shashlik", "display_order": 2,
        "description": "Tandoor-roasted cottage cheese with peppers & mint chutney",
        "price": 265, "is_veg": True, "tag": "Chef Pick",
        "img_url": "https://images.unsplash.com/photo-1631292784640-2b24be784d5d?w=400&q=80",
    },
    {
        "cat_id": "starters", "name": "Aloo Tikki Chaat", "display_order": 3,
        "description": "Crispy potato patties layered with chutneys, yogurt & pomegranate",
        "price": 185, "is_veg": True,
        "img_url": "https://images.unsplash.com/photo-1626132647523-66b69deb4cc1?w=400&q=80",
    },
    {
        "cat_id": "starters", "name": "Tandoori Chicken Wings", "display_order": 4,
        "description": "Overnight marinated wings straight from the clay oven",
        "price": 340, "is_veg": False, "tag": "Spicy",
        "img_url": "https://images.unsplash.com/photo-1527477396000-e27163b481c2?w=400&q=80",
    },
    # ── Main Course ───────────────────────────────────────────────────────────
    {
        "cat_id": "main", "name": "Rogan Josh", "display_order": 1,
        "description": "Slow-braised Kashmiri lamb in aromatic whole-spice gravy",
        "price": 525, "is_veg": False, "tag": "Bestseller",
        "img_url": "https://images.unsplash.com/photo-1455619452474-d2be8b1e70cd?w=400&q=80",
    },
    {
        "cat_id": "main", "name": "Palak Paneer", "display_order": 2,
        "description": "Velvety spinach gravy with fresh-pressed cottage cheese",
        "price": 295, "is_veg": True,
        "img_url": "https://images.unsplash.com/photo-1645177628172-a94c1f96e6db?w=400&q=80",
    },
    {
        "cat_id": "main", "name": "Prawn Masala", "display_order": 3,
        "description": "Tiger prawns in coastal coconut-tomato masala, finished with curry leaf",
        "price": 625, "is_veg": False, "tag": "Premium",
        "img_url": "https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?w=400&q=80",
    },
    {
        "cat_id": "main", "name": "Dal Bukhara", "display_order": 4,
        "description": "Overnight slow-cooked black lentils with cream & tomato",
        "price": 315, "is_veg": True, "tag": "House Special",
        "img_url": "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400&q=80",
    },
    # ── Breads & Rice ─────────────────────────────────────────────────────────
    {
        "cat_id": "breads", "name": "Peshwari Naan", "display_order": 1,
        "description": "Almond & coconut-stuffed flatbread from the tandoor",
        "price": 95, "is_veg": True, "tag": "New",
        "img_url": "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=400&q=80",
    },
    {
        "cat_id": "breads", "name": "Lamb Biryani", "display_order": 2,
        "description": "Dum-cooked basmati with tender lamb, saffron & caramelised onion",
        "price": 480, "is_veg": False, "tag": "Bestseller",
        "img_url": "https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=400&q=80",
    },
    # ── Desserts ──────────────────────────────────────────────────────────────
    {
        "cat_id": "desserts", "name": "Gulab Jamun", "display_order": 1,
        "description": "Soft milk-solids dumplings soaked in cardamom-rose syrup",
        "price": 145, "is_veg": True, "tag": "Classic",
        "img_url": "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400&q=80",
    },
    {
        "cat_id": "desserts", "name": "Mango Phirni", "display_order": 2,
        "description": "Slow-set ground rice pudding with fresh Alphonso mango",
        "price": 175, "is_veg": True, "tag": "Seasonal",
        "img_url": "https://images.unsplash.com/photo-1548345680-f5475ea5df84?w=400&q=80",
    },
    {
        "cat_id": "desserts", "name": "Dark Chocolate Kulfi", "display_order": 3,
        "description": "Rich dark chocolate frozen dessert with pistachio crumble",
        "price": 165, "is_veg": True, "tag": "Must Try",
        "img_url": "https://images.unsplash.com/photo-1488900128323-21503983a07e?w=400&q=80",
    },
    # ── Drinks ────────────────────────────────────────────────────────────────
    {
        "cat_id": "drinks", "name": "Masala Chai", "display_order": 1,
        "description": "House-blend spiced tea with full cream milk & ginger",
        "price": 85, "is_veg": True,
        "img_url": "https://images.unsplash.com/photo-1571934811356-5cc061b6821f?w=400&q=80",
    },
    {
        "cat_id": "drinks", "name": "Kesar Thandai", "display_order": 2,
        "description": "Chilled saffron & rose milk with crushed almonds",
        "price": 135, "is_veg": True, "tag": "Signature",
        "img_url": "https://images.unsplash.com/photo-1544145945-f90425340c7e?w=400&q=80",
    },
    {
        "cat_id": "drinks", "name": "Jaljeera Soda", "display_order": 3,
        "description": "Tangy cumin, mint & lemon sparkling cooler",
        "price": 110, "is_veg": True,
        "img_url": "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=400&q=80",
    },
    # ── Chef Specials ─────────────────────────────────────────────────────────
    {
        "cat_id": "combos", "name": "Rasoi Feast for Two", "display_order": 1,
        "description": "Rogan Josh + Palak Paneer + 4 Naans + Dal + Dessert + 2 Drinks",
        "price": 1150, "is_veg": False, "tag": "Best Value",
        "img_url": "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=400&q=80",
    },
    {
        "cat_id": "combos", "name": "Vegetarian Thali", "display_order": 2,
        "description": "Dal Bukhara + Palak Paneer + Biryani + 3 Breads + Dessert + Drink",
        "price": 675, "is_veg": True, "tag": "Popular",
        "img_url": "https://images.unsplash.com/photo-1512058533999-840d4e3c5a4f?w=400&q=80",
    },
    # ── Premium Bar ───────────────────────────────────────────────────────────
    {
        "cat_id": "bar", "name": "Kingfisher Ultra", "display_order": 1,
        "description": "India's smoothest premium lager — ice-cold, light-bodied with a crisp clean finish",
        "price": 280, "is_veg": True, "tag": "Bestseller",
        "img_url": "https://images.unsplash.com/photo-1608270586620-248524c67de9?w=400&q=80",
    },
    {
        "cat_id": "bar", "name": "Hoegaarden White", "display_order": 2,
        "description": "Belgian wheat beer with orange peel and coriander — hazy, refreshing, aromatic",
        "price": 380, "is_veg": True, "tag": "Craft",
        "img_url": "https://images.unsplash.com/photo-1535958636474-b021ee887b13?w=400&q=80",
    },
    {
        "cat_id": "bar", "name": "Cabernet Sauvignon", "display_order": 3,
        "description": "Full-bodied Chilean red — rich dark cherry, cassis and toasted oak on the finish",
        "price": 750, "is_veg": True, "tag": "Premium",
        "img_url": "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=400&q=80",
    },
    {
        "cat_id": "bar", "name": "Sauvignon Blanc", "display_order": 4,
        "description": "New Zealand white wine — crisp citrus and gooseberry with a mineral, lingering finish",
        "price": 680, "is_veg": True,
        "img_url": "https://images.unsplash.com/photo-1543362906-acfc16c67564?w=400&q=80",
    },
    {
        "cat_id": "bar", "name": "Glenfiddich 12yr", "display_order": 5,
        "description": "Speyside single malt Scotch — honeyed vanilla, fresh pear and subtle oak complexity",
        "price": 1200, "is_veg": True, "tag": "Scotch",
        "img_url": "https://images.unsplash.com/photo-1527281400683-1aae777175f8?w=400&q=80",
    },
    {
        "cat_id": "bar", "name": "Johnnie Walker Black", "display_order": 6,
        "description": "Aged 12 years — deep, smoky and complex with dried fruit and long warm finish",
        "price": 980, "is_veg": True, "tag": "Scotch",
        "img_url": "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=400&q=80",
    },
    {
        "cat_id": "bar", "name": "Signature Negroni", "display_order": 7,
        "description": "Bombay Sapphire, sweet vermouth, Campari — stirred, served over one large ice cube",
        "price": 480, "is_veg": True, "tag": "Signature",
        "img_url": "https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=400&q=80",
    },
    {
        "cat_id": "bar", "name": "Smoky Old Fashioned", "display_order": 8,
        "description": "Bourbon, demerara, Angostura bitters — table-side smoked with applewood chips",
        "price": 520, "is_veg": True, "tag": "Chef Pick",
        "img_url": "https://images.unsplash.com/photo-1569529465841-dfecdab7503b?w=400&q=80",
    },
]

DEFAULT_SETTINGS = {
    "rest_name": "Rasoi",
    "tagline": "Crafted with soul, served with pride",
    "tax_rate": "5",
    "voice_enabled": "true",
    "points_per_rupee": "1",
    "points_value": "0.1",
    "min_redemption": "100",
}

DEFAULT_COUPONS = [
    {"code": "RASOI20",  "discount": 20, "type": "percent"},
    {"code": "FLAT100",  "discount": 100, "type": "flat"},
    {"code": "WELCOME15","discount": 15, "type": "percent"},
]


async def seed():
    async with Session() as db:
        # Admin
        admin = await db.get(Admin, 1)
        if not admin:
            db.add(Admin(username="admin", password_hash=hash_password("Admin@2025"), role="admin"))

        # Tables (20 tables)
        for i in range(1, 21):
            if not await db.get(Table, i):
                db.add(Table(id=i, name=str(i)))

        # Categories
        for cat in CATEGORIES:
            existing = await db.get(MenuCategory, cat["id"])
            if existing:
                for k, v in cat.items():
                    setattr(existing, k, v)
            else:
                db.add(MenuCategory(**cat))

        await db.flush()

        # Delete old items and re-seed fresh
        from sqlalchemy import delete
        await db.execute(delete(MenuItem))
        for item in ITEMS:
            db.add(MenuItem(**item))

        # Settings
        for key, value in DEFAULT_SETTINGS.items():
            existing = await db.get(RestaurantSetting, key)
            if existing:
                existing.value = value
            else:
                db.add(RestaurantSetting(key=key, value=value))

        # Coupons
        for cp in DEFAULT_COUPONS:
            if not await db.get(Coupon, cp["code"]):
                db.add(Coupon(**cp))

        await db.commit()
        print("✅  Rasoi database seeded successfully")


if __name__ == "__main__":
    asyncio.run(seed())
