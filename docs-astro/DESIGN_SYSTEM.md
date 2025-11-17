# PAA Design System - Figmapaa Port

## Overview

The complete Figmapaa design system has been successfully ported to the Astro SSG project. This includes all UI components, OKLCH color palette, and the purple gradient brand theme.

## What Was Ported

### 1. Design System Files
- **`src/styles/globals.css`** - Core design tokens and CSS custom properties
- **`src/styles/index.css`** - Tailwind v4 imports and base styles
- **`src/styles/main.css`** - Main CSS entry point combining all styles

### 2. UI Components (48 Components)
All Radix UI components from Figmapaa have been copied to `src/components/ui/`:

- Accordion
- Alert Dialog
- Alert
- Aspect Ratio
- Avatar
- Badge
- Breadcrumb
- Button
- Calendar
- Card
- Carousel
- Chart
- Checkbox
- Collapsible
- Command
- Context Menu
- Dialog
- Drawer
- Dropdown Menu
- Form
- Hover Card
- Input OTP
- Input
- Label
- Menubar
- Navigation Menu
- Pagination
- Popover
- Progress
- Radio Group
- Resizable
- Scroll Area
- Select
- Separator
- Sheet
- Sidebar
- Skeleton
- Slider
- Sonner
- Switch
- Table
- Tabs
- Textarea
- Toggle Group
- Toggle
- Tooltip
- use-mobile (hook)
- utils

### 3. Configuration
- **`tailwind.config.mjs`** - Configured for Tailwind v4 with OKLCH colors
- **`astro.config.mjs`** - Already configured for React and Tailwind integration

## Design Features

### OKLCH Color Palette
The design system uses modern OKLCH colors for better color consistency:

- **Purple Brand Colors**: Full spectrum from purple-50 to purple-900
- **Semantic Colors**: Success (green), Info (blue), Warning (orange), Error (red)
- **Neutral Colors**: Gray scale from 50 to 900
- **Gradients**: Purple gradient theme (from-purple-500 to-purple-700)

### Design Tokens
All design tokens are available as CSS variables:
- `--background`, `--foreground`
- `--primary`, `--secondary`, `--accent`
- `--muted`, `--destructive`
- `--border`, `--ring`
- `--chart-1` through `--chart-5`
- `--radius` (with sm, md, lg, xl variants)

### Typography
- Font sizes: `--text-xs` through `--text-4xl`
- Font weights: `--font-weight-normal` (400), `--font-weight-medium` (500)
- Base font size: 16px

## Using Components in Astro

### Basic Usage
```astro
---
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
---

<Button client:load>Click me</Button>

<Card client:load>
  <CardHeader>
    <CardTitle>Card Title</CardTitle>
  </CardHeader>
  <CardContent>
    Content goes here
  </CardContent>
</Card>
```

### Client Directives
React components need client directives for interactivity:
- `client:load` - Load and hydrate immediately
- `client:idle` - Load when main thread is idle
- `client:visible` - Load when component is visible
- `client:only="react"` - Skip SSR, render only on client

## Test Pages

Two pages have been created for testing and documentation:

1. **`/design-system`** - Complete design system documentation
   - Color palette showcase
   - Component library overview
   - Usage instructions
   - Design tokens reference

2. **`/test-components`** - Interactive component testing
   - Tests all interactive features
   - Verifies state management
   - Confirms styling integration

## Important Notes

- **No Dark Mode**: Dark mode has been removed as requested
- **React Islands**: All components work as React islands in Astro
- **Tailwind v4**: Using Tailwind CSS v4 beta with native OKLCH support
- **Purple Theme**: The signature purple gradient is preserved throughout

## File Structure

```
docs-astro/
├── src/
│   ├── components/
│   │   ├── ui/           # All 48 Radix UI components
│   │   └── TestDesignSystem.tsx  # Test component
│   ├── styles/
│   │   ├── globals.css   # Design tokens
│   │   ├── index.css     # Tailwind v4 imports
│   │   └── main.css      # Main CSS entry
│   └── pages/
│       ├── design-system.astro  # Design documentation
│       └── test-components.astro # Component testing
└── tailwind.config.mjs   # Tailwind configuration
```

## Next Steps

The design system is fully integrated and ready for use. You can:
1. Start using components in your Astro pages
2. Customize the color palette if needed
3. Add new custom components following the same patterns
4. Build production-ready pages with the consistent design system