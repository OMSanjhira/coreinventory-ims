from datetime import datetime
from uuid import UUID

from fastapi import HTTPException, BackgroundTasks
from sqlalchemy.orm import Session

from models.operations import StockAdjustment
from models.product import Product
from schemas.operations_schema import AdjustmentCreate
from services.stock_service import apply_stock_change, get_or_create_stock_level
from utils.alerts import send_low_stock_alert


def _generate_reference(db: Session) -> str:
    count = db.query(StockAdjustment).count() + 1
    year = datetime.utcnow().year
    return f"ADJ/{year}/{str(count).zfill(4)}"


def create_adjustment(
    db: Session, data: AdjustmentCreate, user_id: UUID
) -> StockAdjustment:
    reference = _generate_reference(db)
    adjustment = StockAdjustment(
        reference=reference,
        product_id=data.product_id,
        location_id=data.location_id,
        new_qty=data.new_qty,
        reason=data.reason,
        status="draft",
        created_by=user_id,
        created_at=datetime.utcnow(),
    )
    db.add(adjustment)
    db.commit()
    db.refresh(adjustment)
    return adjustment


def validate_adjustment(
    db: Session, adjustment_id: UUID, user_id: UUID, background_tasks: BackgroundTasks
) -> StockAdjustment:
    adjustment = db.query(StockAdjustment).filter(StockAdjustment.id == adjustment_id).first()
    if not adjustment:
        raise HTTPException(status_code=404, detail="Adjustment not found")
    if adjustment.status in ("done", "canceled"):
        raise HTTPException(
            status_code=400,
            detail=f"Cannot validate an adjustment with status '{adjustment.status}'"
        )

    stock = get_or_create_stock_level(db, adjustment.product_id, adjustment.location_id)
    old_qty = stock.quantity
    diff = adjustment.new_qty - old_qty

    try:
        adjustment.old_qty = old_qty
        apply_stock_change(
            db=db,
            product_id=adjustment.product_id,
            location_id=adjustment.location_id,
            change_qty=diff,
            operation_type="adjustment",
            reference_id=adjustment.id,
            reference_type="adjustment",
            user_id=user_id,
            note=adjustment.reason,
        )
        
        product = db.query(Product).filter(Product.id == adjustment.product_id).first()
        if adjustment.new_qty <= product.reorder_level:
            background_tasks.add_task(
                send_low_stock_alert,
                product_name=product.name,
                sku=product.sku,
                current_qty=adjustment.new_qty,
                reorder_level=product.reorder_level
            )
            
        adjustment.status = "done"
        db.commit()
        db.refresh(adjustment)
    except HTTPException:
        db.rollback()
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

    return adjustment


def cancel_adjustment(db: Session, adjustment_id: UUID) -> StockAdjustment:
    adjustment = db.query(StockAdjustment).filter(StockAdjustment.id == adjustment_id).first()
    if not adjustment:
        raise HTTPException(status_code=404, detail="Adjustment not found")
    if adjustment.status == "done":
        raise HTTPException(
            status_code=400, detail="Cannot cancel an already validated adjustment"
        )
    adjustment.status = "canceled"
    db.commit()
    db.refresh(adjustment)
    return adjustment


def list_adjustments(db: Session, status: str = None):
    q = db.query(StockAdjustment)
    if status:
        q = q.filter(StockAdjustment.status == status)
    return q.order_by(StockAdjustment.created_at.desc()).all()


def get_adjustment(db: Session, adjustment_id: UUID) -> StockAdjustment:
    adjustment = db.query(StockAdjustment).filter(StockAdjustment.id == adjustment_id).first()
    if not adjustment:
        raise HTTPException(status_code=404, detail="Adjustment not found")
    return adjustment
