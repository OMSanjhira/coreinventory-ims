from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from models.stock import StockLevel, StockLedger
from models.product import Product
from models.warehouse import Location
from database.connection import Base
from datetime import datetime
import uuid

# Database URL
SQLALCHEMY_DATABASE_URL = "postgresql://postgres:password@localhost:5432/database"

engine = create_engine(SQLALCHEMY_DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def add_stock():
    db = SessionLocal()
    try:
        # Find product
        prod = db.query(Product).filter(Product.sku == "SNK-003").first()
        # Find location (AS2 - Aisle 2)
        loc = db.query(Location).filter(Location.short_code == "AS2").first()
        
        if not prod or not loc:
            print("Product or Location not found")
            return

        # Check existing stock
        stock = db.query(StockLevel).filter(
            StockLevel.product_id == prod.id,
            StockLevel.location_id == loc.id
        ).first()

        if not stock:
            stock = StockLevel(product_id=prod.id, location_id=loc.id, quantity=0.0)
            db.add(stock)
            db.flush()

        # Add 100 units
        stock.quantity += 100.0
        
        # Add ledger entry
        ledger = StockLedger(
            product_id=prod.id,
            location_id=loc.id,
            change_qty=100.0,
            operation_type="manual_adjustment",
            reference_id=uuid.uuid4(),
            reference_type="manual",
            note="Added stock for testing transfer validation",
            created_by=uuid.UUID("4192bff0-e1e0-43ce-a4db-912808c32493"), # Admin ID from earlier logs
            created_at=datetime.utcnow()
        )
        db.add(ledger)
        db.commit()
        print(f"Added 100 units of {prod.name} to {loc.name}")
    finally:
        db.close()

if __name__ == "__main__":
    add_stock()
