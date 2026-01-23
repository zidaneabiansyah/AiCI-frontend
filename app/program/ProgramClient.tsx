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
                setPrograms(res.results);
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
                    <div className="flex justify-center py-20">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0B6282]"></div>
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
                                        <div className="relative aspect-video rounded-[2rem] overflow-hidden shadow-xl">
                                            <Image
                                                src={program.image}
                                                alt={program.title}
                                                fill
                                                className="object-cover transition-transform duration-700 group-hover:scale-105"
                                                sizes="(max-width: 768px) 100vw, 50vw"
                                            />
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
