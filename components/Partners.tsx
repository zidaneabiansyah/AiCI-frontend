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

    useEffect(() => {
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

    if (loading || partners.length === 0) {
        return null;
    }

    const partnerLogos = partners.map(p => ({
        src: p.logo,
        alt: p.name
    }));

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
            </div>
        </section>
    );
};

export default Partners;
