import { NotFoundPage } from "@payloadcms/next/views";
import configPromise from "@payload-config";
import { importMap } from "../importMap";

type AdminParams = Promise<{ segments?: string[] }>;
type AdminSearchParams = Promise<Record<string, string | string[] | undefined>>;

export default function AdminNotFound({
  params,
  searchParams,
}: {
  params: AdminParams;
  searchParams: AdminSearchParams;
}) {
  return <NotFoundPage config={configPromise} importMap={importMap} params={params} searchParams={searchParams} />;
}
