/**
 * Error type carrying an HTTP status, so the UI can distinguish 401 (wrong API
 * key), 404 (missing session), 413 (file too large) from a generic failure.
 * Ported from m-claude's `HttpError` in `lib/api.ts`.
 */
export class ApiError extends Error {
  /**
   * @param {number} status HTTP status code (0 = network / unreachable).
   * @param {string} message
   */
  constructor(status, message) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }

  /** True when the API could not be reached at all (network error). */
  get isNetwork() {
    return this.status === 0;
  }
}
