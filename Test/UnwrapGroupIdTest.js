import {Vector3} from "../src/math/index.js";
import {UnitTest} from "../src/Test/index.js";

export class UnwrapGroupIdTest extends UnitTest {
	async execute() {
		const WRAPPED_GROUP_STRIDE = 128;

		/**
		 * @param {Vector3} groupId
		 * @returns {Number}
		 */
		function unwrapGroupId(groupId) {
			return groupId[0] + (groupId[2] * WRAPPED_GROUP_STRIDE + groupId[1]) * WRAPPED_GROUP_STRIDE;
		}

		const groupId = new Vector3(57, 73, 42);
		const unwrappedGroupId = unwrapGroupId(groupId);

		this.assert(unwrappedGroupId === 697529);
	}
}