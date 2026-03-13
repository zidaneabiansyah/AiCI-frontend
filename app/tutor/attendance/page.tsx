"use client";

import { useEffect, useMemo, useState } from "react";
import { api, TutorSession } from "@/lib/api";
import { AlertCircle } from "lucide-react";

type AttendanceValue = "Hadir" | "Izin" | "Alpha";

const attendanceOptions: AttendanceValue[] = ["Hadir", "Izin", "Alpha"];

export default function TutorAttendancePage() {
    const [sessions, setSessions] = useState<TutorSession[]>([]);
    const [selectedSessionId, setSelectedSessionId] = useState<string>("");
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
    }, [selectedSessionId]);

    const handleAttendanceChange = (studentName: string, value: AttendanceValue) => {
        setAttendanceMap((prev) => ({ ...prev, [studentName]: value }));
    };

    const students = selectedSession?.students ?? [];

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
                <div className="flex flex-col gap-2">
                    <label className="text-xs font-bold text-primary/40 uppercase tracking-widest ml-1">
                        Jadwal Kelas
                    </label>
                    <div className="flex flex-wrap gap-3">
                        {sessions.length > 1 ? (
                            <select
                                value={selectedSessionId}
                                onChange={(e) => setSelectedSessionId(e.target.value)}
                                className="min-w-[260px] flex-1 bg-gray-50 border border-gray-100 rounded-2xl px-4 py-3 text-sm font-semibold text-primary"
                            >
                                {sessions.length === 0 && <option value="">Belum ada jadwal</option>}
                                {sessions.map((session) => (
                                    <option key={session.id} value={session.id}>
                                        {session.project} • {session.day_label} {session.time_range} • {session.room}
                                    </option>
                                ))}
                            </select>
                        ) : (
                            <div className="flex-1 bg-gray-50 border border-gray-100 rounded-2xl px-4 py-3 text-sm font-semibold text-primary">
                                {sessions[0]
                                    ? `${sessions[0].project} • ${sessions[0].day_label} ${sessions[0].time_range} • ${sessions[0].room}`
                                    : "Belum ada jadwal"}
                            </div>
                        )}
                        <button
                            onClick={() => window.location.reload()}
                            className="bg-white text-primary font-bold px-4 py-3 rounded-2xl border border-gray-200 hover:border-primary/30 transition-all"
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

                {selectedSession && (
                    <div className="grid gap-4 md:grid-cols-3 text-sm text-primary/70">
                        <div>
                            <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary/40">
                                Kelas / Level
                            </p>
                            <p className="mt-2 font-semibold text-primary">
                                {selectedSession.level || "-"}
                            </p>
                        </div>
                        <div>
                            <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary/40">
                                Project
                            </p>
                            <p className="mt-2 font-semibold text-primary">
                                {selectedSession.project || "-"}
                            </p>
                        </div>
                        <div>
                            <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary/40">
                                Jadwal
                            </p>
                            <p className="mt-2 font-semibold text-primary">
                                {selectedSession.day_label || "-"} • {selectedSession.time_range || "-"}
                            </p>
                        </div>
                    </div>
                )}
            </div>

            <div className="bg-white rounded-[3rem] shadow-sm border border-gray-100 p-10 space-y-6">
                <div>
                    <h2 className="text-xl font-bold text-primary">Daftar Siswa</h2>
                    <p className="text-primary/50 text-sm">
                        Total siswa: {students.length}
                    </p>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50/50 text-[10px] font-bold text-primary/30 uppercase tracking-[0.2em]">
                            <tr>
                                <th className="px-6 py-4">Nama</th>
                                <th className="px-4 py-4">Status Kehadiran</th>
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
