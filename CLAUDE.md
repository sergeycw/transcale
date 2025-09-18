# Claude Development Guide

## Project Setup

This is a Chrome extension project built with TypeScript.

## Development Workflow

### Build Commands

- `npm run build` - Bundle TypeScript files with esbuild
- `npm run build:types` - Type check without emitting files
- `npm run watch` - Watch mode for development (auto-rebuild on changes)
- `npm run dev` - Build and format code
- `npm run format` - Format code with Prettier
- `npm run format:check` - Check code formatting

### Testing

- Load the extension in Chrome by going to `chrome://extensions/`
- Enable "Developer mode"
- Click "Load unpacked" and select the project directory

### Code Quality

- Run `npm run format` before committing changes
- Ensure TypeScript compilation succeeds with `npm run build`

## Project Structure

- `src/` - TypeScript source files
    - `content.ts` - Main entry point for content script
    - `converters.ts` - Unit conversion logic
    - `constants.ts` - Conversion constants (MI_TO_KM, etc.)
    - `formatters.ts` - Number formatting utilities
    - `regexes.ts` - Regular expressions for unit detection
    - `utils.ts` - Utility functions (shouldSkip, toNumber)
    - `dom.ts` - DOM manipulation and observation
    - `sw.ts` - Service worker
- `dist/` - Compiled output
- `manifest.json` - Chrome extension manifest
- `options.html` - Extension options page

## Future Features Roadmap

### 1. User Settings & Preferences

- [ ] Functional options.html page with settings UI
- [ ] Toggle individual conversion types (length, weight, temperature, etc.)
- [ ] Precision control (decimal places for conversions)
- [ ] Website blacklist (disable extension on specific sites)
- [ ] Display style options (inline, tooltip, highlight)
- [ ] Chrome storage integration for settings persistence

### 2. Additional Units Support

- [ ] **Volume**: gallons (gal), quarts (qt), pints (pt)
- [ ] **Weight**: pounds (lbs)
- [ ] **Area**: square feet/inches, acres, square yards

### 3. UX Improvements

- [ ] Visual highlighting on hover over converted values
- [ ] Toggle visibility button to show/hide all conversions
- [ ] Keyboard shortcuts for common actions

### 4. Smart Algorithms

- [ ] Context-aware recognition ("5 oz" weight vs volume based on context)
- [ ] Currency-aware conversions ("$5 per gallon" → price per liter)
- [ ] Cooking recipe intelligence (cups, tablespoons in cooking contexts)
