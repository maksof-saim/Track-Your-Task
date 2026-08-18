export const ADMIN_EMAIL = (process.env.ADMIN_EMAIL ?? "saimsyed162@gmail.com").toLowerCase();

export function isAdminEmail(email: string): boolean {
  return email.toLowerCase() === ADMIN_EMAIL;
}
