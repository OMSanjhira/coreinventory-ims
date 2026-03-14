from datetime import datetime
from sqlalchemy.orm import Session

from models.product import Product
from models.stock import StockLevel, StockLedger
from models.operations import Receipt, DeliveryOrder, InternalTransfer
from schemas.stock_schema import DashboardKPIResponse


def get_kpis(db: Session) -> DashboardKPIResponse:
    total_products = (
        db.query(Product).filter(Product.is_active == True).count()
    )

    low_stock_count = (
        db.query(StockLevel)
        .join(Product, StockLevel.product_id == Product.id)
        .filter(
            StockLevel.quantity > 0,
            StockLevel.quantity <= Product.reorder_level,
        )
        .count()
    )

    out_of_stock_count = (
        db.query(StockLevel)
        .filter(StockLevel.quantity == 0)
        .count()
    )

    pending_receipts = (
        db.query(Receipt)
        .filter(Receipt.status.in_(["draft", "waiting"]))
        .count()
    )

    pending_deliveries = (
        db.query(DeliveryOrder)
        .filter(DeliveryOrder.status.in_(["draft", "waiting", "ready"]))
        .count()
    )

    scheduled_transfers = (
        db.query(InternalTransfer)
        .filter(InternalTransfer.status.in_(["draft", "waiting"]))
        .count()
    )

    return DashboardKPIResponse(
        total_products=total_products,
        low_stock_count=low_stock_count,
        out_of_stock_count=out_of_stock_count,
        pending_receipts=pending_receipts,
        pending_deliveries=pending_deliveries,
        scheduled_transfers=scheduled_transfers,
    )


def get_recent_operations(db: Session, limit: int = 10):
    """
    Returns last 10 ledger entries as a unified recent activity feed.
    """
    entries = (
        db.query(StockLedger)
        .order_by(StockLedger.created_at.desc())
        .limit(limit)
        .all()
    )
    return entries
