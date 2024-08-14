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

	getByteOffset() {
		return this.#byteOffset;
	}

	/**
	 * @param {Number} byteOffset
	 */
	setByteOffset(byteOffset) {
		this.#byteOffset = byteOffset;
	}

	getByteLength() {
		return this.#dataView.byteLength;
	}

	/**
	 * @param {Number|BigInt} byteLength
	 */
	advance(byteLength) {
		this.#byteOffset += Number(byteLength);
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
	 * @param {Number} byteLength
	 */
	readInt8Array(byteLength) {
		const arrayBuffer = this.#readArrayBuffer(byteLength);

		return new Int8Array(arrayBuffer);
	}

	/**
	 * @param {Number} byteLength
	 */
	readUint8Array(byteLength) {
		const arrayBuffer = this.#readArrayBuffer(byteLength);

		return new Uint8Array(arrayBuffer);
	}

	/**
	 * @param {Number} byteLength
	 */
	readInt16Array(byteLength) {
		const arrayBuffer = this.#readArrayBuffer(byteLength);

		return new Int16Array(arrayBuffer);
	}

	/**
	 * @param {Number} byteLength
	 */
	readUint16Array(byteLength) {
		const arrayBuffer = this.#readArrayBuffer(byteLength);

		return new Uint16Array(arrayBuffer);
	}

	/**
	 * @param {Number} byteLength
	 */
	readInt32Array(byteLength) {
		const arrayBuffer = this.#readArrayBuffer(byteLength);

		return new Int32Array(arrayBuffer);
	}

	/**
	 * @param {Number} byteLength
	 */
	readUint32Array(byteLength) {
		const arrayBuffer = this.#readArrayBuffer(byteLength);

		return new Uint32Array(arrayBuffer);
	}

	/**
	 * @param {Number} byteLength
	 */
	readBigInt64Array(byteLength) {
		const arrayBuffer = this.#readArrayBuffer(byteLength);

		return new BigInt64Array(arrayBuffer);
	}

	/**
	 * @param {Number} byteLength
	 */
	readBigUint64Array(byteLength) {
		const arrayBuffer = this.#readArrayBuffer(byteLength);

		return new BigUint64Array(arrayBuffer);
	}

	/**
	 * @param {Number} byteLength
	 */
	readFloat32Array(byteLength) {
		const arrayBuffer = this.#readArrayBuffer(byteLength);

		return new Float32Array(arrayBuffer);
	}

	/**
	 * @param {Number} byteLength
	 */
	readFloat64Array(byteLength) {
		const arrayBuffer = this.#readArrayBuffer(byteLength);

		return new Float64Array(arrayBuffer);
	}

	/**
	 * @param {Number} byteLength
	 */
	readBoolArray(byteLength) {
		const array = this.readUint8Array(byteLength);

		return [...array].map(Boolean);
	}

	/**
	 * @param {Number} byteLength
	 */
	readString(byteLength) {
		const array = this.readUint8Array(byteLength);

		return String.fromCharCode(...array);
	}

	/**
	 * @param {Number} byteLength
	 */
	#readArrayBuffer(byteLength) {
		const arrayBuffer = this.#dataView.buffer.slice(this.#byteOffset, this.#byteOffset + byteLength);

		this.#byteOffset += byteLength;

		return arrayBuffer;
	}
}