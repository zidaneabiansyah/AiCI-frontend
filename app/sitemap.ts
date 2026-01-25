import { MetadataRoute } from 'next';
import { api } from '@/lib/api';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const staticRoutes: MetadataRoute.Sitemap = [
        { url: `${BASE_URL}/`, lastModified: new Date(), changeFrequency: 'daily', priority: 1 },
        { url: `${BASE_URL}/profil`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
        { url: `${BASE_URL}/program`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
        { url: `${BASE_URL}/fasilitas`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
        { url: `${BASE_URL}/galeri`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.7 },
        { url: `${BASE_URL}/artikel`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
        { url: `${BASE_URL}/riset`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6 },
        { url: `${BASE_URL}/kontak`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
    ];

    try {
        // Fetch all dynamic content for indexing
        const [articles, projects] = await Promise.all([
            api.content.articles(),
            api.projects.list(),
        ]);

        const articleRoutes: MetadataRoute.Sitemap = articles.results.map((article) => ({
            url: `${BASE_URL}/artikel/${article.slug}`,
            lastModified: new Date(article.published_at || article.created_at),
            changeFrequency: 'monthly',
            priority: 0.7,
        }));

        const projectRoutes: MetadataRoute.Sitemap = projects.results.map((project) => ({
            url: `${BASE_URL}/showcase/${project.id}`, // Note: update if project detail page exists
            lastModified: new Date(project.created_at),
            changeFrequency: 'monthly',
            priority: 0.6,
        }));

        return [...staticRoutes, ...articleRoutes, ...projectRoutes];
    } catch (error) {
        console.error("Failed to generate sitemap:", error);
        return staticRoutes;
    }
}
