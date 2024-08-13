import {Loader} from "./Loader.js";

/**
 * @see {@link https://code.blender.org/2013/08/fbx-binary-file-format-specification}
 */
export class FBXBinaryLoader extends Loader {
	static #MAGIC_STRING = "Kaydara FBX Binary  \x00\x1a\x00";
	static #MAGIC = Uint8Array.from(FBXBinaryLoader.#MAGIC_STRING.split(""), character => character.charCodeAt(0));
	static #PROPERTY_TYPE_HANDLERS = {
		// Primitive types
		"C": FBXBinaryLoader.#handleCPropertyData,
		"D": FBXBinaryLoader.#handleDPropertyData,
		"F": null,
		"I": FBXBinaryLoader.#handleIPropertyData,
		"L": FBXBinaryLoader.#handleLPropertyData,
		"Y": null,
		// Array types
		"b": null,
		"d": (arrayBuffer, offset) => FBXBinaryLoader.#handleArrayPropertyData(arrayBuffer, offset, "d"),
		"f": null,
		"i": (arrayBuffer, offset) => FBXBinaryLoader.#handleArrayPropertyData(arrayBuffer, offset, "i"),
		"l": null,
		// Special types
		"R": FBXBinaryLoader.#handleRPropertyData,
		"S": FBXBinaryLoader.#handleSPropertyData,
	};
	static #ARRAY_PROPERTY_TYPE_HANDLERS = {
		"b": null,
		"d": FBXBinaryLoader.#handleDArrayPropertyData,
		"f": null,
		"i": FBXBinaryLoader.#handleIArrayPropertyData,
		"l": null,
	};
	static #MAX_ROOT_NODE_RECORDS = 9;
	static #MAX_NODE_RECORDS = 32;

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

		return version;
	}

	/**
	 * @param {DataView} dataView
	 */
	static #isMagicValid(dataView) {
		const magic = new Uint8Array(dataView.buffer);

		if (magic.length < FBXBinaryLoader.#MAGIC.length) {
			return false;
		}

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
	 * @param {bool} isVersion7500OrAbove
	 */
	static async #parseNodeRecord(dataView, nodeStartOffset, isVersion7500OrAbove) {
		const EndOffset = isVersion7500OrAbove ?
			dataView.getUint32(nodeStartOffset, true) :
			dataView.getUint32(nodeStartOffset, true);

		if (EndOffset === 0) {
			return null;
		}

		const bytesPerElement = isVersion7500OrAbove ?
			BigUint64Array.BYTES_PER_ELEMENT :
			Uint32Array.BYTES_PER_ELEMENT;

		const NumProperties = dataView.getUint32(nodeStartOffset + 1 * bytesPerElement, true);
		const PropertyListLen = dataView.getUint32(nodeStartOffset + 2 * bytesPerElement, true);
		const NameLen = dataView.getUint8(nodeStartOffset + 3 * bytesPerElement);
		const Name = FBXBinaryLoader.#toString(dataView.buffer.slice(
			nodeStartOffset + 3 * bytesPerElement + 1 * Uint8Array.BYTES_PER_ELEMENT,
			nodeStartOffset + 3 * bytesPerElement + 1 * Uint8Array.BYTES_PER_ELEMENT + NameLen,
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

		let propertyStartOffset = nodeStartOffset + 3 * bytesPerElement + 1 * Uint8Array.BYTES_PER_ELEMENT + NameLen;
		let Property = null;

		for (let i = 0; i < NumProperties; i++) {
			Property = await FBXBinaryLoader.#parsePropertyRecord(dataView, propertyStartOffset, Node.Name);

			propertyStartOffset += FBXBinaryLoader.#getPropertyLength(Property);

			Node.Properties.push(Property);
		}

		let nestedListStartOffset = nodeStartOffset
			+ 3 * bytesPerElement
			+ 1 * Uint8Array.BYTES_PER_ELEMENT
			+ NameLen
			+ PropertyListLen;

		if (Node.EndOffset - nestedListStartOffset > 0) {
			for (let i = 0; i < FBXBinaryLoader.#MAX_NODE_RECORDS; i++) {
				const SubNode = await FBXBinaryLoader.#parseNodeRecord(dataView, nestedListStartOffset, isVersion7500OrAbove);

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
	 * @param {String} nodeName
	 */
	static async #parsePropertyRecord(dataView, offset, nodeName) {
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
			console.warn(`Unhandled property '${TypeCode}' in node '${nodeName}'.`);

			return Property;
		}

		const Data = await handler(dataView, offset + 1 * Uint8Array.BYTES_PER_ELEMENT);

		Property.Data = Data;

		return Property;
	}

	/**
	 * @param {DataView} dataView
	 * @param {Number} offset
	 */
	static async #handleCPropertyData(dataView, offset) {
		const Data = dataView.getUint8(offset);

		return Boolean(Data);
	}

	/**
	 * @param {DataView} dataView
	 * @param {Number} offset
	 */
	static async #handleDPropertyData(dataView, offset) {
		const Data = dataView.getFloat64(offset, true);

		return Data;
	}

	/**
	 * @param {DataView} dataView
	 * @param {Number} offset
	 */
	static async #handleIPropertyData(dataView, offset) {
		const Data = dataView.getInt32(offset, true);

		return Data;
	}

	/**
	 * @param {DataView} dataView
	 * @param {Number} offset
	 */
	static async #handleLPropertyData(dataView, offset) {
		const Data = dataView.getBigInt64(offset, true);

		return Data;
	}

	/**
	 * @param {DataView} dataView
	 * @param {Number} offset
	 * @param {char} TypeCode
	 */
	static async #handleArrayPropertyData(dataView, offset, TypeCode) {
		const ArrayLength = dataView.getUint32(offset, true);
		const Encoding = dataView.getUint32(offset + 1 * Uint32Array.BYTES_PER_ELEMENT, true);
		const CompressedLength = dataView.getUint32(offset + 2 * Uint32Array.BYTES_PER_ELEMENT, true);

		/**
		 * @type {FBXArrayPropertyData}
		 */
		const Data = {
			ArrayLength,
			Encoding,
			CompressedLength,
			Contents: null,
		};

		const handler = FBXBinaryLoader.#ARRAY_PROPERTY_TYPE_HANDLERS[TypeCode];

		if (!handler) {
			console.warn(`Could not find array handler for property '${TypeCode}'.`);

			return Data;
		}

		if (Encoding === 0) {
			const Contents = handler(dataView.buffer.slice(
				offset + 3 * Uint32Array.BYTES_PER_ELEMENT,
				offset + 3 * Uint32Array.BYTES_PER_ELEMENT + ArrayLength * FBXBinaryLoader.#getBytesPerElement(TypeCode),
			));

			Data.Contents = Contents;

			return Data;
		}

		if (Encoding === 1) {
			const input = new Uint8Array(dataView.buffer.slice(
				offset + 3 * Uint32Array.BYTES_PER_ELEMENT,
				offset + 3 * Uint32Array.BYTES_PER_ELEMENT + CompressedLength,
			));

			const readableStream = new Response(input).body.pipeThrough(new DecompressionStream("deflate"));
			const response = new Response(readableStream);
			const arrayBuffer = await response.arrayBuffer();
			const Contents = handler(arrayBuffer);

			Data.Contents = Contents;

			return Data;
		}

		throw new Error(`Unhandled encoding value ${Encoding}.`);
	}

	/**
	 * @param {ArrayBuffer} arrayBuffer
	 */
	static #handleDArrayPropertyData(arrayBuffer) {
		return new Float64Array(arrayBuffer);
	}

	/**
	 * @param {ArrayBuffer} arrayBuffer
	 */
	static #handleIArrayPropertyData(arrayBuffer) {
		return new Int32Array(arrayBuffer);
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
	 * @param {char} TypeCode
	 */
	static #getBytesPerElement(TypeCode) {
		switch (TypeCode) {
			case "d":
				return Float64Array.BYTES_PER_ELEMENT;
			case "i":
				return Int32Array.BYTES_PER_ELEMENT;
			default:
				console.warn(`getBytesPerElement: Unhandled array type code '${TypeCode}'.`);
		}

		return 0;
	}

	/**
	 * @param {FBXProperty} Property
	 */
	static #getPropertyLength(Property) {
		/**
		 * Start with the type code length
		 */
		let propertyLength = 1 * Uint8Array.BYTES_PER_ELEMENT;

		switch (Property.TypeCode) {
			case "C":
				propertyLength += 1 * Uint8Array.BYTES_PER_ELEMENT;

				break;
			case "D":
				propertyLength += 1 * Float64Array.BYTES_PER_ELEMENT;

				break;
			case "I":
				propertyLength += 1 * Int32Array.BYTES_PER_ELEMENT;

				break;
			case "L":
				propertyLength += 1 * BigInt64Array.BYTES_PER_ELEMENT;

				break;
			case "d":
				/**
				 * @type {FBXArrayPropertyData}
				 */
				// @ts-ignore
				const DArrayData = Property.Data;

				propertyLength += 3 * Uint32Array.BYTES_PER_ELEMENT + DArrayData.ArrayLength * Float64Array.BYTES_PER_ELEMENT;

				break;
			case "i":
				/**
				 * @type {FBXArrayPropertyData}
				 */
				// @ts-ignore
				const IArrayData = Property.Data;

				propertyLength += 3 * Uint32Array.BYTES_PER_ELEMENT + IArrayData.ArrayLength * Int32Array.BYTES_PER_ELEMENT;

				break;
			case "R":
				/**
				 * @type {FBXRawPropertyData}
				 */
				// @ts-ignore
				const RawData = Property.Data;

				propertyLength += 1 * Uint32Array.BYTES_PER_ELEMENT + RawData.Length;

				break;
			case "S":
				/**
				 * @type {FBXStringPropertyData}
				 */
				// @ts-ignore
				const StringData = Property.Data;

				propertyLength += 1 * Uint32Array.BYTES_PER_ELEMENT + StringData.Length;

				break;
			default:
				console.warn(`getPropertyLength: Unhandled property '${Property.TypeCode}'.`);
		}

		return propertyLength;
	}

	/**
	 * @param {String} url
	 */
	async load(url) {
		const response = await super.load(url);
		const arrayBuffer = await response.arrayBuffer();
		const dataView = new DataView(arrayBuffer);

		const Version = FBXBinaryLoader.#parseHeader(dataView);
		const isVersion7500OrAbove = Version >= 7500;

		/**
		 * @type {FBXFile}
		 */
		const File = {
			Header: {
				Version: Version / 1000,
			},
			Nodes: [],
		};

		for (let i = 0, nodeStartOffset = 27; i < FBXBinaryLoader.#MAX_ROOT_NODE_RECORDS; i++) {
			const Node = await FBXBinaryLoader.#parseNodeRecord(dataView, nodeStartOffset, isVersion7500OrAbove);

			if (!Node) {
				break;
			}

			File.Nodes.push(Node);

			nodeStartOffset = Node.EndOffset;
		}

		return File;
	}
}