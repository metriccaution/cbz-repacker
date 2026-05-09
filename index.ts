import { mkdir, readdir, lstat } from "node:fs/promises";
import { resolve } from "node:path";
import { repackage } from "./lib/repack";
import { createReadStream, createWriteStream } from "node:fs";

const sourceDir = Bun.argv[2];
const targetDir = Bun.argv[3];

if (!sourceDir) {
  throw new Error("No source directory provided");
}

if (!targetDir) {
  throw new Error("No target directory provided");
}

await mkdir(targetDir, { recursive: true });
for (const file of await readdir(sourceDir)) {
  const filePath = resolve(sourceDir, file);
  const stats = await lstat(filePath);
  if (!stats.isFile()) {
    continue;
  }

  if (!(filePath.endsWith(".cbz") || filePath.endsWith(".zip"))) {
    continue;
  }

  await repackage(
    createReadStream(filePath),
    createWriteStream(resolve(targetDir, file)),
  );
}
