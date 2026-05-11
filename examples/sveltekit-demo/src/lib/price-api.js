// CoinGecko API for fetching real-time cryptocurrency prices
// Free tier: 10-30 calls/minute, no API key required
// Documentation: https://www.coingecko.com/en/api/documentation

const COINGECKO_API_BASE = 'https://api.coingecko.com/api/v3';

// Cache to avoid hitting rate limits
const priceCache = new Map();
const CACHE_DURATION = 60000; // 1 minute

/**
 * Fetch current price for a cryptocurrency
 * @param {string} coinId - CoinGecko coin ID (e.g., 'solana', 'bitcoin', 'ethereum')
 * @param {string} vsCurrency - Target currency (e.g., 'usd', 'eur', 'gbp')
 * @returns {Promise<number|null>} Price in target currency or null if failed
 */
export async function fetchCryptoPrice(coinId, vsCurrency = 'usd') {
	const cacheKey = `${coinId}-${vsCurrency}`;
	const cached = priceCache.get(cacheKey);

	// Return cached price if still valid
	if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
		return cached.price;
	}

	try {
		const url = `${COINGECKO_API_BASE}/simple/price?ids=${coinId}&vs_currencies=${vsCurrency}`;
		const response = await fetch(url);

		if (!response.ok) {
			console.error(`CoinGecko API error: ${response.status} ${response.statusText}`);
			return null;
		}

		const data = await response.json();
		const price = data[coinId]?.[vsCurrency];

		if (typeof price === 'number') {
			// Cache the result
			priceCache.set(cacheKey, {
				price,
				timestamp: Date.now()
			});
			return price;
		}

		return null;
	} catch (error) {
		console.error('Failed to fetch crypto price:', error);
		return null;
	}
}

/**
 * Fetch prices for multiple cryptocurrencies at once
 * @param {string[]} coinIds - Array of CoinGecko coin IDs
 * @param {string} vsCurrency - Target currency
 * @returns {Promise<Object>} Object with coinId as key and price as value
 */
export async function fetchMultipleCryptoPrices(coinIds, vsCurrency = 'usd') {
	try {
		const ids = coinIds.join(',');
		const url = `${COINGECKO_API_BASE}/simple/price?ids=${ids}&vs_currencies=${vsCurrency}`;
		const response = await fetch(url);

		if (!response.ok) {
			console.error(`CoinGecko API error: ${response.status} ${response.statusText}`);
			return {};
		}

		const data = await response.json();
		const prices = {};

		// Cache and format results
		for (const coinId of coinIds) {
			const price = data[coinId]?.[vsCurrency];
			if (typeof price === 'number') {
				prices[coinId] = price;
				priceCache.set(`${coinId}-${vsCurrency}`, {
					price,
					timestamp: Date.now()
				});
			}
		}

		return prices;
	} catch (error) {
		console.error('Failed to fetch multiple crypto prices:', error);
		return {};
	}
}

/**
 * Fetch Solana price in USD
 * @returns {Promise<number|null>}
 */
export async function fetchSolanaPrice() {
	return fetchCryptoPrice('solana', 'usd');
}

/**
 * Fetch Bitcoin price in USD
 * @returns {Promise<number|null>}
 */
export async function fetchBitcoinPrice() {
	return fetchCryptoPrice('bitcoin', 'usd');
}

/**
 * Fetch Ethereum price in USD
 * @returns {Promise<number|null>}
 */
export async function fetchEthereumPrice() {
	return fetchCryptoPrice('ethereum', 'usd');
}

/**
 * Convert USD amount to SOL based on current price
 * @param {number} usdAmount - Amount in USD
 * @returns {Promise<number|null>} Amount in SOL or null if price fetch failed
 */
export async function convertUsdToSol(usdAmount) {
	const solPrice = await fetchSolanaPrice();
	if (!solPrice) return null;
	return usdAmount / solPrice;
}

/**
 * Convert SOL amount to USD based on current price
 * @param {number} solAmount - Amount in SOL
 * @returns {Promise<number|null>} Amount in USD or null if price fetch failed
 */
export async function convertSolToUsd(solAmount) {
	const solPrice = await fetchSolanaPrice();
	if (!solPrice) return null;
	return solAmount * solPrice;
}

/**
 * Get cached price without making API call
 * @param {string} coinId - CoinGecko coin ID
 * @param {string} vsCurrency - Target currency
 * @returns {number|null} Cached price or null if not in cache
 */
export function getCachedPrice(coinId, vsCurrency = 'usd') {
	const cacheKey = `${coinId}-${vsCurrency}`;
	const cached = priceCache.get(cacheKey);

	if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
		return cached.price;
	}

	return null;
}

/**
 * Clear the price cache
 */
export function clearPriceCache() {
	priceCache.clear();
}

// Common CoinGecko coin IDs for reference
export const COIN_IDS = {
	SOLANA: 'solana',
	BITCOIN: 'bitcoin',
	ETHEREUM: 'ethereum',
	USDC: 'usd-coin',
	USDT: 'tether',
	BNB: 'binancecoin',
	CARDANO: 'cardano',
	POLYGON: 'matic-network',
	AVALANCHE: 'avalanche-2'
};
