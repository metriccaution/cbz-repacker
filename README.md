# cbz-repacker

Take some untrusted CBZ files (images, typically comics, packed up in a zip file), and open them up, re-encoding the images within, and discarding any non-image content.

To install dependencies:

```bash
bun install
```

To run:

```bash
bun run index.ts ./untrusted/ ./cleaned/
```
