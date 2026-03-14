from uuid import UUID
from typing import Optional
from datetime import date

from fastapi import APIRouter, Depends, Query, BackgroundTasks
from sqlalchemy.orm import Session

from database.connection import get_db
from models.user import User
from schemas.operations_schema import DeliveryCreate, DeliveryUpdate, ValidateDeliveryRequest
from services import delivery_service
from services.auth_deps import get_current_user
from utils.response_wrapper import success_response, error_response

router = APIRouter()


def _delivery_to_dict(d):
    return {
        "id": str(d.id),
        "reference": d.reference,
        "customer": d.customer,
        "warehouse_id": str(d.warehouse_id),
        "status": d.status,
        "note": d.note,
        "created_by": str(d.created_by),
        "created_at": d.created_at.isoformat() if d.created_at else None,
        "validated_at": d.validated_at.isoformat() if d.validated_at else None,
        "items": [
            {
                "id": str(i.id),
                "product_id": str(i.product_id),
                "location_id": str(i.location_id),
                "requested_qty": i.requested_qty,
                "delivered_qty": i.delivered_qty,
            }
            for i in d.items
        ],
    }


@router.get("")
def list_deliveries(
    status: Optional[str] = Query(None),
    warehouse_id: Optional[UUID] = Query(None),
    from_date: Optional[date] = Query(None),
    to_date: Optional[date] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    deliveries = delivery_service.list_deliveries(db, status, warehouse_id, from_date, to_date)
    return success_response(data=[_delivery_to_dict(d) for d in deliveries], message="Deliveries retrieved")


@router.post("", status_code=201)
def create_delivery(data: DeliveryCreate, db: Session = Depends(get_db),
                    current_user: User = Depends(get_current_user)):
    delivery = delivery_service.create_delivery(db, data, current_user.id)
    return success_response(data=_delivery_to_dict(delivery), message="Delivery created", status_code=201)


@router.get("/{delivery_id}")
def get_delivery(delivery_id: UUID, db: Session = Depends(get_db),
                 current_user: User = Depends(get_current_user)):
    delivery = delivery_service.get_delivery(db, delivery_id)
    return success_response(data=_delivery_to_dict(delivery), message="Delivery retrieved")


@router.put("/{delivery_id}")
def update_delivery(delivery_id: UUID, data: DeliveryUpdate, db: Session = Depends(get_db),
                    current_user: User = Depends(get_current_user)):
    from models.operations import DeliveryOrder
    delivery = db.query(DeliveryOrder).filter(DeliveryOrder.id == delivery_id).first()
    if not delivery:
        return error_response("Delivery not found", status_code=404)
    if delivery.status != "draft":
        return error_response("Can only update deliveries in draft status", status_code=400)
    for field, value in data.model_dump(exclude_none=True).items():
        setattr(delivery, field, value)
    db.commit()
    db.refresh(delivery)
    return success_response(data=_delivery_to_dict(delivery), message="Delivery updated")


@router.post("/{delivery_id}/validate")
def validate_delivery(delivery_id: UUID, body: ValidateDeliveryRequest,
                      background_tasks: BackgroundTasks,
                      db: Session = Depends(get_db),
                      current_user: User = Depends(get_current_user)):
    delivery = delivery_service.validate_delivery(db, delivery_id, body.items, current_user.id, background_tasks)
    return success_response(data=_delivery_to_dict(delivery), message="Delivery validated, stock deducted")


@router.post("/{delivery_id}/cancel")
def cancel_delivery(delivery_id: UUID, db: Session = Depends(get_db),
                    current_user: User = Depends(get_current_user)):
    delivery = delivery_service.cancel_delivery(db, delivery_id)
    return success_response(data=_delivery_to_dict(delivery), message="Delivery canceled")
