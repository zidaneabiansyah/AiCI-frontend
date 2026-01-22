"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import GoogleTranslate from "./GoogleTranslate";

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
];

const articleCategories = [
    "AiCi Update",
    "Introduction to AI",
    "AI in Learning",
    "AI in Industry",
    "Digital Marketing",
    "ChatGPT & Prompt",
    "Robot Training & Competition",
    "AI Articles"
];

const Navbar = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [isVisible, setIsVisible] = useState(true);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [isMobileDropdownOpen, setIsMobileDropdownOpen] = useState(false);
    const [lastScrollY, setLastScrollY] = useState(0);
    const pathname = usePathname();

    useEffect(() => {
        const controlNavbar = () => {
            if (typeof window !== 'undefined') {
                if (window.scrollY > lastScrollY && window.scrollY > 100) {
                    setIsVisible(false);
                    setIsDropdownOpen(false); // Close dropdown on scroll
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
        <nav className={`fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-100 px-6 py-4 transition-transform duration-300 ${isVisible ? 'translate-y-0' : '-translate-y-full'}`}>
            <div className="max-w-7xl mx-auto flex items-center justify-between">
                {/* Logo */}
                <Link href="/" className="shrink-0">
                    <Image
                        src="/icon/aici-logo.png"
                        alt="AiCi Logo"
                        width={220}
                        height={80}
                        className="h-16 md:h-20 w-auto object-contain"
                    />
                </Link>

                {/* Desktop Navigation */}
                <div className="hidden lg:flex items-center gap-6">
                    {navLinks.map((link) => (
                        <Link
                            key={link.href}
                            href={link.href}
                            className={`${
                                (pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href)))
                                    ? 'text-secondary' 
                                    : 'text-primary'
                            } font-bold hover:text-secondary transition-colors text-[13px] tracking-wide flex items-center gap-1 uppercase`}
                        >
                            {link.label}
                        </Link>
                    ))}

                    {/* Artikel Dropdown */}
                    <div 
                        className="relative group h-full flex items-center"
                        onMouseEnter={() => setIsDropdownOpen(true)}
                        onMouseLeave={() => setIsDropdownOpen(false)}
                    >
                        <Link
                            href="/artikel"
                            className={`${
                                pathname.startsWith('/artikel') ? 'text-secondary' : 'text-primary'
                            } font-bold hover:text-secondary transition-colors text-[13px] tracking-wide flex items-center gap-1 uppercase py-4`}
                        >
                            Artikel
                            <svg className={`w-3 h-3 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" />
                            </svg>
                        </Link>

                        {/* Dropdown Menu */}
                        <div className={`absolute top-full right-0 w-64 bg-white shadow-xl rounded-b-lg border-t-2 border-secondary overflow-hidden transition-all duration-200 origin-top ${isDropdownOpen ? 'opacity-100 scale-y-100' : 'opacity-0 scale-y-0 pointer-events-none'}`}>
                            {articleCategories.map((category, index) => (
                                <Link
                                    key={index}
                                    href={`/artikel?category=${encodeURIComponent(category)}`} // Temporary link
                                    className="block px-6 py-3 text-sm font-semibold text-primary hover:bg-gray-50 hover:text-secondary transition-colors border-b border-gray-50 last:border-0"
                                >
                                    {category}
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Translate Button */}
                <div className="hidden lg:block relative group">
                    <GoogleTranslate />
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
                <div className="lg:hidden absolute top-full left-0 right-0 bg-white border-b border-gray-100 p-6 shadow-xl animate-in fade-in slide-in-from-top-4 duration-300 max-h-[80vh] overflow-y-auto">
                    <div className="flex flex-col gap-4">
                        {navLinks.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                onClick={() => setIsOpen(false)}
                                className={`${
                                    (pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href)))
                                        ? 'text-secondary' 
                                        : 'text-primary'
                                } font-bold text-base py-2 border-b border-gray-50 last:border-0 uppercase`}
                            >
                                {link.label}
                            </Link>
                        ))}
                        
                        {/* Mobile Artikel Dropdown */}
                        <div>
                            <button
                                onClick={() => setIsMobileDropdownOpen(!isMobileDropdownOpen)}
                                className="w-full text-left font-bold text-base py-2 border-b border-gray-50 flex items-center justify-between text-primary uppercase"
                            >
                                Artikel
                                <svg className={`w-4 h-4 transition-transform ${isMobileDropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            </button>
                            {isMobileDropdownOpen && (
                                <div className="pl-4 py-2 bg-gray-50/50 rounded-lg mt-2 space-y-2">
                                    {articleCategories.map((category, index) => (
                                        <Link
                                            key={index}
                                            href={`/artikel?category=${encodeURIComponent(category)}`}
                                            onClick={() => setIsOpen(false)}
                                            className="block text-sm font-medium text-gray-600 hover:text-secondary py-1"
                                        >
                                            {category}
                                        </Link>
                                    ))}
                                </div>
                            )}
                        </div>

                        <button className="bg-[#006080] text-white px-5 py-3 text-sm font-bold w-full rounded-sm mt-2">
                            Translate »
                        </button>
                    </div>
                </div>
            )}
        </nav>
    );
};

export default Navbar;
