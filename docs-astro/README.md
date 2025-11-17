# PAA Documentation Site - Astro SSG

This is the static documentation site for PAA (Plateforme d'Aide Administrative), built with Astro, React, and Tailwind CSS v4. Built for 100% static site generation and optimized for GitHub Pages deployment.

## ✨ Features

- **100% Static Site Generation (SSG)** - Pre-rendered at build time for optimal performance
- **React Integration** - Full React component support with TypeScript
- **Tailwind CSS v4** - Latest version with custom theme configuration
- **Radix UI Components** - Accessible, unstyled UI components
- **Dark Mode Support** - Built-in theme switching
- **TypeScript** - Full type safety throughout the project
- **Optimized Build** - Automatic code splitting and lazy loading

## 🛠 Tech Stack

- [Astro 4.15](https://astro.build/) - Static Site Generator
- [React 18](https://react.dev/) - UI Component Library
- [Tailwind CSS v4](https://tailwindcss.com/) - Utility-first CSS Framework
- [Radix UI](https://www.radix-ui.com/) - Headless UI Components
- [TypeScript 5.5](https://www.typescriptlang.org/) - Type Safety
- [Lucide Icons](https://lucide.dev/) - Icon Library
- [Class Variance Authority](https://cva.style/) - Component Variants

## 🌐 Live Site

The documentation is automatically deployed to: https://vanmarkic.github.io/PAA/

## 🚀 Quick Start

### Prerequisites
- Node.js 20+
- npm

### Local Development

```bash
# Install dependencies (from docs-astro directory)
npm install

# Start development server (includes metadata generation)
npm run dev

# Open http://localhost:4444 in your browser
```

The dev server will:
1. Generate workflow metadata from TypeScript machines
2. Copy metadata to public directory
3. Start Astro dev server with hot reload

## 📦 Building for Production

### Manual Build

```bash
# From docs-astro directory
npm run build

# Preview production build locally
npm run preview
```

### What Happens During Build

1. **Metadata Generation**: Runs `scripts/generateMachinesMetadata.ts` to extract metadata from all XState machines
2. **Copy Metadata**: Copies generated `machines-metadata.json` to `public/` directory
3. **Astro Build**: Builds static site with:
   - Base path `/PAA/` for GitHub Pages
   - Static HTML/CSS/JS output to `dist/`
   - Code splitting for optimal performance

## 🚢 Deployment

### Automatic Deployment (GitHub Actions)

The site is automatically deployed to GitHub Pages when:
- Code is pushed to the `main` branch
- Manual deployment is triggered from GitHub Actions tab

The deployment workflow (`.github/workflows/deploy-docs.yml`):
1. Checks out the repository
2. Installs dependencies for both root and docs-astro
3. Builds TypeScript (required for metadata generation)
4. Generates workflow metadata
5. Builds Astro site with production settings
6. Deploys to GitHub Pages

### Manual Deployment

If you need to deploy manually:

```bash
# 1. Build the site
npm run build

# 2. The dist/ directory contains the static site
# 3. Deploy dist/ contents to any static hosting service
```

### GitHub Pages Configuration

The repository must have GitHub Pages enabled:
1. Go to Settings → Pages
2. Source: GitHub Actions (not branch)
3. The workflow will handle deployment automatically

## 🔄 Updating Workflow Metadata

The site dynamically loads workflow metadata from XState machines. To update:

### Automatic (During Build)
Metadata is automatically regenerated during:
- `npm run dev` - For development
- `npm run build` - For production
- GitHub Actions deployment

### Manual Regeneration
```bash
# From root directory
npm run docs:metadata

# Copy to docs-astro (if not using npm scripts)
cp docs/machines-metadata.json docs-astro/public/
```

### Adding New Workflows

1. Create new XState machine in `src/workflows/*Machine.ts`
2. Follow naming convention: `*Machine.ts`
3. Include JSDoc comments for documentation:
   ```typescript
   /**
    * Machine Name
    *
    * Description of what this workflow does
    */
   ```
4. Metadata will be extracted automatically on next build

## 📁 Project Structure

```
docs-astro/
├── src/
│   ├── pages/          # Astro pages (routes)
│   ├── components/     # React components
│   │   └── ui/        # Reusable UI components (Button, Card, etc.)
│   ├── layouts/        # Page layouts
│   ├── lib/           # Utility functions (cn, utils)
│   ├── styles/        # Global styles
│   │   └── tailwind.css  # Tailwind CSS v4 configuration
│   └── env.d.ts       # TypeScript environment definitions
├── public/             # Static assets
│   └── machines-metadata.json  # Generated workflow metadata
├── dist/               # Production build output
├── astro.config.mjs    # Astro configuration
├── tsconfig.json      # TypeScript configuration
└── package.json        # Dependencies and scripts
```

## ⚙️ Configuration

### Astro Configuration (`astro.config.mjs`)

Key settings for GitHub Pages:
- `output: 'static'` - Generate static HTML
- `base: '/PAA/'` - Base path for GitHub Pages (repo name)
- `site: 'https://vanmarkic.github.io'` - GitHub Pages URL

### Environment-Based Configuration

The base path is only applied in production:
```javascript
base: process.env.NODE_ENV === 'production' ? '/PAA' : '/'
```

This allows local development at `http://localhost:4444/` while production uses `/PAA/`.

## 🛠️ Development Workflow

### Making Changes

1. **Edit Components/Pages**: Changes in `src/` are hot-reloaded
2. **Update Workflows**: Changes to XState machines require metadata regeneration
3. **Test Locally**: Use `npm run dev` for development
4. **Build Check**: Run `npm run build` to verify production build
5. **Commit & Push**: Changes to `main` trigger automatic deployment

### Testing Production Build Locally

```bash
# Build with production settings
NODE_ENV=production npm run build

# Preview at http://localhost:4321/PAA/
npm run preview
```

Note: Preview server uses different port and includes base path.

## 🐛 Troubleshooting

### Metadata Not Updating
- Ensure TypeScript is built: `npm run build` (in root)
- Check metadata generation: `npm run docs:metadata` (in root)
- Verify file exists: `docs-astro/public/machines-metadata.json`

### Build Failures
- Clear cache: `npm run clean`
- Reinstall dependencies: `rm -rf node_modules && npm install`
- Check Node version: Should be 20+

### GitHub Pages Not Updating
- Check Actions tab for deployment status
- Verify Pages settings use "GitHub Actions" source
- Wait 2-3 minutes for CDN propagation
- Try hard refresh (Ctrl+Shift+R) or incognito mode

### Local Development Issues
- Port conflict: Change port in `astro.config.mjs`
- File watching issues: Restart dev server
- Import errors: Check tsconfig paths and aliases

## 📚 Resources

- [Astro Documentation](https://docs.astro.build)
- [GitHub Pages Documentation](https://docs.github.com/en/pages)
- [XState Documentation](https://xstate.js.org/docs/)

## 🔧 Maintenance

### Regular Tasks
- Update dependencies: `npm update`
- Check for Astro updates: `npm outdated`
- Review workflow metadata accuracy
- Monitor build times and optimize if needed

### Performance Optimization
- Code splitting configured for workflow chunks
- Static assets cached by GitHub Pages
- Metadata loaded asynchronously
- Images optimized during build

## 📝 License

Part of the PAA project - see root LICENSE file.
