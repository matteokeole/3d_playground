import {Loader} from "./Loader.js";
import {BinaryReader} from "../Reader/index.js";

/**
 * @typedef {(reader: BinaryReader) => any} PropertyHandler
 */

/**
 * @typedef {(reader: BinaryReader, length: Number) => any} ArrayPropertyHandler
 */

/**
 * @see {@link https://code.blender.org/2013/08/fbx-binary-file-format-specification}
 */
export class FBXBinaryLoader extends Loader {
	static #MAX_ROOT_NODE_ITERATIONS = 16;
	static #MAX_CHILD_NODE_ITERATIONS = 128;
	static #MAGIC_STRING = "Kaydara FBX Binary  \x00\x1a\x00";
	static #MAGIC = Uint8Array.from(FBXBinaryLoader.#MAGIC_STRING.split(""), c => c.charCodeAt(0));
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
		b: reader => FBXBinaryLoader.#parseArrayPropertyData(reader, "b"),
		d: reader => FBXBinaryLoader.#parseArrayPropertyData(reader, "d"),
		f: reader => FBXBinaryLoader.#parseArrayPropertyData(reader, "f"),
		i: reader => FBXBinaryLoader.#parseArrayPropertyData(reader, "i"),
		l: reader => FBXBinaryLoader.#parseArrayPropertyData(reader, "l"),
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
	 * @param {bool} isVersion7500OrAbove
	 */
	static #parseNode(reader, isVersion7500OrAbove) {
		/**
		 * @type {FBXNode}
		 */
		const Node = {};

		Node.EndOffset = isVersion7500OrAbove ? Number(reader.readBigUint64()) : reader.readUint32();

		if (Node.EndOffset === 0) {
			return null;
		}

		Node.NumProperties = isVersion7500OrAbove ? Number(reader.readBigUint64()) : reader.readUint32();
		Node.PropertyListLen = isVersion7500OrAbove ? Number(reader.readBigUint64()) : reader.readUint32();

		Node.NameLen = reader.readUint8();
		Node.Name = reader.readString(Node.NameLen);
		Node.PropertyList = [];

		for (let i = 0; i < Node.NumProperties; i++) {
			const Property = FBXBinaryLoader.#parseProperty(reader);

			Node.PropertyList.push(Property);
		}

		Node.NestedList = [];

		if (reader.getByteOffset() !== Node.EndOffset) {
			for (let i = 0; i < FBXBinaryLoader.#MAX_CHILD_NODE_ITERATIONS; i++) {
				const ChildNode = FBXBinaryLoader.#parseNode(reader, isVersion7500OrAbove);

				if (!ChildNode) {
					break;
				}

				Node.NestedList.push(ChildNode);
			}
		}

		if (!isVersion7500OrAbove && reader.getByteOffset() !== Node.EndOffset) {
			reader.advance(9 * Uint8Array.BYTES_PER_ELEMENT);
		}

		return Node;
	}

	/**
	 * @param {BinaryReader} reader
	 */
	static #parseProperty(reader) {
		/**
		 * @type {FBXProperty}
		 */
		const Property = {};

		Property.TypeCode = reader.readChar();

		const propertyHandler = FBXBinaryLoader.#PROPERTY_HANDLERS[Property.TypeCode];

		if (!propertyHandler) {
			console.warn(`Unhandled property type '${Property.TypeCode}'.`);

			return Property;
		}

		Property.Data = propertyHandler(reader);

		return Property;
	}

	/**
	 * @param {BinaryReader} reader
	 * @param {char} TypeCode
	 */
	static #parseArrayPropertyData(reader, TypeCode) {
		/**
		 * @type {FBXArrayPropertyData}
		 */
		const Data = {};

		Data.ArrayLength = reader.readUint32();
		Data.Encoding = reader.readUint32();
		Data.CompressedLength = reader.readUint32();

		const arrayPropertyHandler = FBXBinaryLoader.#ARRAY_PROPERTY_HANDLERS[TypeCode];

		if (!arrayPropertyHandler) {
			console.warn(`Unhandled array property type '${TypeCode}'.`);

			return Data;
		}

		if (Data.Encoding === 0) {
			Data.Contents = arrayPropertyHandler(reader, Data.ArrayLength);

			return Data;
		}

		if (Data.Encoding === 1) {
			const compressedArray = reader.readUint8Array(Data.CompressedLength);
			const readableStream = new Response(compressedArray).body.pipeThrough(new DecompressionStream("deflate"));
			const response = new Response(readableStream);

			return new Promise(async function(resolve) {
				const arrayBuffer = await response.arrayBuffer();
				const reader = new BinaryReader({
					arrayBuffer,
					isLittleEndian: true,
				});
				const Contents = arrayPropertyHandler(reader, Data.ArrayLength);

				Data.Contents = Contents;

				return resolve(Data);
			});
		}

		throw new Error(`Unhandled encoding value ${Data.Encoding}.`);
	}

	/**
	 * @param {BinaryReader} reader
	 */
	static #isMagicValid(reader) {
		if (reader.getByteLength() < FBXBinaryLoader.#MAGIC.byteLength) {
			return false;
		}

		const magic = reader.readUint8Array(FBXBinaryLoader.#MAGIC.length);

		for (let i = 0; i < FBXBinaryLoader.#MAGIC.length; i++) {
			if (magic[i] !== FBXBinaryLoader.#MAGIC[i]) {
				return false;
			}
		}

		return true;
	}

	/**
	 * @param {String} url
	 */
	async load(url) {
		const response = await super.load(url);
		const arrayBuffer = await response.arrayBuffer();
		const reader = new BinaryReader({
			arrayBuffer,
			isLittleEndian: true,
		});

		const Header = FBXBinaryLoader.#parseHeader(reader);
		const isVersion7500OrAbove = Header.Version >= 7500;

		/**
		 * @type {FBXFile}
		 */
		const File = {};

		File.Header = Header;
		File.NodeList = [];

		for (let i = 0; i < FBXBinaryLoader.#MAX_ROOT_NODE_ITERATIONS; i++) {
			const Node = FBXBinaryLoader.#parseNode(reader, isVersion7500OrAbove);

			if (!Node) {
				break;
			}

			File.NodeList.push(Node);
		}

		return File;
	}
}