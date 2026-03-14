# Import all models so SQLAlchemy can discover them for create_all
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

# For backward compatibility with generic_service
MODEL_REGISTRY = {
    "user": User,
    "warehouse": Warehouse,
    "location": Location,
    "category": Category,
    "product": Product,
}
