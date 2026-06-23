declare module "fontkit" {
  export type Font = {
    unitsPerEm: number;
    layout(text: string): GlyphRun;
  };

  export type GlyphRun = {
    advanceWidth: number;
    bbox: { minY: number; maxY: number };
    glyphs: Glyph[];
    positions: GlyphPosition[];
  };

  export type Glyph = {
    path: GlyphPath;
  };

  export type GlyphPosition = {
    xAdvance: number;
    xOffset: number;
    yOffset: number;
  };

  export type GlyphPath = {
    scale(scaleX: number, scaleY?: number): GlyphPath;
    translate(x: number, y: number): GlyphPath;
    toSVG(): string;
  };

  export function openSync(path: string): Font;
}
