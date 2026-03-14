"""
seed.py — FreshFlow Food & Beverage Distribution
Rich, production-like seed data for CoreInventory IMS.

Execution order follows strict FK dependencies:
  Users → Warehouses → Locations → Categories → Products →
  StockLevels + StockLedger (initial) →
  Receipts → Deliveries → Transfers → Adjustments
"""
import sys
import os
from datetime import datetime, timedelta
from uuid import uuid4

from sqlalchemy.orm import Session
from database.connection import SessionLocal
from core.security import get_password_hash
from models.user import User
from models.warehouse import Warehouse, Location
from models.product import Category, Product
from models.stock import StockLevel, StockLedger
from models.operations import (
    Receipt, ReceiptItem,
    DeliveryOrder, DeliveryItem,
    InternalTransfer, TransferItem,
    StockAdjustment,
)

# ── Reference time anchors (spread across last 7 days) ────────────────────────
NOW = datetime(2026, 3, 14, 10, 0, 0)   # current local time
D7  = NOW - timedelta(days=7)           # receipts[0]
D6  = NOW - timedelta(days=6)           # deliveries[0]
D5  = NOW - timedelta(days=5)           # receipts[1], transfers[0]
D4  = NOW - timedelta(days=4)           # deliveries[1]
D3  = NOW - timedelta(days=3)           # receipts[2]
D2  = NOW - timedelta(days=2)           # adjustment
D1  = NOW - timedelta(days=1)           # transfers[1] (pending)
D0  = NOW                               # deliveries[2] (pending)


# ── Helpers ───────────────────────────────────────────────────────────────────

def _apply_stock_change(db, product_id, location_id, change_qty,
                        operation_type, reference_id, reference_type,
                        user_id, note=None, created_at=None):
    """
    Core stock mutation helper — mirrors services/stock_service.py.
    Updates StockLevel and inserts StockLedger entry.
    """
    stock = (
        db.query(StockLevel)
        .filter(StockLevel.product_id == product_id,
                StockLevel.location_id == location_id)
        .first()
    )
    if not stock:
        stock = StockLevel(product_id=product_id, location_id=location_id, quantity=0.0)
        db.add(stock)
        db.flush()

    stock.quantity += change_qty

    ledger = StockLedger(
        product_id=product_id,
        location_id=location_id,
        change_qty=change_qty,
        operation_type=operation_type,
        reference_id=reference_id,
        reference_type=reference_type,
        note=note,
        created_by=user_id,
        created_at=created_at or NOW,
    )
    db.add(ledger)


