"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";

const Hero = () => {
    const [currentSlide, setCurrentSlide] = useState(0);

    const slides = [
        {
            title: "Grand Champion AI Innovation Cup",
            desc: "Jajang sujang Meraih Penghargaan Utama atas keunggulan dalam merancang solusi AI yang orisinal dan aplikatif.",
            image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?q=80&w=2070&auto=format&fit=crop"
        },
        {
            title: "Top 10 International AI Fair",
            desc: "Inovasi sistem otonom berbasis AI yang berhasil menembus 10 besar ajang internasional bergengsi.",
            image: "https://images.unsplash.com/photo-1531297484001-80022131f5a1?q=80&w=2020&auto=format&fit=crop"
        },
        {
            title: "Best Robotic Project 2025",
            desc: "Membangun masa depan berkelanjutan melalui solusi robotik cerdas untuk lingkungan perkotaan.",
            image: "https://images.unsplash.com/photo-1517077304055-6e89abbf09b0?q=80&w=2069&auto=format&fit=crop"
        }
    ];

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % slides.length);
        }, 5000);
        return () => clearInterval(timer);
    }, [slides.length]);

    return (
        <section className="relative pt-32 md:pt-40 pb-16 md:pb-24 px-6 md:px-20 text-white overflow-hidden min-h-[90vh] md:min-h-[85vh] flex items-center">
            {/* Background Image with Overlay */}
            <div className="absolute inset-0 z-0">
                <div className="absolute inset-0 bg-primary/85 z-10" />
                <Image
                    src="https://images.unsplash.com/photo-1509062522246-3755977927d7?q=80&w=2132&auto=format&fit=crop"
                    alt="Education Background"
                    fill
                    className="object-cover"
                    priority
                    sizes="100vw"
                />
            </div>

            <div className="relative z-20 max-w-screen-2xl mx-auto flex flex-col md:flex-row items-center justify-between gap-12 md:gap-16 w-full">
                {/* Left Content */}
                <div className="flex-1 space-y-6 md:space-y-10 text-center md:text-left">
                    <h1 className="text-3xl md:text-6xl font-bold leading-tight">
                        Artificial <br className="hidden md:block" />
                        Intelligence <br className="hidden md:block" />
                        Center Indonesia
                    </h1>
                    <p className="text-lg md:text-xl opacity-90 max-w-xl leading-relaxed mx-auto md:mx-0">
                        Lembaga yang didirikan atas kerjasama FMIPA Universitas Indonesia dengan UMG IdeaLab Indonesia yang berfokus pada pengembangan sumber daya manusia dalam bidang artificial intelligence (kecerdasan artifisial).
                    </p>
                    <Link
                        href="/achievements"
                        className="inline-block bg-secondary text-white px-8 md:px-10 py-3 md:py-4 rounded-full font-bold text-base md:text-lg hover:opacity-90 transition-all shadow-[0_10px_30px_rgba(255,77,48,0.4)] transform hover:scale-105 active:scale-95"
                    >
                        Jelajahi Pencapaian
                    </Link>
                </div>

                {/* Right Card / Slider */}
                <div className="flex-1 w-full max-w-2xl px-2 md:px-0">
                    <div className="bg-white/10 backdrop-blur-xl rounded-4xl md:rounded-[2.5rem] p-6 md:p-8 border border-white/20 shadow-2xl transition-all duration-700 h-full">
                        <div className="relative aspect-video rounded-2xl md:rounded-3xl overflow-hidden bg-white/5 mb-6 md:mb-8 border border-white/10">
                            {slides.map((slide, idx) => (
                                <Image
                                    key={idx}
                                    src={slide.image}
                                    alt={slide.title}
                                    fill
                                    className={`object-cover transition-opacity duration-1000 ${
                                        idx === currentSlide ? "opacity-100" : "opacity-0"
                                    }`}
                                    sizes="(max-width: 768px) 100vw, 50vw"
                                />
                            ))}
                        </div>
                        <div className="space-y-2 md:space-y-3 min-h-[100px] md:min-h-[120px]">
                            <h3 className="text-xl md:text-2xl font-bold transition-all duration-700">
                                {slides[currentSlide].title}
                            </h3>
                            <p className="text-sm md:text-base opacity-80 leading-relaxed max-w-md mx-auto md:mx-0">
                                {slides[currentSlide].desc}
                            </p>
                        </div>
                    </div>

                    {/* Slider Dots */}
                    <div className="flex justify-center gap-2 md:gap-3 mt-6 md:mt-8">
                        {slides.map((_, idx) => (
                            <button
                                key={idx}
                                onClick={() => setCurrentSlide(idx)}
                                className={`h-2 md:h-2.5 transition-all duration-500 rounded-full ${
                                    idx === currentSlide ? "w-8 md:w-10 bg-white" : "w-2 md:w-2.5 bg-white/30"
                                }`}
                                aria-label={`Go to slide ${idx + 1}`}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Hero;
