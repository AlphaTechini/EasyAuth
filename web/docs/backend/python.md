# Python Integration

EasyAuth's backend SDK is TypeScript-first, but the server contract it exposes is a plain HTTP API. A Python backend implements the same six routes and calls the same Crossmint and Better Auth endpoints. This guide shows how to do that with **FastAPI** and **Flask**.

::: tip Crossmint is handled for you
You do not need a Crossmint account. EasyAuth manages the Crossmint integration centrally. Pass your EasyAuth API key and wallets and funding work out of the box.
:::

::: info Why no Python SDK package?
The wallet and funding logic lives server-side and is thin enough to implement directly in any language. A Python package would just be a thin HTTP wrapper around the same Crossmint and Better Auth calls — not worth the maintenance overhead for v1.
:::

## Route Contract

Your Python server must expose these routes at the same paths the frontend SDK calls:

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/easyauth/session` | Return current session from Better Auth |
| `GET` | `/api/easyauth/wallet` | Get or create the user's wallet |
| `POST` | `/api/easyauth/wallet` | Explicitly create wallet |
| `POST` | `/api/easyauth/funding/orders` | Create a Crossmint funding order |
| `GET` | `/api/easyauth/funding/{id}` | Get funding status |
| `POST` | `/api/easyauth/webhooks/crossmint` | Receive Crossmint webhook events |

## Environment Variables

```dotenv
# Better Auth
BETTER_AUTH_SECRET=your-secret-key-min-32-chars
BETTER_AUTH_URL=http://localhost:3000

# Google OAuth
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret

# EasyAuth — provides Crossmint access
EASYAUTH_API_KEY=your-easyauth-api-key

# Your database
DATABASE_URL=postgresql://user:password@localhost:5432/myapp
```

## FastAPI Setup

### Installation

```bash
pip install fastapi uvicorn httpx python-dotenv psycopg2-binary svix
```

### Project Structure

```
myapp/
├── main.py
├── easyauth/
│   ├── __init__.py
│   ├── session.py
│   ├── wallet.py
│   ├── funding.py
│   └── webhook.py
├── db.py
└── .env
```

### Database Helper

```python
# db.py
import os
import psycopg2
from psycopg2.extras import RealDictCursor
from dotenv import load_dotenv

load_dotenv()

def get_conn():
    return psycopg2.connect(os.environ["DATABASE_URL"])

def get_wallet_by_user_id(user_id: str):
    with get_conn() as conn:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute(
                "SELECT * FROM easyauth_wallets WHERE user_id = %s",
                (user_id,)
            )
            return cur.fetchone()

def save_wallet(wallet: dict):
    with get_conn() as conn:
        with conn.cursor() as cur:
            cur.execute("""
                INSERT INTO easyauth_wallets
                  (id, user_id, address, provider, provider_wallet_id,
                   provider_owner_id, idempotency_key, chain, network, status)
                VALUES
                  (%(id)s, %(user_id)s, %(address)s, %(provider)s,
                   %(provider_wallet_id)s, %(provider_owner_id)s,
                   %(idempotency_key)s, %(chain)s, %(network)s, %(status)s)
                ON CONFLICT (user_id) DO UPDATE SET
                  address = EXCLUDED.address,
                  status = EXCLUDED.status,
                  updated_at = NOW()
            """, wallet)
        conn.commit()

def create_funding_tx(tx: dict):
    with get_conn() as conn:
        with conn.cursor() as cur:
            cur.execute("""
                INSERT INTO easyauth_funding_transactions
                  (id, user_id, wallet_id, provider_order_id,
                   fiat_amount, fiat_currency, status)
                VALUES
                  (%(id)s, %(user_id)s, %(wallet_id)s, %(provider_order_id)s,
                   %(fiat_amount)s, %(fiat_currency)s, %(status)s)
            """, tx)
        conn.commit()

