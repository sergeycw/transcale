import {
  MI_TO_KM,
  MPH_TO_KMH,
  FT_TO_M,
  IN_TO_CM,
  FLOZ_TO_ML,
  OZ_TO_G,
  LB_TO_KG,
} from './constants';
import { nf, nf1, rangeFormat } from './formatters';
import { toNumber, hasExistingConversion } from './utils';
import {
  RE_MILE,
  RE_MPH,
  RE_FT,
  RE_IN,
  RE_FLOZ,
  RE_OZ,
  RE_LB,
  RE_FAH,
  RE_FEET_INCHES,
  RE_DIMENSIONS,
  resetRegexIndices,
} from './regexes';

export function convertInText(str: string): string {
  let out = str;

  resetRegexIndices();

  // Miles to kilometers
  out = out.replace(RE_MILE, (m, approx, a, dash, b) => {
    if (hasExistingConversion(str, m)) return m;
    const v1 = toNumber(a);
    if (v1 == null) return m;
    if (b != null) {
      const v2 = toNumber(b);
      if (v2 == null) return m;
      const k1 = v1 * MI_TO_KM,
        k2 = v2 * MI_TO_KM;
      return `${m} (${rangeFormat(k1, k2, 'km')})`;
    } else {
      const km = v1 * MI_TO_KM;
      return `${m} (${nf.format(km)} km)`;
    }
  });

  // Miles per hour to kilometers per hour
  out = out.replace(RE_MPH, (m, approx, a, dash, b) => {
    const v1 = toNumber(a);
    if (v1 == null) return m;
    if (b != null) {
      const v2 = toNumber(b);
      if (v2 == null) return m;
      const k1 = v1 * MPH_TO_KMH,
        k2 = v2 * MPH_TO_KMH;
      return `${m} (${rangeFormat(k1, k2, 'km/h')})`;
    } else {
      const kmh = v1 * MPH_TO_KMH;
      return `${m} (${nf.format(kmh)} km/h)`;
    }
  });

  // Feet to meters
  out = out.replace(RE_FT, (m, approx, a, dash, b) => {
    if (hasExistingConversion(str, m)) return m;
    const v1 = toNumber(a);
    if (v1 == null) return m;
    if (b != null) {
      const v2 = toNumber(b);
      if (v2 == null) return m;
      const k1 = v1 * FT_TO_M,
        k2 = v2 * FT_TO_M;
      return `${m} (${rangeFormat(k1, k2, 'm')})`;
    } else {
      const meters = v1 * FT_TO_M;
      return `${m} (${nf.format(meters)} m)`;
    }
  });

  // Inches to centimeters
  out = out.replace(RE_IN, (m, a) => {
    const v = toNumber(a);
    if (v == null) return m;
    const cm = v * IN_TO_CM;
    return `${m} (${nf.format(cm)} cm)`;
  });

  // Fluid ounces to milliliters
  out = out.replace(RE_FLOZ, (m, approx, a, dash, b) => {
    const v1 = toNumber(a);
    if (v1 == null) return m;
    if (b != null) {
      const v2 = toNumber(b);
      if (v2 == null) return m;
      const ml1 = v1 * FLOZ_TO_ML,
        ml2 = v2 * FLOZ_TO_ML;
      return `${m} (${rangeFormat(ml1, ml2, 'ml')})`;
    } else {
      const ml = v1 * FLOZ_TO_ML;
      return `${m} (${nf.format(ml)} ml)`;
    }
  });

  // Ounces to grams
  out = out.replace(RE_OZ, (m, approx, a, dash, b) => {
    const v1 = toNumber(a);
    if (v1 == null) return m;
    if (b != null) {
      const v2 = toNumber(b);
      if (v2 == null) return m;
      const g1 = v1 * OZ_TO_G,
        g2 = v2 * OZ_TO_G;
      return `${m} (${rangeFormat(g1, g2, 'g')})`;
    } else {
      const g = v1 * OZ_TO_G;
      return `${m} (${nf.format(g)} g)`;
    }
  });

  // Pounds to kilograms
  out = out.replace(RE_LB, (m, approx, a, dash, b) => {
    if (hasExistingConversion(str, m)) return m;
    const v1 = toNumber(a);
    if (v1 == null) return m;
    if (b != null) {
      const v2 = toNumber(b);
      if (v2 == null) return m;
      const kg1 = v1 * LB_TO_KG,
        kg2 = v2 * LB_TO_KG;
      return `${m} (${rangeFormat(kg1, kg2, 'kg')})`;
    } else {
      const kg = v1 * LB_TO_KG;
      return `${m} (${nf.format(kg)} kg)`;
    }
  });

  // Fahrenheit to Celsius
  out = out.replace(RE_FAH, (m, f) => {
    const v = toNumber(f);
    if (v == null) return m;
    const c = ((v - 32) * 5) / 9;
    return `${m} (${nf1.format(c)} °C)`;
  });

  // Feet and inches combinations
  out = out.replace(RE_FEET_INCHES, (match, ...args) => {
    return convertFeetInches(out, [match, ...args] as RegExpMatchArray);
  });

  // Dimensions
  out = out.replace(RE_DIMENSIONS, (match, ...args) => {
    return convertDimensions(out, [match, ...args] as RegExpMatchArray);
  });

  // Compound units
  out = convertPoundOunce(out);
  out = convertFootInch(out);

  // Miles per gallon to liters per 100km
  out = convertMPG(out);

  return out;
}

