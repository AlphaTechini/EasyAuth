import { readdirSync, readFileSync, statSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { pathToFileURL, fileURLToPath } from "node:url";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const compilerUrl = pathToFileURL(
  join(repoRoot, "packages/frontend/node_modules/svelte/compiler/index.js")
);
const compilerModule = await import(compilerUrl.href);
const compile = compilerModule.compile ?? compilerModule.default?.compile;
const targetDir = resolve(process.argv[2] ?? "packages/frontend/src/components");

if (typeof compile !== "function") {
  throw new Error("Unable to load the Svelte compiler.");
}
const svelteFiles = findSvelteFiles(targetDir);

for (const file of svelteFiles) {
  compile(readFileSync(file, "utf8"), {
    filename: file,
    generate: "client"
  });
}

console.log(`Compiled ${svelteFiles.length} Svelte components.`);

function findSvelteFiles(dir) {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    const stat = statSync(path);

    if (stat.isDirectory()) {
      return findSvelteFiles(path);
    }

    return path.endsWith(".svelte") ? [path] : [];
  });
}
