import {Instance as _Instance} from "../../../src/index.js";
import {EPA, GJK} from "../../../src/Algorithm/index.js";
import {Camera} from "../../../src/Camera/index.js";
import {max, Vector3} from "../../../src/math/index.js";
import {Mesh} from "../../../src/Mesh/index.js";

export class Instance extends _Instance {
	static GRAVITY = 0.4;
	static ACCELERATE_AIR = 12;
	static ACCELERATE_GROUND = 5.6;
	static MAX_VELOCITY_AIR = 500;
	static MAX_VELOCITY_GROUND = 500;
	static FRICTION = 4.8;

	#canJump = true;

	/**
	 * @param {Number} deltaTime
	 */
	_update(deltaTime) {
		const scene = this._renderer.getScene();
		const camera = this._renderer.getCamera();

		if (!scene || !camera) {
			return;
		}

		/* if (keys.Space && this.#canJump) {
			this.#handleJump();

			this.#canJump = false;
		}

		if (!keys.Space) {
			// Reset jump ability
			this.#canJump = true;
		}

		const normalizedKeyMovement = new Vector3(
			keys.KeyA + keys.KeyD,
			0,
			keys.KeyW + keys.KeyS,
		);
		normalizedKeyMovement.normalize(); */
		// normalizedKeyMovement[1] -= Instance.GRAVITY;

		// const accelDir = camera.getMoveDirection(normalizedKeyMovement);

		// const prevVelocity = new Vector3(camera.getVelocity());

		// let velocity = this.#moveGround(accelDir, prevVelocity, deltaTime);

		const cameraProxyGeometry = camera.getProxyGeometry();

		if (cameraProxyGeometry) {
			// const previousHullY = cameraHull.getPosition()[1];
			const physicMeshes = scene.getPhysicMeshes();

			this.#updateCamera(camera, physicMeshes);

			// const currentHullY = cameraHull.getPosition()[1];

			/**
			 * @todo
			 */
			/* if (currentHullY === previousHullY) {
				velocity = this.#moveGround(accelDir, prevVelocity, deltaTime);
			} else {
				velocity = this.#moveAir(accelDir, prevVelocity, deltaTime);
			} */
		}

		// camera.getPosition().add(velocity);
		// camera.setVelocity(velocity);

		camera.update();

		this.getDebugger().update({
			deltaTime: deltaTime.toPrecision(2),
			pos: camera.getPosition(),
			canJump: this.#canJump,
		});
	}

	_render() {
		this._renderer.render();
	}

	/**
	 * @param {Camera} camera
	 * @param {Mesh[]} physicMeshes
	 */
	#updateCamera(camera, physicMeshes) {
		// hull.setPosition(camera.getPosition());
		// hull.updateWorld();

		for (let i = 0; i < physicMeshes.length; i++) {
			const physicMesh = physicMeshes[i];
			const hitResponse = this.#hitTest(camera, physicMesh);

			if (!hitResponse) {
				continue;
			}

			const force = hitResponse.normal.multiplyScalar(hitResponse.depth);

			/**
			 * @todo Fix blocking edges between geometries
			 */
			camera.getPosition().subtract(force);
			// hull.updateWorld();
		}
	}

	/**
	 * @param {Mesh} dynamicMesh
	 * @param {Mesh} staticMesh
	 */
	#hitTest(dynamicMesh, staticMesh) {
		const simplex = GJK.test3d(dynamicMesh, staticMesh);
		const intersecting = simplex !== null;

		if (!intersecting) {
			return null;
		}

		const collision = EPA.test3d(dynamicMesh, staticMesh, simplex);

		return collision;
	}

	/**
	 * @param {Vector3} acceleratedDirection
	 * @param {Vector3} currentVelocity
	 * @param {Number} accelerate
	 * @param {Number} maxVelocity
	 * @param {Number} deltaTime
	 */
	#accelerate(acceleratedDirection, currentVelocity, accelerate, maxVelocity, deltaTime) {
		const projectedVelocity = currentVelocity.dot(acceleratedDirection);
		let acceleration = accelerate * deltaTime; // Accelerated velocity in direction of movement

		if (projectedVelocity + acceleration > maxVelocity) {
			acceleration = maxVelocity - projectedVelocity;
		}

		return currentVelocity.add(new Vector3(acceleratedDirection).multiplyScalar(acceleration));
	}

	/**
	 * @param {Vector3} accelDir
	 * @param {Vector3} prevVelocity
	 * @param {Number} deltaTime
	 */
	#moveGround(accelDir, prevVelocity, deltaTime) {
		const speed = prevVelocity.magnitude();

		if (speed !== 0) {
			const drop = speed * Instance.FRICTION * deltaTime;

			prevVelocity.multiplyScalar(max(speed - drop, 0) / speed); // Scale the velocity based on friction
		}

		return this.#accelerate(accelDir, prevVelocity, Instance.ACCELERATE_GROUND, Instance.MAX_VELOCITY_GROUND, deltaTime);
	}

	/**
	 * @param {Vector3} accelDir
	 * @param {Vector3} prevVelocity
	 * @param {Number} deltaTime
	 */
	#moveAir(accelDir, prevVelocity, deltaTime) {
		return this.#accelerate(accelDir, prevVelocity, Instance.ACCELERATE_AIR, Instance.MAX_VELOCITY_AIR, deltaTime);
	}

	#handleJump() {
		const camera = this._renderer.getCamera();

		// camera.getVelocity()[1] = 2;
	}
}