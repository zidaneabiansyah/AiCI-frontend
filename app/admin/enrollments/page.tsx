"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Enrollment, EnrollmentStatus } from "@/lib/types/enrollment";
import toast from "react-hot-toast";
import Link from "next/link";

export default function AdminEnrollmentsPage() {
    const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedEnrollment, setSelectedEnrollment] = useState<Enrollment | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isActionLoading, setIsActionLoading] = useState(false);
    
    // Filters
    const [statusFilter, setStatusFilter] = useState<string>("all");
    const [searchQuery, setSearchQuery] = useState("");
    const [dateFrom, setDateFrom] = useState("");
    const [dateTo, setDateTo] = useState("");

    const loadEnrollments = async () => {
        setIsLoading(true);
        try {
            const params = new URLSearchParams();
            if (statusFilter !== "all") params.append("status", statusFilter);
            if (searchQuery) params.append("search", searchQuery);
            if (dateFrom) params.append("date_from", dateFrom);
            if (dateTo) params.append("date_to", dateTo);
            
            const data = await api.admin.enrollments.list(params.toString());
            setEnrollments(data.results);
        } catch (err) {
            console.error("Failed to load enrollments:", err);
            toast.error("Failed to load enrollments");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadEnrollments();
    }, [statusFilter, searchQuery, dateFrom, dateTo]);

    const openModal = (enrollment: Enrollment) => {
        setSelectedEnrollment(enrollment);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setSelectedEnrollment(null);
        setIsModalOpen(false);
    };

    const handleApprove = async (id: string) => {
        if (!confirm("Approve this enrollment?")) return;
        
        setIsActionLoading(true);
        try {
            await api.admin.enrollments.approve(id);
            toast.success("Enrollment approved");
            loadEnrollments();
            closeModal();
        } catch (err: any) {
            toast.error(err.message || "Failed to approve enrollment");
        } finally {
            setIsActionLoading(false);
        }
    };

    const handleCancel = async (id: string) => {
        const reason = prompt("Enter cancellation reason:");
        if (!reason) return;
        
        setIsActionLoading(true);
        try {
            await api.admin.enrollments.cancel(id, reason);
            toast.success("Enrollment cancelled");
            loadEnrollments();
            closeModal();
        } catch (err: any) {
            toast.error(err.message || "Failed to cancel enrollment");
        } finally {
            setIsActionLoading(false);
        }
    };

    const handleExport = () => {
        const params = new URLSearchParams();
        if (statusFilter !== "all") params.append("status", statusFilter);
        if (searchQuery) params.append("search", searchQuery);
        if (dateFrom) params.append("date_from", dateFrom);
        if (dateTo) params.append("date_to", dateTo);
        
        window.open(api.admin.enrollments.export(params.toString()), '_blank');
    };

    const getStatusColor = (status: EnrollmentStatus) => {
        switch (status) {
            case 'confirmed': return 'bg-green-100 text-green-600';
            case 'pending': return 'bg-yellow-100 text-yellow-600';
            case 'cancelled': return 'bg-red-100 text-red-600';
            case 'completed': return 'bg-blue-100 text-blue-600';
            default: return 'bg-gray-100 text-gray-600';
        }
    };

    const stats = {
        total: enrollments.length,
        pending: enrollments.filter(e => e.status === 'pending').length,
        confirmed: enrollments.filter(e => e.status === 'confirmed').length,
        cancelled: enrollments.filter(e => e.status === 'cancelled').length,
    };

    return (
        <div className="space-y-8">
            {/* Header with Stats */}
            <div className="bg-white rounded-[3rem] shadow-sm border border-gray-100 p-10">
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-8">
                    <div>
                        <h3 className="text-2xl font-bold text-primary mb-2">Enrollments Management</h3>
                        <p className="text-primary/40 text-xs font-bold uppercase tracking-widest">
                            {stats.total} total enrollments
                        </p>
                    </div>
                    <button
                        onClick={handleExport}
                        className="bg-secondary text-white font-bold px-6 py-3 rounded-2xl shadow-lg shadow-secondary/20 hover:bg-primary transition-all flex items-center gap-2"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        Export CSV
                    </button>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-gray-50 rounded-2xl p-6">
                        <p className="text-xs font-bold text-primary/40 uppercase tracking-widest mb-2">Total</p>
                        <p className="text-3xl font-black text-primary">{stats.total}</p>
                    </div>
                    <div className="bg-yellow-50 rounded-2xl p-6">
                        <p className="text-xs font-bold text-yellow-600/60 uppercase tracking-widest mb-2">Pending</p>
                        <p className="text-3xl font-black text-yellow-600">{stats.pending}</p>
                    </div>
                    <div className="bg-green-50 rounded-2xl p-6">
                        <p className="text-xs font-bold text-green-600/60 uppercase tracking-widest mb-2">Confirmed</p>
                        <p className="text-3xl font-black text-green-600">{stats.confirmed}</p>
                    </div>
                    <div className="bg-red-50 rounded-2xl p-6">
                        <p className="text-xs font-bold text-red-600/60 uppercase tracking-widest mb-2">Cancelled</p>
                        <p className="text-3xl font-black text-red-600">{stats.cancelled}</p>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-[3rem] shadow-sm border border-gray-100 p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {/* Search */}
                    <div className="lg:col-span-2">
                        <label className="text-xs font-bold text-primary/40 uppercase tracking-widest ml-1 mb-2 block">
                            Search
                        </label>
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Enrollment number, student name, email..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full bg-gray-50 border border-gray-100 rounded-2xl pl-12 pr-6 py-4 focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary transition-all text-sm font-medium"
                            />
                            <svg className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-primary/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>
                    </div>

                    {/* Status Filter */}
                    <div>
                        <label className="text-xs font-bold text-primary/40 uppercase tracking-widest ml-1 mb-2 block">
                            Status
                        </label>
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary transition-all text-sm font-medium"
                        >
                            <option value="all">All Status</option>
                            <option value="pending">Pending</option>
                            <option value="confirmed">Confirmed</option>
                            <option value="cancelled">Cancelled</option>
                            <option value="completed">Completed</option>
                        </select>
                    </div>

                    {/* Date Range */}
                    <div>
                        <label className="text-xs font-bold text-primary/40 uppercase tracking-widest ml-1 mb-2 block">
                            Date Range
                        </label>
                        <div className="flex gap-2">
                            <input
                                type="date"
                                value={dateFrom}
                                onChange={(e) => setDateFrom(e.target.value)}
                                className="flex-1 bg-gray-50 border border-gray-100 rounded-2xl px-4 py-4 focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary transition-all text-xs font-medium"
                            />
                            <input
                                type="date"
                                value={dateTo}
                                onChange={(e) => setDateTo(e.target.value)}
                                className="flex-1 bg-gray-50 border border-gray-100 rounded-2xl px-4 py-4 focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary transition-all text-xs font-medium"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Table */}
            {isLoading ? (
                <div className="flex justify-center py-20">
                    <div className="w-12 h-12 border-4 border-primary/10 border-t-primary rounded-full animate-spin" />
                </div>
            ) : enrollments.length === 0 ? (
                <div className="bg-white rounded-[3rem] p-20 text-center">
                    <p className="text-4xl mb-4">📋</p>
                    <h4 className="text-xl font-bold text-primary mb-2">No enrollments found</h4>
                    <p className="text-primary/60">Try adjusting your filters</p>
                </div>
            ) : (
                <div className="bg-white rounded-[3rem] shadow-sm border border-gray-100 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50/50 text-[10px] font-bold text-primary/30 uppercase tracking-[0.2em]">
                                <tr>
                                    <th className="px-10 py-6">Enrollment</th>
                                    <th className="px-10 py-6">Student</th>
                                    <th className="px-10 py-6">Class</th>
                                    <th className="px-10 py-6">Status</th>
                                    <th className="px-10 py-6">Payment</th>
                                    <th className="px-10 py-6">Date</th>
                                    <th className="px-10 py-6 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {enrollments.map((enrollment) => (
                                    <tr key={enrollment.id} className="hover:bg-gray-50/50 transition-colors group">
                                        <td className="px-10 py-6">
                                            <span className="font-bold text-primary text-sm">{enrollment.enrollment_number}</span>
                                        </td>
                                        <td className="px-10 py-6">
                                            <div className="flex flex-col">
                                                <span className="font-bold text-primary">{enrollment.student_name}</span>
                                                <span className="text-xs text-primary/40">{enrollment.student_email}</span>
                                            </div>
                                        </td>
                                        <td className="px-10 py-6">
                                            <div className="flex flex-col">
                                                <span className="font-bold text-primary">{enrollment.class.name}</span>
                                                <span className="text-xs text-primary/40">{enrollment.class.level}</span>
                                            </div>
                                        </td>
                                        <td className="px-10 py-6">
                                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(enrollment.status)}`}>
                                                {enrollment.status_label}
                                            </span>
                                        </td>
                                        <td className="px-10 py-6">
                                            {enrollment.payment ? (
                                                <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                                                    enrollment.payment.status === 'paid' ? 'bg-green-100 text-green-600' : 'bg-yellow-100 text-yellow-600'
                                                }`}>
                                                    {enrollment.payment.status_label}
                                                </span>
                                            ) : (
                                                <span className="text-xs text-primary/40">No payment</span>
                                            )}
                                        </td>
                                        <td className="px-10 py-6 text-sm text-primary/40 font-bold">
                                            {enrollment.enrolled_at_formatted}
                                        </td>
                                        <td className="px-10 py-6 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => openModal(enrollment)}
                                                    className="w-10 h-10 bg-gray-50 text-primary/40 rounded-xl flex items-center justify-center hover:bg-primary hover:text-white transition-all shadow-sm"
                                                    title="View Details"
                                                >
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                    </svg>
                                                </button>
                                                {enrollment.status === 'pending' && (
                                                    <button
                                                        onClick={() => handleApprove(enrollment.id)}
                                                        className="w-10 h-10 bg-green-50 text-green-500 rounded-xl flex items-center justify-center hover:bg-green-500 hover:text-white transition-all shadow-sm"
                                                        title="Approve"
                                                    >
                                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                        </svg>
                                                    </button>
                                                )}
                                                {(enrollment.status === 'pending' || enrollment.status === 'confirmed') && (
                                                    <button
                                                        onClick={() => handleCancel(enrollment.id)}
                                                        className="w-10 h-10 bg-red-50 text-red-500 rounded-xl flex items-center justify-center hover:bg-red-500 hover:text-white transition-all shadow-sm"
                                                        title="Cancel"
                                                    >
                                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                        </svg>
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Detail Modal */}
            {isModalOpen && selectedEnrollment && (
                <div className="fixed inset-0 z-50 overflow-y-auto">
                    <div className="min-h-screen flex items-center justify-center p-4">
                        <div className="fixed inset-0 bg-primary/20 backdrop-blur-sm" onClick={closeModal} />

                        <div className="relative bg-white w-full max-w-4xl rounded-[3rem] shadow-2xl p-10 md:p-12 animate-in fade-in zoom-in duration-300 max-h-[90vh] overflow-y-auto">
                            <div className="flex justify-between items-center mb-10">
                                <h3 className="text-2xl font-bold text-primary">Enrollment Details</h3>
                                <button
                                    onClick={closeModal}
                                    className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-primary/20 hover:text-red-500 hover:bg-red-50 transition-all"
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>

                            <div className="space-y-8">
                                {/* Basic Info */}
                                <div className="grid grid-cols-2 gap-6">
                                    <div>
                                        <p className="text-xs font-bold text-primary/40 uppercase tracking-widest mb-2">Enrollment Number</p>
                                        <p className="text-lg font-bold text-primary">{selectedEnrollment.enrollment_number}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-primary/40 uppercase tracking-widest mb-2">Status</p>
                                        <span className={`inline-block px-4 py-2 rounded-full text-sm font-bold ${getStatusColor(selectedEnrollment.status)}`}>
                                            {selectedEnrollment.status_label}
                                        </span>
                                    </div>
                                </div>

                                {/* Student Info */}
                                <div className="bg-gray-50 rounded-2xl p-6">
                                    <h4 className="text-lg font-bold text-primary mb-4">Student Information</h4>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <p className="text-xs font-bold text-primary/40 uppercase tracking-widest mb-1">Name</p>
                                            <p className="font-medium text-primary">{selectedEnrollment.student_name}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold text-primary/40 uppercase tracking-widest mb-1">Email</p>
                                            <p className="font-medium text-primary">{selectedEnrollment.student_email}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold text-primary/40 uppercase tracking-widest mb-1">Phone</p>
                                            <p className="font-medium text-primary">{selectedEnrollment.student_phone}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold text-primary/40 uppercase tracking-widest mb-1">Age</p>
                                            <p className="font-medium text-primary">{selectedEnrollment.student_age} years</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Parent Info */}
                                {selectedEnrollment.parent_name && (
                                    <div className="bg-gray-50 rounded-2xl p-6">
                                        <h4 className="text-lg font-bold text-primary mb-4">Parent Information</h4>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <p className="text-xs font-bold text-primary/40 uppercase tracking-widest mb-1">Name</p>
                                                <p className="font-medium text-primary">{selectedEnrollment.parent_name}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs font-bold text-primary/40 uppercase tracking-widest mb-1">Phone</p>
                                                <p className="font-medium text-primary">{selectedEnrollment.parent_phone}</p>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Class Info */}
                                <div className="bg-gray-50 rounded-2xl p-6">
                                    <h4 className="text-lg font-bold text-primary mb-4">Class Information</h4>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <p className="text-xs font-bold text-primary/40 uppercase tracking-widest mb-1">Class Name</p>
                                            <p className="font-medium text-primary">{selectedEnrollment.class.name}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold text-primary/40 uppercase tracking-widest mb-1">Level</p>
                                            <p className="font-medium text-primary">{selectedEnrollment.class.level}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold text-primary/40 uppercase tracking-widest mb-1">Price</p>
                                            <p className="font-medium text-primary">{selectedEnrollment.class.price_formatted}</p>
                                        </div>
                                        {selectedEnrollment.schedule && (
                                            <div>
                                                <p className="text-xs font-bold text-primary/40 uppercase tracking-widest mb-1">Schedule</p>
                                                <p className="font-medium text-primary">{selectedEnrollment.schedule.batch_name}</p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Payment Info */}
                                {selectedEnrollment.payment && (
                                    <div className="bg-gray-50 rounded-2xl p-6">
                                        <h4 className="text-lg font-bold text-primary mb-4">Payment Information</h4>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <p className="text-xs font-bold text-primary/40 uppercase tracking-widest mb-1">Invoice Number</p>
                                                <p className="font-medium text-primary">{selectedEnrollment.payment.invoice_number}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs font-bold text-primary/40 uppercase tracking-widest mb-1">Status</p>
                                                <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${
                                                    selectedEnrollment.payment.status === 'paid' ? 'bg-green-100 text-green-600' : 'bg-yellow-100 text-yellow-600'
                                                }`}>
                                                    {selectedEnrollment.payment.status_label}
                                                </span>
                                            </div>
                                            <div>
                                                <p className="text-xs font-bold text-primary/40 uppercase tracking-widest mb-1">Total Amount</p>
                                                <p className="font-medium text-primary">{selectedEnrollment.payment.total_amount_formatted}</p>
                                            </div>
                                            {selectedEnrollment.payment.paid_at && (
                                                <div>
                                                    <p className="text-xs font-bold text-primary/40 uppercase tracking-widest mb-1">Paid At</p>
                                                    <p className="font-medium text-primary">{selectedEnrollment.payment.paid_at_formatted}</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* Actions */}
                                {(selectedEnrollment.status === 'pending' || selectedEnrollment.status === 'confirmed') && (
                                    <div className="flex gap-4 pt-4">
                                        {selectedEnrollment.status === 'pending' && (
                                            <button
                                                onClick={() => handleApprove(selectedEnrollment.id)}
                                                disabled={isActionLoading}
                                                className="flex-1 bg-green-500 text-white font-bold py-5 rounded-2xl shadow-xl shadow-green-500/20 hover:bg-green-600 transition-all uppercase tracking-widest text-xs disabled:opacity-50"
                                            >
                                                Approve Enrollment
                                            </button>
                                        )}
                                        <button
                                            onClick={() => handleCancel(selectedEnrollment.id)}
                                            disabled={isActionLoading}
                                            className="flex-1 bg-red-500 text-white font-bold py-5 rounded-2xl shadow-xl shadow-red-500/20 hover:bg-red-600 transition-all uppercase tracking-widest text-xs disabled:opacity-50"
                                        >
                                            Cancel Enrollment
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
