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

  type PayloadRouteBuilder = (config: Promise<unknown>) => RouteHandler;

  export const REST_DELETE: PayloadRouteBuilder;
  export const REST_GET: PayloadRouteBuilder;
  export const REST_OPTIONS: PayloadRouteBuilder;
  export const REST_PATCH: PayloadRouteBuilder;
  export const REST_POST: PayloadRouteBuilder;
  export const REST_PUT: PayloadRouteBuilder;
}

declare module "@payloadcms/next/views" {
  import type { ComponentType } from "react";

  export const RootPage: ComponentType<Record<string, unknown>>;
  export const NotFoundPage: ComponentType<Record<string, unknown>>;
  export const generatePageMetadata: (args: Record<string, unknown>) => Promise<unknown>;
}
