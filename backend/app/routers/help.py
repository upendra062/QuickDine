from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models.help import HelpRequest
from app.schemas.help import HelpCreate, HelpOut
from app.ws.manager import manager

router = APIRouter(prefix="/api/help", tags=["help"])


@router.post("", response_model=HelpOut)
async def create_help(body: HelpCreate, db: AsyncSession = Depends(get_db)):
    req = HelpRequest(**body.model_dump())
    db.add(req)
    await db.commit()
    await db.refresh(req)
    await manager.broadcast_many(["admin", "help"], {
        "type": "help_request",
        "data": {"id": req.id, "table_id": req.table_id, "type": req.type, "guest_name": req.guest_name},
    })
    return req
