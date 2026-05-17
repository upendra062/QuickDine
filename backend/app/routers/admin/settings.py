from fastapi import APIRouter, Depends
from fastapi.responses import Response
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models.settings import RestaurantSetting
from app.models.table import Table
from app.routers.deps import require_admin
from app.services.qr_svc import generate_table_qr

router = APIRouter(prefix="/api/admin", tags=["admin-settings"])


@router.get("/settings")
async def get_settings(db: AsyncSession = Depends(get_db), _=Depends(require_admin)):
    rows = (await db.execute(select(RestaurantSetting))).scalars().all()
    return {r.key: r.value for r in rows}


@router.put("/settings")
async def update_settings(data: dict, db: AsyncSession = Depends(get_db), _=Depends(require_admin)):
    for key, value in data.items():
        row = await db.get(RestaurantSetting, key)
        if row:
            row.value = str(value)
        else:
            db.add(RestaurantSetting(key=key, value=str(value)))
    await db.commit()
    return {"ok": True}


@router.get("/tables")
async def list_tables(db: AsyncSession = Depends(get_db), _=Depends(require_admin)):
    tables = (await db.execute(select(Table).order_by(Table.id))).scalars().all()
    return [{"id": t.id, "name": t.name, "is_occupied": t.is_occupied} for t in tables]


@router.get("/tables/{table_id}/qr")
async def get_table_qr(table_id: int, db: AsyncSession = Depends(get_db), _=Depends(require_admin)):
    table = await db.get(Table, table_id)
    if not table:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="Table not found")
    png = generate_table_qr(table_id)
    return Response(content=png, media_type="image/png",
                    headers={"Content-Disposition": f'attachment; filename="table_{table_id}_qr.png"'})
