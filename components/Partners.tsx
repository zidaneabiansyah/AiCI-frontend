"use client";

import Image from "next/image";

/**
 * Partners Component
 * 
 * Menampilkan logo partner/sekolah yang bekerjasama dengan AiCi.
 * 
 * PANDUAN:
 * - Logo bisa diambil dari API /content/partners/
 * - Untuk sekarang menggunakan placeholder
 * - Tambah/kurangi items sesuai kebutuhan
 */

// Placeholder partners - will be replaced with API data
const partners = [
    { name: "Bisa Mandiri", logo: "/partners/bisa-mandiri.png" },
    { name: "SMK Partner", logo: "/partners/smk-partner.png" },
    { name: "Wisya", logo: "/partners/wisya.png" },
    { name: "FMIPA UI", logo: "/partners/fmipa-ui.png" },
];

const Partners = () => {
    return (
        <section className="py-16 bg-gray-50">
            <div className="max-w-7xl mx-auto px-6">
                {/* Section Title */}
                <div className="text-center mb-12">
                    <p className="text-primary/40 text-sm uppercase tracking-widest">
                        Dipercaya oleh
                    </p>
                </div>

                {/* Partners Grid */}
                <div className="flex flex-wrap items-center justify-center gap-8 md:gap-16">
                    {partners.map((partner, index) => (
                        <div
                            key={index}
                            className="grayscale hover:grayscale-0 opacity-60 hover:opacity-100 transition-all duration-300 cursor-pointer"
                        >
                            {/* Using placeholder since actual logos may not exist yet */}
                            <div className="w-32 h-16 bg-gray-200 rounded-lg flex items-center justify-center text-gray-400 text-xs">
                                {partner.name}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Partners;
