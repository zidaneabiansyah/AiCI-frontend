"use client";

import Link from "next/link";

/**
 * ProgramsPreview Component
 * 
 * Menampilkan 6 program AiCi dalam bentuk cards dengan icons.
 * Setiap card memiliki: icon, judul, deskripsi singkat
 * 
 * Ini adalah PANDUAN untuk kamu jika ingin modifikasi:
 * - Ganti icons dengan SVG custom jika diperlukan
 * - Ubah warna background card sesuai kebutuhan
 * - Tambah/kurangi items di array `programs`
 */

const programs = [
    {
        icon: "🎓",
        title: "Fun Learning with AI",
        description: "Kegiatan belajar AI yang menyenangkan untuk siswa SD/MI, SMP/MTs dan SMA/MA/SMK dengan tutor dari Universitas Indonesia.",
        color: "bg-primary",
    },
    {
        icon: "🤖",
        title: "Extracurricular AI Club",
        description: "AiCI membuka ekstrakurikuler AI dan Robotik di sekolah-sekolah dengan modul pembelajaran sesuai tingkatan.",
        color: "bg-primary",
    },
    {
        icon: "📅",
        title: "AI Day",
        description: "Kegiatan satu hari untuk menumbuhkan minat dan pengetahuan peserta didik dalam bidang AI dengan cara yang menyenangkan.",
        color: "bg-primary",
    },
    {
        icon: "🎪",
        title: "AI Edu Fair",
        description: "Kegiatan pelatihan perakitan robot, pembuatan program dan mini competition untuk memicu ketertarikan pada AI.",
        color: "bg-primary",
    },
    {
        icon: "🎯",
        title: "AI Talents Program",
        description: "Program Studi Independen Bersertifikat Kampus Merdeka bekerjasama dengan FMIPA UI selama 5 bulan.",
        color: "bg-primary",
    },
    {
        icon: "💼",
        title: "Digital Marketing",
        description: "Layanan agensi untuk membantu perusahaan dalam memanfaatkan Google Ads, Landing Page, Website dan SEO.",
        color: "bg-primary",
    },
];

const ProgramsPreview = () => {
    return (
        <section className="py-20 bg-white">
            <div className="max-w-7xl mx-auto px-6">
                {/* Section Header */}
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-4xl font-bold text-primary mb-4">
                        Program Kami
                    </h2>
                    <p className="text-primary/60 max-w-2xl mx-auto">
                        Berbagai program pengembangan keterampilan AI dan Robotika untuk semua tingkatan.
                    </p>
                </div>

                {/* Programs Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {programs.map((program, index) => (
                        <div
                            key={index}
                            className={`${program.color} text-white p-8 rounded-3xl hover:shadow-xl hover:shadow-primary/20 transition-all duration-300 group`}
                        >
                            <div className="text-4xl mb-4">{program.icon}</div>
                            <h3 className="text-xl font-bold mb-3 group-hover:text-secondary transition-colors">
                                {program.title}
                            </h3>
                            <p className="text-white/80 text-sm leading-relaxed">
                                {program.description}
                            </p>
                        </div>
                    ))}
                </div>

                {/* CTA Link */}
                <div className="text-center mt-12">
                    <Link
                        href="/program"
                        className="inline-flex items-center gap-2 text-secondary font-bold hover:underline"
                    >
                        Lihat Semua Program
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                        </svg>
                    </Link>
                </div>
            </div>
        </section>
    );
};

export default ProgramsPreview;
