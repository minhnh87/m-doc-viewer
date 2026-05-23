import { validate as runValidate } from '../../lib/validation.js';

/**
 * Build middleware that validates a section of the request against a rule schema.
 *
 * @param {'body'|'query'|'params'} source
 * @param {Record<string, ((v: any) => true|string)[]>} schema
 */
export function validate(source, schema) {
  return (req, _res, next) => {
    try {
      runValidate(req[source] || {}, schema);
      next();
    } catch (err) {
      next(err);
    }
  };
}
