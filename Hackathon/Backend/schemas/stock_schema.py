from __future__ import annotations
from uuid import UUID
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict


# ── StockLevel ────────────────────────────────────────────────────────────────

class StockLevelResponse(BaseModel):
    id: UUID
    product_id: UUID
    location_id: UUID
    quantity: float
    model_config = ConfigDict(from_attributes=True)


# ── StockLedger ───────────────────────────────────────────────────────────────

class StockLedgerResponse(BaseModel):
    id: UUID
    product_id: UUID
    location_id: UUID
    change_qty: float
    operation_type: str
    reference_id: UUID
    reference_type: str
    note: Optional[str]
    created_by: UUID
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)


# ── Dashboard KPIs ────────────────────────────────────────────────────────────

class DashboardKPIResponse(BaseModel):
    total_products: int
    low_stock_count: int
    out_of_stock_count: int
    pending_receipts: int
    pending_deliveries: int
    scheduled_transfers: int
