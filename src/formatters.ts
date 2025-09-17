// number formatting by locale
export const nf = new Intl.NumberFormat(navigator.language || 'en-US', {
  maximumFractionDigits: 2,
});

export const nf1 = new Intl.NumberFormat(navigator.language || 'en-US', {
  maximumFractionDigits: 1,
});

export function rangeFormat(from: number, to: number, unitFmt: string): string {
  return `${nf.format(from)}–${nf.format(to)} ${unitFmt}`;
}