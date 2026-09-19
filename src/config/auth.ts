export const ADMIN_AUTH_CONFIG = {
  // Default fallback passcode for self-registering as administrator
  DEFAULT_ADMIN_KEY: "admin123",

  /**
   * Retrieves the current Admin Registration Key from environment or falls back to default.
   */
  getAdminRegistrationKey(): string {
    const key =
      process.env.NEXT_PUBLIC_ADMIN_REGISTRATION_KEY ||
      process.env.ADMIN_REGISTRATION_KEY;
    if (key && key.trim()) {
      return key.trim();
    }
    return this.DEFAULT_ADMIN_KEY;
  },
};
