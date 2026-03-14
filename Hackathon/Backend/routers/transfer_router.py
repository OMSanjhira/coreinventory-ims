from uuid import UUID
from typing import Optional

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from database.connection import get_db
from models.user import User
from schemas.operations_schema import TransferCreate, TransferUpdate
from services import transfer_service
from services.auth_deps import get_current_user
from utils.response_wrapper import success_response, error_response

router = APIRouter()


def _transfer_to_dict(t):
    return {
        "id": str(t.id),
        "reference": t.reference,
        "from_location_id": str(t.from_location_id),
        "to_location_id": str(t.to_location_id),
        "from_location": {
            "id": str(t.from_location.id),
            "name": t.from_location.name,
            "warehouse": {
                "id": str(t.from_location.warehouse.id),
                "name": t.from_location.warehouse.name
            } if t.from_location.warehouse else None
        } if t.from_location else None,
        "to_location": {
            "id": str(t.to_location.id),
            "name": t.to_location.name,
            "warehouse": {
                "id": str(t.to_location.warehouse.id),
                "name": t.to_location.warehouse.name
            } if t.to_location.warehouse else None
        } if t.to_location else None,
        "status": t.status,
        "note": t.note,
        "created_by": str(t.created_by),
        "created_at": t.created_at.isoformat() if t.created_at else None,
        "items": [
            {
                "id": str(i.id), 
                "product_id": str(i.product_id), 
                "product": {
                    "id": str(i.product.id),
                    "name": i.product.name,
                    "sku": i.product.sku,
                    "uom": i.product.uom
                } if i.product else None,
                "quantity": i.quantity
            }
            for i in t.items
        ],
    }


@router.get("")
def list_transfers(status: Optional[str] = Query(None), db: Session = Depends(get_db),
                   current_user: User = Depends(get_current_user)):
    transfers = transfer_service.list_transfers(db, status)
    return success_response(data=[_transfer_to_dict(t) for t in transfers], message="Transfers retrieved")


@router.post("", status_code=201)
def create_transfer(data: TransferCreate, db: Session = Depends(get_db),
                    current_user: User = Depends(get_current_user)):
    t = transfer_service.create_transfer(db, data, current_user.id)
    return success_response(data=_transfer_to_dict(t), message="Transfer created", status_code=201)


@router.get("/{transfer_id}")
def get_transfer(transfer_id: UUID, db: Session = Depends(get_db),
                 current_user: User = Depends(get_current_user)):
    t = transfer_service.get_transfer(db, transfer_id)
    return success_response(data=_transfer_to_dict(t), message="Transfer retrieved")


@router.post("/{transfer_id}/validate")
def validate_transfer(transfer_id: UUID, db: Session = Depends(get_db),
                      current_user: User = Depends(get_current_user)):
    t = transfer_service.validate_transfer(db, transfer_id, current_user.id)
    return success_response(data=_transfer_to_dict(t), message="Transfer validated, stock moved")


@router.post("/{transfer_id}/cancel")
def cancel_transfer(transfer_id: UUID, db: Session = Depends(get_db),
                    current_user: User = Depends(get_current_user)):
    t = transfer_service.cancel_transfer(db, transfer_id)
    return success_response(data=_transfer_to_dict(t), message="Transfer canceled")
