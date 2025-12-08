import { Metadata } from 'next'

export const siteConfig = {
  name: 'Kenix Commodities',
  description: 'Kenya\'s leading B2B e-commerce platform revolutionizing retail by streamlining access to essential goods for both formal and informal retailers across Nairobi and Kenya.',
  url: process.env.NEXT_PUBLIC_SITE_URL || 'https://kenixcommodities.co.ke',
  ogImage: '/images/og-image.jpg',
  creator: 'Kenix Commodities',
  keywords: [
    'B2B e-commerce Kenya',
    'wholesale goods Kenya', 
    'retail suppliers Nairobi',
    'essential goods distribution',
    'inventory management Kenya',
    'same-day delivery Nairobi',
    'small business suppliers',
    'retail platform Kenya',
    'wholesale marketplace',
    'business goods Kenya'
  ],
  authors: [
    {
      name: 'Kenix Commodities',
      url: 'https://kenixcommodities.co.ke',
    },
  ],
  openGraph: {
    type: 'website',
    locale: 'en_KE',
    alternateLocale: ['sw_KE'],
    url: process.env.NEXT_PUBLIC_SITE_URL,
    siteName: 'Kenix Commodities',
    title: 'Kenix Commodities - Kenya\'s Premier B2B E-commerce Platform',
    description: 'Revolutionizing retail in Kenya through streamlined access to essential goods, efficient inventory management, and reliable same-day delivery across Nairobi.',
    images: [
      {
        url: '/images/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Kenix Commodities - B2B E-commerce Platform Kenya',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Kenix Commodities - Kenya\'s Premier B2B E-commerce Platform',
    description: 'Revolutionizing retail in Kenya through streamlined access to essential goods and reliable same-day delivery.',
    images: ['/images/og-image.jpg'],
    creator: '@kenixcommodities',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
    yandex: process.env.NEXT_PUBLIC_YANDEX_VERIFICATION,
  },
}

export function generateSEO({
  title,
  description,
  image = siteConfig.ogImage,
  noIndex = false,
  keywords,
  canonical,
}: {
  title?: string
  description?: string
  image?: string
  noIndex?: boolean
  keywords?: string[]
  canonical?: string
} = {}): Metadata {
  const seoTitle = title 
    ? `${title} | ${siteConfig.name}`
    : `${siteConfig.name} - Kenya's Premier B2B E-commerce Platform`

  const seoDescription = description || siteConfig.description
  const seoKeywords = keywords || siteConfig.keywords

  return {
    title: seoTitle,
    description: seoDescription,
    keywords: seoKeywords,
    authors: siteConfig.authors,
    creator: siteConfig.creator,
    openGraph: {
      ...siteConfig.openGraph,
      title: seoTitle,
      description: seoDescription,
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: seoTitle,
        },
      ],
      url: canonical || siteConfig.url,
    },
    twitter: {
      ...siteConfig.twitter,
      title: seoTitle,
      description: seoDescription,
      images: [image],
    },
    robots: noIndex ? 'noindex,nofollow' : siteConfig.robots,
    canonical: canonical,
    alternates: {
      canonical: canonical || siteConfig.url,
      languages: {
        'en-KE': '/en',
        'sw-KE': '/sw',
      },
    },
  }
}

export const structuredData = {
  organization: {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Kenix Commodities',
    alternateName: 'Kenix Holdings',
    url: siteConfig.url,
    logo: `${siteConfig.url}/images/logo.png`,
    description: siteConfig.description,
    foundingDate: '2019',
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Nairobi',
      addressLocality: 'Nairobi',
      addressRegion: 'Nairobi County',
      addressCountry: 'KE',
    },
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: '+254-700-000-000',
      contactType: 'customer service',
      areaServed: 'KE',
      availableLanguage: ['English', 'Swahili'],
    },
    sameAs: [
      'https://www.facebook.com/kenixcommodities',
      'https://www.twitter.com/kenixcommodities',
      'https://www.linkedin.com/company/kenixcommodities',
    ],
  },
  website: {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Kenix Commodities',
    url: siteConfig.url,
    description: siteConfig.description,
    inLanguage: 'en-KE',
    potentialAction: {
      '@type': 'SearchAction',
      target: `${siteConfig.url}/search?q={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
  },
  ecommerce: {
    '@context': 'https://schema.org',
    '@type': 'Store',
    name: 'Kenix Commodities',
    description: 'B2B e-commerce platform for essential goods in Kenya',
    url: siteConfig.url,
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Nairobi',
      addressRegion: 'Nairobi County',
      addressCountry: 'KE',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: -1.2921,
      longitude: 36.8219,
    },
    openingHours: 'Mo-Fr 08:00-18:00',
    priceRange: '$$',
    paymentAccepted: ['M-Pesa', 'Cash', 'Credit Card'],
    currenciesAccepted: 'KES',
  },
}