# Claude Development Guide

## Project Setup
This is a Chrome extension project built with TypeScript.

## Development Workflow

### Build Commands
- `npm run build` - Compile TypeScript files
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
- `dist/` - Compiled output
- `manifest.json` - Chrome extension manifest
- `options.html` - Extension options page

## Next Steps
- [x] Initialize git repository
- [x] Remove Cyrillic text from project
- [ ] Make project more modular
- [ ] Handle corner cases with existing conversions