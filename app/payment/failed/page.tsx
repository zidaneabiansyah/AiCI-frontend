"use client";

import { Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { XCircle, ArrowRight, RefreshCw, Loader2 } from 'lucide-react';
import Link from 'next/link';

function PaymentFailedContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const paymentId = searchParams.get('payment_id');

    return (
        <>
            <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <XCircle className="w-12 h-12 text-red-600" />
            </div>

            <h1 className="text-3xl font-bold text-[#255d74] mb-4">
                Pembayaran Gagal
            </h1>
            <p className="text-[#255d74]/80 text-lg mb-8">
                Maaf, pembayaran Anda tidak dapat diproses. Silakan coba lagi.
            </p>

            <div className="bg-red-50 border border-red-200 rounded-2xl p-6 mb-8">
                <p className="text-red-800 text-sm">
                    Jika masalah berlanjut, silakan hubungi customer service kami
                    atau coba metode pembayaran lain.
                </p>
            </div>

            <div className="flex flex-col gap-4">
                {paymentId && (
                    <Link
                        href={`/payment/${paymentId}`}
                        className="w-full bg-[#255d74] text-white py-4 rounded-xl font-bold hover:bg-[#1e4a5f] transition-all flex items-center justify-center gap-2"
                    >
                        <RefreshCw className="w-5 h-5" />
                        Coba Lagi
                    </Link>
                )}
                <Link
                    href="/dashboard/enrollments"
                    className="w-full border-2 border-gray-200 text-[#255d74] py-4 rounded-xl font-bold hover:bg-gray-50 transition-all"
                >
                    Lihat Pendaftaran Saya
                </Link>
                <Link
                    href="/kontak"
                    className="text-[#255d74]/60 hover:text-[#255d74] transition-colors"
                >
                    Hubungi Customer Service
                </Link>
            </div>
        </>
    );
}

export default function PaymentFailedPage() {
    return (
        <main className="min-h-screen bg-[#eef2f5]">
            <Navbar />

            <div className="max-w-2xl mx-auto px-6 py-32 text-center">
                <div className="bg-white rounded-[2.5rem] p-12 shadow-xl border border-gray-100">
                    <Suspense fallback={
                        <div className="flex justify-center py-12">
                            <Loader2 className="w-12 h-12 animate-spin text-[#255d74]" />
                        </div>
                    }>
                        <PaymentFailedContent />
                    </Suspense>
                </div>
            </div>

            <Footer />
        </main>
    );
}
