# Using Locatorjs in DepthsDB

Locatorjs is a development tool that helps you quickly locate React components in your codebase by clicking on them in the browser. This document explains how to use it in this project.

## Features

- Click on any component in your app to jump directly to its source code
- Visualize component boundaries and hierarchies
- See component props and state
- Works with React and Next.js

## Getting Started

### Running the App with Locatorjs

To start the development server with Locatorjs enabled:

```bash
npm run dev:locator
```

This will start the Next.js development server with Locatorjs activated.

### Using Locatorjs

1. **Activate Locator**: Press `Alt+Shift+L` (or `Option+Shift+L` on Mac) to activate Locator mode.

2. **Inspect Components**: Once activated, hover over any component in your application to see:
   - Component name
   - File path
   - Component boundaries (highlighted)

3. **Click on a Component**: Click on any highlighted component to:
   - See detailed component information in the sidebar
   - View props and state
   - Jump to the source code (if your editor supports it)

4. **Exit Locator Mode**: Press `Esc` or `Alt+Shift+L` again to exit Locator mode.

## Configuration

Locatorjs is configured in two places:

1. `.locatorrc` in the project root - Contains general settings
2. `locator.config.js` - Contains more detailed configuration options

### Current Configuration

- **Shortcut Key**: `Alt+Shift+L`
- **Theme**: Light
- **Activation**: Manual (not activated by default)
- **Hidden Nodes**: Not shown
- **Production**: Disabled in production builds

## Troubleshooting

If Locatorjs isn't working as expected:

1. Make sure you're running the app with `npm run dev:locator`
2. Check that you're in development mode, not production
3. Try manually activating with `Alt+Shift+L`
4. Ensure source maps are correctly generated (they should be by default)

## Notes

- Locatorjs is only enabled in development mode, not in production builds
- The tool adds some overhead, so only use it when needed during development
- For more information, visit the [Locatorjs documentation](https://www.locatorjs.com/)