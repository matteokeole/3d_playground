import {Vector3} from "../../src/math/index.js";
import {CAMERA_LERP_FACTOR, VELOCITY} from "./index.js";
import {keys} from "./input.js";
import {Mesh} from "./Mesh.js";
import {Renderer} from "./Renderer.js";

/**
 * @param {Number} delta
 * @param {Renderer} renderer
 */
export function update(delta, renderer) {
	const {camera, player, wall} = renderer;

	// Camera-space direction (not normalized)
	const direction = new Vector3(
		keys.KeyA + keys.KeyD,
		keys.ControlLeft + keys.Space,
		keys.KeyW + keys.KeyS,
	);

	const hasMoved = direction.magnitude() !== 0;

	if (hasMoved) {
		const relativeVelocity = camera.getRelativeVelocity(
			direction.normalize().multiplyScalar(VELOCITY),
		);

		if (wall == null || !collide(relativeVelocity, player, wall)) {
			camera.target.add(relativeVelocity);
		}
	}

	camera.position.lerp(camera.target, CAMERA_LERP_FACTOR);
	camera.update();

	document.getElementById("DebugPosition").textContent = `${camera.position}`;
	document.getElementById("DebugRotation").textContent = `${camera.rotation}`;
}

/**
 * @param {Vector3} velocity
 * @param {Mesh} player
 * @param {Mesh} wall
 */
function collide(velocity, player, wall) {
	player.getHitbox().setVelocity(velocity);

	const time = player.getHitbox().sweptAABB(wall.getHitbox(), new Vector3());

	if (time === 0) return true;

	velocity = velocity.clone().multiplyScalar(time);

	player.getPosition().add(new Vector3(
		velocity[0],
		0,
		velocity[2],
	));

	// player.getHitbox().setPosition(player.getPosition());

	return false;
}