"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";

const Navbar = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [isVisible, setIsVisible] = useState(true);
    const [lastScrollY, setLastScrollY] = useState(0);

    useEffect(() => {
        const controlNavbar = () => {
            if (typeof window !== 'undefined') {
                if (window.scrollY > lastScrollY && window.scrollY > 100) { // scrolling down
                    setIsVisible(false);
                } else { // scrolling up
                    setIsVisible(true);
                }
                setLastScrollY(window.scrollY);
            }
        };

        if (typeof window !== 'undefined') {
            window.addEventListener('scroll', controlNavbar);

            // cleanup function
            return () => {
                window.removeEventListener('scroll', controlNavbar);
            };
        }
    }, [lastScrollY]);

    return (
        <nav className={`fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100 px-6 py-4 flex items-center transition-transform duration-300 ${isVisible ? 'translate-y-0' : '-translate-y-full'}`}>
            {/* Logo Section */}
            <div className="flex-1 flex justify-start">
                <Image
                    src="/aici-logo.png"
                    alt="AiCI Logo"
                    width={180}
                    height={60}
                    className="h-10 md:h-14 w-auto object-contain"
                />
            </div>

            {/* Links Section - Centered (Hidden on Mobile) */}
            <div className="hidden md:flex items-center gap-12">
                <Link href="/" className="text-primary font-bold hover:opacity-80 transition-opacity whitespace-nowrap">
                    Home
                </Link>
                <Link href="/projects" className="text-primary font-medium hover:opacity-80 transition-opacity whitespace-nowrap">
                    Projects
                </Link>
                <Link href="/achievements" className="text-primary font-medium hover:opacity-80 transition-opacity whitespace-nowrap">
                    Achievements
                </Link>
            </div>

            {/* Mobile Menu Button */}
            <div className="flex-1 flex justify-end md:hidden">
                <button 
                    onClick={() => setIsOpen(!isOpen)}
                    className="text-primary p-2"
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

            {/* Placeholder to balance the centering on desktop */}
            <div className="hidden md:flex flex-1 justify-end">
                {/* Future Search or Profile Icon can go here */}
            </div>

            {/* Mobile Menu Content */}
            {isOpen && (
                <div className="absolute top-full left-0 right-0 bg-white border-b border-gray-100 p-6 flex flex-col gap-6 md:hidden shadow-xl animate-in fade-in slide-in-from-top-4 duration-300">
                    <Link 
                        href="/" 
                        onClick={() => setIsOpen(false)}
                        className="text-primary font-bold text-lg"
                    >
                        Home
                    </Link>
                    <Link 
                        href="/projects" 
                        onClick={() => setIsOpen(false)}
                        className="text-primary font-medium text-lg"
                    >
                        Projects
                    </Link>
                    <Link 
                        href="/achievements" 
                        onClick={() => setIsOpen(false)}
                        className="text-primary font-medium text-lg"
                    >
                        Achievements
                    </Link>
                </div>
            )}
        </nav>
    );
};

export default Navbar;
