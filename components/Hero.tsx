"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useAuthStore } from "@/lib/store/auth-store";

/**
 * Hero Component
 * 
 * Section utama homepage dengan:
 * - Background image (kegiatan AiCi)
 * - Overlay primary color
 * - Judul "Artificial Intelligence Center Indonesia"
 * - Deskripsi singkat
 * - CTA button
 */

const carouselImages = [
    "https://images.unsplash.com/photo-1509062522246-3755977927d7?q=80&w=800",
    "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?q=80&w=800",
    "https://images.unsplash.com/photo-1531482615713-2afd69097998?q=80&w=800",
];

const Hero = () => {
    const [currentImage, setCurrentImage] = useState(0);
    const { isAuthenticated } = useAuthStore();

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentImage((prev) => (prev + 1) % carouselImages.length);
        }, 3000);
        return () => clearInterval(timer);
    }, []);

    return (
        <section className="relative min-h-[60vh] flex items-center pt-44 pb-12 bg-[#0B6282] overflow-hidden">
            {/* Background decorative patterns (optional, matching image look) */}
            <div className="absolute top-0 right-0 w-1/3 h-full opacity-10 pointer-events-none">
                <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-white rounded-full blur-[100px]" />
            </div>

            <div className="relative z-30 max-w-7xl mx-auto px-6 w-full">
                <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-8">
                    {/* Left Column: Text */}
                    <div className="lg:w-1/2 text-white">
                        <h1 className="text-3xl md:text-5xl lg:text-6xl font-semibold font-primary leading-[1.1] mb-6">
                            Artificial<br />
                            Intelligence<br />
                            Center Indonesia
                        </h1>

                        <p className="text-sm md:text-base text-white/90 leading-relaxed max-w-lg mb-8">
                            Lembaga Yang Didirikan Atas Kerjasama FMIPA Universitas Indonesia Dengan UMG IdeaLab Indonesia Yang Berfokus Pada Pengembangan Sumber Daya Manusia Dalam Bidang Artificial Intelligence (Kecerdasan Artifisial).
                        </p>

                        <Link
                            href={isAuthenticated ? "/placement-test" : "/login"}
                            className="inline-block bg-[#f03023] text-white px-8 py-3 rounded-full font-bold text-xs tracking-widest uppercase hover:bg-[#d42a1e] transition-all shadow-xl"
                        >
                            Ayo Ikut Placement Test!
                        </Link>
                    </div>

                    {/* Right Column: Carousel */}
                    <div className="lg:w-1/2 w-full flex justify-end">
                        <div className="relative w-full max-w-[550px] aspect-4/3 p-3 bg-white/20 backdrop-blur-sm rounded-[2rem] border-10 border-white shadow-2xl overflow-hidden">
                            <div className="relative w-full h-full rounded-[1.2rem] overflow-hidden bg-gray-800">
                                {carouselImages.map((img, idx) => (
                                    <div
                                        key={idx}
                                        className={`absolute inset-0 transition-opacity duration-1000 ${idx === currentImage ? 'opacity-100' : 'opacity-0'}`}
                                    >
                                        <Image
                                            src={img}
                                            alt={`Carousel ${idx}`}
                                            fill
                                            className="object-cover"
                                            priority={idx === 0}
                                            sizes="(max-width: 1024px) 100vw, 500px"
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Hero;
