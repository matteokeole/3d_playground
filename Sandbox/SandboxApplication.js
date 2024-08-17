import {Application} from "../src/Application/index.js";
import {ExampleLayer} from "./ExampleLayer.js";

export class SandboxApplication extends Application {
	constructor() {
		super();

		this.pushLayer(new ExampleLayer());
	}
}