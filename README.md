<<<<<<< HEAD
# Mini Design Canvas Editor

A lightweight, interactive design canvas application built with React, TypeScript, and Vite. Create, manipulate, and export visual designs with rectangles, text blocks, and image placeholders.

## Features

- **Element Creation**: Add rectangles, text blocks, and image placeholders
- **Interactive Manipulation**: Drag, resize, and position elements with precision
- **Smart Alignment**: Snap-to-grid and alignment guides for perfect layouts
- **Layer Management**: Automatic z-index handling for overlapping elements
- **Undo/Redo**: Full history support with keyboard shortcuts
- **Properties Panel**: Numeric editing of element properties
- **Export**: Download your design as a PNG image
- **Keyboard Shortcuts**: Efficient workflow with Delete, Ctrl+D, Ctrl+Z, etc.

## Quick Start

### Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Run tests
npm test

# Run tests with UI
npm run test:ui
```

### Production Build

```bash
# Build for production
npm run build

# Preview production build
npm run preview
```

## Deployment

The application is ready to deploy to Vercel or Netlify. See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed instructions.

### Quick Deploy

**Vercel:**
```bash
npm install -g vercel
vercel --prod
```

**Netlify:**
```bash
npm install -g netlify-cli
netlify deploy --prod
```

## Technology Stack

- **React 19** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Vitest** - Unit testing
- **fast-check** - Property-based testing

## Project Structure

```
src/
├── components/     # React components
├── hooks/          # Custom React hooks
├── utils/          # Utility functions
└── types/          # TypeScript type definitions

tests/
├── unit/           # Unit tests
└── property/       # Property-based tests
```

## Testing

The project uses a dual testing approach:
- **Unit tests**: Specific examples and edge cases
- **Property tests**: Universal correctness properties

Run all tests:
```bash
npm test
```

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)

## License

MIT
=======
# mini-design-canvas-editor
>>>>>>> 2c24f1a74b1755f33559b09029cca043407cb7ea
