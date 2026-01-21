"use client";

import Image from "next/image";
import Link from "next/link";

/**
 * FacilitiesPreview Component
 * 
 * Menampilkan preview 4 kategori fasilitas dari halaman Fasilitas:
 * - Ruangan
 * - Modul
 * - Media Kit
 * - Robot
 * 
 * PANDUAN:
 * - Data ini nanti bisa di-fetch dari API /content/facilities/
 * - Untuk sekarang menggunakan data static
 */

const facilities = [
    {
        category: "Ruangan",
        title: "Nyaman dalam Lingkungan Universitas Indonesia",
        description: "Fasilitas ruangan yang nyaman dan kondusif untuk pembelajaran AI.",
        image: "https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=600",
    },
    {
        category: "Modul",
        title: "Berlandaskan STEAM",
        description: "Modul pembelajaran yang komprehensif berbasis STEAM education.",
        image: "https://images.unsplash.com/photo-1532012197267-da84d127e765?q=80&w=600",
    },
    {
        category: "Media Kit",
        title: "Tersedia Lengkap",
        description: "Peralatan dan media pembelajaran yang lengkap untuk praktik.",
        image: "https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?q=80&w=600",
    },
    {
        category: "Robot",
        title: "Pengalaman Belajar dengan Robot AI",
        description: "Belajar langsung dengan berbagai jenis robot yang dilengkapi AI.",
        image: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?q=80&w=600",
    },
];

const FacilitiesPreview = () => {
    return (
        <section className="py-20 bg-linear-to-b from-primary to-primary/90 text-white">
            <div className="max-w-7xl mx-auto px-6">
                {/* Section Header */}
                <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8 mb-16">
                    <div>
                        <h2 className="text-3xl md:text-5xl font-bold mb-4">
                            Fasilitas yang<br />disediakan
                        </h2>
                        <p className="text-white/70 max-w-xl">
                            AiCI menyediakan berbagai fasilitas pembelajaran yang lengkap untuk mendukung pengalaman belajar AI dan Robotika.
                        </p>
                    </div>
                    <Link
                        href="/fasilitas"
                        className="inline-block bg-secondary text-white px-6 py-3 rounded-full font-bold hover:opacity-90 transition-all whitespace-nowrap"
                    >
                        SELENGKAPNYA TENTANG FASILITAS
                    </Link>
                </div>

                {/* Facilities Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {facilities.map((facility, index) => (
                        <div
                            key={index}
                            className="bg-white/10 backdrop-blur-sm rounded-2xl overflow-hidden hover:bg-white/20 transition-all group"
                        >
                            <div className="relative aspect-video">
                                <Image
                                    src={facility.image}
                                    alt={facility.title}
                                    fill
                                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                                    sizes="(max-width: 768px) 100vw, 25vw"
                                />
                            </div>
                            <div className="p-6">
                                <span className="text-secondary text-xs font-bold uppercase tracking-wider">
                                    {facility.category}
                                </span>
                                <h3 className="text-lg font-bold mt-2 mb-2">
                                    {facility.title}
                                </h3>
                                <p className="text-white/60 text-sm">
                                    {facility.description}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default FacilitiesPreview;
