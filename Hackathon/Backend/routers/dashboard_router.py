from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from database.connection import get_db
from models.user import User
from services import dashboard_service
from services.auth_deps import get_current_user
from utils.response_wrapper import success_response

router = APIRouter()


@router.get("/kpis")
def get_kpis(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    kpis = dashboard_service.get_kpis(db)
    return success_response(data=kpis.model_dump(), message="KPIs retrieved")


@router.get("/recent")
def get_recent(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    ops = dashboard_service.get_recent_operations(db, limit=10)
    return success_response(
        data=[
            {
                "id": str(op.id),
                "product_id": str(op.product_id),
                "location_id": str(op.location_id),
                "change_qty": op.change_qty,
                "operation_type": op.operation_type,
                "reference_type": op.reference_type,
                "reference_id": str(op.reference_id),
                "created_at": op.created_at.isoformat() if op.created_at else None,
            }
            for op in ops
        ],
        message="Recent operations retrieved",
    )
