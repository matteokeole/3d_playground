import {Renderer} from "./Renderer.js";

/**
 * @param {Renderer} renderer
 */
export function enableDebugging(renderer) {
	const container = document.createElement("div");
	const visualizeStepsLabel = document.createElement("label");
	const visualizeSteps = document.createElement("input");
	const deltaTime = document.createElement("span");

	container.className = "debug";
	visualizeStepsLabel.id = "DebugVisualizeStepsLabel";
	visualizeSteps.id = "DebugVisualizeSteps";
	visualizeSteps.type = "checkbox";
	visualizeSteps.onchange = function() {
		renderer.debug = this.checked;
	};
	deltaTime.id = "DebugDelta";

	const position = document.createElement("span");
	position.id = "DebugPosition";
	container.appendChild(position);

	const rotation = document.createElement("span");
	rotation.id = "DebugRotation";
	container.appendChild(rotation);

	visualizeStepsLabel.appendChild(visualizeSteps);
	container.appendChild(visualizeStepsLabel);
	container.appendChild(deltaTime);
	document.body.appendChild(container);
}