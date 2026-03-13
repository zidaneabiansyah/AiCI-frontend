"use client";

import { useEffect, useMemo, useState } from "react";
import { api, TutorSession, TutorDashboardResponse } from "@/lib/api";
import { CalendarDays, Users, Layers, AlertCircle } from "lucide-react";

type TutorDashboardData = NonNullable<TutorDashboardResponse["data"]>;

const fallbackStats = {
    total_students: 0,
};

function getGreeting() {
    const hour = new Date().getHours();
    if (hour < 11) return "Selamat pagi";
    if (hour < 15) return "Selamat siang";
    if (hour < 18) return "Selamat sore";
    return "Selamat malam";
}

function parseSessionStart(session: TutorSession): number {
    if (!session.date) return Number.POSITIVE_INFINITY;
    const timePart = session.time_range?.split("-")[0]?.trim() ?? "00.00";
    const normalized = timePart.replace(".", ":");
    const [hour, minute] = normalized.split(":").map((value) => Number(value));
    const safeHour = Number.isFinite(hour) ? hour : 0;
    const safeMinute = Number.isFinite(minute) ? minute : 0;
    const dateString = `${session.date}T${String(safeHour).padStart(2, "0")}:${String(safeMinute).padStart(2, "0")}:00`;
    const parsed = new Date(dateString).getTime();
    return Number.isNaN(parsed) ? Number.POSITIVE_INFINITY : parsed;
}

function formatDate(date?: string) {
    if (!date) return "-";
    const parsed = new Date(date);
    if (Number.isNaN(parsed.getTime())) return date;
    return parsed.toLocaleDateString("id-ID", {
        weekday: "long",
        day: "2-digit",
        month: "long",
        year: "numeric",
    });
}

