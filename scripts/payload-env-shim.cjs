const Module = require("node:module");
const originalLoad = Module._load;

Module._load = function loadWithNextEnvInterop(request, parent, isMain) {
  const loaded = originalLoad.call(this, request, parent, isMain);
  if (request === "@next/env" && loaded && loaded.__esModule && !loaded.default) {
    return { ...loaded, default: loaded, __esModule: false };
  }
  return loaded;
};
