import GradeEntry from "@/components/grades/GradeEntry";

export default function TutorGradesPage() {
    return (
        <div className="space-y-8">
            <div>
                <p className="text-xs font-bold uppercase tracking-[0.25em] text-primary/40">
                    Tutor Tools
                </p>
                <h1 className="text-3xl font-bold text-primary">Input Nilai Siswa</h1>
                <p className="text-primary/60 mt-2">
                    Isi nilai mingguan dan saran untuk tiap siswa sesuai kelas kamu.
                </p>
            </div>
            <GradeEntry
                title="Grade Entry"
                subtitle="Input nilai mingguan dan saran tutor"
            />
        </div>
    );
}
