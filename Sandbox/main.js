import {Application} from "../src/Application/index.js";
import {SandboxApplication} from "./SandboxApplication.js";

Application.create = function() {
	return new SandboxApplication();
};