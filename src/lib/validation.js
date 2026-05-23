import { BadRequestError } from './errors.js';

/**
 * Run a rules-based validation against a payload.
 * Each rule returns `true` on success or an error message string.
 *
 * @example
 *   validate(req.body, {
 *     name: [required(), isString(), maxLen(255)],
 *     paths: [required(), isArray()],
 *   });
 */
export function validate(payload, schema) {
  const errors = [];
  for (const [field, rules] of Object.entries(schema)) {
    const value = payload?.[field];
    for (const rule of rules) {
      const result = rule(value);
      if (result !== true) {
        errors.push(`${field}: ${result}`);
        break;
      }
    }
  }
  if (errors.length > 0) {
    throw new BadRequestError(errors.join('; '), 'VALIDATION_FAILED');
  }
}

export const required = () => (v) => (v !== undefined && v !== null && v !== '') || 'is required';
export const isString = () => (v) => v === undefined || typeof v === 'string' || 'must be string';
export const isArray = () => (v) => v === undefined || Array.isArray(v) || 'must be array';
export const isBoolean = () => (v) => v === undefined || typeof v === 'boolean' || 'must be boolean';
export const maxLen = (n) => (v) => v === undefined || (typeof v === 'string' && v.length <= n) || `max length ${n}`;
export const oneOf = (allowed) => (v) => v === undefined || allowed.includes(v) || `must be one of ${allowed.join(', ')}`;
