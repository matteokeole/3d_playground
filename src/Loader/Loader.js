/**
 * @abstract
 */
export class Loader {
	/**
	 * @param {String} url
	 * @throws {Error} The response was not successful
	 */
	async load(url) {
		const response = await fetch(url);

		if (!response.ok) {
			throw new Error(`Could not fetch URL ${url}: Request failed with status ${response.status}.`);
		}

		return response;
	}
}