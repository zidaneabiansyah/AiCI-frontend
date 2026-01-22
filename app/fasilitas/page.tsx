"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Image from "next/image";
import Link from "next/link";

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

const facilities = [
    {
        category: "RUANGAN",
        title: "Nyaman dalam Lingkungan Universitas Indonesia",
        description: "Fasilitas ruangan yang nyaman dan kondusif untuk pembelajaran. Terletak di lingkungan kampus Universitas Indonesia yang asri dan mendukung proses belajar mengajar dengan optimal. Ruangan dilengkapi dengan AC, proyektor, papan tulis, dan tempat duduk yang nyaman.",
        image: "https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=800",
        imagePosition: "left",
    },
    {
        category: "MODUL",
        title: "Berlandaskan STEAM",
        description: "Modul pembelajaran yang komprehensif berbasis STEAM (Science, Technology, Engineering, Arts, Mathematics). Kurikulum dirancang oleh tim ahli dari Universitas Indonesia untuk memastikan peserta didik mendapatkan pemahaman yang mendalam tentang AI dan Robotika.",
        image: "https://images.unsplash.com/photo-1532012197267-da84d127e765?q=80&w=800",
        imagePosition: "right",
    },
    {
        category: "MEDIA KIT",
        title: "Tersedia Lengkap",
        description: "Peralatan dan media pembelajaran yang lengkap untuk mendukung praktik langsung. Setiap peserta didik akan mendapatkan akses ke berbagai peralatan dan software yang dibutuhkan untuk belajar coding, programming, dan pengembangan AI.",
        image: "https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?q=80&w=800",
        imagePosition: "left",
    },
    {
        category: "ROBOT",
        title: "Pengalaman Belajar dengan Robot yang Dilengkapi AI",
        description: "Belajar langsung dengan berbagai jenis robot yang dilengkapi dengan teknologi AI terkini. Peserta didik dapat berinteraksi, memprogram, dan mengembangkan robot mereka sendiri dengan bimbingan tutor berpengalaman dari Universitas Indonesia.",
        image: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?q=80&w=800",
        imagePosition: "right",
    },
];

const categoryTabs = ["RUANGAN", "MODUL", "MEDIA KIT", "ROBOT"];

export default function FasilitasPage() {
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
                                    key={tab}
                                    href={`#${tab.toLowerCase().replace(' ', '-')}`}
                                    className="flex-1 text-center px-4 py-3 rounded-full bg-[#f5b634] text-white text-xs md:text-sm font-bold tracking-wider hover:bg-[#dba023] transition-all shadow-sm whitespace-nowrap"
                                >
                                    {tab}
                                </a>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Facilities List */}
            <section id="facilities" className="py-16 bg-white">
                <div className="max-w-7xl mx-auto px-6">
                    {facilities.map((facility, index) => (
                        <div
                            key={facility.category}
                            id={facility.category.toLowerCase().replace(' ', '-')}
                            className={`flex flex-col ${facility.imagePosition === 'left' ? 'lg:flex-row' : 'lg:flex-row-reverse'} gap-8 lg:gap-16 p-8 lg:p-12 mb-8 border-4 border-primary/20 rounded-3xl bg-gray-50/30`}
                        >
                            {/* Image */}
                            <div className="lg:w-1/2">
                                <div className="relative aspect-video rounded-2xl overflow-hidden shadow-lg">
                                    <Image
                                        src={facility.image}
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
                                    {facility.category}
                                </span>
                                <h2 className="text-2xl md:text-3xl font-bold text-primary mb-4">
                                    {facility.title}
                                </h2>
                                <p className="text-primary/70 leading-relaxed">
                                    {facility.description}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            <Footer />
        </main>
    );
}
