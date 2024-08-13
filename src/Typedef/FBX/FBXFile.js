/**
 * @typedef {Object} FBXFile Unofficial name
 * @property {uint32_t} version Unofficial name
 * @property {NodeRecord[]} nodes Unofficial name
 */

/**
 * @typedef {Object} NodeRecord Unofficial name
 * @property {uint32_t} EndOffset
 * @property {uint32_t} NumProperties
 * @property {uint32_t} PropertyListLen
 * @property {uint8_t} NameLen
 * @property {char} Name
 * @property {PropertyRecord[]} Properties Unofficial name
 * @property {uint8_t[]} NULL-record
*/

/**
 * @typedef {Object} PropertyRecord Unofficial name
 * @property {char} TypeCode
 * @property {RawPropertyRecordData|StringPropertyRecordData} Data
 */

/**
 * @typedef {Object} RawPropertyRecordData Unofficial name
 * @property {uint32_t} Length
 * @property {byte} Data
 */

/**
 * @typedef {Object} StringPropertyRecordData Unofficial name
 * @property {uint32_t} Length
 * @property {char} Data
 */