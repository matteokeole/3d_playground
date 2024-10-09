import {Application} from "../src/Application/index.js";
import {ExampleLayer} from "./Layer/index.js";

export class SandboxApplication extends Application {
	constructor() {
		super();

		this.pushLayer(new ExampleLayer());
	}
}