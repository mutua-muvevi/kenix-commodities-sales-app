import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://kenixcommodities.co.ke'

  return {
    rules: [
      {
        userAgent: '*',
        allow: [
          '/',
          '/about',
          '/services', 
          '/contact',
          '/products',
          '/retailers',
          '/solutions',
        ],
        disallow: [
          '/admin/',
          '/api/',
          '/dashboard/',
          '/sales/',
          '/retailer/',
          '/_next/',
          '/private/',
        ],
      },
      {
        userAgent: 'Googlebot',
        allow: [
          '/',
          '/about',
          '/services',
          '/contact',
          '/products',
          '/retailers', 
          '/solutions',
        ],
        disallow: [
          '/admin/',
          '/api/',
          '/dashboard/',
          '/sales/',
          '/retailer/',
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}