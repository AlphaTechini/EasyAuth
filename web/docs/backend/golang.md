# Go Integration

EasyAuth's backend SDK is TypeScript-first, but the server contract is a plain HTTP API. A Go backend implements the same six routes and calls the same upstream services. This guide shows how to do that with the **standard library** and with **Gin**.

::: tip Crossmint is handled for you
You do not need a Crossmint account. EasyAuth manages the Crossmint integration centrally. Pass your EasyAuth API key and wallets and funding work out of the box.
:::

## Route Contract

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/easyauth/session` | Return current session |
| `GET` | `/api/easyauth/wallet` | Get or create wallet |
| `POST` | `/api/easyauth/wallet` | Explicitly create wallet |
| `POST` | `/api/easyauth/funding/orders` | Create funding order |
| `GET` | `/api/easyauth/funding/:id` | Get funding status |
| `POST` | `/api/easyauth/webhooks/crossmint` | Receive Crossmint webhooks |

## Environment Variables

```dotenv
BETTER_AUTH_SECRET=your-secret-key-min-32-chars
BETTER_AUTH_URL=http://localhost:3000
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret
EASYAUTH_API_KEY=your-easyauth-api-key
EASYAUTH_WEBHOOK_SECRET=your-webhook-secret
DATABASE_URL=postgresql://user:password@localhost:5432/myapp
SOLANA_NETWORK=devnet
```

## Project Structure

```
myapp/
├── main.go
├── go.mod
├── easyauth/
│   ├── session.go
│   ├── wallet.go
│   ├── funding.go
│   └── webhook.go
└── db/
    └── db.go
```

## Module Initialisation

```bash
go mod init myapp
go get github.com/lib/pq
go get github.com/joho/godotenv
```

## Database Layer

```go
// db/db.go
package db

import (
	"database/sql"
	"os"

	_ "github.com/lib/pq"
)

var DB *sql.DB

func Init() error {
	var err error
	DB, err = sql.Open("postgres", os.Getenv("DATABASE_URL"))
	return err
}

type Wallet struct {
	ID              string
	UserID          string
	Address         string
	Provider        string
	ProviderWalletID string
	ProviderOwnerID string
	IdempotencyKey  string
	Chain           string
	Network         string
	Status          string
}

func GetWalletByUserID(userID string) (*Wallet, error) {
	row := DB.QueryRow(
		`SELECT id, user_id, address, provider, provider_wallet_id,
		        provider_owner_id, idempotency_key, chain, network, status
		 FROM easyauth_wallets WHERE user_id = $1`,
		userID,
	)
	w := &Wallet{}
	err := row.Scan(
		&w.ID, &w.UserID, &w.Address, &w.Provider,
		&w.ProviderWalletID, &w.ProviderOwnerID,
		&w.IdempotencyKey, &w.Chain, &w.Network, &w.Status,
	)
	if err == sql.ErrNoRows {
		return nil, nil
	}
	return w, err
}

func SaveWallet(w *Wallet) error {
	_, err := DB.Exec(`
		INSERT INTO easyauth_wallets
		  (id, user_id, address, provider, provider_wallet_id,
		   provider_owner_id, idempotency_key, chain, network, status)
		VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
		ON CONFLICT (user_id) DO UPDATE SET
		  address = EXCLUDED.address,
		  status = EXCLUDED.status,
		  updated_at = NOW()`,
		w.ID, w.UserID, w.Address, w.Provider, w.ProviderWalletID,
		w.ProviderOwnerID, w.IdempotencyKey, w.Chain, w.Network, w.Status,
	)
	return err
}

type FundingTx struct {
	ID            string
	UserID        string
	WalletID      string
	ProviderOrderID string
	FiatAmount    float64
	FiatCurrency  string
	Status        string
}

func CreateFundingTx(tx *FundingTx) error {
	_, err := DB.Exec(`
		INSERT INTO easyauth_funding_transactions
		  (id, user_id, wallet_id, provider_order_id,
		   fiat_amount, fiat_currency, status)
		VALUES ($1,$2,$3,$4,$5,$6,$7)`,
		tx.ID, tx.UserID, tx.WalletID, tx.ProviderOrderID,
		tx.FiatAmount, tx.FiatCurrency, tx.Status,
	)
	return err
}

func UpdateFundingTx(orderID, paymentStatus, deliveryStatus, status string) error {
	_, err := DB.Exec(`
		UPDATE easyauth_funding_transactions
		SET payment_status = $1, delivery_status = $2, status = $3, updated_at = NOW()
		WHERE provider_order_id = $4`,
		paymentStatus, deliveryStatus, status, orderID,
	)
	return err
}
```

## Session Helper

```go
// easyauth/session.go
package easyauth

import (
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"
)

