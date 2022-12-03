/**
 * @param {function} callback
 * @param {number} delay
 * @callback callback
 */
export function debounce(callback, delay) {
	let timeout = 0;

    return function(...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => callback.apply(this, args), delay);
    }
}