/**
 * @typedef {Object} BinaryReaderDescriptor
 * @property {ArrayBuffer} arrayBuffer
 * @property {Boolean} isLittleEndian
 */

export class BinaryReader {
	#dataView;
	#isLittleEndian;
	#byteOffset;

	/**
	 * @param {BinaryReaderDescriptor} descriptor
	 */
	constructor(descriptor) {
		this.#dataView = new DataView(descriptor.arrayBuffer);
		this.#isLittleEndian = descriptor.isLittleEndian;
		this.#byteOffset = 0;
	}

	readInt8() {
		const value = this.#dataView.getInt8(this.#byteOffset);

		this.#byteOffset += Int8Array.BYTES_PER_ELEMENT;

		return value;
	}

	readUint8() {
		const value = this.#dataView.getUint8(this.#byteOffset);

		this.#byteOffset += Uint8Array.BYTES_PER_ELEMENT;

		return value;
	}

	readInt16() {
		const value = this.#dataView.getInt16(this.#byteOffset, this.#isLittleEndian);

		this.#byteOffset += Int16Array.BYTES_PER_ELEMENT;

		return value;
	}

	readUint16() {
		const value = this.#dataView.getUint16(this.#byteOffset, this.#isLittleEndian);

		this.#byteOffset += Uint16Array.BYTES_PER_ELEMENT;

		return value;
	}

	readInt32() {
		const value = this.#dataView.getInt32(this.#byteOffset, this.#isLittleEndian);

		this.#byteOffset += Int32Array.BYTES_PER_ELEMENT;

		return value;
	}

	readUint32() {
		const value = this.#dataView.getUint32(this.#byteOffset, this.#isLittleEndian);

		this.#byteOffset += Uint32Array.BYTES_PER_ELEMENT;

		return value;
	}

	readBigInt64() {
		const value = this.#dataView.getBigInt64(this.#byteOffset, this.#isLittleEndian);

		this.#byteOffset += BigInt64Array.BYTES_PER_ELEMENT;

		return value;
	}

	readBigUint64() {
		const value = this.#dataView.getBigUint64(this.#byteOffset, this.#isLittleEndian);

		this.#byteOffset += BigUint64Array.BYTES_PER_ELEMENT;

		return value;
	}

	readFloat32() {
		const value = this.#dataView.getFloat32(this.#byteOffset, this.#isLittleEndian);

		this.#byteOffset += Float32Array.BYTES_PER_ELEMENT;

		return value;
	}

	readFloat64() {
		const value = this.#dataView.getFloat64(this.#byteOffset, this.#isLittleEndian);

		this.#byteOffset += Float64Array.BYTES_PER_ELEMENT;

		return value;
	}

	readBool() {
		const value = this.readUint8();

		return Boolean(value);
	}

	readChar() {
		const value = this.readUint8();

		return String.fromCharCode(value);
	}

	/**
	 * @param {Number} length
	 */
	readInt8Array(length) {
		const arrayBuffer = this.#readArrayBuffer(length);
		const array = new Int8Array(arrayBuffer);

		this.#byteOffset += array.byteLength;

		return array;
	}

	/**
	 * @param {Number} length
	 */
	readUint8Array(length) {
		const arrayBuffer = this.#readArrayBuffer(length);
		const array = new Uint8Array(arrayBuffer);

		this.#byteOffset += array.byteLength;

		return array;
	}

	/**
	 * @param {Number} length
	 */
	readInt16Array(length) {
		const arrayBuffer = this.#readArrayBuffer(length);
		const array = new Int16Array(arrayBuffer);

		this.#byteOffset += array.byteLength;

		return array;
	}

	/**
	 * @param {Number} length
	 */
	readUint16Array(length) {
		const arrayBuffer = this.#readArrayBuffer(length);
		const array = new Uint16Array(arrayBuffer);

		this.#byteOffset += array.byteLength;

		return array;
	}

	/**
	 * @param {Number} length
	 */
	readInt32Array(length) {
		const arrayBuffer = this.#readArrayBuffer(length);
		const array = new Int32Array(arrayBuffer);

		this.#byteOffset += array.byteLength;

		return array;
	}

	/**
	 * @param {Number} length
	 */
	readUint32Array(length) {
		const arrayBuffer = this.#readArrayBuffer(length);
		const array = new Uint32Array(arrayBuffer);

		this.#byteOffset += array.byteLength;

		return array;
	}

	/**
	 * @param {Number} length
	 */
	readBigInt64Array(length) {
		const arrayBuffer = this.#readArrayBuffer(length);
		const array = new BigInt64Array(arrayBuffer);

		this.#byteOffset += array.byteLength;

		return array;
	}

	/**
	 * @param {Number} length
	 */
	readBigUint64Array(length) {
		const arrayBuffer = this.#readArrayBuffer(length);
		const array = new BigUint64Array(arrayBuffer);

		this.#byteOffset += array.byteLength;

		return array;
	}

	/**
	 * @param {Number} length
	 */
	readFloat32Array(length) {
		const arrayBuffer = this.#readArrayBuffer(length);
		const array = new Float32Array(arrayBuffer);

		this.#byteOffset += array.byteLength;

		return array;
	}

	/**
	 * @param {Number} length
	 */
	readFloat64Array(length) {
		const arrayBuffer = this.#readArrayBuffer(length);
		const array = new Float64Array(arrayBuffer);

		this.#byteOffset += array.byteLength;

		return array;
	}

	/**
	 * @todo Measure performance compared to readUint8Array + map
	 * 
	 * @param {Number} length
	 */
	readBoolArray(length) {
		const array = [];

		for (let i = 0; i < length; i++) {
			array.push(this.readBool());
		}

		return array;
	}

	/**
	 * @param {Number} length
	 */
	readString(length) {
		const array = this.readUint8Array(length);

		return String.fromCharCode(...array);
	}

	/**
	 * @param {Number} length
	 */
	#readArrayBuffer(length) {
		const arrayBuffer = this.#dataView.buffer.slice(this.#byteOffset, this.#byteOffset + length);

		return arrayBuffer;
	}
}