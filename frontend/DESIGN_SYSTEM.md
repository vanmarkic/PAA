# PAA Design System Documentation

## Overview

This design system is built with Tailwind CSS v4 and uses the OKLCH color space for precise color management with excellent accessibility support. The system follows WCAG 2.1 AA compliance standards.

## Design Tokens

### Color Palette

#### Brand Colors - Purple Gradient Theme
The primary brand identity uses a purple gradient with the following key colors:

- **Purple 500**: `oklch(0.627 0.265 303.9)` - Primary brand color (#8B5CF6 equivalent)
- **Purple 600**: `oklch(0.558 0.288 302.321)` - Mid-tone brand (#7C3AED equivalent)
- **Purple 700**: `oklch(0.496 0.265 301.924)` - Dark brand (#6D28D9 equivalent)

#### Semantic Colors

##### Light Mode
```css
--background: #ffffff
--foreground: oklch(0.145 0 0)
--primary: #030213
--primary-foreground: oklch(1 0 0)
--secondary: oklch(0.95 0.0058 264.53)
--secondary-foreground: #030213
--muted: #ececf0
--muted-foreground: #717182
--accent: #e9ebef
--accent-foreground: #030213
--destructive: #d4183d
--destructive-foreground: #ffffff
--border: rgba(0, 0, 0, 0.1)
--input: transparent
--input-background: #f3f3f5
--switch-background: #cbced4
--ring: oklch(0.708 0 0)
```

##### Dark Mode
```css
--background: oklch(0.145 0 0)
--foreground: oklch(0.985 0 0)
--primary: oklch(0.985 0 0)
--primary-foreground: oklch(0.205 0 0)
--secondary: oklch(0.269 0 0)
--secondary-foreground: oklch(0.985 0 0)
--muted: oklch(0.269 0 0)
--muted-foreground: oklch(0.708 0 0)
--accent: oklch(0.269 0 0)
--accent-foreground: oklch(0.985 0 0)
--destructive: oklch(0.396 0.141 25.723)
--destructive-foreground: oklch(0.637 0.237 25.331)
--border: oklch(0.269 0 0)
--input: oklch(0.269 0 0)
--ring: oklch(0.439 0 0)
```

#### Neutral Colors (Grays)
```css
--color-gray-50: oklch(0.985 0.002 247.839)
--color-gray-100: oklch(0.967 0.003 264.542)
--color-gray-200: oklch(0.928 0.006 264.531)
--color-gray-300: oklch(0.872 0.01 258.338)
--color-gray-400: oklch(0.707 0.022 261.325)
--color-gray-500: oklch(0.551 0.027 264.364)
--color-gray-600: oklch(0.446 0.03 256.802)
--color-gray-700: oklch(0.373 0.034 259.733)
--color-gray-800: oklch(0.278 0.033 256.848)
--color-gray-900: oklch(0.21 0.034 264.665)
```

#### Extended Color Palette

##### Red
```css
--color-red-100: oklch(0.936 0.032 17.717)
--color-red-200: oklch(0.885 0.062 18.334)
--color-red-300: oklch(0.808 0.114 19.571)
--color-red-500: oklch(0.637 0.237 25.331)
--color-red-700: oklch(0.505 0.213 27.518)
--color-red-800: oklch(0.444 0.177 26.899)
--color-red-900: oklch(0.396 0.141 25.723)
```

##### Blue
```css
--color-blue-50: oklch(0.97 0.014 254.604)
--color-blue-100: oklch(0.932 0.032 255.585)
--color-blue-200: oklch(0.882 0.059 254.128)
--color-blue-300: oklch(0.809 0.105 251.813)
--color-blue-400: oklch(0.707 0.165 254.624)
--color-blue-500: oklch(0.623 0.214 259.815)
--color-blue-600: oklch(0.546 0.245 262.881)
--color-blue-700: oklch(0.488 0.243 264.376)
--color-blue-800: oklch(0.424 0.199 265.638)
--color-blue-900: oklch(0.379 0.146 265.522)
```

##### Green
```css
--color-green-100: oklch(0.962 0.044 156.743)
--color-green-200: oklch(0.925 0.084 155.995)
--color-green-300: oklch(0.871 0.15 154.449)
--color-green-500: oklch(0.723 0.219 149.579)
--color-green-700: oklch(0.527 0.154 150.069)
--color-green-800: oklch(0.448 0.119 151.328)
--color-green-900: oklch(0.393 0.095 152.535)
```

##### Orange
```css
--color-orange-100: oklch(0.954 0.038 75.164)
--color-orange-200: oklch(0.901 0.076 70.697)
--color-orange-300: oklch(0.837 0.128 66.29)
--color-orange-500: oklch(0.705 0.213 47.604)
--color-orange-700: oklch(0.553 0.195 38.402)
--color-orange-800: oklch(0.47 0.157 37.304)
--color-orange-900: oklch(0.408 0.123 38.172)
```

##### Pink
```css
--color-pink-100: oklch(0.948 0.028 342.258)
--color-pink-300: oklch(0.823 0.12 346.018)
--color-pink-500: oklch(0.656 0.241 354.308)
--color-pink-700: oklch(0.525 0.223 3.958)
--color-pink-900: oklch(0.408 0.153 2.432)
```

##### Yellow
```css
--color-yellow-50: oklch(0.987 0.026 102.212)
--color-yellow-900: oklch(0.421 0.095 57.708)
```

#### Chart Colors
Optimized colors for data visualization:
```css
--chart-1: oklch(0.646 0.222 41.116)   // Orange
--chart-2: oklch(0.6 0.118 184.704)     // Cyan
--chart-3: oklch(0.398 0.07 227.392)    // Blue
--chart-4: oklch(0.828 0.189 84.429)    // Yellow
--chart-5: oklch(0.769 0.188 70.08)     // Yellow-Green
```

### Typography Scale

#### Font Sizes
```css
--text-xs: 0.75rem      // 12px
--text-sm: 0.875rem     // 14px
--text-base: 1rem       // 16px (base)
--text-lg: 1.125rem     // 18px
--text-xl: 1.25rem      // 20px
--text-2xl: 1.5rem      // 24px
--text-4xl: 2.25rem     // 36px
```

#### Font Weights
```css
--font-weight-normal: 400
--font-weight-medium: 500
--font-weight-semibold: 600
--font-weight-bold: 700
```

#### Line Heights
```css
--text-xs--line-height: 1.333  // 16px for 12px text
--text-sm--line-height: 1.429  // 20px for 14px text
--text-4xl--line-height: 1.111 // 40px for 36px text
--leading-relaxed: 1.625       // Relaxed line height
```

#### Font Families
```css
--font-sans: ui-sans-serif, system-ui, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji"
--font-mono: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace
```

### Spacing System

The spacing system is based on a 0.25rem (4px) base unit:

```css
--spacing: 0.25rem  // Base unit (4px)

// Common spacing values:
// spacing * 1  = 0.25rem  = 4px
// spacing * 2  = 0.5rem   = 8px
// spacing * 3  = 0.75rem  = 12px
// spacing * 4  = 1rem     = 16px
// spacing * 6  = 1.5rem   = 24px
// spacing * 8  = 2rem     = 32px
// spacing * 12 = 3rem     = 48px
// spacing * 16 = 4rem     = 64px
// spacing * 20 = 5rem     = 80px
// spacing * 24 = 6rem     = 96px
```

### Border Radius Values

```css
--radius: 0.625rem  // Base radius (10px)
--radius-sm: calc(var(--radius) - 4px)  // 6px
--radius-md: calc(var(--radius) - 2px)  // 8px
--radius-lg: var(--radius)              // 10px
--radius-xl: calc(var(--radius) + 4px)  // 14px
```

Utility classes:
- `.rounded`: 0.25rem (4px)
- `.rounded-lg`: var(--radius) (10px)
- `.rounded-xl`: calc(var(--radius) + 4px) (14px)
- `.rounded-full`: 9999px (full circle)

### Shadow Values

```css
// Shadow-sm
0 1px 3px 0 rgb(0 0 0 / 0.1),
0 1px 2px -1px rgb(0 0 0 / 0.1)

// Shadow-md
0 4px 6px -1px rgb(0 0 0 / 0.1),
0 2px 4px -2px rgb(0 0 0 / 0.1)

// Shadow-lg
0 10px 15px -3px rgb(0 0 0 / 0.1),
0 4px 6px -4px rgb(0 0 0 / 0.1)
```

### Container Widths

```css
--container-2xl: 42rem   // 672px
--container-3xl: 48rem   // 768px
--container-4xl: 56rem   // 896px
--container-7xl: 80rem   // 1280px
```

### Animation & Transitions

```css
--default-transition-duration: 0.15s
--default-transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1)
```

### Sidebar Theme

The sidebar component has its own themed variables:

#### Light Mode Sidebar
```css
--sidebar: oklch(0.985 0 0)
--sidebar-foreground: oklch(0.145 0 0)
--sidebar-primary: #030213
--sidebar-primary-foreground: oklch(0.985 0 0)
--sidebar-accent: oklch(0.97 0 0)
--sidebar-accent-foreground: oklch(0.205 0 0)
--sidebar-border: oklch(0.922 0 0)
--sidebar-ring: oklch(0.708 0 0)
```

#### Dark Mode Sidebar
```css
--sidebar: oklch(0.205 0 0)
--sidebar-foreground: oklch(0.985 0 0)
--sidebar-primary: oklch(0.488 0.243 264.376)
--sidebar-primary-foreground: oklch(0.985 0 0)
--sidebar-accent: oklch(0.269 0 0)
--sidebar-accent-foreground: oklch(0.985 0 0)
--sidebar-border: oklch(0.269 0 0)
--sidebar-ring: oklch(0.439 0 0)
```

## Accessibility Features

### WCAG 2.1 AA Compliance
- All color combinations meet minimum contrast ratios
- Focus states are clearly visible with ring styles
- Interactive elements have appropriate hover and focus states
- Text sizes are legible (minimum 12px)

### Dark Mode Support
- Full dark mode implementation with semantic color mapping
- Uses CSS custom properties for easy theme switching
- Automatic dark mode detection via `.dark` class
- Tailwind v4 dark variant: `dark:` prefix

### Focus Management
```css
// Ring styles for keyboard navigation
--ring: oklch(0.708 0 0)  // Light mode
--ring: oklch(0.439 0 0)  // Dark mode

// Focus utility
.focus\:ring-2:focus {
  box-shadow: 0 0 0 calc(2px + var(--tw-ring-offset-width)) var(--tw-ring-color);
}
```

## Usage with Tailwind CSS v4

### Custom Variant for Dark Mode
```css
@custom-variant dark (&:is(.dark *));
```

### Theme Integration
The design system integrates with Tailwind v4 using the `@theme` directive:

```css
@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  // ... all other tokens mapped
}
```

### Responsive Breakpoints
- `sm:` - 640px (40rem)
- `md:` - 768px (48rem)
- `lg:` - 1024px (64rem)

## Implementation Notes

1. **OKLCH Color Space**: The design system uses OKLCH for perceptually uniform color adjustments and better accessibility.

2. **CSS Custom Properties**: All design tokens are exposed as CSS custom properties for maximum flexibility.

3. **Tailwind v4 Features**: Utilizes modern Tailwind v4 features like `@custom-variant`, `@theme inline`, and improved dark mode support.

4. **Progressive Enhancement**: Uses `@supports` queries for modern CSS features with fallbacks.

5. **Performance**: Optimized with CSS custom properties for efficient theme switching without JavaScript.

## File Structure

```
frontend/
├── src/
│   ├── styles/
│   │   └── globals.css  // Global styles and theme variables
│   └── index.css        // Tailwind CSS v4 base and utilities
└── DESIGN_SYSTEM.md     // This documentation
```

## Migration from Figmapaa

This design system has been successfully migrated from the Figmapaa project, preserving:
- Exact OKLCH color values
- Purple gradient brand theme (#8B5CF6, #7C3AED, #6D28D9)
- All accessibility features
- Complete dark mode support
- Typography scale and spacing system