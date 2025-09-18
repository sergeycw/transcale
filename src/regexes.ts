// Fraction pattern for reuse
const FRACTION_PATTERN = '[¼½¾⅐⅑⅒⅓⅔⅕⅖⅗⅘⅙⅚⅛⅜⅝⅞]|\\d+/\\d+';

// Number pattern with optional fractions
const NUMBER_WITH_FRACTION = `\\d+(?:[.,]\\d+)?(?:\\s*(?:${FRACTION_PATTERN}))?|(?:${FRACTION_PATTERN})`;

// basic regexes (support ranges 8-10, approximation ~, fractions, °F)
export const RE_MILE = new RegExp(
  `\\b(~?\\s*)?(${NUMBER_WITH_FRACTION})(\\s*[-–—]\\s*(${NUMBER_WITH_FRACTION}))?\\s*(mi|mile|miles)\\b`,
  'g'
);

export const RE_MPH = new RegExp(
  `\\b(~?\\s*)?(${NUMBER_WITH_FRACTION})(\\s*[-–—]\\s*(${NUMBER_WITH_FRACTION}))?\\s*(mph)\\b`,
  'g'
);

export const RE_FT = new RegExp(
  `\\b(~?\\s*)?(${NUMBER_WITH_FRACTION})(\\s*[-–—]\\s*(${NUMBER_WITH_FRACTION}))?\\s*(ft|feet)\\b`,
  'g'
);

export const RE_IN = new RegExp(
  `(${NUMBER_WITH_FRACTION})\\s*(?:in|″|")\\b`,
  'g'
);

export const RE_FLOZ = new RegExp(
  `\\b(~?\\s*)?(${NUMBER_WITH_FRACTION})(\\s*[-–—]\\s*(${NUMBER_WITH_FRACTION}))?\\s*(fl\\.?\\s*oz\\.?|fluid\\s+ounce|fluid\\s+ounces)\\b`,
  'g'
);

export const RE_OZ = new RegExp(
  `\\b(~?\\s*)?(${NUMBER_WITH_FRACTION})(\\s*[-–—]\\s*(${NUMBER_WITH_FRACTION}))?\\s*(oz\\.?|ounces|ounce)(?!\\s*\\.)`,
  'g'
);

export const RE_LB = new RegExp(
  `\\b(~?\\s*)?(${NUMBER_WITH_FRACTION})(\\s*[-–—]\\s*(${NUMBER_WITH_FRACTION}))?\\s*(lbs?\\.?|pounds|pound)\\b`,
  'g'
);

export const RE_FAH = new RegExp(
  `(-?${NUMBER_WITH_FRACTION})\\s*°\\s*F\\b`,
  'g'
);

// Feet and inches combinations like 5'10" or 5 ft 10 in
export const RE_FEET_INCHES = new RegExp(
  `\\b(${NUMBER_WITH_FRACTION})\\s*(?:'|ft|feet)\\s*(${NUMBER_WITH_FRACTION})\\s*(?:"|″|in|inch|inches)\\b`,
  'g'
);

// Dimensions like "12 x 8 in" or "3 × 2 ft"
export const RE_DIMENSIONS = new RegExp(
  `\\b(${NUMBER_WITH_FRACTION})\\s*[×x]\\s*(${NUMBER_WITH_FRACTION})(?:\\s*[×x]\\s*(${NUMBER_WITH_FRACTION}))?\\s*(in|inch|inches|ft|feet|cm|mm)\\b`,
  'g'
);

export function resetRegexIndices(): void {
  // reset global regex indices for safety
  RE_MILE.lastIndex = 0;
  RE_MPH.lastIndex = 0;
  RE_FT.lastIndex = 0;
  RE_IN.lastIndex = 0;
  RE_FLOZ.lastIndex = 0;
  RE_OZ.lastIndex = 0;
  RE_LB.lastIndex = 0;
  RE_FAH.lastIndex = 0;
  RE_FEET_INCHES.lastIndex = 0;
  RE_DIMENSIONS.lastIndex = 0;
}
