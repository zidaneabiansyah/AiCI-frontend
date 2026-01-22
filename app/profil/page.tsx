"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Image from "next/image";
import MapSection from "@/components/MapSection";

/**
 * Profil Page
 * 
 * Struktur sesuai design reference:
 * 1. Hero dengan foto dan judul
 * 2. Tentang AiCi
 * 3. Visi & Misi
 * 4. Tim Operasional dan Tutor
 * 5. Map
 */

const teamMembers = [
    {
        name: "Kiwi Aliwarga",
        position: "Founder",
        photo: "/team_aici/Kiwi-Founder.png",
    },
    {
        name: "Dr. Baiq Hana Susanti, M.Sc",
        position: "Direktur",
        photo: "/team_aici/baiq-hana-direktur.jpg",
    },
    {
        name: "Dr. Djati Handoko, M.Si",
        position: "Wakil Direktur",
        photo: "/team_aici/djati-wakil-dektur.jpg",
    },
    {
        name: "Citra Chairunnisa, S.Pd",
        position: "Staff Administrasi dan Keuangan",
        photo: "/team_aici/citra-staff-keuangan.png",
    },
    {
        name: "Ridhwan Dery Iradat, M.Si.",
        position: "Staff Akademik",
        photo: "/team_aici/dery-staff-akademik.jpg",
    },
    {
        name: "Faisal Amir Maz, S.Si",
        position: "Staff Akademik",
        photo: "/team_aici/faisal-staff-akademik.jpg",
    },
    {
        name: "Rayfan Bagassetya Kurniawan, S.Pd",
        position: "Staff Operasional",
        photo: "/team_aici/Rayfan-staff-operasional.jpg",
    },
    {
        name: "Hazmi Fathan Kariema, S.Pd",
        position: "Staff Teknis",
        photo: "/team_aici/Hazmii-staff-teknis.jpg",
    },
    {
        name: "Salma Nurul Ajmal, S.Pd",
        position: "Staff Marketing",
        photo: "/team_aici/Salma-staff-Marketing.jpg",
    },
    {
        name: "Ilu Muthoharoh, S.Pd",
        position: "Staff Media Sosial",
        photo: "/team_aici/ilu-staff-medsos.jpg",
    },
    {
        name: "Dr. Prawito Prajitno",
        position: "Tutor",
        photo: "/team_aici/Dr.-Prawito-Prajitno-Tutor.jpg",
    },
    {
        name: "Dr. Santoso Soekirno",
        position: "Tutor",
        photo: "/team_aici/Dr.-Santoso-Soekirno-Tutor-.jpg",
    },
    {
        name: "Surya Dharma, M.Si.",
        position: "Tutor",
        photo: "/team_aici/Surya-Dharma-M.Si-Tutor-.jpg",
    },
    {
        name: "Drs. Sastra Kusuma Wijaya, Ph.D",
        position: "Tutor",
        photo: "/team_aici/Drs.-Sastra-Kusuma-Wijaya-Ph.D-Tutor.jpg",
    },
    {
        name: "Mohammad Zaadit Taqwa, S.Si.",
        position: "Tutor",
        photo: "/team_aici/Mohammad-Zaadit-Taqwa-S.Si-Tutor.jpg",
    },
    {
        name: "Febri Faresi",
        position: "Tutor",
        photo: "/team_aici/Febri-Faresi-Tutor.jpg",
    },
    {
        name: "Dito Tunjung Parahyta, S.Si.",
        position: "Tutor",
        photo: "/team_aici/Dito-Tunjung-Parahyta-S.Si-Tutor.jpg",
    },
    {
        name: "Dandung Sektian, S.Si.",
        position: "Tutor",
        photo: "/team_aici/Dandung-Sektian-S.Si-Tutor.jpg",
    },
    {
        name: "Ardi Ferdyhana, S.Si.",
        position: "Tutor",
        photo: "/team_aici/Ardi-Ferdyhana-S.Si-Tutor.jpg",
    },
    {
        name: "Dennis Laorens Bawole, S.Si.",
        position: "Tutor",
        photo: "/team_aici/Dennis-Laorens-Bawole-S.Si-Tutor.png",
    },
    {
        name: "Muzhaffar Maruf Ibrahim, S.Si.",
        position: "Tutor",
        photo: "/team_aici/Muzhaffar-Maruf-Ibrahim-S.Si-Tutor.jpg",
    },
];

import { useRef, useEffect } from 'react';

