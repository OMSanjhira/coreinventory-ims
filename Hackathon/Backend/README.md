# 🚀 Hackathon Pro Template - FastAPI

A generic, secure, and robust FastAPI template designed for high-speed hackathon development.

## ✨ "Must Have" Features Implemented
- **Standardized Responses:** Every API response follows a consistent `{success, message, data}` format.
- **Robust Validation:** Global Pydantic validation error handling with professional JSON feedback.
- **JWT Security:** Built-in Registration, Login, and Dependency-based route protection.
- **Dynamic CRUD:** Instant endpoints for any SQLAlchemy model added to the project.
- **Smart Search:** Real-time search across all string fields in generic routes.
- **Professional Docs:** Grouped Swagger UI for better organization.

## 🛠️ Local Setup (Virtual Round Friendly)

1. **Install Dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

2. **Setup Environment:**
   - Copy `.env.example` to `.env`
   - Update your Database credentials in `.env`

3. **Initialize Database:**
   ```bash
   python create_tables.py
   ```

4. **Seed Demo Data:**
   ```bash
   python seed.py
   ```

5. **Run the API:**
   ```bash
   uvicorn main:app --reload
   ```

6. **View Docs:** Visit `http://localhost:8000/docs`

## 📂 Project Structure
- `core/`: Constants, Config, Security utilities, and customized middleware.
- `routers/`: API route definitions (Auth, Products, Warehouses, Operations, Dashboard, etc.).
- `services/`: Business logic layer, state machines, and direct database interactions.
- `models/`: SQLAlchemy Database models (Tables schema).
- `schemas/`: Pydantic Data Validation and Serialization schemas.
- `utils/`: Common helpers, custom alerts, and response wrappers.

## 🏗️ How it Works (Architecture)

This Inventory Management System (IMS) follows a clean, modular architecture designed for scalability and auditability.

### 1. Request Flow
Every API request follows a strict path:
1. **Client Request**: Frontend hits an endpoint (e.g., `POST /api/v1/receipts`).
2. **Router (`routers/`)**: FastAPI maps the request, performs path/query validation, and checks authentication dependencies.
3. **Service Layer (`services/`)**: The core logic resides here. It handles complex business rules (e.g., "cannot ship more than available stock") and database transactions.
4. **Database Models (`models/`)**: SQLAlchemy structures the query to PostgreSQL.
5. **Response Wrapping**: The result is wrapped in a standardized `{success: true, message: "...", data: {...}}` JSON object.

### 2. Authentication & Authorization
- **JWT (JSON Web Tokens)**: Used for stateless session management. tokens are signed and verified against a secret key.
- **OTP (One-Time Password)**: Integrated for secure account creation and password resets.
- **RBAC (Role-Based Access Control)**: Middleware ensures that only users with the `manager` role can perform administrative tasks (e.g., create products, adjust stock), while `staff` users are limited to operational execution.

### 3. Inventory Operations State Machine
Warehouse operations (Receipts, Deliveries, Transfers) follow a state machine pattern to maintain an audit trail:
- **Draft**: The operation is being planned.
- **Waiting/Confirmed**: Resource validation (e.g., checking source stock).
- **Ready/Pick**: Items are physically being moved/prepared.
- **Done/Validated**: Final stage where stock balances are updated in the database and a ledger entry is created.
- **Canceled**: Terminated state, no stock impact.

### 4. Stock Ledger System
All validated movements are logged in the `StockMove` ledger. This allows for:
- Full traceability of every item.
- Historical reporting and audit logs.
- Real-time dashboard KPI computation.

## 💡 Pro Tip for Demo
Use the `?q=search_term` parameter in any GET list route to show off the **Smart Search** capability!