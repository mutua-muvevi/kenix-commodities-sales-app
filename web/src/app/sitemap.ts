import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://kenixcommodities.co.ke'

  const routes = [
    '',
    '/about',
    '/services',
    '/contact',
    '/products',
    '/retailers',
    '/solutions',
    '/privacy',
    '/terms',
    '/admin',
    '/sales', 
    '/retailer'
  ]

  return routes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: route === '' ? 'daily' : route.includes('admin') || route.includes('sales') || route.includes('retailer') ? 'hourly' : 'weekly',
    priority: route === '' ? 1 : route.includes('about') || route.includes('services') ? 0.8 : 0.6,
  }))
}