// Card number formatting utilities

export function formatCardNumber(value) {
	// Remove all non-digits
	const digits = value.replace(/\D/g, '');
	
	// Limit to 16 digits
	const limited = digits.slice(0, 16);
	
	// Add space every 4 digits
	const formatted = limited.match(/.{1,4}/g)?.join(' ') || limited;
	
	return formatted;
}

export function formatExpiryDate(value) {
	// Remove all non-digits
	const digits = value.replace(/\D/g, '');
	
	// Limit to 4 digits (MMYY)
	const limited = digits.slice(0, 4);
	
	// Add slash after 2 digits
	if (limited.length >= 2) {
		return limited.slice(0, 2) + '/' + limited.slice(2);
	}
	
	return limited;
}

export function formatCVC(value) {
	// Remove all non-digits
	const digits = value.replace(/\D/g, '');
	
	// Limit to 4 digits
	return digits.slice(0, 4);
}

export function validateCardNumber(value) {
	const digits = value.replace(/\D/g, '');
	return digits.length === 16;
}

export function validateExpiryDate(value) {
	const digits = value.replace(/\D/g, '');
	
	if (digits.length !== 4) return false;
	
	const month = parseInt(digits.slice(0, 2), 10);
	const year = parseInt(digits.slice(2, 4), 10);
	
	// Check valid month
	if (month < 1 || month > 12) return false;
	
	// Check if not expired (basic check)
	const now = new Date();
	const currentYear = now.getFullYear() % 100;
	const currentMonth = now.getMonth() + 1;
	
	if (year < currentYear) return false;
	if (year === currentYear && month < currentMonth) return false;
	
	return true;
}

export function validateCVC(value) {
	const digits = value.replace(/\D/g, '');
	return digits.length === 3 || digits.length === 4;
}
