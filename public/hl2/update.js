import {PI, Vector3} from "../../src/math/index.js";
import {CAMERA_LERP_FACTOR, VELOCITY} from "./index.js";
import {keys} from "./input.js";

export function update(delta, renderer) {
	const {camera, player, wall} = renderer;

	// Camera-space direction (not normalized)
	const direction = new Vector3(
		keys.KeyA + keys.KeyD,
		keys.ControlLeft + keys.Space,
		keys.KeyW + keys.KeyS,
	);

	const hasMoved = !(direction[0] === 0 && direction[1] === 0 && direction[2] === 0);

	if (hasMoved) {
		const relativeVelocity = camera.getRelativeVelocity(
			direction.normalize().multiplyScalar(VELOCITY),
		);

		camera.target.add(relativeVelocity);

		if (wall == null || collide(relativeVelocity, player, wall)) {
			camera.position = camera.position
				.clone()
				.lerp(camera.target, camera.lerpFactor);
		}
	}

	camera.update();

	DebugPosition.textContent = [...camera.position].map(e => e.toFixed(2)).join(' ');
	DebugRotation.textContent = [...camera.rotation].map(e => (e / PI).toFixed(2)).join(' ');
}

function collide(velocity, player, wall) {
	player.getHitbox().velocity = velocity;

	const wallNormal = new Vector3();
	const time = player.getHitbox().sweptAABB(wall.getHitbox(), wallNormal);
	const position = player.position;

	if (time === 0) return false;

	velocity = velocity.clone().multiplyScalar(time);
	position.add(velocity);
	position[1] = 8;

	player.position = position;
	player.getHitbox().position = position;

	return true;
}