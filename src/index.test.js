import {getEnvironment} from "./index.js";
import {Test} from "./Test/index.js";

const environment = await getEnvironment();
const response = await import(`../Test/${environment.testClass}.js`);
const testClass = response[environment.testClass];
const test = new testClass();

if (!(test instanceof Test)) {
	throw new Error(`Class ${environment.testClass} does not extend Test.`);
}

try {
	await test.execute();

	console.info(`${environment.testClass} completed with success.`);
} catch (error) {
	console.error(error);
	console.info(`${environment.testClass} completed with failure.`);
}