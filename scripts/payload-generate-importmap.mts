import path from "node:path";
import { pathToFileURL } from "node:url";

const { generateImportMap } = await import(pathToFileURL(path.resolve("node_modules/payload/dist/bin/generateImportMap/index.js")).href);

const { default: configPromise } = await import("../src/payload.config.mjs");
const config = await configPromise;

await generateImportMap(config, { force: true });
