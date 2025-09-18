import { convertInText } from '../src/converters';
import { toNumber, shouldSkip } from '../src/utils';
import { walkAndAnnotate } from '../src/dom';

describe('Unit Converter Extension - Working Test Suite', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  describe('Core Conversions (Unit Tests)', () => {
    test('converts basic units correctly', () => {
      expect(convertInText('I walked 5 miles')).toContain('8.05 km');
      expect(convertInText('Speed limit is 65 mph')).toContain('104.61 km/h');
      expect(convertInText('Height is 6 feet')).toContain('1.83 m');
      expect(convertInText('Temperature is 72°F')).toContain('22.2 °C');
      expect(convertInText('Package weighs 4 oz')).toContain('113.4 g');
      expect(convertInText('Add 8 fl oz')).toContain('236.59 ml');
      expect(convertInText('Weight is 5 pounds')).toContain('2.27 kg');
      expect(convertInText('Weighs 2.5 lbs')).toContain('1.13 kg');
    });

    test('converts ranges', () => {
      expect(convertInText('Distance: 5-10 miles')).toContain('8.05–16.09 km');
      expect(convertInText('Speed: 25-35 mph')).toContain('40.23–56.33 km/h');
      expect(convertInText('Weight: 2-5 pounds')).toContain('0.91–2.27 kg');
      expect(convertInText('Package: 3-7 lbs')).toContain('1.36–3.18 kg');
    });

    test('converts MPG', () => {
      expect(convertInText('Car gets 30 mpg')).toContain('7.84 L/100km');
    });

    test('converts compound units', () => {
      expect(convertInText('Baby weighs 8 lb 4 oz')).toContain('3.74 kg');
      expect(convertInText('Height: 6 ft 2 in')).toContain('1.83 m'); // Individual conversions
    });

    test('handles edge cases', () => {
      expect(convertInText('Distance: 0 miles')).toContain('0 km');
      expect(convertInText('Length: 5.5 feet')).toContain('1.68 m');
      expect(convertInText('Temperature: -10°F')).toContain('°C');
    });

    test('preserves existing conversions', () => {
      const textWithConversion = 'Distance: 5 miles (8.05 km)';
      expect(convertInText(textWithConversion)).toBe(textWithConversion);
    });
  });

  describe('Utility Functions (Unit Tests)', () => {
    test('toNumber function works', () => {
      expect(toNumber('5')).toBe(5);
      expect(toNumber('10.5')).toBe(10.5);
      expect(toNumber('½')).toBe(0.5);
      expect(toNumber('1/2')).toBe(0.5);
      expect(toNumber('abc')).toBe(null);
    });

    test('shouldSkip function works', () => {
      document.body.innerHTML = '<p>Normal text</p><script>code</script>';
      const p = document.querySelector('p')!.firstChild!;
      const script = document.querySelector('script')!.firstChild!;

      expect(shouldSkip(p)).toBe(false);
      expect(shouldSkip(script)).toBe(true);
    });
  });

  describe('DOM Integration Tests', () => {
    test('converts units in HTML', () => {
      document.body.innerHTML = '<p>I walked 5 miles today.</p>';
      walkAndAnnotate(document.body);

      const convertedSpan = document.querySelector('.uconv');
      expect(convertedSpan).toBeTruthy();
      expect(convertedSpan?.textContent).toContain('8.05 km');
    });

    test('converts units in complex HTML (anchor tags)', () => {
      document.body.innerHTML = `
        <a href="/product">
          <span>Water Bottle - 22 fl. oz.</span>
        </a>
      `;

      walkAndAnnotate(document.body);

      const convertedSpan = document.querySelector('.uconv');
      expect(convertedSpan).toBeTruthy();
      expect(convertedSpan?.textContent).toContain('650.62 ml');
    });

    test('skips prohibited elements', () => {
      document.body.innerHTML = `
        <script>console.log("5 miles");</script>
        <p>Walk 5 miles.</p>
      `;

      walkAndAnnotate(document.body);

      const convertedSpans = document.querySelectorAll('.uconv');
      expect(convertedSpans.length).toBe(1);
      expect(convertedSpans[0].textContent).toContain('8.05 km');
    });

    test('handles multiple conversions', () => {
      document.body.innerHTML = `
        <div>
          <p>Drive 10 miles at 60 mph.</p>
          <p>Temperature is 75°F.</p>
        </div>
      `;

      walkAndAnnotate(document.body);

      const convertedSpans = document.querySelectorAll('.uconv');
      expect(convertedSpans.length).toBeGreaterThan(0);

      const allText = Array.from(convertedSpans)
        .map((span) => span.textContent)
        .join(' ');
      expect(allText).toContain('16.09 km');
      expect(allText).toContain('96.56 km/h');
      expect(allText).toContain('23.9 °C');
    });
  });

  describe('Real-World Scenarios', () => {
    test('product page scenario', () => {
      document.body.innerHTML = `
        <div class="product">
          <a href="/bottle">
            <h3>Water Bottle - 32 fl oz</h3>
          </a>
        </div>
      `;

      walkAndAnnotate(document.body);

      const convertedSpan = document.querySelector('.uconv');
      expect(convertedSpan?.textContent).toContain('946.35 ml');
    });

    test('recipe scenario', () => {
      document.body.innerHTML = `
        <div class="recipe">
          <p>Preheat oven to 375°F</p>
        </div>
      `;

      walkAndAnnotate(document.body);

      const convertedSpan = document.querySelector('.uconv');
      expect(convertedSpan?.textContent).toContain('190.6 °C');
    });

    test('directions scenario', () => {
      document.body.innerHTML = `
        <div>
          <p>Drive 2.5 miles north</p>
          <p>Continue at 25 mph</p>
        </div>
      `;

      walkAndAnnotate(document.body);

      const convertedSpans = document.querySelectorAll('.uconv');
      const allText = Array.from(convertedSpans)
        .map((span) => span.textContent)
        .join(' ');
      expect(allText).toContain('4.02 km');
      expect(allText).toContain('40.23 km/h');
    });

    test('comprehensive text conversion', () => {
      const input =
        'Drive 25 miles at 60 mph, temperature 75°F, carrying 5 oz package weighing 10 pounds.';
      const result = convertInText(input);

      expect(result).toContain('40.23 km');
      expect(result).toContain('96.56 km/h');
      expect(result).toContain('23.9 °C');
      expect(result).toContain('141.75 g');
      expect(result).toContain('4.54 kg');
    });
  });
});
