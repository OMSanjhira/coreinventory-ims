from fastapi import HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import or_, String, cast
from models import MODEL_REGISTRY
from schemas import SCHEMA_REGISTRY
from utils.response_wrapper import success_response

def get_model_schema(model_name: str):
    model = MODEL_REGISTRY.get(model_name)
    schemas = SCHEMA_REGISTRY.get(model_name)

    if not model or not schemas:
        raise HTTPException(status_code=404, detail=f"Module '{model_name}' not found in registry")

    return model, schemas["create"], schemas["response"]

def create_record(db: Session, model_name: str, payload: dict):
    model, create_schema, response_schema = get_model_schema(model_name)

    try:
        validated_data = create_schema(**payload)
        obj = model(**validated_data.model_dump())
        
        db.add(obj)
        db.commit()
        db.refresh(obj)
        
        data = response_schema.model_validate(obj).model_dump()
        return success_response(data=data, message=f"{model_name.capitalize()} created successfully", status_code=201)
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=str(e))

def get_all_records(db: Session, model_name: str, skip: int = 0, limit: int = 100, q: str = None):
    model, _, response_schema = get_model_schema(model_name)
    
    query = db.query(model)
    
    # Smart Search: Automatically search across all string columns
    if q:
        search_filters = []
        for column in model.__table__.columns:
            if isinstance(column.type, String):
                search_filters.append(column.ilike(f"%{q}%"))
        
        if search_filters:
            query = query.filter(or_(*search_filters))

    rows = query.offset(skip).limit(limit).all()
    data = [response_schema.model_validate(r).model_dump() for r in rows]
    return success_response(data=data, message=f"Fetched {len(data)} {model_name} records")

def get_record(db: Session, model_name: str, record_id: int):
    model, _, response_schema = get_model_schema(model_name)

    obj = db.query(model).get(record_id)
    if not obj:
        raise HTTPException(status_code=404, detail=f"{model_name.capitalize()} with id {record_id} not found")

    data = response_schema.model_validate(obj).model_dump()
    return success_response(data=data)

def update_record(db: Session, model_name: str, record_id: int, payload: dict):
    model, create_schema, response_schema = get_model_schema(model_name)

    obj = db.query(model).get(record_id)
    if not obj:
        raise HTTPException(status_code=404, detail=f"{model_name.capitalize()} with id {record_id} not found")

    try:
        validated = create_schema(**payload)
        for key, value in validated.model_dump(exclude_unset=True).items():
            setattr(obj, key, value)

        db.commit()
        db.refresh(obj)
        data = response_schema.model_validate(obj).model_dump()
        return success_response(data=data, message=f"{model_name.capitalize()} updated successfully")
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=str(e))

def delete_record(db: Session, model_name: str, record_id: int):
    model, _, _ = get_model_schema(model_name)

    obj = db.query(model).get(record_id)
    if not obj:
        raise HTTPException(status_code=404, detail=f"{model_name.capitalize()} with id {record_id} not found")

    try:
        db.delete(obj)
        db.commit()
        return success_response(message=f"{model_name.capitalize()} deleted successfully")
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=str(e))
