import fs from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { getDataDir } from "@/lib/runtime-config";

export const FEEDOT_FOLDER_NAME = "2e32560face91b58d22a63208af38c92";
export const FEEDOT_BUILD_FOLDER_NAME = "2e325";
export const FEEDOT_CONFIG_FOLDER_NAME = "60fac";
export const FEEDOT_SHARED_FOLDER_NAME = "0ff02e8ecb98e8b66ae44c2b729d0343";

export type FeedotDistribution = "siteRoot" | "shared" | "build" | "config" | "tmp";
export type FeedotAssetFolder = typeof FEEDOT_FOLDER_NAME | typeof FEEDOT_SHARED_FOLDER_NAME;

export function getFeedotStorageRoot() {
  return path.join(getDataDir(), "feedot");
}

export function getFeedotDirectories(): Record<FeedotDistribution, string> {
  const root = getFeedotStorageRoot();
  const working = path.join(root, FEEDOT_FOLDER_NAME);

  return {
    siteRoot: root,
    shared: path.join(root, FEEDOT_SHARED_FOLDER_NAME),
    build: path.join(working, FEEDOT_BUILD_FOLDER_NAME),
    config: path.join(working, FEEDOT_CONFIG_FOLDER_NAME),
    tmp: path.join(working, "tmp"),
  };
}

export async function ensureFeedotDirectories() {
  const directories = getFeedotDirectories();
  await Promise.all(
    Object.values(directories).map((directory) => fs.mkdir(directory, { recursive: true })),
  );
  return directories;
}

export function resolveFeedotPath(directory: string, relativePath: string) {
  const normalized = normalizeRelativePath(relativePath);
  const root = path.resolve(directory);
  const candidate = path.resolve(root, normalized);
  const rootPrefix = `${root}${path.sep}`;

  if (candidate !== root && !candidate.startsWith(rootPrefix)) {
    throw new Error("Invalid path");
  }

  return candidate;
}

export function resolveFeedotAssetPath(
  folderName: FeedotAssetFolder,
  segments: readonly string[],
) {
  const relativePath = segments.join("/");
  return resolveFeedotPath(
    path.join(getFeedotStorageRoot(), folderName),
    relativePath,
  );
}

export function normalizeRelativePath(value: string) {
  if (typeof value !== "string") {
    throw new Error("Invalid path");
  }

  const normalized = value.replaceAll("\\", "/");
  if (
    !normalized ||
    normalized.startsWith("/") ||
    /^[a-zA-Z]:\//.test(normalized) ||
    normalized.split("/").some((part) => !part || part === "." || part === "..")
  ) {
    throw new Error("Invalid path");
  }

  return normalized;
}

export async function pathExists(target: string) {
  try {
    await fs.lstat(target);
    return true;
  } catch {
    return false;
  }
}

export async function isRegularFile(target: string) {
  try {
    return (await fs.stat(target)).isFile();
  } catch {
    return false;
  }
}

export async function removeFeedotPath(target: string) {
  await fs.rm(target, { recursive: true, force: true });
}

export async function createFeedotTempDirectory() {
  const { tmp } = getFeedotDirectories();
  await fs.mkdir(tmp, { recursive: true });
  return fs.mkdtemp(path.join(tmp, "feedot-"));
}

export async function replaceFeedotPath(source: string, destination: string) {
  await fs.mkdir(path.dirname(destination), { recursive: true });

  const backup = `${destination}.${randomUUID()}.backup`;
  const destinationExists = await pathExists(destination);

  if (destinationExists) {
    await fs.rename(destination, backup);
  }

  try {
    await fs.rename(source, destination);
  } catch (error) {
    if (await pathExists(backup)) {
      await fs.rename(backup, destination);
    }
    throw error;
  }

  if (await pathExists(backup)) {
    await removeFeedotPath(backup);
  }
}

export async function clearFeedotDirectory(directory: string) {
  await fs.mkdir(directory, { recursive: true });
  const entries = await fs.readdir(directory);
  await Promise.all(
    entries.map((entry) => removeFeedotPath(path.join(directory, entry))),
  );
}

export async function listFeedotFiles(directory: string): Promise<string[]> {
  const entries = await fs.readdir(directory, { withFileTypes: true });
  const files: string[] = [];

  for (const entry of entries) {
    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await listFeedotFiles(fullPath)));
    } else if (entry.isFile()) {
      files.push(fullPath);
    }
  }

  return files;
}