export default function ProfilPage() {
    const scrollRef = useRef<HTMLDivElement>(null);
    const isTeleporting = useRef(false);

    // Initial scroll to middle section for infinite effect
    useEffect(() => {
        const container = scrollRef.current;
        if (container) {
            // Scroll to the middle set of items (we have 3 sets: 0, 1, 2)
            // Multiply by item width + gap. Since widths are dynamic, 
            // the safest way is to scroll to a specific child.
            const totalItems = teamMembers.length;
            const middleIndex = totalItems; // Start of second set
            const items = container.children;
            if (items[middleIndex]) {
                const targetScroll = (items[middleIndex] as HTMLElement).offsetLeft - 24; // -24 for gap/padding
                container.scrollLeft = targetScroll;
            }
        }
    }, []);

    const handleInfiniteScroll = () => {
        if (isTeleporting.current) return;
        
        const container = scrollRef.current;
        if (!container) return;

        const { scrollLeft, offsetWidth } = container;
        const totalItems = teamMembers.length;
        const items = container.children;
        
        if (items.length < totalItems * 3) return;

        const firstSetEnd = (items[totalItems] as HTMLElement).offsetLeft - 24;
        const secondSetEnd = (items[totalItems * 2] as HTMLElement).offsetLeft - 24;

        // Teleport if we go too far left or right
        if (scrollLeft < firstSetEnd - offsetWidth) {
            isTeleporting.current = true;
            container.scrollLeft += (secondSetEnd - firstSetEnd);
            setTimeout(() => { isTeleporting.current = false; }, 50);
        } else if (scrollLeft > secondSetEnd) {
            isTeleporting.current = true;
            container.scrollLeft -= (secondSetEnd - firstSetEnd);
            setTimeout(() => { isTeleporting.current = false; }, 50);
        }
    };

    const scroll = (direction: 'left' | 'right') => {
        const container = scrollRef.current;
        if (container) {
            const scrollAmount = container.offsetWidth;
            container.scrollBy({ 
                left: direction === 'left' ? -scrollAmount : scrollAmount, 
                behavior: 'smooth' 
            });
        }
    };
    return (
        <main className="min-h-screen">
            <Navbar />
            
            {/* Hero Section */}
            <section className="pt-44 pb-24 bg-primary relative overflow-hidden">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="flex flex-col lg:flex-row items-center gap-12">
                        {/* Text */}
                        <div className="lg:w-1/2">
                            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight">
                                Artificial<br />
                                Intelligence<br />
                                Center Indonesia
                            </h1>
                            <p className="text-white/70 mt-6 max-w-lg">
                                Lembaga yang didirikan atas kerjasama FMIPA Universitas Indonesia dengan UMG IdeaLab Indonesia yang berfokus pada pengembangan sumber daya manusia dalam bidang artificial intelligence (kecerdasan artifisial).
                            </p>
                        </div>
                        
                        {/* Images */}
                        <div className="lg:w-1/2 flex gap-4">
                            <div className="relative w-1/2 aspect-3/4 rounded-2xl overflow-hidden">
                                <Image
                                    src="https://images.unsplash.com/photo-1509062522246-3755977927d7?q=80&w=400"
                                    alt="AiCi Activity 1"
                                    fill
                                    className="object-cover"
                                    sizes="25vw"
                                />
                            </div>
                            <div className="relative w-1/2 aspect-3/4 rounded-2xl overflow-hidden mt-8">
                                <Image
                                    src="https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?q=80&w=400"
                                    alt="AiCi Activity 2"
                                    fill
                                    className="object-cover"
                                    sizes="25vw"
                                />
                            </div>
                        </div>
                    </div>
                </div>
                
                {/* Wave decoration */}
                <div className="absolute bottom-0 left-0 right-0">
                    <svg viewBox="0 0 1440 60" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto">
                        <path d="M0 60L1440 60L1440 30C1200 50 960 10 720 30C480 50 240 10 0 30L0 60Z" fill="white"/>
                    </svg>
                </div>
            </section>

            {/* About Section */}
            <section className="py-16 bg-white">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="grid lg:grid-cols-2 gap-12">
                        <div className="bg-primary/5 p-8 lg:p-12 rounded-2xl">
                            <div className="flex flex-col gap-8">
                                <div className="max-w-sm">
                                    <Image
                                        src="/icon/aici-logo.png"
                                        alt="AiCi Logo"
                                        width={480}
                                        height={160}
                                        className="w-full h-auto object-contain"
                                    />
                                </div>
                                <div>
                                    <p className="text-primary/90 leading-relaxed font-bold text-base lg:text-lg">
                                        Sebuah Lembaga Yang Didirikan Atas Kerjasama FMIPA Universitas Indonesia Dengan UMG Idea Lab Indonesia Yang Bertujuan Untuk Mengembangkan Sumber Daya Manusia Dalam Bidang Artificial Intelligence Untuk Membangun Kapabilitas Bangsa Menyambut Revolusi Industri 4.0
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div>
                            {/* Visi */}
                            <div className="mb-10">
                                <h3 className="text-secondary font-bold text-sm uppercase tracking-[0.2em] mb-4">VISI</h3>
                                <p className="text-primary/90 font-semibold leading-relaxed">
                                    Menjadi Pusat Pembelajaran, Inovasi, dan Konsultasi Bidang Artificial Intelligence (Kecerdasan Buatan) Yang Terkemuka Di Indonesia. Untuk Membangun Sumber Daya Manusia Yang Berkualitas Dan Unggul Di Dalam Bidang Artificial Intelligence.
                                </p>
                            </div>
                            
                            {/* Misi */}
                            <div>
                                <h3 className="text-secondary font-bold text-sm uppercase tracking-[0.2em] mb-4">MISI</h3>
                                <ul className="text-primary/90 font-semibold space-y-3">
                                    <li className="flex gap-3">
                                        <span className="text-secondary mt-1">•</span>
                                        <span>Melaksanakan pendidikan bidang artificial intelligence yang berkualitas dan inovatif untuk target yang lebih tinggi.</span>
                                    </li>
                                    <li className="flex gap-3">
                                        <span className="text-secondary mt-1">•</span>
                                        <span>Mengembangkan riset dan inovasi dalam bidang artificial intelligence yang bermanfaat bagi pembangunan nasional.</span>
                                    </li>
                                    <li className="flex gap-3">
                                        <span className="text-secondary mt-1">•</span>
                                        <span>Melaksanakan kerjasama untuk pengembangan bidang artificial intelligence di Indonesia.</span>
                                    </li>
                                    <li className="flex gap-3">
                                        <span className="text-secondary mt-1">•</span>
                                        <span>Menyediakan Sumber Daya dalam bidang yang siap dan berkompeten dalam bidang terkait karir/lapangan.</span>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section className="py-20 bg-gray-100/50">
                <div className="max-w-[1600px] mx-auto px-4 md:px-8">
                    <h2 className="text-3xl font-bold text-primary text-center mb-16">
                        Tim Operasional dan Tutor
                    </h2>
                    
                    <div className="relative overflow-visible group">
                        <button 
                            onClick={() => scroll('left')}
                            className="absolute -left-4 lg:-left-12 top-1/2 -translate-y-1/2 z-10 p-2 text-gray-300 hover:text-primary transition-colors"
                            aria-label="Previous"
                        >
                            <svg className="w-8 h-8 lg:w-12 lg:h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M15 19l-7-7 7-7" />
                            </svg>
                        </button>

                        <button 
                            onClick={() => scroll('right')}
                            className="absolute -right-4 lg:-right-12 top-1/2 -translate-y-1/2 z-10 p-2 text-gray-300 hover:text-primary transition-colors"
                            aria-label="Next"
                        >
                            <svg className="w-8 h-8 lg:w-12 lg:h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5l7 7-7 7" />
                            </svg>
                        </button>

                        <div 
                            ref={scrollRef}
                            onScroll={handleInfiniteScroll}
                            className="flex overflow-x-auto snap-x snap-mandatory scrollbar-hide gap-4 md:gap-6 pb-4"
                            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                        >
                            {[...teamMembers, ...teamMembers, ...teamMembers].map((member, index) => (
                                <div 
                                    key={`${member.name}-${index}`} 
                                    className="min-w-full md:min-w-[calc(50%-12px)] lg:min-w-[calc(33.333%-16px)] snap-start group/item"
                                >
                                    <div className="relative aspect-3/4 w-full overflow-hidden bg-gray-50 mb-4 shadow-sm border border-gray-100">
                                        <Image
                                            src={member.photo}
                                            alt={member.name}
                                            fill
                                            className="object-cover grayscale hover:grayscale-0 transition-all duration-500"
                                            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                                        />
                                    </div>
                                    <div className="text-center px-2">
                                        <h3 className="font-bold text-[#0B6282] text-sm md:text-base tracking-tight uppercase leading-snug">
                                            {member.name}
                                        </h3>
                                        <p className="text-primary/70 text-[10px] md:text-xs font-semibold uppercase tracking-widest mt-1">
                                            {member.position}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Map Section */}
            <MapSection />

            <Footer />
        </main>
    );
}
