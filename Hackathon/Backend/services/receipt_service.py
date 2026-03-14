from datetime import datetime
from uuid import UUID
from typing import List

from fastapi import HTTPException
from sqlalchemy.orm import Session, joinedload

from models.operations import Receipt, ReceiptItem
from models.product import Product
from schemas.operations_schema import ReceiptCreate, ValidateReceiptItem
from services.stock_service import apply_stock_change


def _generate_reference(db: Session) -> str:
    count = db.query(Receipt).count() + 1
    year = datetime.utcnow().year
    return f"REC/{year}/{str(count).zfill(4)}"


def create_receipt(db: Session, data: ReceiptCreate, user_id: UUID) -> Receipt:
    reference = _generate_reference(db)
    receipt = Receipt(
        reference=reference,
        supplier=data.supplier,
        warehouse_id=data.warehouse_id,
        status="draft",
        note=data.note,
        created_by=user_id,
        created_at=datetime.utcnow(),
    )
    db.add(receipt)
    db.flush()

    for item_data in data.items:
        item = ReceiptItem(
            receipt_id=receipt.id,
            product_id=item_data.product_id,
            location_id=item_data.location_id,
            expected_qty=item_data.expected_qty,
        )
        db.add(item)

    db.commit()
    db.refresh(receipt)
    return receipt


def validate_receipt(
    db: Session,
    receipt_id: UUID,
    items: List[ValidateReceiptItem],
    user_id: UUID,
) -> Receipt:
    receipt = db.query(Receipt).filter(Receipt.id == receipt_id).first()
    if not receipt:
        raise HTTPException(status_code=404, detail="Receipt not found")
    if receipt.status in ("done", "canceled"):
        raise HTTPException(
            status_code=400,
            detail=f"Cannot validate a receipt with status '{receipt.status}'"
        )

    # All changes inside a savepoint — if anything fails, it auto-rolls back
    try:
        for item in items:
            apply_stock_change(
                db=db,
                product_id=item.product_id,
                location_id=item.location_id,
                change_qty=+item.received_qty,
                operation_type="receipt",
                reference_id=receipt.id,
                reference_type="receipt",
                user_id=user_id,
            )
            # Update the corresponding receipt item
            receipt_item = (
                db.query(ReceiptItem)
                .filter(
                    ReceiptItem.receipt_id == receipt.id,
                    ReceiptItem.product_id == item.product_id,
                    ReceiptItem.location_id == item.location_id,
                )
                .first()
            )
            if receipt_item:
                receipt_item.received_qty = item.received_qty

        receipt.status = "done"
        receipt.validated_at = datetime.utcnow()
        db.commit()
        db.refresh(receipt)
    except HTTPException:
        db.rollback()
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

    return receipt


def cancel_receipt(db: Session, receipt_id: UUID) -> Receipt:
    receipt = db.query(Receipt).filter(Receipt.id == receipt_id).first()
    if not receipt:
        raise HTTPException(status_code=404, detail="Receipt not found")
    if receipt.status == "done":
        raise HTTPException(
            status_code=400, detail="Cannot cancel an already validated receipt"
        )
    receipt.status = "canceled"
    db.commit()
    db.refresh(receipt)
    return receipt


def list_receipts(db: Session, status: str = None, warehouse_id: UUID = None,
                  from_date=None, to_date=None):
    q = db.query(Receipt).options(
        joinedload(Receipt.creator),
        joinedload(Receipt.items).joinedload(ReceiptItem.product)
    )
    if status:
        q = q.filter(Receipt.status == status)
    if warehouse_id:
        q = q.filter(Receipt.warehouse_id == warehouse_id)
    if from_date:
        q = q.filter(Receipt.created_at >= from_date)
    if to_date:
        q = q.filter(Receipt.created_at <= to_date)
    return q.order_by(Receipt.created_at.desc()).all()


def get_receipt(db: Session, receipt_id: UUID) -> Receipt:
    receipt = db.query(Receipt).options(
        joinedload(Receipt.creator),
        joinedload(Receipt.items).joinedload(ReceiptItem.product)
    ).filter(Receipt.id == receipt_id).first()
    if not receipt:
        raise HTTPException(status_code=404, detail="Receipt not found")
    return receipt
