import type { AdapterExport } from "points-adapters/utils/adapter.ts";

import * as path from "@std/path";
import { walk } from "@std/fs";

const ADAPTERS_PATH = path.join(
  import.meta.dirname ?? "",
  "../",
  "points-adapters/",
  "adapters"
);

const DISABLED_ADAPTERS = ["henlo", "veda"];

const getAdapters = async (): Promise<Record<string, AdapterExport>> => {
  const adapters = (
    await Array.fromAsync(
      walk(ADAPTERS_PATH, {
        includeFiles: true,
        includeDirs: false,
      })
    )
  )
    .map((x) => path.basename(x.path, ".ts"))
    .filter((x) => !DISABLED_ADAPTERS.includes(x));

  const adapterImports: AdapterExport[] = await Promise.all(
    adapters.map(
      async (adapter) =>
        (
          await import(path.join(ADAPTERS_PATH, `${adapter}.ts`))
        ).default
    )
  );
  return Object.fromEntries(adapters.map((k, i) => [k, adapterImports[i]]));
};

let adapters: Record<string, AdapterExport> = {};
if (Object.keys(adapters).length === 0) adapters = await getAdapters();

export default adapters;
