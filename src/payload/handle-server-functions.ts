"use server";

import { handleServerFunctions as payloadHandleServerFunctions } from "@payloadcms/next/layouts";

type PayloadServerFunction = (args: unknown) => Promise<unknown>;

export async function handlePayloadServerFunctions(args: unknown): Promise<unknown> {
  return (payloadHandleServerFunctions as PayloadServerFunction)(args);
}
