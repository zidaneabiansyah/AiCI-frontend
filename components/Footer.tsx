"use client";

import Image from "next/image";
import Link from "next/link";

const Footer = () => {
    return (
        <footer className="bg-white pt-20 pb-10 px-6 border-t border-gray-100 text-left">
            <div className="max-w-screen-2xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16 px-4 md:px-0">
                    {/* Column 1: Logo & About */}
                    <div className="md:col-span-1 space-y-6">
                        <Image
                            src="/aici-logo.png"
                            alt="AiCi Logo"
                            width={200}
                            height={60}
                            className="h-14 w-auto grayscale hover:grayscale-0 transition-all cursor-pointer opacity-90 hover:opacity-100"
                        />
                        <p className="text-primary/60 text-base leading-relaxed max-w-sm">
                            Pusat pengembangan kecerdasan artifisial terdepan di Indonesia, hasil kolaborasi FMIPA UI dan UMG IdeaLab.
                        </p>
                        <div className="flex gap-4">
                            {/* Social Icons */}
                            <div className="w-10 h-10 rounded-full bg-primary/5 flex items-center justify-center hover:bg-secondary hover:text-white transition-all cursor-pointer text-primary/40 group">
                                <svg className="w-5 h-5 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.947.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.947-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.948-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
                            </div>
                            <div className="w-10 h-10 rounded-full bg-primary/5 flex items-center justify-center hover:bg-secondary hover:text-white transition-all cursor-pointer text-primary/40 group">
                                <svg className="w-5 h-5 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.319 1.592 5.548 0 10.061-4.512 10.064-10.062 0-2.69-1.048-5.22-2.953-7.127-1.907-1.906-4.436-2.955-7.124-2.956-5.548 0-10.06 4.513-10.063 10.062 0 2.0.525 3.945 1.52 5.679l-.999 3.65 3.736-.98zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/></svg>
                            </div>
                            <div className="w-10 h-10 rounded-full bg-primary/5 flex items-center justify-center hover:bg-secondary hover:text-white transition-all cursor-pointer text-primary/40 group">
                                <svg className="w-5 h-5 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24"><path d="M4.98 3.5c0 1.381-1.11 2.5-2.48 2.5s-2.48-1.119-2.48-2.5c0-1.38 1.11-2.5 2.48-2.5s2.48 1.12 2.48 2.5zm.02 4.5h-5v16h5v-16zm7.982 0h-4.968v16h4.969v-8.399c0-4.67 6.029-5.052 6.029 0v8.399h4.988v-10.131c0-7.88-8.922-7.593-11.018-3.714v-2.155z"/></svg>
                            </div>
                        </div>
                    </div>

                    {/* Column 2: Quick Links */}
                    <div className="space-y-6">
                        <h4 className="text-primary font-bold text-lg">Quick Links</h4>
                        <ul className="space-y-4 text-primary/60 font-medium">
                            <li><Link href="/" className="hover:text-primary transition-colors">Home</Link></li>
                            <li><Link href="/projects" className="hover:text-primary transition-colors">Projects</Link></li>
                            <li><Link href="/achievements" className="hover:text-primary transition-colors">Achievements</Link></li>
                            <li><Link href="https://aici-umg.com/" className="hover:text-primary transition-colors">Our Main Website</Link></li>
                        </ul>
                    </div>

                    {/* Column 3: Contact Details */}
                    <div className="space-y-6">
                        <h4 className="text-primary font-bold text-lg">Contact Us</h4>
                        <ul className="space-y-4 text-primary/60 font-medium text-sm">
                            <li className="flex gap-3">
                                <svg className="w-5 h-5 text-secondary shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
                                <span>info@aici-aii.com</span>
                            </li>
                            <li className="flex gap-3">
                                <svg className="w-5 h-5 text-secondary shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/></svg>
                                <span>+62 821-1010-3938</span>
                            </li>
                            <li className="flex gap-3">
                                <svg className="w-5 h-5 text-secondary shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                                <span>FMIPA UI, Gedung Laboratorium Riset Multidisiplin, Depok, Jawa Barat</span>
                            </li>
                        </ul>
                    </div>

                    {/* Column 4: Newsletter or Map Placeholder */}
                    <div className="space-y-6">
                        <h4 className="text-primary font-bold text-lg">Stay Updated</h4>
                        <div className="bg-primary/5 p-6 rounded-3xl space-y-4">
                            <p className="text-sm text-primary/60 italic">Join our community to stay informed about the latest AI innovations.</p>
                            <div className="relative">
                                <input 
                                    type="email" 
                                    placeholder="Enter your email" 
                                    className="w-full bg-white border border-gray-100 rounded-full px-5 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-secondary/20"
                                />
                                <button className="absolute right-1 top-1 bottom-1 bg-secondary text-white px-4 rounded-full text-sm font-bold hover:opacity-90 transition-all">
                                    Join
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="pt-10 border-t border-gray-50 flex flex-col md:flex-row justify-between items-center gap-6 text-primary/40 text-sm">
                    <p>© 2026 Artificial Intelligence Center Indonesia (AiCi). All rights reserved.</p>
                    <div className="flex gap-8">
                        <Link href="/privacy" className="hover:text-primary transition-colors">Privacy Policy</Link>
                        <Link href="/terms" className="hover:text-primary transition-colors">Terms of Service</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
