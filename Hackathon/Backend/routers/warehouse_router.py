from uuid import UUID
from typing import Optional

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from database.connection import get_db
from models.user import User
from models.warehouse import Warehouse, Location
from schemas.warehouse_schema import WarehouseCreate, WarehouseUpdate, LocationCreate, LocationUpdate
from services.auth_deps import get_current_user
from utils.response_wrapper import success_response, error_response

router = APIRouter()


# ── Warehouses ────────────────────────────────────────────────────────────────

@router.get("")
def list_warehouses(
    search: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    q = db.query(Warehouse).filter(Warehouse.is_active == True)
    if search:
        q = q.filter(Warehouse.name.ilike(f"%{search}%"))
    warehouses = q.all()
    return success_response(
        data=[
            {"id": str(w.id), "name": w.name, "short_code": w.short_code,
             "address": w.address, "is_active": w.is_active}
            for w in warehouses
        ],
        message="Warehouses retrieved",
    )


@router.post("", status_code=201)
def create_warehouse(
    data: WarehouseCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    warehouse = Warehouse(**data.model_dump())
    db.add(warehouse)
    db.commit()
    db.refresh(warehouse)
    return success_response(
        data={"id": str(warehouse.id), "name": warehouse.name,
              "short_code": warehouse.short_code, "address": warehouse.address},
        message="Warehouse created",
        status_code=201,
    )


@router.get("/{warehouse_id}")
def get_warehouse(
    warehouse_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    w = db.query(Warehouse).filter(Warehouse.id == warehouse_id).first()
    if not w:
        return error_response("Warehouse not found", status_code=404)
    return success_response(
        data={"id": str(w.id), "name": w.name, "short_code": w.short_code,
              "address": w.address, "is_active": w.is_active},
        message="Warehouse retrieved",
    )


@router.put("/{warehouse_id}")
def update_warehouse(
    warehouse_id: UUID,
    data: WarehouseUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    w = db.query(Warehouse).filter(Warehouse.id == warehouse_id).first()
    if not w:
        return error_response("Warehouse not found", status_code=404)
    for field, value in data.model_dump(exclude_none=True).items():
        setattr(w, field, value)
    db.commit()
    db.refresh(w)
    return success_response(
        data={"id": str(w.id), "name": w.name, "short_code": w.short_code,
              "address": w.address, "is_active": w.is_active},
        message="Warehouse updated",
    )


@router.delete("/{warehouse_id}")
def delete_warehouse(
    warehouse_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    w = db.query(Warehouse).filter(Warehouse.id == warehouse_id).first()
    if not w:
        return error_response("Warehouse not found", status_code=404)
    w.is_active = False
    db.commit()
    return success_response(data=None, message="Warehouse deactivated")


@router.get("/{warehouse_id}/locations")
def list_locations(
    warehouse_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    locations = (
        db.query(Location)
        .filter(Location.warehouse_id == warehouse_id, Location.is_active == True)
        .all()
    )
    return success_response(
        data=[
            {"id": str(loc.id), "name": loc.name, "short_code": loc.short_code,
             "warehouse_id": str(loc.warehouse_id), "is_active": loc.is_active}
            for loc in locations
        ],
        message="Locations retrieved",
    )


@router.post("/{warehouse_id}/locations", status_code=201)
def create_location(
    warehouse_id: UUID,
    data: LocationCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    loc = Location(warehouse_id=warehouse_id, name=data.name, short_code=data.short_code)
    db.add(loc)
    db.commit()
    db.refresh(loc)
    return success_response(
        data={"id": str(loc.id), "name": loc.name, "short_code": loc.short_code,
              "warehouse_id": str(loc.warehouse_id)},
        message="Location created",
        status_code=201,
    )
