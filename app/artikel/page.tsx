"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Image from "next/image";
import Link from "next/link";

/**
 * Artikel Page
 * 
 * Menampilkan daftar artikel dalam bentuk grid cards (3 kolom).
 * Berdasarkan design reference: grid dengan thumbnail, judul, excerpt.
 * 
 * PANDUAN:
 * - Data artikel akan diambil dari API /content/articles/
 * - Untuk sekarang menggunakan placeholder
 * - Pagination bisa ditambahkan nanti
 */

// Placeholder articles
const articles = [
    {
        slug: "ai-day-2024",
        title: "AI Day 2024: Menginspirasi Generasi Muda",
        excerpt: "Kegiatan AI Day 2024 sukses diselenggarakan dengan antusiasme tinggi dari para peserta didik.",
        thumbnail: "https://images.unsplash.com/photo-1509062522246-3755977927d7?q=80&w=400",
        date: "20 Jan 2024",
    },
    {
        slug: "workshop-guru-smk",
        title: "Workshop Peningkatan Kompetensi Guru SMK",
        excerpt: "AiCi bekerjasama dengan Dikdasmen menyelenggarakan workshop AI untuk guru SMK.",
        thumbnail: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=400",
        date: "15 Jan 2024",
    },
    {
        slug: "robot-competition",
        title: "Kompetisi Robot Nasional 2024",
        excerpt: "Siswa didik AiCi berhasil meraih juara dalam kompetisi robot tingkat nasional.",
        thumbnail: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?q=80&w=400",
        date: "10 Jan 2024",
    },
    {
        slug: "partnership-fmipa",
        title: "Kerjasama Baru dengan FMIPA UI",
        excerpt: "AiCi memperluas kerjasama dengan FMIPA UI untuk pengembangan kurikulum AI.",
        thumbnail: "https://images.unsplash.com/photo-1562774053-701939374585?q=80&w=400",
        date: "5 Jan 2024",
    },
    {
        slug: "ai-talents-batch-3",
        title: "Pendaftaran AI Talents Batch 3 Dibuka",
        excerpt: "Program AI Talents batch ketiga telah dibuka untuk mahasiswa seluruh Indonesia.",
        thumbnail: "https://images.unsplash.com/photo-1531297484001-80022131f5a1?q=80&w=400",
        date: "1 Jan 2024",
    },
    {
        slug: "stem-education",
        title: "Pentingnya STEM Education di Era AI",
        excerpt: "Mengapa pendidikan STEM menjadi kunci utama dalam mempersiapkan generasi digital.",
        thumbnail: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?q=80&w=400",
        date: "28 Dec 2023",
    },
];

export default function ArtikelPage() {
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
            <section className="py-16 bg-gray-50 min-h-[50vh]">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {articles.map((article) => (
                            <Link
                                key={article.slug}
                                href={`/artikel/${article.slug}`}
                                className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-shadow group border border-gray-100"
                            >
                                {/* Thumbnail */}
                                <div className="relative aspect-video">
                                    <Image
                                        src={article.thumbnail}
                                        alt={article.title}
                                        fill
                                        className="object-cover transition-none"
                                        sizes="(max-width: 768px) 100vw, 33vw"
                                    />
                                    {/* Overlay */}
                                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors"></div>
                                </div>
                                
                                {/* Content */}
                                <div className="p-6">
                                    <span className="text-primary/60 text-xs uppercase tracking-wider font-semibold">
                                        {article.date}
                                    </span>
                                    <h2 className="text-lg font-bold text-primary mt-2 mb-3 group-hover:text-secondary transition-colors line-clamp-2">
                                        {article.title}
                                    </h2>
                                    <p className="text-gray-600 text-sm line-clamp-3 leading-relaxed">
                                        {article.excerpt}
                                    </p>
                                </div>
                            </Link>
                        ))}
                    </div>
                    
                    {/* Pagination */}
                    <div className="flex justify-center gap-2 mt-16">
                        <button className="w-10 h-10 bg-secondary text-white rounded-lg font-bold shadow-md hover:bg-secondary/90 transition-colors">1</button>
                        <button className="w-10 h-10 bg-white text-primary rounded-lg font-bold hover:bg-gray-100 border border-gray-200 transition-colors">2</button>
                        <button className="w-10 h-10 bg-white text-primary rounded-lg font-bold hover:bg-gray-100 border border-gray-200 transition-colors">3</button>
                        <span className="w-10 h-10 flex items-center justify-center text-primary/40">...</span>
                        <button className="w-10 h-10 bg-white text-primary rounded-lg font-bold hover:bg-gray-100 border border-gray-200 transition-colors">10</button>
                    </div>
                </div>
            </section>

            <Footer />
        </main>
    );
}
