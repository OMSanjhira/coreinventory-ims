from datetime import datetime
from uuid import UUID

from fastapi import HTTPException
from sqlalchemy.orm import Session, joinedload

from models.operations import InternalTransfer, TransferItem
from models.warehouse import Location
from schemas.operations_schema import TransferCreate
from services.stock_service import apply_stock_change


def _generate_reference(db: Session) -> str:
    count = db.query(InternalTransfer).count() + 1
    year = datetime.utcnow().year
    return f"TRF/{year}/{str(count).zfill(4)}"


def create_transfer(db: Session, data: TransferCreate, user_id: UUID) -> InternalTransfer:
    if data.from_location_id == data.to_location_id:
        raise HTTPException(
            status_code=400, detail="Source and destination locations cannot be the same"
        )
    reference = _generate_reference(db)
    transfer = InternalTransfer(
        reference=reference,
        from_location_id=data.from_location_id,
        to_location_id=data.to_location_id,
        status="draft",
        note=data.note,
        created_by=user_id,
        created_at=datetime.utcnow(),
    )
    db.add(transfer)
    db.flush()

    for item_data in data.items:
        item = TransferItem(
            transfer_id=transfer.id,
            product_id=item_data.product_id,
            quantity=item_data.quantity,
        )
        db.add(item)

    db.commit()
    db.refresh(transfer)
    return transfer


def validate_transfer(db: Session, transfer_id: UUID, user_id: UUID) -> InternalTransfer:
    transfer = db.query(InternalTransfer).filter(InternalTransfer.id == transfer_id).first()
    if not transfer:
        raise HTTPException(status_code=404, detail="Transfer not found")
    if transfer.status in ("done", "canceled"):
        raise HTTPException(
            status_code=400,
            detail=f"Cannot validate a transfer with status '{transfer.status}'"
        )
    if transfer.from_location_id == transfer.to_location_id:
        raise HTTPException(
            status_code=400, detail="Source and destination locations cannot be the same"
        )

    items = db.query(TransferItem).filter(TransferItem.transfer_id == transfer.id).all()

    try:
        for item in items:
            # Deduct from source
            apply_stock_change(
                db=db,
                product_id=item.product_id,
                location_id=transfer.from_location_id,
                change_qty=-item.quantity,
                operation_type="transfer_out",
                reference_id=transfer.id,
                reference_type="transfer",
                user_id=user_id,
            )
            # Add to destination
            apply_stock_change(
                db=db,
                product_id=item.product_id,
                location_id=transfer.to_location_id,
                change_qty=+item.quantity,
                operation_type="transfer_in",
                reference_id=transfer.id,
                reference_type="transfer",
                user_id=user_id,
            )

        transfer.status = "done"
        db.commit()
        db.refresh(transfer)
    except HTTPException:
        db.rollback()
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

    return transfer


def cancel_transfer(db: Session, transfer_id: UUID) -> InternalTransfer:
    transfer = db.query(InternalTransfer).filter(InternalTransfer.id == transfer_id).first()
    if not transfer:
        raise HTTPException(status_code=404, detail="Transfer not found")
    if transfer.status == "done":
        raise HTTPException(
            status_code=400, detail="Cannot cancel an already validated transfer"
        )
    transfer.status = "canceled"
    db.commit()
    db.refresh(transfer)
def list_transfers(db: Session, status: str = None):
    q = db.query(InternalTransfer).options(
        joinedload(InternalTransfer.from_location).joinedload(Location.warehouse),
        joinedload(InternalTransfer.to_location).joinedload(Location.warehouse)
    )
    if status:
        q = q.filter(InternalTransfer.status == status)
    return q.order_by(InternalTransfer.created_at.desc()).all()


def get_transfer(db: Session, transfer_id: UUID) -> InternalTransfer:
    transfer = db.query(InternalTransfer).options(
        joinedload(InternalTransfer.from_location).joinedload(Location.warehouse),
        joinedload(InternalTransfer.to_location).joinedload(Location.warehouse),
        joinedload(InternalTransfer.items).joinedload(TransferItem.product)
    ).filter(InternalTransfer.id == transfer_id).first()
    if not transfer:
        raise HTTPException(status_code=404, detail="Transfer not found")
    return transfer
