"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { placementTestApi } from '@/lib/api';
import { useAuth } from '@/lib/hooks/use-auth';
import toast from 'react-hot-toast';
import { Clock, FileText, Award, AlertCircle, Loader2, Play, ChevronLeft } from 'lucide-react';

const preAssessmentSchema = z.object({
    full_name: z.string().min(3, 'Nama minimal 3 karakter'),
    email: z.string().email('Email tidak valid'),
    age: z.number().min(5, 'Usia minimal 5 tahun').max(100, 'Usia tidak valid'),
    education_level: z.enum(['sd_mi', 'smp_mts', 'sma_ma', 'umum']),
    current_grade: z.string().optional(),
    experience_ai: z.boolean().optional(),
    experience_robotics: z.boolean().optional(),
    experience_programming: z.boolean().optional(),
    interests: z.string().optional(),
});

type PreAssessmentFormData = z.infer<typeof preAssessmentSchema>;

export default function DashboardPlacementTestDetailPage() {
    const params = useParams();
    const router = useRouter();
    const { user, isAuthenticated } = useAuth();
    const [showForm, setShowForm] = useState(false);

    const slug = params.slug as string;

    const { data, isLoading } = useQuery({
        queryKey: ['placement-test', slug],
        queryFn: () => placementTestApi.show(slug),
    });

    const test = data?.data?.test;
    const existingAttempt = data?.data?.existingAttempt;

    const startTestMutation = useMutation({
        mutationFn: (formData: PreAssessmentFormData) => {
            const payload = {
                placement_test_id: test.id,
                full_name: formData.full_name,
                email: formData.email,
                age: formData.age,
                education_level: formData.education_level,
                current_grade: formData.current_grade || undefined,
                experience: {
                    ai: formData.experience_ai || false,
                    robotics: formData.experience_robotics || false,
                    programming: formData.experience_programming || false,
                },
                interests: formData.interests ? formData.interests.split(',').map(i => i.trim()) : [],
            };
            return placementTestApi.start(test.id, payload);
        },
        onSuccess: (response) => {
            toast.success('Test dimulai! Semangat!');
            router.push(`/dashboard/tests/available/${slug}/test?attempt=${response.data.attempt_id}`);
        },
        onError: (error: any) => {
            toast.error(error.message || 'Gagal memulai test');
        },
    });

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm<PreAssessmentFormData>({
        resolver: zodResolver(preAssessmentSchema),
        defaultValues: {
            full_name: user?.name || '',
            email: user?.email || '',
            age: 0,
            education_level: 'sd_mi',
            experience_ai: false,
            experience_robotics: false,
            experience_programming: false,
        },
    });

    useEffect(() => {
        if (test && test.education_level) {
            let eduLevel: any = 'umum';
            const level = test.education_level.toLowerCase();
            if (level.includes('sd')) eduLevel = 'sd_mi';
            else if (level.includes('smp')) eduLevel = 'smp_mts';
            else if (level.includes('sma')) eduLevel = 'sma_ma';

            reset(formValues => ({
                ...formValues,
                education_level: eduLevel
            }));
        }
    }, [test, reset]);

    const onSubmit = (data: PreAssessmentFormData) => {
        startTestMutation.mutate(data);
    };

    if (isLoading) {
        return (
            <div className="flex justify-center py-20">
                <Loader2 className="w-12 h-12 animate-spin text-[#255d74]" />
            </div>
        );
    }

    if (!test) {
        return (
            <div className="text-center py-20">
                <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                <h1 className="text-2xl font-bold text-[#255d74] mb-2">Test Tidak Ditemukan</h1>
                <button onClick={() => router.back()} className="text-[#255d74] font-bold hover:underline">Kembali</button>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto">
            <button
                onClick={() => showForm ? setShowForm(false) : router.back()}
                className="flex items-center gap-2 text-[#255d74]/60 font-bold hover:text-[#255d74] transition-all mb-8"
            >
                <ChevronLeft className="w-5 h-5" />
                {showForm ? "Batal" : "Kembali"}
            </button>

            <div className="bg-white rounded-[2.5rem] p-8 md:p-12 shadow-sm border border-gray-100 mb-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-[#255d74] mb-4">{test.title}</h1>
                    <p className="text-[#255d74]/60 text-lg leading-relaxed font-medium">{test.description}</p>
                </div>

                <div className="grid grid-cols-3 gap-6">
                    <div className="flex flex-col items-center p-5 bg-gray-50 rounded-2xl">
                        <Clock className="w-6 h-6 text-[#255d74]/40 mb-2" />
                        <span className="text-[10px] font-bold text-[#255d74]/40 uppercase tracking-widest mb-1">Durasi</span>
                        <span className="text-lg font-bold text-[#255d74]">{test.duration_minutes}m</span>
                    </div>
                    <div className="flex flex-col items-center p-5 bg-gray-50 rounded-2xl">
                        <FileText className="w-6 h-6 text-[#255d74]/40 mb-2" />
                        <span className="text-[10px] font-bold text-[#255d74]/40 uppercase tracking-widest mb-1">Soal</span>
                        <span className="text-lg font-bold text-[#255d74]">{test.total_questions}</span>
                    </div>
                    <div className="flex flex-col items-center p-5 bg-gray-50 rounded-2xl">
                        <Award className="w-6 h-6 text-[#255d74]/40 mb-2" />
                        <span className="text-[10px] font-bold text-[#255d74]/40 uppercase tracking-widest mb-1">Target</span>
                        <span className="text-lg font-bold text-[#255d74]">{test.passing_score}%</span>
                    </div>
                </div>
            </div>

            {existingAttempt && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-[2rem] p-6 mb-8 flex items-start gap-4">
                    <AlertCircle className="w-6 h-6 text-yellow-600 shrink-0 mt-1" />
                    <div>
                        <h3 className="font-bold text-yellow-900 mb-1">Riwayat Test</h3>
                        <p className="text-yellow-800 text-sm">Anda terakhir kali mencapai skor <b>{existingAttempt.score}%</b> ({existingAttempt.level_result}).</p>
                    </div>
                </div>
            )}

            {!showForm ? (
                <div className="bg-white rounded-[2.5rem] p-8 md:p-12 shadow-sm border border-gray-100">
                    <h2 className="text-xl font-bold text-[#255d74] mb-6">Instruksi Pengerjaan</h2>
                    <div
                        className="prose prose-blue prose-sm max-w-none text-[#255d74]/80 font-medium"
                        dangerouslySetInnerHTML={{ __html: test.instructions || '<p>Jawablah setiap pertanyaan dengan teliti.</p>' }}
                    />
                    <button
                        onClick={() => setShowForm(true)}
                        className="w-full mt-10 bg-[#255d74] text-white py-4 rounded-2xl font-bold hover:bg-[#1e4a5f] transition-all shadow-xl shadow-[#255d74]/20 flex items-center justify-center gap-2"
                    >
                        <Play className="w-4 h-4 fill-current" />
                        Mulai Pre-Assessment
                    </button>
                </div>
            ) : (
                <div className="bg-white rounded-[2.5rem] p-8 md:p-12 shadow-sm border border-gray-100">
                    <h2 className="text-xl font-bold text-[#255d74] mb-2">Pre-Assessment</h2>
                    <p className="text-sm text-[#255d74]/40 mb-10 font-bold uppercase tracking-widest">Informasi Siswa</p>

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {[
                                { name: 'full_name', label: 'Nama Lengkap', type: 'text' },
                                { name: 'email', label: 'Email', type: 'email' },
                                { name: 'age', label: 'Usia', type: 'number' },
                            ].map(field => (
                                <div key={field.name}>
                                    <label className="block text-xs font-extrabold text-[#255d74]/60 uppercase tracking-widest mb-2">{field.label}</label>
                                    <input
                                        type={field.type}
                                        {...register(field.name as any, field.type === 'number' ? { valueAsNumber: true } : {})}
                                        className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-[#255d74]/20 text-[#255d74] font-bold shadow-xs"
                                    />
                                    {errors[field.name as keyof PreAssessmentFormData] && (
                                        <p className="mt-1 text-[10px] font-bold text-red-500 uppercase tracking-wide">{errors[field.name as keyof PreAssessmentFormData]?.message}</p>
                                    )}
                                </div>
                            ))}
                            <div>
                                <label className="block text-xs font-extrabold text-[#255d74]/60 uppercase tracking-widest mb-2">Jenjang Pendidikan</label>
                                <select
                                    disabled
                                    {...register('education_level')}
                                    className="w-full px-4 py-3 bg-gray-200 border-none rounded-xl text-[#255d74]/70 font-bold appearance-none cursor-not-allowed"
                                >
                                    <option value="sd_mi">SD/MI</option>
                                    <option value="smp_mts">SMP/MTs</option>
                                    <option value="sma_ma">SMA/MA</option>
                                    <option value="umum">Umum</option>
                                </select>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={startTestMutation.isPending}
                            className="w-full bg-[#255d74] text-white py-4 rounded-2xl font-bold hover:bg-[#1e4a5f] transition-all shadow-xl shadow-[#255d74]/20 flex items-center justify-center gap-2"
                        >
                            {startTestMutation.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : "Mulai Test Sekarang"}
                        </button>
                    </form>
                </div>
            )}
        </div>
    );
}
