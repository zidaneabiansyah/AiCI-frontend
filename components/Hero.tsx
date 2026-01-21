"use client";

import Link from "next/link";
import Image from "next/image";

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

const Hero = () => {
    return (
        <section className="relative min-h-[80vh] flex items-center pt-20 overflow-hidden">
            {/* Background Image with Overlay */}
            <div className="absolute inset-0 z-0">
                <div className="absolute inset-0 bg-primary/90 z-10" />
                {/* Decorative wave pattern at bottom */}
                <div className="absolute bottom-0 left-0 right-0 z-20">
                    <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto">
                        <path d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" fill="white"/>
                    </svg>
                </div>
                {/* Background image - placeholder for now */}
                <Image
                    src="https://images.unsplash.com/photo-1509062522246-3755977927d7?q=80&w=2132&auto=format&fit=crop"
                    alt="AiCi Background"
                    fill
                    className="object-cover"
                    priority
                    sizes="100vw"
                />
            </div>

            <div className="relative z-30 max-w-7xl mx-auto px-6 py-20 w-full">
                <div className="max-w-3xl">
                    {/* Main Title */}
                    <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white leading-tight mb-6">
                        Artificial<br />
                        Intelligence<br />
                        Center Indonesia
                    </h1>

                    {/* Description */}
                    <p className="text-lg md:text-xl text-white/80 leading-relaxed mb-8 max-w-2xl">
                        Lembaga yang didirikan atas kerjasama FMIPA Universitas Indonesia dengan UMG IdeaLab Indonesia yang berfokus pada pengembangan sumber daya manusia dalam bidang artificial intelligence (kecerdasan artifisial).
                    </p>

                    {/* CTA Button */}
                    <Link
                        href="/program"
                        className="inline-block bg-secondary text-white px-8 py-4 rounded-full font-bold text-lg hover:opacity-90 transition-all shadow-lg shadow-secondary/30 transform hover:scale-105"
                    >
                        Jelajahi Program Kami
                    </Link>
                </div>
            </div>

            {/* WhatsApp Float Button */}
            <a
                href="https://wa.me/6282110103938"
                target="_blank"
                rel="noopener noreferrer"
                className="fixed left-6 bottom-24 z-40 bg-green-500 text-white px-4 py-2 rounded-full flex items-center gap-2 shadow-lg hover:bg-green-600 transition-all"
            >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.319 1.592 5.548 0 10.061-4.512 10.064-10.062 0-2.69-1.048-5.22-2.953-7.127-1.907-1.906-4.436-2.955-7.124-2.956-5.548 0-10.06 4.513-10.063 10.062 0 2.0.525 3.945 1.52 5.679l-.999 3.65 3.736-.98z"/>
                </svg>
                <span className="text-sm font-medium">Konsultasi via WhatsApp</span>
            </a>

            {/* Phone Float Button - right side */}
            <a
                href="tel:+6282110103938"
                className="fixed right-6 bottom-24 z-40 bg-primary text-white px-4 py-2 rounded-full flex items-center gap-2 shadow-lg hover:bg-primary/90 transition-all"
            >
                <span className="text-sm font-medium">Konsultasi Via Telepon</span>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>
                </svg>
            </a>
        </section>
    );
};

export default Hero;
