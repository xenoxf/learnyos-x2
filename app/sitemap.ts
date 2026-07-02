import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://learnyos.vercel.app';
  const now = new Date();

  const publicRoutes = [
    {
      url: appUrl,
      lastModified: now,
      changeFrequency: 'weekly' as const,
      priority: 1,
    },
    {
      url: `${appUrl}/auth`,
      lastModified: now,
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    },
    {
      url: `${appUrl}/terms.html`,
      lastModified: now,
      changeFrequency: 'monthly' as const,
      priority: 0.3,
    },
    {
      url: `${appUrl}/privacy.html`,
      lastModified: now,
      changeFrequency: 'monthly' as const,
      priority: 0.3,
    },
    {
      url: `${appUrl}/about`,
      lastModified: now,
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    },
  ];

  const studyRoutes = [
    {
      url: `${appUrl}/study`,
      lastModified: now,
      changeFrequency: 'daily' as const,
      priority: 0.9,
    },
    {
      url: `${appUrl}/study/chat`,
      lastModified: now,
      changeFrequency: 'daily' as const,
      priority: 0.8,
    },
    {
      url: `${appUrl}/study/quiz`,
      lastModified: now,
      changeFrequency: 'daily' as const,
      priority: 0.8,
    },
    {
      url: `${appUrl}/study/exam`,
      lastModified: now,
      changeFrequency: 'daily' as const,
      priority: 0.8,
    },
    {
      url: `${appUrl}/study/flashcards`,
      lastModified: now,
      changeFrequency: 'daily' as const,
      priority: 0.8,
    },
    {
      url: `${appUrl}/study/notes`,
      lastModified: now,
      changeFrequency: 'daily' as const,
      priority: 0.8,
    },
    {
      url: `${appUrl}/study/settings`,
      lastModified: now,
      changeFrequency: 'monthly' as const,
      priority: 0.4,
    },
    {
      url: `${appUrl}/study/espacio`,
      lastModified: now,
      changeFrequency: 'weekly' as const,
      priority: 0.5,
    },
    {
      url: `${appUrl}/study/espacio/creditos`,
      lastModified: now,
      changeFrequency: 'daily' as const,
      priority: 0.5,
    },
    {
      url: `${appUrl}/study/espacio/rendimiento`,
      lastModified: now,
      changeFrequency: 'daily' as const,
      priority: 0.5,
    },
    {
      url: `${appUrl}/study/espacio/funciones/flashcards`,
      lastModified: now,
      changeFrequency: 'daily' as const,
      priority: 0.6,
    },
    {
      url: `${appUrl}/study/espacio/funciones/quizzes`,
      lastModified: now,
      changeFrequency: 'daily' as const,
      priority: 0.6,
    },
    {
      url: `${appUrl}/study/espacio/funciones/notas`,
      lastModified: now,
      changeFrequency: 'daily' as const,
      priority: 0.6,
    },
  ];

  return [...publicRoutes, ...studyRoutes];
}
