const container = document.createElement("div");
container.id = "DebugTest1";
container.className = "debug";

const position = document.createElement("span");
position.id = "DebugPosition";
container.appendChild(position);

const rotation = document.createElement("span");
rotation.id = "DebugRotation";
container.appendChild(rotation);

document.body.appendChild(container);