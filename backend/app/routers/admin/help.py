from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models.help import HelpRequest
from app.routers.deps import require_admin
from app.schemas.help import HelpOut
from app.ws.manager import manager

router = APIRouter(prefix="/api/admin/help-requests", tags=["admin-help"])


@router.get("", response_model=list[HelpOut])
async def list_help(status: str | None = None, db: AsyncSession = Depends(get_db), _=Depends(require_admin)):
    q = select(HelpRequest).order_by(HelpRequest.created_at.desc())
    if status:
        q = q.where(HelpRequest.status == status)
    return (await db.execute(q)).scalars().all()


@router.put("/{req_id}/resolve", response_model=HelpOut)
async def resolve(req_id: int, db: AsyncSession = Depends(get_db), _=Depends(require_admin)):
    req = await db.get(HelpRequest, req_id)
    if not req:
        raise HTTPException(status_code=404, detail="Not found")
    req.status = "done"
    req.resolved_at = datetime.now(timezone.utc)
    await db.commit()
    await db.refresh(req)
    await manager.broadcast("help", {"type": "help_resolved", "data": {"id": req_id}})
    return req
