import { execFile } from "node:child_process";
import { createHash } from "node:crypto";
import { constants } from "node:fs";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { promisify } from "node:util";
import {
  clearFeedotDirectory,
  createFeedotTempDirectory,
  ensureFeedotDirectories,
  FEEDOT_BUILD_FOLDER_NAME,
  FEEDOT_CONFIG_FOLDER_NAME,
  FEEDOT_FOLDER_NAME,
  FEEDOT_SHARED_FOLDER_NAME,
  getFeedotDirectories,
  isRegularFile,
  listFeedotFiles,
  normalizeRelativePath,
  removeFeedotPath,
  replaceFeedotPath,
  resolveFeedotPath,
  type FeedotDistribution,
} from "@/lib/feedot-storage";

const execFileAsync = promisify(execFile);

export const FEEDOT_UPDATER_VERSION = "0.1.0";
export const FEEDOT_UPDATER_HASH = "c74e8c88b1ecee6f228961b7069cd612";
export const FEEDOT_UPDATER_FILE_MD5 = "98c814673177c0da9fa117012264151c";

const PRIVATE_NAME = "1eff21a67161e68d4476010680e0e7ba";
const PRIVATE_KEY = process.env.FEEDOT_PRIVATE_KEY?.trim() || "41f4d0dbc4814826102ea6c36e1ce94c";
const ALLOWED_HOSTS = [
  "feedot.com",
  "info-static.ru",
  "cloud-cdn.ru",
  "pravoved.ru",
  "info-app.ru",
  "info-app2.ru",
  "info-app5shs.ru",
];
const MAX_DOWNLOAD_SIZE = 100 * 1024 * 1024;
const DOWNLOAD_TIMEOUT_MS = 60_000;
const ARCHIVE_TIMEOUT_MS = 120_000;

type JsonRecord = Record<string, unknown>;
type FeedotAction = { method: string; params: unknown };

export type FeedotResponse = {
  status: number;
  payload: unknown;
};

class FeedotError extends Error {
  constructor(message: string, public readonly data: unknown = null) {
    super(message);
    this.name = "FeedotError";
  }
}

function isRecord(value: unknown): value is JsonRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function requireRecord(value: unknown, message = "Invalid params") {
  if (!isRecord(value)) {
    throw new FeedotError(message);
  }
  return value;
}

function requireString(value: unknown, message = "Invalid params") {
  if (typeof value !== "string" || !value) {
    throw new FeedotError(message);
  }
  return value;
}

function requireDistribution(value: unknown, allowed: readonly FeedotDistribution[]) {
  if (typeof value !== "string" || !allowed.includes(value as FeedotDistribution)) {
    throw new FeedotError("Invalid params");
  }
  return value as FeedotDistribution;
}

function requireFileName(value: unknown) {
  try {
    return normalizeRelativePath(requireString(value));
  } catch {
    throw new FeedotError("Invalid params");
  }
}

function parseRequestPayload(payload: unknown) {
  if (!isRecord(payload) || !Array.isArray(payload.actions) || typeof payload[PRIVATE_NAME] !== "string") {
    return null;
  }

  const actions: FeedotAction[] = [];
  for (const action of payload.actions) {
    if (!isRecord(action) || typeof action.method !== "string" || !("params" in action)) {
      return null;
    }
    actions.push({ method: action.method, params: action.params });
  }

  return {
    privateKey: payload[PRIVATE_NAME],
    actions,
  };
}

function errorPayload(message: string) {
  return { error: "invalidRequest", message };
}

function serializeActionError(error: unknown) {
  if (error instanceof FeedotError) {
    return {
      status: "error",
      error: "exception",
      message: error.message,
      data: error.data,
      trace: [],
    };
  }

  return {
    status: "error",
    error: "exception",
    message: error instanceof Error ? error.message : "Unknown error",
    trace: [],
  };
}

function getActionMethod(method: string) {
  const methods: Record<string, string> = {
    validate: "validate",
    showfiles: "showFiles",
    downloadfile: "downloadFile",
    downloadfilesset: "downloadFilesSet",
    downloadtarfile: "downloadTarFile",
    clear: "clear",
    updateself: "updateSelf",
  };
  return methods[method.toLowerCase()];
}

