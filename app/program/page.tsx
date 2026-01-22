"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import MapSection from "@/components/MapSection";
import Image from "next/image";
import Link from "next/link";
import { Phone, MessageCircle } from "lucide-react";

/**
 * Program Page Redesign
 * 
 * Menampilkan 8 program AiCi dengan layout alternating card.
 * Menggunakan skema warna #0B6282 dan tipografi yang lebih ringan.
 */

const programs = [
    {
        id: 1,
        title: "Fun Learning with AI untuk Siswa SD/MI, SMP/MTs dan SMA/MA/SMK",
        description: `Kegiatan belajar yang diselenggarakan oleh AiCI bertujuan untuk memperkenalkan dan meningkatkan pengetahuan serta keterampilan peserta didik dalam bidang Artificial Intelligence dengan cara yang menyenangkan sesuai dengan jenjang peserta didik. Selain itu, kegiatan ini juga bertujuan untuk mengembangkan keterampilan peserta didik dalam aplikasi-aplikasi artificial intelligence yang dapat dipergunakan dalam kehidupan sehari-hari.

Pembelajaran AI akan ditemani langsung oleh Tutor dari Universitas Indonesia. Di dalam program Fun Learning with AI peserta didik akan mempelajari 4 (empat) pokok pembahasan di antaranya adalah robotik, coding, programing, dan data science.

Fun learning with AI ditunjang dengan kurikulum yang lengkap. Peserta didik akan mendapatkan Modul pembelajaran, jaringan internet, dan sertifikat.`,
        image: "https://images.unsplash.com/photo-1509062522246-3755977927d7?q=80&w=800",
    },
    {
        id: 2,
        title: "AI for Education",
        description: `Program pelatihan intensif bagi para pendidik untuk memanfaatkan teknologi Kecerdasan Artifisial (AI) dalam meningkatkan kualitas proses belajar mengajar. Membantu guru dalam menyusun bahan ajar yang interaktif, otomatisasi penilaian, serta pemanfaatan tools AI edukatif terkini.`,
        image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=800",
    },
    {
        id: 3,
        title: "AI Day",
        description: `AI Day merupakan sebuah kegiatan yang dilaksanakan selama satu hari dengan tujuan untuk menumbuhkan minat, pengetahuan, dan keterampilan peserta didik dalam bidang artificial intelligence dengan cara yang menyenangkan (fun learning).

Kegiatan ini sebagian besar merupakan pengenalan robotik dan artificial intelligence untuk siswa SD/MI, SMP/MTs, dan SMA/MA/SMK.`,
        image: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?q=80&w=800",
    },
    {
        id: 4,
        title: "AI Edu Fair",
        description: `Sebuah kegiatan yang dilaksanakan selama satu hari dengan tujuan untuk menumbuhkan rasa ingin tahu, pengetahuan, dan keterampilan peserta didik dalam bidang artificial intelligence.

Selain itu, pada kegiatan ini dikembangkan juga beberapa soft skills seperti: berpikir logis, berpikir kritis, teamwork, dan lain-lain.

Kegiatan ini ditujukan untuk siswa SD/MI dengan kegiatan utama berupa pelatihan perakitan robot, pembuatan program dan mengikuti mini competition untuk memicu ketertarikan pada pembelajaran AI.`,
        image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?q=80&w=800",
    },
    {
        id: 5,
        title: "Preparing Artificial Intelligence (AI) Talents for Indonesian Future Technology",
        description: `Merupakan program PT Artifisial Intelegensia Indonesia (AiCi) bekerjasama dengan Departemen Fisika FMIPA UI dan beberapa praktisi dalam lingkungan kerja start-up dan industri dalam bentuk Studi Independen Bersertifikat Kampus Merdeka.

Program ini bernama Indonesian Artificial Intelligence (AI) Talents. Peserta dapat mengikuti program yang dilaksanakan secara daring dalam durasi 5 bulan dengan biaya pelatihan Rp 3.750.000,-/mahasiswa/5 bulan.`,
        image: "https://images.unsplash.com/photo-1531297484001-80022131f5a1?q=80&w=800",
    },
    {
        id: 6,
        title: "AiCI SIM KLIN",
        description: `Solusi Klinik dalam menyiapkan sistem integrasi yang aman, responsif, dan prediktif sebagai upaya penyelenggaraan rekam medis elektronik sesuai dengan arahan KEMENKES RI.`,
        image: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?q=80&w=800",
    },
    {
        id: 7,
        title: "Digital Marketing for Business",
        description: `Dengan semakin berkembangnya teknologi digital, penting bagi perusahaan untuk memanfaatkan platform online seperti Google Ads, Landing Page, Website dan SEO untuk meningkatkan visibilitas dan omset.

Agensi kami siap membantu perusahaan Anda dalam mencapai tujuan tersebut.`,
        image: "https://images.unsplash.com/photo-1432888498266-38ffec3eaf0a?q=80&w=800",
    },
    {
        id: 8,
        title: "Extracurricular AI and Robotic Club",
        description: `AiCI terbuka untuk menjadi bagian dari Ekstrakurikuler di sekolah-sekolah yang ingin membuka Ekstrakurikuler AI dan Robotik Club.

Kegiatan Ekstrakurikuler di sekolah adalah bentuk dari kerja sama AiCI dalam menyelenggarakan pendidikan yang berkualitas dengan cara mengenalkan dan membekali ilmu AI kepada siswa-siswi.

Kegiatan ekstrakurikuler dapat diikuti oleh siswa SD, SMP, dan SMA dengan modul pembelajaran sesuai tingkatannya. Siswa-siswi yang mengikuti ekstrakurikuler akan dibimbing langsung oleh tutor berpengalaman dari Universitas Indonesia.`,
        image: "https://images.unsplash.com/photo-1517077304055-6e89abbf09b0?q=80&w=800",
    },
];