def update_funding_tx(order_id: str, updates: dict):
    with get_conn() as conn:
        with conn.cursor() as cur:
            cur.execute("""
                UPDATE easyauth_funding_transactions
                SET payment_status = %(payment_status)s,
                    delivery_status = %(delivery_status)s,
                    status = %(status)s,
                    updated_at = NOW()
                WHERE provider_order_id = %(order_id)s
            """, {**updates, "order_id": order_id})
        conn.commit()
```

### Session Helper

```python
# easyauth/session.py
import os
import httpx

BETTER_AUTH_URL = os.environ["BETTER_AUTH_URL"]

async def get_session(cookie_header: str | None) -> dict | None:
    """
    Validate the session cookie with Better Auth and return the user.
    Better Auth exposes GET /api/auth/get-session for this.
    """
    if not cookie_header:
        return None

    async with httpx.AsyncClient() as client:
        resp = await client.get(
            f"{BETTER_AUTH_URL}/api/auth/get-session",
            headers={"cookie": cookie_header}
        )

    if resp.status_code != 200:
        return None

    data = resp.json()
    return data.get("user")
```

### Wallet Handler

```python
# easyauth/wallet.py
import os
import uuid
import httpx

# EasyAuth provides Crossmint access — no Crossmint key needed on your side.
EASYAUTH_API_URL = "https://api.easyauth.dev"
EASYAUTH_API_KEY = os.environ["EASYAUTH_API_KEY"]

async def get_or_create_wallet(user_id: str, db_wallet) -> dict:
    """
    Return the existing wallet from the database, or create one via
    EasyAuth's Crossmint integration and persist it.
    """
    if db_wallet:
        return dict(db_wallet)

    idempotency_key = f"wallet_{user_id}"

    async with httpx.AsyncClient() as client:
        resp = await client.post(
            f"{EASYAUTH_API_URL}/wallets",
            json={
                "owner": f"userId:{user_id}",
                "chain": "solana",
                "network": os.environ.get("SOLANA_NETWORK", "devnet"),
                "idempotencyKey": idempotency_key
            },
            headers={
                "x-api-key": EASYAUTH_API_KEY,
                "content-type": "application/json"
            }
        )
        resp.raise_for_status()
        data = resp.json()

    return {
        "id": f"wallet_{uuid.uuid4().hex}",
        "user_id": user_id,
        "address": data["address"],
        "provider": "crossmint",
        "provider_wallet_id": data.get("id"),
        "provider_owner_id": f"userId:{user_id}",
        "idempotency_key": idempotency_key,
        "chain": "solana",
        "network": os.environ.get("SOLANA_NETWORK", "devnet"),
        "status": "active"
    }
```

### Funding Handler

```python
# easyauth/funding.py
import os
import uuid
import httpx

EASYAUTH_API_URL = "https://api.easyauth.dev"
EASYAUTH_API_KEY = os.environ["EASYAUTH_API_KEY"]

async def create_order(user_id: str, wallet_address: str, wallet_id: str,
                       amount: float, currency: str) -> dict:
    async with httpx.AsyncClient() as client:
        resp = await client.post(
            f"{EASYAUTH_API_URL}/funding/orders",
            json={
                "walletAddress": wallet_address,
                "amount": amount,
                "currency": currency,
                "chain": "solana",
                "network": os.environ.get("SOLANA_NETWORK", "devnet")
            },
            headers={
                "x-api-key": EASYAUTH_API_KEY,
                "content-type": "application/json"
            }
        )
        resp.raise_for_status()
        data = resp.json()

    return {
        "id": f"ftx_{uuid.uuid4().hex}",
        "user_id": user_id,
        "wallet_id": wallet_id,
        "provider_order_id": data.get("orderId"),
        "fiat_amount": amount,
        "fiat_currency": currency,
        "status": "pending"
    }
```

### Webhook Handler

```python
# easyauth/webhook.py
import os
import hmac
import hashlib
import json

