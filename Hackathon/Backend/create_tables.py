"""
create_tables.py — CoreInventory IMS
Creates all database tables by importing every model and calling
Base.metadata.create_all(engine).
"""
from database.connection import engine, Base

# Import ALL models so SQLAlchemy registers them in Base.metadata
from models.user import User, OTPToken
from models.warehouse import Warehouse, Location
from models.product import Category, Product
from models.stock import StockLevel, StockLedger
from models.operations import (
    Receipt, ReceiptItem,
    DeliveryOrder, DeliveryItem,
    InternalTransfer, TransferItem,
    StockAdjustment,
)


def create_all_tables():
    print("Creating CoreInventory tables...")
    Base.metadata.create_all(bind=engine)
    table_names = list(Base.metadata.tables.keys())
    for table in sorted(table_names):
        print(f"  ✓ {table}")
    print(f"\n✅ {len(table_names)} tables created/verified successfully.")


if __name__ == "__main__":
    create_all_tables()
