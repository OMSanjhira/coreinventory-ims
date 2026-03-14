from uuid import UUID
from typing import Optional
from datetime import date

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from database.connection import get_db
from models.user import User
from schemas.operations_schema import ReceiptCreate, ReceiptUpdate, ValidateReceiptRequest
from services import receipt_service
from services.auth_deps import get_current_user
from utils.response_wrapper import success_response, error_response

router = APIRouter()


def _receipt_to_dict(r):
    return {
        "id": str(r.id),
        "reference": r.reference,
        "supplier": r.supplier,
        "warehouse_id": str(r.warehouse_id),
        "status": r.status,
        "note": r.note,
        "created_by": str(r.created_by),
        "created_at": r.created_at.isoformat() if r.created_at else None,
        "validated_at": r.validated_at.isoformat() if r.validated_at else None,
        "items": [
            {
                "id": str(i.id),
                "product_id": str(i.product_id),
                "location_id": str(i.location_id),
                "expected_qty": i.expected_qty,
                "received_qty": i.received_qty,
            }
            for i in r.items
        ],
    }


@router.get("")
def list_receipts(
    status: Optional[str] = Query(None),
    warehouse_id: Optional[UUID] = Query(None),
    from_date: Optional[date] = Query(None),
    to_date: Optional[date] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    receipts = receipt_service.list_receipts(db, status, warehouse_id, from_date, to_date)
    return success_response(data=[_receipt_to_dict(r) for r in receipts], message="Receipts retrieved")


@router.post("", status_code=201)
def create_receipt(data: ReceiptCreate, db: Session = Depends(get_db),
                   current_user: User = Depends(get_current_user)):
    receipt = receipt_service.create_receipt(db, data, current_user.id)
    return success_response(data=_receipt_to_dict(receipt), message="Receipt created", status_code=201)


@router.get("/{receipt_id}")
def get_receipt(receipt_id: UUID, db: Session = Depends(get_db),
                current_user: User = Depends(get_current_user)):
    receipt = receipt_service.get_receipt(db, receipt_id)
    return success_response(data=_receipt_to_dict(receipt), message="Receipt retrieved")


@router.put("/{receipt_id}")
def update_receipt(receipt_id: UUID, data: ReceiptUpdate, db: Session = Depends(get_db),
                   current_user: User = Depends(get_current_user)):
    from models.operations import Receipt
    receipt = db.query(Receipt).filter(Receipt.id == receipt_id).first()
    if not receipt:
        return error_response("Receipt not found", status_code=404)
    if receipt.status != "draft":
        return error_response("Can only update receipts in draft status", status_code=400)
    for field, value in data.model_dump(exclude_none=True).items():
        setattr(receipt, field, value)
    db.commit()
    db.refresh(receipt)
    return success_response(data=_receipt_to_dict(receipt), message="Receipt updated")


@router.post("/{receipt_id}/validate")
def validate_receipt(receipt_id: UUID, body: ValidateReceiptRequest,
                     db: Session = Depends(get_db),
                     current_user: User = Depends(get_current_user)):
    receipt = receipt_service.validate_receipt(db, receipt_id, body.items, current_user.id)
    return success_response(data=_receipt_to_dict(receipt), message="Receipt validated, stock updated")


@router.post("/{receipt_id}/cancel")
def cancel_receipt(receipt_id: UUID, db: Session = Depends(get_db),
                   current_user: User = Depends(get_current_user)):
    receipt = receipt_service.cancel_receipt(db, receipt_id)
    return success_response(data=_receipt_to_dict(receipt), message="Receipt canceled")
