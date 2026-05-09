import { fromBuffer } from "yauzl";
import { ZipFile } from "yazl";
import { pipeline } from "node:stream/promises";
import sharp from "sharp";
import type { Readable, Writable } from "node:stream";
import { Buffer } from "node:buffer";

/**
 * Repackage one CBZ file into a new, cleaned up one.
 */
export async function repackage(
  sourcePath: Readable,
  outputTo: Writable,
): Promise<void> {
  const outputZip = new ZipFile();

  const zipPromise = pipeline(outputZip.outputStream, outputTo);
  const sourceData = await streamToBuffer(sourcePath);

  return new Promise(async (resolve, reject) => {
    fromBuffer(sourceData, { lazyEntries: true }, (err, zipFile) => {
      if (err) {
        outputZip.end();
        return reject(err);
      }

      zipFile.on("entry", async (entry) => {
        try {
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

            try {
              outputZip.addReadStream(
                readStream.pipe(sharp().jpeg()),
                entry.fileName,
              );

              zipFile.readEntry();
            } catch (e) {
              reject(e);
            }
          });
        } catch (e) {
          reject(e);
        }
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

async function streamToBuffer(stream: Readable) {
  const chunks = [];

  for await (const chunk of stream) {
    chunks.push(typeof chunk === "string" ? Buffer.from(chunk) : chunk);
  }

  return Buffer.concat(chunks);
}
