from uuid import UUID
from typing import Optional
import io
import json
import qrcode

from fastapi import APIRouter, Depends, Query, Response
from sqlalchemy.orm import Session

from database.connection import get_db
from models.user import User
from models.product import Category, Product
from models.stock import StockLevel
from models.warehouse import Location, Warehouse
from schemas.product_schema import ProductCreate, ProductUpdate, CategoryCreate
from services.auth_deps import get_current_user, require_role
from utils.response_wrapper import success_response, error_response

router = APIRouter()


# ── Categories (sub-resource) ─────────────────────────────────────────────────

@router.get("/categories")
def list_categories(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    cats = db.query(Category).all()
    return success_response(
        data=[{"id": str(c.id), "name": c.name} for c in cats],
        message="Categories retrieved",
    )


@router.post("/categories", status_code=201)
def create_category(data: CategoryCreate, db: Session = Depends(get_db),
                    current_user: User = Depends(get_current_user)):
    cat = Category(name=data.name)
    db.add(cat)
    db.commit()
    db.refresh(cat)
    return success_response(data={"id": str(cat.id), "name": cat.name},
                            message="Category created", status_code=201)


# ── Products ──────────────────────────────────────────────────────────────────

@router.get("")
def list_products(
    category_id: Optional[UUID] = Query(None),
    search: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    q = db.query(Product).filter(Product.is_active == True)
    if category_id:
        q = q.filter(Product.category_id == category_id)
    if search:
        q = q.filter(
            (Product.name.ilike(f"%{search}%")) | (Product.sku.ilike(f"%{search}%"))
        )
    products = q.all()
    return success_response(
        data=[
            {"id": str(p.id), "name": p.name, "sku": p.sku,
             "category_id": str(p.category_id), "uom": p.uom,
             "reorder_level": p.reorder_level, "is_active": p.is_active}
            for p in products
        ],
        message="Products retrieved",
    )


@router.post("", status_code=201)
def create_product(data: ProductCreate, db: Session = Depends(get_db),
                   current_user: User = Depends(require_role(["admin", "manager"]))):
    product = Product(**data.model_dump())
    db.add(product)
    db.commit()
    db.refresh(product)
    return success_response(
        data={"id": str(product.id), "name": product.name, "sku": product.sku,
              "category_id": str(product.category_id), "uom": product.uom,
              "reorder_level": product.reorder_level},
        message="Product created", status_code=201,
    )


@router.get("/{product_id}")
def get_product(product_id: UUID, db: Session = Depends(get_db),
                current_user: User = Depends(get_current_user)):
    p = db.query(Product).filter(Product.id == product_id).first()
    if not p:
        return error_response("Product not found", status_code=404)
    return success_response(
        data={"id": str(p.id), "name": p.name, "sku": p.sku,
              "category_id": str(p.category_id), "uom": p.uom,
              "reorder_level": p.reorder_level, "is_active": p.is_active},
        message="Product retrieved",
    )


@router.put("/{product_id}")
def update_product(product_id: UUID, data: ProductUpdate, db: Session = Depends(get_db),
                   current_user: User = Depends(get_current_user)):
    p = db.query(Product).filter(Product.id == product_id).first()
    if not p:
        return error_response("Product not found", status_code=404)
    for field, value in data.model_dump(exclude_none=True).items():
        setattr(p, field, value)
    db.commit()
    db.refresh(p)
    return success_response(
        data={"id": str(p.id), "name": p.name, "sku": p.sku, "reorder_level": p.reorder_level},
        message="Product updated",
    )


@router.delete("/{product_id}")
def delete_product(product_id: UUID, db: Session = Depends(get_db),
                   current_user: User = Depends(get_current_user)):
    p = db.query(Product).filter(Product.id == product_id).first()
    if not p:
        return error_response("Product not found", status_code=404)
    p.is_active = False
    db.commit()
    return success_response(data=None, message="Product deactivated")


@router.get("/{product_id}/stock")
def get_product_stock(product_id: UUID, db: Session = Depends(get_db),
                      current_user: User = Depends(get_current_user)):
    stocks = db.query(StockLevel).filter(StockLevel.product_id == product_id).all()
    result = []
    for s in stocks:
        loc = db.query(Location).filter(Location.id == s.location_id).first()
        wh = db.query(Warehouse).filter(Warehouse.id == loc.warehouse_id).first() if loc else None
        result.append({
            "location": loc.name if loc else str(s.location_id),
            "warehouse": wh.name if wh else "Unknown",
            "quantity": s.quantity,
            "location_id": str(s.location_id),
        })
    return success_response(data=result, message="Stock levels retrieved")


@router.get("/{product_id}/qrcode")
def generate_product_qrcode(product_id: UUID, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        return error_response("Product not found", status_code=404)
        
    payload = {
        "id": str(product.id),
        "sku": product.sku,
        "name": product.name
    }
    
    qr = qrcode.QRCode(version=1, box_size=10, border=4)
    qr.add_data(json.dumps(payload))
    qr.make(fit=True)
    
    img = qr.make_image(fill_color="black", back_color="white")
    
    buffer = io.BytesIO()
    img.save(buffer, format="PNG")
    
    return Response(content=buffer.getvalue(), media_type="image/png")
