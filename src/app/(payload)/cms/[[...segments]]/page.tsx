import type { Metadata } from "next";
import { RootPage, generatePageMetadata } from "@payloadcms/next/views";
import configPromise from "@payload-config";

type AdminParams = Promise<{ segments?: string[] }>;
type AdminSearchParams = Promise<Record<string, string | string[] | undefined>>;

type AdminPageProps = {
  params: AdminParams;
  searchParams: AdminSearchParams;
};

export async function generateMetadata({ params }: AdminPageProps): Promise<Metadata> {
  return (await generatePageMetadata({ config: configPromise, params })) as Metadata;
}

export default function AdminPage({ params, searchParams }: AdminPageProps) {
  return <RootPage config={configPromise} params={params} searchParams={searchParams} />;
}