def seed_db():
    db: Session = SessionLocal()
    ledger_count = 0

    try:
        print("\nSeeding FreshFlow Food & Beverage Distribution...\n")

        # ══════════════════════════════════════════════════════════════════════
        # STEP 1 — USERS
        # ══════════════════════════════════════════════════════════════════════
        users_data = [
            ("Arjun Mehta",  "admin@freshflow.com",  "Admin@123",   "admin"),
            ("Priya Sharma", "priya@freshflow.com",  "Manager@123", "manager"),
            ("Rohan Patel",  "rohan@freshflow.com",  "Manager@123", "manager"),
            ("Kiran Desai",  "kiran@freshflow.com",  "Staff@123",   "staff"),
            ("Sneha Joshi",  "sneha@freshflow.com",  "Staff@123",   "staff"),
            ("Ravi Kumar",   "ravi@freshflow.com",   "Staff@123",   "staff"),
        ]
        users = {}
        for name, email, pwd, role in users_data:
            u = db.query(User).filter(User.email == email).first()
            if not u:
                u = User(name=name, email=email,
                         password_hash=get_password_hash(pwd), role=role)
                db.add(u)
                db.flush()
                print(f"  ✓ User [{role:8s}] {name} <{email}>")
            users[email] = u

        admin   = users["admin@freshflow.com"]
        priya   = users["priya@freshflow.com"]
        rohan   = users["rohan@freshflow.com"]
        kiran   = users["kiran@freshflow.com"]
        sneha   = users["sneha@freshflow.com"]
        ravi    = users["ravi@freshflow.com"]

        # ══════════════════════════════════════════════════════════════════════
        # STEP 2 — WAREHOUSES
        # ══════════════════════════════════════════════════════════════════════
        wh_data = [
            ("Main Cold Storage Facility",  "MCS", "Unit 4, Food Park Industrial Estate, Ahmedabad - 382330"),
            ("Dry Goods Central Warehouse", "DGW", "Sector 9, GIDC Distribution Zone, Surat - 395010"),
            ("South Regional Hub",          "SRH", "Plot 22, Logistics Park, Vadodara - 390010"),
        ]
        warehouses = {}
        for name, code, address in wh_data:
            wh = db.query(Warehouse).filter(Warehouse.short_code == code).first()
            if not wh:
                wh = Warehouse(name=name, short_code=code, address=address)
                db.add(wh)
                db.flush()
                print(f"  ✓ Warehouse [{code}] {name}")
            warehouses[code] = wh

        # ══════════════════════════════════════════════════════════════════════
        # STEP 3 — LOCATIONS (5 per warehouse)
        # ══════════════════════════════════════════════════════════════════════
        loc_data = {
            "MCS": [
                ("Cold Room A - Beverages",   "CRA"),
                ("Cold Room B - Dairy",       "CRB"),
                ("Cold Room C - Perishables", "CRC"),
                ("Packing Station",           "PKS"),
                ("Loading Bay",               "LDB"),
            ],
            "DGW": [
                ("Aisle 1 - Grains & Oils",  "AS1"),
                ("Aisle 2 - Snacks",         "AS2"),
                ("Aisle 3 - Confectionery",  "AS3"),
                ("Bulk Storage Zone",        "BSZ"),
                ("Dispatch Counter",         "DPC"),
            ],
            "SRH": [
                ("Receiving Dock",  "RDK"),
                ("Storage Zone A",  "SZA"),
                ("Storage Zone B",  "SZB"),
                ("Returns Area",    "RTA"),
                ("Quarantine Bay",  "QRB"),
            ],
        }
        locs = {}
        for wh_code, loc_list in loc_data.items():
            for name, code in loc_list:
                loc = db.query(Location).filter(Location.short_code == code).first()
                if not loc:
                    loc = Location(warehouse_id=warehouses[wh_code].id,
                                   name=name, short_code=code)
                    db.add(loc)
                    db.flush()
                    print(f"  ✓ Location [{code}] {name}")
                locs[code] = loc

        # ══════════════════════════════════════════════════════════════════════
        # STEP 4 — CATEGORIES
        # ══════════════════════════════════════════════════════════════════════
        cat_names = [
            "Beverages", "Dairy & Perishables", "Dry & Packaged Foods",
            "Snacks & Confectionery", "Cooking Essentials", "Frozen Foods",
        ]
        cats = {}
        for name in cat_names:
            cat = db.query(Category).filter(Category.name == name).first()
            if not cat:
                cat = Category(name=name)
                db.add(cat)
                db.flush()
                print(f"  ✓ Category: {name}")
            cats[name] = cat

        # ══════════════════════════════════════════════════════════════════════
        # STEP 5 — PRODUCTS
        # Format: (name, sku, category, uom, reorder, initial_stock, loc_code)
        # ══════════════════════════════════════════════════════════════════════
        product_data = [
            # Beverages — Cold Room A
            ("Mango Fruit Juice 1L",             "BEV-001", "Beverages",              "cartons",  50.0,  320.0, "CRA"),
            ("Mineral Water 500ml Pack of 24",   "BEV-002", "Beverages",              "cases",   100.0,  550.0, "CRA"),
            ("Cold Coffee Tetra Pack 200ml",     "BEV-003", "Beverages",              "cartons",  40.0,  190.0, "CRA"),
            ("Orange Juice 500ml",               "BEV-004", "Beverages",              "cartons",  60.0,   25.0, "CRA"),  # LOW
            # Dairy — Cold Room B / C
            ("Full Cream Milk 1L",               "DAI-001", "Dairy & Perishables",    "litres",  200.0,  850.0, "CRB"),
            ("Paneer 200g Block",                "DAI-002", "Dairy & Perishables",    "pcs",      80.0,  260.0, "CRB"),
            ("Fresh Curd 500g",                  "DAI-003", "Dairy & Perishables",    "pcs",     100.0,    0.0, "CRB"),  # OUT OF STOCK
            ("Butter Salted 100g",               "DAI-004", "Dairy & Perishables",    "pcs",      50.0,   35.0, "CRC"),  # LOW
            # Dry Foods — Aisle 1
            ("Basmati Rice 5kg Bag",             "DRY-001", "Dry & Packaged Foods",   "bags",     60.0,  420.0, "AS1"),
            ("Whole Wheat Atta 10kg",            "DRY-002", "Dry & Packaged Foods",   "bags",     50.0,  280.0, "AS1"),
            ("Refined Sunflower Oil 1L",         "DRY-003", "Dry & Packaged Foods",   "bottles",  75.0,  340.0, "AS1"),
            # Snacks — Aisle 2 & 3
            ("Potato Chips Salted 100g",         "SNK-001", "Snacks & Confectionery", "pcs",     150.0,  620.0, "AS2"),
            ("Roasted Peanuts 200g",             "SNK-002", "Snacks & Confectionery", "pcs",     100.0,  380.0, "AS2"),
            ("Dark Chocolate Bar 50g",           "SNK-003", "Snacks & Confectionery", "pcs",     100.0,   90.0, "AS3"),  # LOW
            ("Mixed Dry Fruit Pack 250g",        "SNK-004", "Snacks & Confectionery", "packs",    50.0,  210.0, "AS3"),
            # Cooking — Bulk Storage
            ("Turmeric Powder 500g",             "CKE-001", "Cooking Essentials",     "pcs",      80.0,  430.0, "BSZ"),
            ("Cumin Seeds 250g",                 "CKE-002", "Cooking Essentials",     "pcs",      60.0,  290.0, "BSZ"),
            ("Red Chilli Powder 200g",           "CKE-003", "Cooking Essentials",     "pcs",      70.0,  310.0, "BSZ"),
            # Frozen — Cold Room C
            ("Frozen Sweet Corn 500g",           "FRZ-001", "Frozen Foods",           "pcs",      40.0,  175.0, "CRC"),
            ("Frozen Mixed Vegetables 1kg",      "FRZ-002", "Frozen Foods",           "pcs",      35.0,    0.0, "CRC"),  # OUT OF STOCK
        ]

        products = {}
        for name, sku, cat_name, uom, reorder, initial_qty, loc_code in product_data:
            p = db.query(Product).filter(Product.sku == sku).first()
            if not p:
                p = Product(
                    name=name, sku=sku,
                    category_id=cats[cat_name].id,
                    uom=uom, reorder_level=reorder,
                )
                db.add(p)
                db.flush()
                print(f"  ✓ Product [{sku}] {name}")
            products[sku] = (p, loc_code, initial_qty)

        # ══════════════════════════════════════════════════════════════════════
        # STEP 6 + 7 — STOCK LEVELS + INITIAL LEDGER ENTRIES
        # ══════════════════════════════════════════════════════════════════════
        seed_ref_id = uuid4()  # single reference UUID for all initial entries
        for sku, (p, loc_code, initial_qty) in products.items():
            loc = locs[loc_code]
            existing = (
                db.query(StockLevel)
                .filter(StockLevel.product_id == p.id,
                        StockLevel.location_id == loc.id)
                .first()
            )
            if not existing:
                # Create StockLevel at zero first, then apply change
                stock = StockLevel(product_id=p.id, location_id=loc.id, quantity=0.0)
                db.add(stock)
                db.flush()

                if initial_qty > 0:
                    _apply_stock_change(
                        db, p.id, loc.id, initial_qty,
                        operation_type="adjustment",
                        reference_id=seed_ref_id,
                        reference_type="seed",
                        user_id=admin.id,
                        note="Initial stock seeded",
                        created_at=D7 - timedelta(hours=1),
                    )
                    ledger_count += 1

        db.flush()
        print(f"\n  ✓ Stock levels (20 products) and initial ledger entries created")

        # ══════════════════════════════════════════════════════════════════════
        # STEP 8 + 9 — RECEIPTS
        # ══════════════════════════════════════════════════════════════════════
        def _ensure_receipt(db, ref, supplier, wh_code, status, created_by, created_at, validated_at=None):
            r = db.query(Receipt).filter(Receipt.reference == ref).first()
            if not r:
                r = Receipt(
                    reference=ref,
                    supplier=supplier,
                    warehouse_id=warehouses[wh_code].id,
                    status=status,
                    created_by=created_by.id,
                    created_at=created_at,
                    validated_at=validated_at,
                )
                db.add(r)
                db.flush()
            return r

        def _ensure_receipt_item(db, receipt, sku, loc_code, expected_qty, received_qty=None):
            p, _, _ = products[sku]
            loc = locs[loc_code]
            item = (
                db.query(ReceiptItem)
                .filter(ReceiptItem.receipt_id == receipt.id,
                        ReceiptItem.product_id == p.id)
                .first()
            )
            if not item:
                item = ReceiptItem(
                    receipt_id=receipt.id,
                    product_id=p.id,
                    location_id=loc.id,
                    expected_qty=expected_qty,
                    received_qty=received_qty,
                )
                db.add(item)
                db.flush()
            return item, p, loc

        # REC/2026/0001 — Gujarat Fresh Farms (done, 7 days ago)
        r1 = _ensure_receipt(db, "REC/2026/0001", "Gujarat Fresh Farms",
                             "MCS", "done", priya, D7, D7 + timedelta(hours=3))
        for sku, loc_code, exp, recv in [
            ("BEV-001", "CRA", 100, 100),
            ("BEV-004", "CRA",  80,  80),
        ]:
            item, p, loc = _ensure_receipt_item(db, r1, sku, loc_code, exp, recv)
            if db.query(StockLedger).filter(
                StockLedger.reference_id == r1.id,
                StockLedger.product_id == p.id
            ).first() is None:
                _apply_stock_change(db, p.id, loc.id, +recv,
                                    "receipt", r1.id, "receipt",
                                    priya.id, created_at=D7 + timedelta(hours=3))
                ledger_count += 1

        # REC/2026/0002 — Surat Dairy Co-op (done, 5 days ago)
        r2 = _ensure_receipt(db, "REC/2026/0002", "Surat Dairy Co-op",
                             "MCS", "done", rohan, D5, D5 + timedelta(hours=4))
        for sku, loc_code, exp, recv in [
            ("DAI-001", "CRB", 200, 200),
            ("DAI-002", "CRB", 100, 100),
            ("DAI-004", "CRC",  60,  60),
        ]:
            item, p, loc = _ensure_receipt_item(db, r2, sku, loc_code, exp, recv)
            if db.query(StockLedger).filter(
                StockLedger.reference_id == r2.id,
                StockLedger.product_id == p.id
            ).first() is None:
                _apply_stock_change(db, p.id, loc.id, +recv,
                                    "receipt", r2.id, "receipt",
                                    rohan.id, created_at=D5 + timedelta(hours=4))
                ledger_count += 1

        # REC/2026/0003 — AgriGold Wholesalers (done, 3 days ago)
        r3 = _ensure_receipt(db, "REC/2026/0003", "AgriGold Wholesalers",
                             "DGW", "done", priya, D3, D3 + timedelta(hours=2))
        for sku, loc_code, exp, recv in [
            ("DRY-001", "AS1", 150, 150),
            ("DRY-002", "AS1", 100, 100),
            ("CKE-001", "BSZ", 120, 120),
        ]:
            item, p, loc = _ensure_receipt_item(db, r3, sku, loc_code, exp, recv)
            if db.query(StockLedger).filter(
                StockLedger.reference_id == r3.id,
                StockLedger.product_id == p.id
            ).first() is None:
                _apply_stock_change(db, p.id, loc.id, +recv,
                                    "receipt", r3.id, "receipt",
                                    priya.id, created_at=D3 + timedelta(hours=2))
                ledger_count += 1

        # REC/2026/0004 — FrostFresh Frozen Foods (waiting, today)
        r4 = _ensure_receipt(db, "REC/2026/0004", "FrostFresh Frozen Foods",
                             "MCS", "waiting", rohan, D0)
        _ensure_receipt_item(db, r4, "FRZ-001", "CRC", 200)
        _ensure_receipt_item(db, r4, "FRZ-002", "CRC", 150)

        print("  ✓ Receipts: 4 (REC/0001–0003 done, REC/0004 waiting)")

        # ══════════════════════════════════════════════════════════════════════
        # STEP 10 + 11 — DELIVERIES
        # ══════════════════════════════════════════════════════════════════════
        def _ensure_delivery(db, ref, customer, wh_code, status, created_by, created_at, validated_at=None):
            d = db.query(DeliveryOrder).filter(DeliveryOrder.reference == ref).first()
            if not d:
                d = DeliveryOrder(
                    reference=ref,
                    customer=customer,
                    warehouse_id=warehouses[wh_code].id,
                    status=status,
                    created_by=created_by.id,
                    created_at=created_at,
                    validated_at=validated_at,
                )
                db.add(d)
                db.flush()
            return d

        def _ensure_delivery_item(db, delivery, sku, loc_code, requested_qty, delivered_qty=None):
            p, _, _ = products[sku]
            loc = locs[loc_code]
            item = (
                db.query(DeliveryItem)
                .filter(DeliveryItem.delivery_id == delivery.id,
                        DeliveryItem.product_id == p.id)
                .first()
            )
            if not item:
                item = DeliveryItem(
                    delivery_id=delivery.id,
                    product_id=p.id,
                    location_id=loc.id,
                    requested_qty=requested_qty,
                    delivered_qty=delivered_qty,
                )
                db.add(item)
                db.flush()
            return item, p, loc

        # DEL/2026/0001 — Star Hotels & Resorts (done, 6 days ago)
        d1 = _ensure_delivery(db, "DEL/2026/0001", "Star Hotels & Resorts",
                              "MCS", "done", priya, D6, D6 + timedelta(hours=5))
        for sku, loc_code, req, delv in [
            ("BEV-001", "CRA", 50, 50),
            ("DAI-001", "CRB", 100, 100),
        ]:
            item, p, loc = _ensure_delivery_item(db, d1, sku, loc_code, req, delv)
            if db.query(StockLedger).filter(
                StockLedger.reference_id == d1.id,
                StockLedger.product_id == p.id
            ).first() is None:
                _apply_stock_change(db, p.id, loc.id, -delv,
                                    "delivery", d1.id, "delivery",
                                    priya.id, created_at=D6 + timedelta(hours=5))
                ledger_count += 1

        # DEL/2026/0002 — QuickMart Retail Chain (done, 4 days ago)
        d2 = _ensure_delivery(db, "DEL/2026/0002", "QuickMart Retail Chain",
                              "DGW", "done", rohan, D4, D4 + timedelta(hours=3))
        for sku, loc_code, req, delv in [
            ("SNK-001", "AS2", 120, 120),
            ("SNK-003", "AS3",  80,  80),
            ("SNK-004", "AS3",  60,  60),
        ]:
            item, p, loc = _ensure_delivery_item(db, d2, sku, loc_code, req, delv)
            if db.query(StockLedger).filter(
                StockLedger.reference_id == d2.id,
                StockLedger.product_id == p.id
            ).first() is None:
                _apply_stock_change(db, p.id, loc.id, -delv,
                                    "delivery", d2.id, "delivery",
                                    rohan.id, created_at=D4 + timedelta(hours=3))
                ledger_count += 1

        # DEL/2026/0003 — City Supermart (ready/pending, today)
        d3 = _ensure_delivery(db, "DEL/2026/0003", "City Supermart",
                              "DGW", "ready", priya, D0)
        _ensure_delivery_item(db, d3, "DRY-003", "AS1", 80)
        _ensure_delivery_item(db, d3, "DRY-001", "AS1", 40)

        print("  ✓ Deliveries: 3 (DEL/0001–0002 done, DEL/0003 ready)")

        # ══════════════════════════════════════════════════════════════════════
        # STEP 12 + 13 — INTERNAL TRANSFERS
        # ══════════════════════════════════════════════════════════════════════
        def _ensure_transfer(db, ref, from_code, to_code, status, created_by, created_at):
            t = db.query(InternalTransfer).filter(InternalTransfer.reference == ref).first()
            if not t:
                t = InternalTransfer(
                    reference=ref,
                    from_location_id=locs[from_code].id,
                    to_location_id=locs[to_code].id,
                    status=status,
                    created_by=created_by.id,
                    created_at=created_at,
                )
                db.add(t)
                db.flush()
            return t

        def _ensure_transfer_item(db, transfer, sku, qty):
            p, _, _ = products[sku]
            item = (
                db.query(TransferItem)
                .filter(TransferItem.transfer_id == transfer.id,
                        TransferItem.product_id == p.id)
                .first()
            )
            if not item:
                item = TransferItem(transfer_id=transfer.id,
                                    product_id=p.id, quantity=qty)
                db.add(item)
                db.flush()
            return item, p

        # TRF/2026/0001 — Bulk Storage → Dispatch Counter (done, 5 days ago)
        t1 = _ensure_transfer(db, "TRF/2026/0001", "BSZ", "DPC", "done", kiran, D5)
        for sku, qty in [("CKE-002", 50), ("CKE-003", 40)]:
            item, p = _ensure_transfer_item(db, t1, sku, qty)
            if db.query(StockLedger).filter(
                StockLedger.reference_id == t1.id,
                StockLedger.product_id == p.id
            ).first() is None:
                _apply_stock_change(db, p.id, locs["BSZ"].id, -qty,
                                    "transfer_out", t1.id, "transfer",
                                    kiran.id, created_at=D5 + timedelta(hours=2))
                _apply_stock_change(db, p.id, locs["DPC"].id, +qty,
                                    "transfer_in",  t1.id, "transfer",
                                    kiran.id, created_at=D5 + timedelta(hours=2))
                ledger_count += 2

        # TRF/2026/0002 — Cold Room B → Packing Station (waiting, yesterday)
        t2 = _ensure_transfer(db, "TRF/2026/0002", "CRB", "PKS", "waiting", sneha, D1)
        _ensure_transfer_item(db, t2, "DAI-002", 30)

        print("  ✓ Transfers: 2 (TRF/0001 done, TRF/0002 waiting)")

        # ══════════════════════════════════════════════════════════════════════
        # STEP 14 — STOCK ADJUSTMENT
        # ══════════════════════════════════════════════════════════════════════
        adj_ref = "ADJ/2026/0001"
        curd_p, _, _ = products["DAI-003"]
        curd_loc = locs["CRB"]
        adj = db.query(StockAdjustment).filter(StockAdjustment.reference == adj_ref).first()
        if not adj:
            adj = StockAdjustment(
                reference=adj_ref,
                product_id=curd_p.id,
                location_id=curd_loc.id,
                old_qty=50.0,
                new_qty=0.0,
                reason="Entire batch expired during storage — discarded",
                status="done",
                created_by=ravi.id,
                created_at=D2,
            )
            db.add(adj)
            db.flush()

            # Apply the diff (0 - 50 = -50)
            if db.query(StockLedger).filter(
                StockLedger.reference_id == adj.id
            ).first() is None:
                _apply_stock_change(
                    db, curd_p.id, curd_loc.id, -50.0,
                    "adjustment", adj.id, "adjustment",
                    ravi.id,
                    note="Entire batch expired during storage — discarded",
                    created_at=D2,
                )
                ledger_count += 1

        print("  ✓ Adjustments: 1 (ADJ/0001 done — expired curd batch)")

        # ══════════════════════════════════════════════════════════════════════
        # COMMIT
        # ══════════════════════════════════════════════════════════════════════
        db.commit()

        # Count final ledger entries
        total_ledger = db.query(StockLedger).count()

        print("""
════════════════════════════════════
 FreshFlow IMS — Seed Complete ✅
════════════════════════════════════
✅ Users:            6
✅ Warehouses:       3
✅ Locations:        15
✅ Categories:       6
✅ Products:         20
✅ Stock Levels:     20
✅ Ledger Entries:   {ledger}
✅ Receipts:         4  (3 done, 1 waiting)
✅ Deliveries:       3  (2 done, 1 ready)
✅ Transfers:        2  (1 done, 1 waiting)
✅ Adjustments:      1  (1 done)
────────────────────────────────────
🔑 Login Credentials:
   admin@freshflow.com   / Admin@123
   priya@freshflow.com   / Manager@123
   rohan@freshflow.com   / Manager@123
   kiran@freshflow.com   / Staff@123
   sneha@freshflow.com   / Staff@123
   ravi@freshflow.com    / Staff@123
════════════════════════════════════

Expected dashboard KPIs:
  total_products:      20
  low_stock_count:     3   (Orange Juice, Butter Salted, Dark Chocolate)
  out_of_stock_count:  2   (Fresh Curd, Frozen Mixed Veg)
  pending_receipts:    1
  pending_deliveries:  2   (DEL/0003 ready + any draft)
  scheduled_transfers: 1   (TRF/0002 waiting)
""".format(ledger=total_ledger))

    except Exception as e:
        print(f"\n❌ Seed failed: {e}")
        import traceback
        traceback.print_exc()
        db.rollback()
        raise
    finally:
        db.close()


if __name__ == "__main__":
    seed_db()
