import { describe, expect, it } from "bun:test";
import { createInfoXml, extractMetadata } from "./comic-info";

describe("extractMetadata", () => {
  it("should parse an input correctly", () => {
    expect(
      extractMetadata(`<?xml version="1.0" encoding="utf-8"?>
        <ComicInfo>
            <Title>My Comic</Title>
            <Series>My Series</Series>
            <Number>1</Number>
            <Writer>John Doe</Writer>
            <Publisher>Example Publisher</Publisher>
            <Summary>This is the                first issue.</Summary>
            <Year>2026</Year>
            <Month>05</Month>
            <Genre>Action</Genre>
            <Manga>true</Manga>
            <BlackAndWhite>Cheese</BlackAndWhite>
        </ComicInfo>`),
    ).toEqual({
      BlackAndWhite: "False",
      Genre: "Action",
      Manga: "False",
      Month: "5",
      Number: "1",
      Publisher: "Example Publisher",
      Series: "My Series",
      Summary: "This is the first issue.",
      Title: "My Comic",
      Writer: "John Doe",
      Year: "2026",
    });
  });

  it("should handle an empty file", () => {
    expect(extractMetadata("")).toEqual({});
  });
});

describe("createInfoXml", () => {
  it("should create a valid XML output", () => {
    expect(
      createInfoXml({
        BlackAndWhite: "False",
        Genre: "Action",
        Manga: "False",
        Month: "5",
        Number: "1",
        Publisher: "Example Publisher",
        Series: "My Series",
        Summary: "This is the first issue.",
        Title: "My Comic",
        Writer: "John Doe",
        Year: "2026",
      }),
    ).toBe(`<?xml version="1.0" encoding="utf-8"?>
<ComicInfo>
<Title>My Comic</Title>
<Series>My Series</Series>
<Writer>John Doe</Writer>
<Summary>This is the first issue.</Summary>
<Publisher>Example Publisher</Publisher>
<Genre>Action</Genre>
<Number>1</Number>
<Year>2026</Year>
<Month>5</Month>
<BlackAndWhite>False</BlackAndWhite>
<Manga>False</Manga>
</ComicInfo>`);
  });

  it("should handle empty data", () => {
    expect(createInfoXml({})).toBe(`<?xml version="1.0" encoding="utf-8"?>
<ComicInfo>
</ComicInfo>`);
  });

  it("should escape XML special characters", () => {
    expect(createInfoXml({ Title: "<other>Hello", Genre: "!<--" }))
      .toBe(`<?xml version="1.0" encoding="utf-8"?>
<ComicInfo>
<Title>&lt;other&gt;Hello</Title>
<Genre>!&lt;--</Genre>
</ComicInfo>`);
  });
});
