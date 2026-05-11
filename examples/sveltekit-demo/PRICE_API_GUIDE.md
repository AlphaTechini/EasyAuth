# Real-Time Cryptocurrency Price API

This guide explains how to fetch real-time cryptocurrency prices using the CoinGecko API.

## Why CoinGecko?

- **Free tier available**: 10-30 calls/minute without API key
- **No authentication required**: Works immediately
- **Comprehensive coverage**: Supports 10,000+ cryptocurrencies
- **Reliable**: Industry-standard price aggregation
- **Real-time data**: Prices updated every few seconds

## API Implementation

Location: `src/lib/price-api.js`

### Features

✅ **Built-in caching** - Reduces API calls, avoids rate limits
✅ **Multiple currencies** - USD, EUR, GBP, and 50+ more
✅ **Batch fetching** - Get multiple coin prices in one call
✅ **Helper functions** - Pre-built for common operations
✅ **Error handling** - Graceful fallbacks on API failures

## Usage Examples

### Basic Usage

```javascript
import { fetchSolanaPrice, convertUsdToSol } from '$lib/price-api.js';

// Get current Solana price in USD
const solPrice = await fetchSolanaPrice();
console.log(`1 SOL = $${solPrice} USD`);

// Convert $100 USD to SOL
const solAmount = await convertUsdToSol(100);
console.log(`$100 = ${solAmount} SOL`);
```

### Fetch Any Cryptocurrency

```javascript
import { fetchCryptoPrice, COIN_IDS } from '$lib/price-api.js';

// Fetch Bitcoin price
const btcPrice = await fetchCryptoPrice(COIN_IDS.BITCOIN, 'usd');

// Fetch Ethereum price in EUR
const ethPrice = await fetchCryptoPrice(COIN_IDS.ETHEREUM, 'eur');

// Fetch USDC price
const usdcPrice = await fetchCryptoPrice(COIN_IDS.USDC, 'usd');
```

### Batch Fetch Multiple Prices

```javascript
import { fetchMultipleCryptoPrices, COIN_IDS } from '$lib/price-api.js';

const prices = await fetchMultipleCryptoPrices([
	COIN_IDS.SOLANA,
	COIN_IDS.BITCOIN,
	COIN_IDS.ETHEREUM
]);

console.log('SOL:', prices.solana);
console.log('BTC:', prices.bitcoin);
console.log('ETH:', prices.ethereum);
```

### Use in Svelte Component

```svelte
<script>
	import { onMount } from 'svelte';
	import { fetchSolanaPrice, convertUsdToSol } from '$lib/price-api.js';

	let solPrice = $state(null);
	let loading = $state(true);

	onMount(async () => {
		solPrice = await fetchSolanaPrice();
		loading = false;
	});

	async function calculateSol(usdAmount) {
		return await convertUsdToSol(usdAmount);
	}
</script>

{#if loading}
	<p>Loading price...</p>
{:else if solPrice}
	<p>1 SOL = ${solPrice.toFixed(2)} USD</p>
{:else}
	<p>Failed to load price</p>
{/if}
```

## API Reference

### Core Functions

#### `fetchCryptoPrice(coinId, vsCurrency)`
Fetch current price for a single cryptocurrency.

**Parameters:**
- `coinId` (string) - CoinGecko coin ID (e.g., 'solana', 'bitcoin')
- `vsCurrency` (string) - Target currency (default: 'usd')

**Returns:** `Promise<number|null>` - Price or null if failed

**Example:**
```javascript
const price = await fetchCryptoPrice('solana', 'usd');
```

#### `fetchMultipleCryptoPrices(coinIds, vsCurrency)`
Fetch prices for multiple cryptocurrencies in one call.

**Parameters:**
- `coinIds` (string[]) - Array of CoinGecko coin IDs
- `vsCurrency` (string) - Target currency (default: 'usd')

**Returns:** `Promise<Object>` - Object with coinId keys and price values

**Example:**
```javascript
const prices = await fetchMultipleCryptoPrices(['solana', 'bitcoin']);
// { solana: 150.25, bitcoin: 45000.50 }
```

### Helper Functions

#### `fetchSolanaPrice()`
Shortcut to fetch Solana price in USD.

**Returns:** `Promise<number|null>`

#### `fetchBitcoinPrice()`
Shortcut to fetch Bitcoin price in USD.

**Returns:** `Promise<number|null>`

#### `fetchEthereumPrice()`
Shortcut to fetch Ethereum price in USD.

**Returns:** `Promise<number|null>`

### Conversion Functions

#### `convertUsdToSol(usdAmount)`
Convert USD amount to SOL based on current price.

**Parameters:**
- `usdAmount` (number) - Amount in USD

**Returns:** `Promise<number|null>` - Amount in SOL

**Example:**
```javascript
const sol = await convertUsdToSol(100);
// If SOL = $150, returns 0.6667
```

#### `convertSolToUsd(solAmount)`
Convert SOL amount to USD based on current price.

**Parameters:**
- `solAmount` (number) - Amount in SOL

**Returns:** `Promise<number|null>` - Amount in USD

**Example:**
```javascript
const usd = await convertSolToUsd(5);
// If SOL = $150, returns 750
```

### Cache Functions

#### `getCachedPrice(coinId, vsCurrency)`
Get cached price without making API call.

**Returns:** `number|null` - Cached price or null

#### `clearPriceCache()`
Clear all cached prices.

