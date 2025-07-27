# Nebulark Blog Integrated

A modern web application that combines the Nebulark landing page with a Next.js corporate blog starter. This project showcases a creative design agency's portfolio while maintaining a professional blog for content marketing.

## Features

### Landing Page
- **Hero Section**: Animated particles background with company branding
- **About Us**: Company information and mission statement
- **Values**: Core company values and principles
- **Services**: Service offerings with detailed descriptions
- **Products**: Portfolio showcase with hover effects
- **Responsive Design**: Mobile-first approach with Bootstrap components

### Blog Functionality
- **Modern Blog**: Built with Next.js 15 and TypeScript
- **Content Management**: Integrated with Wisp CMS
- **SEO Optimized**: Open Graph images and metadata
- **Search & Filter**: Advanced content filtering capabilities
- **Pagination**: Efficient content navigation
- **Comments**: Interactive comment system

## Technology Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS, Bootstrap 5
- **UI Components**: Radix UI, React Bootstrap
- **Animations**: TSParticles for particle effects
- **Content Management**: Wisp CMS integration
- **Icons**: Lucide React, React Icons

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd nebulark-blog-integrated
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
nebulark-blog-integrated/
├── src/
│   ├── app/
│   │   ├── blog/           # Blog pages and functionality
│   │   ├── globals.css     # Global styles
│   │   ├── landing.css     # Landing page styles
│   │   └── layout.tsx      # Root layout
│   ├── components/
│   │   ├── LandingPage.tsx # Main landing page component
│   │   └── ...             # Blog components
│   └── lib/                # Utility functions
├── public/                 # Static assets
│   ├── img/               # Portfolio images
│   └── ...                # Other assets
└── package.json
```

## Pages

- **Home (`/`)**: Landing page with company information
- **Blog (`/blog`)**: Corporate blog with articles and posts
- **Individual Posts (`/post/[slug]`)**: Individual blog post pages

## Customization

### Styling
- Landing page styles are in `src/app/landing.css`
- Blog styles use Tailwind CSS
- Bootstrap components are used for responsive design

### Content
- Blog content is managed through Wisp CMS
- Landing page content can be modified in `src/components/LandingPage.tsx`
- Images and assets are stored in the `public/` directory

### Configuration
- Blog configuration is in `src/config.ts`
- Environment variables for CMS integration
- Metadata and SEO settings in layout files

## Deployment

### Vercel (Recommended)
1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Other Platforms
The project can be deployed to any platform that supports Next.js:
- Netlify
- Railway
- DigitalOcean App Platform
- AWS Amplify

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the documentation

---

**Nebulark** - Designing Solutions for Tomorrow

