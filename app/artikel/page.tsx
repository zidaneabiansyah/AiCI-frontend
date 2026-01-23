import { Metadata } from "next";
import ArtikelClient from "./ArtikelClient";

export const metadata: Metadata = {
    title: "Artikel",
    description: "Artikel dan berita terbaru seputar kegiatan dan perkembangan teknologi di AiCi.",
};

export default function Page() {
    return <ArtikelClient />;
}