type User struct {
	ID    string `json:"id"`
	Name  string `json:"name"`
	Email string `json:"email"`
	Image string `json:"image"`
}

// GetSession validates the session cookie with Better Auth and returns the user.
func GetSession(cookieHeader string) (*User, error) {
	if cookieHeader == "" {
		return nil, nil
	}

	req, err := http.NewRequest("GET",
		os.Getenv("BETTER_AUTH_URL")+"/api/auth/get-session", nil)
	if err != nil {
		return nil, err
	}
	req.Header.Set("Cookie", cookieHeader)

	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, nil
	}

	body, _ := io.ReadAll(resp.Body)
	var data struct {
		User *User `json:"user"`
	}
	if err := json.Unmarshal(body, &data); err != nil {
		return nil, fmt.Errorf("parse session: %w", err)
	}
	return data.User, nil
}
```

## Wallet Helper

```go
// easyauth/wallet.go
package easyauth

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"

	"myapp/db"
)

const easyauthAPIURL = "https://api.easyauth.dev"

// GetOrCreateWallet returns the existing wallet or creates one via EasyAuth.
func GetOrCreateWallet(userID string, existing *db.Wallet) (*db.Wallet, error) {
	if existing != nil {
		return existing, nil
	}

	idempotencyKey := "wallet_" + userID
	network := os.Getenv("SOLANA_NETWORK")
	if network == "" {
		network = "devnet"
	}

	payload, _ := json.Marshal(map[string]string{
		"owner":          "userId:" + userID,
		"chain":          "solana",
		"network":        network,
		"idempotencyKey": idempotencyKey,
	})

	req, err := http.NewRequest("POST", easyauthAPIURL+"/wallets", bytes.NewReader(payload))
	if err != nil {
		return nil, err
	}
	req.Header.Set("x-api-key", os.Getenv("EASYAUTH_API_KEY"))
	req.Header.Set("content-type", "application/json")

	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		return nil, fmt.Errorf("create wallet: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode >= 400 {
		body, _ := io.ReadAll(resp.Body)
		return nil, fmt.Errorf("create wallet %d: %s", resp.StatusCode, body)
	}

	var data struct {
		ID      string `json:"id"`
		Address string `json:"address"`
	}
	json.NewDecoder(resp.Body).Decode(&data)

	return &db.Wallet{
		ID:              "wallet_" + generateID(),
		UserID:          userID,
		Address:         data.Address,
		Provider:        "crossmint",
		ProviderWalletID: data.ID,
		ProviderOwnerID: "userId:" + userID,
		IdempotencyKey:  idempotencyKey,
		Chain:           "solana",
		Network:         network,
		Status:          "active",
	}, nil
}
```

## Webhook Helper

```go
// easyauth/webhook.go
package easyauth

import (
	"crypto/hmac"
	"crypto/sha256"
	"encoding/base64"
	"fmt"
	"os"
	"strings"
)

// VerifyWebhookSignature verifies the Svix webhook signature.
func VerifyWebhookSignature(svixID, svixTimestamp, svixSignature string, rawBody []byte) bool {
	secret := os.Getenv("EASYAUTH_WEBHOOK_SECRET")
	if secret == "" {
		return false
	}

	signedContent := fmt.Sprintf("%s.%s.%s", svixID, svixTimestamp, string(rawBody))
	mac := hmac.New(sha256.New, []byte(secret))
	mac.Write([]byte(signedContent))
	expected := base64.StdEncoding.EncodeToString(mac.Sum(nil))

	for _, sig := range strings.Split(svixSignature, " ") {
		if strings.HasPrefix(sig, "v1,") && sig[3:] == expected {
			return true
		}
	}
	return false
}

// MapFundingStatus maps Crossmint event data to EasyAuth status fields.
func MapFundingStatus(paymentStatus, deliveryStatus string) string {
	switch {
	case paymentStatus == "paid" && deliveryStatus == "completed":
		return "funded"
	case paymentStatus == "failed" || deliveryStatus == "failed":
		return "failed"
	case paymentStatus == "cancelled":
		return "cancelled"
	case paymentStatus == "paid":
		return "paid"
	default:
		return "pending"
	}
}
```

## Standard Library Server

```go
// main.go
package main

import (
	"encoding/json"
	"io"
	"log"
	"net/http"
	"os"
	"strings"

	"github.com/joho/godotenv"
	"myapp/db"
	"myapp/easyauth"
)

func writeJSON(w http.ResponseWriter, status int, v any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	json.NewEncoder(w).Encode(v)
}

func sessionHandler(w http.ResponseWriter, r *http.Request) {
	user, err := easyauth.GetSession(r.Header.Get("Cookie"))
	if err != nil || user == nil {
		writeJSON(w, 401, map[string]string{"error": "Unauthorized"})
		return
	}
	writeJSON(w, 200, map[string]any{"user": user})
}

