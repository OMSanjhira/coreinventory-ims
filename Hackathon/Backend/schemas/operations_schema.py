from __future__ import annotations
from uuid import UUID
from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, ConfigDict


# ── Receipt ───────────────────────────────────────────────────────────────────

class ReceiptItemCreate(BaseModel):
    product_id: UUID
    location_id: UUID
    expected_qty: float


class ReceiptItemResponse(BaseModel):
    id: UUID
    receipt_id: UUID
    product_id: UUID
    location_id: UUID
    expected_qty: float
    received_qty: Optional[float]
    model_config = ConfigDict(from_attributes=True)


class ReceiptCreate(BaseModel):
    supplier: str
    warehouse_id: UUID
    note: Optional[str] = None
    items: List[ReceiptItemCreate]


class ReceiptUpdate(BaseModel):
    supplier: Optional[str] = None
    note: Optional[str] = None


class ReceiptResponse(BaseModel):
    id: UUID
    reference: str
    supplier: Optional[str]
    warehouse_id: UUID
    status: str
    note: Optional[str]
    created_by: UUID
    created_at: datetime
    validated_at: Optional[datetime]
    items: List[ReceiptItemResponse] = []
    model_config = ConfigDict(from_attributes=True)


class ValidateReceiptItem(BaseModel):
    product_id: UUID
    location_id: UUID
    received_qty: float


class ValidateReceiptRequest(BaseModel):
    items: List[ValidateReceiptItem]


# ── Delivery ──────────────────────────────────────────────────────────────────

class DeliveryItemCreate(BaseModel):
    product_id: UUID
    location_id: UUID
    requested_qty: float


class DeliveryItemResponse(BaseModel):
    id: UUID
    delivery_id: UUID
    product_id: UUID
    location_id: UUID
    requested_qty: float
    delivered_qty: Optional[float]
    model_config = ConfigDict(from_attributes=True)


class DeliveryCreate(BaseModel):
    customer: str
    warehouse_id: UUID
    note: Optional[str] = None
    items: List[DeliveryItemCreate]


class DeliveryUpdate(BaseModel):
    customer: Optional[str] = None
    note: Optional[str] = None


class DeliveryResponse(BaseModel):
    id: UUID
    reference: str
    customer: Optional[str]
    warehouse_id: UUID
    status: str
    note: Optional[str]
    created_by: UUID
    created_at: datetime
    validated_at: Optional[datetime]
    items: List[DeliveryItemResponse] = []
    model_config = ConfigDict(from_attributes=True)


class ValidateDeliveryItem(BaseModel):
    product_id: UUID
    location_id: UUID
    delivered_qty: float


class ValidateDeliveryRequest(BaseModel):
    items: List[ValidateDeliveryItem]


# ── Internal Transfer ─────────────────────────────────────────────────────────

class TransferItemCreate(BaseModel):
    product_id: UUID
    quantity: float


class TransferItemResponse(BaseModel):
    id: UUID
    transfer_id: UUID
    product_id: UUID
    quantity: float
    model_config = ConfigDict(from_attributes=True)


class TransferCreate(BaseModel):
    from_location_id: UUID
    to_location_id: UUID
    note: Optional[str] = None
    items: List[TransferItemCreate]


class TransferUpdate(BaseModel):
    note: Optional[str] = None


class TransferResponse(BaseModel):
    id: UUID
    reference: str
    from_location_id: UUID
    to_location_id: UUID
    status: str
    note: Optional[str]
    created_by: UUID
    created_at: datetime
    items: List[TransferItemResponse] = []
    model_config = ConfigDict(from_attributes=True)


# ── Stock Adjustment ──────────────────────────────────────────────────────────

class AdjustmentCreate(BaseModel):
    product_id: UUID
    location_id: UUID
    new_qty: float
    reason: str


class AdjustmentUpdate(BaseModel):
    reason: Optional[str] = None


class AdjustmentResponse(BaseModel):
    id: UUID
    reference: str
    product_id: UUID
    location_id: UUID
    old_qty: Optional[float]
    new_qty: float
    reason: Optional[str]
    status: str
    created_by: UUID
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)
