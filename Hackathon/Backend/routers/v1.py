from fastapi import APIRouter

from routers.auth_router import router as auth_router
from routers.warehouse_router import router as warehouse_router
from routers.product_router import router as product_router
from routers.receipt_router import router as receipt_router
from routers.delivery_router import router as delivery_router
from routers.transfer_router import router as transfer_router
from routers.adjustment_router import router as adjustment_router
from routers.dashboard_router import router as dashboard_router
from routers.ledger_router import router as ledger_router
from routers.reports_router import router as reports_router

v1_router = APIRouter()

v1_router.include_router(auth_router, prefix="/auth", tags=["Auth"])
v1_router.include_router(warehouse_router, prefix="/warehouses", tags=["Warehouses"])
v1_router.include_router(product_router, prefix="/products", tags=["Products"])
v1_router.include_router(receipt_router, prefix="/receipts", tags=["Receipts"])
v1_router.include_router(delivery_router, prefix="/deliveries", tags=["Deliveries"])
v1_router.include_router(transfer_router, prefix="/transfers", tags=["Transfers"])
v1_router.include_router(adjustment_router, prefix="/adjustments", tags=["Adjustments"])
v1_router.include_router(dashboard_router, prefix="/dashboard", tags=["Dashboard"])
v1_router.include_router(ledger_router, prefix="/ledger", tags=["Ledger"])
v1_router.include_router(reports_router, prefix="/reports", tags=["Reports"])