export default function TutorDashboardPage() {
    const [data, setData] = useState<TutorDashboardData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let active = true;
        setLoading(true);
        setError(null);
        api.tutor
            .dashboard()
            .then((response) => {
                if (!active) return;
                if (!response.success || !response.data) {
                    throw new Error(response.message || "Gagal memuat data tutor.");
                }
                setData(response.data);
                setLoading(false);
            })
            .catch(() => {
                if (!active) return;
                setError("Gagal memuat data tutor. Coba refresh halaman.");
                setLoading(false);
            });

        return () => {
            active = false;
        };
    }, []);

    const sessions = data?.sessions ?? [];
    const sortedSessions = useMemo(() => {
        return [...sessions].sort((a, b) => parseSessionStart(a) - parseSessionStart(b));
    }, [sessions]);

    const now = Date.now();
    const nextSession =
        sortedSessions.find((session) => parseSessionStart(session) >= now) || sortedSessions[0];

    const stats = { ...fallbackStats, ...(data?.stats ?? {}) };
    const tutorName = data?.tutor?.name || "Tutor";
    const rangeLabel = data?.range_label;
    const primaryLevel =
        nextSession?.level || sortedSessions[0]?.level || sessions[0]?.level || "-";

    return (
        <div className="space-y-10">
            <div className="flex flex-col gap-2">
                <p className="text-xs font-bold uppercase tracking-[0.25em] text-primary/40">
                    Tutor Dashboard
                </p>
                <h1 className="text-3xl font-bold text-primary">
                    {getGreeting()}, {tutorName}
                </h1>
                <p className="text-primary/60">
                    Jadwal kelas kamu sudah siap. Fokus ke kelas yang berjalan minggu ini.
                </p>
            </div>

            {rangeLabel && (
                <div className="inline-flex items-center gap-2 bg-white border border-gray-100 rounded-full px-4 py-2 text-xs font-bold text-primary/60 shadow-sm">
                    <CalendarDays className="w-4 h-4" />
                    {rangeLabel}
                </div>
            )}

            {loading && (
                <div className="bg-white rounded-3xl border border-gray-100 p-8 text-sm text-primary/60">
                    Memuat data tutor...
                </div>
            )}

            {error && !loading && (
                <div className="bg-white rounded-3xl border border-red-200 p-6 text-sm text-red-500 flex items-center gap-3">
                    <AlertCircle className="w-5 h-5" />
                    {error}
                </div>
            )}

            {!loading && !error && (
                <>
                    <div className="grid gap-6 md:grid-cols-2">
                        <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm">
                            <div className="flex items-center justify-between mb-4">
                                <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary/40">
                                    Kelas / Level
                                </p>
                                <Layers className="w-5 h-5 text-primary/40" />
                            </div>
                            <p className="text-2xl font-bold text-primary">{primaryLevel}</p>
                        </div>
                        <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm">
                            <div className="flex items-center justify-between mb-4">
                                <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary/40">
                                    Total Siswa
                                </p>
                                <Users className="w-5 h-5 text-primary/40" />
                            </div>
                            <p className="text-3xl font-bold text-primary">{stats.total_students}</p>
                        </div>
                    </div>

                    <div className="bg-white rounded-3xl border border-gray-100 p-8 shadow-sm">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h2 className="text-xl font-bold text-primary">Kelas Terdekat</h2>
                                <p className="text-sm text-primary/50">Prioritas kelas yang akan berjalan.</p>
                            </div>
                        </div>
                        {nextSession ? (
                            <div className="grid gap-4 md:grid-cols-3">
                                <div>
                                    <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary/40">
                                        Project
                                    </p>
                                    <p className="text-lg font-semibold text-primary mt-2">
                                        {nextSession.project || "-"}
                                    </p>
                                    <p className="text-sm text-primary/60">
                                        {nextSession.level || "-"}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary/40">
                                        Jadwal
                                    </p>
                                    <p className="text-lg font-semibold text-primary mt-2">
                                        {nextSession.day_label || "-"} • {nextSession.time_range || "-"}
                                    </p>
                                    <p className="text-sm text-primary/60">{formatDate(nextSession.date)}</p>
                                </div>
                                <div>
                                    <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary/40">
                                        Ruangan
                                    </p>
                                    <p className="text-lg font-semibold text-primary mt-2">
                                        {nextSession.room || "-"}
                                    </p>
                                    <p className="text-sm text-primary/60">
                                        Meeting ke-{nextSession.meeting ?? "-"}
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <p className="text-sm text-primary/60">Belum ada jadwal.</p>
                        )}
                    </div>

                    <div className="space-y-6">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-bold text-primary">Jadwal Kelas</h2>
                            <span className="text-xs font-bold uppercase tracking-[0.2em] text-primary/40">
                                {sortedSessions.length} sesi
                            </span>
                        </div>

                        {sortedSessions.length === 0 && (
                            <div className="bg-white rounded-3xl border border-gray-100 p-8 text-sm text-primary/60">
                                Belum ada jadwal yang tersimpan untuk tutor ini.
                            </div>
                        )}

                        <div className="grid gap-6">
                            {sortedSessions.map((session) => {
                                const students = session.students ?? [];
                                const visibleStudents = students.slice(0, 8);
                                const remaining = students.length - visibleStudents.length;

                                return (
                                    <div
                                        key={session.id}
                                        className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm space-y-4"
                                    >
                                        <div className="flex flex-wrap items-start justify-between gap-4">
                                            <div>
                                                <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary/40">
                                                    {session.level || "Program"}
                                                </p>
                                                <h3 className="text-lg font-bold text-primary mt-2">
                                                    {session.project || "-"}
                                                </h3>
                                                <p className="text-sm text-primary/60 mt-1">
                                                    Meeting ke-{session.meeting ?? "-"} • {session.room || "-"}
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-sm font-semibold text-primary">
                                                    {session.day_label || "-"} • {session.time_range || "-"}
                                                </p>
                                                <p className="text-xs text-primary/50">{formatDate(session.date)}</p>
                                            </div>
                                        </div>

                                        {session.notes?.device && (
                                            <div className="inline-flex items-center gap-2 bg-[#255d74]/5 text-[#255d74] text-xs font-semibold px-3 py-2 rounded-full">
                                                {session.notes.device}
                                            </div>
                                        )}

                                        <div>
                                            <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary/40 mb-3">
                                                Daftar Siswa
                                            </p>
                                            <div className="flex flex-wrap gap-2">
                                                {visibleStudents.map((student, index) => (
                                                    <span
                                                        key={`${student.name}-${index}`}
                                                        className="px-3 py-1 rounded-full bg-gray-100 text-xs font-semibold text-primary/70"
                                                    >
                                                        {student.name}
                                                    </span>
                                                ))}
                                                {remaining > 0 && (
                                                    <span className="px-3 py-1 rounded-full bg-gray-100 text-xs font-semibold text-primary/50">
                                                        +{remaining} lainnya
                                                    </span>
                                                )}
                                                {students.length === 0 && (
                                                    <span className="text-xs text-primary/50">Belum ada siswa.</span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
