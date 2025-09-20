import { convertInText } from '../src/converters';
import {
  toNumber,
  parseFraction,
  shouldSkip,
  hasExistingConversion,
} from '../src/utils';
import { walkAndAnnotate } from '../src/dom';
import {
  RE_MILE,
  RE_MPH,
  RE_FT,
  RE_IN,
  RE_FLOZ,
  RE_OZ,
  RE_FAH,
  resetRegexIndices,
} from '../src/regexes';

describe('Unit Converter - Core Functionality', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
    resetRegexIndices();
  });

  describe('Basic Unit Conversions', () => {
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

    test('converts compound units separately', () => {
      // 8 lb = 3.63 kg, 4 oz = 113.4 g - convert each unit separately
      expect(convertInText('Baby weighs 8 lb 4 oz')).toBe(
        'Baby weighs 8 lb (3.63 kg) 4 oz (113.4 g)'
      );
      // 6 ft = 1.83 m, 2 in = 5.08 cm - convert each unit separately
      expect(convertInText('Height: 6 ft 2 in')).toBe(
        'Height: 6 ft (1.83 m) 2 in (5.08 cm)'
      );
    });

    test('handles edge cases', () => {
      expect(convertInText('Distance: 0 miles')).toContain('0 km');
      expect(convertInText('Length: 5.5 feet')).toContain('1.68 m');
      // -10°F = (-10-32)*5/9 = -42*5/9 = -23.3°C
      expect(convertInText('Temperature: -10°F')).toBe(
        'Temperature: -10°F (-23.3 °C)'
      );
    });

    test('preserves existing conversions', () => {
      const textWithConversion = 'Distance: 5 miles (8.05 km)';
      expect(convertInText(textWithConversion)).toBe(textWithConversion);
    });
  });

  describe('Utility Functions', () => {
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

  describe('DOM Integration', () => {
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

describe('Unit Converter - Edge Cases & Patterns', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
    resetRegexIndices();
  });

  describe('Regex Pattern Validation', () => {
    test('miles pattern edge cases', () => {
      expect('5 miles'.match(RE_MILE)?.[0]).toBe('5 miles');
      expect('10 mile'.match(RE_MILE)?.[0]).toBe('10 mile');
      expect('1 mi'.match(RE_MILE)?.[0]).toBe('1 mi');
      expect('5-10 miles'.match(RE_MILE)?.[0]).toBe('5-10 miles');
      expect('5.5 miles'.match(RE_MILE)?.[0]).toBe('5.5 miles');
      expect('0 miles'.match(RE_MILE)?.[0]).toBe('0 miles');
      expect('1000 miles'.match(RE_MILE)?.[0]).toBe('1000 miles');
    });

    test('mph pattern edge cases', () => {
      expect('60 mph'.match(RE_MPH)?.[0]).toBe('60 mph');
      expect('55-65 mph'.match(RE_MPH)?.[0]).toBe('55-65 mph');
      expect('32.5 mph'.match(RE_MPH)?.[0]).toBe('32.5 mph');
      expect('0 mph'.match(RE_MPH)?.[0]).toBe('0 mph');
    });

    test('feet pattern edge cases', () => {
      expect('6 feet'.match(RE_FT)?.[0]).toBe('6 feet');
      expect('10 ft'.match(RE_FT)?.[0]).toBe('10 ft');
      expect('8-12 feet'.match(RE_FT)?.[0]).toBe('8-12 feet');
      expect('0 feet'.match(RE_FT)?.[0]).toBe('0 feet');
      expect('100.5 ft'.match(RE_FT)?.[0]).toBe('100.5 ft');
    });

    test('inches pattern edge cases', () => {
      expect('12 in'.match(RE_IN)?.[0]).toBe('12 in');
      expect('2.5 in'.match(RE_IN)?.[0]).toBe('2.5 in');
      expect('0 in'.match(RE_IN)?.[0]).toBe('0 in');
      expect('6″'.match(RE_IN)).toBe(null); // Quote symbols don't match due to word boundary
    });

    test('fluid ounce pattern edge cases', () => {
      expect('8 fl oz'.match(RE_FLOZ)?.[0]).toBe('8 fl oz');
      expect('16 fl. oz'.match(RE_FLOZ)?.[0]).toBe('16 fl. oz');
      expect('32 fluid ounce'.match(RE_FLOZ)?.[0]).toBe('32 fluid ounce');
      expect('64 fluid ounces'.match(RE_FLOZ)?.[0]).toBe('64 fluid ounces');
      expect('12-16 fl oz'.match(RE_FLOZ)?.[0]).toBe('12-16 fl oz');
    });

    test('ounce pattern edge cases', () => {
      expect('4 oz'.match(RE_OZ)?.[0]).toBe('4 oz');
      expect('8 oz.'.match(RE_OZ)?.[0]).toBe('8 oz.');
      expect('12 ounce'.match(RE_OZ)?.[0]).toBe('12 ounce');
      expect('16 ounces'.match(RE_OZ)?.[0]).toBe('16 ounces');
      expect('2-4 oz'.match(RE_OZ)?.[0]).toBe('2-4 oz');
    });

    test('fahrenheit pattern edge cases', () => {
      expect('72°F'.match(RE_FAH)?.[0]).toBe('72°F');
      expect('-10°F'.match(RE_FAH)?.[0]).toBe('-10°F');
      expect('98.6° F'.match(RE_FAH)?.[0]).toBe('98.6° F');
      expect('0° F'.match(RE_FAH)?.[0]).toBe('0° F');
    });
  });

  describe('Fraction and Number Parsing', () => {
    test('parseFraction handles various formats', () => {
      expect(parseFraction('½')).toBe(0.5);
      expect(parseFraction('¼')).toBe(0.25);
      expect(parseFraction('¾')).toBe(0.75);
      expect(parseFraction('⅓')).toBeCloseTo(1 / 3, 3);
      expect(parseFraction('⅔')).toBeCloseTo(2 / 3, 3);
      expect(parseFraction('⅕')).toBe(0.2);
      expect(parseFraction('⅖')).toBe(0.4);
      expect(parseFraction('⅗')).toBe(0.6);
      expect(parseFraction('⅘')).toBe(0.8);
      expect(parseFraction('⅙')).toBeCloseTo(1 / 6, 3);
      expect(parseFraction('⅚')).toBeCloseTo(5 / 6, 3);
      expect(parseFraction('⅛')).toBe(0.125);
      expect(parseFraction('⅜')).toBe(0.375);
      expect(parseFraction('⅝')).toBe(0.625);
      expect(parseFraction('⅞')).toBe(0.875);
    });

    test('parseFraction handles regular fractions', () => {
      expect(parseFraction('1/2')).toBe(0.5);
      expect(parseFraction('1/4')).toBe(0.25);
      expect(parseFraction('3/4')).toBe(0.75);
      expect(parseFraction('2/3')).toBe(2 / 3);
      expect(parseFraction('5/6')).toBe(5 / 6);
      expect(parseFraction('7/8')).toBe(0.875);
    });

    test('toNumber handles fractions and decimals', () => {
      expect(toNumber('5½')).toBe(5.5);
      expect(toNumber('2¼')).toBe(2.25);
      expect(toNumber('1⅓')).toBeCloseTo(1.333, 3);
      expect(toNumber('10.5')).toBe(10.5);
      expect(toNumber('0.25')).toBe(0.25);
      expect(toNumber('3,5')).toBe(3.5); // European format
    });
  });

  describe('Element Skipping Logic', () => {
    test('shouldSkip works for various elements', () => {
      document.body.innerHTML = `
        <script>const miles = 5;</script>
        <style>.distance { width: 5px; }</style>
        <noscript>5 miles</noscript>
        <textarea>5 miles</textarea>
        <input value="5 miles" />
        <select><option>5 miles</option></select>
        <button>Drive 5 miles</button>
        <p>Normal: 5 miles</p>
      `;

      const script = document.querySelector('script')!.firstChild!;
      const style = document.querySelector('style')!.firstChild!;
      const noscript = document.querySelector('noscript')!.firstChild!;
      const textarea = document.querySelector('textarea')!.firstChild!;
      const input = document.querySelector('input')!;
      const select = document.querySelector('select')!.firstChild!;
      const button = document.querySelector('button')!.firstChild!;
      const p = document.querySelector('p')!.firstChild!;

      expect(shouldSkip(script)).toBe(true);
      expect(shouldSkip(style)).toBe(true);
      expect(shouldSkip(noscript)).toBe(true);
      expect(shouldSkip(textarea)).toBe(true);
      expect(shouldSkip(input)).toBe(false);
      expect(shouldSkip(select)).toBe(true);
      expect(shouldSkip(button)).toBe(true);
      expect(shouldSkip(p)).toBe(false);
    });

    test('shouldSkip handles orphaned nodes', () => {
      const orphanNode = document.createTextNode('5 miles');
      expect(shouldSkip(orphanNode)).toBe(true);
    });
  });

  describe('Existing Conversion Detection', () => {
    test('detects common metric conversions', () => {
      expect(
        hasExistingConversion('Distance: 5 miles (8.05 km)', '5 miles')
      ).toBe(true);
      expect(hasExistingConversion('Height: 6 feet (1.83 m)', '6 feet')).toBe(
        true
      );
      expect(
        hasExistingConversion('Length: 12 inches (30.48 cm)', '12 inches')
      ).toBe(true);
      expect(
        hasExistingConversion('Volume: 8 fl oz (236.59 ml)', '8 fl oz')
      ).toBe(true);
      expect(hasExistingConversion('Weight: 4 oz (113.4 g)', '4 oz')).toBe(
        true
      );
      expect(hasExistingConversion('Temperature: 72°F (22.2 °C)', '72°F')).toBe(
        true
      );
    });

    test('returns false when no conversion exists', () => {
      expect(hasExistingConversion('Distance: 5 miles', '5 miles')).toBe(false);
      expect(hasExistingConversion('Height: 6 feet tall', '6 feet')).toBe(
        false
      );
    });

    test('handles edge cases', () => {
      expect(hasExistingConversion('', 'anything')).toBe(false);
      expect(hasExistingConversion('text', '')).toBe(false);
      expect(
        hasExistingConversion('Distance: 5 miles (8.05 km)', '10 miles')
      ).toBe(false);
    });
  });
});

describe('Unit Converter - Complex Scenarios', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
    resetRegexIndices();
  });

  describe('Boundary Values and Precision', () => {
    test('zero values', () => {
      expect(convertInText('Distance: 0 miles')).toContain('0 km');
      expect(convertInText('Speed: 0 mph')).toContain('0 km/h');
      expect(convertInText('Height: 0 feet')).toContain('0 m');
      expect(convertInText('Weight: 0 oz')).toContain('0 g');
    });

    test('very large values', () => {
      expect(convertInText('Distance: 1000 miles')).toContain('1,609.34 km');
      expect(convertInText('Speed: 200 mph')).toContain('321.87 km/h');
      expect(convertInText('Height: 100 feet')).toContain('30.48 m');
    });

    test('very small values', () => {
      expect(convertInText('Distance: 0.1 miles')).toContain('0.16 km');
      expect(convertInText('Length: 0.5 feet')).toContain('0.15 m');
    });

    test('rounding behavior', () => {
      expect(convertInText('Distance: 0.333333 miles')).toContain('km');
      expect(convertInText('Weight: 0.666666 oz')).toContain('g');
    });
  });

  describe('Complex Text Patterns', () => {
    test('multiple units of same type', () => {
      const result = convertInText('Drive 5 miles, then 3 miles, then 2 miles');
      expect(result).toContain('8.05 km');
      expect(result).toContain('4.83 km');
      expect(result).toContain('3.22 km');
    });

    test('mixed unit types', () => {
      const result = convertInText(
        'Drive 10 miles at 60 mph in 75°F weather, carrying 2 oz'
      );
      expect(result).toContain('16.09 km');
      expect(result).toContain('96.56 km/h');
      expect(result).toContain('23.9 °C');
      expect(result).toContain('56.7 g');
    });

    test('units with punctuation', () => {
      expect(convertInText('Distance: 5 miles.')).toContain('km');
      expect(convertInText('Speed: 60 mph,')).toContain('km/h');
      expect(convertInText('Height: 6 feet!')).toContain('m');
      expect(convertInText('Weight: 4 oz?')).toContain('g');
      expect(convertInText('Temperature: 72°F;')).toContain('°C');
    });

    test('units in parentheses', () => {
      expect(convertInText('Dimensions (5 miles)')).toContain('km');
      expect(convertInText('Speed (60 mph) limit')).toContain('km/h');
      expect(convertInText('Height (6 feet) tall')).toContain('m');
    });

    test('units with special characters', () => {
      expect(convertInText('Distance: 5 miles™')).toContain('km');
      expect(convertInText('Speed: 60 mph®')).toContain('km/h');
      expect(convertInText('Temperature: 72°F©')).toContain('°C');
    });

    test('handles unicode and emojis', () => {
      expect(convertInText('🚗 Drive 5 miles')).toContain('km');
      expect(convertInText('Temperature: 72°F 🌡️')).toContain('°C');
      expect(convertInText('Distance: 5 miles → destination')).toContain('km');
    });
  });

  describe('Complex DOM Structures', () => {
    test('deeply nested elements', () => {
      document.body.innerHTML = `
        <div class="container">
          <div class="section">
            <div class="content">
              <p>Water Bottle - 32 fl oz</p>
              <span>Drive 5 miles</span>
              <div>Weight: 8 oz</div>
            </div>
          </div>
        </div>
      `;

      walkAndAnnotate(document.body);

      const convertedSpans = document.querySelectorAll('.uconv');
      const allText = Array.from(convertedSpans)
        .map((span) => span.textContent)
        .join(' ');

      expect(allText).toContain('946.35 ml');
      expect(allText).toContain('8.05 km');
      expect(allText).toContain('226.8 g');
    });

    test('recipe with measurements', () => {
      document.body.innerHTML = `
        <div class="recipe">
          <h2>Chocolate Cake</h2>
          <ul>
            <li>Add 16 fl oz milk</li>
            <li>Mix in 8 oz flour</li>
            <li>Bake at 375°F for 25 minutes</li>
          </ul>
        </div>
      `;

      walkAndAnnotate(document.body);

      const convertedSpans = document.querySelectorAll('.uconv');
      const allText = Array.from(convertedSpans)
        .map((span) => span.textContent)
        .join(' ');

      expect(allText).toContain('473.18 ml');
      expect(allText).toContain('226.8 g');
      expect(allText).toContain('190.6 °C');
    });

    test('travel directions', () => {
      document.body.innerHTML = `
        <div class="directions">
          <div class="step">Drive 2.5 miles north</div>
          <div class="step">Continue at 35 mph for 10 minutes</div>
          <div class="summary">Total: 3.5 miles</div>
        </div>
      `;

      walkAndAnnotate(document.body);

      const convertedSpans = document.querySelectorAll('.uconv');
      const allText = Array.from(convertedSpans)
        .map((span) => span.textContent)
        .join(' ');

      expect(allText).toContain('4.02 km');
      expect(allText).toContain('56.33 km/h');
      expect(allText).toContain('5.63 km');
    });
  });

  describe('Performance and Reliability', () => {
    test('regex indices reset properly', () => {
      for (let i = 0; i < 5; i++) {
        convertInText('5 miles 60 mph 6 feet');
        resetRegexIndices();
      }
      expect(RE_MILE.lastIndex).toBe(0);
      expect(RE_MPH.lastIndex).toBe(0);
      expect(RE_FT.lastIndex).toBe(0);
    });

    test('handles moderately large documents', () => {
      document.body.innerHTML = Array(20)
        .fill('<p>Drive 5 miles at 60 mph in 75°F weather.</p>')
        .join('');

      expect(() => walkAndAnnotate(document.body)).not.toThrow();

      const convertedSpans = document.querySelectorAll('.uconv');
      expect(convertedSpans.length).toBeGreaterThan(0);
      expect(convertedSpans.length).toBeLessThan(100);
    });

    test('handles repeated conversions gracefully', () => {
      document.body.innerHTML = '<p>Drive 5 miles today.</p>';

      for (let i = 0; i < 5; i++) {
        walkAndAnnotate(document.body);
      }

      const convertedSpans = document.querySelectorAll('.uconv');
      expect(convertedSpans.length).toBe(1);
    });
  });
});

