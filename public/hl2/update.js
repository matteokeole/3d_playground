import {PI, Vector3} from "src/math";
import {VELOCITY} from "./index.js";
import {keys} from "./input.js";

const direction = new Vector3();

export function update(delta, renderer) {
	const {camera, player, wall} = renderer;

	direction[0] = keys.KeyA + keys.KeyD;
	direction[1] = keys.Space + keys.ControlLeft;
	direction[2] = keys.KeyW + keys.KeyS;
	direction.normalize().multiplyScalar(VELOCITY);

	const hasMoved = direction[0] !== 0 || direction[1] !== 0 || direction[2] !== 0;

	// No vertical movement
	camera.position[0] = player.position[0];
	camera.position[2] = player.position[2];
	camera.target = direction;

	if (hasMoved) {
		const relativeVelocity = camera.relativeVelocity;

		if (collide(relativeVelocity)) {
			camera.position = camera.target.clone().add(relativeVelocity);
			// camera.position = camera.target.clone().lerp(camera.position, CAMERA_LERP_FACTOR); 
		}
	}

	camera.update();

	// Reset direction
	direction.multiplyScalar(0);

	// debugPosition.textContent = [...camera.position].map(e => e.toFixed(2)).join(' ');
	// debugRotation.textContent = [...camera.rotation].map(e => (e / PI).toFixed(2)).join(' ');
}

function collide(velocity) {
	player.box.velocity = velocity;

	const wallNormal = new Vector3();
	const time = player.box.sweptAABB(wall.box, wallNormal);
	const position = player.position;

	if (time === 0) return false;

	velocity = velocity.clone().multiplyScalar(time);
	position.add(velocity);
	position[1] = 8;

	player.position = position;
	player.box.position = position;

	return true;
}