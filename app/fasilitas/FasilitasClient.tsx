"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { api, BackendFacility } from "@/lib/api";
import Skeleton, { ImageSkeleton } from "@/components/ui/Skeleton";

/**
 * Fasilitas Page
 * 
 * Menampilkan 4 kategori fasilitas:
 * 1. Ruangan - Nyaman dalam Lingkungan Universitas Indonesia
 * 2. Modul - Berlandaskan STEAM
 * 3. Media Kit - Tersedia Lengkap
 * 4. Robot - Pengalaman Belajar dengan Robot yang Dilengkapi AI
 * 
 * Layout: alternating image left/right
 */

const categoryTabs = [
    { key: "RUANGAN", label: "RUANGAN" },
    { key: "MODUL", label: "MODUL" },
    { key: "MEDIA_KIT", label: "MEDIA KIT" },
    { key: "ROBOT", label: "ROBOT" },
];

export default function FasilitasPage() {
    const [facilities, setFacilities] = useState<BackendFacility[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchFacilities = async () => {
            try {
                const res = await api.facilities.list();
                setFacilities(res.data);
            } catch (err) {
                console.error("Failed to fetch facilities", err);
            } finally {
                setLoading(false);
            }
        };
        fetchFacilities();
    }, []);

    // Sort/Group facilities if needed, or just display as list sorted by order (default from backend)
    // We assume backend returns them in correct order.

    return (
        <main className="min-h-screen">
            <Navbar />
            
            {/* Hero Section */}
            <section className="pt-32 pb-24 bg-primary relative overflow-hidden">
                {/* Top Wave Decoration */}
                <div className="absolute top-0 left-0 right-0 z-0">
                    <svg viewBox="0 0 1440 320" className="w-full h-auto opacity-20 transform -scale-y-100">
                        <path fill="#ffffff" fillOpacity="1" d="M0,96L48,112C96,128,192,160,288,160C384,160,480,128,576,112C672,96,768,96,864,112C960,128,1056,160,1152,160C1248,160,1344,128,1392,112L1440,96L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
                    </svg>
                </div>

                <div className="max-w-7xl mx-auto px-6 relative z-10">
                    <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
                        {/* Image Left */}
                        <div className="lg:w-1/2">
                            <div className="relative aspect-square lg:aspect-4/3">
                                <Image
                                    src="/icon/fasilitas.png"
                                    alt="Fasilitas AiCi"
                                    fill
                                    className="object-cover"
                                    sizes="(max-width: 768px) 100vw, 50vw"
                                />
                            </div>
                        </div>

                        {/* Text Right */}
                        <div className="lg:w-1/2 text-left">
                            <h1 className="text-4xl md:text-5xl lg:text-6xl font-normal text-white leading-tight mb-6">
                                Fasilitas yang <br />
                                <span className="font-bold">disediakan</span>
                            </h1>
                            <p className="text-white/80 text-sm md:text-base mb-8 max-w-lg leading-relaxed uppercase tracking-wide">
                                Fasilitas Utama Yang Mendukung Proses Pembelajaran Artificial Intelligence Berupa Ruangan, Modul, Media Kit, Serta Robot.
                            </p>
                            <Link
                                href="#facilities"
                                className="inline-block bg-[#E53935] text-white px-8 py-4 rounded-full font-bold text-sm tracking-widest hover:bg-red-700 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                            >
                                JELAJAHI FASILITAS
                            </Link>
                        </div>
                    </div>
                </div>
                
            </section>

            {/* Category Tabs */}
            <div className="bg-white py-12">
                <div className="max-w-4xl mx-auto px-6">
                    <div className="bg-[#EBF5F8] p-2 rounded-full">
                        <div className="flex flex-wrap gap-2 md:gap-4 justify-between items-center">
                            {categoryTabs.map((tab) => (
                                <a
                                    key={tab.key}
                                    href={`#${tab.key.toLowerCase().replace('_', '-')}`}
                                    className="flex-1 text-center px-4 py-3 rounded-full bg-[#f5b634] text-white text-xs md:text-sm font-bold tracking-wider hover:bg-[#dba023] transition-all shadow-sm whitespace-nowrap"
                                >
                                    {tab.label}
                                </a>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Facilities List */}
            <section id="facilities" className="py-16 bg-white">
                <div className="max-w-7xl mx-auto px-6">
                    {loading ? (
                        <div className="space-y-8">
                            {[...Array(3)].map((_, i) => (
                                <div key={i} className={`flex flex-col ${i % 2 === 0 ? 'lg:flex-row' : 'lg:flex-row-reverse'} gap-8 lg:gap-16 p-8 lg:p-12 border-4 border-gray-100 rounded-3xl bg-gray-50/10`}>
                                    <ImageSkeleton className="lg:w-1/2 aspect-video rounded-2xl" />
                                    <div className="lg:w-1/2 flex flex-col justify-center space-y-4">
                                        <Skeleton className="h-4 w-24" />
                                        <Skeleton className="h-8 w-3/4" />
                                        <div className="space-y-2">
                                            <Skeleton className="h-4 w-full" />
                                            <Skeleton className="h-4 w-full" />
                                            <Skeleton className="h-4 w-2/3" />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : facilities.length === 0 ? (
                        <div className="text-center py-20 text-gray-400">
                            <p>Belum ada data fasilitas.</p>
                        </div>
                    ) : (
                        facilities.map((facility, index) => (
                            <div
                                key={facility.id}
                                id={facility.category.toLowerCase().replace('_', '-')}
                                className={`flex flex-col ${index % 2 === 0 ? 'lg:flex-row' : 'lg:flex-row-reverse'} gap-8 lg:gap-16 p-8 lg:p-12 mb-8 border-4 border-primary/20 rounded-3xl bg-gray-50/30`}
                            >
                                {/* Image */}
                                <div className="lg:w-1/2">
                                    <div className="relative aspect-video rounded-2xl overflow-hidden shadow-lg">
                                        <Image
                                            src={facility.image || '/placeholder-image.jpg'}
                                            alt={facility.title}
                                            fill
                                            className="object-cover"
                                            sizes="50vw"
                                        />
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="lg:w-1/2 flex flex-col justify-center">
                                    <span className="text-secondary text-sm font-bold uppercase tracking-wider mb-2">
                                        {facility.category_display || facility.category}
                                    </span>
                                    <h2 className="text-2xl md:text-3xl font-bold text-primary mb-4">
                                        {facility.title}
                                    </h2>
                                    <p className="text-primary/70 leading-relaxed">
                                        {facility.description}
                                    </p>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </section>

            <Footer />
        </main>
    );
}
