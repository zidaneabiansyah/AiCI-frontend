"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import toast from "react-hot-toast";
import { Award, Plus, Search, Filter, Download, XCircle, CheckCircle2, RefreshCw, Trash2 } from "lucide-react";

export default function AdminCertificatesPage() {
    const [certificates, setCertificates] = useState<any[]>([]);
    const [stats, setStats] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [showIssueModal, setShowIssueModal] = useState(false);
    const [showRevokeModal, setShowRevokeModal] = useState(false);
    const [selectedCertificate, setSelectedCertificate] = useState<any>(null);
    const [pagination, setPagination] = useState({
        current_page: 1,
        last_page: 1,
        per_page: 20,
        total: 0,
    });

    const loadCertificates = async (page = 1) => {
        setIsLoading(true);
        try {
            const params = new URLSearchParams();
            params.append('page', page.toString());
            params.append('per_page', '20');
            
            if (statusFilter !== 'all') {
                params.append('status', statusFilter);
            }
            if (searchTerm) {
                params.append('search', searchTerm);
            }

            const data = await api.admin.certificates.list(`?${params.toString()}`);
            setCertificates(data.certificates || []);
            setPagination(data.pagination || pagination);
        } catch (err) {
            console.error("Failed to load certificates:", err);
            toast.error("Gagal memuat data sertifikat");
        } finally {
            setIsLoading(false);
        }
    };

    const loadStats = async () => {
        try {
            const data = await api.admin.certificates.statistics();
            setStats(data);
        } catch (err) {
            console.error("Failed to load stats:", err);
        }
    };

    useEffect(() => {
        loadCertificates();
        loadStats();
    }, [statusFilter]);

    const handleSearch = () => {
        loadCertificates(1);
    };

    const handleRevoke = async (certificate: any) => {
        setSelectedCertificate(certificate);
        setShowRevokeModal(true);
    };

    const confirmRevoke = async (reason: string) => {
        if (!selectedCertificate) return;

        try {
            await api.admin.certificates.revoke(selectedCertificate.id, reason);
            toast.success("Sertifikat berhasil dicabut");
            setShowRevokeModal(false);
            setSelectedCertificate(null);
            loadCertificates(pagination.current_page);
            loadStats();
        } catch (err: any) {
            toast.error(err.message || "Gagal mencabut sertifikat");
        }
    };

    const handleRegenerate = async (certificate: any) => {
        if (!confirm("Regenerate PDF sertifikat ini?")) return;

        try {
            await api.admin.certificates.regenerate(certificate.id);
            toast.success("PDF sertifikat berhasil di-generate ulang");
            loadCertificates(pagination.current_page);
        } catch (err: any) {
            toast.error(err.message || "Gagal regenerate PDF");
        }
    };

    const handleDelete = async (certificate: any) => {
        if (!confirm("Hapus sertifikat ini? Tindakan ini tidak dapat dibatalkan.")) return;

        try {
            await api.admin.certificates.delete(certificate.id);
            toast.success("Sertifikat berhasil dihapus");
            loadCertificates(pagination.current_page);
            loadStats();
        } catch (err: any) {
            toast.error(err.message || "Gagal menghapus sertifikat");
        }
    };

    if (isLoading && certificates.length === 0) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="inline-block w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin mb-4"></div>
                    <p className="text-primary/60 font-medium">Loading certificates...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Header & Stats */}
            <div className="bg-white rounded-[3rem] shadow-sm border border-gray-100 p-10">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-3xl font-black text-primary mb-2">Manajemen Sertifikat</h1>
                        <p className="text-primary/40 text-xs font-bold uppercase tracking-widest">
                            Kelola Sertifikat Siswa
                        </p>
                    </div>
                    <button
                        onClick={() => setShowIssueModal(true)}
                        className="bg-secondary text-white px-6 py-3 rounded-2xl font-bold hover:bg-secondary/90 transition-all flex items-center gap-2"
                    >
                        <Plus className="w-5 h-5" />
                        Terbitkan Sertifikat
                    </button>
                </div>

                {/* Stats */}
                {stats && (
                    <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                        <div className="bg-linear-to-br from-primary to-primary/80 rounded-2xl p-6 text-white">
                            <p className="text-xs font-bold uppercase tracking-widest mb-2 opacity-80">Total</p>
                            <p className="text-3xl font-black">{stats.total_issued}</p>
                        </div>
                        <div className="bg-linear-to-br from-green-500 to-green-600 rounded-2xl p-6 text-white">
                            <p className="text-xs font-bold uppercase tracking-widest mb-2 opacity-80">Aktif</p>
                            <p className="text-3xl font-black">{stats.active}</p>
                        </div>
                        <div className="bg-linear-to-br from-red-500 to-red-600 rounded-2xl p-6 text-white">
                            <p className="text-xs font-bold uppercase tracking-widest mb-2 opacity-80">Dicabut</p>
                            <p className="text-3xl font-black">{stats.revoked}</p>
                        </div>
                        <div className="bg-linear-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white">
                            <p className="text-xs font-bold uppercase tracking-widest mb-2 opacity-80">Bulan Ini</p>
                            <p className="text-3xl font-black">{stats.issued_this_month}</p>
                        </div>
                        <div className="bg-linear-to-br from-purple-500 to-purple-600 rounded-2xl p-6 text-white">
                            <p className="text-xs font-bold uppercase tracking-widest mb-2 opacity-80">Tahun Ini</p>
                            <p className="text-3xl font-black">{stats.issued_this_year}</p>
                        </div>
                    </div>
                )}
            </div>

            {/* Filters */}
            <div className="bg-white rounded-[3rem] shadow-sm border border-gray-100 p-8">
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1 relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-primary/40" />
                        <input
                            type="text"
                            placeholder="Cari nomor sertifikat atau nama siswa..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                            className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary"
                        />
                    </div>
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="px-6 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary font-medium"
                    >
                        <option value="all">Semua Status</option>
                        <option value="active">Aktif</option>
                        <option value="revoked">Dicabut</option>
                    </select>
                    <button
                        onClick={handleSearch}
                        className="px-6 py-3 bg-primary text-white rounded-2xl font-bold hover:bg-primary/90 transition-all"
                    >
                        Cari
                    </button>
                </div>
            </div>

            {/* Certificates Table */}
            <div className="bg-white rounded-[3rem] shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-100">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-bold text-primary/60 uppercase tracking-wider">
                                    No. Sertifikat
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-primary/60 uppercase tracking-wider">
                                    Siswa
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-primary/60 uppercase tracking-wider">
                                    Kelas
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-primary/60 uppercase tracking-wider">
                                    Tanggal
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-primary/60 uppercase tracking-wider">
                                    Status
                                </th>
                                <th className="px-6 py-4 text-right text-xs font-bold text-primary/60 uppercase tracking-wider">
                                    Aksi
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {certificates.map((cert) => (
                                <tr key={cert.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4">
                                        <p className="font-mono text-sm font-bold text-primary">{cert.certificate_number}</p>
                                    </td>
                                    <td className="px-6 py-4">
                                        <p className="font-medium text-primary">{cert.student_name}</p>
                                        <p className="text-xs text-primary/60">{cert.user.email}</p>
                                    </td>
                                    <td className="px-6 py-4">
                                        <p className="font-medium text-primary">{cert.class_name}</p>
                                        <p className="text-xs text-primary/60">{cert.program_name}</p>
                                    </td>
                                    <td className="px-6 py-4">
                                        <p className="text-sm text-primary/80">
                                            {new Date(cert.issue_date).toLocaleDateString('id-ID')}
                                        </p>
                                    </td>
                                    <td className="px-6 py-4">
                                        {cert.status === 'active' ? (
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
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center justify-end gap-2">
                                            {cert.status === 'active' && (
                                                <>
                                                    <button
                                                        onClick={() => handleRegenerate(cert)}
                                                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                        title="Regenerate PDF"
                                                    >
                                                        <RefreshCw className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleRevoke(cert)}
                                                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                        title="Cabut Sertifikat"
                                                    >
                                                        <XCircle className="w-4 h-4" />
                                                    </button>
                                                </>
                                            )}
                                            <button
                                                onClick={() => handleDelete(cert)}
                                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                title="Hapus"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {pagination.last_page > 1 && (
                    <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
                        <p className="text-sm text-primary/60">
                            Menampilkan {((pagination.current_page - 1) * pagination.per_page) + 1} - {Math.min(pagination.current_page * pagination.per_page, pagination.total)} dari {pagination.total} sertifikat
                        </p>
                        <div className="flex gap-2">
                            <button
                                onClick={() => loadCertificates(pagination.current_page - 1)}
                                disabled={pagination.current_page === 1}
                                className="px-4 py-2 border border-gray-200 rounded-lg font-medium text-primary disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                            >
                                Previous
                            </button>
                            <button
                                onClick={() => loadCertificates(pagination.current_page + 1)}
                                disabled={pagination.current_page === pagination.last_page}
                                className="px-4 py-2 border border-gray-200 rounded-lg font-medium text-primary disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Issue Modal */}
            {showIssueModal && (
                <IssueModal
                    onClose={() => setShowIssueModal(false)}
                    onSuccess={() => {
                        loadCertificates(pagination.current_page);
                        loadStats();
                    }}
                />
            )}

            {/* Revoke Modal */}
            {showRevokeModal && selectedCertificate && (
                <RevokeModal
                    certificate={selectedCertificate}
                    onClose={() => {
                        setShowRevokeModal(false);
                        setSelectedCertificate(null);
                    }}
                    onConfirm={confirmRevoke}
                />
            )}
        </div>
    );
}

// Issue Certificate Modal Component
function IssueModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
    const [enrollments, setEnrollments] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedEnrollment, setSelectedEnrollment] = useState<any>(null);
    const [notes, setNotes] = useState("");

    useEffect(() => {
        loadEligibleEnrollments();
    }, []);

    const loadEligibleEnrollments = async () => {
        try {
            const data = await api.admin.certificates.eligibleEnrollments();
            setEnrollments(data.enrollments || []);
        } catch (err) {
            toast.error("Gagal memuat data enrollment");
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedEnrollment) {
            toast.error("Pilih enrollment terlebih dahulu");
            return;
        }

        try {
            await api.admin.certificates.issue({
                enrollment_id: selectedEnrollment.id,
                notes,
            });
            toast.success("Sertifikat berhasil diterbitkan");
            onSuccess();
            onClose();
        } catch (err: any) {
            toast.error(err.message || "Gagal menerbitkan sertifikat");
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-8">
                <h2 className="text-2xl font-bold text-primary mb-6">Terbitkan Sertifikat</h2>

                {isLoading ? (
                    <div className="text-center py-12">
                        <div className="inline-block w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
                    </div>
                ) : enrollments.length === 0 ? (
                    <div className="text-center py-12">
                        <p className="text-primary/60">Tidak ada enrollment yang memenuhi syarat</p>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-bold text-primary mb-2">
                                Pilih Enrollment
                            </label>
                            <select
                                value={selectedEnrollment?.id || ''}
                                onChange={(e) => {
                                    const enrollment = enrollments.find(en => en.id === parseInt(e.target.value));
                                    setSelectedEnrollment(enrollment);
                                }}
                                className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary"
                                required
                            >
                                <option value="">-- Pilih Enrollment --</option>
                                {enrollments.map((enrollment) => (
                                    <option key={enrollment.id} value={enrollment.id}>
                                        {enrollment.enrollment_number} - {enrollment.student_name} - {enrollment.class.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {selectedEnrollment && (
                            <div className="bg-gray-50 rounded-2xl p-4 space-y-2">
                                <p className="text-sm"><span className="font-bold">Siswa:</span> {selectedEnrollment.student_name}</p>
                                <p className="text-sm"><span className="font-bold">Kelas:</span> {selectedEnrollment.class.name}</p>
                                <p className="text-sm"><span className="font-bold">Program:</span> {selectedEnrollment.class.program?.name}</p>
                                <p className="text-sm"><span className="font-bold">Selesai:</span> {new Date(selectedEnrollment.completed_at).toLocaleDateString('id-ID')}</p>
                            </div>
                        )}

                        <div>
                            <label className="block text-sm font-bold text-primary mb-2">
                                Catatan (Opsional)
                            </label>
                            <textarea
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                rows={3}
                                className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary"
                                placeholder="Tambahkan catatan jika diperlukan..."
                            />
                        </div>

                        <div className="flex gap-3">
                            <button
                                type="button"
                                onClick={onClose}
                                className="flex-1 px-6 py-3 border-2 border-gray-200 text-primary rounded-2xl font-bold hover:bg-gray-50 transition-colors"
                            >
                                Batal
                            </button>
                            <button
                                type="submit"
                                className="flex-1 px-6 py-3 bg-secondary text-white rounded-2xl font-bold hover:bg-secondary/90 transition-colors"
                            >
                                Terbitkan
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
}

// Revoke Certificate Modal Component
function RevokeModal({ certificate, onClose, onConfirm }: { certificate: any; onClose: () => void; onConfirm: (reason: string) => void }) {
    const [reason, setReason] = useState("");

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!reason.trim()) {
            toast.error("Alasan pencabutan harus diisi");
            return;
        }
        onConfirm(reason);
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl max-w-lg w-full p-8">
                <h2 className="text-2xl font-bold text-red-600 mb-4">Cabut Sertifikat</h2>
                <p className="text-primary/60 mb-6">
                    Anda akan mencabut sertifikat <span className="font-bold">{certificate.certificate_number}</span> untuk {certificate.student_name}.
                </p>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-bold text-primary mb-2">
                            Alasan Pencabutan *
                        </label>
                        <textarea
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            rows={4}
                            className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
                            placeholder="Jelaskan alasan pencabutan sertifikat..."
                            required
                        />
                    </div>

                    <div className="flex gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-6 py-3 border-2 border-gray-200 text-primary rounded-2xl font-bold hover:bg-gray-50 transition-colors"
                        >
                            Batal
                        </button>
                        <button
                            type="submit"
                            className="flex-1 px-6 py-3 bg-red-600 text-white rounded-2xl font-bold hover:bg-red-700 transition-colors"
                        >
                            Cabut Sertifikat
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
