from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models.menu import MenuCategory, MenuItem
from app.routers.deps import require_admin
from app.schemas.menu import (CategoryCreate, CategoryOut, CategoryUpdate,
                               MenuItemCreate, MenuItemOut, MenuItemUpdate)

router = APIRouter(prefix="/api/admin/menu", tags=["admin-menu"])


@router.get("/categories", response_model=list[CategoryOut])
async def list_categories(db: AsyncSession = Depends(get_db), _=Depends(require_admin)):
    rows = await db.execute(select(MenuCategory).order_by(MenuCategory.display_order))
    return rows.scalars().all()


@router.post("/categories", response_model=CategoryOut)
async def create_category(body: CategoryCreate, db: AsyncSession = Depends(get_db), _=Depends(require_admin)):
    cat = MenuCategory(**body.model_dump())
    db.add(cat)
    await db.commit()
    await db.refresh(cat)
    return cat


@router.put("/categories/{cat_id}", response_model=CategoryOut)
async def update_category(cat_id: str, body: CategoryUpdate, db: AsyncSession = Depends(get_db), _=Depends(require_admin)):
    cat = await db.get(MenuCategory, cat_id)
    if not cat:
        raise HTTPException(status_code=404, detail="Category not found")
    for k, v in body.model_dump(exclude_none=True).items():
        setattr(cat, k, v)
    await db.commit()
    await db.refresh(cat)
    return cat


@router.delete("/categories/{cat_id}", status_code=204)
async def delete_category(cat_id: str, db: AsyncSession = Depends(get_db), _=Depends(require_admin)):
    cat = await db.get(MenuCategory, cat_id)
    if cat:
        await db.delete(cat)
        await db.commit()


@router.get("/items", response_model=list[MenuItemOut])
async def list_items(db: AsyncSession = Depends(get_db), _=Depends(require_admin)):
    rows = await db.execute(select(MenuItem).order_by(MenuItem.display_order))
    return rows.scalars().all()


@router.post("/items", response_model=MenuItemOut)
async def create_item(body: MenuItemCreate, db: AsyncSession = Depends(get_db), _=Depends(require_admin)):
    item = MenuItem(**body.model_dump())
    db.add(item)
    await db.commit()
    await db.refresh(item)
    return item


@router.put("/items/{item_id}", response_model=MenuItemOut)
async def update_item(item_id: int, body: MenuItemUpdate, db: AsyncSession = Depends(get_db), _=Depends(require_admin)):
    item = await db.get(MenuItem, item_id)
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    for k, v in body.model_dump(exclude_none=True).items():
        setattr(item, k, v)
    await db.commit()
    await db.refresh(item)
    return item


@router.delete("/items/{item_id}", status_code=204)
async def delete_item(item_id: int, db: AsyncSession = Depends(get_db), _=Depends(require_admin)):
    item = await db.get(MenuItem, item_id)
    if item:
        await db.delete(item)
        await db.commit()
