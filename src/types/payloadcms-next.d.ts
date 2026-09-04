declare module "@payloadcms/next/layouts" {
  import type { ComponentType, ReactNode } from "react";

  export const RootLayout: ComponentType<{
    children: ReactNode;
    config: Promise<unknown>;
    importMap?: unknown;
    serverFunction?: unknown;
  }>;
  export const handleServerFunctions: unknown;
}

declare module "@payloadcms/next/routes" {
  import type { RouteHandler } from "next";

  export const REST_DELETE: RouteHandler;
  export const REST_GET: RouteHandler;
  export const REST_OPTIONS: RouteHandler;
  export const REST_PATCH: RouteHandler;
  export const REST_POST: RouteHandler;
  export const REST_PUT: RouteHandler;
}

declare module "@payloadcms/next/views" {
  import type { ComponentType } from "react";

  export const RootPage: ComponentType<Record<string, unknown>>;
  export const NotFoundPage: ComponentType<Record<string, unknown>>;
  export const generatePageMetadata: (args: Record<string, unknown>) => Promise<unknown>;
}