# Crossmint uses Svix for webhook delivery.
# The webhook secret comes from your EasyAuth dashboard.
WEBHOOK_SECRET = os.environ.get("EASYAUTH_WEBHOOK_SECRET", "")

def verify_signature(svix_id: str, svix_timestamp: str,
                     svix_signature: str, raw_body: bytes) -> bool:
    """
    Verify the Svix webhook signature.
    See: https://docs.svix.com/receiving/verifying-payloads/how
    """
    signed_content = f"{svix_id}.{svix_timestamp}.{raw_body.decode()}"
    secret_bytes = WEBHOOK_SECRET.encode()
    expected = hmac.new(secret_bytes, signed_content.encode(), hashlib.sha256).digest()
    import base64
    expected_b64 = base64.b64encode(expected).decode()

    # svix_signature may contain multiple space-separated signatures
    for sig in svix_signature.split(" "):
        if sig.startswith("v1,") and sig[3:] == expected_b64:
            return True
    return False

def map_status(event_type: str, payload: dict) -> dict:
    """Map Crossmint event types to EasyAuth status fields."""
    payment_status = payload.get("paymentStatus", "pending")
    delivery_status = payload.get("deliveryStatus", "not_started")

    if payment_status == "paid" and delivery_status == "completed":
        status = "funded"
    elif payment_status in ("failed", "cancelled"):
        status = payment_status
    elif payment_status == "paid":
        status = "paid"
    else:
        status = "pending"

    return {
        "payment_status": payment_status,
        "delivery_status": delivery_status,
        "status": status
    }
```

### FastAPI App

```python
# main.py
import os
import json
from fastapi import FastAPI, Request, HTTPException, Depends
from fastapi.responses import JSONResponse
from dotenv import load_dotenv

import db
from easyauth.session import get_session
from easyauth.wallet import get_or_create_wallet
from easyauth.funding import create_order
from easyauth import webhook

load_dotenv()

app = FastAPI()

# ── Session ──────────────────────────────────────────────────────────────────

@app.get("/api/easyauth/session")
async def session_route(request: Request):
    user = await get_session(request.headers.get("cookie"))
    if not user:
        raise HTTPException(status_code=401, detail="No active session")
    return {"user": user}

# ── Wallet ────────────────────────────────────────────────────────────────────

@app.get("/api/easyauth/wallet")
async def get_wallet(request: Request):
    user = await get_session(request.headers.get("cookie"))
    if not user:
        raise HTTPException(status_code=401, detail="Unauthorized")

    db_wallet = db.get_wallet_by_user_id(user["id"])
    wallet = await get_or_create_wallet(user["id"], db_wallet)

    if not db_wallet:
        db.save_wallet(wallet)

    return {"wallet": wallet}

@app.post("/api/easyauth/wallet")
async def create_wallet(request: Request):
    user = await get_session(request.headers.get("cookie"))
    if not user:
        raise HTTPException(status_code=401, detail="Unauthorized")

    db_wallet = db.get_wallet_by_user_id(user["id"])
    wallet = await get_or_create_wallet(user["id"], db_wallet)

    if not db_wallet:
        db.save_wallet(wallet)

    return {"wallet": wallet}

# ── Funding ───────────────────────────────────────────────────────────────────

@app.post("/api/easyauth/funding/orders")
async def create_funding_order(request: Request):
    user = await get_session(request.headers.get("cookie"))
    if not user:
        raise HTTPException(status_code=401, detail="Unauthorized")

    body = await request.json()
    amount = body.get("amount", 50)
    currency = body.get("currency", "USD")

    db_wallet = db.get_wallet_by_user_id(user["id"])
    if not db_wallet:
        raise HTTPException(status_code=404, detail="Wallet not found")

    tx = await create_order(
        user_id=user["id"],
        wallet_address=db_wallet["address"],
        wallet_id=db_wallet["id"],
        amount=amount,
        currency=currency
    )
    db.create_funding_tx(tx)

    return {"transaction": tx}