describe('Unit Converter - Pounds Conversion', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
    resetRegexIndices();
  });

  describe('Basic Pounds Conversions', () => {
    test('converts various pound formats', () => {
      expect(convertInText('Item weighs 1 pound')).toBe(
        'Item weighs 1 pound (0.45 kg)'
      );
      expect(convertInText('Package is 2 pounds')).toBe(
        'Package is 2 pounds (0.91 kg)'
      );
      expect(convertInText('Weight: 5 lbs')).toBe('Weight: 5 lbs (2.27 kg)');
      expect(convertInText('Total: 10 lbs.')).toBe('Total: 10 lbs (4.54 kg).');
      expect(convertInText('Weighs 3.5 pounds')).toBe(
        'Weighs 3.5 pounds (1.59 kg)'
      );
    });

    test('converts pound ranges', () => {
      expect(convertInText('Weight: 2-5 pounds')).toBe(
        'Weight: 2-5 pounds (0.91–2.27 kg)'
      );
      expect(convertInText('Package: 3-7 lbs')).toBe(
        'Package: 3-7 lbs (1.36–3.18 kg)'
      );
      expect(convertInText('Range: 1.5-2.5 lb')).toBe(
        'Range: 1.5-2.5 lb (0.68–1.13 kg)'
      );
    });

    test('preserves existing pound conversions', () => {
      const textWithConversion = 'Weight: 5 pounds (2.27 kg)';
      expect(convertInText(textWithConversion)).toBe(textWithConversion);
    });

    test('handles approximation symbols with pounds', () => {
      expect(convertInText('Weight: ~3 pounds')).toContain('(1.36 kg)');
      expect(convertInText('Approximately 4.5 lbs')).toContain('(2.04 kg)');
    });

    test('pounds with fractions', () => {
      expect(convertInText('Weight: 2½ pounds')).toContain('(1.13 kg)');
      expect(convertInText('Package: 3¼ lbs')).toContain('(1.47 kg)');
    });

    test('pounds edge cases', () => {
      expect(convertInText('Weight: 0 pounds')).toBe('Weight: 0 pounds (0 kg)');
      expect(convertInText('Heavy: 100 lbs')).toBe('Heavy: 100 lbs (45.36 kg)');
      expect(convertInText('Light: 0.5 pound')).toBe(
        'Light: 0.5 pound (0.23 kg)'
      );
    });
  });

  describe('Pounds DOM Integration', () => {
    test('pounds in DOM scenarios', () => {
      document.body.innerHTML = '<p>Package weighs 15 pounds</p>';
      walkAndAnnotate(document.body);

      const convertedSpan = document.querySelector('.uconv');
      expect(convertedSpan?.textContent).toContain('6.8 kg');
    });
  });
});

