from fastapi import APIRouter, Depends, Query
from typing import Optional
from sqlalchemy.orm import Session
from database.connection import get_db
from services.auth_deps import get_current_active_user
from services.generic_service import (
    create_record, get_all_records, get_record,
    update_record, delete_record
)

generic_router = APIRouter()

@generic_router.post("/{model_name}")
def create_handler(model_name: str, payload: dict, db: Session = Depends(get_db)):
    """Create a new record. Tag grouping is automatic."""
    return create_record(db, model_name, payload)

@generic_router.get("/{model_name}")
def list_handler(
    model_name: str, 
    skip: int = Query(0, ge=0), 
    limit: int = Query(10, ge=1, le=100), 
    q: Optional[str] = Query(None, description="Search term for smart search"),
    db: Session = Depends(get_db)
):
    return get_all_records(db, model_name, skip=skip, limit=limit, q=q)

@generic_router.get("/{model_name}/{record_id}")
def retrieve_handler(model_name: str, record_id: int, db: Session = Depends(get_db)):
    return get_record(db, model_name, record_id)

@generic_router.put("/{model_name}/{record_id}")
def update_handler(model_name: str, record_id: int, payload: dict, db: Session = Depends(get_db)):
    return update_record(db, model_name, record_id, payload)

@generic_router.delete("/{model_name}/{record_id}")
def delete_handler(model_name: str, record_id: int, db: Session = Depends(get_db)):
    return delete_record(db, model_name, record_id)
