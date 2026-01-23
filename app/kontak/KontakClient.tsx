"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import MapSection from "@/components/MapSection";
import Image from "next/image";
import { useEffect, useState } from "react";
import { api, BackendSiteSettings } from "@/lib/api";

/**
 * Kontak Page
 * 
 * Struktur sesuai design reference:
 * 1. Hero dengan gambar dan info kontak
 * 2. Social media icons
 * 3. Map
 * 
 * PANDUAN:
 * - Form kontak bisa ditambahkan nanti
 * - Data kontak menggunakan info dari user
 */

export default function KontakPage() {
    const [settings, setSettings] = useState<BackendSiteSettings | null>(null);

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const res = await api.content.settings();
                setSettings(res);
            } catch (err) {
                console.error("Failed to fetch site settings", err);
            }
        };
        fetchSettings();
    }, []);

    const getSocialColor = (type: string) => {
        switch (type) {
            case 'instagram': return "bg-gradient-to-br from-purple-500 to-pink-500";
            case 'linkedin': return "bg-blue-600";
            case 'email': return "bg-red-500";
            case 'whatsapp': return "bg-green-500";
            case 'phone': return "bg-primary";
            default: return "bg-gray-500";
        }
    };

    const socialLinks = settings ? [
        { icon: "instagram", href: settings.instagram_url, color: getSocialColor('instagram') },
        { icon: "linkedin", href: settings.linkedin_url, color: getSocialColor('linkedin') },
        { icon: "email", href: `mailto:${settings.email}`, color: getSocialColor('email') },
        { icon: "whatsapp", href: `https://wa.me/${settings.whatsapp.replace(/\D/g, '')}`, color: getSocialColor('whatsapp') },
        { icon: "phone", href: `tel:${settings.phone}`, color: getSocialColor('phone') },
    ].filter(link => link.href && link.href !== "mailto:" && link.href !== "https://wa.me/" && link.href !== "tel:") : [];

    return (
        <main className="min-h-screen">
            <Navbar />
            
            {/* Hero Section */}
            <section className="pt-32 pb-40 relative bg-linear-to-b from-primary to-primary/90 overflow-hidden">
                {/* Wave Decoration */}
                <div className="absolute bottom-0 left-0 right-0 z-10 pointer-events-none">
                    <svg viewBox="0 0 1440 320" className="w-full h-20 md:h-32 text-white opacity-100" preserveAspectRatio="none">
                        <path fill="currentColor" fillOpacity="1" d="M0,96L48,112C96,128,192,160,288,160C384,160,480,128,576,112C672,96,768,96,864,112C960,128,1056,160,1152,160C1248,160,1344,128,1392,112L1440,96L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
                    </svg>
                </div>
                
                {/* Background Pattern */}
                <div className="absolute inset-0 opacity-10 bg-[url('/grid.svg')] z-0"></div>

                <div className="max-w-7xl mx-auto px-6 relative z-20">
                    <div className="flex flex-col lg:flex-row items-center lg:items-start gap-16 pt-8">
                        {/* Image Side */}
                        <div className="lg:w-1/2 order-2 lg:order-1">
                            <div className="relative aspect-4/3 rounded-3xl overflow-hidden shadow-2xl border-4 border-white/20">
                                <Image
                                    src="https://images.unsplash.com/photo-1556761175-5973dc0f32e7?q=80&w=800"
                                    alt="Contact AiCi"
                                    fill
                                    className="object-cover"
                                    sizes="(max-width: 768px) 100vw, 50vw"
                                    priority
                                />
                                {/* Overlay Gradient */}
                                <div className="absolute inset-0 bg-linear-to-t from-primary/60 to-transparent"></div>
                            </div>
                        </div>
                        
                        {/* Contact Info Side */}
                        <div className="lg:w-1/2 order-1 lg:order-2 text-center lg:text-left pt-4">

                            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
                                Mari Berkolaborasi <br/>
                                <span className="text-secondary">Bersama AiCi</span>
                            </h1>
                            
                            <p className="text-white/80 text-lg mb-10 max-w-xl mx-auto lg:mx-0 leading-relaxed">
                                Kami siap membantu institusi pendidikan Anda dalam mengadopsi kurikulum AI. Hubungi kami untuk diskusi lebih lanjut atau kunjungi kantor kami.
                            </p>
                            
                            {/* Contact Details Cards */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
                                <div className="p-5 bg-white/20 backdrop-blur-md rounded-xl border border-white/30 text-left hover:bg-white/30 transition-colors group shadow-lg">
                                    <div className="flex items-start gap-4">
                                        <div className="p-3 bg-white rounded-lg text-secondary shadow-sm transition-transform">
                                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                            </svg>
                                        </div>
                                        <div>
                                            <h3 className="text-white font-bold mb-1 text-lg">Alamat</h3>
                                            <p className="text-white/90 text-sm leading-relaxed font-medium">
                                                {settings?.address || "Gd. Lab Riset Multidisiplin Pertamina FMIPA UI Lt. 4, Depok 16424"}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="p-5 bg-white/20 backdrop-blur-md rounded-xl border border-white/30 text-left hover:bg-white/30 transition-colors group shadow-lg">
                                    <div className="flex items-start gap-4">
                                        <div className="p-3 bg-white rounded-lg text-green-600 shadow-sm transition-transform">
                                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                            </svg>
                                        </div>
                                        <div>
                                            <h3 className="text-white font-bold mb-1 text-lg">Telepon & WA</h3>
                                            <p className="text-white/90 text-sm font-medium">
                                                {settings?.phone || "0821-1010-3938"} (Official)
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            {/* Social Icons */}
                            <div className="flex items-center justify-center lg:justify-start gap-4 mb-12">
                                <span className="text-white/60 text-sm font-semibold uppercase tracking-wider mr-2">Follow Us:</span>
                                {socialLinks.length > 0 ? socialLinks.map((link) => (
                                    <a
                                        key={link.icon}
                                        href={link.href}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className={`w-10 h-10 ${link.color} rounded-full flex items-center justify-center text-white hover:-translate-y-1 transition-transform shadow-lg border border-white/20`}
                                    >
                                        <SocialIcon type={link.icon} />
                                    </a>
                                )) : (
                                     <p className="text-white/60 text-sm">Loading...</p>
                                )}
                            </div>

                            {/* Contact Form */}
                            <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 md:p-8 border border-white/20 shadow-2xl">
                                <h3 className="text-2xl font-bold text-white mb-6">Kirim Pesan</h3>
                                <ContactForm />
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Map Section */}
            <MapSection />

            <Footer />
        </main>
    );
}

