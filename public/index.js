import {Vector2, Vector3} from "../src/math/index.js";

export const ENTITY_HEIGHT_STAND = 64;
export const PLAYER_VIEWPOINT = 64;
export const FIELD_OF_VIEW = 75;
export const PLAYER_COLLISION_HULL = new Vector3(33, 73, 33);

/**
 * @see {@link https://developer.valvesoftware.com/wiki/Viewcone}
 */
export const SIGHT_RANGE = new Vector2(0, 2048);