"use client";

import { useEffect, useMemo, useState } from "react";
import { api, TutorSession } from "@/lib/api";

type GradeRow = {
    name: string;
    tools: string;
    robot: string;
    coding: string;
    focus: string;
    interaction: string;
    notes: string;
};

type FeedbackRow = {
    name: string;
    week1to4: string;
    week5to8: string;
    week9to14: string;
};

type GradeEntryProps = {
    title?: string;
    subtitle?: string;
};

const emptyGradeRow: GradeRow = {
    name: "",
    tools: "",
    robot: "",
    coding: "",
    focus: "",
    interaction: "",
    notes: "",
};

const emptyFeedbackRow: FeedbackRow = {
    name: "",
    week1to4: "",
    week5to8: "",
    week9to14: "",
};

function escapeCsv(value: string): string {
    if (value == null) return "";
    const normalized = String(value);
    if (/[\",\n]/.test(normalized)) {
        return `"${normalized.replace(/\"/g, '""')}"`;
    }
    return normalized;
}

function downloadCsv(filename: string, headers: string[], rows: string[][]) {
    const content = [
        headers.map(escapeCsv).join(","),
        ...rows.map((row) => row.map(escapeCsv).join(",")),
    ].join("\n");
    const blob = new Blob([content], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

export default function GradeEntry({
    title = "Grade Entry",
    subtitle = "Input nilai mingguan dan saran tutor",
}: GradeEntryProps) {
    const [week, setWeek] = useState(1);
    const [className, setClassName] = useState("");
    const [moduleName, setModuleName] = useState("");
    const [room, setRoom] = useState("");
    const [gradeRows, setGradeRows] = useState<GradeRow[]>([{ ...emptyGradeRow }]);
    const [feedbackRows, setFeedbackRows] = useState<FeedbackRow[]>([{ ...emptyFeedbackRow }]);
    const [sessions, setSessions] = useState<TutorSession[]>([]);
    const [selectedSessionId, setSelectedSessionId] = useState<string>("");
    const [loadingSessions, setLoadingSessions] = useState(true);
    const [sessionError, setSessionError] = useState<string | null>(null);

    const weekOptions = useMemo(() => Array.from({ length: 14 }, (_, i) => i + 1), []);

    const handleGradeChange = (index: number, field: keyof GradeRow, value: string) => {
        setGradeRows((prev) => {
            const next = [...prev];
            next[index] = { ...next[index], [field]: value };
            return next;
        });
    };

    const handleFeedbackChange = (index: number, field: keyof FeedbackRow, value: string) => {
        setFeedbackRows((prev) => {
            const next = [...prev];
            next[index] = { ...next[index], [field]: value };
            return next;
        });
    };

    const addGradeRow = () => setGradeRows((prev) => [...prev, { ...emptyGradeRow }]);
    const removeGradeRow = (index: number) => {
        setGradeRows((prev) => {
            const next = prev.filter((_, i) => i !== index);
            return next.length ? next : [{ ...emptyGradeRow }];
        });
    };

    const addFeedbackRow = () => setFeedbackRows((prev) => [...prev, { ...emptyFeedbackRow }]);
    const removeFeedbackRow = (index: number) => {
        setFeedbackRows((prev) => {
            const next = prev.filter((_, i) => i !== index);
            return next.length ? next : [{ ...emptyFeedbackRow }];
        });
    };

    const applySessionData = (session: TutorSession) => {
        setClassName(session.level ?? "");
        setModuleName(session.project ?? "");
        setRoom(session.room ?? "");
        if (typeof session.meeting === "number" && session.meeting > 0) {
            setWeek(Math.min(Math.max(session.meeting, 1), 14));
        }
        const students = session.students ?? [];
        if (students.length) {
            setGradeRows(students.map((student) => ({ ...emptyGradeRow, name: student.name })));
            setFeedbackRows(students.map((student) => ({ ...emptyFeedbackRow, name: student.name })));
        }
    };

    const refreshSessions = () => {
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
                    applySessionData(nextSessions[0]);
                }
            })
            .catch(() => {
                setLoadingSessions(false);
                setSessionError("Gagal memuat jadwal tutor.");
            });
    };

    useEffect(() => {
        refreshSessions();
    }, []);

    const handleSessionSelect = (sessionId: string) => {
        setSelectedSessionId(sessionId);
        const session = sessions.find((item) => item.id === sessionId);
        if (session) {
            applySessionData(session);
        }
    };

    const exportWeekCsv = () => {
        const headers = [
            "Nama",
            "Kelas",
            "Modul",
            "Tools Management",
            "Robot Building",
            "Coding",
            "Focus",
            "Interaction",
            "Catatan",
        ];
        const rows = gradeRows.map((row) => [
            row.name,
            className,
            moduleName,
            row.tools,
            row.robot,
            row.coding,
            row.focus,
            row.interaction,
            row.notes,
        ]);
        downloadCsv(`nilai-week-${week}.csv`, headers, rows);
    };

    const exportFeedbackCsv = () => {
        const headers = ["Nama", "Kelas", "Modul", "Week 1 - 4", "Week 5 - 8", "Week 9 - 14"];
        const rows = feedbackRows.map((row) => [
            row.name,
            className,
            moduleName,
            row.week1to4,
            row.week5to8,
            row.week9to14,
        ]);
        downloadCsv("saran-dan-masukan.csv", headers, rows);
    };

    return (
        <div className="space-y-8">
            <div className="bg-white rounded-[3rem] shadow-sm border border-gray-100 p-10 space-y-6">
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                    <div>
                        <h3 className="text-2xl font-bold text-primary mb-2">{title}</h3>
                        <p className="text-primary/40 text-xs font-bold uppercase tracking-widest">
                            {subtitle}
                        </p>
                    </div>
                    <div className="flex flex-wrap gap-3">
                        <button
                            onClick={exportWeekCsv}
                            className="bg-secondary text-white font-bold px-6 py-3 rounded-2xl shadow-lg shadow-secondary/20 hover:bg-primary transition-all"
                        >
                            Export Nilai Mingguan
                        </button>
                        <button
                            onClick={exportFeedbackCsv}
                            className="bg-white text-primary font-bold px-6 py-3 rounded-2xl border border-gray-200 hover:border-primary/30 transition-all"
                        >
                            Export Saran & Masukan
                        </button>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="flex flex-col gap-2">
                        <label className="text-xs font-bold text-primary/40 uppercase tracking-widest ml-1">
                            Jadwal Kelas
                        </label>
                        <div className="flex flex-wrap gap-3">
                            {sessions.length > 1 ? (
                                <select
                                    value={selectedSessionId}
                                    onChange={(e) => handleSessionSelect(e.target.value)}
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
                                onClick={refreshSessions}
                                className="bg-white text-primary font-bold px-4 py-3 rounded-2xl border border-gray-200 hover:border-primary/30 transition-all"
                                disabled={loadingSessions}
                            >
                                {loadingSessions ? "Memuat..." : "Refresh"}
                            </button>
                        </div>
                        {sessionError && (
                            <p className="text-xs font-semibold text-red-500">{sessionError}</p>
                        )}
                    </div>

                    <div className="grid gap-4 md:grid-cols-3">
                        <div className="flex flex-col gap-2">
                            <label className="text-xs font-bold text-primary/40 uppercase tracking-widest ml-1">
                                Week
                            </label>
                            <select
                                value={week}
                                onChange={(e) => setWeek(Number(e.target.value))}
                                className="bg-gray-50 border border-gray-100 rounded-2xl px-4 py-3 text-sm font-semibold text-primary"
                            >
                                {weekOptions.map((w) => (
                                    <option key={w} value={w}>
                                        Week {w}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="flex flex-col gap-2 md:col-span-2">
                            <label className="text-xs font-bold text-primary/40 uppercase tracking-widest ml-1">
                                Nama Kelas / Program
                            </label>
                            <input
                                value={className}
                                onChange={(e) => setClassName(e.target.value)}
                                placeholder="Contoh: AI Super Engineer"
                                className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-4 py-3 text-sm font-semibold text-primary focus:outline-none focus:ring-2 focus:ring-secondary/20"
                            />
                        </div>
                    </div>

                    <div className="grid gap-4 md:grid-cols-[1.2fr_0.8fr]">
                        <div className="flex flex-col gap-2">
                            <label className="text-xs font-bold text-primary/40 uppercase tracking-widest ml-1">
                                Modul / Project
                            </label>
                            <input
                                value={moduleName}
                                onChange={(e) => setModuleName(e.target.value)}
                                placeholder="Contoh: Air Guitar"
                                className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-4 py-3 text-sm font-semibold text-primary focus:outline-none focus:ring-2 focus:ring-secondary/20"
                            />
                        </div>
                        <div className="flex flex-col gap-2">
                            <label className="text-xs font-bold text-primary/40 uppercase tracking-widest ml-1">
                                Ruang
                            </label>
                            <input
                                value={room}
                                onChange={(e) => setRoom(e.target.value)}
                                placeholder="Lab-1"
                                className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-4 py-3 text-sm font-semibold text-primary focus:outline-none focus:ring-2 focus:ring-secondary/20"
                            />
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-[3rem] shadow-sm border border-gray-100 p-10 space-y-6">
                <div className="flex flex-col lg:flex-row gap-6 items-start lg:items-end justify-between">
                    <div>
                        <h4 className="text-xl font-bold text-primary">Nilai Mingguan</h4>
                        <p className="text-primary/40 text-xs font-bold uppercase tracking-widest">
                            Isi nilai untuk setiap siswa minggu ini
                        </p>
                    </div>
                    <button
                        onClick={addGradeRow}
                        className="bg-primary text-white font-bold px-4 py-3 rounded-2xl hover:bg-secondary transition-all"
                    >
                        + Tambah siswa
                    </button>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50/50 text-[10px] font-bold text-primary/30 uppercase tracking-[0.2em]">
                            <tr>
                                <th className="px-6 py-4">Nama</th>
                                <th className="px-4 py-4">Tools</th>
                                <th className="px-4 py-4">Robot</th>
                                <th className="px-4 py-4">Coding</th>
                                <th className="px-4 py-4">Focus</th>
                                <th className="px-4 py-4">Interaction</th>
                                <th className="px-4 py-4">Catatan</th>
                                <th className="px-4 py-4"></th>
                            </tr>
                        </thead>
                        <tbody className="text-sm font-semibold text-primary/70">
                            {gradeRows.map((row, index) => (
                                <tr key={index} className="border-b border-gray-100 last:border-none">
                                    <td className="px-6 py-4">
                                        <input
                                            value={row.name}
                                            onChange={(e) => handleGradeChange(index, "name", e.target.value)}
                                            placeholder="Nama siswa"
                                            className="w-full bg-gray-50 border border-gray-100 rounded-xl px-3 py-2"
                                        />
                                    </td>
                                    <td className="px-4 py-4">
                                        <input
                                            value={row.tools}
                                            onChange={(e) => handleGradeChange(index, "tools", e.target.value)}
                                            type="number"
                                            min={0}
                                            max={5}
                                            step={0.5}
                                            className="w-20 bg-gray-50 border border-gray-100 rounded-xl px-3 py-2"
                                        />
                                    </td>
                                    <td className="px-4 py-4">
                                        <input
                                            value={row.robot}
                                            onChange={(e) => handleGradeChange(index, "robot", e.target.value)}
                                            type="number"
                                            min={0}
                                            max={5}
                                            step={0.5}
                                            className="w-20 bg-gray-50 border border-gray-100 rounded-xl px-3 py-2"
                                        />
                                    </td>
                                    <td className="px-4 py-4">
                                        <input
                                            value={row.coding}
                                            onChange={(e) => handleGradeChange(index, "coding", e.target.value)}
                                            type="number"
                                            min={0}
                                            max={5}
                                            step={0.5}
                                            className="w-20 bg-gray-50 border border-gray-100 rounded-xl px-3 py-2"
                                        />
                                    </td>
                                    <td className="px-4 py-4">
                                        <input
                                            value={row.focus}
                                            onChange={(e) => handleGradeChange(index, "focus", e.target.value)}
                                            type="number"
                                            min={0}
                                            max={5}
                                            step={0.5}
                                            className="w-20 bg-gray-50 border border-gray-100 rounded-xl px-3 py-2"
                                        />
                                    </td>
                                    <td className="px-4 py-4">
                                        <input
                                            value={row.interaction}
                                            onChange={(e) => handleGradeChange(index, "interaction", e.target.value)}
                                            type="number"
                                            min={0}
                                            max={5}
                                            step={0.5}
                                            className="w-20 bg-gray-50 border border-gray-100 rounded-xl px-3 py-2"
                                        />
                                    </td>
                                    <td className="px-4 py-4">
                                        <input
                                            value={row.notes}
                                            onChange={(e) => handleGradeChange(index, "notes", e.target.value)}
                                            placeholder="Catatan singkat"
                                            className="min-w-[200px] bg-gray-50 border border-gray-100 rounded-xl px-3 py-2"
                                        />
                                    </td>
                                    <td className="px-4 py-4">
                                        {gradeRows.length > 1 && (
                                            <button
                                                onClick={() => removeGradeRow(index)}
                                                className="text-xs font-bold text-red-400 hover:text-red-600"
                                            >
                                                Hapus
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="bg-white rounded-[3rem] shadow-sm border border-gray-100 p-10 space-y-6">
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                    <div>
                        <h4 className="text-xl font-bold text-primary">Saran dan Masukan</h4>
                        <p className="text-primary/40 text-xs font-bold uppercase tracking-widest">
                            Ringkasan progres siswa per periode
                        </p>
                    </div>
                    <button
                        onClick={addFeedbackRow}
                        className="bg-primary text-white font-bold px-4 py-3 rounded-2xl hover:bg-secondary transition-all"
                    >
                        + Tambah siswa
                    </button>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50/50 text-[10px] font-bold text-primary/30 uppercase tracking-[0.2em]">
                            <tr>
                                <th className="px-6 py-4">Nama</th>
                                <th className="px-4 py-4">Week 1 - 4</th>
                                <th className="px-4 py-4">Week 5 - 8</th>
                                <th className="px-4 py-4">Week 9 - 14</th>
                                <th className="px-4 py-4"></th>
                            </tr>
                        </thead>
                        <tbody className="text-sm font-semibold text-primary/70">
                            {feedbackRows.map((row, index) => (
                                <tr key={index} className="border-b border-gray-100 last:border-none">
                                    <td className="px-6 py-4">
                                        <input
                                            value={row.name}
                                            onChange={(e) => handleFeedbackChange(index, "name", e.target.value)}
                                            placeholder="Nama siswa"
                                            className="w-full bg-gray-50 border border-gray-100 rounded-xl px-3 py-2"
                                        />
                                    </td>
                                    <td className="px-4 py-4">
                                        <textarea
                                            value={row.week1to4}
                                            onChange={(e) =>
                                                handleFeedbackChange(index, "week1to4", e.target.value)
                                            }
                                            placeholder="Saran week 1 - 4"
                                            className="min-w-[200px] min-h-[90px] bg-gray-50 border border-gray-100 rounded-xl px-3 py-2"
                                        />
                                    </td>
                                    <td className="px-4 py-4">
                                        <textarea
                                            value={row.week5to8}
                                            onChange={(e) =>
                                                handleFeedbackChange(index, "week5to8", e.target.value)
                                            }
                                            placeholder="Saran week 5 - 8"
                                            className="min-w-[200px] min-h-[90px] bg-gray-50 border border-gray-100 rounded-xl px-3 py-2"
                                        />
                                    </td>
                                    <td className="px-4 py-4">
                                        <textarea
                                            value={row.week9to14}
                                            onChange={(e) =>
                                                handleFeedbackChange(index, "week9to14", e.target.value)
                                            }
                                            placeholder="Saran week 9 - 14"
                                            className="min-w-[200px] min-h-[90px] bg-gray-50 border border-gray-100 rounded-xl px-3 py-2"
                                        />
                                    </td>
                                    <td className="px-4 py-4">
                                        {feedbackRows.length > 1 && (
                                            <button
                                                onClick={() => removeFeedbackRow(index)}
                                                className="text-xs font-bold text-red-400 hover:text-red-600"
                                            >
                                                Hapus
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
