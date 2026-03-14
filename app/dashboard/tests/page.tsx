"use client";

import { useQuery } from '@tanstack/react-query';
import { placementTestApi } from '@/lib/api';
import Link from 'next/link';
import { FileText, Award, Clock, Download, Loader2, AlertCircle } from 'lucide-react';
import { formatDate, formatDuration } from '@/lib/utils/format';

export default function DashboardTestsPage() {
    const { data, isLoading } = useQuery({
        queryKey: ['my-test-attempts'],
        queryFn: async () => {
            // Get user's test attempts from backend
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/v1/user/test-attempts`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('aici_token')}`,
                    'Accept': 'application/json',
                },
            });
            if (!response.ok) throw new Error('Failed to fetch attempts');
            return response.json();
        },
    });

    const attempts = data?.data || [];

    return (
        <div>
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-[#255d74] mb-2">Riwayat Test</h1>
                <p className="text-[#255d74]/60">Lihat hasil placement test yang pernah Anda ikuti</p>
            </div>

            {isLoading ? (
                <div className="flex justify-center py-20">
                    <Loader2 className="w-12 h-12 animate-spin text-[#255d74]" />
                </div>
            ) : attempts.length === 0 ? (
                <div className="bg-white rounded-2xl p-12 text-center">
                    <FileText className="w-16 h-16 text-[#255d74]/20 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-[#255d74] mb-2">Belum Ada Test</h3>
                    <p className="text-[#255d74]/60 mb-6">Anda belum mengikuti placement test</p>
                    <Link
                        href="/dashboard/tests/available"
                        className="inline-block px-6 py-3 bg-[#255d74] text-white rounded-xl font-bold hover:bg-[#1e4a5f] transition-all"
                    >
                        Ikuti Test Sekarang
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-6">
                    {attempts.map((attempt: any) => (
                        <div
                            key={attempt.id}
                            className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-lg transition-all"
                        >
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex-1">
                                    <h3 className="text-xl font-bold text-[#255d74] mb-2">{attempt.test_title}</h3>
                                    <div className="flex items-center gap-4 text-sm text-[#255d74]/60">
                                        <span className="flex items-center gap-1">
                                            <Clock className="w-4 h-4" />
                                            {formatDate(attempt.completed_at)}
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <FileText className="w-4 h-4" />
                                            {attempt.answered_questions}/{attempt.total_questions} soal
                                        </span>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-3xl font-bold text-[#255d74] mb-1">{attempt.score}%</div>
                                    <span className="inline-block px-3 py-1 bg-[#255d74]/10 text-[#255d74] text-xs font-bold rounded-full">
                                        {attempt.level_result}
                                    </span>
                                </div>
                            </div>

                            <div className="flex gap-3">
                                <Link
                                    href={`/dashboard/tests/result/${attempt.id}`}
                                    className="flex-1 px-4 py-2 bg-[#255d74] text-white rounded-xl text-sm font-bold hover:bg-[#1e4a5f] transition-all text-center"
                                >
                                    Lihat Detail & Rekomendasi
                                </Link>
                                <a
                                    href={placementTestApi.downloadResult(attempt.id)}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="px-4 py-2 border-2 border-gray-200 text-[#255d74] rounded-xl text-sm font-bold hover:bg-gray-50 transition-all flex items-center gap-2"
                                >
                                    <Download className="w-4 h-4" />
                                    PDF
                                </a>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
