import { MetadataRoute } from 'next';
import { api } from '@/lib/api';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

export const revalidate = 86400;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    try {
        // Fetch all dynamic content for indexing
        const articlesRes = await api.articles.list();

        const articleRoutes: MetadataRoute.Sitemap = articlesRes.data.map((article) => ({
            url: `${BASE_URL}/artikel/${article.slug}`,
            lastModified: new Date(article.published_at || article.created_at),
            changeFrequency: 'monthly' as const,
            priority: 0.7,
        }));

        return articleRoutes;
    } catch (error) {
        console.error("Failed to generate dynamic sitemap:", error);
        return [];
    }
}
