// basic regexes (support ranges 8-10, approximation ~, fractions, °F)
export const RE_MILE =
  /\b(~?\s*)?(\d+(?:[.,]\d+)?)(\s*[-–—]\s*(\d+(?:[.,]\d+)?))?\s*(mi|mile|miles)\b/g;

export const RE_MPH =
  /\b(~?\s*)?(\d+(?:[.,]\d+)?)(\s*[-–—]\s*(\d+(?:[.,]\d+)?))?\s*(mph)\b/g;

export const RE_FT =
  /\b(~?\s*)?(\d+(?:[.,]\d+)?)(\s*[-–—]\s*(\d+(?:[.,]\d+)?))?\s*(ft|feet)\b/g;

export const RE_IN = /(\d+(?:[.,]\d+)?)\s*(?:in|″|")\b/g; // simplified; word "in" as preposition is not touched - needs numeric context

export const RE_FLOZ =
  /\b(~?\s*)?(\d+(?:[.,]\d+)?)(\s*[-–—]\s*(\d+(?:[.,]\d+)?))?\s*(fl\.?\s*oz\.?|fluid\s+ounce|fluid\s+ounces)\b/g;

export const RE_OZ =
  /\b(~?\s*)?(\d+(?:[.,]\d+)?)(\s*[-–—]\s*(\d+(?:[.,]\d+)?))?\s*(oz\.?|ounce|ounces)(?!\s*\.)/g; // avoid fl.oz

export const RE_FAH = /\b(-?\d+(?:[.,]\d+)?)\s*°\s*F\b/g;

export function resetRegexIndices(): void {
  // reset global regex indices for safety
  RE_MILE.lastIndex = 0;
  RE_MPH.lastIndex = 0;
  RE_FT.lastIndex = 0;
  RE_IN.lastIndex = 0;
  RE_FLOZ.lastIndex = 0;
  RE_OZ.lastIndex = 0;
  RE_FAH.lastIndex = 0;
}