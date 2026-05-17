from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models.review import Review
from app.schemas.review import ReviewCreate, ReviewOut

router = APIRouter(prefix="/api/reviews", tags=["reviews"])


@router.post("", response_model=list[ReviewOut])
async def submit_reviews(reviews: list[ReviewCreate], db: AsyncSession = Depends(get_db)):
    created = []
    for r in reviews:
        review = Review(**r.model_dump())
        db.add(review)
        created.append(review)
    await db.commit()
    for r in created:
        await db.refresh(r)
    return created
