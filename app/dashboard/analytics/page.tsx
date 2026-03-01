"use client";

import { useQuery } from '@tanstack/react-query';
import { userAnalyticsApi } from '@/lib/api';
import { formatCurrency } from '@/lib/utils/format';
import {
    TrendingUp, BookOpen, CreditCard, Award, Target,
    BarChart3, CheckCircle2, Clock, Star, Loader2,
    ChevronUp, ChevronDown, Minus
} from 'lucide-react';

// ── Tiny bar chart rendered with plain divs (no extra deps) ──────────────
function MiniBarChart({ data }: { data: { label: string; value: number; max: number }[] }) {
    return (
        <div className="space-y-3">
            {data.map((item, i) => (
                <div key={i}>
                    <div className="flex justify-between text-sm mb-1">
                        <span className="text-[#255d74]/70 font-medium">{item.label}</span>
                        <span className="text-[#255d74] font-bold">{item.value}</span>
                    </div>
                    <div className="h-2 bg-[#255d74]/10 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-linear-to-r from-[#255d74] to-[#3a8fa3] rounded-full transition-all duration-700"
                            style={{ width: item.max > 0 ? `${(item.value / item.max) * 100}%` : '0%' }}
                        />
                    </div>
                </div>
            ))}
        </div>
    );
}

