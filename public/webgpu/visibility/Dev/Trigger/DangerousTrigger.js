import {IntersectionTrigger, TriggerState} from "../../../../../src/Trigger/index.js";
import {Player} from "../Player/Player.js";

export class DangerousTrigger extends IntersectionTrigger {
	getObjectType() {
		return Player;
	}

	/**
	 * @param {Player} player
	 */
	onIntersect(player) {
		player.damage(10);

		// With this the code above is executed only once
		// Once a trigger is disabled, this callback won't be triggered again
		// until the trigger gets activated from an external source.
		// This source can be another trigger.
		this.setState(TriggerState.OFF);
	}
}