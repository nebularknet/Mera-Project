# Nebulark Subdomain Deployment Guide

This guide explains how to deploy the Nebulark website with subdomains for Academy and Studio.

## 🚀 Current Structure

- **Main Site**: `nebulark.net` - Landing page with services, about, etc.
- **Academy**: `academy.nebulark.net` - Learning platform and courses
- **Studio**: `studio.nebulark.net` - Creative services and portfolio

## 📁 Page Structure

```
src/app/
├── page.tsx              # Main landing page (nebulark.net)
├── academy/
│   └── page.tsx          # Academy page (academy.nebulark.net)
└── studio/
    └── page.tsx          # Studio page (studio.nebulark.net)
```

## 🌐 Subdomain Setup

### 1. DNS Configuration

Configure your domain provider (Cloudflare, GoDaddy, etc.) with these DNS records:

```
Type    Name           Value                    TTL
A       @              [Vercel IP]              Auto
CNAME   academy        [Your Vercel Domain]     300
CNAME   studio         [Your Vercel Domain]     300
```

**Example with Cloudflare:**
```
Type: CNAME
Name: academy
Target: your-project.vercel.app
Proxy: DNS only (gray cloud)
TTL: Auto
```

### 2. Vercel Project Configuration

#### Option A: Single Project (Recommended)
Deploy everything to one Vercel project and use middleware for subdomain routing:

```bash
# Deploy to main project
vercel --prod
```

#### Option B: Separate Projects
Create separate Vercel projects for each subdomain:

```bash
# Academy subdomain
cd academy-subdomain
vercel --name nebulark-academy
vercel --prod

# Studio subdomain  
cd studio-subdomain
vercel --name nebulark-studio
vercel --prod
```

### 3. Environment Variables

Create `.env.local` for each environment:

```env
# Main site
NEXT_PUBLIC_SITE_URL=https://nebulark.net
NEXT_PUBLIC_ACADEMY_URL=https://academy.nebulark.net
NEXT_PUBLIC_STUDIO_URL=https://studio.nebulark.net

# Academy specific
NEXT_PUBLIC_SITE_TYPE=academy
NEXT_PUBLIC_ACADEMY_URL=https://academy.nebulark.net

# Studio specific
NEXT_PUBLIC_SITE_TYPE=studio
NEXT_PUBLIC_STUDIO_URL=https://studio.nebulark.net
```

## 🔧 Technical Implementation

### Middleware Configuration
The `src/middleware.ts` file handles subdomain routing:

```typescript
// Automatically routes:
// academy.nebulark.net → /academy
// studio.nebulark.net → /studio
// nebulark.net → main site
```

### Next.js Configuration
The `next.config.ts` includes redirects for backward compatibility:

```typescript
// Redirects old routes to subdomains
/academy → https://academy.nebulark.net
/studio → https://studio.nebulark.net
```

## 🎨 Features Implemented

### Academy Page (`academy.nebulark.net`)
- ✅ Particle animation with blue/purple theme
- ✅ Learning paths (Design, Web Dev, Mobile Dev)
- ✅ Features section with benefits
- ✅ Modern card-based layout
- ✅ Responsive design

### Studio Page (`studio.nebulark.net`)
- ✅ Particle animation with purple/pink theme
- ✅ Creative services showcase
- ✅ Portfolio preview with existing projects
- ✅ Creative process workflow
- ✅ Service badges and categories

## 🚀 Deployment Steps

### 1. Prepare Your Project
```bash
# Install dependencies
npm install --legacy-peer-deps

# Build project
npm run build

# Test locally
npm run dev
```

### 2. Deploy to Vercel
```bash
# Deploy to production
vercel --prod

# Link to existing project
vercel link

# Deploy to specific project
vercel --prod --name your-project-name
```

### 3. Configure Custom Domains
In Vercel Dashboard:
1. Go to your project settings
2. Navigate to "Domains"
3. Add custom domains:
   - `nebulark.net`
   - `academy.nebulark.net`
   - `studio.nebulark.net`

### 4. Update DNS Records
After adding domains in Vercel, update your DNS provider with the provided records.

## 🎯 Customization

### Particle Themes
- **Main**: White particles (default)
- **Academy**: Blue to purple range (`hsl(200-260, 70%, 60%)`)
- **Studio**: Purple to pink range (`hsl(300-420, 80%, 70%)`)

### Content Updates
- Edit `src/app/academy/page.tsx` for Academy content
- Edit `src/app/studio/page.tsx` for Studio content
- Update images in `public/img/` directory

## 📱 Testing

Test each subdomain:
- `nebulark.net` - Main landing page
- `academy.nebulark.net` - Academy page
- `studio.nebulark.net` - Studio page

## 🔄 Updates

To update content:
1. Edit the respective page files
2. Commit changes to git
3. Deploy with `vercel --prod`

## 🎨 Design System

All pages use:
- Bootstrap 5 for layout
- Custom particle animations
- Consistent typography (IBM Plex Sans)
- Responsive design principles
- Modern card-based UI components

## 📞 Support

For deployment issues:
1. Check Vercel logs: `vercel logs`
2. Verify DNS settings
3. Ensure environment variables are set
4. Check build output for errors

## 🔍 Troubleshooting

### Common Issues:

1. **Subdomain not working**
   - Check DNS propagation (can take up to 48 hours)
   - Verify CNAME records are correct
   - Ensure Vercel domain is properly configured

2. **Middleware not working**
   - Clear browser cache
   - Check Vercel function logs
   - Verify middleware matcher configuration

3. **Build errors**
   - Check for TypeScript errors
   - Verify all dependencies are installed
   - Check Vercel build logs

### DNS Propagation Check:
```bash
# Check if DNS is propagated
dig academy.nebulark.net
dig studio.nebulark.net
```
