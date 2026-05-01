import { spawnSync } from "node:child_process";

const commands = [
  ["build"],
  ["typecheck"],
  ["--filter", "@easyauth/frontend", "run", "check:svelte"],
  ["audit"]
];

const pnpmCli = process.env.npm_execpath;

if (!pnpmCli) {
  throw new Error("Unable to locate pnpm from npm_execpath.");
}

for (const args of commands) {
  const result = spawnSync(process.execPath, [pnpmCli, ...args], {
    stdio: "inherit"
  });

  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}