// Convert feet and inches to meters
function convertFeetInches(
  text: string,
  match: RegExpMatchArray
): string {
  const feet = toNumber(match[1]);
  const inches = toNumber(match[2]);

  if (feet === null || inches === null) return text;

  const totalInches = feet * 12 + inches;
  const meters = totalInches * IN_TO_CM * 0.01;

  if (meters >= 1) {
    return text.replace(match[0], `${match[0]} (${nf.format(meters)} m)`);
  } else {
    const cm = meters * 100;
    return text.replace(match[0], `${match[0]} (${nf.format(cm)} cm)`);
  }
}

// Convert dimensions
function convertDimensions(
  text: string,
  match: RegExpMatchArray
): string {
  const dim1 = toNumber(match[1]);
  const dim2 = toNumber(match[2]);
  const dim3 = match[3] ? toNumber(match[3]) : null;
  const unit = match[4].toLowerCase();

  if (dim1 === null || dim2 === null) return text;

  let multiplier: number;
  let targetUnit: string;

  if (unit.startsWith('in')) {
    multiplier = IN_TO_CM;
    targetUnit = 'cm';
  } else if (unit.startsWith('ft') || unit === 'feet') {
    multiplier = FT_TO_M * 100;
    targetUnit = 'cm';
  } else {
    return text;
  }

  const conv1 = nf.format(dim1 * multiplier);
  const conv2 = nf.format(dim2 * multiplier);

  let conversion: string;
  if (dim3 !== null) {
    const conv3 = nf.format(dim3 * multiplier);
    conversion = `${conv1} × ${conv2} × ${conv3} ${targetUnit}`;
  } else {
    conversion = `${conv1} × ${conv2} ${targetUnit}`;
  }

  return text.replace(match[0], `${match[0]} (${conversion})`);
}

// Convert compound pound-ounce measurements
function convertPoundOunce(text: string): string {
  const regex =
    /\b(\d+(?:[.,]\d+)?)\s*(?:lbs?|pounds?)\s+(\d+(?:[.,]\d+)?)\s*(?:oz|ounces?)\b/g;

  return text.replace(regex, (match, lbStr, ozStr) => {
    const pounds = toNumber(lbStr);
    const ounces = toNumber(ozStr);

    if (pounds === null || ounces === null) return match;

    const totalOunces = pounds * 16 + ounces;
    const kg = totalOunces * 0.0283495;

    if (kg >= 1) {
      return `${match} (${nf.format(kg)} kg)`;
    } else {
      const grams = kg * 1000;
      return `${match} (${nf.format(grams)} g)`;
    }
  });
}

// Convert compound foot-inch measurements
function convertFootInch(text: string): string {
  const regex =
    /\b(\d+(?:[.,]\d+)?)\s*(?:ft|feet)\s+(\d+(?:[.,]\d+)?)\s*(?:in|inch|inches)\b/g;

  return text.replace(regex, (match, ftStr, inStr) => {
    const feet = toNumber(ftStr);
    const inches = toNumber(inStr);

    if (feet === null || inches === null) return match;

    const totalInches = feet * 12 + inches;
    const meters = totalInches * IN_TO_CM * 0.01; // convert cm to m

    if (meters >= 1) {
      return `${match} (${nf.format(meters)} m)`;
    } else {
      const cm = meters * 100;
      return `${match} (${nf.format(cm)} cm)`;
    }
  });
}

// Convert MPG to L/100km
function convertMPG(text: string): string {
  const regex = /\b(\d+(?:[.,]\d+)?)\s*mpg\b/g;

  return text.replace(regex, (match, mpgStr) => {
    const mpg = toNumber(mpgStr);
    if (mpg === null || mpg === 0) return match;

    const lPer100km = 235.215 / mpg;
    return `${match} (${nf.format(lPer100km)} L/100km)`;
  });
}
