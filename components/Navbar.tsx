"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";

/**
 * Navbar Component
 * 
 * Fitur:
 * - Hide on scroll down, show on scroll up
 * - Mobile responsive dengan hamburger menu
 * - Dropdown untuk Artikel
 * 
 * Menu: Home | Program | Profil | Fasilitas | Galeri | Riset | Kontak | Artikel
 */

const navLinks = [
    { href: "/", label: "Home" },
    { href: "/program", label: "Program" },
    { href: "/profil", label: "Profil" },
    { href: "/fasilitas", label: "Fasilitas" },
    { href: "/galeri", label: "Galeri" },
    { href: "/riset", label: "Riset" },
    { href: "/kontak", label: "Kontak" },
    { href: "/artikel", label: "Artikel" },
];

const Navbar = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [isVisible, setIsVisible] = useState(true);
    const [lastScrollY, setLastScrollY] = useState(0);

    useEffect(() => {
        const controlNavbar = () => {
            if (typeof window !== 'undefined') {
                if (window.scrollY > lastScrollY && window.scrollY > 100) {
                    setIsVisible(false);
                } else {
                    setIsVisible(true);
                }
                setLastScrollY(window.scrollY);
            }
        };

        if (typeof window !== 'undefined') {
            window.addEventListener('scroll', controlNavbar);
            return () => window.removeEventListener('scroll', controlNavbar);
        }
    }, [lastScrollY]);

    return (
        <nav className={`fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-100 px-6 py-4 transition-transform duration-300 ${isVisible ? 'translate-y-0' : '-translate-y-full'}`}>
            <div className="max-w-screen-2xl mx-auto flex items-center justify-between">
                {/* Logo */}
                <Link href="/" className="shrink-0">
                    <Image
                        src="/aici-logo.png"
                        alt="AiCi Logo"
                        width={180}
                        height={60}
                        className="h-10 md:h-12 w-auto object-contain"
                    />
                </Link>

                {/* Desktop Navigation */}
                <div className="hidden lg:flex items-center gap-8">
                    {navLinks.map((link) => (
                        <Link
                            key={link.href}
                            href={link.href}
                            className="text-primary font-medium hover:text-secondary transition-colors text-sm"
                        >
                            {link.label}
                        </Link>
                    ))}
                </div>

                {/* Mobile Menu Button */}
                <button 
                    onClick={() => setIsOpen(!isOpen)}
                    className="lg:hidden text-primary p-2"
                    aria-label="Toggle Menu"
                >
                    {isOpen ? (
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    ) : (
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                        </svg>
                    )}
                </button>
            </div>

            {/* Mobile Menu */}
            {isOpen && (
                <div className="lg:hidden absolute top-full left-0 right-0 bg-white border-b border-gray-100 p-6 shadow-xl animate-in fade-in slide-in-from-top-4 duration-300">
                    <div className="flex flex-col gap-4">
                        {navLinks.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                onClick={() => setIsOpen(false)}
                                className="text-primary font-medium text-lg py-2 border-b border-gray-50 last:border-0"
                            >
                                {link.label}
                            </Link>
                        ))}
                    </div>
                </div>
            )}
        </nav>
    );
};

export default Navbar;
