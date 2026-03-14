from uuid import UUID
from typing import Optional

from fastapi import APIRouter, Depends, Query, BackgroundTasks
from sqlalchemy.orm import Session

from database.connection import get_db
from models.user import User
from schemas.operations_schema import AdjustmentCreate, AdjustmentUpdate
from services import adjustment_service
from services.auth_deps import get_current_user
from utils.response_wrapper import success_response, error_response

router = APIRouter()


def _adj_to_dict(a):
    return {
        "id": str(a.id),
        "reference": a.reference,
        "product_id": str(a.product_id),
        "location_id": str(a.location_id),
        "old_qty": a.old_qty,
        "new_qty": a.new_qty,
        "reason": a.reason,
        "status": a.status,
        "created_by": str(a.created_by),
        "created_at": a.created_at.isoformat() if a.created_at else None,
    }


@router.get("")
def list_adjustments(status: Optional[str] = Query(None), db: Session = Depends(get_db),
                     current_user: User = Depends(get_current_user)):
    adjustments = adjustment_service.list_adjustments(db, status)
    return success_response(data=[_adj_to_dict(a) for a in adjustments], message="Adjustments retrieved")


@router.post("", status_code=201)
def create_adjustment(data: AdjustmentCreate, db: Session = Depends(get_db),
                      current_user: User = Depends(get_current_user)):
    a = adjustment_service.create_adjustment(db, data, current_user.id)
    return success_response(data=_adj_to_dict(a), message="Adjustment created", status_code=201)


@router.get("/{adjustment_id}")
def get_adjustment(adjustment_id: UUID, db: Session = Depends(get_db),
                   current_user: User = Depends(get_current_user)):
    a = adjustment_service.get_adjustment(db, adjustment_id)
    return success_response(data=_adj_to_dict(a), message="Adjustment retrieved")


@router.put("/{adjustment_id}")
def update_adjustment(adjustment_id: UUID, data: AdjustmentUpdate, db: Session = Depends(get_db),
                      current_user: User = Depends(get_current_user)):
    from models.operations import StockAdjustment
    a = db.query(StockAdjustment).filter(StockAdjustment.id == adjustment_id).first()
    if not a:
        return error_response("Adjustment not found", status_code=404)
    if a.status != "draft":
        return error_response("Can only update adjustments in draft status", status_code=400)
    for field, value in data.model_dump(exclude_none=True).items():
        setattr(a, field, value)
    db.commit()
    db.refresh(a)
    return success_response(data=_adj_to_dict(a), message="Adjustment updated")


@router.post("/{adjustment_id}/validate")
def validate_adjustment(adjustment_id: UUID, background_tasks: BackgroundTasks, db: Session = Depends(get_db),
                        current_user: User = Depends(get_current_user)):
    a = adjustment_service.validate_adjustment(db, adjustment_id, current_user.id, background_tasks)
    return success_response(data=_adj_to_dict(a), message="Adjustment validated, stock corrected")


@router.post("/{adjustment_id}/cancel")
def cancel_adjustment(adjustment_id: UUID, db: Session = Depends(get_db),
                      current_user: User = Depends(get_current_user)):
    a = adjustment_service.cancel_adjustment(db, adjustment_id)
    return success_response(data=_adj_to_dict(a), message="Adjustment canceled")
