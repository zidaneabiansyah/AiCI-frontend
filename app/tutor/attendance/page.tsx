"use client";

import { useEffect, useMemo, useState } from "react";
import { api, TutorSession } from "@/lib/api";
import { AlertCircle } from "lucide-react";

type AttendanceValue = "Hadir" | "Izin" | "Alpha";

const attendanceOptions: AttendanceValue[] = ["Hadir", "Izin", "Alpha"];

export default function TutorAttendancePage() {
    const [sessions, setSessions] = useState<TutorSession[]>([]);
    const [selectedSessionId, setSelectedSessionId] = useState<string>("");
    const [selectedWeek, setSelectedWeek] = useState<number>(1);
    const [loadingSessions, setLoadingSessions] = useState(true);
    const [sessionError, setSessionError] = useState<string | null>(null);
    const [attendanceMap, setAttendanceMap] = useState<Record<string, AttendanceValue>>({});

    const selectedSession = useMemo(
        () => sessions.find((session) => session.id === selectedSessionId),
        [sessions, selectedSessionId]
    );

    useEffect(() => {
        setLoadingSessions(true);
        setSessionError(null);
        api.tutor
            .dashboard()
            .then((response) => {
                if (!response.success || !response.data) {
                    throw new Error(response.message || "Gagal memuat data tutor.");
                }
                const nextSessions = response.data.sessions ?? [];
                setSessions(nextSessions);
                setLoadingSessions(false);
                if (nextSessions.length) {
                    setSelectedSessionId(nextSessions[0].id);
                }
            })
            .catch(() => {
                setLoadingSessions(false);
                setSessionError("Gagal memuat jadwal tutor.");
            });
    }, []);

    useEffect(() => {
        const students = selectedSession?.students ?? [];
        const nextMap: Record<string, AttendanceValue> = {};
        students.forEach((student) => {
            nextMap[student.name] = "Hadir";
        });
        setAttendanceMap(nextMap);
    }, [selectedSessionId, selectedWeek]);

    const handleAttendanceChange = (studentName: string, value: AttendanceValue) => {
        setAttendanceMap((prev) => ({ ...prev, [studentName]: value }));
    };

    const students = selectedSession?.students ?? [];
    const weekOptions = useMemo(() => Array.from({ length: 4 }, (_, index) => index + 1), []);
    const attendanceSummary = useMemo(() => {
        return students.reduce(
            (acc, student) => {
                const value = attendanceMap[student.name] ?? "Hadir";
                acc[value] += 1;
                return acc;
            },
            { Hadir: 0, Izin: 0, Alpha: 0 } as Record<AttendanceValue, number>
        );
    }, [attendanceMap, students]);

    return (
        <div className="space-y-8">
            <div>
                <p className="text-xs font-bold uppercase tracking-[0.25em] text-primary/40">
                    Tutor Tools
                </p>
                <h1 className="text-3xl font-bold text-primary">Absensi Siswa</h1>
                <p className="text-primary/60 mt-2">
                    Pilih kelas, lalu tandai kehadiran siswa.
                </p>
            </div>

            <div className="bg-white rounded-[3rem] shadow-sm border border-gray-100 p-8 space-y-4">
                <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_220px_auto]">
                    <div className="flex flex-col gap-2">
                        <label className="text-xs font-bold text-primary/40 uppercase tracking-widest ml-1">
                            Kelas
                        </label>
                        {sessions.length > 1 ? (
                            <select
                                value={selectedSessionId}
                                onChange={(e) => setSelectedSessionId(e.target.value)}
                                className="min-w-[260px] w-full bg-gray-50 border border-gray-100 rounded-2xl px-4 py-3 text-sm font-semibold text-primary"
                            >
                                {sessions.length === 0 && <option value="">Belum ada kelas</option>}
                                {sessions.map((session) => (
                                    <option key={session.id} value={session.id}>
                                        {session.project} • {session.level} • {session.room}
                                    </option>
                                ))}
                            </select>
                        ) : (
                            <div className="bg-gray-50 border border-gray-100 rounded-2xl px-4 py-3 text-sm font-semibold text-primary">
                                {sessions[0]
                                    ? `${sessions[0].project} • ${sessions[0].level} • ${sessions[0].room}`
                                    : "Belum ada kelas"}
                            </div>
                        )}
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className="text-xs font-bold text-primary/40 uppercase tracking-widest ml-1">
                            Week
                        </label>
                        <select
                            value={selectedWeek}
                            onChange={(e) => setSelectedWeek(Number(e.target.value))}
                            className="bg-gray-50 border border-gray-100 rounded-2xl px-4 py-3 text-sm font-semibold text-primary"
                        >
                            {weekOptions.map((week) => (
                                <option key={week} value={week}>
                                    Week {week}
                                </option>
                            ))}
                        </select>
                    </div>

                    <button
                        onClick={() => window.location.reload()}
                        className="h-[50px] bg-white text-primary font-bold px-4 py-3 rounded-2xl border border-gray-200 hover:border-primary/30 transition-all"
                        disabled={loadingSessions}
                    >
                        {loadingSessions ? "Memuat..." : "Refresh"}
                    </button>
                </div>

                {sessionError && (
                    <div className="text-xs font-semibold text-red-500 flex items-center gap-2">
                        <AlertCircle className="w-4 h-4" />
                        {sessionError}
                    </div>
                )}
            </div>

            <div className="bg-white rounded-[3rem] shadow-sm border border-gray-100 p-10 space-y-6">
                <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                        <h2 className="text-xl font-bold text-primary">Daftar Siswa</h2>
                        <p className="text-primary/50 text-sm">
                            Week {selectedWeek} • Total siswa: {students.length}
                        </p>
                    </div>
                    <div className="flex flex-wrap gap-2 text-xs font-semibold">
                        <span className="rounded-full bg-emerald-50 px-3 py-1 text-emerald-700">
                            Hadir: {attendanceSummary.Hadir}
                        </span>
                        <span className="rounded-full bg-amber-50 px-3 py-1 text-amber-700">
                            Izin: {attendanceSummary.Izin}
                        </span>
                        <span className="rounded-full bg-rose-50 px-3 py-1 text-rose-700">
                            Alpha: {attendanceSummary.Alpha}
                        </span>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50/50 text-[10px] font-bold text-primary/30 uppercase tracking-[0.2em]">
                            <tr>
                                <th className="px-6 py-4">Nama</th>
                                <th className="px-4 py-4">Week {selectedWeek}</th>
                            </tr>
                        </thead>
                        <tbody className="text-sm font-semibold text-primary/70">
                            {students.map((student, index) => (
                                <tr key={`${student.name}-${index}`} className="border-b border-gray-100 last:border-none">
                                    <td className="px-6 py-4">{student.name}</td>
                                    <td className="px-4 py-4">
                                        <select
                                            value={attendanceMap[student.name] || "Hadir"}
                                            onChange={(e) =>
                                                handleAttendanceChange(student.name, e.target.value as AttendanceValue)
                                            }
                                            className="bg-gray-50 border border-gray-100 rounded-xl px-3 py-2 text-sm font-semibold text-primary"
                                        >
                                            {attendanceOptions.map((option) => (
                                                <option key={option} value={option}>
                                                    {option}
                                                </option>
                                            ))}
                                        </select>
                                    </td>
                                </tr>
                            ))}
                            {students.length === 0 && (
                                <tr>
                                    <td className="px-6 py-6 text-sm text-primary/50" colSpan={2}>
                                        Belum ada siswa untuk jadwal ini.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
