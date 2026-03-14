import uuid
from datetime import datetime
from sqlalchemy import Column, Float, ForeignKey, Enum, Text, UniqueConstraint, String, DateTime
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from database.connection import Base


class StockLevel(Base):
    """Source of truth for current stock per product+location."""
    __tablename__ = "stock_levels"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    product_id = Column(UUID(as_uuid=True), ForeignKey("products.id"), nullable=False)
    location_id = Column(UUID(as_uuid=True), ForeignKey("locations.id"), nullable=False)
    quantity = Column(Float, default=0.0)

    product = relationship("Product")
    location = relationship("Location")

    __table_args__ = (
        UniqueConstraint("product_id", "location_id", name="uq_stock_product_location"),
    )


class StockLedger(Base):
    """Append-only audit log — NEVER update or delete rows."""
    __tablename__ = "stock_ledger"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    product_id = Column(UUID(as_uuid=True), ForeignKey("products.id"), nullable=False)
    location_id = Column(UUID(as_uuid=True), ForeignKey("locations.id"), nullable=False)
    change_qty = Column(Float, nullable=False)
    operation_type = Column(
        Enum(
            "receipt", "delivery", "transfer_in", "transfer_out", "adjustment",
            name="operation_type_enum"
        ),
        nullable=False
    )
    reference_id = Column(UUID(as_uuid=True), nullable=False)
    reference_type = Column(String(50), nullable=False)
    note = Column(Text, nullable=True)
    created_by = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    product = relationship("Product")
    location = relationship("Location")
    creator = relationship("User")
