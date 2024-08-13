/**
 * @typedef {Object} FBXFile Unofficial name
 * @property {uint32_t} Version Unofficial name
 * @property {FBXNode[]} Nodes Unofficial name
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
 * @typedef {double|int32_t|FBXRawPropertyData|FBXStringPropertyData} FBXPropertyData
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