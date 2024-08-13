import {Loader} from "./Loader.js";

/**
 * @see {@link https://code.blender.org/2013/08/fbx-binary-file-format-specification}
 */
export class FBXBinaryLoader extends Loader {
	static #MAGIC_STRING = "Kaydara FBX Binary  \x00\x1a\x00";
	static #MAGIC = Uint8Array.from(FBXBinaryLoader.#MAGIC_STRING.split(""), character => character.charCodeAt(0));

	/**
	 * @type {Record.<String, ?Function>}
	 */
	static #PROPERTY_TYPE_HANDLERS = {
		// Primitive types
		"C": null,
		"D": null,
		"F": null,
		"I": FBXBinaryLoader.#handleIPropertyData,
		"L": null,
		"Y": null,
		// Array types
		"b": null,
		"d": null,
		"f": null,
		"i": null,
		"l": null,
		// Special types
		"R": FBXBinaryLoader.#handleRPropertyData,
		"S": FBXBinaryLoader.#handleSPropertyData,
	};

	static #MAX_ROOT_NODE_RECORDS = 2;
	static #MAX_NODE_RECORDS = 5;

	/**
	 * @param {ArrayBuffer} arrayBuffer
	 */
	static #toString(arrayBuffer) {
		return String.fromCharCode(...new Uint8Array(arrayBuffer));
	}

	/**
	 * @param {DataView} dataView
	 * @throws {Error} The file magic is invalid
	 */
	static #parseHeader(dataView) {
		if (!this.#isMagicValid(dataView)) {
			throw new Error("Invalid binary FBX file.");
		}

		const version = dataView.getUint32(23, true);

		return version / 1000;
	}

	/**
	 * @param {DataView} dataView
	 */
	static #isMagicValid(dataView) {
		const magic = new Uint8Array(dataView.buffer);

		for (let i = 0; i < FBXBinaryLoader.#MAGIC.length; i++) {
			if (magic[i] !== FBXBinaryLoader.#MAGIC[i]) {
				return false;
			}
		}

		return true;
	}

	/**
	 * @param {DataView} dataView
	 * @param {Number} nodeStartOffset
	 */
	static #parseNodeRecord(dataView, nodeStartOffset) {
		const EndOffset = dataView.getUint32(nodeStartOffset, true);

		if (EndOffset === 0) {
			return null;
		}

		const NumProperties = dataView.getUint32(nodeStartOffset + 1 * Uint32Array.BYTES_PER_ELEMENT, true);
		const PropertyListLen = dataView.getUint32(nodeStartOffset + 2 * Uint32Array.BYTES_PER_ELEMENT, true);
		const NameLen = dataView.getUint8(nodeStartOffset + 3 * Uint32Array.BYTES_PER_ELEMENT);
		const Name = FBXBinaryLoader.#toString(dataView.buffer.slice(
			nodeStartOffset + 3 * Uint32Array.BYTES_PER_ELEMENT + 1 * Uint8Array.BYTES_PER_ELEMENT,
			nodeStartOffset + 3 * Uint32Array.BYTES_PER_ELEMENT + 1 * Uint8Array.BYTES_PER_ELEMENT + NameLen,
		));

		/**
		 * @type {FBXNode}
		 */
		const Node = {
			EndOffset,
			NumProperties,
			PropertyListLen,
			NameLen,
			Name,
			Properties: [],
			NestedList: [],
		};

		let propertyStartOffset = nodeStartOffset + 3 * Uint32Array.BYTES_PER_ELEMENT + 1 * Uint8Array.BYTES_PER_ELEMENT + NameLen;
		let Property = null;

		for (let i = 0; i < NumProperties; i++) {
			Property = FBXBinaryLoader.#parsePropertyRecord(dataView, propertyStartOffset);

			propertyStartOffset += (Property?.Data?.Length ?? 0) + 1 * Uint32Array.BYTES_PER_ELEMENT;

			Node.Properties.push(Property);
		}

		let nestedListStartOffset = nodeStartOffset
			+ 3 * Uint32Array.BYTES_PER_ELEMENT
			+ 1 * Uint8Array.BYTES_PER_ELEMENT
			+ NameLen
			+ PropertyListLen;

		if (Node.EndOffset - nestedListStartOffset > 0) {
			// Parse nested list
			for (let i = 0; i < FBXBinaryLoader.#MAX_NODE_RECORDS; i++) {
				// console.log("Parsing sub node starting at", nestedListStartOffset);

				const SubNode = FBXBinaryLoader.#parseNodeRecord(dataView, nestedListStartOffset);

				if (!SubNode) {
					break;
				}

				Node.NestedList.push(SubNode);

				nestedListStartOffset = SubNode.EndOffset;

				if (Node.EndOffset - nestedListStartOffset <= 0) {
					break;
				}
			}
		}

		return Node;
	}

	/**
	 * @param {DataView} dataView
	 * @param {Number} offset
	 */
	static #parsePropertyRecord(dataView, offset) {
		const TypeCode = String.fromCharCode(dataView.getUint8(offset));

		/**
		 * @type {FBXProperty}
		 */
		const Property = {
			TypeCode,
			Data: null,
		};

		const handler = FBXBinaryLoader.#PROPERTY_TYPE_HANDLERS[TypeCode];

		if (!handler) {
			console.warn(`Unhandled property '${TypeCode}'.`);

			return Property;
		}

		const Data = handler(dataView, offset + 1 * Uint8Array.BYTES_PER_ELEMENT);

		Property.Data = Data;

		return Property;
	}

	/**
	 * @param {DataView} dataView
	 * @param {Number} offset
	 */
	static #handleIPropertyData(dataView, offset) {
		const Data = dataView.getInt32(offset, true);

		return Data;
	}

	/**
	 * @param {DataView} dataView
	 * @param {Number} offset
	 */
	static #handleRPropertyData(dataView, offset) {
		const Length = dataView.getUint32(offset, true);
		const Data = new Uint8Array(dataView.buffer.slice(
			offset + 1 * Uint32Array.BYTES_PER_ELEMENT,
			offset + 1 * Uint32Array.BYTES_PER_ELEMENT + Length,
		));

		const RawPropertyData = {
			Length,
			Data,
		};

		return RawPropertyData;
	}

	/**
	 * @param {DataView} dataView
	 * @param {Number} offset
	 */
	static #handleSPropertyData(dataView, offset) {
		const Length = dataView.getUint32(offset, true);
		const Data = FBXBinaryLoader.#toString(dataView.buffer.slice(
			offset + 1 * Uint32Array.BYTES_PER_ELEMENT,
			offset + 1 * Uint32Array.BYTES_PER_ELEMENT + Length,
		));

		/**
		 * @type {FBXStringPropertyData}
		 */
		const StringPropertyData = {
			Length,
			Data,
		};

		return StringPropertyData;
	}

	/**
	 * @param {String} url
	 */
	async load(url) {
		const response = await super.load(url);
		const arrayBuffer = await response.arrayBuffer();
		const dataView = new DataView(arrayBuffer);

		const Version = FBXBinaryLoader.#parseHeader(dataView);

		/**
		 * @type {FBXFile}
		 */
		const File = {
			Version,
			Nodes: [],
		};

		for (let i = 0, nodeStartOffset = 27; i < FBXBinaryLoader.#MAX_ROOT_NODE_RECORDS; i++) {
			const Node = FBXBinaryLoader.#parseNodeRecord(dataView, nodeStartOffset);

			if (!Node) {
				break;
			}

			File.Nodes.push(Node);

			nodeStartOffset = Node.EndOffset;
		}

		return File;
	}
}