async function isWritable(directory: string) {
  try {
    await fs.access(directory, constants.W_OK);
    return true;
  } catch {
    return false;
  }
}

function getOperatingSystem() {
  switch (process.platform) {
    case "darwin":
      return "Darwin";
    case "win32":
      return "WINNT";
    default:
      return "Linux";
  }
}

function md5(value: Buffer) {
  return createHash("md5").update(value).digest("hex");
}

async function md5File(filePath: string) {
  return md5(await fs.readFile(filePath));
}

async function validateAction() {
  const directories = await ensureFeedotDirectories();
  const [updaterHashSum, siteRootWritable, sharedFolderWritable, folderWritable, tmpFolderWritable, buildFolderWritable, configFolderWritable] = await Promise.all([
    Promise.resolve(FEEDOT_UPDATER_FILE_MD5),
    isWritable(directories.siteRoot),
    isWritable(directories.shared),
    isWritable(path.join(directories.siteRoot, FEEDOT_FOLDER_NAME)),
    isWritable(directories.tmp),
    isWritable(directories.build),
    isWritable(directories.config),
  ]);

  return {
    status: "success",
    data: {
      version: FEEDOT_UPDATER_VERSION,
      updaterHash: FEEDOT_UPDATER_HASH,
      sharedFolderName: FEEDOT_SHARED_FOLDER_NAME,
      folderName: FEEDOT_FOLDER_NAME,
      configFolderName: FEEDOT_CONFIG_FOLDER_NAME,
      buildFolderName: FEEDOT_BUILD_FOLDER_NAME,
      sharedFolderExists: true,
      folderExists: true,
      tmpFolderExists: true,
      buildFolderExists: true,
      configFolderExists: true,
      siteRootWritable,
      sharedFolderWritable,
      folderWritable,
      tmpFolderWritable,
      buildFolderWritable,
      configFolderWritable,
      os: getOperatingSystem(),
      osVersion: os.release(),
      phpVersion: "node",
      fileUploadMaxSize: -1,
      memoryLimit: -1,
      extensions: ["node"],
      updaterHashSum,
    },
  };
}

async function showFilesAction(rawParams: unknown) {
  const params = requireRecord(rawParams);
  const distribution = requireDistribution(params.dist, ["shared", "build", "config", "tmp"]);
  const files = await listFeedotFiles(getFeedotDirectories()[distribution]);
  const hashes: Record<string, string> = {};

  for (const file of files) {
    hashes[file] = await md5File(file);
  }

  return {
    status: "success",
    data: { files: hashes },
  };
}

function validateDownloadUrl(rawUrl: unknown) {
  const value = requireString(rawUrl);
  let url: URL;

  try {
    url = new URL(value);
  } catch {
    throw new FeedotError("Can't download file", { url: value, error: "invalidHost" });
  }

  const host = url.hostname.toLowerCase();
  const allowed = ALLOWED_HOSTS.some((allowedHost) => host === allowedHost || host.endsWith(`.${allowedHost}`));
  if (!allowed || !["http:", "https:"].includes(url.protocol)) {
    throw new FeedotError("Can't download file", { url: value, error: "invalidHost" });
  }

  return url;
}

async function downloadRemote(rawUrl: unknown) {
  const url = validateDownloadUrl(rawUrl);
  let response: Response;

  try {
    response = await fetch(url, {
      redirect: "error",
      signal: AbortSignal.timeout(DOWNLOAD_TIMEOUT_MS),
    });
  } catch (error) {
    throw new FeedotError("Can't download file", {
      url: url.toString(),
      errorMessage: error instanceof Error ? error.message : "Request failed",
    });
  }

  if (!response.ok) {
    throw new FeedotError("Can't download file", {
      url: url.toString(),
      httpCode: response.status,
    });
  }

  if (response.url) {
    validateDownloadUrl(response.url);
  }

  const buffer = Buffer.from(await response.arrayBuffer());
  if (buffer.length > MAX_DOWNLOAD_SIZE) {
    throw new FeedotError("Can't download file", {
      url: url.toString(),
      errorMessage: "Downloaded file is too large",
    });
  }

  return {
    success: true,
    httpCode: response.status,
    hash: md5(buffer),
    buffer,
  };
}

