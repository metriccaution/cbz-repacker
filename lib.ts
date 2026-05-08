import { open } from "yauzl";
import { ZipFile } from "yazl";
import { pipeline } from "node:stream/promises";
import { createWriteStream } from "node:fs";
import sharp from "sharp";

/**
 * Repackage one CBZ file into a new, cleaned up one.
 */
export async function repackage(
  sourcePath: string,
  targetPath: string,
): Promise<void> {
  const outputZip = new ZipFile();

  const zipPromise = pipeline(
    outputZip.outputStream,
    createWriteStream(targetPath),
  );

  return new Promise(async (resolve, reject) => {
    open(sourcePath, { lazyEntries: true }, (err, zipFile) => {
      if (err) {
        outputZip.end();
        return reject(err);
      }

      zipFile.on("entry", async (entry) => {
        if (entry.fileName.endsWith("/")) {
          zipFile.readEntry();
          return;
        }

        zipFile.openReadStream(entry, (err, readStream) => {
          if (err) {
            zipFile.close();
            outputZip.end();
            return reject(err);
          }

          outputZip.addReadStream(
            readStream.pipe(sharp().jpeg()),
            entry.fileName,
          );

          zipFile.readEntry();
        });
      });

      zipFile.once("end", function () {
        outputZip.end();
        zipFile.close();
        return resolve();
      });

      zipFile.readEntry();
    });

    await zipPromise;
  });
}
