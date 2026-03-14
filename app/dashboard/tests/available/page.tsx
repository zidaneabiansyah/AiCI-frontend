"use client";

import { useQuery } from '@tanstack/react-query';
import { placementTestApi } from '@/lib/api';
import Link from 'next/link';
import { Clock, FileText, Award, ArrowRight, Loader2, PlayCircle } from 'lucide-react';
import type { PlacementTest } from '@/lib/types/placement-test';

export default function DashboardAvailableTestsPage() {
    const { data, isLoading, error } = useQuery({
        queryKey: ['placement-tests'],
        queryFn: () => placementTestApi.list(),
    });

    const tests = data?.data || [];

    const educationLevelLabels: Record<string, string> = {
        sd_mi: 'SD/MI',
        smp_mts: 'SMP/MTs',
        sma_ma: 'SMA/MA',
        umum: 'Umum',
    };

    return (
        <div>
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-[#255d74] mb-2">Placement Test</h1>
                <p className="text-[#255d74]/60">Pilih test yang sesuai untuk mengetahui level kemampuan Anda</p>
            </div>

            {isLoading ? (
                <div className="flex justify-center py-20">
                    <Loader2 className="w-12 h-12 animate-spin text-[#255d74]" />
                </div>
            ) : tests.length === 0 ? (
                <div className="bg-white rounded-2xl p-12 text-center border border-dashed border-gray-200">
                    <p className="text-[#255d74]/40">Belum ada placement test tersedia.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {tests.map((test: PlacementTest) => (
                        <div
                            key={test.id}
                            className="bg-white rounded-[2rem] p-8 shadow-sm border border-gray-100 hover:shadow-xl transition-all group flex flex-col"
                        >
                            <div className="mb-6">
                                <span className="inline-block px-3 py-1 bg-secondary/10 text-secondary text-[10px] font-bold rounded-full uppercase tracking-wider mb-3">
                                    {educationLevelLabels[test.education_level] || test.education_level}
                                </span>
                                <h3 className="text-2xl font-bold text-[#255d74] mb-2 group-hover:text-secondary transition-colors">
                                    {test.title}
                                </h3>
                                <p className="text-[#255d74]/60 leading-relaxed text-sm">
                                    {test.description}
                                </p>
                            </div>

                            <div className="grid grid-cols-3 gap-4 mb-8 mt-auto">
                                <div className="flex flex-col p-3 bg-gray-50 rounded-xl">
                                    <Clock className="w-4 h-4 text-[#255d74]/40 mb-1" />
                                    <span className="text-[10px] font-bold text-[#255d74]/40 uppercase tracking-wider">Waktu</span>
                                    <span className="text-sm font-bold text-[#255d74]">{test.duration_minutes}m</span>
                                </div>
                                <div className="flex flex-col p-3 bg-gray-50 rounded-xl">
                                    <FileText className="w-4 h-4 text-[#255d74]/40 mb-1" />
                                    <span className="text-[10px] font-bold text-[#255d74]/40 uppercase tracking-wider">Soal</span>
                                    <span className="text-sm font-bold text-[#255d74]">{test.total_questions}</span>
                                </div>
                                <div className="flex flex-col p-3 bg-gray-50 rounded-xl">
                                    <Award className="w-4 h-4 text-[#255d74]/40 mb-1" />
                                    <span className="text-[10px] font-bold text-[#255d74]/40 uppercase tracking-wider">Target</span>
                                    <span className="text-sm font-bold text-[#255d74]">{test.passing_score}%</span>
                                </div>
                            </div>

                            <Link
                                href={`/dashboard/tests/available/${test.slug}`}
                                className="flex items-center justify-center gap-2 w-full bg-[#255d74] text-white py-4 rounded-xl font-bold hover:bg-[#1e4a5f] transition-all group-hover:shadow-lg shadow-[#255d74]/10"
                            >
                                <PlayCircle className="w-5 h-5" />
                                Mulai Test
                            </Link>
                        </div>
                    ))}
                </div>
            )}

            {/* Info Section */}
            <div className="mt-12 p-8 bg-linear-to-br from-[#255d74] to-[#1e4a5f] rounded-[2.5rem] text-white shadow-xl">
                <h3 className="text-xl font-bold mb-4">Mengapa Mengikuti Placement Test?</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
                            <Award className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="font-bold mb-1">Kurikulum Tepat Sasaran</p>
                            <p className="text-white/60 text-sm">Pastikan materi yang Anda pelajari sesuai dengan tingkat pemahaman Anda saat ini.</p>
                        </div>
                    </div>
                    <div className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
                            <TrendingUp className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <p className="font-bold mb-1">Dapatkan Rekomendasi</p>
                            <p className="text-white/60 text-sm">Sistem akan menyarankan kelas yang paling cocok untuk mempercepat perkembangan Anda.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

// Small helper for internal reuse
function TrendingUp(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
            <polyline points="16 7 22 7 22 13" />
        </svg>
    )
}
