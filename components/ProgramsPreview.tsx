"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { api, BackendProgram } from "@/lib/api";

/**
 * ProgramsPreview Component
 * 
 * Menampilkan 6 program AiCi dalam bentuk cards dengan icons.
 * Setiap card memiliki: icon, judul, deskripsi singkat
 * 
 * Ini adalah PANDUAN untuk kamu jika ingin modifikasi:
 * - Ganti icons dengan SVG custom jika diperlukan
 * - Ubah warna background card sesuai kebutuhan
 * - Tambah/kurangi items di array `programs`
 */

const ProgramsPreview = () => {
    const [programs, setPrograms] = useState<BackendProgram[]>([]);
    const [loading, setLoading] = useState(true);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        const fetchPrograms = async () => {
            try {
                const res = await api.content.programs();
                // Take only first 5 programs to fit the layout (6th slot is button)
                setPrograms(res.data.slice(0, 5));
            } catch (err) {
                console.error("Failed to fetch programs", err);
            } finally {
                setLoading(false);
            }
        };
        fetchPrograms();
    }, []);

    // Prevent hydration mismatch by not rendering until mounted
    if (!mounted) {
        return (
            <section className="py-20 bg-[#eef2f5]">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {Array.from({ length: 5 }).map((_, index) => (
                            <div
                                key={index}
                                className="bg-[#0B6282] text-white p-8 rounded-[2rem] shadow-xl animate-pulse"
                            >
                                <div className="flex gap-1 mb-4">
                                    <div className="w-1.5 h-6 bg-gray-400 rounded-full" />
                                    <div className="w-1.5 h-6 bg-gray-400 rounded-full mt-1.5" />
                                    <div className="w-1.5 h-6 bg-gray-400 rounded-full mt-3" />
                                </div>
                                <div className="h-6 bg-gray-400 rounded w-3/4 mb-4" />
                                <div className="space-y-2">
                                    <div className="h-3 bg-gray-400 rounded w-full" />
                                    <div className="h-3 bg-gray-400 rounded w-full" />
                                    <div className="h-3 bg-gray-400 rounded w-5/6" />
                                </div>
                            </div>
                        ))}
                        <div className="flex items-center justify-center p-6">
                            <div className="bg-gray-300 animate-pulse px-10 py-5 rounded-full w-full max-w-70 h-14" />
                        </div>
                    </div>
                </div>
            </section>
        );
    }

    return (
        <section className="py-20 bg-[#eef2f5]">
            <div className="max-w-7xl mx-auto px-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {loading ? (
                        // Skeleton loading - show 5 placeholders
                        <>
                            {Array.from({ length: 5 }).map((_, index) => (
                                <div
                                    key={index}
                                    className="bg-[#0B6282] text-white p-8 rounded-[2rem] shadow-xl animate-pulse"
                                >
                                    <div className="flex gap-1 mb-4">
                                        <div className="w-1.5 h-6 bg-gray-400 rounded-full" />
                                        <div className="w-1.5 h-6 bg-gray-400 rounded-full mt-1.5" />
                                        <div className="w-1.5 h-6 bg-gray-400 rounded-full mt-3" />
                                    </div>
                                    <div className="h-6 bg-gray-400 rounded w-3/4 mb-4" />
                                    <div className="space-y-2">
                                        <div className="h-3 bg-gray-400 rounded w-full" />
                                        <div className="h-3 bg-gray-400 rounded w-full" />
                                        <div className="h-3 bg-gray-400 rounded w-5/6" />
                                    </div>
                                </div>
                            ))}
                            {/* Button Card (Slot 6) */}
                            <div className="flex items-center justify-center p-6">
                                <div className="bg-gray-300 animate-pulse px-10 py-5 rounded-full w-full max-w-70 h-14" />
                            </div>
                        </>
                    ) : (
                        <>
                            {programs.map((program) => (
                                <div
                                    key={program.id}
                                    className="bg-[#0B6282] text-white p-8 rounded-[2rem] shadow-xl hover:shadow-2xl transition-all duration-300 group"
                                >
                                    {/* Vertical Bar Icon */}
                                    <div className="flex gap-1 mb-4">
                                        <div className="w-1.5 h-6 bg-[#f03023] rounded-full" />
                                        <div className="w-1.5 h-6 bg-yellow-400 rounded-full mt-1.5" />
                                        <div className="w-1.5 h-6 bg-white rounded-full mt-3" />
                                    </div>
                                    
                                    <h3 className="text-lg font-semibold mb-4 min-h-10 leading-tight">
                                        {program.title}
                                    </h3>
                                    <p className="text-white/80 text-[13px] leading-relaxed line-clamp-6">
                                        {program.description}
                                    </p>
                                </div>
                            ))}

                            {/* Button Card (Slot 6) */}
                            <div className="flex items-center justify-center p-6">
                                <Link
                                    href="/program"
                                    className="bg-[#f03023] text-white px-10 py-5 rounded-full font-bold text-sm tracking-widest uppercase hover:bg-[#d42a1e] transition-all shadow-xl text-center w-full max-w-70"
                                >
                                    DETAIL PROGRAM
                                </Link>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </section>
    );
};

export default ProgramsPreview;
