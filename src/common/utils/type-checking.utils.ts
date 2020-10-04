
/**
 * Check if a given value is of type number.
 *
 * @param {any} value the value to test
 * @returns {boolean} whether or not the value is of type number
 */
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export function isNumber(value: any): boolean {
  return typeof value === 'number';
}

/**
 * Check if a given value is of type string.
 *
 * @param {any} value the value to test
 * @returns {boolean} whether or not the value is of type string
 */
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export function isString(value: any): boolean {
  return typeof value === 'string';
}
