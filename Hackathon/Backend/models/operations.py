import uuid
from datetime import datetime
from sqlalchemy import Column, String, Float, Text, ForeignKey, Enum, DateTime
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from database.connection import Base


class Receipt(Base):
    __tablename__ = "receipts"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    reference = Column(String(50), unique=True, nullable=False)
    supplier = Column(String(200))
    warehouse_id = Column(UUID(as_uuid=True), ForeignKey("warehouses.id"), nullable=False)
    status = Column(
        Enum("draft", "waiting", "done", "canceled", name="receipt_status_enum"),
        default="draft"
    )
    note = Column(Text, nullable=True)
    created_by = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    validated_at = Column(DateTime, nullable=True)

    warehouse = relationship("Warehouse")
    creator = relationship("User")
    items = relationship("ReceiptItem", back_populates="receipt")


class ReceiptItem(Base):
    __tablename__ = "receipt_items"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    receipt_id = Column(UUID(as_uuid=True), ForeignKey("receipts.id"), nullable=False)
    product_id = Column(UUID(as_uuid=True), ForeignKey("products.id"), nullable=False)
    location_id = Column(UUID(as_uuid=True), ForeignKey("locations.id"), nullable=False)
    expected_qty = Column(Float, nullable=False)
    received_qty = Column(Float, nullable=True)

    receipt = relationship("Receipt", back_populates="items")
    product = relationship("Product")
    location = relationship("Location")


class DeliveryOrder(Base):
    __tablename__ = "delivery_orders"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    reference = Column(String(50), unique=True, nullable=False)
    customer = Column(String(200))
    warehouse_id = Column(UUID(as_uuid=True), ForeignKey("warehouses.id"), nullable=False)
    status = Column(
        Enum("draft", "waiting", "ready", "done", "canceled", name="delivery_status_enum"),
        default="draft"
    )
    note = Column(Text, nullable=True)
    created_by = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    validated_at = Column(DateTime, nullable=True)

    warehouse = relationship("Warehouse")
    creator = relationship("User")
    items = relationship("DeliveryItem", back_populates="delivery")


class DeliveryItem(Base):
    __tablename__ = "delivery_items"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    delivery_id = Column(UUID(as_uuid=True), ForeignKey("delivery_orders.id"), nullable=False)
    product_id = Column(UUID(as_uuid=True), ForeignKey("products.id"), nullable=False)
    location_id = Column(UUID(as_uuid=True), ForeignKey("locations.id"), nullable=False)
    requested_qty = Column(Float, nullable=False)
    delivered_qty = Column(Float, nullable=True)

    delivery = relationship("DeliveryOrder", back_populates="items")
    product = relationship("Product")
    location = relationship("Location")


class InternalTransfer(Base):
    __tablename__ = "internal_transfers"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    reference = Column(String(50), unique=True, nullable=False)
    from_location_id = Column(UUID(as_uuid=True), ForeignKey("locations.id"), nullable=False)
    to_location_id = Column(UUID(as_uuid=True), ForeignKey("locations.id"), nullable=False)
    status = Column(
        Enum("draft", "waiting", "done", "canceled", name="transfer_status_enum"),
        default="draft"
    )
    note = Column(Text, nullable=True)
    created_by = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    from_location = relationship("Location", foreign_keys=[from_location_id])
    to_location = relationship("Location", foreign_keys=[to_location_id])
    creator = relationship("User")
    items = relationship("TransferItem", back_populates="transfer")


class TransferItem(Base):
    __tablename__ = "transfer_items"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    transfer_id = Column(UUID(as_uuid=True), ForeignKey("internal_transfers.id"), nullable=False)
    product_id = Column(UUID(as_uuid=True), ForeignKey("products.id"), nullable=False)
    quantity = Column(Float, nullable=False)

    transfer = relationship("InternalTransfer", back_populates="items")
    product = relationship("Product")


class StockAdjustment(Base):
    __tablename__ = "stock_adjustments"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    reference = Column(String(50), unique=True, nullable=False)
    product_id = Column(UUID(as_uuid=True), ForeignKey("products.id"), nullable=False)
    location_id = Column(UUID(as_uuid=True), ForeignKey("locations.id"), nullable=False)
    old_qty = Column(Float, nullable=True)
    new_qty = Column(Float, nullable=False)
    reason = Column(Text)
    status = Column(
        Enum("draft", "done", "canceled", name="adjustment_status_enum"),
        default="draft"
    )
    created_by = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    product = relationship("Product")
    location = relationship("Location")
    creator = relationship("User")
