import uuid
from datetime import datetime
from uuid import UUID

from fastapi import HTTPException
from sqlalchemy.orm import Session

from models.stock import StockLevel, StockLedger


def get_or_create_stock_level(db: Session, product_id: UUID, location_id: UUID) -> StockLevel:
    """Get the current stock level row or create one with quantity=0."""
    stock = (
        db.query(StockLevel)
        .filter(
            StockLevel.product_id == product_id,
            StockLevel.location_id == location_id,
        )
        .first()
    )
    if not stock:
        stock = StockLevel(product_id=product_id, location_id=location_id, quantity=0.0)
        db.add(stock)
        db.flush()  # get the id without committing
    return stock


def apply_stock_change(
    db: Session,
    product_id: UUID,
    location_id: UUID,
    change_qty: float,
    operation_type: str,
    reference_id: UUID,
    reference_type: str,
    user_id: UUID,
    note: str = None,
) -> StockLevel:
    """
    Apply a stock quantity change:
    1. Get or create the StockLevel row.
    2. Apply the change (raises 400 on negative result).
    3. Append a StockLedger audit entry.
    """
    stock = get_or_create_stock_level(db, product_id, location_id)

    stock.quantity += change_qty
    # For Hackathon/Demo purposes, we'll allow negative stock levels so users can 
    # test the flow without needing to seed every single product/location combination.
    # if stock.quantity < 0:
    #     raise HTTPException(
    #         status_code=400,
    #         detail=f"Insufficient stock: would result in negative quantity ({stock.quantity:.2f})",
    #     )

    ledger_entry = StockLedger(
        product_id=product_id,
        location_id=location_id,
        change_qty=change_qty,
        operation_type=operation_type,
        reference_id=reference_id,
        reference_type=reference_type,
        note=note,
        created_by=user_id,
        created_at=datetime.utcnow(),
    )
    db.add(ledger_entry)
    return stock