describe('Unit Converter - Bug Fixes', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
    resetRegexIndices();
  });

  describe('Ounces Regex Fix', () => {
    test('ounces conversion bug reproduction', () => {
      const result = convertInText('Weight: 4.3 ounces');
      expect(result).not.toContain('ounce (121.9 g)s');
      expect(result).toBe('Weight: 4.3 ounces (121.9 g)');
    });

    test('various ounce formats work correctly', () => {
      expect(convertInText('Weight: 4 oz')).toBe('Weight: 4 oz (113.4 g)');
      expect(convertInText('Weight: 4 ounce')).toBe(
        'Weight: 4 ounce (113.4 g)'
      );
      expect(convertInText('Weight: 4 ounces')).toBe(
        'Weight: 4 ounces (113.4 g)'
      );
    });

    test('ounces regex prioritizes longest match first', () => {
      // Test that "ounces" is captured as whole word, not "ounce" + "s"
      expect(convertInText('Container holds 4 ounces')).toBe(
        'Container holds 4 ounces (113.4 g)'
      );
      expect(convertInText('Package weighs 8 ounces')).toBe(
        'Package weighs 8 ounces (226.8 g)'
      );
      expect(convertInText('Item is 12 ounces')).toBe(
        'Item is 12 ounces (340.19 g)'
      );
    });
  });

  describe('Negative Temperature Fix', () => {
    test('converts negative fahrenheit temperatures correctly', () => {
      expect(convertInText('Temperature: -10°F')).toBe(
        'Temperature: -10°F (-23.3 °C)'
      );
      expect(convertInText('It was -20°F outside')).toBe(
        'It was -20°F (-28.9 °C) outside'
      );
      expect(convertInText('Freezer set to -5°F')).toBe(
        'Freezer set to -5°F (-20.6 °C)'
      );
    });
  });

  describe('Table Cell Measurement Case', () => {
    test('handles table cell with quote and fraction', () => {
      document.body.innerHTML = '<td class="c-table-row-wide">9"<br>1/16</td>';

      // Before conversion - should not convert this complex case yetи
      walkAndAnnotate(document.body);
      const convertedSpan = document.querySelector('.uconv');

      // Currently this won't convert due to:
      // 1. Quote doesn't match (word boundary issue)
      // 2. Complex HTML structure with <br>
      // 3. Compound measurement format not supported
      expect(convertedSpan).toBe(null);
    });

    test('documents the expected behavior for compound inch measurements', () => {
      // If we supported this format, it should convert to:
      // 9 + 1/16 = 9.0625 inches = 23.02 cm
      // But this is a complex case that would require:
      // 1. Fixing quote matching in regex
      // 2. Adding support for "number + fraction" patterns across HTML elements
      // 3. DOM-aware parsing that handles <br> tags

      // For now, we document this as a known limitation
      const exampleText = '9" 1/16'; // Simplified text version
      const result = convertInText(exampleText);
      expect(result).toBe('9" 1/16'); // No conversion due to quote issue
    });
  });
});
