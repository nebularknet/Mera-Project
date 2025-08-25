# Nebulark Subdomain Setup Guide

This guide explains how to set up subdomains for your Nebulark website, transitioning from route-based URLs to dedicated subdomains.

## 🎯 What We're Setting Up

**Before (Route-based):**
- `nebulark.net` - Main site
- `nebulark.net/academy` - Academy page
- `nebulark.net/studio` - Studio page

**After (Subdomain-based):**
- `nebulark.net` - Main site
- `academy.nebulark.net` - Academy subdomain
- `studio.nebulark.net` - Studio subdomain

## 🚀 Quick Setup

### 1. Run the Deployment Script
```bash
./deploy.sh
```

This script will:
- Install dependencies
- Build the project
- Deploy to Vercel
- Provide next steps

### 2. Manual Setup (Alternative)

If you prefer manual setup:

```bash
# Install dependencies
npm install --legacy-peer-deps

# Build project
npm run build

# Deploy to Vercel
vercel --prod
```

## 🌐 DNS Configuration

### Step 1: Add Domains in Vercel

1. Go to your Vercel dashboard
2. Select your project
3. Go to "Settings" → "Domains"
4. Add these domains:
   - `nebulark.net`
   - `academy.nebulark.net`
   - `studio.nebulark.net`

### Step 2: Update DNS Records

In your domain provider (Cloudflare, GoDaddy, etc.), add these records:

#### For Cloudflare:
```
Type: CNAME
Name: academy
Target: your-project.vercel.app
Proxy: DNS only (gray cloud)
TTL: Auto

Type: CNAME
Name: studio
Target: your-project.vercel.app
Proxy: DNS only (gray cloud)
TTL: Auto
```

#### For GoDaddy/Other Providers:
```
Type: CNAME
Name: academy
Value: your-project.vercel.app
TTL: 300

Type: CNAME
Name: studio
Value: your-project.vercel.app
TTL: 300
```

## 🔧 Technical Details

### How It Works

1. **Middleware Routing**: The `src/middleware.ts` file detects the subdomain and routes accordingly
2. **Next.js Configuration**: `next.config.ts` handles redirects for backward compatibility
3. **Environment Variables**: Different configurations for each subdomain

### File Structure
```
src/
├── middleware.ts          # Subdomain routing logic
├── config.ts             # Environment-specific configs
├── app/
│   ├── page.tsx          # Main landing page
│   ├── academy/
│   │   └── page.tsx      # Academy page
│   └── studio/
│       └── page.tsx      # Studio page
```

### Middleware Logic
```typescript
// academy.nebulark.net → /academy
// studio.nebulark.net → /studio
// nebulark.net → main site
```

## 🎨 Customization

### Theme Configuration
Each subdomain has its own theme:

**Academy (`academy.nebulark.net`):**
- Primary: Blue (#007bff)
- Secondary: Purple (#6f42c1)
- Particles: Blue to purple range

**Studio (`studio.nebulark.net`):**
- Primary: Purple (#6f42c1)
- Secondary: Pink (#e83e8c)
- Particles: Purple to pink range

### Content Updates
- **Academy**: Edit `src/app/academy/page.tsx`
- **Studio**: Edit `src/app/studio/page.tsx`
- **Main Site**: Edit `src/app/page.tsx`

## 📱 Testing

### Local Testing
```bash
# Test locally
npm run dev

# Test subdomains locally (add to /etc/hosts)
127.0.0.1 academy.nebulark.net
127.0.0.1 studio.nebulark.net
```

### Production Testing
After deployment, test these URLs:
- `https://nebulark.net`
- `https://academy.nebulark.net`
- `https://studio.nebulark.net`

## 🔍 Troubleshooting

### Common Issues

1. **Subdomain not working**
   ```bash
   # Check DNS propagation
   dig academy.nebulark.net
   dig studio.nebulark.net
   ```

2. **Middleware not working**
   - Clear browser cache
   - Check Vercel function logs
   - Verify middleware configuration

3. **Build errors**
   ```bash
   # Check build logs
   vercel logs
   
   # Test build locally
   npm run build
   ```

### DNS Propagation
DNS changes can take up to 48 hours to propagate globally. You can check propagation using:
- [whatsmydns.net](https://whatsmydns.net)
- [dnschecker.org](https://dnschecker.org)

## 🔄 Backward Compatibility

The setup includes redirects for backward compatibility:
- `nebulark.net/academy` → `academy.nebulark.net`
- `nebulark.net/studio` → `studio.nebulark.net`

This ensures existing links continue to work.

## 📞 Support

If you encounter issues:

1. Check the deployment logs: `vercel logs`
2. Verify DNS settings in your domain provider
3. Ensure all environment variables are set correctly
4. Check the build output for any errors

## 🎉 Success Checklist

- [ ] Project deployed to Vercel
- [ ] Custom domains added in Vercel dashboard
- [ ] DNS records updated in domain provider
- [ ] DNS propagation completed
- [ ] All subdomains accessible
- [ ] Backward compatibility working
- [ ] Content customized for each subdomain

## 📚 Additional Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Middleware](https://nextjs.org/docs/app/building-your-application/routing/middleware)
- [DNS Configuration Guide](https://vercel.com/docs/concepts/projects/custom-domains)
