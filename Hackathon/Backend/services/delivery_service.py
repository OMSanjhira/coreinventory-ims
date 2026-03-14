from datetime import datetime
from uuid import UUID
from typing import List

from fastapi import HTTPException, BackgroundTasks
from sqlalchemy.orm import Session

from models.operations import DeliveryOrder, DeliveryItem
from models.product import Product
from schemas.operations_schema import DeliveryCreate, ValidateDeliveryItem
from services.stock_service import apply_stock_change, get_or_create_stock_level
from utils.alerts import send_low_stock_alert


def _generate_reference(db: Session) -> str:
    count = db.query(DeliveryOrder).count() + 1
    year = datetime.utcnow().year
    return f"DEL/{year}/{str(count).zfill(4)}"


def create_delivery(db: Session, data: DeliveryCreate, user_id: UUID) -> DeliveryOrder:
    reference = _generate_reference(db)
    delivery = DeliveryOrder(
        reference=reference,
        customer=data.customer,
        warehouse_id=data.warehouse_id,
        status="draft",
        note=data.note,
        created_by=user_id,
        created_at=datetime.utcnow(),
    )
    db.add(delivery)
    db.flush()

    for item_data in data.items:
        item = DeliveryItem(
            delivery_id=delivery.id,
            product_id=item_data.product_id,
            location_id=item_data.location_id,
            requested_qty=item_data.requested_qty,
        )
        db.add(item)

    db.commit()
    db.refresh(delivery)
    return delivery


def validate_delivery(
    db: Session,
    delivery_id: UUID,
    items: List[ValidateDeliveryItem],
    user_id: UUID,
    background_tasks: BackgroundTasks
) -> DeliveryOrder:
    delivery = db.query(DeliveryOrder).filter(DeliveryOrder.id == delivery_id).first()
    if not delivery:
        raise HTTPException(status_code=404, detail="Delivery order not found")
    if delivery.status in ("done", "canceled"):
        raise HTTPException(
            status_code=400,
            detail=f"Cannot validate a delivery with status '{delivery.status}'"
        )

    # Pre-check all items for sufficient stock BEFORE touching anything
    for item in items:
        stock = get_or_create_stock_level(db, item.product_id, item.location_id)
        if stock.quantity < item.delivered_qty:
            product = db.query(Product).filter(Product.id == item.product_id).first()
            product_name = product.name if product else str(item.product_id)
            raise HTTPException(
                status_code=400,
                detail=(
                    f"Insufficient stock for '{product_name}': "
                    f"have {stock.quantity:.2f}, need {item.delivered_qty:.2f}"
                ),
            )

    # All checks passed — apply changes
    try:
        for item in items:
            apply_stock_change(
                db=db,
                product_id=item.product_id,
                location_id=item.location_id,
                change_qty=-item.delivered_qty,
                operation_type="delivery",
                reference_id=delivery.id,
                reference_type="delivery",
                user_id=user_id,
            )
            
            product = db.query(Product).filter(Product.id == item.product_id).first()
            stock = get_or_create_stock_level(db, item.product_id, item.location_id)
            if stock.quantity <= product.reorder_level:
                background_tasks.add_task(
                    send_low_stock_alert,
                    product_name=product.name,
                    sku=product.sku,
                    current_qty=stock.quantity,
                    reorder_level=product.reorder_level
                )

            delivery_item = (
                db.query(DeliveryItem)
                .filter(
                    DeliveryItem.delivery_id == delivery.id,
                    DeliveryItem.product_id == item.product_id,
                    DeliveryItem.location_id == item.location_id,
                )
                .first()
            )
            if delivery_item:
                delivery_item.delivered_qty = item.delivered_qty

        delivery.status = "done"
        delivery.validated_at = datetime.utcnow()
        db.commit()
        db.refresh(delivery)
    except HTTPException:
        db.rollback()
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

    return delivery


def cancel_delivery(db: Session, delivery_id: UUID) -> DeliveryOrder:
    delivery = db.query(DeliveryOrder).filter(DeliveryOrder.id == delivery_id).first()
    if not delivery:
        raise HTTPException(status_code=404, detail="Delivery order not found")
    if delivery.status == "done":
        raise HTTPException(
            status_code=400, detail="Cannot cancel an already validated delivery"
        )
    delivery.status = "canceled"
    db.commit()
    db.refresh(delivery)
    return delivery


def list_deliveries(db: Session, status: str = None, warehouse_id: UUID = None,
                    from_date=None, to_date=None):
    q = db.query(DeliveryOrder)
    if status:
        q = q.filter(DeliveryOrder.status == status)
    if warehouse_id:
        q = q.filter(DeliveryOrder.warehouse_id == warehouse_id)
    if from_date:
        q = q.filter(DeliveryOrder.created_at >= from_date)
    if to_date:
        q = q.filter(DeliveryOrder.created_at <= to_date)
    return q.order_by(DeliveryOrder.created_at.desc()).all()


def get_delivery(db: Session, delivery_id: UUID) -> DeliveryOrder:
    delivery = db.query(DeliveryOrder).filter(DeliveryOrder.id == delivery_id).first()
    if not delivery:
        raise HTTPException(status_code=404, detail="Delivery order not found")
    return delivery
