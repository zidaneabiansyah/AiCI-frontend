import { Metadata } from "next";
import { api } from "@/lib/api";
import ArtikelDetailClient from "./ArtikelDetailClient";

type Props = {
    params: Promise<{ slug: string }>
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { slug } = await params;
    try {
        const response = await api.content.articleBySlug(slug);
        const article = response.data;
        return {
            title: article.title,
            description: article.excerpt,
            openGraph: {
                images: [article.thumbnail || ""],
            },
        };
    } catch (error) {
        return {
            title: "Artikel Tidak Ditemukan",
        };
    }
}

export default async function Page({ params }: Props) {
    const { slug } = await params;
    return <ArtikelDetailClient />;
}
