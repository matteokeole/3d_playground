export function debug(renderer) {
	const container = document.createElement("div");
	const position = document.createElement("span");
	const rotation = document.createElement("span");

	container.id = "DebugTest1";
	container.className = "debug";
	position.id = "DebugPosition";
	rotation.id = "DebugRotation";

	container.appendChild(position);
	container.appendChild(rotation);
	document.body.appendChild(container);
}