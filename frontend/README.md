# PAA Frontend

Modern React-based frontend for the Plateforme d'Aide Administrative (PAA) system.

## Features

- **React 18** with TypeScript for type-safe development
- **Vite** for lightning-fast development and optimized builds
- **Radix UI** component library for accessible, unstyled components
- **Tailwind CSS** for utility-first styling
- **XState** integration for state machine visualization
- **Dark mode** support with theme toggle
- **Responsive design** for mobile, tablet, and desktop
- **Multi-language** support (FR, NL, DE)

## Tech Stack

- **Framework:** React 18.3 + TypeScript 5.2
- **Build Tool:** Vite 6.3
- **UI Components:** Radix UI (complete suite)
- **Styling:** Tailwind CSS 4.0 Alpha + CSS Modules
- **State Management:** React hooks + Context API
- **Charts:** Recharts 2.15
- **Forms:** React Hook Form 7.55
- **Icons:** Lucide React

## Quick Start

### Prerequisites

- Node.js 18+ and npm 9+
- Backend API running on port 3000 (optional for full functionality)

### Installation

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env.local
```

### Development

```bash
# Start development server
npm run dev

# Server runs at http://localhost:5173
```

### Production Build

```bash
# Build for production
npm run build

# Preview production build locally
npm run preview

# Build outputs to ./dist directory
```

## Environment Configuration

### Development (.env.local)

```env
# Copy from .env.example and adjust as needed
VITE_API_URL=http://localhost:3000
VITE_APP_ENV=development
VITE_ENABLE_DEBUG_MODE=true
```

### Production (.env.production)

```env
# Production settings
VITE_API_URL=https://api.paa.belgium.be
VITE_APP_ENV=production
VITE_ENABLE_DEBUG_MODE=false
```

### Available Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_API_URL` | Backend API URL | http://localhost:3000 |
| `VITE_API_TIMEOUT` | API request timeout (ms) | 30000 |
| `VITE_APP_NAME` | Application name | Plateforme d'Aide Administrative |
| `VITE_APP_ENV` | Environment (development/production) | development |
| `VITE_DEFAULT_LOCALE` | Default language | fr |
| `VITE_ENABLE_AUTH` | Enable authentication | true |
| `VITE_ENABLE_ANALYTICS` | Enable analytics tracking | false |
| `VITE_ENABLE_DEBUG_MODE` | Enable debug features | false |

## Project Structure

```
frontend/
├── src/
│   ├── components/       # React components
│   │   ├── ui/          # Radix UI components
│   │   ├── Home.tsx     # Homepage component
│   │   ├── BenefitsGuide.tsx
│   │   ├── ComparisonTool.tsx
│   │   ├── DeveloperDocs.tsx
│   │   ├── MachineDetail.tsx
│   │   └── WorkflowWizard.tsx
│   ├── pages/           # Page components
│   ├── data/            # Static data and types
│   ├── styles/          # Global styles
│   ├── App.tsx          # Main app component
│   ├── main.tsx         # Application entry point
│   └── index.css        # Global CSS with Tailwind
├── public/              # Static assets
├── dist/                # Production build output
├── .env.example         # Environment variables template
├── .env.production      # Production environment
├── package.json         # Dependencies and scripts
├── tsconfig.json        # TypeScript configuration
├── tailwind.config.js   # Tailwind CSS configuration
├── vite.config.ts       # Vite configuration
└── postcss.config.js    # PostCSS configuration
```

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server on port 5173 |
| `npm run build` | Build for production with optimizations |
| `npm run preview` | Preview production build locally |
| `npm run typecheck` | Run TypeScript type checking |

## Build Optimization

The production build includes:

- **Code splitting** for optimal loading performance
- **Tree shaking** to remove unused code
- **Minification** with Terser
- **Source maps** for debugging
- **Asset optimization** with content hashing
- **Manual chunks** for better caching:
  - `react-vendor`: React core libraries
  - `radix-ui`: Radix UI components
  - `ui-utils`: Utility libraries (clsx, tailwind-merge)
  - `charts`: Recharts library
  - `state`: XState library

### Bundle Size Analysis

Current production build sizes (gzipped):

- Main bundle: ~45 KB
- UI components: ~14 KB
- CSS: ~14 KB
- Total: ~73 KB

## Development Workflow

### 1. Component Development

```bash
# Create new component
touch src/components/MyComponent.tsx

# Use Radix UI components
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
```

### 2. Styling with Tailwind

