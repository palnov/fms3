import { execFile } from "node:child_process";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { promisify } from "node:util";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  FEEDOT_UPDATER_VERSION,
  processFeedotPost,
} from "@/lib/feedot-updater";
import { FEEDOT_FOLDER_NAME } from "@/lib/feedot-storage";
import { GET as getFeedotAsset } from "@/app/2e32560face91b58d22a63208af38c92/[...path]/route";

const PRIVATE_NAME = "1eff21a67161e68d4476010680e0e7ba";
const PRIVATE_KEY = "41f4d0dbc4814826102ea6c36e1ce94c";
const execFileAsync = promisify(execFile);

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

function payload(actions: unknown[], privateKey = PRIVATE_KEY) {
  return { [PRIVATE_NAME]: privateKey, actions };
}

async function withDataDirectory<T>(callback: (dataDirectory: string) => Promise<T>) {
  const dataDirectory = await fs.mkdtemp(path.join(os.tmpdir(), "fms3-feedot-"));
  vi.stubEnv("DATA_DIR", dataDirectory);

  try {
    return await callback(dataDirectory);
  } finally {
    await fs.rm(dataDirectory, { recursive: true, force: true });
  }
}

describe("Feedot updater protocol", () => {
  it("validates and prepares persistent Feedot storage", async () => {
    await withDataDirectory(async (dataDirectory) => {
      const response = await processFeedotPost(payload([{ method: "validate", params: {} }]));
      const actionResult = (response.payload as Array<{ result: { data: Record<string, unknown> } }>)[0].result;

      expect(response.status).toBe(200);
      expect(actionResult.data).toMatchObject({
        version: FEEDOT_UPDATER_VERSION,
        siteRootWritable: true,
        folderExists: true,
        buildFolderExists: true,
      });
      await expect(fs.stat(path.join(dataDirectory, "feedot", FEEDOT_FOLDER_NAME))).resolves.toBeTruthy();
    });
  });

  it("rejects an invalid private key", async () => {
    const response = await processFeedotPost(payload([], "invalid"));

    expect(response.status).toBe(403);
    expect(response.payload).toEqual({ error: "invalidRequest", message: "Data is not valid" });
  });

  it("rejects unknown actions before execution", async () => {
    await withDataDirectory(async () => {
      const response = await processFeedotPost(payload([{ method: "unknown", params: {} }]));

      expect(response.status).toBe(403);
      expect(response.payload).toEqual({ error: "invalidMethod", message: "Method is not valid" });
    });
  });

  it("rejects file paths outside the Feedot storage root", async () => {
    await withDataDirectory(async () => {
      const response = await processFeedotPost(payload([{
        method: "downloadFile",
        params: {
          url: "https://info-static.ru/widget.js",
          dist: "siteRoot",
          fileName: "../outside.js",
        },
      }]));

      expect(response.status).toBe(400);
      expect(response.payload).toMatchObject({
        error: "executeError",
        data: [{ result: { status: "error", error: "exception" } }],
      });
    });
  });

  it("downloads and serves a local widget asset", async () => {
    await withDataDirectory(async () => {
      const fetchMock = vi.fn(async () => new Response("window.feedotLoaded = true;", { status: 200 }));
      vi.stubGlobal("fetch", fetchMock);

      const updaterResponse = await processFeedotPost(payload([{
        method: "downloadFile",
        params: {
          url: "https://info-static.ru/widget.js",
          dist: "build",
          fileName: "init.js",
        },
      }]));

      const assetResponse = await getFeedotAsset(
        new Request("https://ufms-help.ru/2e32560face91b58d22a63208af38c92/2e325/init.js"),
        { params: Promise.resolve({ path: ["2e325", "init.js"] }) },
      );

      expect(updaterResponse.status).toBe(200);
      expect(fetchMock).toHaveBeenCalledOnce();
      expect(assetResponse.status).toBe(200);
      await expect(assetResponse.text()).resolves.toBe("window.feedotLoaded = true;");
    });
  });

  it("installs a tar bundle atomically", async () => {
    await withDataDirectory(async (dataDirectory) => {
      const sourceDirectory = await fs.mkdtemp(path.join(os.tmpdir(), "fms3-feedot-tar-"));
      const archivePath = path.join(dataDirectory, "widget.tar");
      await fs.writeFile(path.join(sourceDirectory, "init.js"), "window.feedotTarLoaded = true;");

      try {
        await execFileAsync("tar", ["-cf", archivePath, "-C", sourceDirectory, "."]);
        const archive = await fs.readFile(archivePath);
        vi.stubGlobal("fetch", vi.fn(async () => new Response(archive, { status: 200 })));

        const response = await processFeedotPost(payload([{
          method: "downloadTarFile",
          params: {
            url: "https://info-static.ru/widget.tar",
            dist: "build",
          },
        }]));

        expect(response.status).toBe(200);
        await expect(
          fs.readFile(path.join(dataDirectory, "feedot", FEEDOT_FOLDER_NAME, "2e325", "init.js"), "utf8"),
        ).resolves.toBe("window.feedotTarLoaded = true;");
      } finally {
        await fs.rm(sourceDirectory, { recursive: true, force: true });
      }
    });
  });
});
