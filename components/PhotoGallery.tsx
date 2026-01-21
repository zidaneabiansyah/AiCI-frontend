"use client";

import Image from "next/image";

/**
 * PhotoGallery Component
 * 
 * Menampilkan 3 foto kegiatan dalam layout grid.
 * Foto tengah lebih besar dari foto samping.
 * 
 * PANDUAN untuk modifikasi:
 * - Ganti URL gambar dengan foto asli dari backend nanti
 * - Foto bisa di-fetch dari API /content/gallery/?is_featured=true
 */

// Placeholder photos - nanti bisa diganti dengan data dari API
const photos = [
    {
        src: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?q=80&w=600",
        alt: "Kegiatan AiCi 1",
    },
    {
        src: "https://images.unsplash.com/photo-1531297484001-80022131f5a1?q=80&w=800",
        alt: "Kegiatan AiCi 2",
        isMain: true,
    },
    {
        src: "https://images.unsplash.com/photo-1517077304055-6e89abbf09b0?q=80&w=600",
        alt: "Kegiatan AiCi 3",
    },
];

const PhotoGallery = () => {
    return (
        <section className="py-12 bg-primary">
            <div className="max-w-7xl mx-auto px-6">
                <div className="flex flex-col md:flex-row items-center justify-center gap-6">
                    {photos.map((photo, index) => (
                        <div
                            key={index}
                            className={`relative overflow-hidden rounded-3xl border-4 border-white/20 shadow-xl ${
                                photo.isMain 
                                    ? 'w-full md:w-2/5 aspect-video' 
                                    : 'w-full md:w-1/4 aspect-square'
                            }`}
                        >
                            <Image
                                src={photo.src}
                                alt={photo.alt}
                                fill
                                className="object-cover hover:scale-105 transition-transform duration-500"
                                sizes={photo.isMain ? "(max-width: 768px) 100vw, 40vw" : "(max-width: 768px) 100vw, 25vw"}
                            />
                            {/* Play button overlay for main photo (video placeholder) */}
                            {photo.isMain && (
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center cursor-pointer hover:scale-110 transition-transform shadow-lg">
                                        <svg className="w-6 h-6 text-white ml-1" fill="currentColor" viewBox="0 0 20 20">
                                            <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                                        </svg>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default PhotoGallery;
