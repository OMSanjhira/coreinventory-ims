# coreinventory-ims
A modular Inventory Management System built with FastAPI, PostgreSQL, and JavaScript to digitize product tracking, stock movements, warehouse operations, and real-time inventory monitoring.

## Demo Accounts
You can test out the application functionality using the following pre-configured demo user accounts. 

**Admin Role** (Full Access)
- Email: `admin@freshflow.com`
- Password: `Admin@123`

**Manager Role**
- Email: `priya@freshflow.com`
- Password: `Manager@123`
- Email: `rohan@freshflow.com`
- Password: `Manager@123`

**Staff Role**
- Email: `kiran@freshflow.com`
- Password: `Staff@123`
- Email: `sneha@freshflow.com`
- Password: `Staff@123`
- Email: `ravi@freshflow.com`
- Password: `Staff@123`

## Application Flow & How to Use

The application is designed to mimic a real-world warehouse and inventory management flow.

1. **Login & Dashboard Overview**:
   - Log in using one of the demo accounts above (use the Admin account for full visibility).
   - Once logged in, the **Dashboard** provides a high-level overview of Key Performance Indicators (KPIs) like total products, low stock alerts, out-of-stock items, and pending operations (receipts/deliveries/transfers).

2. **Manage Inventory & Layout**:
   - **Locations & Warehouses**: View the structural layout of where items are stored. 
   - **Products & Categories**: Browse the catalog of products. You can add new products or categorize them. Each product tracks its stock level across different warehouse locations.

3. **Stock Operations (The Core Flow)**:
   - **Receipts (Inbound)**: When new stock arrives from suppliers, create a Receipt. Once marked as "done," the stock gets added to the system ledger and increases the quantity in the designated location.
   - **Deliveries (Outbound)**: When stock needs to be shipped out to customers, create a Delivery Order. Fulfilling a delivery reduces the stock quantity.
   - **Internal Transfers**: Move stock between different warehouses or specific locations (like moving from Cold Room A to Packing Station).
   - **Adjustments**: Manually correct stock anomalies (e.g., loss, damage, or audit corrections).

4. **Tracking Movements**:
   - Every single stock change (receipt, delivery, transfer, adjustment) is recorded immutably in the **Stock Ledger**. You can review this ledger to trace exactly when, why, and by whom a product quantity was altered.
