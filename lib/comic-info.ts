const booleanFields = ["BlackAndWhite", "Manga"] as const;
const integerFields = ["Number", "Year", "Month", "Day"] as const;
const textFields = [
  "Title",
  "Series",
  "Volume",
  "Writer",
  "Summary",
  "Notes",
  "Penciller",
  "Inker",
  "Colorist",
  "Letterer",
  "CoverArtist",
  "Editor",
  "Publisher",
  "Imprint",
  "Genre",
  "AgeRating",
  "LanguageISO",
  "Web",
  "PageCount",
  "Format",
  "ScanInformation",
  "StoryArc",
  "Characters",
  "Teams",
] as const;

export type MetadataFields =
  | (typeof booleanFields)[number]
  | (typeof integerFields)[number]
  | (typeof textFields)[number];

export type ComicInfo = Partial<Record<MetadataFields, string>>;

const allFields: MetadataFields[] = [
  ...textFields,
  ...integerFields,
  ...booleanFields,
];

const normaliseText = (text: string): string => {
  return text.replaceAll(/\s+/gim, " ").trim();
};

const normaliseBoolean = (text: string): string => {
  const normal = normaliseText(text).toLowerCase();
  return normal === "true" ? "True" : "False";
};

const normaliseInteger = (text: string): string => {
  const trimmed = normaliseText(text);
  return /^\d+$/.test(trimmed) ? String(parseInt(trimmed, 10)) : "";
};

const normaliseFunction = (field: MetadataFields) => {
  if ((booleanFields as readonly string[]).includes(field)) {
    return normaliseBoolean;
  } else if ((integerFields as readonly string[]).includes(field)) {
    return normaliseInteger;
  } else {
    return normaliseText;
  }
};

/**
 * Parse the allow-listed values out of the `ComicInfo.xml` file, normalising,
 * and dropping any invalid properties.
 */
export function extractMetadata(xml: string): ComicInfo {
  const rewriter = new HTMLRewriter();
  const values: ComicInfo = {};

  for (const property of allFields) {
    rewriter.on(`ComicInfo > ${property}`, {
      text(tag) {
        const cleanedText = normaliseFunction(property)(tag.text);
        if (cleanedText) {
          values[property] = cleanedText;
        }
      },
    });
  }

  rewriter.transform(xml);

  return values;
}

function escapeXml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

/**
 * Write a consistent, minimal `ComicInfo.xml` file.
 */
export function createInfoXml(info: ComicInfo): string {
  const xmlLines = ['<?xml version="1.0" encoding="utf-8"?>', "<ComicInfo>"];
  for (const field of allFields) {
    if (!(field in info) || !info[field]) {
      continue;
    }

    xmlLines.push(
      `<${escapeXml(field)}>${escapeXml(normaliseFunction(field)(info[field]))}</${escapeXml(field)}>`,
    );
  }
  xmlLines.push("</ComicInfo>");
  return xmlLines.join("\n");
}

/**
 * Parse a `ComicInfo.xml`, read out the values, then re-write a normalised,
 * clean version of it.
 */
export function rewriteCbzFile(xml: string): string {
  return createInfoXml(extractMetadata(xml));
}
