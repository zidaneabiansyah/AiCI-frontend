"use client";

/**
 * Dashboard Overview Page
 */

import { useQuery } from '@tanstack/react-query';
import { enrollmentsApi, placementTestApi } from '@/lib/api';
import { useAuth } from '@/lib/hooks/use-auth';
import Link from 'next/link';
import { FileText, BookOpen, CreditCard, TrendingUp, ArrowRight, Loader2 } from 'lucide-react';

export default function DashboardPage() {
    const { user } = useAuth();

    const { data: enrollmentsData, isLoading: enrollmentsLoading } = useQuery({
        queryKey: ['my-enrollments'],
        queryFn: () => enrollmentsApi.list(),
    });

    const rawData: any = enrollmentsData?.data;
    const enrollments: any[] = Array.isArray(rawData)
        ? rawData
        : Array.isArray(rawData?.results)
        ? rawData.results
        : [];
    const pendingEnrollments = enrollments.filter((e: any) => e.status === 'pending').length;
    const confirmedEnrollments = enrollments.filter((e: any) => e.status === 'confirmed').length;

    return (
        <div>
            {/* Welcome Header */}
            <div className="mb-12">
                <h1 className="text-3xl font-bold text-[#255d74] mb-2">
                    Selamat Datang, {user?.name}!
                </h1>
                <p className="text-[#255d74]/60">Kelola pembelajaran AI & Robotika Anda di sini</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                            <FileText className="w-6 h-6 text-blue-600" />
                        </div>
                        <TrendingUp className="w-5 h-5 text-green-500" />
                    </div>
                    <p className="text-2xl font-bold text-[#255d74] mb-1">0</p>
                    <p className="text-sm text-[#255d74]/60">Test Selesai</p>
                </div>

                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                            <BookOpen className="w-6 h-6 text-green-600" />
                        </div>
                    </div>
                    <p className="text-2xl font-bold text-[#255d74] mb-1">{confirmedEnrollments}</p>
                    <p className="text-sm text-[#255d74]/60">Kelas Aktif</p>
                </div>

                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
                            <CreditCard className="w-6 h-6 text-yellow-600" />
                        </div>
                    </div>
                    <p className="text-2xl font-bold text-[#255d74] mb-1">{pendingEnrollments}</p>
                    <p className="text-sm text-[#255d74]/60">Pending Payment</p>
                </div>

                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                            <TrendingUp className="w-6 h-6 text-purple-600" />
                        </div>
                    </div>
                    <p className="text-2xl font-bold text-[#255d74] mb-1">-</p>
                    <p className="text-sm text-[#255d74]/60">Level Saat Ini</p>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
                <Link
                    href="/placement-test"
                    className="bg-linear-to-br from-[#255d74] to-[#1e4a5f] rounded-2xl p-8 text-white hover:shadow-xl transition-all group"
                >
                    <FileText className="w-12 h-12 mb-4" />
                    <h3 className="text-xl font-bold mb-2">Ikuti Placement Test</h3>
                    <p className="text-white/80 mb-4">Ketahui level kemampuan Anda dan dapatkan rekomendasi kelas</p>
                    <span className="inline-flex items-center gap-2 text-sm font-bold">
                        Mulai Test
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </span>
                </Link>

                <Link
                    href="/classes"
                    className="bg-linear-to-br from-secondary to-[#e63c1e] rounded-2xl p-8 text-white hover:shadow-xl transition-all group"
                >
                    <BookOpen className="w-12 h-12 mb-4" />
                    <h3 className="text-xl font-bold mb-2">Jelajahi Kelas</h3>
                    <p className="text-white/80 mb-4">Temukan kelas AI & Robotika yang sesuai untuk Anda</p>
                    <span className="inline-flex items-center gap-2 text-sm font-bold">
                        Lihat Kelas
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </span>
                </Link>
            </div>

            {/* Recent Enrollments */}
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-[#255d74]">Pendaftaran Terbaru</h2>
                    <Link href="/dashboard/enrollments" className="text-sm text-[#255d74] hover:underline font-medium">
                        Lihat Semua →
                    </Link>
                </div>

                {enrollmentsLoading ? (
                    <div className="flex justify-center py-12">
                        <Loader2 className="w-8 h-8 animate-spin text-[#255d74]" />
                    </div>
                ) : enrollments.length === 0 ? (
                    <div className="text-center py-12 text-[#255d74]/60">
                        <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-40" />
                        <p>Belum ada pendaftaran</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {enrollments.slice(0, 3).map((enrollment: any) => (
                            <Link
                                key={enrollment.id}
                                href={`/enrollment/${enrollment.id}`}
                                className="flex items-center justify-between p-4 border border-gray-100 rounded-xl hover:border-[#255d74]/30 hover:shadow-md transition-all group"
                            >
                                <div className="flex-1">
                                    <p className="font-bold text-[#255d74] group-hover:text-secondary transition-colors">
                                        {enrollment.class.name}
                                    </p>
                                    <p className="text-sm text-[#255d74]/60">{enrollment.class.program_name}</p>
                                </div>
                                <div className="text-right">
                                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${enrollment.status === 'confirmed' ? 'bg-green-100 text-green-600' :
                                            enrollment.status === 'pending' ? 'bg-yellow-100 text-yellow-600' :
                                                'bg-gray-100 text-gray-600'
                                        }`}>
                                        {enrollment.status_label}
                                    </span>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