func walletHandler(w http.ResponseWriter, r *http.Request) {
	user, err := easyauth.GetSession(r.Header.Get("Cookie"))
	if err != nil || user == nil {
		writeJSON(w, 401, map[string]string{"error": "Unauthorized"})
		return
	}

	existing, err := db.GetWalletByUserID(user.ID)
	if err != nil {
		writeJSON(w, 500, map[string]string{"error": "Database error"})
		return
	}

	wallet, err := easyauth.GetOrCreateWallet(user.ID, existing)
	if err != nil {
		writeJSON(w, 500, map[string]string{"error": err.Error()})
		return
	}

	if existing == nil {
		if err := db.SaveWallet(wallet); err != nil {
			writeJSON(w, 500, map[string]string{"error": "Failed to save wallet"})
			return
		}
	}

	writeJSON(w, 200, map[string]any{"wallet": wallet})
}

func webhookHandler(w http.ResponseWriter, r *http.Request) {
	rawBody, err := io.ReadAll(r.Body)
	if err != nil {
		writeJSON(w, 400, map[string]string{"error": "Bad request"})
		return
	}

	if !easyauth.VerifyWebhookSignature(
		r.Header.Get("svix-id"),
		r.Header.Get("svix-timestamp"),
		r.Header.Get("svix-signature"),
		rawBody,
	) {
		writeJSON(w, 401, map[string]string{"error": "Invalid signature"})
		return
	}

	var payload struct {
		Type string `json:"type"`
		Data struct {
			OrderID        string `json:"orderId"`
			PaymentStatus  string `json:"paymentStatus"`
			DeliveryStatus string `json:"deliveryStatus"`
		} `json:"data"`
	}
	if err := json.Unmarshal(rawBody, &payload); err != nil {
		writeJSON(w, 400, map[string]string{"error": "Invalid JSON"})
		return
	}

	if payload.Data.OrderID != "" {
		status := easyauth.MapFundingStatus(
			payload.Data.PaymentStatus,
			payload.Data.DeliveryStatus,
		)
		db.UpdateFundingTx(
			payload.Data.OrderID,
			payload.Data.PaymentStatus,
			payload.Data.DeliveryStatus,
			status,
		)
	}

	writeJSON(w, 200, map[string]bool{"received": true})
}

func main() {
	godotenv.Load()

	if err := db.Init(); err != nil {
		log.Fatal("db init:", err)
	}

	mux := http.NewServeMux()
	mux.HandleFunc("GET /api/easyauth/session", sessionHandler)
	mux.HandleFunc("GET /api/easyauth/wallet", walletHandler)
	mux.HandleFunc("POST /api/easyauth/wallet", walletHandler)
	mux.HandleFunc("POST /api/easyauth/webhooks/crossmint", webhookHandler)

	port := os.Getenv("PORT")
	if port == "" {
		port = "3000"
	}
	log.Printf("listening on :%s", port)
	log.Fatal(http.ListenAndServe(":"+port, mux))
}
```

Run the server:

```bash
go run ./...
```

## Gin Setup

If you prefer Gin:

```bash
go get github.com/gin-gonic/gin
```

```go
// main.go (Gin version)
package main

import (
	"io"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
	"myapp/db"
	"myapp/easyauth"
)

func main() {
	godotenv.Load()
	db.Init()

	r := gin.Default()
	api := r.Group("/api/easyauth")

	api.GET("/session", func(c *gin.Context) {
		user, _ := easyauth.GetSession(c.GetHeader("Cookie"))
		if user == nil {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
			return
		}
		c.JSON(http.StatusOK, gin.H{"user": user})
	})

	api.GET("/wallet", func(c *gin.Context) {
		user, _ := easyauth.GetSession(c.GetHeader("Cookie"))
		if user == nil {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
			return
		}
		existing, _ := db.GetWalletByUserID(user.ID)
		wallet, err := easyauth.GetOrCreateWallet(user.ID, existing)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		if existing == nil {
			db.SaveWallet(wallet)
		}
		c.JSON(http.StatusOK, gin.H{"wallet": wallet})
	})

	api.POST("/webhooks/crossmint", func(c *gin.Context) {
		rawBody, _ := io.ReadAll(c.Request.Body)
		if !easyauth.VerifyWebhookSignature(
			c.GetHeader("svix-id"),
			c.GetHeader("svix-timestamp"),
			c.GetHeader("svix-signature"),
			rawBody,
		) {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid signature"})
			return
		}
		// ... parse and process payload same as stdlib example
		c.JSON(http.StatusOK, gin.H{"received": true})
	})

	r.Run(":3000")
}
```

## Next Steps

- [Frontend Integration](/frontend/) — Connect your frontend
- [API Reference](/api/backend) — Full route and type documentation