```tsx
// Use Tailwind utility classes
<div className="flex items-center justify-between p-4 bg-background">
  <h1 className="text-2xl font-bold text-foreground">Title</h1>
</div>
```

### 3. Dark Mode Support

```tsx
// Components automatically support dark mode
// Toggle with the theme switcher in the UI
```

### 4. API Integration

```tsx
// API calls proxy through Vite dev server
fetch('/api/benefits')
  .then(res => res.json())
  .then(data => console.log(data))
```

## Testing

### Manual Testing Checklist

#### Pages and Navigation
- [ ] Homepage loads correctly
- [ ] All navigation links work
- [ ] Page transitions are smooth
- [ ] 404 page displays for invalid routes

#### Responsive Design
- [ ] Mobile view (320px - 768px)
- [ ] Tablet view (768px - 1024px)
- [ ] Desktop view (1024px+)
- [ ] Components scale appropriately

#### UI Components
- [ ] Buttons are clickable and show hover states
- [ ] Forms validate input correctly
- [ ] Modals/dialogs open and close properly
- [ ] Accordions expand/collapse smoothly
- [ ] Tooltips display on hover
- [ ] Dark mode toggle works

#### API Integration
- [ ] API health check passes
- [ ] Data fetching shows loading states
- [ ] Error states display correctly
- [ ] Proxy configuration works in development

### Browser Compatibility

Tested and supported on:
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Integration with Backend

### Running the Full Stack

```bash
# Terminal 1: Start backend services
docker-compose up -d  # PostgreSQL and Redis
npm run dev:api       # API server on port 3000

# Terminal 2: Start frontend
cd frontend
npm run dev          # Frontend on port 5173

# Access the application
open http://localhost:5173
```

### API Proxy Configuration

The Vite dev server proxies API requests to the backend:

- `/api/*` → `http://localhost:3000/api/*`
- `/docs/*` → `http://localhost:3000/docs/*`

This configuration is in `vite.config.ts`.

## Deployment

### Static Hosting (Netlify, Vercel, etc.)

1. Build the application:
   ```bash
   npm run build
   ```

2. Deploy the `dist` directory to your hosting service

3. Configure environment variables on the hosting platform

4. Set up redirects for SPA routing:
   ```
   /* /index.html 200
   ```

### Docker Deployment

```dockerfile
# Dockerfile example
FROM node:18-alpine as builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

## Troubleshooting

### Common Issues

#### Development server won't start
- Check if port 5173 is already in use
- Clear node_modules and reinstall: `rm -rf node_modules && npm install`

#### API requests failing
- Ensure backend is running on port 3000
- Check proxy configuration in `vite.config.ts`
- Verify CORS settings if accessing different domain

#### Build errors
- Run `npm run typecheck` to identify TypeScript issues
- Check for missing dependencies
- Ensure all imports are correct

#### Styling issues
- Clear browser cache
- Check Tailwind configuration
- Verify CSS import order in `main.tsx`

### Debug Mode

Enable debug mode by setting environment variable:
```bash
VITE_ENABLE_DEBUG_MODE=true npm run dev
```

This enables:
- Verbose console logging
- Component render tracking
- API request/response logging

## Contributing

### Code Style

- Use TypeScript for all new components
- Follow React best practices and hooks guidelines
- Use Tailwind utilities over custom CSS
- Implement proper error boundaries
- Add JSDoc comments for complex functions

### Component Guidelines

- Keep components small and focused
- Use Radix UI components for accessibility
- Implement proper loading and error states
- Support both light and dark themes
- Ensure responsive design

### Git Workflow

```bash
# Create feature branch
git checkout -b feature/my-feature

# Make changes and commit
git add .
git commit -m "feat: add new feature"

# Push to remote
git push origin feature/my-feature
```

## Performance Metrics

- **Lighthouse Score:** 95+ Performance
- **First Contentful Paint:** < 1.5s
- **Time to Interactive:** < 3.5s
- **Bundle Size:** < 100KB gzipped

## Resources

- [React Documentation](https://react.dev)
- [Vite Documentation](https://vitejs.dev)
- [Radix UI Documentation](https://www.radix-ui.com)
- [Tailwind CSS Documentation](https://tailwindcss.com)
- [TypeScript Documentation](https://www.typescriptlang.org)

## License

Part of the PAA project - see main project license.

## Support

For issues and questions:
- Check the [troubleshooting section](#troubleshooting)
- Review the [main PAA documentation](../README.md)
- Open an issue in the project repository