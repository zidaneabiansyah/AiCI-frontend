"use client";

import { useQuery } from '@tanstack/react-query';
import { certificatesApi } from '@/lib/api';
import { Award, Download, Calendar, CheckCircle2, XCircle, Loader2, FileText } from 'lucide-react';
import Link from 'next/link';

export default function CertificatesPage() {
    const { data, isLoading, isError } = useQuery({
        queryKey: ['my-certificates'],
        queryFn: () => certificatesApi.list(),
    });

    const certificates = data?.certificates || [];

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-100">
                <div className="text-center">
                    <Loader2 className="w-12 h-12 animate-spin text-[#255d74] mx-auto mb-4" />
                    <p className="text-[#255d74]/60">Memuat sertifikat...</p>
                </div>
            </div>
        );
    }

    if (isError) {
        return (
            <div className="text-center py-12">
                <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                <p className="text-red-600 font-medium">Gagal memuat sertifikat</p>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
                <div className="flex items-center gap-4 mb-4">
                    <div className="w-14 h-14 bg-[#255d74]/10 rounded-xl flex items-center justify-center">
                        <Award className="w-7 h-7 text-[#255d74]" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-[#255d74]">Sertifikat Saya</h1>
                        <p className="text-[#255d74]/60 text-sm">Lihat dan unduh sertifikat yang telah Anda peroleh</p>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                    <div className="bg-[#255d74]/5 rounded-xl p-4">
                        <p className="text-sm text-[#255d74]/60 mb-1">Total Sertifikat</p>
                        <p className="text-2xl font-bold text-[#255d74]">{certificates.length}</p>
                    </div>
                    <div className="bg-green-50 rounded-xl p-4">
                        <p className="text-sm text-green-700/60 mb-1">Aktif</p>
                        <p className="text-2xl font-bold text-green-700">
                            {certificates.filter((c: any) => c.status === 'active').length}
                        </p>
                    </div>
                    <div className="bg-red-50 rounded-xl p-4">
                        <p className="text-sm text-red-700/60 mb-1">Dicabut</p>
                        <p className="text-2xl font-bold text-red-700">
                            {certificates.filter((c: any) => c.status === 'revoked').length}
                        </p>
                    </div>
                </div>
            </div>

            {/* Certificates List */}
            {certificates.length === 0 ? (
                <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-gray-100">
                    <FileText className="w-16 h-16 text-[#255d74]/20 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-[#255d74] mb-2">Belum Ada Sertifikat</h3>
                    <p className="text-[#255d74]/60 mb-6">
                        Selesaikan kelas untuk mendapatkan sertifikat
                    </p>
                    <Link
                        href="/classes"
                        className="inline-block bg-[#255d74] text-white px-6 py-3 rounded-xl font-medium hover:bg-[#1e4a5f] transition-colors"
                    >
                        Jelajahi Kelas
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {certificates.map((certificate: any) => (
                        <div
                            key={certificate.id}
                            className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all"
                        >
                            {/* Certificate Header */}
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 bg-linear-to-br from-[#255d74] to-[#1e4a5f] rounded-xl flex items-center justify-center">
                                        <Award className="w-6 h-6 text-white" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-[#255d74]/40 font-bold uppercase tracking-wider">
                                            Sertifikat
                                        </p>
                                        <p className="text-sm font-mono text-[#255d74] font-bold">
                                            {certificate.certificate_number}
                                        </p>
                                    </div>
                                </div>
                                {certificate.status === 'active' ? (
                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold">
                                        <CheckCircle2 className="w-3.5 h-3.5" />
                                        Aktif
                                    </span>
                                ) : (
                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-bold">
                                        <XCircle className="w-3.5 h-3.5" />
                                        Dicabut
                                    </span>
                                )}
                            </div>

                            {/* Certificate Content */}
                            <div className="space-y-3 mb-4">
                                <div>
                                    <p className="text-xs text-[#255d74]/40 mb-1">Program</p>
                                    <p className="text-sm font-bold text-[#255d74]">{certificate.program_name}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-[#255d74]/40 mb-1">Kelas</p>
                                    <p className="text-sm font-medium text-[#255d74]">{certificate.class_name}</p>
                                </div>
                                <div className="flex items-center gap-4 text-xs text-[#255d74]/60">
                                    <div className="flex items-center gap-1.5">
                                        <Calendar className="w-3.5 h-3.5" />
                                        <span>Selesai: {new Date(certificate.completion_date).toLocaleDateString('id-ID')}</span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <Calendar className="w-3.5 h-3.5" />
                                        <span>Diterbitkan: {new Date(certificate.issue_date).toLocaleDateString('id-ID')}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Revocation Info */}
                            {certificate.status === 'revoked' && certificate.revocation_reason && (
                                <div className="bg-red-50 border border-red-100 rounded-lg p-3 mb-4">
                                    <p className="text-xs font-bold text-red-700 mb-1">Alasan Pencabutan:</p>
                                    <p className="text-xs text-red-600">{certificate.revocation_reason}</p>
                                </div>
                            )}

                            {/* Actions */}
                            {certificate.status === 'active' && (
                                <div className="flex gap-3">
                                    <a
                                        href={certificatesApi.download(certificate.id)}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex-1 flex items-center justify-center gap-2 bg-[#255d74] text-white px-4 py-2.5 rounded-xl font-medium hover:bg-[#1e4a5f] transition-colors text-sm"
                                    >
                                        <Download className="w-4 h-4" />
                                        Unduh PDF
                                    </a>
                                    <button
                                        onClick={() => {
                                            if (certificate.file_url) {
                                                window.open(certificate.file_url, '_blank');
                                            }
                                        }}
                                        className="px-4 py-2.5 border-2 border-[#255d74] text-[#255d74] rounded-xl font-medium hover:bg-[#255d74]/5 transition-colors text-sm"
                                    >
                                        Lihat
                                    </button>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
