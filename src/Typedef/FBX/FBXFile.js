/**
 * @typedef {Object} FBXFile
 * @property {FBXHeader} Header
 * @property {FBXNode[]} Nodes
 */

/**
 * @typedef {Object} FBXHeader
 * @property {uint32_t} Version
 */

/**
 * @typedef {Object} FBXNode
 * @property {uint32_t} EndOffset
 * @property {uint32_t} NumProperties
 * @property {uint32_t} PropertyListLen
 * @property {uint8_t} NameLen
 * @property {char} Name
 * @property {FBXProperty[]} Properties
 * @property {FBXNode[]} NestedList
*/

/**
 * @typedef {Object} FBXProperty
 * @property {char} TypeCode
 * @property {FBXPropertyData} Data
 */

/**
 * @typedef {bool|int16_t|int32_t|int64_t|float|double|FBXArrayPropertyData|FBXRawPropertyData|FBXStringPropertyData} FBXPropertyData
 */

/**
 * @typedef {Object} FBXArrayPropertyData
 * @property {uint32_t} ArrayLength
 * @property {uint32_t} Encoding
 * @property {uint32_t} CompressedLength
 * @property {Uint8Array|Int32Array|BigInt64Array|Float32Array|Float64Array} Contents Booleans are stored in Uint8Array
 */

/**
 * @typedef {Object} FBXRawPropertyData
 * @property {uint32_t} Length
 * @property {uint8_t[]} Data
 */

/**
 * @typedef {Object} FBXStringPropertyData
 * @property {uint32_t} Length
 * @property {char} Data
 */