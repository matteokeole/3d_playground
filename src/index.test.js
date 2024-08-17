import {getEnvironment} from "./index.js";
import {Test} from "./Test/index.js";

const environment = await getEnvironment();
const response = await import(`../Test/${environment.testClass}.js`);
const testClass = response[environment.testClass];
const test = new testClass();

if (!(test instanceof Test)) {
	throw new Error(`Test class ${environment.testClass} must extend Test in order to be executed.`);
}

try {
	await test.execute();
} catch (error) {
	console.error(`${environment.testClass} failed: ${error.stack}`);
}