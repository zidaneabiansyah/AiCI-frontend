import { Metadata } from "next";
import { api } from "@/lib/api";
import ArtikelDetailClient from "./ArtikelDetailClient";

type Props = {
    params: { slug: string }
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    try {
        const article = await api.content.articleBySlug(params.slug);
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

export default function Page() {
    return <ArtikelDetailClient />;
}
