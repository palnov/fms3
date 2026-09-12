"use server";

import { handleServerFunctions as payloadHandleServerFunctions } from "@payloadcms/next/layouts";
import configPromise from "@payload-config";
import { importMap } from "../app/(payload)/cms/importMap";

type PayloadServerFunction = (args: unknown) => Promise<unknown>;

export async function handlePayloadServerFunctions(args: unknown): Promise<unknown> {
  const invocation = args && typeof args === "object" ? args as Record<string, unknown> : {};
  return (payloadHandleServerFunctions as PayloadServerFunction)({
    ...invocation,
    config: configPromise,
    importMap,
  });
}
