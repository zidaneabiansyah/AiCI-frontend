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

    useEffect(() => {
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

    if (loading) {
        return <div className="py-24 text-center">Loading testimonials...</div>;
    }

    if (testimonials.length === 0) {
        return null; // Hide section if no testimonials
    }

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
                    {testimonials.map((testimonial) => (
                        <div
                            key={testimonial.id}
                            className="flex flex-col items-center group hover:-translate-y-2 hover:shadow-2xl hover:bg-white rounded-3xl p-6 transition-all duration-300"
                        >
                            {/* Photo Container with bottom curve */}
                            <div className="relative w-full max-w-[400px] aspect-square mb-6">
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
                                        <div className="absolute top-[-40px] left-0 right-0 h-20 bg-white rounded-[50%_50%_0_0] transform scale-x-[1.2]" />
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
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Testimonials;
