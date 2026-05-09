import { describe, expect, it } from "bun:test";
import { createReadStream, createWriteStream } from "node:fs";
import { repackage } from "./lib";
import { Writable } from "node:stream";
import { join } from "node:path";

function createBufferWritable() {
  const chunks: Buffer[] = [];

  const stream = new Writable({
    write(chunk, _encoding, callback) {
      chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
      callback();
    },
  });

  return {
    stream,
    getBuffer: (): Buffer => Buffer.concat(chunks),
  };
}

describe("repackage", () => {
  it("should succeed when parsing a valid file", async () => {
    const { stream, getBuffer } = createBufferWritable();
    await expect(
      repackage(
        createReadStream(
          join(import.meta.dirname, "test-data", "Test File.cbz"),
        ),
        stream,
      ),
    ).resolves.toEqual(undefined);

    // Check for zip magic bytes
    const outputData = getBuffer();
    expect(outputData.subarray(0, 4)).toEqual(Buffer.from("504B0304", "hex"));
  });

  it("should fail when presented with a non-zip file", async () => {
    const { stream } = createBufferWritable();
    await expect(
      repackage(createReadStream(import.meta.filename), stream),
    ).rejects.toThrow();
  });
});
