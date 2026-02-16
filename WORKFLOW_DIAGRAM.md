# Image Processing Visualization - Workflow Diagram

## System Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    Interactive Image Processing Application              │
│                                                                           │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                        User Interface (React)                    │   │
│  │                                                                   │   │
│  │  ┌───────────────┐  ┌──────────────┐  ┌──────────────────┐    │   │
│  │  │ Topic Selector│  │  Operation   │  │  Animation Toggle│    │   │
│  │  │  - Convolution│  │   Selector   │  │  (Convolution    │    │   │
│  │  │  - Filtering  │  │  - Box Blur  │  │   Only)          │    │   │
│  │  │  - Edge Det.  │  │  - Gaussian  │  │                  │    │   │
│  │  └───────┬───────┘  └──────┬───────┘  └──────────────────┘    │   │
│  │          │                   │                                  │   │
│  │          └───────────────────┴──────────────────┐              │   │
│  │                                                  │              │   │
│  └──────────────────────────────────────────────────┼──────────────┘   │
│                                                      │                   │
│  ┌──────────────────────────────────────────────────┼──────────────┐   │
│  │                     Image Canvas Display         │              │   │
│  │                                                   ▼              │   │
│  │  ┌─────────────────┐       ┌────────────┐   ┌──────────────┐  │   │
│  │  │  Input Image    │  ───▶ │   Kernel   │──▶│Output Image  │  │   │
│  │  │  (Fixed: 512x512│       │   Editor   │   │(Fixed:512x512│  │   │
│  │  │   display)      │       │  (3x3,5x5, │   │  display)    │  │   │
│  │  │  Actual: 32-256 │       │   7x7,9x9) │   │              │  │   │
│  │  └─────────────────┘       └────────────┘   └──────────────┘  │   │
│  │         │                        │                   │          │   │
│  │         └────────────────────────┴───────────────────┘          │   │
│  │                                  │                               │   │
│  └──────────────────────────────────┼───────────────────────────────┘   │
│                                     │                                    │
│  ┌──────────────────────────────────┼───────────────────────────────┐   │
│  │                      Control Panel│                               │   │
│  │                                   ▼                               │   │
│  │  ┌─────────────────────────────────────────────────────────┐    │   │
│  │  │  Image Controls                                          │    │   │
│  │  │  ┌────────────────────────┐  ┌───────────────────────┐ │    │   │
│  │  │  │ Color Mode             │  │ Image Size            │ │    │   │
│  │  │  │ - Grayscale (Original) │  │ - Tiny (32x32)        │ │    │   │
│  │  │  │ - RGB Color            │  │ - Small (64x64)       │ │    │   │
│  │  │  └────────────────────────┘  │ - Medium (128x128)    │ │    │   │
│  │  │                               │ - Large (256x256)     │ │    │   │
│  │  │                               │ - Original            │ │    │   │
│  │  │                               └───────────────────────┘ │    │   │
│  │  └─────────────────────────────────────────────────────────┘    │   │
│  │  ┌─────────────────────────────────────────────────────────┐    │   │
│  │  │  Image Uploader                                          │    │   │
│  │  │  - Upload custom image                                   │    │   │
│  │  │  - Sample images (Gradient, Checkerboard)               │    │   │
│  │  └─────────────────────────────────────────────────────────┘    │   │
│  │  ┌─────────────────────────────────────────────────────────┐    │   │
│  │  │  Export Button                                           │    │   │
│  │  │  - Download processed image                              │    │   │
│  │  └─────────────────────────────────────────────────────────┘    │   │
│  └──────────────────────────────────────────────────────────────────┘   │
│                                                                           │
└─────────────────────────────────────────────────────────────────────────┘
```

## Data Flow Diagram

```
┌────────────────┐
│  User Input    │
│  - Upload Image│
│  - Select Size │
│  - Color Mode  │
└───────┬────────┘
        │
        ▼
┌────────────────────────┐
│  Image Processing      │
│  1. Load Image         │◀────┐
│  2. Resize (if needed) │     │
│  3. Convert Color Mode │     │
└───────┬────────────────┘     │
        │                      │
        ▼                      │
┌────────────────────────┐     │
│  Store Image State     │     │
│  - Original Image      │     │
│  - Processed Image     │     │
└───────┬────────────────┘     │
        │                      │
        ▼                      │
┌────────────────────────┐     │
│  User Selects:         │     │
│  - Topic               │     │
│  - Operation           │     │
│  - Kernel (if custom)  │     │
└───────┬────────────────┘     │
        │                      │
        ▼                      │
┌────────────────────────┐     │
│ Kernel Configuration   │     │
│ - Size: 3x3 to 9x9    │     │
│ - Presets Available:   │     │
│   * Identity (all)     │     │
│   * Box Blur (all)     │     │
│   * Gaussian (all)     │     │
│   * Others (3x3 only)  │     │
└───────┬────────────────┘     │
        │                      │
        ▼                      │
