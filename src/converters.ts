import { MI_TO_KM, MPH_TO_KMH, FT_TO_M, IN_TO_CM, FLOZ_TO_ML, OZ_TO_G } from './constants';
import { nf, nf1, rangeFormat } from './formatters';
import { toNumber } from './utils';
import {
  RE_MILE,
  RE_MPH,
  RE_FT,
  RE_IN,
  RE_FLOZ,
  RE_OZ,
  RE_FAH,
  resetRegexIndices
} from './regexes';

export function convertInText(str: string): string {
  let out = str;

  resetRegexIndices();

  // mi → km
  out = out.replace(RE_MILE, (m, approx, a, dash, b) => {
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

  // mph → km/h
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

  // ft → m
  out = out.replace(RE_FT, (m, approx, a, dash, b) => {
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

  // in → cm (simplified)
  out = out.replace(RE_IN, (m, a) => {
    const v = toNumber(a);
    if (v == null) return m;
    const cm = v * IN_TO_CM;
    return `${m} (${nf.format(cm)} cm)`;
    // improvement: recognize 5' 7" and convert directly to cm/m
  });

  // fl oz → ml
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

  // oz → g (for weight)
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

  // °F → °C
  out = out.replace(RE_FAH, (m, f) => {
    const v = toNumber(f);
    if (v == null) return m;
    const c = ((v - 32) * 5) / 9;
    return `${m} (${nf1.format(c)} °C)`;
  });

  return out;
}