function verifyHash(params: JsonRecord, actualHash: string) {
  if (params.verify && typeof params.hash === "string" && params.hash && params.hash !== actualHash) {
    throw new FeedotError("Hash sum of downloaded file not match", {
      verify: false,
      hash: params.hash,
      actualHash,
    });
  }
}

async function downloadFileAction(rawParams: unknown) {
  const params = requireRecord(rawParams);
  const distribution = requireDistribution(params.dist, ["siteRoot", "shared", "build", "config"]);
  const fileName = requireFileName(params.fileName);
  const destination = resolveFeedotPath(getFeedotDirectories()[distribution], fileName);
  const fileExists = await isRegularFile(destination);
  const result: JsonRecord = {
    url: params.url,
    filePath: destination,
    fileExists,
    skip: null,
    verify: null,
    tmpFile: null,
  };

  if (params.useCache && typeof params.hash === "string" && params.hash && fileExists) {
    if ((await md5File(destination)) === params.hash) {
      result.skip = true;
      return { status: "success", data: result };
    }
    result.skip = false;
  }

  const temporaryDirectory = await createFeedotTempDirectory();
  const temporaryFile = path.join(temporaryDirectory, path.basename(fileName));

  try {
    const downloaded = await downloadRemote(params.url);
    verifyHash(params, downloaded.hash);
    await fs.writeFile(temporaryFile, downloaded.buffer);
    result.tmpFile = {
      success: true,
      httpCode: downloaded.httpCode,
      tmpFilePath: temporaryFile,
      hash: downloaded.hash,
    };
    if (params.verify && params.hash) {
      result.verify = true;
    }
    await replaceFeedotPath(temporaryFile, destination);
    await removeFeedotPath(temporaryDirectory);
  } catch (error) {
    await removeFeedotPath(temporaryDirectory);
    throw error;
  }

  return { status: "success", data: result };
}

async function downloadFilesSetAction(rawParams: unknown) {
  const params = requireRecord(rawParams);
  const distribution = requireDistribution(params.dist, ["shared", "build", "config"]);
  if (!Array.isArray(params.files)) {
    throw new FeedotError("Invalid params");
  }

  const files = params.files.map((rawFile) => {
    const file = requireRecord(rawFile);
    return {
      url: requireString(file.url),
      fileName: requireFileName(file.fileName),
      hash: file.hash,
    };
  });
  const temporaryFolder = await createFeedotTempDirectory();
  const downloadedFiles: JsonRecord[] = [];

  try {
    for (const file of files) {
      const downloaded = await downloadRemote(file.url);
      if (params.verify && typeof file.hash === "string" && file.hash && file.hash !== downloaded.hash) {
        throw new FeedotError("Hash sum of downloaded file not match", {
          url: file.url,
          verify: false,
          hash: file.hash,
          actualHash: downloaded.hash,
          downloadedFiles,
        });
      }

      const temporaryFile = resolveFeedotPath(temporaryFolder, file.fileName);
      await fs.mkdir(path.dirname(temporaryFile), { recursive: true });
      await fs.writeFile(temporaryFile, downloaded.buffer);
      downloadedFiles.push({
        url: file.url,
        verify: params.verify && file.hash ? true : null,
        tmpFile: {
          success: true,
          httpCode: downloaded.httpCode,
          tmpFilePath: temporaryFile,
          hash: downloaded.hash,
        },
      });
    }

    await replaceFeedotPath(temporaryFolder, getFeedotDirectories()[distribution]);
  } catch (error) {
    await removeFeedotPath(temporaryFolder);
    throw error;
  }

  return {
    status: "success",
    data: { files: downloadedFiles },
  };
}

