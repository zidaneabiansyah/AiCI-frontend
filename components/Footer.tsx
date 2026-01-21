"use client";

import Image from "next/image";
import Link from "next/link";

/**
 * Footer Component
 * 
 * Struktur sesuai design reference:
 * - Column 1: Logo + Alamat lengkap
 * - Column 2: PAGES links
 * - Column 3: DOWNLOAD links
 * - Column 4: SOCIAL MEDIA icons
 * 
 * Background: Primary color (#255D74)
 */

const Footer = () => {
    const pageLinks = [
        { href: "/profil", label: "Profil" },
        { href: "/fasilitas", label: "Fasilitas" },
        { href: "/program", label: "Program" },
        { href: "/kontak", label: "Kontak" },
        { href: "/artikel", label: "Artikel Terbaru" },
    ];

    const downloadLinks = [
        { href: "#", label: "Fun Learning" },
        { href: "#", label: "Workshop Prompt Engineer" },
        { href: "#", label: "Extracurricular AI and Robotic" },
        { href: "#", label: "AI for Education" },
        { href: "#", label: "AI Day" },
        { href: "#", label: "AI Edu Fair" },
        { href: "#", label: "AI Talents" },
    ];

    const socialLinks = [
        { href: "https://instagram.com/aici.official", icon: "instagram", label: "Instagram" },
        { href: "https://linkedin.com/company/aici-indonesia", icon: "linkedin", label: "LinkedIn" },
        { href: "mailto:info@aici-aii.com", icon: "email", label: "Email" },
        { href: "https://wa.me/6282110103938", icon: "whatsapp", label: "WhatsApp" },
        { href: "tel:+6282110103938", icon: "phone", label: "Phone" },
    ];

    return (
        <footer className="bg-primary text-white">
            {/* Main Footer Content */}
            <div className="max-w-screen-2xl mx-auto px-6 py-16">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
                    {/* Column 1: Logo & Address */}
                    <div className="space-y-6">
                        <Image
                            src="/aici-logo.png"
                            alt="AiCi Logo"
                            width={160}
                            height={50}
                            className="h-12 w-auto object-contain brightness-0 invert"
                        />
                        <div className="space-y-2 text-white/70 text-sm leading-relaxed">
                            <p className="font-semibold text-white">Artificial Intelligence Center Indonesia</p>
                            <p>Gd. Laboratorium Riset Multidisiplin Pertamina</p>
                            <p>FMIPA UI Lt. 4, Universitas Indonesia</p>
                            <p>Depok, Jawa Barat 16424</p>
                            <p>Phone 0821-1010-3938</p>
                        </div>
                    </div>

                    {/* Column 2: Pages */}
                    <div className="space-y-6">
                        <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-white/50">Pages</h4>
                        <ul className="space-y-3">
                            {pageLinks.map((link) => (
                                <li key={link.href}>
                                    <Link
                                        href={link.href}
                                        className="text-white/70 hover:text-white transition-colors text-sm flex items-center gap-2"
                                    >
                                        <svg className="w-3 h-3 text-secondary" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                                        </svg>
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Column 3: Downloads */}
                    <div className="space-y-6">
                        <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-white/50">Download</h4>
                        <ul className="space-y-3">
                            {downloadLinks.map((link) => (
                                <li key={link.label}>
                                    <Link
                                        href={link.href}
                                        className="text-white/70 hover:text-white transition-colors text-sm flex items-center gap-2"
                                    >
                                        <svg className="w-3 h-3 text-secondary" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                                        </svg>
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Column 4: Social Media */}
                    <div className="space-y-6">
                        <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-white/50">Social Media</h4>
                        <div className="flex gap-3 flex-wrap">
                            {socialLinks.map((link) => (
                                <a
                                    key={link.icon}
                                    href={link.href}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-10 h-10 bg-white/10 hover:bg-secondary rounded-lg flex items-center justify-center transition-all"
                                    aria-label={link.label}
                                >
                                    <SocialIcon type={link.icon} />
                                </a>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Bar */}
            <div className="border-t border-white/10">
                <div className="max-w-screen-2xl mx-auto px-6 py-6 text-center text-white/40 text-sm">
                    © 2026 Artificial Intelligence Center Indonesia (AiCi). All rights reserved.
                </div>
            </div>
        </footer>
    );
};

// Helper component for social icons
const SocialIcon = ({ type }: { type: string }) => {
    const iconClass = "w-5 h-5 text-white";
    
    switch (type) {
        case "instagram":
            return (
                <svg className={iconClass} fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.947.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.947-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.948-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
            );
        case "linkedin":
            return (
                <svg className={iconClass} fill="currentColor" viewBox="0 0 24 24">
                    <path d="M4.98 3.5c0 1.381-1.11 2.5-2.48 2.5s-2.48-1.119-2.48-2.5c0-1.38 1.11-2.5 2.48-2.5s2.48 1.12 2.48 2.5zm.02 4.5h-5v16h5v-16zm7.982 0h-4.968v16h4.969v-8.399c0-4.67 6.029-5.052 6.029 0v8.399h4.988v-10.131c0-7.88-8.922-7.593-11.018-3.714v-2.155z"/>
                </svg>
            );
        case "email":
            return (
                <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                </svg>
            );
        case "whatsapp":
            return (
                <svg className={iconClass} fill="currentColor" viewBox="0 0 24 24">
                    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.319 1.592 5.548 0 10.061-4.512 10.064-10.062 0-2.69-1.048-5.22-2.953-7.127-1.907-1.906-4.436-2.955-7.124-2.956-5.548 0-10.06 4.513-10.063 10.062 0 2.0.525 3.945 1.52 5.679l-.999 3.65 3.736-.98z"/>
                </svg>
            );
        case "phone":
            return (
                <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>
                </svg>
            );
        default:
            return null;
    }
};

export default Footer;
