

// Configuration for different environments and subdomains
export const config = {
  // Base URL for assets
  baseUrl: process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000",
  
  // Blog configuration
  blogId: process.env.NEXT_PUBLIC_BLOG_ID || "clvlugru90000o4g8ahxp069s",
  
  // Blog categories
  categories: [
    {
      label: "Foundation Model",
      tag: "foundation-model",
      description: "Insights on powerful AI models at the foundation of tech.",
    },
    {
      label: "Engineering",
      tag: "engineering",
      description: "Innovative engineering driving AI advancements.",
    },
    {
      label: "Jobs",
      tag: "jobs",
      description: "Explore AI job trends and opportunities shaping a brighter future.",
    },
    {
      label: "Startups",
      tag: "startup",
      description: "Spotlight on innovative AI startups transforming industries.",
    },
    {
      label: "Ethics",
      tag: "ethics",
      description: "Promoting responsible AI for positive impact.",
    },
  ],
  
  // Main site configuration
  main: {
    url: process.env.NEXT_PUBLIC_SITE_URL || 'https://nebulark.net',
    title: 'Nebulark - Creative Digital Solutions',
    description: 'Leading digital agency specializing in design, development, and innovation',
  },
  
  // Academy subdomain configuration
  academy: {
    url: process.env.NEXT_PUBLIC_ACADEMY_URL || 'https://academy.nebulark.net',
    title: 'Nebulark Academy - Learn Design & Development',
    description: 'Master the art of design and development with expert-led courses',
    theme: {
      primaryColor: '#007bff',
      secondaryColor: '#6f42c1',
      particleColor: 'hsl(200-260, 70%, 60%)', // Blue to purple range
    },
  },
  
  // Studio subdomain configuration
  studio: {
    url: process.env.NEXT_PUBLIC_STUDIO_URL || 'https://studio.nebulark.net',
    title: 'Nebulark Studio - Creative Digital Services',
    description: 'Where creativity meets innovation - Professional design and development services',
    theme: {
      primaryColor: '#6f42c1',
      secondaryColor: '#e83e8c',
      particleColor: 'hsl(300-420, 80%, 70%)', // Purple to pink range
    },
  },
};

// Helper function to get current subdomain
export const getCurrentSubdomain = (host: string): 'main' | 'academy' | 'studio' => {
  if (host.startsWith('academy.')) return 'academy';
  if (host.startsWith('studio.')) return 'studio';
  return 'main';
};

// Helper function to get current config
export const getCurrentConfig = (host: string) => {
  const subdomain = getCurrentSubdomain(host);
  return config[subdomain];
};
