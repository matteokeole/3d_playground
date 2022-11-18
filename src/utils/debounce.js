/**
 * Debounce function.
 * 
 * @param {function} callback
 * @param {number} delay
 * @callback callback
 */
export function debounce(callback, delay) {
	clearTimeout(timeout);
	timeout = setTimeout(callback, delay);
}

let timeout;