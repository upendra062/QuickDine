from fastapi import APIRouter, Depends
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.database import get_db
from app.models.menu import MenuCategory, MenuItem
from app.models.review import Review
from app.schemas.menu import MenuItemOut, MenuOut, ReviewOut

router = APIRouter(prefix="/api/menu", tags=["menu"])


@router.get("", response_model=MenuOut)
async def get_menu(db: AsyncSession = Depends(get_db)):
    cats = (await db.execute(select(MenuCategory).order_by(MenuCategory.display_order))).scalars().all()
    items_q = await db.execute(select(MenuItem).order_by(MenuItem.display_order))
    items = items_q.scalars().all()

    avg_rows = await db.execute(
        select(Review.item_id, func.avg(Review.rating).label("avg"), func.count(Review.id).label("cnt"))
        .group_by(Review.item_id)
    )
    ratings = {r.item_id: (round(r.avg, 1), r.cnt) for r in avg_rows}

    item_out = []
    for item in items:
        avg, cnt = ratings.get(item.id, (None, 0))
        item_out.append(MenuItemOut(
            id=item.id, cat_id=item.cat_id, name=item.name, description=item.description,
            price=item.price, is_veg=item.is_veg, tag=item.tag, img_url=item.img_url,
            available=item.available, display_order=item.display_order,
            avg_rating=avg, review_count=cnt,
        ))

    return MenuOut(categories=list(cats), items=item_out)


@router.get("/items/{item_id}/reviews", response_model=list[ReviewOut])
async def get_item_reviews(item_id: int, db: AsyncSession = Depends(get_db)):
    rows = await db.execute(
        select(Review).where(Review.item_id == item_id).order_by(Review.created_at.desc())
    )
    return rows.scalars().all()