## Supported Coin IDs

Common cryptocurrencies (use `COIN_IDS` constant):

```javascript
import { COIN_IDS } from '$lib/price-api.js';

COIN_IDS.SOLANA      // 'solana'
COIN_IDS.BITCOIN     // 'bitcoin'
COIN_IDS.ETHEREUM    // 'ethereum'
COIN_IDS.USDC        // 'usd-coin'
COIN_IDS.USDT        // 'tether'
COIN_IDS.BNB         // 'binancecoin'
COIN_IDS.CARDANO     // 'cardano'
COIN_IDS.POLYGON     // 'matic-network'
COIN_IDS.AVALANCHE   // 'avalanche-2'
```

Find more coin IDs: https://www.coingecko.com/en/api/documentation

## Supported Currencies

Common fiat currencies:
- `usd` - US Dollar
- `eur` - Euro
- `gbp` - British Pound
- `jpy` - Japanese Yen
- `cad` - Canadian Dollar
- `aud` - Australian Dollar
- `chf` - Swiss Franc

Full list: https://api.coingecko.com/api/v3/simple/supported_vs_currencies

## Caching Strategy

The API includes built-in caching to:
- **Reduce API calls** - Avoid hitting rate limits
- **Improve performance** - Instant responses for cached data
- **Save bandwidth** - Fewer network requests

**Cache duration:** 1 minute (60 seconds)

Prices are cached per coin-currency pair. After 1 minute, the next request will fetch fresh data.

## Rate Limits

**CoinGecko Free Tier:**
- 10-30 calls per minute
- No API key required
- Sufficient for most applications

**Tips to stay within limits:**
- Use batch fetching for multiple coins
- Leverage the built-in cache
- Don't fetch prices on every render
- Fetch once on mount, then periodically

**Example - Periodic Updates:**
```javascript
onMount(() => {
	// Fetch immediately
	updatePrice();
	
	// Update every 60 seconds
	const interval = setInterval(updatePrice, 60000);
	
	return () => clearInterval(interval);
});

async function updatePrice() {
	solPrice = await fetchSolanaPrice();
}
```

## Error Handling

All functions return `null` on error and log to console:

```javascript
const price = await fetchSolanaPrice();

if (price === null) {
	// Handle error - show cached price, default value, or error message
	console.error('Failed to fetch price');
} else {
	// Use the price
	console.log(`SOL: $${price}`);
}
```

## Integration with Demo

### Update Dashboard to Use Real Prices

Replace the hardcoded `150` with real-time prices:

```javascript
import { fetchSolanaPrice, convertUsdToSol } from '$lib/price-api.js';

let solPrice = $state(150); // Default fallback

onMount(async () => {
	const price = await fetchSolanaPrice();
	if (price) {
		solPrice = price;
	}
});

// In funding modal
async function calculateSolAmount(usdAmount) {
	const sol = await convertUsdToSol(usdAmount);
	return sol || (usdAmount / solPrice); // Fallback to cached price
}
```

### Show Live Price Updates

```svelte
<div class="bg-gray-50 p-4 rounded-lg">
	<p class="text-sm text-gray-600 mb-2">You will receive approximately:</p>
	<p class="text-2xl font-bold text-gray-900">
		{(parseFloat(fundingAmount) / solPrice).toFixed(4)} SOL
	</p>
	<p class="text-xs text-gray-500 mt-1">
		Exchange rate: 1 SOL ≈ ${solPrice.toFixed(2)} USD
	</p>
</div>
```

## Production Considerations

### For Production Use:

1. **Get a Pro API Key** (optional but recommended)
   - Higher rate limits (500+ calls/minute)
   - Priority support
   - More stable service
   - Sign up: https://www.coingecko.com/en/api/pricing

2. **Add API Key to Requests**
```javascript
const url = `${COINGECKO_API_BASE}/simple/price?ids=${coinId}&vs_currencies=${vsCurrency}&x-cg-pro-api-key=YOUR_KEY`;
```

3. **Implement Retry Logic**
```javascript
async function fetchWithRetry(url, retries = 3) {
	for (let i = 0; i < retries; i++) {
		try {
			const response = await fetch(url);
			if (response.ok) return response;
		} catch (error) {
			if (i === retries - 1) throw error;
			await new Promise(r => setTimeout(r, 1000 * (i + 1)));
		}
	}
}
```

4. **Monitor Rate Limits**
```javascript
if (response.status === 429) {
	console.error('Rate limit exceeded');
	// Use cached price or show error
}
```

## Alternative APIs

If you need alternatives to CoinGecko:

### CoinMarketCap
- Requires API key (free tier available)
- Similar features to CoinGecko
- https://coinmarketcap.com/api/

### Binance API
- Free, no API key for public endpoints
- Real-time exchange prices
- https://binance-docs.github.io/apidocs/

### CryptoCompare
- Free tier with API key
- Good for historical data
- https://min-api.cryptocompare.com/

## Summary

✅ **Easy to use** - Simple functions, no setup required
✅ **Free** - No API key needed for basic usage
✅ **Cached** - Built-in caching to avoid rate limits
✅ **Reliable** - Industry-standard price data
✅ **Flexible** - Supports 10,000+ coins and 50+ currencies

**Next Steps:**
1. Import the price API functions
2. Replace hardcoded prices with real-time data
3. Add loading states for price fetches
4. Test with different amounts and currencies
