"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import MapSection from "@/components/MapSection";
import Image from "next/image";
import Link from "next/link";
import { Phone, MessageCircle, AlertCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { api, BackendProgram } from "@/lib/api";

export default function ProgramPage() {
    const [programs, setPrograms] = useState<BackendProgram[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchPrograms = async () => {
            try {
                const res = await api.content.programs();
                setPrograms(res.data);
            } catch (err) {
                console.error("Failed to fetch programs", err);
                setError("Failed to load programs.");
            } finally {
                setLoading(false);
            }
        };
        fetchPrograms();
    }, []);

    return (
        <main className="min-h-screen bg-[#eef2f5]">
            <Navbar />
            
            {/* Header / Breadcrumb Space */}
            <div className="pt-24 md:pt-32 pb-8 max-w-7xl mx-auto px-6">
                <nav className="flex text-sm text-gray-500 mb-4">
                    <Link href="/" className="hover:text-[#0B6282]">Home</Link>
                    <span className="mx-2">/</span>
                    <span className="text-[#0B6282] font-medium">Program</span>
                </nav>
            </div>

            {/* Floating Contact Buttons */}
            <div className="fixed right-6 bottom-32 z-50 flex flex-col gap-4">
                <a
                    href="https://wa.me/6281234567890" // TODO: Use dynamic settings here too later
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-[#25D366] text-white p-3 rounded-full shadow-2xl hover:scale-110 transition-transform group relative"
                >
                    <MessageCircle className="w-6 h-6" />
                    <span className="absolute right-full mr-3 top-1/2 -translate-y-1/2 bg-white text-gray-800 px-3 py-1 rounded-lg text-xs font-bold shadow-xl opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap border">
                        Hubungi WhatsApp
                    </span>
                </a>
                <a
                    href="tel:+6281234567890"
                    className="bg-[#0B6282] text-white p-3 rounded-full shadow-2xl hover:scale-110 transition-transform group relative"
                >
                    <Phone className="w-6 h-6" />
                    <span className="absolute right-full mr-3 top-1/2 -translate-y-1/2 bg-white text-gray-800 px-3 py-1 rounded-lg text-xs font-bold shadow-xl opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap border">
                        Hubungi Telepon
                    </span>
                </a>
            </div>

            {/* Programs Section */}
            <div className="max-w-7xl mx-auto px-6 pb-24">
                {loading ? (
                    <div className="space-y-12">
                        {[...Array(3)].map((_, index) => (
                            <section 
                                key={`skeleton-${index}`}
                                className="bg-white rounded-[2.5rem] p-8 md:p-12 shadow-sm border border-gray-100/50"
                            >
                                <div className={`flex flex-col ${index % 2 === 0 ? 'lg:flex-row' : 'lg:flex-row-reverse'} items-center gap-12 lg:gap-20`}>
                                    {/* Image Skeleton */}
                                    <div className="w-full lg:w-1/2 relative group">
                                        <div className="relative aspect-video rounded-[2rem] overflow-hidden shadow-xl bg-gradient-to-br from-gray-200 to-gray-300 animate-pulse">
                                            <div className="w-full h-full" />
                                        </div>
                                    </div>

                                    {/* Text Content Skeleton */}
                                    <div className="w-full lg:w-1/2 space-y-4">
                                        {/* Title Skeleton */}
                                        <div className="h-10 bg-gray-200 rounded-lg animate-pulse w-3/4" />
                                        
                                        {/* Description Skeleton */}
                                        <div className="space-y-3">
                                            <div className="h-4 bg-gray-200 rounded-lg animate-pulse" />
                                            <div className="h-4 bg-gray-200 rounded-lg animate-pulse w-5/6" />
                                            <div className="h-4 bg-gray-200 rounded-lg animate-pulse w-4/6" />
                                        </div>

                                        {/* More Description Lines */}
                                        <div className="space-y-3 pt-2">
                                            <div className="h-4 bg-gray-200 rounded-lg animate-pulse" />
                                            <div className="h-4 bg-gray-200 rounded-lg animate-pulse w-5/6" />
                                        </div>

                                        {/* Button Skeleton */}
                                        <div className="pt-4">
                                            <div className="h-10 bg-gray-300 rounded-full animate-pulse w-40" />
                                        </div>
                                    </div>
                                </div>
                            </section>
                        ))}
                    </div>
                ) : error ? (
                    <div className="text-center py-20 text-red-500 flex flex-col items-center gap-2">
                        <AlertCircle className="w-10 h-10" />
                        <p>{error}</p>
                    </div>
                ) : (
                    <div className="space-y-12">
                        {programs.map((program, index) => (
                            <section 
                                key={program.id}
                                className="bg-white rounded-[2.5rem] p-8 md:p-12 shadow-sm border border-gray-100/50"
                            >
                                <div className={`flex flex-col ${index % 2 === 0 ? 'lg:flex-row' : 'lg:flex-row-reverse'} items-center gap-12 lg:gap-20`}>
                                    {/* Image Container */}
                                    <div className="w-full lg:w-1/2 relative group">
                                        <div className="relative aspect-video rounded-[2rem] overflow-hidden shadow-xl bg-gradient-to-br from-gray-200 to-gray-300">
                                            {program.image ? (
                                                <Image
                                                    src={program.image}
                                                    alt={program.title || 'Program Image'}
                                                    fill
                                                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                                                    sizes="(max-width: 768px) 100vw, 50vw"
                                                    priority={index === 0}
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center">
                                                    <div className="text-center text-gray-500">
                                                        <svg className="w-16 h-16 mx-auto mb-2 opacity-40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-6-6 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-6-6-5.159 5.159a2.25 2.25 0 0 0 0 3.182l5.159 5.159m0-6 5.159 5.159" />
                                                        </svg>
                                                        <p className="text-sm font-medium">Gambar tidak tersedia</p>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Text Content */}
                                    <div className="w-full lg:w-1/2">
                                        <h2 className="text-2xl md:text-3xl lg:text-4xl font-semibold text-[#0B6282] mb-6 leading-tight">
                                            {program.title}
                                        </h2>
                                        <div className="text-gray-600 text-sm md:text-base leading-relaxed space-y-4 mb-10 text-justify">
                                            {program.description.split('\r\n').map((para, i) => (
                                                <p key={i}>{para}</p>
                                            ))}
                                        </div>
                                        <Link 
                                            href={`/program/${program.id}`}
                                            className="inline-block bg-[#0B6282] text-white px-8 py-3 rounded-full font-bold text-xs tracking-widest uppercase hover:bg-[#094d66] transition-all shadow-lg"
                                        >
                                            UNDUH BROSUR
                                        </Link>
                                    </div>
                                </div>
                            </section>
                        ))}
                    </div>
                )}
            </div>

            <MapSection />
            <Footer />
        </main>
    );
}
