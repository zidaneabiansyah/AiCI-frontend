"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Image from "next/image";
import Link from "next/link";
import { api, BackendArticle } from "@/lib/api";

/**
 * Artikel Detail Page
 * 
 * Menampilkan detail artikel berdasarkan slug.
 * Data diambil dari API /content/articles/{slug}/
 */

export default function ArtikelDetailPage() {
    const params = useParams();
    const slug = params.slug as string;
    
    const [article, setArticle] = useState<BackendArticle | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (slug) {
            fetchArticle();
        }
    }, [slug]);

    const fetchArticle = async () => {
        try {
            const data = await api.content.articleBySlug(slug);
            setArticle(data);
        } catch (err) {
            console.error("Failed to fetch article:", err);
            setError("Artikel tidak ditemukan");
        } finally {
            setLoading(false);
        }
    };

    // Format date
    const formatDate = (dateString: string | null) => {
        if (!dateString) return "";
        return new Date(dateString).toLocaleDateString("id-ID", {
            day: "numeric",
            month: "long",
            year: "numeric",
        });
    };

    if (loading) {
        return (
            <main className="min-h-screen">
                <Navbar />
                <div className="pt-24 pb-16 max-w-5xl mx-auto px-6">
                    <div className="animate-pulse">
                        <div className="h-8 bg-gray-200 rounded w-3/4 mb-4" />
                        <div className="h-4 bg-gray-200 rounded w-1/4 mb-8" />
                        <div className="aspect-video bg-gray-200 rounded-2xl mb-8" />
                        <div className="space-y-3">
                            <div className="h-4 bg-gray-200 rounded" />
                            <div className="h-4 bg-gray-200 rounded" />
                            <div className="h-4 bg-gray-200 rounded w-5/6" />
                        </div>
                    </div>
                </div>
                <Footer />
            </main>
        );
    }

    if (error || !article) {
        return (
            <main className="min-h-screen">
                <Navbar />
                <div className="pt-24 pb-16 max-w-5xl mx-auto px-6 text-center">
                    <div className="py-20">
                        <svg className="w-20 h-20 mx-auto text-primary/20 mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <h1 className="text-2xl font-bold text-primary mb-2">Artikel Tidak Ditemukan</h1>
                        <p className="text-primary/60 mb-8">Maaf, artikel yang Anda cari tidak tersedia.</p>
                        <Link href="/artikel" className="inline-block bg-secondary text-white px-6 py-3 rounded-full font-bold hover:opacity-90 transition-all">
                            Kembali ke Artikel
                        </Link>
                    </div>
                </div>
                <Footer />
            </main>
        );
    }

    return (
        <main className="min-h-screen">
            <Navbar />
            
            {/* Article Header */}
            <section className="pt-24 pb-8 bg-primary">
                <div className="max-w-5xl mx-auto px-6">
                    <Link href="/artikel" className="inline-flex items-center gap-2 text-white/60 hover:text-white mb-6 transition-colors">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                        Kembali ke Artikel
                    </Link>
                    
                    <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
                        {article.title}
                    </h1>
                    
                    <div className="flex items-center gap-4 text-white/60 text-sm">
                        <span>{article.author}</span>
                        <span>•</span>
                        <span>{formatDate(article.published_at)}</span>
                    </div>
                </div>
            </section>

            {/* Featured Image */}
            <div className="max-w-5xl mx-auto px-6 -mt-4">
                <div className="relative aspect-video rounded-2xl overflow-hidden shadow-xl">
                    <Image
                        src={article.thumbnail}
                        alt={article.title}
                        fill
                        className="object-cover"
                        sizes="(max-width: 1024px) 100vw, 1024px"
                        priority
                    />
                </div>
            </div>

            {/* Article Content */}
            <section className="py-12">
                <div className="max-w-5xl mx-auto px-6">
                    {/* Excerpt */}
                    <p className="text-xl text-primary/70 leading-relaxed mb-8 italic border-l-4 border-secondary pl-6">
                        {article.excerpt}
                    </p>
                    
                    {/* Content */}
                    <div className="prose prose-lg max-w-none prose-headings:text-primary prose-p:text-primary/70 prose-a:text-secondary">
                        {/* Render content - for now just as text, later can use markdown parser */}
                        {article.content?.split('\n\n').map((paragraph, index) => (
                            <p key={index} className="mb-4 text-primary/70 leading-relaxed">
                                {paragraph}
                            </p>
                        ))}
                    </div>
                    
                    {/* Share Section */}
                    <div className="mt-12 pt-8 border-t border-gray-100">
                        <p className="text-primary/40 text-sm mb-4">Bagikan artikel ini:</p>
                        <div className="flex gap-3">
                            <a
                                href={`https://wa.me/?text=${encodeURIComponent(article.title + ' - ' + window?.location?.href)}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center text-white hover:opacity-90 transition-all"
                            >
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654z"/>
                                </svg>
                            </a>
                            <a
                                href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(article.title)}&url=${encodeURIComponent(window?.location?.href || '')}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-10 h-10 bg-black rounded-full flex items-center justify-center text-white hover:opacity-90 transition-all"
                            >
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                                </svg>
                            </a>
                            <button
                                onClick={() => {
                                    navigator.clipboard.writeText(window?.location?.href || '');
                                    alert('Link berhasil disalin!');
                                }}
                                className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center text-primary hover:bg-gray-300 transition-all"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            <Footer />
        </main>
    );
}