┌────────────────────────┐     │
│  Convolution Process   │     │
│  1. Pad boundaries     │     │
│  2. Apply kernel       │     │
│  3. Normalize (if set) │     │
│  4. Clamp values 0-255 │     │
└───────┬────────────────┘     │
        │                      │
        ▼                      │
┌────────────────────────┐     │
│  Render to Canvas      │     │
│  - Fixed 512x512 size  │     │
│  - Pixelated rendering │     │
│  - Hover tooltip       │     │
│  - Animation overlay   │     │
└───────┬────────────────┘     │
        │                      │
        ▼                      │
┌────────────────────────┐     │
│  Display Result        │     │
│  - Input Image         │     │
│  - Kernel Matrix       │     │
│  - Output Image        │     │
└───────┬────────────────┘     │
        │                      │
        ▼                      │
┌────────────────────────┐     │
│  User Actions          │     │
│  - Export Image        │─────┘
│  - Change Parameters   │
│  - Upload New Image    │
└────────────────────────┘
```

## Component Hierarchy

```
App (Main Container)
│
├─ Header
│  ├─ Title
│  └─ Subtitle
│
├─ TopicSelector
│  └─ Topic Buttons (Convolution, Filtering, etc.)
│
├─ OperationSelector
│  └─ Operation Buttons (Box Blur, Gaussian, Edge Detect, etc.)
│
├─ Animation Toggle (Convolution only)
│
├─ ImageCanvas
│  ├─ Input Canvas (512x512 fixed)
│  ├─ Kernel Editor (conditional)
│  │  ├─ Preset Selector
│  │  ├─ Size Selector (3x3, 5x5, 7x7, 9x9)
│  │  ├─ Kernel Grid (editable cells)
│  │  └─ Normalize Checkbox
│  ├─ Output Canvas (512x512 fixed)
│  ├─ Hover Overlay (when enabled)
│  ├─ Animation Overlay (when animating)
│  └─ Animation Controls (when animating)
│
├─ InfoPanel
│  ├─ Operation Title
│  ├─ Description
│  ├─ Explanation
│  └─ Formula
│
├─ ControlPanel
│  ├─ Image Controls
│  │  └─ Color Mode Selector
│  ├─ ImageUploader
│  │  ├─ Size Selector
│  │  ├─ Drag & Drop Zone
│  │  └─ Sample Image Buttons
│  └─ ExportButton
│
└─ Footer
   └─ Copyright Notice
```

## Kernel Size Handling (Educational Correctness)

```
┌─────────────────────────────────────────────────────┐
│           Kernel Size Selection                      │
│                                                      │
│  User Selects Size: [3x3] [5x5] [7x7] [9x9]        │
│                                                      │
└─────────────────┬───────────────────────────────────┘
                  │
                  ▼
         ┌────────────────────┐
         │  Available Presets │
         │                    │
         │  3x3, 5x5, 7x7, 9x9│
         │  ─────────────────  │
         │  ✓ Identity        │ (Generated for size)
         │  ✓ Box Blur        │ (All 1s, any size)
         │  ✓ Gaussian Blur   │ (Computed, any size)
         │                    │
         │  3x3 ONLY:         │
         │  ✓ Sharpen         │ (Specific pattern)
         │  ✓ Edge Detect     │ (Specific pattern)
         │  ✓ Sobel H/V       │ (Specific pattern)
         │  ✓ Emboss          │ (Specific pattern)
         │  ✓ Outline         │ (Specific pattern)
         └────────────────────┘
```

## Image Size Management

```
┌───────────────────────────────────────────────────┐
│           Image Size Selection                     │
│                                                    │
│  Actual Image Data    │   Display Size            │
│  ─────────────────────┼──────────────────────     │
│  32x32  (Tiny)        │   512x512 (Fixed)         │
│  64x64  (Small)       │   512x512 (Fixed)         │
│  128x128 (Medium)     │   512x512 (Fixed)         │
│  256x256 (Large)      │   512x512 (Fixed)         │
│  Original             │   512x512 (Fixed)         │
│                                                    │
│  Benefits:                                         │
│  - Smaller images = Better pixel visualization    │
│  - Fixed display = Consistent UI                  │
│  - Pixelated rendering = Clear pixel boundaries   │
│  - Faster processing with smaller images          │
└───────────────────────────────────────────────────┘
```

## Processing Pipeline

```
Input Image
    ↓
[Color Mode Conversion] ← Grayscale (default) / RGB
    ↓
[Kernel Selection] ← Size-appropriate presets
    ↓
[Convolution Operation]
    ↓
    ├─ For each pixel (x, y):
    │   ├─ Extract neighborhood
    │   ├─ Apply kernel weights
    │   ├─ Sum weighted values
    │   ├─ Normalize (if enabled)
    │   └─ Clamp to [0, 255]
    ↓
[Render to Canvas] ← Fixed 512x512 display
    ↓
Output Image
```

---

© 2026 Dr. Vatsa S. Patel. All rights reserved.
