"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { api, BackendArticle } from "@/lib/api";
import Skeleton, { ImageSkeleton } from "@/components/ui/Skeleton";

/**
 * Artikel Page
 * 
 * Menampilkan daftar artikel dalam bentuk grid cards (3 kolom).
 * Berdasarkan design reference: grid dengan thumbnail, judul, excerpt.
 * 
 * PANDUAN:
 * - Data artikel diambil dari API /content/articles/
 * - Pagination belum diimplementasikan sepenuhnya (hanya show page 1)
 */

export default function ArtikelPage() {
    const [articles, setArticles] = useState<BackendArticle[]>([]);
    const [loading, setLoading] = useState(true);
    const [nextPage, setNextPage] = useState<string | null>(null);
    const [prevPage, setPrevPage] = useState<string | null>(null);

    const fetchArticles = async (params?: string) => {
        setLoading(true);
        // Scroll to top of grid
        if (typeof window !== 'undefined' && params) {
            const grid = document.getElementById('articles-grid');
            if (grid) grid.scrollIntoView({ behavior: 'smooth' });
        }
        
        try {
            const res = await api.articles.list(params);
            setArticles(res.data);
            setNextPage(null);
            setPrevPage(null);
        } catch (err) {
            console.error("Failed to fetch articles", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchArticles();
    }, []);

    const handlePageChange = (url: string) => {
        const urlObj = new URL(url);
        const params = urlObj.searchParams.toString();
        fetchArticles(params);
    };

    const formatDate = (dateString: string | null) => {
        if (!dateString) return "";
        return new Date(dateString).toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        });
    };

    return (
        <main className="min-h-screen bg-gray-50">
            <Navbar />
            
            {/* Hero Section */}
            <section className="pt-48 pb-48 relative bg-linear-to-b from-primary to-primary/90 overflow-hidden">
                {/* Wave Decoration */}
                <div className="absolute bottom-0 left-0 right-0 z-10 pointer-events-none">
                    <svg viewBox="0 0 1440 320" className="w-full h-20 md:h-32 text-gray-50 opacity-100" preserveAspectRatio="none">
                        <path fill="currentColor" fillOpacity="1" d="M0,96L48,112C96,128,192,160,288,160C384,160,480,128,576,112C672,96,768,96,864,112C960,128,1056,160,1152,160C1248,160,1344,128,1392,112L1440,96L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
                    </svg>
                </div>
                
                {/* Background Pattern */}
                <div className="absolute inset-0 opacity-10 bg-[url('/grid.svg')] z-0"></div>

                <div className="max-w-7xl mx-auto px-6 relative z-20 text-center">
                    <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                        AiCi Update
                    </h1>
                    <p className="text-white/80 max-w-2xl mx-auto text-lg">
                        Berita dan artikel terbaru seputar kegiatan, program, dan pencapaian AiCi.
                    </p>
                </div>
            </section>

            {/* Articles Grid */}
            <section id="articles-grid" className="py-16 bg-gray-50 min-h-[50vh]">
                <div className="max-w-7xl mx-auto px-6">
                    {loading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {[...Array(6)].map((_, i) => (
                                <div key={i} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 flex flex-col h-full">
                                    <ImageSkeleton className="aspect-video" />
                                    <div className="p-6 space-y-4 flex-1">
                                        <Skeleton className="h-3 w-24" />
                                        <Skeleton className="h-6 w-3/4" />
                                        <div className="space-y-2">
                                            <Skeleton className="h-4 w-full" />
                                            <Skeleton className="h-4 w-5/6" />
                                        </div>
                                        <Skeleton className="h-4 w-24 mt-auto" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : articles.length === 0 ? (
                        <div className="text-center py-20 text-gray-400">
                            <p>Belum ada artikel.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {articles.map((article) => (
                                <Link
                                    key={article.id}
                                    href={`/artikel/${article.slug}`}
                                    className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-shadow group border border-gray-100 flex flex-col h-full"
                                >
                                    {/* Thumbnail */}
                                    <div className="relative aspect-video bg-gray-200">
                                        <Image
                                            src={article.thumbnail || '/placeholder-image.jpg'}
                                            alt={article.title}
                                            fill
                                            className="object-cover transition-none"
                                            sizes="(max-width: 768px) 100vw, 33vw"
                                        />
                                        {/* Overlay */}
                                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors"></div>
                                    </div>
                                    
                                    {/* Content */}
                                    <div className="p-6 flex flex-col flex-1">
                                        <span className="text-primary/60 text-xs uppercase tracking-wider font-semibold">
                                            {formatDate(article.published_at || article.created_at)}
                                        </span>
                                        <h2 className="text-lg font-bold text-primary mt-2 mb-3 group-hover:text-secondary transition-colors line-clamp-2">
                                            {article.title}
                                        </h2>
                                        <p className="text-gray-600 text-sm line-clamp-3 leading-relaxed mb-4">
                                            {article.excerpt}
                                        </p>
                                        <span className="text-secondary text-xs font-bold uppercase tracking-widest mt-auto">
                                            Baca Selengkapnya
                                        </span>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                    
                    {/* Pagination */}
                    {!loading && (prevPage || nextPage) && (
                        <div className="flex justify-center gap-4 mt-16">
                            <button 
                                onClick={() => prevPage && handlePageChange(prevPage)}
                                disabled={!prevPage}
                                className="px-6 py-2 rounded-full border border-primary text-primary font-bold hover:bg-primary hover:text-white transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                            >
                                Sebelumnya
                            </button>
                            <button 
                                onClick={() => nextPage && handlePageChange(nextPage)}
                                disabled={!nextPage}
                                className="px-6 py-2 rounded-full bg-primary text-white font-bold hover:bg-primary/90 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                            >
                                Selanjutnya
                            </button>
                        </div>
                    )}
                </div>
            </section>

            <Footer />
        </main>
    );
}
