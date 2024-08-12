import {Loader} from "./Loader/index.js";

/**
 * @typedef {Object} Environment
 * @property {String} testClass
 */

/**
 * @todo EnvironmentLoader?
 */
export async function getEnvironment() {
	const loader = new Loader();
	const response = await loader.load(".env.local.json");

	/**
	 * @type {Environment}
	 */
	const json = await response.json();

	return json;
}