@app.get("/api/easyauth/funding/{transaction_id}")
async def get_funding_status(transaction_id: str, request: Request):
    user = await get_session(request.headers.get("cookie"))
    if not user:
        raise HTTPException(status_code=401, detail="Unauthorized")

    # Fetch from your database
    with db.get_conn() as conn:
        from psycopg2.extras import RealDictCursor
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute(
                "SELECT * FROM easyauth_funding_transactions WHERE id = %s AND user_id = %s",
                (transaction_id, user["id"])
            )
            tx = cur.fetchone()

    if not tx:
        raise HTTPException(status_code=404, detail="Transaction not found")

    return {"transaction": dict(tx)}

# ── Webhooks ──────────────────────────────────────────────────────────────────

@app.post("/api/easyauth/webhooks/crossmint")
async def crossmint_webhook(request: Request):
    raw_body = await request.body()

    svix_id = request.headers.get("svix-id", "")
    svix_timestamp = request.headers.get("svix-timestamp", "")
    svix_signature = request.headers.get("svix-signature", "")

    if not webhook.verify_signature(svix_id, svix_timestamp, svix_signature, raw_body):
        raise HTTPException(status_code=401, detail="Invalid webhook signature")

    payload = json.loads(raw_body)
    event_type = payload.get("type", "")
    order_id = payload.get("data", {}).get("orderId")

    if order_id:
        status_update = webhook.map_status(event_type, payload.get("data", {}))
        db.update_funding_tx(order_id, status_update)

    return {"received": True}

# ── Run ───────────────────────────────────────────────────────────────────────

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=3000)
```

Run the server:

```bash
uvicorn main:app --reload --port 3000
```

## Flask Setup

If you prefer Flask:

```bash
pip install flask httpx python-dotenv psycopg2-binary
```

```python
# app.py
import os
import json
from flask import Flask, request, jsonify
from dotenv import load_dotenv
import asyncio

import db
from easyauth.session import get_session
from easyauth.wallet import get_or_create_wallet
from easyauth.funding import create_order
from easyauth import webhook

load_dotenv()
app = Flask(__name__)

def run_async(coro):
    """Run an async function from a sync Flask route."""
    return asyncio.get_event_loop().run_until_complete(coro)

@app.get("/api/easyauth/session")
def session_route():
    user = run_async(get_session(request.headers.get("Cookie")))
    if not user:
        return jsonify({"error": "Unauthorized"}), 401
    return jsonify({"user": user})

@app.get("/api/easyauth/wallet")
def get_wallet():
    user = run_async(get_session(request.headers.get("Cookie")))
    if not user:
        return jsonify({"error": "Unauthorized"}), 401

    db_wallet = db.get_wallet_by_user_id(user["id"])
    wallet = run_async(get_or_create_wallet(user["id"], db_wallet))
    if not db_wallet:
        db.save_wallet(wallet)

    return jsonify({"wallet": wallet})

@app.post("/api/easyauth/webhooks/crossmint")
def crossmint_webhook():
    raw_body = request.get_data()
    svix_id = request.headers.get("svix-id", "")
    svix_timestamp = request.headers.get("svix-timestamp", "")
    svix_signature = request.headers.get("svix-signature", "")

    if not webhook.verify_signature(svix_id, svix_timestamp, svix_signature, raw_body):
        return jsonify({"error": "Invalid signature"}), 401

    payload = json.loads(raw_body)
    order_id = payload.get("data", {}).get("orderId")
    if order_id:
        status_update = webhook.map_status(
            payload.get("type", ""),
            payload.get("data", {})
        )
        db.update_funding_tx(order_id, status_update)

    return jsonify({"received": True})

if __name__ == "__main__":
    app.run(port=3000, debug=True)
```

## Next Steps

- [Frontend Integration](/frontend/) — Connect your frontend
- [API Reference](/api/backend) — Full route and type documentation
