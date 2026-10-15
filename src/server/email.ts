import "server-only";

/**
 * Transactional email is not connected yet. When a provider is added
 * (e.g. Resend, Postmark, SES), implement sending in this module and flip
 * this flag. Until then the UI tells users plainly that reset emails cannot
 * be delivered, and reset links are written to the server log.
 */
export const emailConfigured = false;
