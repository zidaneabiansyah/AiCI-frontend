import { Metadata } from "next";
import ArtikelClient from "./ArtikelClient";
import { fetchArticles } from "@/lib/serverFetch";

export const metadata: Metadata = {
    title: "Artikel",
    description: "Artikel dan berita terbaru seputar kegiatan dan perkembangan teknologi di AiCi.",
};

export const revalidate = 1800;

export default async function Page() {
    const articlesData = await fetchArticles();
    return <ArtikelClient initialData={articlesData} />;
}
