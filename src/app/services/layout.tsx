import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Professional Services - Nebulark | Web Development, AI Solutions & Digital Marketing',
  description: 'Comprehensive digital services including web development, AI solutions, mobile apps, digital marketing, blockchain development, and cybersecurity. Expert team delivering innovative technology solutions.',
  keywords: 'web development, AI solutions, mobile app development, digital marketing, blockchain, cybersecurity, graphics design, content writing, ecommerce development',
  openGraph: {
    title: 'Professional Services - Nebulark',
    description: 'Expert digital services: Web development, AI solutions, mobile apps, digital marketing & more.',
    url: 'https://nebulark.net/services',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Professional Services - Nebulark',
    description: 'Expert digital services: Web development, AI solutions, mobile apps, digital marketing & more.',
  }
};

export default function ServicesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
