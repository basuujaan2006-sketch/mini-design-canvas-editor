# Deployment Guide - Mini Design Canvas Editor

This guide provides instructions for deploying the Mini Design Canvas Editor to Vercel or Netlify.

## Prerequisites

- A GitHub account (recommended for automatic deployments)
- A Vercel or Netlify account
- Git repository with your code pushed to GitHub

## Build Configuration

The project is already configured for production deployment:

- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Node Version**: 20 or higher

### Build Optimizations

The production build includes:
- Code minification using esbuild
- CSS minification
- Vendor code splitting (React/React-DOM in separate chunk)
- Console and debugger statements removed
- Source maps disabled for smaller bundle size

## Option 1: Deploy to Vercel

### Method A: Using Vercel CLI

1. Install Vercel CLI globally:
   ```bash
   npm install -g vercel
   ```

2. Login to Vercel:
   ```bash
   vercel login
   ```

3. Deploy from the project root:
   ```bash
   vercel
   ```

4. Follow the prompts:
   - Set up and deploy? **Y**
   - Which scope? Select your account
   - Link to existing project? **N**
   - Project name? Press Enter to use default or enter custom name
   - In which directory is your code located? **.**

5. For production deployment:
   ```bash
   vercel --prod
   ```

### Method B: Using Vercel Dashboard

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click "Add New Project"
3. Import your Git repository
4. Vercel will auto-detect the Vite framework
5. Verify the settings:
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
6. Click "Deploy"

### Vercel Configuration

The `vercel.json` file is already configured with:
- Build and output settings
- SPA routing (all routes redirect to index.html)

## Option 2: Deploy to Netlify

### Method A: Using Netlify CLI

1. Install Netlify CLI globally:
   ```bash
   npm install -g netlify-cli
   ```

2. Login to Netlify:
   ```bash
   netlify login
   ```

3. Initialize and deploy:
   ```bash
   netlify init
   ```

4. Follow the prompts:
   - Create & configure a new site
   - Choose your team
   - Site name (optional)
   - Build command: `npm run build`
   - Publish directory: `dist`

5. Deploy to production:
   ```bash
   netlify deploy --prod
   ```

### Method B: Using Netlify Dashboard

1. Go to [netlify.com](https://netlify.com) and sign in
2. Click "Add new site" → "Import an existing project"
3. Connect to your Git provider (GitHub, GitLab, Bitbucket)
4. Select your repository
5. Configure build settings:
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`
   - **Node version**: 20
6. Click "Deploy site"

### Netlify Configuration

The `netlify.toml` file is already configured with:
- Build command and publish directory
- SPA routing redirects
- Node.js version

## Testing the Deployment

After deployment, verify the following functionality:

### Core Features
- [ ] Canvas loads and displays correctly
- [ ] Add rectangle, text block, and image placeholder elements
- [ ] Select elements by clicking
- [ ] Drag elements to reposition
- [ ] Resize elements using handles
- [ ] Delete elements with Delete key
- [ ] Duplicate elements with Ctrl+D (Cmd+D on Mac)

### Advanced Features
- [ ] Snap-to-grid works during drag and resize
- [ ] Alignment guides appear when elements align
- [ ] Undo/Redo with Ctrl+Z and Ctrl+Shift+Z
- [ ] Properties panel displays and updates element properties
- [ ] Export canvas as PNG

### Browser Compatibility
Test on:
- [ ] Chrome/Edge (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)

## Continuous Deployment

Both Vercel and Netlify support automatic deployments:

1. **Push to main/master branch** → Automatic production deployment
2. **Push to other branches** → Automatic preview deployments
3. **Pull requests** → Automatic preview deployments with unique URLs

## Custom Domain (Optional)

### Vercel
1. Go to Project Settings → Domains
2. Add your custom domain
3. Configure DNS records as instructed

### Netlify
1. Go to Site Settings → Domain management
2. Add custom domain
3. Configure DNS records as instructed

## Environment Variables

This project doesn't require environment variables, but if needed in the future:

### Vercel
- Add in Project Settings → Environment Variables

### Netlify
- Add in Site Settings → Environment variables

## Troubleshooting

### Build Fails

1. Check Node.js version (should be 20+)
2. Clear cache and rebuild:
   - Vercel: Redeploy with "Clear cache and deploy"
   - Netlify: Site Settings → Build & deploy → Clear cache

### 404 Errors on Routes

- Verify SPA redirect rules are in place (vercel.json or netlify.toml)
- Both configuration files are already set up correctly

### Assets Not Loading

- Check that the build output directory is set to `dist`
- Verify all assets are in the dist folder after build

## Performance Optimization

The build is already optimized, but for further improvements:

1. Enable compression (both platforms do this automatically)
2. Configure CDN caching headers
3. Monitor bundle size with build output

## Monitoring

### Vercel
- Analytics available in dashboard
- Real-time logs in deployment details

### Netlify
- Analytics available (may require paid plan)
- Deploy logs in deployment details

## Support

- **Vercel Documentation**: https://vercel.com/docs
- **Netlify Documentation**: https://docs.netlify.com
- **Vite Documentation**: https://vitejs.dev

## Quick Reference

| Platform | CLI Command | Dashboard URL |
|----------|-------------|---------------|
| Vercel   | `vercel --prod` | https://vercel.com/dashboard |
| Netlify  | `netlify deploy --prod` | https://app.netlify.com |

---

**Note**: The production build removes console logs and debugger statements for optimal performance. For debugging deployed applications, use browser DevTools and network inspection.
