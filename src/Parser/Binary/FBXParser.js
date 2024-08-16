import {BinaryReader} from "../../Reader/index.js";
import {Parser} from "../Parser.js";

/**
 * @typedef {(reader: BinaryReader) => any} PropertyHandler
 */

/**
 * @typedef {(reader: BinaryReader, length: Number) => any} ArrayPropertyHandler
 */

/**
 * @see {@link https://code.blender.org/2013/08/fbx-binary-file-format-specification}
 */
export class FBXParser extends Parser {
	static #MAX_ROOT_NODE_ITERATIONS = 16;
	static #MAX_CHILD_NODE_ITERATIONS = 128;
	static #MAGIC_STRING = "Kaydara FBX Binary  \x00\x1a\x00";
	static #MAGIC = Uint8Array.from(FBXParser.#MAGIC_STRING.split(""), c => c.charCodeAt(0));
	/**
	 * @type {Record.<String, PropertyHandler>}
	 */
	static #PROPERTY_HANDLERS = {
		C(reader) {
			return reader.readBool();
		},
		D(reader) {
			return reader.readFloat64();
		},
		F(reader) {
			return reader.readFloat32();
		},
		I(reader) {
			return reader.readInt32();
		},
		L(reader) {
			return reader.readBigInt64();
		},
		Y(reader) {
			return reader.readInt16();
		},
		b: async reader => await FBXParser.#parseArrayPropertyData(reader, "b"),
		d: async reader => await FBXParser.#parseArrayPropertyData(reader, "d"),
		f: async reader => await FBXParser.#parseArrayPropertyData(reader, "f"),
		i: async reader => await FBXParser.#parseArrayPropertyData(reader, "i"),
		l: async reader => await FBXParser.#parseArrayPropertyData(reader, "l"),
		R(reader) {
			/**
			 * @type {FBXRawPropertyData}
			 */
			const PropertyData = {};

			PropertyData.Length = reader.readUint32();
			PropertyData.Data = reader.readUint8Array(PropertyData.Length);

			return PropertyData;
		},
		S(reader) {
			/**
			 * @type {FBXStringPropertyData}
			 */
			const PropertyData = {};

			PropertyData.Length = reader.readUint32();
			PropertyData.Data = reader.readString(PropertyData.Length);

			return PropertyData;
		},
	};
	/**
	 * @type {Record.<String, ArrayPropertyHandler>}
	 */
	static #ARRAY_PROPERTY_HANDLERS = {
		b(reader, length) {
			return reader.readBoolArray(length * Uint8Array.BYTES_PER_ELEMENT);
		},
		d(reader, length) {
			return reader.readFloat64Array(length * Float64Array.BYTES_PER_ELEMENT);
		},
		f(reader, length) {
			return reader.readFloat32Array(length * Float32Array.BYTES_PER_ELEMENT);
		},
		i(reader, length) {
			return reader.readInt32Array(length * Int32Array.BYTES_PER_ELEMENT);
		},
		l(reader, length) {
			return reader.readBigInt64Array(length * BigInt64Array.BYTES_PER_ELEMENT);
		},
	};

	/**
	 * @param {BinaryReader} reader
	 * @throws {Error} The file magic is invalid
	 */
	static #parseHeader(reader) {
		if (!this.#isMagicValid(reader)) {
			throw new Error("Invalid binary FBX file.");
		}

		/**
		 * @type {FBXHeader}
		 */
		const Header = {};

		Header.Version = reader.readUint32();

		return Header;
	}

	/**
	 * @param {BinaryReader} reader
	 * @param {bool} isVersionGeq7500
	 */
	static async #parseNode(reader, isVersionGeq7500) {
		/**
		 * @type {FBXNode}
		 */
		const Node = {};

		Node.EndOffset = isVersionGeq7500 ? Number(reader.readBigUint64()) : reader.readUint32();

		if (Node.EndOffset === 0) {
			return null;
		}

		Node.NumProperties = isVersionGeq7500 ? Number(reader.readBigUint64()) : reader.readUint32();
		Node.PropertyListLen = isVersionGeq7500 ? Number(reader.readBigUint64()) : reader.readUint32();

		Node.NameLen = reader.readUint8();
		Node.Name = reader.readString(Node.NameLen);
		Node.PropertyList = [];

		for (let i = 0; i < Node.NumProperties; i++) {
			const Property = await FBXParser.#parseProperty(reader);

			Node.PropertyList.push(Property);
		}

		Node.NestedList = [];

		if (reader.getByteOffset() !== Node.EndOffset) {
			for (let i = 0; i < FBXParser.#MAX_CHILD_NODE_ITERATIONS; i++) {
				const ChildNode = await FBXParser.#parseNode(reader, isVersionGeq7500);

				if (!ChildNode) {
					break;
				}

				Node.NestedList.push(ChildNode);
			}
		}

		if (!isVersionGeq7500 && reader.getByteOffset() !== Node.EndOffset) {
			reader.advance(9 * Uint8Array.BYTES_PER_ELEMENT);
		}

		return Node;
	}

	/**
	 * @param {BinaryReader} reader
	 */
	static async #parseProperty(reader) {
		/**
		 * @type {FBXProperty}
		 */
		const Property = {};

		Property.TypeCode = reader.readChar();

		const propertyHandler = FBXParser.#PROPERTY_HANDLERS[Property.TypeCode];

		if (!propertyHandler) {
			console.warn(`Unhandled property type '${Property.TypeCode}'.`);

			return Property;
		}

		Property.Data = await propertyHandler(reader);

		return Property;
	}

	/**
	 * @param {BinaryReader} reader
	 * @param {char} TypeCode
	 */
	static async #parseArrayPropertyData(reader, TypeCode) {
		/**
		 * @type {FBXArrayPropertyData}
		 */
		const Data = {};

		Data.ArrayLength = reader.readUint32();
		Data.Encoding = reader.readUint32();
		Data.CompressedLength = reader.readUint32();

		const arrayPropertyHandler = FBXParser.#ARRAY_PROPERTY_HANDLERS[TypeCode];

		if (!arrayPropertyHandler) {
			console.warn(`Unhandled array property type '${TypeCode}'.`);

			return Data;
		}

		if (Data.Encoding === 0) {
			Data.Contents = arrayPropertyHandler(reader, Data.ArrayLength);

			return Data;
		}

		if (Data.Encoding === 1) {
			const compressed = reader.readUint8Array(Data.CompressedLength);
			const readableStream = new Response(compressed).body.pipeThrough(new DecompressionStream("deflate"));
			const response = new Response(readableStream);
			const arrayBuffer = await response.arrayBuffer();
			const compressedReader = new BinaryReader({
				arrayBuffer,
				isLittleEndian: true,
			});
			const Contents = arrayPropertyHandler(compressedReader, Data.ArrayLength);

			Data.Contents = Contents;

			return Data;
		}

		throw new Error(`Unhandled encoding value ${Data.Encoding}.`);
	}

	/**
	 * @param {BinaryReader} reader
	 */
	static #isMagicValid(reader) {
		if (reader.getByteLength() < FBXParser.#MAGIC.byteLength) {
			return false;
		}

		const magic = reader.readUint8Array(FBXParser.#MAGIC.length);

		for (let i = 0; i < FBXParser.#MAGIC.length; i++) {
			if (magic[i] !== FBXParser.#MAGIC[i]) {
				return false;
			}
		}

		return true;
	}

	/**
	 * @param {ArrayBuffer} arrayBuffer
	 */
	async parse(arrayBuffer) {
		const reader = new BinaryReader({
			arrayBuffer,
			isLittleEndian: true,
		});

		/**
		 * @type {FBXData}
		 */
		const Data = {};

		Data.Header = FBXParser.#parseHeader(reader);
		Data.NodeList = [];

		const isVersionGeq7500 = Data.Header.Version >= 7500;

		for (let i = 0; i < FBXParser.#MAX_ROOT_NODE_ITERATIONS; i++) {
			const Node = await FBXParser.#parseNode(reader, isVersionGeq7500);

			if (!Node) {
				break;
			}

			Data.NodeList.push(Node);
		}

		return Data;
	}
}