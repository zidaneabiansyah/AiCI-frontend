"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { api, BackendTestimonial } from "@/lib/api";

/**
 * Testimonials Component
 * 
 * Menampilkan testimoni dari siswa AiCi.
 * Data diambil dari API /content/testimonials/
 */

const Testimonials = () => {
    const [testimonials, setTestimonials] = useState<BackendTestimonial[]>([]);
    const [loading, setLoading] = useState(true);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        const fetchTestimonials = async () => {
            try {
                const res = await api.content.testimonials();
                setTestimonials(res.results);
            } catch (err) {
                console.error("Failed to fetch testimonials", err);
            } finally {
                setLoading(false);
            }
        };
        fetchTestimonials();
    }, []);

    // Prevent hydration mismatch
    if (!mounted) {
        return (
            <section className="py-24 bg-white">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-semibold text-[#0B6282] mb-3">
                            Testimonials
                        </h2>
                        <p className="text-[#0B6282] text-lg md:text-xl font-medium opacity-80">
                            What Do They Think After Studying At AiCI?
                        </p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-24">
                        {Array.from({ length: 4 }).map((_, index) => (
                            <div key={index} className="flex flex-col items-center animate-pulse">
                                <div className="relative w-full max-w-100 aspect-square mb-6">
                                    <div className="absolute inset-0 rounded-[2.5rem] bg-gray-200" />
                                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 z-10">
                                        <div className="bg-gray-300 px-8 py-2 rounded-full w-32 h-8" />
                                    </div>
                                </div>
                                <div className="text-center mt-4 w-full">
                                    <div className="h-8 bg-gray-200 rounded w-48 mx-auto mb-3" />
                                    <div className="h-4 bg-gray-200 rounded w-64 mx-auto mb-2" />
                                    <div className="h-4 bg-gray-200 rounded w-56 mx-auto" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        );
    }

    // Always show section structure
    return (
        <section className="py-24 bg-white">
            <div className="max-w-7xl mx-auto px-6">
                {/* Section Header */}
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-4xl font-semibold text-[#0B6282] mb-3">
                        Testimonials
                    </h2>
                    <p className="text-[#0B6282] text-lg md:text-xl font-medium opacity-80">
                        What Do They Think After Studying At AiCI?
                    </p>
                </div>

                {/* Testimonials Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-24">
                    {loading ? (
                        // Skeleton loading - show 4 placeholders
                        Array.from({ length: 4 }).map((_, index) => (
                            <div key={index} className="flex flex-col items-center animate-pulse">
                                <div className="relative w-full max-w-100 aspect-square mb-6">
                                    <div className="absolute inset-0 rounded-[2.5rem] bg-gray-200" />
                                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 z-10">
                                        <div className="bg-gray-300 px-8 py-2 rounded-full w-32 h-8" />
                                    </div>
                                </div>
                                <div className="text-center mt-4 w-full">
                                    <div className="h-8 bg-gray-200 rounded w-48 mx-auto mb-3" />
                                    <div className="h-4 bg-gray-200 rounded w-64 mx-auto mb-2" />
                                    <div className="h-4 bg-gray-200 rounded w-56 mx-auto" />
                                </div>
                            </div>
                        ))
                    ) : testimonials.length === 0 ? (
                        <div className="col-span-full text-center text-gray-500 py-12">
                            Belum ada testimoni
                        </div>
                    ) : (
                        testimonials.map((testimonial) => (
                            <div
                                key={testimonial.id}
                                className="flex flex-col items-center group hover:-translate-y-2 hover:shadow-2xl hover:bg-white rounded-3xl p-6 transition-all duration-300"
                            >
                                {/* Photo Container with bottom curve */}
                                <div className="relative w-full max-w-100 aspect-square mb-6">
                                    <div className="absolute inset-0 rounded-[2.5rem] overflow-hidden">
                                        <Image
                                            src={testimonial.photo || '/placeholder-image.jpg'}
                                            alt={testimonial.name}
                                            fill
                                            className="object-cover"
                                            sizes="(max-width: 768px) 100vw, 400px"
                                        />
                                        {/* Bottom Curve Overlay */}
                                        <div className="absolute bottom-0 left-0 right-0 h-16 bg-white flex items-center justify-center">
                                            <div className="absolute -top-10 left-0 right-0 h-20 bg-white rounded-[50%_50%_0_0] transform scale-x-[1.2]" />
                                        </div>
                                    </div>
                                    
                                    {/* Role Label (Overlapping the curve) */}
                                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 z-10">
                                        <div className="bg-white px-8 py-2 rounded-full border border-gray-200/50 shadow-sm text-sm font-normal text-gray-800">
                                            {testimonial.role}
                                        </div>
                                    </div>
                                </div>

                                {/* Name & Quote */}
                                <div className="text-center mt-4">
                                    <h3 className="text-2xl md:text-3xl font-semibold text-[#0B6282] mb-3">
                                        {testimonial.name}
                                    </h3>
                                    <p className="text-[#0B6282] text-sm md:text-base italic max-w-xs mx-auto leading-relaxed">
                                        "{testimonial.quote}"
                                    </p>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </section>
    );
};

export default Testimonials;
