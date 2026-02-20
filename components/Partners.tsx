"use client";

import { useEffect, useState } from "react";
import { LogoLoop } from "./LogoLoop";
import { api, BackendPartner } from "@/lib/api";

/**
 * Partners Component
 * 
 * Menampilkan logo partner/sekolah yang bekerjasama dengan AiCi.
 * Data diambil dari API /content/partners/
 */

const Partners = () => {
    const [partners, setPartners] = useState<BackendPartner[]>([]);
    const [loading, setLoading] = useState(true);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        const fetchPartners = async () => {
            try {
                const res = await api.content.partners();
                setPartners(res.results);
            } catch (err) {
                console.error("Failed to fetch partners", err);
            } finally {
                setLoading(false);
            }
        };
        fetchPartners();
    }, []);

    const partnerLogos = partners.map(p => ({
        src: p.logo,
        alt: p.name
    }));

    // Prevent hydration mismatch
    if (!mounted) {
        return (
            <section className="py-20 bg-white border-t border-gray-50 overflow-hidden">
                <div className="max-w-7xl mx-auto px-6 mb-12">
                    <div className="text-center">
                        <p className="text-[#0B6282] text-xs font-semibold uppercase tracking-[0.3em]">
                            Dipercaya oleh
                        </p>
                    </div>
                </div>
                <div className="w-full">
                    <div className="flex gap-30 animate-pulse px-6">
                        {Array.from({ length: 8 }).map((_, index) => (
                            <div
                                key={index}
                                className="shrink-0 w-50 h-30 bg-gray-200 rounded-lg"
                            />
                        ))}
                    </div>
                </div>
            </section>
        );
    }

    return (
        <section className="py-20 bg-white border-t border-gray-50 overflow-hidden">
            {/* Title Container */}
            <div className="max-w-7xl mx-auto px-6 mb-12">
                <div className="text-center">
                    <p className="text-[#0B6282] text-xs font-semibold uppercase tracking-[0.3em]">
                        Dipercaya oleh
                    </p>
                </div>
            </div>

            {/* Full-width Partners Loop */}
            <div className="w-full">
                {loading ? (
                    // Skeleton loading - show placeholder logos
                    <div className="flex gap-30 animate-pulse px-6">
                        {Array.from({ length: 8 }).map((_, index) => (
                            <div
                                key={index}
                                className="shrink-0 w-50 h-30 bg-gray-200 rounded-lg"
                            />
                        ))}
                    </div>
                ) : partners.length === 0 ? (
                    <div className="text-center text-gray-500 py-8">
                        Belum ada partner
                    </div>
                ) : (
                    <LogoLoop 
                        logos={partnerLogos}
                        logoHeight={120}
                        direction="right"
                        speed={80}
                        gap={120}
                        grayscaleOnLoop={true}
                        scaleOnHover={false}
                        pauseOnHover={true}
                        fadeOut={true}
                        fadeOutColor="#ffffff"
                    />
                )}
            </div>
        </section>
    );
};

export default Partners;
