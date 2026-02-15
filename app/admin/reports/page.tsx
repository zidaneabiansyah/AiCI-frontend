"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import toast from "react-hot-toast";

interface ReportSummary {
    period: {
        from: string;
        to: string;
    };
    revenue: {
        total_transactions: number;
        total_revenue: number;
        total_admin_fee: number;
        avg_transaction: number;
    };
    enrollments: {
        total: number;
        confirmed: number;
        pending: number;
        cancelled: number;
    };
    students: {
        new_registrations: number;
    };
}

export default function ReportsPage() {
    const [summary, setSummary] = useState<ReportSummary | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [dateFrom, setDateFrom] = useState(() => {
        const date = new Date();
        date.setMonth(date.getMonth() - 1);
        return date.toISOString().split('T')[0];
    });
    const [dateTo, setDateTo] = useState(() => new Date().toISOString().split('T')[0]);
    
    // Report filters
    const [revenueStatus, setRevenueStatus] = useState("all");
    const [enrollmentStatus, setEnrollmentStatus] = useState("all");
    const [enrollmentLevel, setEnrollmentLevel] = useState("all");
    const [reportFormat, setReportFormat] = useState("xlsx");

    const loadSummary = async () => {
        setIsLoading(true);
        try {
            const params = new URLSearchParams();
            params.append("date_from", dateFrom);
            params.append("date_to", dateTo);
            
            const data = await api.admin.reports.summary(params.toString());
            setSummary(data);
        } catch (err) {
            console.error("Failed to load summary:", err);
            toast.error("Failed to load report summary");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadSummary();
    }, [dateFrom, dateTo]);

    const handleExportRevenue = () => {
        const params = new URLSearchParams();
        params.append("date_from", dateFrom);
        params.append("date_to", dateTo);
        params.append("format", reportFormat);
        if (revenueStatus !== "all") params.append("status", revenueStatus);
        
        const url = api.admin.reports.exportRevenue(params.toString());
        window.open(url, '_blank');
        toast.success(`Revenue report exported as ${reportFormat.toUpperCase()}`);
    };

    const handleExportEnrollment = () => {
        const params = new URLSearchParams();
        params.append("date_from", dateFrom);
        params.append("date_to", dateTo);
        params.append("format", reportFormat);
        if (enrollmentStatus !== "all") params.append("status", enrollmentStatus);
        if (enrollmentLevel !== "all") params.append("level", enrollmentLevel);
        
        const url = api.admin.reports.exportEnrollment(params.toString());
        window.open(url, '_blank');
        toast.success(`Enrollment report exported as ${reportFormat.toUpperCase()}`);
    };

    const handleExportStudent = () => {
        const params = new URLSearchParams();
        params.append("date_from", dateFrom);
        params.append("date_to", dateTo);
        params.append("format", reportFormat);
        
        const url = api.admin.reports.exportStudent(params.toString());
        window.open(url, '_blank');
        toast.success(`Student report exported as ${reportFormat.toUpperCase()}`);
    };

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="bg-white rounded-[3rem] shadow-sm border border-gray-100 p-10">
                <h1 className="text-3xl font-black text-primary mb-2">Reports Generation</h1>
                <p className="text-primary/40 text-xs font-bold uppercase tracking-widest">
                    Generate & Export Business Reports
                </p>
            </div>

            {/* Date Range Filter */}
            <div className="bg-white rounded-[3rem] shadow-sm border border-gray-100 p-8">
                <h2 className="text-xl font-bold text-primary mb-6">Report Period</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                        <label className="text-xs font-bold text-primary/40 uppercase tracking-widest ml-1 mb-2 block">
                            From Date
                        </label>
                        <input
                            type="date"
                            value={dateFrom}
                            onChange={(e) => setDateFrom(e.target.value)}
                            className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary transition-all text-sm font-medium"
                        />
                    </div>
                    <div>
                        <label className="text-xs font-bold text-primary/40 uppercase tracking-widest ml-1 mb-2 block">
                            To Date
                        </label>
                        <input
                            type="date"
                            value={dateTo}
                            onChange={(e) => setDateTo(e.target.value)}
                            className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary transition-all text-sm font-medium"
                        />
                    </div>
                    <div>
                        <label className="text-xs font-bold text-primary/40 uppercase tracking-widest ml-1 mb-2 block">
                            Export Format
                        </label>
                        <select
                            value={reportFormat}
                            onChange={(e) => setReportFormat(e.target.value)}
                            className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary transition-all text-sm font-medium"
                        >
                            <option value="xlsx">Excel (.xlsx)</option>
                            <option value="pdf">PDF (.pdf)</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Summary Cards */}
            {summary && !isLoading && (
                <div className="bg-white rounded-[3rem] shadow-sm border border-gray-100 p-10">
                    <h2 className="text-xl font-bold text-primary mb-6">Report Summary</h2>
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="bg-linear-to-br from-primary to-primary/80 rounded-2xl p-6 text-white">
                            <p className="text-xs font-bold uppercase tracking-widest mb-2 opacity-80">Total Revenue</p>
                            <p className="text-2xl font-black">
                                Rp {(summary.revenue.total_revenue / 1000000).toFixed(1)}M
                            </p>
                            <p className="text-xs opacity-80 mt-2">{summary.revenue.total_transactions} transactions</p>
                        </div>
                        <div className="bg-linear-to-br from-secondary to-secondary/80 rounded-2xl p-6 text-white">
                            <p className="text-xs font-bold uppercase tracking-widest mb-2 opacity-80">Enrollments</p>
                            <p className="text-2xl font-black">{summary.enrollments.total}</p>
                            <p className="text-xs opacity-80 mt-2">{summary.enrollments.confirmed} confirmed</p>
                        </div>
                        <div className="bg-linear-to-br from-green-500 to-green-600 rounded-2xl p-6 text-white">
                            <p className="text-xs font-bold uppercase tracking-widest mb-2 opacity-80">New Students</p>
                            <p className="text-2xl font-black">{summary.students.new_registrations}</p>
                            <p className="text-xs opacity-80 mt-2">registrations</p>
                        </div>
                        <div className="bg-linear-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white">
                            <p className="text-xs font-bold uppercase tracking-widest mb-2 opacity-80">Avg Transaction</p>
                            <p className="text-2xl font-black">
                                Rp {(summary.revenue.avg_transaction / 1000).toFixed(0)}K
                            </p>
                            <p className="text-xs opacity-80 mt-2">per payment</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Revenue Report */}
            <div className="bg-white rounded-[3rem] shadow-sm border border-gray-100 p-10">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h2 className="text-xl font-bold text-primary">Revenue Report</h2>
                        <p className="text-sm text-primary/60 mt-1">Financial transactions and payment details</p>
                    </div>
                    <button
                        onClick={handleExportRevenue}
                        className="bg-primary text-white px-6 py-3 rounded-2xl font-bold hover:bg-primary/90 transition-all flex items-center gap-2"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        Export
                    </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="text-xs font-bold text-primary/40 uppercase tracking-widest ml-1 mb-2 block">
                            Payment Status
                        </label>
                        <select
                            value={revenueStatus}
                            onChange={(e) => setRevenueStatus(e.target.value)}
                            className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-3 focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary transition-all text-sm font-medium"
                        >
                            <option value="all">All Status</option>
                            <option value="paid">Paid</option>
                            <option value="pending">Pending</option>
                            <option value="failed">Failed</option>
                            <option value="expired">Expired</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Enrollment Report */}
            <div className="bg-white rounded-[3rem] shadow-sm border border-gray-100 p-10">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h2 className="text-xl font-bold text-primary">Enrollment Report</h2>
                        <p className="text-sm text-primary/60 mt-1">Student enrollments and class registrations</p>
                    </div>
                    <button
                        onClick={handleExportEnrollment}
                        className="bg-secondary text-white px-6 py-3 rounded-2xl font-bold hover:bg-secondary/90 transition-all flex items-center gap-2"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        Export
                    </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="text-xs font-bold text-primary/40 uppercase tracking-widest ml-1 mb-2 block">
                            Enrollment Status
                        </label>
                        <select
                            value={enrollmentStatus}
                            onChange={(e) => setEnrollmentStatus(e.target.value)}
                            className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-3 focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary transition-all text-sm font-medium"
                        >
                            <option value="all">All Status</option>
                            <option value="confirmed">Confirmed</option>
                            <option value="pending">Pending</option>
                            <option value="cancelled">Cancelled</option>
                        </select>
                    </div>
                    <div>
                        <label className="text-xs font-bold text-primary/40 uppercase tracking-widest ml-1 mb-2 block">
                            Education Level
                        </label>
                        <select
                            value={enrollmentLevel}
                            onChange={(e) => setEnrollmentLevel(e.target.value)}
                            className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-3 focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary transition-all text-sm font-medium"
                        >
                            <option value="all">All Levels</option>
                            <option value="SD">SD</option>
                            <option value="SMP">SMP</option>
                            <option value="SMA">SMA</option>
                            <option value="UMUM">UMUM</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Student Report */}
            <div className="bg-white rounded-[3rem] shadow-sm border border-gray-100 p-10">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h2 className="text-xl font-bold text-primary">Student Report</h2>
                        <p className="text-sm text-primary/60 mt-1">Student registrations and activity summary</p>
                    </div>
                    <button
                        onClick={handleExportStudent}
                        className="bg-green-600 text-white px-6 py-3 rounded-2xl font-bold hover:bg-green-700 transition-all flex items-center gap-2"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        Export
                    </button>
                </div>
                <p className="text-sm text-primary/60">
                    Export complete student list with enrollment and test attempt statistics for the selected period.
                </p>
            </div>
        </div>
    );
}
