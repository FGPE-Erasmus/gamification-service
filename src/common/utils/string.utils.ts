/**
 * Escape a regular expression string.
 *
 * @param {string} value the regular expression string
 * @returns {string} the escaped string
 */
export function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Encode a string to Base64.
 *
 * @param {string} input the string to encode
 * @returns {string} the base64-encoded string
 */
export function base64Encode(input: string): string {
  return Buffer.from(input.toString()).toString('base64');
}

/**
 * Decode a Base64 string.
 *
 * @param {string} input the base64-encoded string
 * @returns {string} the decoded string
 */
export function base64Decode(input: string): string {
  return Buffer.from(input, 'base64').toString('ascii');
}

/**
 * Test whether a string contains only digits.
 *
 * @param {string} value the string to test
 * @returns {boolean} whether or not the value contains only digits
 */
export function isNumericString(value: string): boolean {
  return /^\d+$/.test(value);
}

/**
 * Retrieve the field key by
 *
 * @param field       Field
 * @returns           Field Key
 */
export function fieldKey(field: string): string {
  return field === 'id' ? `_${field}` : field;
}