async function downloadTarFileAction(rawParams: unknown) {
  const params = requireRecord(rawParams);
  const distribution = requireDistribution(params.dist, ["shared", "build", "config"]);
  const temporaryDirectory = await createFeedotTempDirectory();
  const archivePath = path.join(temporaryDirectory, "feedot-archive.tar");
  const extractDirectory = path.join(temporaryDirectory, "extract");
  const result: JsonRecord = {
    url: params.url,
    filePath: getFeedotDirectories()[distribution],
    verify: null,
    tmpFile: null,
  };

  try {
    const downloaded = await downloadRemote(params.url);
    verifyHash(params, downloaded.hash);
    await fs.writeFile(archivePath, downloaded.buffer);
    result.tmpFile = {
      success: true,
      httpCode: downloaded.httpCode,
      tmpFilePath: archivePath,
      hash: downloaded.hash,
    };
    if (params.verify && params.hash) {
      result.verify = true;
    }

    await validateArchiveEntries(archivePath);
    await fs.mkdir(extractDirectory, { recursive: true });
    await execFileAsync("tar", ["-xf", archivePath, "-C", extractDirectory], {
      timeout: ARCHIVE_TIMEOUT_MS,
      maxBuffer: 1024 * 1024,
    });
    await assertNoSymlinks(extractDirectory);
    await removeFeedotPath(archivePath);
    await replaceFeedotPath(extractDirectory, getFeedotDirectories()[distribution]);
  } catch (error) {
    await removeFeedotPath(temporaryDirectory);
    throw error;
  }

  await removeFeedotPath(temporaryDirectory);
  return { status: "success", data: result };
}

async function validateArchiveEntries(archivePath: string) {
  const { stdout } = await execFileAsync("tar", ["-tf", archivePath], {
    timeout: ARCHIVE_TIMEOUT_MS,
    maxBuffer: 1024 * 1024,
  });

  for (const entry of stdout.split(/\r?\n/).filter(Boolean)) {
    const normalized = entry.replaceAll("\\", "/");
    if (
      normalized.startsWith("/") ||
      /^[a-zA-Z]:\//.test(normalized) ||
      normalized.split("/").includes("..")
    ) {
      throw new FeedotError("Can't extract file", { entry });
    }
  }
}

async function assertNoSymlinks(directory: string): Promise<void> {
  const entries = await fs.readdir(directory, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(directory, entry.name);
    if (entry.isSymbolicLink()) {
      throw new FeedotError("Can't extract file", { entry: entry.name });
    }
    if (entry.isDirectory()) {
      await assertNoSymlinks(fullPath);
    }
  }
}

async function clearAction(rawParams: unknown) {
  const params = requireRecord(rawParams);
  const distribution = requireDistribution(params.dist, ["tmp", "shared", "build", "config"]);
  const directory = getFeedotDirectories()[distribution];
  await clearFeedotDirectory(directory);

  return {
    status: "success",
    data: { dist: directory },
  };
}

async function dispatchAction(method: string, params: unknown) {
  switch (method) {
    case "validate":
      return validateAction();
    case "showFiles":
      return showFilesAction(params);
    case "downloadFile":
      return downloadFileAction(params);
    case "downloadFilesSet":
      return downloadFilesSetAction(params);
    case "downloadTarFile":
      return downloadTarFileAction(params);
    case "clear":
      return clearAction(params);
    case "updateSelf":
      throw new FeedotError("Current file is not an update file");
    default:
      throw new FeedotError("Method is not valid");
  }
}

export async function processFeedotPost(payload: unknown): Promise<FeedotResponse> {
  const request = parseRequestPayload(payload);
  if (!request) {
    return { status: 403, payload: errorPayload("Data is not valid") };
  }

  if (request.privateKey !== PRIVATE_KEY) {
    return { status: 403, payload: errorPayload("Data is not valid") };
  }

  try {
    await ensureFeedotDirectories();
  } catch (error) {
    return {
      status: 400,
      payload: {
        error: "executeError",
        message: "Unable to prepare Feedot storage",
        data: serializeActionError(error),
      },
    };
  }

  const result: JsonRecord[] = [];
  let hasError = false;

  for (const action of request.actions) {
    const method = getActionMethod(action.method);
    if (!method) {
      return { status: 403, payload: { error: "invalidMethod", message: "Method is not valid" } };
    }

    try {
      result.push({
        action,
        result: await dispatchAction(method, action.params),
      });
    } catch (error) {
      hasError = true;
      result.push({
        action,
        result: serializeActionError(error),
      });
    }
  }

  if (hasError) {
    return {
      status: 400,
      payload: {
        error: "executeError",
        message: "One or more actions failed",
        data: result,
      },
    };
  }

  return { status: 200, payload: result };
}
