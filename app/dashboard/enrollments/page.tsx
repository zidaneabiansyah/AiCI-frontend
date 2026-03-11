"use client";

import { useQuery } from '@tanstack/react-query';
import { enrollmentsApi } from '@/lib/api';
import Link from 'next/link';
import { BookOpen, Calendar, MapPin, Clock, CreditCard, Loader2 } from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/utils/format';

export default function DashboardEnrollmentsPage() {
    const { data, isLoading } = useQuery({
        queryKey: ['my-enrollments'],
        queryFn: () => enrollmentsApi.list(),
    });

    const rawData: any = data?.data;
    const enrollments: any[] = Array.isArray(rawData)
        ? rawData
        : Array.isArray(rawData?.results)
        ? rawData.results
        : [];

    const statusColors: Record<string, string> = {
        pending: 'bg-yellow-100 text-yellow-600',
        confirmed: 'bg-green-100 text-green-600',
        cancelled: 'bg-red-100 text-red-600',
        completed: 'bg-blue-100 text-blue-600',
    };

    return (
        <div>
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-[#255d74] mb-2">Pendaftaran Saya</h1>
                <p className="text-[#255d74]/60">Kelola pendaftaran kelas Anda</p>
            </div>

            {isLoading ? (
                <div className="flex justify-center py-20">
                    <Loader2 className="w-12 h-12 animate-spin text-[#255d74]" />
                </div>
            ) : enrollments.length === 0 ? (
                <div className="bg-white rounded-2xl p-12 text-center">
                    <BookOpen className="w-16 h-16 text-[#255d74]/20 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-[#255d74] mb-2">Belum Ada Pendaftaran</h3>
                    <p className="text-[#255d74]/60 mb-6">Anda belum mendaftar kelas apapun</p>
                    <Link
                        href="/classes"
                        className="inline-block px-6 py-3 bg-[#255d74] text-white rounded-xl font-bold hover:bg-[#1e4a5f] transition-all"
                    >
                        Jelajahi Kelas
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-6">
                    {enrollments.map((enrollment: any) => (
                        <div
                            key={enrollment.id}
                            className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-lg transition-all"
                        >
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <h3 className="text-xl font-bold text-[#255d74]">{enrollment.class.name}</h3>
                                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${statusColors[enrollment.status]}`}>
                                            {enrollment.status_label}
                                        </span>
                                    </div>
                                    <p className="text-[#255d74]/60 mb-3">{enrollment.class.program_name}</p>

                                    {enrollment.schedule && (
                                        <div className="flex flex-wrap gap-4 text-sm text-[#255d74]/60">
                                            <span className="flex items-center gap-1">
                                                <Calendar className="w-4 h-4" />
                                                {enrollment.schedule.batch_name}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <Clock className="w-4 h-4" />
                                                {enrollment.schedule.time}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <MapPin className="w-4 h-4" />
                                                {enrollment.schedule.location}
                                            </span>
                                        </div>
                                    )}
                                </div>

                                <div className="text-right">
                                    <p className="text-sm text-[#255d74]/60 mb-1">Total</p>
                                    <p className="text-xl font-bold text-[#255d74]">{enrollment.class.price_formatted}</p>
                                </div>
                            </div>

                            {enrollment.payment && (
                                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl mb-4">
                                    <div className="flex items-center gap-3">
                                        <CreditCard className="w-5 h-5 text-[#255d74]/60" />
                                        <div>
                                            <p className="text-sm font-bold text-[#255d74]">Status Pembayaran</p>
                                            <p className="text-xs text-[#255d74]/60">{enrollment.payment.invoice_number}</p>
                                        </div>
                                    </div>
                                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${enrollment.payment.status === 'paid' ? 'bg-green-100 text-green-600' : 'bg-yellow-100 text-yellow-600'
                                        }`}>
                                        {enrollment.payment.status_label}
                                    </span>
                                </div>
                            )}

                            <div className="flex gap-3">
                                <Link
                                    href={`/enrollment/${enrollment.id}`}
                                    className="flex-1 px-4 py-2 bg-[#255d74] text-white rounded-xl text-sm font-bold hover:bg-[#1e4a5f] transition-all text-center"
                                >
                                    Lihat Detail
                                </Link>
                                {enrollment.payment && enrollment.payment.status === 'pending' && (
                                    <Link
                                        href={`/payment/${enrollment.payment.id}`}
                                        className="px-4 py-2 bg-secondary text-white rounded-xl text-sm font-bold hover:bg-[#e63c1e] transition-all flex items-center gap-2"
                                    >
                                        <CreditCard className="w-4 h-4" />
                                        Bayar
                                    </Link>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
