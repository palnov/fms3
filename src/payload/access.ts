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
export const canDeleteContent: Access = ({ req }: AccessArgs): boolean => hasRole(req.user, ["admin"]);
export const canCreateContent: Access = ({ req, data }) => {
  const role = getRole(req.user);
  if (role === "admin") return true;
  if (role !== "editor" || !data || typeof data !== "object" || Array.isArray(data)) return false;
  // A create request without `draft=true` is published by Payload by default.
  // Require the explicit draft marker so an editor cannot publish on create.
  return data._status === "draft";
};

function valuesEqual(left: unknown, right: unknown): boolean {
  if (Object.is(left, right)) return true;
  if (Array.isArray(left) || Array.isArray(right)) {
    return Array.isArray(left) && Array.isArray(right) && left.length === right.length && left.every((value, index) => valuesEqual(value, right[index]));
  }
  if (!left || !right || typeof left !== "object" || typeof right !== "object") return false;
  const leftRecord = left as Record<string, unknown>;
  const rightRecord = right as Record<string, unknown>;
  const keys = Object.keys(leftRecord);
  return keys.length === Object.keys(rightRecord).length && keys.every((key) => key in rightRecord && valuesEqual(leftRecord[key], rightRecord[key]));
}

async function canPublisherUpdate(req: AccessArgs["req"], id: AccessArgs["id"], data: Record<string, unknown>) {
  const collection = req.routeParams?.collection;
  const global = req.routeParams?.global;
  let current: unknown;

  try {
    if (typeof collection === "string" && id !== undefined) {
      current = await req.payload.findByID({ collection, id, depth: 0, draft: true, overrideAccess: true });
    } else if (typeof global === "string") {
      current = await req.payload.findGlobal({ slug: global, depth: 0, draft: true, overrideAccess: true });
    }
  } catch {
    return false;
  }

  if (!current || typeof current !== "object") return false;
  const currentRecord = current as Record<string, unknown>;
  return Object.entries(data)
    .filter(([key]) => key !== "_status")
    .every(([key, value]) => valuesEqual(value, currentRecord[key]));
}

export const canUpdateContent: Access = ({ req, data, id }) => {
  const role = getRole(req.user);
  if (role === "admin") return true;
  if (role === "editor") {
    // Payload does not pass bulk update data to access functions. Deny that
    // operation so an editor cannot publish a document through a bulk update.
    if (!data || typeof data !== "object") return false;
    if ("_status" in data && data._status === "published") return false;
    return true;
  }
  if (role === "publisher") {
    if (!data || typeof data !== "object") return false;
    const keys = Object.keys(data);
    if (!keys.includes("_status") || !["draft", "published"].includes(data._status)) return false;
    if (keys.every((key) => key === "_status")) return true;
    return canPublisherUpdate(req, id, data as Record<string, unknown>);
  }
  return false;
};

export const publishedOnly: Access = ({ req }): boolean | Where => {
  if (req.user) return true;
  return { _status: { equals: "published" } };
};
