from __future__ import annotations
from uuid import UUID
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict


# ── Category ──────────────────────────────────────────────────────────────────

class CategoryCreate(BaseModel):
    name: str


class CategoryUpdate(BaseModel):
    name: Optional[str] = None


class CategoryResponse(BaseModel):
    id: UUID
    name: str
    model_config = ConfigDict(from_attributes=True)


# ── Product ───────────────────────────────────────────────────────────────────

class ProductCreate(BaseModel):
    name: str
    sku: str
    category_id: UUID
    uom: str
    reorder_level: float = 0.0


class ProductUpdate(BaseModel):
    name: Optional[str] = None
    sku: Optional[str] = None
    category_id: Optional[UUID] = None
    uom: Optional[str] = None
    reorder_level: Optional[float] = None
    is_active: Optional[bool] = None


class ProductResponse(BaseModel):
    id: UUID
    name: str
    sku: str
    category_id: UUID
    uom: Optional[str]
    reorder_level: float
    is_active: bool
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)


class ProductStockView(BaseModel):
    location: str
    warehouse: str
    quantity: float
    model_config = ConfigDict(from_attributes=True)
