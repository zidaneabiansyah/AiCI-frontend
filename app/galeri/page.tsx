"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import MapSection from "@/components/MapSection";
import Image from "next/image";
import { useEffect, useState } from "react";
import { api, BackendGalleryImage } from "@/lib/api";

/**
 * Galeri Page
 * 
 * Menampilkan foto-foto kegiatan AiCi dalam bentuk grid.
 * Data diambil dari API /content/gallery/
 * 
 * PANDUAN:
 * - Menggunakan dummy placeholder jika data kosong
 * - Modal popup menampilkan detail foto
 */

export default function GaleriPage() {
    const [images, setImages] = useState<BackendGalleryImage[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedImage, setSelectedImage] = useState<BackendGalleryImage | null>(null);

    useEffect(() => {
        const fetchGallery = async () => {
            try {
                const res = await api.content.gallery();
                setImages(res.results);
            } catch (err) {
                console.error("Failed to fetch gallery", err);
            } finally {
                setLoading(false);
            }
        };
        fetchGallery();
    }, []);

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
                            <div className="relative aspect-video lg:aspect-4/3 rounded-2xl overflow-hidden shadow-xl border-4 border-white/10">
                                <Image
                                    src="https://images.unsplash.com/photo-1509062522246-3755977927d7?q=80&w=800"
                                    alt="Galeri AiCi"
                                    fill
                                    className="object-cover"
                                    sizes="(max-width: 768px) 100vw, 50vw"
                                />
                            </div>
                        </div>

                        {/* Text Right */}
                        <div className="lg:w-1/2 text-left">
                            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6">
                                Galeri
                            </h1>
                            <p className="text-white/80 text-sm md:text-base leading-relaxed">
                                Dokumentasi Berbagai Kegiatan Yang Pernah Dilakukan di AiCi.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Gallery Grid */}
            <section className="py-16 bg-white">
                <div className="max-w-7xl mx-auto px-6">
                    {loading ? (
                         <div className="flex justify-center h-40 items-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                        </div>
                    ) : images.length === 0 ? (
                        <div className="text-center py-20 text-gray-400">
                            <p>Belum ada foto galeri.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {images.map((image) => (
                                <div
                                    key={image.id}
                                    className="group cursor-pointer"
                                    onClick={() => setSelectedImage(image)}
                                >
                                    <div className="relative aspect-video rounded-2xl overflow-hidden shadow-lg">
                                        <Image
                                            src={image.image || '/placeholder-image.jpg'}
                                            alt={image.title}
                                            fill
                                            className="object-cover"
                                            sizes="(max-width: 768px) 100vw, 50vw"
                                        />
                                        {/* Title Overlay */}
                                        <div className="absolute bottom-0 left-0 right-0 bg-linear-to-t from-black/80 to-transparent p-4">
                                            <h3 className="text-white font-bold text-sm md:text-base">
                                                {image.title}
                                            </h3>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                    
                    {/* Load More Button - Logic to be implemented or hidden if no next page */}
                    {!loading && images.length > 0 && (
                        <div className="text-center mt-12">
                            <button className="px-8 py-3 border-2 border-primary text-primary rounded-full font-bold hover:bg-primary hover:text-white transition-all">
                                Lihat Lebih Banyak
                            </button>
                        </div>
                    )}
                </div>
            </section>

            {/* Modal Popup */}
            {selectedImage && (
                <div 
                    className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
                    onClick={() => setSelectedImage(null)}
                >
                    <div 
                        className="bg-white rounded-2xl max-w-3xl w-full overflow-hidden"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="relative aspect-video">
                            <Image
                                src={selectedImage.image || '/placeholder-image.jpg'}
                                alt={selectedImage.title}
                                fill
                                className="object-cover"
                                sizes="90vw"
                            />
                        </div>
                        <div className="p-6">
                            <h2 className="text-2xl font-bold text-primary mb-3">
                                {selectedImage.title}
                            </h2>
                            <p className="text-primary/70 leading-relaxed">
                                {selectedImage.description}
                            </p>
                            <button 
                                onClick={() => setSelectedImage(null)}
                                className="mt-6 px-6 py-2 bg-primary text-white rounded-full font-semibold hover:bg-primary/90 transition-all"
                            >
                                Tutup
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Map Section */}
            <MapSection />

            <Footer />
        </main>
    );
}
