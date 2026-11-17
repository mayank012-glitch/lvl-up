import type { CSSProperties } from "react";

type LogoArtwork = {
  size: [number, number];
  bounds: [number, number, number, number];
  letterHeight: number;
};

// Optical measurements of the uploaded artwork, keyed by immutable image ID.
// Bounds exclude transparent margins only. Letter height measures a primary
// wordmark line, so stacked logos keep their lettering as legible as Imagicaa.
const artwork: Record<string, LogoArtwork> = {
  "54c2599e-d83f-460f-ab32-9888fd85a78d": { size: [4456, 1870], bounds: [0, 0, 4456, 1870], letterHeight: 4456 * 40 / 284 },
  "6a8d0474-979b-4f98-be11-8c2c0ac05064": { size: [1296, 864], bounds: [130, 176, 1166, 514], letterHeight: 175 },
  "b2c0499c-2e23-487d-8599-fccf171ef587": { size: [500, 500], bounds: [135, 185, 350, 299], letterHeight: 55 },
  "6e2a95c5-0409-4f7e-9c64-9a713f6fb56d": { size: [1080, 1080], bounds: [140, 321, 939, 748], letterHeight: 160 },
  "cb5b42d4-65c2-4123-bff2-6c4877d01bbe": { size: [1080, 1080], bounds: [52, 335, 1028, 744], letterHeight: 110 },
};

export function sponsorLogoLayout(image: string): CSSProperties | undefined {
  const art = artwork[image];
  if (!art) return undefined;
  const [left, top, right, bottom] = art.bounds;
  const width = right - left, height = bottom - top;
  const scale = 40 / art.letterHeight;
  return {
    "--logo-width": `${width * scale}px`,
    "--logo-height": `${height * scale}px`,
    "--logo-image-width": `${art.size[0] / width * 100}%`,
    "--logo-left": `${-left / width * 100}%`,
    "--logo-top": `${-top / height * 100}%`,
  } as CSSProperties;
}