// Social Icon Component
const SocialIcon = ({ type }: { type: string }) => {
    const iconClass = "w-6 h-6";
    
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

const ContactForm = () => {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        subject: "",
        message: "",
    });
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setStatus('idle');

        try {
            await api.content.sendContact(formData);
            setStatus('success');
            setFormData({ name: "", email: "", phone: "", subject: "", message: "" });
        } catch (err) {
            console.error(err);
            setStatus('error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                    <label htmlFor="name" className="text-sm font-medium text-white/80">Nama</label>
                    <input
                        type="text"
                        name="name"
                        id="name"
                        required
                        value={formData.name}
                        onChange={handleChange}
                        className="w-full px-4 py-2 rounded-lg bg-white/20 border border-white/10 text-white placeholder-white/40 focus:outline-hidden focus:ring-2 focus:ring-secondary focus:border-transparent transition-all"
                        placeholder="Nama Lengkap"
                    />
                </div>
                <div className="space-y-1">
                    <label htmlFor="email" className="text-sm font-medium text-white/80">Email</label>
                    <input
                        type="email"
                        name="email"
                        id="email"
                        required
                        value={formData.email}
                        onChange={handleChange}
                        className="w-full px-4 py-2 rounded-lg bg-white/20 border border-white/10 text-white placeholder-white/40 focus:outline-hidden focus:ring-2 focus:ring-secondary focus:border-transparent transition-all"
                        placeholder="email@example.com"
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                    <label htmlFor="phone" className="text-sm font-medium text-white/80">No. Telepon (Opsional)</label>
                    <input
                        type="tel"
                        name="phone"
                        id="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        className="w-full px-4 py-2 rounded-lg bg-white/20 border border-white/10 text-white placeholder-white/40 focus:outline-hidden focus:ring-2 focus:ring-secondary focus:border-transparent transition-all"
                        placeholder="0812..."
                    />
                </div>
                <div className="space-y-1">
                    <label htmlFor="subject" className="text-sm font-medium text-white/80">Subjek</label>
                    <input
                        type="text"
                        name="subject"
                        id="subject"
                        required
                        value={formData.subject}
                        onChange={handleChange}
                        className="w-full px-4 py-2 rounded-lg bg-white/20 border border-white/10 text-white placeholder-white/40 focus:outline-hidden focus:ring-2 focus:ring-secondary focus:border-transparent transition-all"
                        placeholder="Judul Pesan"
                    />
                </div>
            </div>

            <div className="space-y-1">
                <label htmlFor="message" className="text-sm font-medium text-white/80">Pesan</label>
                <textarea
                    name="message"
                    id="message"
                    required
                    rows={4}
                    value={formData.message}
                    onChange={handleChange}
                    className="w-full px-4 py-2 rounded-lg bg-white/20 border border-white/10 text-white placeholder-white/40 focus:outline-hidden focus:ring-2 focus:ring-secondary focus:border-transparent transition-all resize-none"
                    placeholder="Tulis pesan Anda di sini..."
                ></textarea>
            </div>

            <div className="pt-2">
                <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 px-6 rounded-lg bg-secondary text-white font-bold hover:bg-white hover:text-secondary transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                >
                    {loading ? "Mengirim..." : "Kirim Pesan"}
                </button>
            </div>

            {status === 'success' && (
                <div className="p-4 bg-green-500/20 border border-green-500/50 rounded-lg text-green-100 text-sm">
                    Pesan berhasil dikirim! Kami akan segera menghubungi Anda.
                </div>
            )}
            {status === 'error' && (
                <div className="p-4 bg-red-500/20 border border-red-500/50 rounded-lg text-red-100 text-sm">
                    Gagal mengirim pesan. Silakan coba lagi nanti.
                </div>
            )}
        </form>
    );
};
