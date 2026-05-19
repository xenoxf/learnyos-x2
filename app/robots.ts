import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://learnyos.vercel.app';

  return {
    rules: [
      {
        userAgent: '*',
        allow: [
          '/',
          '/about',
          '/study',
          '/study/chat',
          '/study/quiz',
          '/study/exam',
          '/study/flashcards',
          '/study/notes',
          '/study/espacio',
          '/terms.html',
          '/privacy.html',
        ],
        disallow: [
          '/study/quiz/[id]',
          '/study/exam/[id]',
          '/study/notes/[id]',
          '/auth/callback',
          '/api/',
          '/study/settings',
          '/study/espacio/creditos',
          '/study/espacio/rendimiento',
          '/study/espacio/funciones/',
        ],
      },
      {
        userAgent: 'GPTBot',
        allow: [
          '/',
          '/about',
          '/study',
          '/terms.html',
          '/privacy.html',
        ],
        disallow: [
          '/auth/',
          '/study/quiz/',
          '/study/exam/',
          '/study/flashcards/',
          '/study/notes/',
          '/study/espacio/',
        ],
      },
      {
        userAgent: 'ChatGPT-User',
        allow: [
          '/',
          '/about',
          '/study',
        ],
        disallow: [
          '/auth/',
        ],
      },
      {
        userAgent: 'Google-Extended',
        allow: [
          '/',
          '/about',
          '/study',
        ],
        disallow: [
          '/auth/',
        ],
      },
      {
        userAgent: 'CCBot',
        allow: [
          '/',
          '/about',
        ],
        disallow: [
          '/study/',
          '/auth/',
        ],
      },
    ],
    sitemap: `${appUrl}/sitemap.xml`,
  };
}
