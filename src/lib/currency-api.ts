export interface ExchangeRates {
    [currency: string]: number;
}

const API_KEY = '5e3a6345c77e6a156bd9613d';
const BASE_URL = `https://v6.exchangerate-api.com/v6/${API_KEY}/latest`;

const RATE_CACHE_KEY = 'pf_exchange_rates';
const CACHE_DURATION_MS = 6 * 60 * 60 * 1000; // 6 hours

interface CachedRates {
    base: string;
    rates: ExchangeRates;
    timestamp: number;
}

export const currencyApi = {
    async getRates(baseCurrency: string = 'USD'): Promise<ExchangeRates | null> {
        try {
            // Check cache
            const cached = localStorage.getItem(`${RATE_CACHE_KEY}_${baseCurrency}`);
            if (cached) {
                const data: CachedRates = JSON.parse(cached);
                const isExpired = Date.now() - data.timestamp > CACHE_DURATION_MS;
                if (!isExpired) {
                    return data.rates;
                }
            }

            // Fetch new rates
            const response = await fetch(`${BASE_URL}/${baseCurrency}`);
            if (!response.ok) {
                console.error('Failed to fetch rates', response.statusText);
                return null;
            }

            const json = await response.json();
            if (json.result !== 'success') {
                console.error('API Error:', json['error-type']);
                return null;
            }

            const rates = json.conversion_rates;

            // Cache result
            const cacheData: CachedRates = {
                base: baseCurrency,
                rates,
                timestamp: Date.now(),
            };
            localStorage.setItem(`${RATE_CACHE_KEY}_${baseCurrency}`, JSON.stringify(cacheData));

            return rates;
        } catch (error) {
            console.error('Currency API Error:', error);
            return null;
        }
    },

    convert(amount: number, fromCurrency: string, toCurrency: string, rates: ExchangeRates): number {
        if (fromCurrency === toCurrency) return amount;

        // If we have direct rates for the 'from' currency (which means 'rates' is relative to 'from')
        if (rates[toCurrency]) {
            return amount * rates[toCurrency];
        }

        // If 'rates' are based on USD (common backup), but we need EUR -> GBP
        // We might need to cross-calculate if we don't have the specific base rates loaded.
        // Simplified Logic: We expect 'rates' to be based on the 'toCurrency' or we need to normalize.
        // For this app, we will try to always fetch rates for the User's preferred currency (the 'to' currency).
        // So 'rates' will be 1 Unit of UserCurrency = X Units of OtherCurrency? NO.
        // The API returns: Base = USD. Rates = { EUR: 0.85, ETB: 53.0 }.
        // This means 1 USD = 0.85 EUR.
        // If I have 100 USD, I have 85 EUR.

        // If I have 100 EUR and want USD? 100 / 0.85 = 117.64 USD.

        // Let's assume 'rates' are passed relative to 'USD' (or whatever was fetched).
        // Ideally, we fetch rates where Base = User's Preferred Currency.
        // Then 1 Preferred = X Foreign.
        // Value in Preferred = Value in Foreign / X

        // Wait.
        // If rates are Base=USD.
        // 1 USD = 50 ETB.
        // 1 USD = 0.9 EUR.

        // I have user with Preferred = ETB.
        // I want to show a wallet of 100 EUR in ETB.
        // 100 EUR -> USD -> ETB.
        // 100 EUR / 0.9 = 111.11 USD.
        // 111.11 USD * 50 = 5555.55 ETB.

        // Helper function should probably just take two rates relative to a common anchor if logic is complex,
        // but if we fetch `getRates('ETB')` then:
        // 1 ETB = 0.02 USD.
        // 1 ETB = 0.018 EUR.
        // Wallet has 100 EUR.
        // 100 EUR / 0.018 = 5555 ETB.

        // So logic: `amount / rates[fromCurrency]` if base is `toCurrency`.
        return amount / (rates[fromCurrency] || 1);
    }
};
