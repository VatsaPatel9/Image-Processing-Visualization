# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build Commands

```bash
npm run dev      # Start dev server with HMR
npm run build    # Production build → dist/
npm run lint     # ESLint
npm run preview  # Preview production build
```

No test framework is configured.

## Architecture

Interactive educational app for visualizing image processing algorithms (convolution, edge detection, pixel operations). React 19 + Vite 7, styled with Tailwind CSS v4 + shadcn/ui.

### Processing Pipeline

```
User selects topic/operation → App.jsx state updates → useImageProcessor hook
  → routes to ConvolutionProcessor (kernel ops) or PixelProcessor (per-pixel ops)
  → outputs ImageData → rendered to <canvas> in ImageCanvas
```

All image processing operates on raw `ImageData` objects using the Canvas API. No WebGL or external image libraries.

### Key Layers

- **`src/core/ImageProcessor.js`** — Static utility class for pixel-level ImageData operations (`getPixel`, `setPixel`, `clamp`, image loading/export)
- **`src/processors/`** — Two processor classes with static methods:
  - `ConvolutionProcessor` — kernel application, Sobel combined, `calculateAtPixel()` for visualization
  - `PixelProcessor` — grayscale, brightness, contrast, threshold, invert
- **`src/hooks/`** — Three custom hooks:
  - `useImageProcessor` — routes processing based on subtopic config, uses setTimeout to avoid UI blocking
  - `useConvolutionAnimation` — pixel-by-pixel animation with raster scan, requestAnimationFrame loop
  - `useCanvasHover` — unified hover state for both canvases, calls `ConvolutionProcessor.calculateAtPixel` directly
- **`src/config/topics.js`** — Declarative topic/subtopic definitions specifying processor, method, default kernel, parameters, and UI metadata
- **`src/config/kernels.js`** — Kernel presets and generators (identity, box blur, Gaussian, Sobel, etc.) with size-scaling support

### UI Structure

Two-column layout: `lg:grid-cols-[1fr_360px]`
- **Left**: `ImageCanvas` — 3-column grid `[1fr_auto_1fr]` with input canvas, `ComputationDisplay` (center), output canvas
- **Right sidebar**: `KernelEditor` → animation toggle → `InfoPanel` → `ControlPanel`

Canvas overlays use `PixelHighlight` with `absolute` positioning inside the canvas Card container (not `fixed`).

### Tailwind v4 + shadcn/ui Setup

- **CSS architecture**: Four-step pattern in `src/index.css` — (1) `:root`/`.dark` CSS variables, (2) `@theme inline` mapping, (3) `@layer base` styles, (4) automatic dark mode via `.dark` class
- **Critical v4 config**: `components.json` has `"config": ""` (empty string, not a file path)
- **Vite plugin**: Uses `@tailwindcss/vite` (NOT PostCSS)
- **Path alias**: `@` maps to `src/` via both `vite.config.js` and `jsconfig.json`
- **shadcn components** live in `src/components/ui/` as `.tsx` files (Vite handles both `.jsx` and `.tsx`)
- **`cn()` utility** at `src/lib/utils.js` — combines `clsx` + `tailwind-merge`
- **Theme**: `ThemeProvider` context with `useTheme` hook, `ModeToggle` component for dark/light/system

### Adding shadcn Components

```bash
npx shadcn@latest add <component-name>
```

Components install as source code into `src/components/ui/`.
