import type { Access, AccessArgs, Where } from "payload";

export type PayloadRole = "admin" | "editor" | "publisher";

function getRole(user: unknown): PayloadRole | undefined {
  if (!user || typeof user !== "object" || !("role" in user)) return undefined;
  const role = (user as { role?: unknown }).role;
  return role === "admin" || role === "editor" || role === "publisher" ? role : undefined;
}

export function hasRole(user: unknown, roles: PayloadRole[]) {
  const role = getRole(user);
  return role !== undefined && roles.includes(role);
}

export const canAccessAdmin = ({ req }: AccessArgs): boolean => hasRole(req.user, ["admin", "editor", "publisher"]);
export const canEditContent = ({ req }: AccessArgs): boolean => hasRole(req.user, ["admin", "editor"]);
export const canPublishContent = ({ req }: AccessArgs): boolean => hasRole(req.user, ["admin", "publisher"]);
export const canManageUsers = ({ req }: AccessArgs): boolean => hasRole(req.user, ["admin"]);

export const publishedOnly: Access = ({ req }): boolean | Where => {
  if (req.user) return true;
  return { _status: { equals: "published" } };
};