export default function ProgramPage() {
    return (
        <main className="min-h-screen bg-[#eef2f5]">
            <Navbar />
            
            {/* Header / Breadcrumb Space */}
            <div className="pt-24 md:pt-32 pb-8 max-w-7xl mx-auto px-6">
                <nav className="flex text-sm text-gray-500 mb-4">
                    <Link href="/" className="hover:text-[#0B6282]">Home</Link>
                    <span className="mx-2">/</span>
                    <span className="text-[#0B6282] font-medium">Program</span>
                </nav>
            </div>

            {/* Floating Contact Buttons */}
            <div className="fixed right-6 bottom-32 z-50 flex flex-col gap-4">
                <a
                    href="https://wa.me/6281234567890"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-[#25D366] text-white p-3 rounded-full shadow-2xl hover:scale-110 transition-transform group relative"
                >
                    <MessageCircle className="w-6 h-6" />
                    <span className="absolute right-full mr-3 top-1/2 -translate-y-1/2 bg-white text-gray-800 px-3 py-1 rounded-lg text-xs font-bold shadow-xl opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap border">
                        Hubungi WhatsApp
                    </span>
                </a>
                <a
                    href="tel:+6281234567890"
                    className="bg-[#0B6282] text-white p-3 rounded-full shadow-2xl hover:scale-110 transition-transform group relative"
                >
                    <Phone className="w-6 h-6" />
                    <span className="absolute right-full mr-3 top-1/2 -translate-y-1/2 bg-white text-gray-800 px-3 py-1 rounded-lg text-xs font-bold shadow-xl opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap border">
                        Hubungi Telepon
                    </span>
                </a>
            </div>

            {/* Programs Section */}
            <div className="max-w-7xl mx-auto px-6 pb-24">
                <div className="space-y-12">
                    {programs.map((program, index) => (
                        <section 
                            key={program.id}
                            className="bg-white rounded-[2.5rem] p-8 md:p-12 shadow-sm border border-gray-100/50"
                        >
                            <div className={`flex flex-col ${index % 2 === 0 ? 'lg:flex-row' : 'lg:flex-row-reverse'} items-center gap-12 lg:gap-20`}>
                                {/* Image Container */}
                                <div className="w-full lg:w-1/2 relative group">
                                    <div className="relative aspect-video rounded-[2rem] overflow-hidden shadow-xl">
                                        <Image
                                            src={program.image}
                                            alt={program.title}
                                            fill
                                            className="object-cover transition-transform duration-700 group-hover:scale-105"
                                            sizes="(max-width: 768px) 100vw, 50vw"
                                        />
                                        
                                        {/* Optional Carousel Arrows Overlay */}
                                        <div className="absolute inset-x-4 top-1/2 -translate-y-1/2 flex justify-between opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button className="bg-white/20 backdrop-blur-md p-2 rounded-full text-white hover:bg-white/40">
                                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                                            </button>
                                            <button className="bg-white/20 backdrop-blur-md p-2 rounded-full text-white hover:bg-white/40">
                                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* Text Content */}
                                <div className="w-full lg:w-1/2">
                                    <h2 className="text-2xl md:text-3xl lg:text-4xl font-semibold text-[#0B6282] mb-6 leading-tight">
                                        {program.title}
                                    </h2>
                                    <div className="text-gray-600 text-sm md:text-base leading-relaxed space-y-4 mb-10 text-justify">
                                        {program.description.split('\n\n').map((para, i) => (
                                            <p key={i}>{para}</p>
                                        ))}
                                    </div>
                                    <Link 
                                        href={`/program/${program.id}`}
                                        className="inline-block bg-[#0B6282] text-white px-8 py-3 rounded-full font-bold text-xs tracking-widest uppercase hover:bg-[#094d66] transition-all shadow-lg"
                                    >
                                        UNDUH BROSUR
                                    </Link>
                                </div>
                            </div>
                        </section>
                    ))}
                </div>
            </div>

            <MapSection />
            <Footer />
        </main>
    );
}
