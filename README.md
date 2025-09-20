# Unit Autoconverter: US → Metric

A Chrome extension that automatically converts American units to metric equivalents on any webpage. No more manual calculations - get instant metric conversions right where you need them.

## Supported Conversions

- **Distance**: miles → kilometers, feet → meters, inches → centimeters
- **Speed**: mph → km/h
- **Temperature**: Fahrenheit → Celsius
- **Weight**: pounds → kilograms, ounces → grams
- **Volume**: fluid ounces → milliliters
- **Fuel Economy**: mpg → L/100km
- **Compound Units**: feet + inches, pounds + ounces
- **Dimensions**: length × width × height conversions
- **Ranges**: "5-10 miles" → "8.05–16.09 km"

## Installation

1. Download or clone this extension
2. Open Chrome and go to `chrome://extensions/`
3. Enable "Developer mode" (toggle in top right)
4. Click "Load unpacked" and select the extension folder

## How It Works

Once installed, the extension works automatically on all websites:

- Scans webpage content for American units
- Adds metric conversions in parentheses without changing the original text
- Works with dynamic content that loads after the page
- Skips conversions in code blocks and input fields to avoid interference

## Examples

- "Drive 5 miles" → "Drive 5 miles (8.05 km)"
- "Temperature: 75°F" → "Temperature: 75°F (23.9 °C)"
- "Weight: 2 lbs 4 oz" → "Weight: 2 lbs 4 oz (1.02 kg)"
- "Dimensions: 12 × 8 inches" → "Dimensions: 12 × 8 inches (30.48 × 20.32 cm)"
- "Speed limit: 55 mph" → "Speed limit: 55 mph (88.5 km/h)"
- "Fuel economy: 25 mpg" → "Fuel economy: 25 mpg (9.4 L/100km)"

## Features

- **Non-intrusive**: Adds conversions without modifying original text
- **Smart detection**: Handles fractions (½, ¼, ¾) and ranges ("5-10 miles")
- **Context-aware**: Won't interfere with code or input fields
- **Real-time**: Works with content that loads dynamically