// ── Score dot-chart rendered with plain divs ─────────────────────────────
function ScoreTimeline({ data }: { data: { date: string; score: number; test_title: string; passed: boolean }[] }) {
    if (data.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-40 text-[#255d74]/40">
                <Target className="w-10 h-10 mb-2" />
                <p className="text-sm">Belum ada data skor</p>
            </div>
        );
    }

    const max = Math.max(...data.map(d => d.score), 100);

    return (
        <div className="relative">
            {/* Y axis labels */}
            <div className="flex">
                <div className="flex flex-col justify-between text-xs text-[#255d74]/40 pr-3 py-1 h-48 text-right">
                    <span>100</span>
                    <span>75</span>
                    <span>50</span>
                    <span>25</span>
                    <span>0</span>
                </div>
                {/* Chart area */}
                <div className="flex-1 relative h-48 border-b border-l border-[#255d74]/10">
                    {/* Gridlines */}
                    {[25, 50, 75].map(v => (
                        <div
                            key={v}
                            className="absolute w-full border-t border-dashed border-[#255d74]/10"
                            style={{ bottom: `${v}%` }}
                        />
                    ))}
                    {/* Bars */}
                    <div className="absolute inset-0 flex items-end gap-2 px-2 pb-1">
                        {data.map((d, i) => (
                            <div key={i} className="flex-1 flex flex-col items-center gap-1 group relative">
                                {/* Tooltip */}
                                <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-[#0d2a38] text-white text-xs rounded-lg px-3 py-2 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 pointer-events-none">
                                    <p className="font-bold">{d.score}%</p>
                                    <p className="text-white/70 truncate max-w-[140px]">{d.test_title}</p>
                                    <p className="text-white/50">{d.date}</p>
                                </div>
                                <div
                                    className={`w-full rounded-t-lg transition-all duration-500 ${d.passed ? 'bg-linear-to-t from-[#255d74] to-[#3a8fa3]' : 'bg-linear-to-t from-orange-400 to-orange-300'}`}
                                    style={{ height: `${(d.score / max) * 100}%`, minHeight: '4px' }}
                                />
                                <span className="text-[10px] text-[#255d74]/40 truncate w-full text-center">
                                    {d.date.slice(5)}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
            <div className="flex items-center gap-4 mt-3 text-xs text-[#255d74]/60">
                <span className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded bg-linear-to-r from-[#255d74] to-[#3a8fa3]" />
                    Lulus
                </span>
                <span className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded bg-orange-400" />
                    Belum Lulus
                </span>
            </div>
        </div>
    );
}

// ── Stat card ─────────────────────────────────────────────────────────────
function StatCard({
    label, value, icon: Icon, color, sub
}: {
    label: string; value: string | number; icon: any; color: string; sub?: string;
}) {
    return (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all">
            <div className="flex items-start justify-between mb-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
                    <Icon className="w-6 h-6" />
                </div>
            </div>
            <p className="text-3xl font-bold text-[#255d74] mb-1">{value}</p>
            <p className="text-[#255d74]/60 text-sm font-medium">{label}</p>
            {sub && <p className="text-[#255d74]/40 text-xs mt-1">{sub}</p>}
        </div>
    );
}

// ── Level badge ───────────────────────────────────────────────────────────
const LEVEL_CONFIG: Record<string, { emoji: string; color: string; bg: string }> = {
    'Pemula':    { emoji: '🌱', color: 'text-green-700', bg: 'bg-green-100' },
    'Dasar':     { emoji: '📘', color: 'text-blue-700',  bg: 'bg-blue-100'  },
    'Menengah':  { emoji: '⚡', color: 'text-yellow-700', bg: 'bg-yellow-100' },
    'Lanjutan':  { emoji: '🔥', color: 'text-orange-700', bg: 'bg-orange-100' },
    'Expert':    { emoji: '🏆', color: 'text-purple-700', bg: 'bg-purple-100' },
};

const STATUS_LABELS: Record<string, string> = {
    pending: 'Menunggu', confirmed: 'Dikonfirmasi',
    completed: 'Selesai', cancelled: 'Dibatalkan',
};
const STATUS_COLORS: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-700',
    confirmed: 'bg-green-100 text-green-700',
    completed: 'bg-blue-100 text-blue-700',
    cancelled: 'bg-red-100 text-red-700',
};

// ── Main page ─────────────────────────────────────────────────────────────
export default function UserAnalyticsPage() {
    const { data, isLoading, isError } = useQuery({
        queryKey: ['user-analytics'],
        queryFn: () => userAnalyticsApi.me(),
        staleTime: 1000 * 60 * 5,
    });

    const analytics = data?.data;

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-80">
                <div className="text-center">
                    <Loader2 className="w-12 h-12 animate-spin text-[#255d74] mx-auto mb-4" />
                    <p className="text-[#255d74]/60">Memuat analitik...</p>
                </div>
            </div>
        );
    }

    if (isError || !analytics) {
        return (
            <div className="flex items-center justify-center min-h-80">
                <div className="text-center bg-white rounded-2xl p-10">
                    <BarChart3 className="w-16 h-16 text-[#255d74]/20 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-[#255d74] mb-2">Gagal Memuat Analitik</h3>
                    <p className="text-[#255d74]/60">Gagal mengambil data. Coba refresh halaman.</p>
                </div>
            </div>
        );
    }

    const { enrollment_stats, recent_enrollments, payment_stats, test_stats, score_timeline, current_level, classes_by_level, best_result } = analytics;
    const levelConf = current_level ? (LEVEL_CONFIG[current_level] || { emoji: '🎓', color: 'text-[#255d74]', bg: 'bg-[#255d74]/10' }) : null;

    const completionRate = test_stats.completed_attempts > 0
        ? Math.round((test_stats.passed_count / test_stats.completed_attempts) * 100)
        : 0;

    const enrollBarData = [
        { label: 'Dikonfirmasi', value: enrollment_stats.confirmed, max: enrollment_stats.total || 1 },
        { label: 'Menunggu',     value: enrollment_stats.pending,   max: enrollment_stats.total || 1 },
        { label: 'Selesai',      value: enrollment_stats.completed, max: enrollment_stats.total || 1 },
    ];

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex items-start justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-[#255d74] mb-2">Analitik Saya</h1>
                    <p className="text-[#255d74]/60">Pantau perkembangan belajar dan progres kelas Anda</p>
                </div>
                {levelConf && current_level && (
                    <div className={`flex items-center gap-2 px-4 py-2 rounded-2xl ${levelConf.bg} ${levelConf.color} font-bold text-sm`}>
                        <span className="text-xl">{levelConf.emoji}</span>
                        Level: {current_level}
                    </div>
                )}
            </div>

            {/* Stat cards row */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                    label="Total Pendaftaran"
                    value={enrollment_stats.total}
                    icon={BookOpen}
                    color="bg-blue-100 text-blue-600"
                    sub={`${enrollment_stats.confirmed} dikonfirmasi`}
                />
                <StatCard
                    label="Total Dibayar"
                    value={formatCurrency(payment_stats.total_paid)}
                    icon={CreditCard}
                    color="bg-green-100 text-green-600"
                    sub={`${payment_stats.paid_count} pembayaran sukses`}
                />
                <StatCard
                    label="Rata-rata Skor"
                    value={`${test_stats.average_score}%`}
                    icon={BarChart3}
                    color="bg-purple-100 text-purple-600"
                    sub={`dari ${test_stats.completed_attempts} tes selesai`}
                />
                <StatCard
                    label="Tingkat Kelulusan"
                    value={`${completionRate}%`}
                    icon={Award}
                    color="bg-orange-100 text-orange-600"
                    sub={`${test_stats.passed_count} dari ${test_stats.completed_attempts} tes`}
                />
            </div>

            {/* Charts row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Score Timeline */}
                <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h2 className="text-lg font-bold text-[#255d74]">Riwayat Skor Test</h2>
                            <p className="text-sm text-[#255d74]/60">Perkembangan skor placement test Anda</p>
                        </div>
                        <div className="text-right">
                            <p className="text-2xl font-bold text-[#255d74]">{test_stats.highest_score}%</p>
                            <p className="text-xs text-[#255d74]/50">Skor tertinggi</p>
                        </div>
                    </div>
                    <ScoreTimeline data={score_timeline} />
                </div>

                {/* Enrollment Status Breakdown */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                    <h2 className="text-lg font-bold text-[#255d74] mb-1">Status Pendaftaran</h2>
                    <p className="text-sm text-[#255d74]/60 mb-6">Distribusi status kelas Anda</p>
                    <MiniBarChart data={enrollBarData} />

                    {/* Donut-style visual summary */}
                    <div className="mt-6 grid grid-cols-2 gap-3">
                        {[
                            { label: 'Dikonfirmasi', val: enrollment_stats.confirmed, cl: 'border-l-green-400' },
                            { label: 'Selesai', val: enrollment_stats.completed, cl: 'border-l-blue-400' },
                            { label: 'Menunggu', val: enrollment_stats.pending, cl: 'border-l-yellow-400' },
                            { label: 'Dibatalkan', val: enrollment_stats.cancelled, cl: 'border-l-red-400' },
                        ].map(({ label, val, cl }) => (
                            <div key={label} className={`bg-gray-50 rounded-xl p-3 border-l-4 ${cl}`}>
                                <p className="text-xl font-bold text-[#255d74]">{val}</p>
                                <p className="text-xs text-[#255d74]/60">{label}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Best Result + Recent Enrollments row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Best Test Result */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                    <h2 className="text-lg font-bold text-[#255d74] mb-4">Hasil Test Terbaik</h2>
                    {best_result ? (
                        <div className="space-y-4">
                            {/* Score ring */}
                            <div className="flex items-center gap-6">
                                <div className="relative shrink-0">
                                    <svg className="w-24 h-24 -rotate-90" viewBox="0 0 100 100">
                                        <circle cx="50" cy="50" r="40" fill="none" stroke="#e8f0f3" strokeWidth="12" />
                                        <circle
                                            cx="50" cy="50" r="40" fill="none"
                                            stroke="#255d74" strokeWidth="12"
                                            strokeLinecap="round"
                                            strokeDasharray={`${(best_result.overall_score / 100) * 251.2} 251.2`}
                                        />
                                    </svg>
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <span className="text-lg font-bold text-[#255d74]">{Math.round(best_result.overall_score)}%</span>
                                    </div>
                                </div>
                                <div>
                                    <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-bold mb-2 ${levelConf?.bg || 'bg-[#255d74]/10'} ${levelConf?.color || 'text-[#255d74]'}`}>
                                        {levelConf?.emoji} {best_result.level_achieved}
                                    </div>
                                    <p className="text-xs text-[#255d74]/60">Level yang dicapai</p>
                                </div>
                            </div>

                            {best_result.strengths && (
                                <div className="p-4 bg-green-50 rounded-xl">
                                    <div className="flex items-center gap-2 mb-2">
                                        <CheckCircle2 className="w-4 h-4 text-green-600" />
                                        <span className="text-sm font-bold text-green-700">Kekuatan</span>
                                    </div>
                                    <p className="text-sm text-green-700/80">{best_result.strengths}</p>
                                </div>
                            )}

                            {best_result.weaknesses && (
                                <div className="p-4 bg-orange-50 rounded-xl">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Target className="w-4 h-4 text-orange-600" />
                                        <span className="text-sm font-bold text-orange-700">Perlu Ditingkatkan</span>
                                    </div>
                                    <p className="text-sm text-orange-700/80">{best_result.weaknesses}</p>
                                </div>
                            )}

                            {best_result.recommended_classes && (
                                <div className="p-4 bg-blue-50 rounded-xl">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Star className="w-4 h-4 text-blue-600" />
                                        <span className="text-sm font-bold text-blue-700">Kelas Rekomendasi</span>
                                    </div>
                                    <p className="text-sm text-blue-700/80">{best_result.recommended_classes}</p>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-48 text-[#255d74]/40">
                            <Award className="w-12 h-12 mb-3" />
                            <p className="text-sm text-center">Belum ada hasil test.<br />Ikuti placement test untuk melihat analitik.</p>
                        </div>
                    )}
                </div>

                {/* Recent Enrollments */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                    <h2 className="text-lg font-bold text-[#255d74] mb-4">Pendaftaran Terakhir</h2>
                    {recent_enrollments.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-48 text-[#255d74]/40">
                            <BookOpen className="w-12 h-12 mb-3" />
                            <p className="text-sm text-center">Belum ada pendaftaran kelas.</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {recent_enrollments.map((e: any) => (
                                <div key={e.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl hover:bg-[#255d74]/5 transition-colors">
                                    <div className="w-10 h-10 bg-[#255d74]/10 rounded-xl flex items-center justify-center shrink-0">
                                        <BookOpen className="w-5 h-5 text-[#255d74]" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-bold text-[#255d74] text-sm truncate">{e.class_name}</p>
                                        <p className="text-xs text-[#255d74]/50 truncate">{e.program} · {e.level}</p>
                                    </div>
                                    <span className={`shrink-0 px-2 py-1 rounded-lg text-xs font-bold ${STATUS_COLORS[e.status] || 'bg-gray-100 text-gray-600'}`}>
                                        {STATUS_LABELS[e.status] || e.status}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Test Attempt Summary */}
            <div className="bg-linear-to-br from-[#255d74] to-[#1e4a5f] rounded-2xl p-6 text-white">
                <h2 className="text-lg font-bold mb-6">Ringkasan Test Placement</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                        { label: 'Total Percobaan', value: test_stats.total_attempts, icon: Clock },
                        { label: 'Selesai', value: test_stats.completed_attempts, icon: CheckCircle2 },
                        { label: 'Lulus', value: test_stats.passed_count, icon: Award },
                        { label: 'Skor Rata-rata', value: `${test_stats.average_score}%`, icon: TrendingUp },
                    ].map(({ label, value, icon: Icon }) => (
                        <div key={label} className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                            <Icon className="w-6 h-6 text-white/70 mb-3" />
                            <p className="text-2xl font-bold text-white">{value}</p>
                            <p className="text-sm text-white/60">{label}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
