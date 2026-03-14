import io
import csv
from typing import Optional
from enum import Enum

from fastapi import APIRouter, Depends, Query, HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from sqlalchemy import func

from database.connection import get_db
from models.stock import StockLevel, StockLedger
from models.product import Product, Category
from models.user import User
from services.auth_deps import get_current_user

router = APIRouter()

class ReportFormat(str, Enum):
    csv = "csv"
    json = "json"

class ReportType(str, Enum):
    inventory_valuation = "inventory_valuation"
    move_history = "move_history"

@router.get("/export")
def export_report(
    type: ReportType = Query(..., description="Type of the report to generate"),
    format: ReportFormat = Query(..., description="Format of the report"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    data = []
    
    if type == ReportType.inventory_valuation:
        results = (
            db.query(
                Category.name.label("category_name"),
                func.sum(StockLevel.quantity * 10.0).label("total_valuation") # Mocking cost_price as 10.0
            )
            .join(Product, Product.category_id == Category.id)
            .join(StockLevel, StockLevel.product_id == Product.id)
            .group_by(Category.name)
            .all()
        )
        for row in results:
            data.append({
                "category_name": row.category_name,
                "total_valuation": float(row.total_valuation or 0.0)
            })
            
    elif type == ReportType.move_history:
        results = (
            db.query(StockLedger)
            .order_by(StockLedger.created_at.desc())
            .limit(100)
            .all()
        )
        for row in results:
            data.append({
                "id": str(row.id),
                "product_id": str(row.product_id),
                "location_id": str(row.location_id),
                "change_qty": row.change_qty,
                "operation_type": row.operation_type,
                "reference_id": str(row.reference_id),
                "reference_type": row.reference_type,
                "note": row.note,
                "created_by": str(row.created_by),
                "created_at": row.created_at.isoformat() if row.created_at else None,
            })
            
    if format == ReportFormat.csv:
        stream = io.StringIO()
        if data:
            writer = csv.DictWriter(stream, fieldnames=data[0].keys())
            writer.writeheader()
            writer.writerows(data)
        else:
            stream.write("No data found")
            
        stream.seek(0)
        response = StreamingResponse(iter([stream.getvalue()]), media_type="text/csv")
        response.headers["Content-Disposition"] = f"attachment; filename=report_{type.value}.csv"
        return response
        
    return {"data": data}
