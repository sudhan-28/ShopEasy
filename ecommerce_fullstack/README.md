# ShopEase — Full-Stack E-commerce Starter

A simple full-stack e-commerce application with a React + Vite frontend and Django REST Framework backend. SQLite is used by Django. Checkout creates an order and shows a toast notification; **no payment gateway is integrated**.

## Features
- Product listing with search and category filtering
- Product detail view
- Shopping cart with quantity controls
- Checkout form
- Order creation and order confirmation toast
- Django admin for managing products and viewing orders
- Sample products loaded through a management command
- Responsive UI

## Requirements
- Python 3.10+
- Node.js 18+ and npm

## 1. Start the backend

Open a terminal in `backend/`:

### Windows PowerShell
```powershell
py -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
python manage.py makemigrations shop
python manage.py migrate
python manage.py seed_products
python manage.py createsuperuser
python manage.py runserver
```

If PowerShell blocks activation, run `Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass` and activate again.

Backend API: http://127.0.0.1:8000/api/products/
Django admin: http://127.0.0.1:8000/admin/

## 2. Start the frontend

Open a second terminal in `frontend/`:

```bash
npm install
npm run dev
```

Open the URL shown by Vite, normally http://localhost:5173.

## API endpoints
- `GET /api/products/` — list products; optional `?search=shirt&category=Clothing`
- `GET /api/products/<id>/` — product details
- `GET /api/categories/` — category list
- `POST /api/orders/` — create an order

Example order body:
```json
{
  "customer_name": "Alex Kumar",
  "email": "alex@example.com",
  "address": "12 Main Road",
  "items": [{"product_id": 1, "quantity": 2}]
}
```

## Notes
- SQLite database is created locally as `backend/db.sqlite3` after migrations.
- The frontend uses `VITE_API_BASE_URL`, defaulting to `http://127.0.0.1:8000/api`.
- This is a learning/demo starter. Before production, add authentication, inventory locking, validation hardening, rate limiting, deployment-specific CORS settings, tests, and a production database.
- Do not commit secrets or your local database. The project includes `.gitignore`.
