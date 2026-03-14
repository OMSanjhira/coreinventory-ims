from uuid import UUID
from typing import Optional
from datetime import date

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from database.connection import get_db
from models.user import User
from models.stock import StockLedger
from services.auth_deps import get_current_user
from utils.response_wrapper import success_response

router = APIRouter()


@router.get("")
def list_ledger(
    product_id: Optional[UUID] = Query(None),
    location_id: Optional[UUID] = Query(None),
    operation_type: Optional[str] = Query(None),
    from_date: Optional[date] = Query(None),
    to_date: Optional[date] = Query(None),
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    q = db.query(StockLedger)

    if product_id:
        q = q.filter(StockLedger.product_id == product_id)
    if location_id:
        q = q.filter(StockLedger.location_id == location_id)
    if operation_type:
        q = q.filter(StockLedger.operation_type == operation_type)
    if from_date:
        q = q.filter(StockLedger.created_at >= from_date)
    if to_date:
        q = q.filter(StockLedger.created_at <= to_date)

    total = q.count()
    entries = q.order_by(StockLedger.created_at.desc()).offset((page - 1) * per_page).limit(per_page).all()

    return success_response(
        data={
            "total": total,
            "page": page,
            "per_page": per_page,
            "pages": (total + per_page - 1) // per_page,
            "entries": [
                {
                    "id": str(e.id),
                    "product_id": str(e.product_id),
                    "location_id": str(e.location_id),
                    "change_qty": e.change_qty,
                    "operation_type": e.operation_type,
                    "reference_id": str(e.reference_id),
                    "reference_type": e.reference_type,
                    "note": e.note,
                    "created_by": str(e.created_by),
                    "created_at": e.created_at.isoformat() if e.created_at else None,
                }
                for e in entries
            ],
        },
        message="Ledger entries retrieved",
    )
