# EasyAuth Demo Library

This directory contains reusable components and utilities for the EasyAuth demo application.

## Components

### Toast Notifications

Custom toast notification system for displaying user feedback without browser alerts.

#### Usage

```javascript
import { success, error, info } from '$lib/toast.js';
import ToastContainer from '$lib/components/ToastContainer.svelte';

// In your component
success('Operation completed successfully!');
error('Something went wrong');
info('Here is some information');
```

#### Features

- **Non-blocking**: Toasts appear in the top-right corner and auto-dismiss
- **Multiple types**: success (green), error (red), info (blue)
- **Customizable duration**: Default 3 seconds, configurable per toast
- **Smooth animations**: Slide-in from right with fade effect
- **Dismissible**: Users can manually close toasts

#### API

**Toast Functions:**
- `success(message, duration?)` - Show success toast (green)
- `error(message, duration?)` - Show error toast (red)
- `info(message, duration?)` - Show info toast (blue)
- `showToast(message, type, duration?)` - Generic toast function

**Component:**
- `<ToastContainer />` - Add once to your layout or page to display toasts

#### Example

```svelte
<script>
	import { success, error } from '$lib/toast.js';
	import ToastContainer from '$lib/components/ToastContainer.svelte';

	function handleSave() {
		try {
			// ... save logic
			success('Saved successfully!');
		} catch (err) {
			error('Failed to save');
		}
	}
</script>

<ToastContainer />

<button onclick={handleSave}>Save</button>
```

## Utilities

### Card Input Formatting

Professional card input formatting utilities for payment forms.

#### Usage

```javascript
import { formatCardNumber, formatExpiryDate, formatCVC } from '$lib/card-utils.js';

// Format card number with spaces every 4 digits
const formatted = formatCardNumber('1234567890123456');
// Result: "1234 5678 9012 3456"

// Format expiry date with auto-slash
const expiry = formatExpiryDate('1225');
// Result: "12/25"

// Format CVC (3-4 digits only)
const cvc = formatCVC('123');
// Result: "123"
```

#### Features

- **Auto-spacing**: Card numbers automatically formatted with spaces
- **Auto-slash**: Expiry dates get slash after 2 digits
- **Digit-only**: Removes non-numeric characters automatically
- **Length limits**: Enforces proper lengths (16 for card, 4 for expiry, 3-4 for CVC)
- **Validation**: Includes validation functions for all fields

#### API

**Formatting Functions:**
- `formatCardNumber(value)` - Format 16-digit card number with spaces
- `formatExpiryDate(value)` - Format MM/YY expiry date with auto-slash
- `formatCVC(value)` - Format 3-4 digit CVC code

**Validation Functions:**
- `validateCardNumber(value)` - Check if card number is 16 digits
- `validateExpiryDate(value)` - Check if expiry is valid and not expired
- `validateCVC(value)` - Check if CVC is 3-4 digits

#### Example

```svelte
<script>
	import { formatCardNumber, validateCardNumber } from '$lib/card-utils.js';

	let cardNumber = $state('');

	function handleCardInput(e) {
		cardNumber = formatCardNumber(e.target.value);
	}

	function handleSubmit() {
		if (!validateCardNumber(cardNumber)) {
			error('Invalid card number');
			return;
		}
		// Process payment
	}
</script>

<input
	type="text"
	value={cardNumber}
	oninput={handleCardInput}
	maxlength="19"
	placeholder="1234 5678 9012 3456"
	class="font-mono"
/>
```

## Demo Data

### Demo Session Store

Frontend-only demo data for the happy path demonstration.

#### Usage

```javascript
import {
	demoSession,
	demoWallet,
	demoBalance,
	demoTransactions,
	initializeDemoSession,
	clearDemoSession
} from '$lib/demo-data.js';

// Initialize demo session
initializeDemoSession();

// Subscribe to reactive stores
demoBalance.subscribe((balance) => {
	console.log('Balance:', balance.sol, 'SOL');
});

// Clear session on logout
clearDemoSession();
```

#### Features

- **Reactive stores**: All data uses Svelte stores for reactivity
- **Pre-seeded data**: Includes demo wallet, balance, and transactions
- **Session management**: Simple init/clear functions
- **Transaction history**: Add new transactions dynamically

#### Stores

- `demoSession` - User session state
- `demoWallet` - Wallet information (address, chain, etc.)
- `demoBalance` - Current balance (SOL, lamports, tokens)
- `demoTransactions` - Transaction history array

#### Functions

- `initializeDemoSession()` - Create demo session
- `clearDemoSession()` - Clear session (logout)
- `addDemoTransaction(tx)` - Add transaction to history
- `updateDemoBalance(newBalance)` - Update balance reactively

## File Structure

```
src/lib/
├── components/
│   ├── Toast.svelte           # Individual toast component
│   └── ToastContainer.svelte  # Toast container (add to layout)
├── card-utils.js              # Card input formatting utilities
├── demo-data.js               # Demo session and data stores
├── toast.js                   # Toast notification store and API
└── README.md                  # This file
```

## Best Practices

### Toast Notifications

1. **Use appropriate types**: success for confirmations, error for failures, info for neutral messages
2. **Keep messages short**: Toasts auto-dismiss, so keep text concise
3. **Add ToastContainer once**: Only add `<ToastContainer />` once per page or in your layout
4. **Don't overuse**: Too many toasts can be annoying

### Card Inputs

1. **Use monospace font**: Add `font-mono` class for better readability
2. **Set maxlength**: Prevent over-typing with proper maxlength attributes
3. **Use oninput**: Use `oninput` instead of `bind:value` for formatting
4. **Validate on submit**: Always validate before processing payment
5. **Uppercase names**: Use `uppercase` class for cardholder name

### Demo Data

1. **Frontend only**: This is demo data, not for production
2. **Resets on refresh**: Data is in memory only
3. **Subscribe properly**: Always unsubscribe in onMount cleanup
4. **Update reactively**: Use store update functions, not direct mutation
