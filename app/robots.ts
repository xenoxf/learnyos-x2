import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://learnyos.vercel.app';

  return {
    rules: {
      userAgent: '*',
      allow: ['/'],
      disallow: [
        '/study/',
        '/auth/callback',
        '/api/',
      ],
    },
    sitemap: `${appUrl}/sitemap.xml`,
  };
}
