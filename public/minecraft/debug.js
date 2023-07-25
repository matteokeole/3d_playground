export function debug(renderer) {
	const container = document.createElement("div");
	const visualizeStepsLabel = document.createElement("label");
	const visualizeSteps = document.createElement("input");
	const deltaTime = document.createElement("span");

	container.id = "DebugTest2";
	container.className = "debug";
	visualizeStepsLabel.id = "DebugVisualizeStepsLabel";
	visualizeSteps.id = "DebugVisualizeSteps";
	visualizeSteps.type = "checkbox";
	visualizeSteps.onchange = function() {
		renderer.debug = this.checked;
	};
	deltaTime.id = "DebugDelta";

	visualizeStepsLabel.appendChild(visualizeSteps);
	container.appendChild(visualizeStepsLabel);
	container.appendChild(deltaTime);
	document.body.appendChild(container);
}