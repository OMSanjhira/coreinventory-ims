from __future__ import annotations
from uuid import UUID
from typing import Optional, List
from pydantic import BaseModel, ConfigDict


# ── Warehouse ─────────────────────────────────────────────────────────────────

class WarehouseCreate(BaseModel):
    name: str
    short_code: Optional[str] = None
    address: Optional[str] = None


class WarehouseUpdate(BaseModel):
    name: Optional[str] = None
    short_code: Optional[str] = None
    address: Optional[str] = None
    is_active: Optional[bool] = None


class WarehouseResponse(BaseModel):
    id: UUID
    name: str
    short_code: Optional[str]
    address: Optional[str]
    is_active: bool
    model_config = ConfigDict(from_attributes=True)


# ── Location ──────────────────────────────────────────────────────────────────

class LocationCreate(BaseModel):
    warehouse_id: UUID
    name: str
    short_code: Optional[str] = None


class LocationUpdate(BaseModel):
    name: Optional[str] = None
    short_code: Optional[str] = None
    is_active: Optional[bool] = None


class LocationResponse(BaseModel):
    id: UUID
    warehouse_id: UUID
    name: str
    short_code: Optional[str]
    is_active: bool
    model_config = ConfigDict(from_attributes=True)
