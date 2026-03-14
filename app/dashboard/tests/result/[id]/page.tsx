"use client";

import { useParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { placementTestApi } from '@/lib/api';
import Link from 'next/link';
import { Award, TrendingUp, TrendingDown, BookOpen, ArrowRight, Download, Loader2, AlertCircle, ChevronLeft } from 'lucide-react';

export default function TestResultPage() {
    const params = useParams();
    const router = useRouter();
    const attemptId = params.id as string;

    const { data, isLoading, error } = useQuery({
        queryKey: ['test-result', attemptId],
        queryFn: () => placementTestApi.getResult(attemptId),
        enabled: !!attemptId,
    });

    const result = data?.data;

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center py-40">
                <Loader2 className="w-12 h-12 animate-spin text-[#255d74] mb-4" />
                <p className="text-[#255d74] font-bold">Memuat hasil test...</p>
            </div>
        );
    }

    if (error || !result) {
        return (
            <div className="text-center py-20">
                <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                <h1 className="text-2xl font-bold text-[#255d74] mb-4">Gagal Memuat Hasil</h1>
                <button
                    onClick={() => router.push('/dashboard/tests')}
                    className="bg-[#255d74] text-white px-6 py-2 rounded-xl font-bold"
                >
                    Kembali
                </button>
            </div>
        );
    }

    const { attempt, result: testResult, recommendedClasses } = result;

    return (
        <div className="max-w-5xl mx-auto">
            <button
                onClick={() => router.push('/dashboard/tests')}
                className="flex items-center gap-2 text-[#255d74]/60 font-bold hover:text-[#255d74] transition-all mb-8"
            >
                <ChevronLeft className="w-5 h-5" />
                Kembali ke Riwayat
            </button>

            {/* Score Card */}
            <div className="bg-linear-to-br from-[#255d74] to-[#1e4a5f] rounded-[2.5rem] p-8 md:p-12 text-white mb-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />
                
                <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-6">
                        <Award className="w-8 h-8" />
                        <h1 className="text-2xl font-bold">Hasil Placement Test</h1>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6">
                            <p className="text-white/60 text-sm mb-2">Skor Anda</p>
                            <p className="text-5xl font-bold">{attempt.score}%</p>
                        </div>
                        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6">
                            <p className="text-white/60 text-sm mb-2">Level</p>
                            <p className="text-3xl font-bold capitalize">{attempt.level_result}</p>
                        </div>
                        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6">
                            <p className="text-white/60 text-sm mb-2">Jawaban Benar</p>
                            <p className="text-3xl font-bold">{attempt.correct_answers}/{attempt.total_questions}</p>
                        </div>
                    </div>

                    <div className="mt-6 flex gap-4">
                        <a
                            href={placementTestApi.downloadResult(attemptId)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 px-6 py-3 bg-white text-[#255d74] rounded-xl font-bold hover:bg-white/90 transition-all"
                        >
                            <Download className="w-5 h-5" />
                            Download PDF
                        </a>
                    </div>
                </div>
            </div>

            {/* Performance Summary */}
            {testResult.performance_summary && (
                <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 mb-8">
                    <h2 className="text-xl font-bold text-[#255d74] mb-4">Ringkasan Performa</h2>
                    <p className="text-[#255d74]/80 leading-relaxed">{testResult.performance_summary}</p>
                </div>
            )}

            {/* Strengths & Weaknesses */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                {testResult.strengths && testResult.strengths.length > 0 && (
                    <div className="bg-green-50 rounded-2xl p-6 border border-green-100">
                        <div className="flex items-center gap-2 mb-4">
                            <TrendingUp className="w-5 h-5 text-green-600" />
                            <h3 className="font-bold text-green-900">Kekuatan</h3>
                        </div>
                        <ul className="space-y-2">
                            {testResult.strengths.map((strength: string, index: number) => (
                                <li key={index} className="text-green-800 text-sm flex items-start gap-2">
                                    <span className="text-green-600 mt-1">•</span>
                                    <span>{strength}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {testResult.weaknesses && testResult.weaknesses.length > 0 && (
                    <div className="bg-orange-50 rounded-2xl p-6 border border-orange-100">
                        <div className="flex items-center gap-2 mb-4">
                            <TrendingDown className="w-5 h-5 text-orange-600" />
                            <h3 className="font-bold text-orange-900">Area Pengembangan</h3>
                        </div>
                        <ul className="space-y-2">
                            {testResult.weaknesses.map((weakness: string, index: number) => (
                                <li key={index} className="text-orange-800 text-sm flex items-start gap-2">
                                    <span className="text-orange-600 mt-1">•</span>
                                    <span>{weakness}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>

            {/* Recommended Classes */}
            {recommendedClasses && recommendedClasses.length > 0 && (
                <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
                    <div className="flex items-center gap-3 mb-6">
                        <BookOpen className="w-6 h-6 text-[#255d74]" />
                        <h2 className="text-xl font-bold text-[#255d74]">Rekomendasi Kelas</h2>
                    </div>
                    <p className="text-[#255d74]/60 mb-6">Berdasarkan hasil test Anda, kami merekomendasikan kelas berikut:</p>

                    <div className="space-y-4">
                        {recommendedClasses.map((classItem: any) => (
                            <div
                                key={classItem.id}
                                className="border-2 border-gray-100 rounded-2xl p-6 hover:border-[#255d74]/30 hover:shadow-md transition-all group"
                            >
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex-1">
                                        <h3 className="text-lg font-bold text-[#255d74] mb-2 group-hover:text-secondary transition-colors">
                                            {classItem.name}
                                        </h3>
                                        <p className="text-sm text-[#255d74]/60 mb-2">{classItem.program_name}</p>
                                        <p className="text-[#255d74]/80 text-sm line-clamp-2">{classItem.description}</p>
                                    </div>
                                    <div className="text-right ml-4">
                                        <p className="text-2xl font-bold text-[#255d74]">
                                            Rp {classItem.price?.toLocaleString('id-ID')}
                                        </p>
                                        <p className="text-xs text-[#255d74]/60">{classItem.duration_hours} jam</p>
                                    </div>
                                </div>

                                <Link
                                    href={`/dashboard/classes/${classItem.slug}`}
                                    className="flex items-center justify-center gap-2 w-full bg-[#255d74] text-white py-3 rounded-xl font-bold hover:bg-[#1e4a5f] transition-all group-hover:shadow-lg"
                                >
                                    Lihat Detail Kelas
                                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                </Link>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Next Steps */}
            {testResult.next_steps && (
                <div className="bg-blue-50 rounded-2xl p-8 border border-blue-100 mt-8">
                    <h3 className="font-bold text-blue-900 mb-4">Langkah Selanjutnya</h3>
                    <p className="text-blue-800 leading-relaxed">{testResult.next_steps}</p>
                </div>
            )}
        </div>
    );
}
