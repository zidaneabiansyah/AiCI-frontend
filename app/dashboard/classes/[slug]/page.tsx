"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { classesApi, enrollmentsApi } from "@/lib/api";
import { useAuth } from "@/lib/hooks/use-auth";
import toast from "react-hot-toast";
import {
    Clock,
    Users,
    Award,
    Calendar,
    MapPin,
    Loader2,
    CheckCircle,
    AlertCircle,
    ChevronLeft,
} from "lucide-react";

const enrollmentSchema = z.object({
    schedule_id: z.string().min(1, "Pilih jadwal"),
    student_name: z.string().min(3, "Nama minimal 3 karakter"),
    student_email: z.string().email("Email tidak valid"),
    student_phone: z.string().min(10, "Nomor telepon tidak valid"),
    student_age: z.number().min(5, "Usia minimal 5 tahun"),
    student_grade: z.string().optional(),
    parent_name: z.string().optional(),
    parent_phone: z.string().optional(),
    parent_email: z
        .string()
        .email("Email tidak valid")
        .optional()
        .or(z.literal("")),
    special_requirements: z.string().optional(),
});

type EnrollmentFormData = z.infer<typeof enrollmentSchema>;

export default function DashboardClassDetailPage() {
    const params = useParams();
    const router = useRouter();
    const { user, isAuthenticated } = useAuth();
    const [showEnrollmentForm, setShowEnrollmentForm] = useState(false);

    const slug = params.slug as string;

    const { data: classData, isLoading } = useQuery({
        queryKey: ["class", slug],
        queryFn: () => classesApi.show(slug),
    });

    const { data: enrollmentData } = useQuery({
        queryKey: ["enrollment-form", classData?.data?.id],
        queryFn: () => enrollmentsApi.create(classData?.data?.id),
        enabled: !!classData?.data?.id && showEnrollmentForm,
    });

    const classItem = classData?.data;
    const schedules = enrollmentData?.data?.schedules || [];

    const enrollMutation = useMutation({
        mutationFn: (data: EnrollmentFormData) => {
            const payload = {
                ...data,
                class_id: classItem.id,
            };
            return enrollmentsApi.store(payload);
        },
        onSuccess: (response) => {
            toast.success("Pendaftaran berhasil!");
            router.push(`/dashboard/enrollments`);
        },
        onError: (error: any) => {
            toast.error(error.message || "Pendaftaran gagal");
        },
    });

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<EnrollmentFormData>({
        resolver: zodResolver(enrollmentSchema),
        defaultValues: {
            student_name: user?.name || "",
            student_email: user?.email || "",
            student_age: 0,
        },
    });

    const onSubmit = (data: EnrollmentFormData) => {
        enrollMutation.mutate(data);
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-20">
                <Loader2 className="w-12 h-12 animate-spin text-[#255d74]" />
            </div>
        );
    }

    if (!classItem) {
        return (
            <div className="text-center py-20">
                <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                <h1 className="text-2xl font-bold text-[#255d74] mb-2">
                    Kelas Tidak Ditemukan
                </h1>
                <button onClick={() => router.back()} className="text-[#255d74] font-bold hover:underline">Kembali</button>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto">
            <button
                onClick={() => showEnrollmentForm ? setShowEnrollmentForm(false) : router.back()}
                className="flex items-center gap-2 text-[#255d74]/60 font-bold hover:text-[#255d74] transition-all mb-8"
            >
                <ChevronLeft className="w-5 h-5" />
                {showEnrollmentForm ? "Batal Mendaftar" : "Kembali ke Daftar Kelas"}
            </button>

            {!showEnrollmentForm ? (
                <>
                    <div className="bg-white rounded-[2.5rem] p-10 shadow-sm border border-gray-100 mb-8 overflow-hidden">
                        <div className="flex flex-col md:flex-row gap-8">
                            {classItem.image && (
                                <div className="w-full md:w-48 h-48 rounded-3xl overflow-hidden shrink-0">
                                    <img src={classItem.image} alt={classItem.name} className="w-full h-full object-cover" />
                                </div>
                            )}
                            <div className="flex-1">
                                <span className="inline-block px-3 py-1 bg-secondary/10 text-secondary text-[10px] font-bold rounded-full mb-3 uppercase tracking-wider">
                                    {classItem.program_name}
                                </span>
                                <h1 className="text-3xl font-bold text-[#255d74] mb-4">
                                    {classItem.name}
                                </h1>
                                <p className="text-[#255d74]/60 leading-relaxed font-medium">
                                    {classItem.description}
                                </p>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-10">
                            {[
                                { icon: Clock, label: "Durasi", value: `${classItem.duration_hours}h` },
                                { icon: Users, label: "Kapasitas", value: classItem.capacity },
                                { icon: Award, label: "Level", value: classItem.level },
                                { icon: "💰", label: "Harga", value: classItem.price_formatted },
                            ].map((stat, i) => (
                                <div key={i} className="flex flex-col items-center p-4 bg-gray-50 rounded-2xl">
                                    {typeof stat.icon === 'string' ? <span className="text-2xl mb-2">{stat.icon}</span> : <stat.icon className="w-5 h-5 text-[#255d74]/40 mb-2" />}
                                    <span className="text-[10px] font-bold text-[#255d74]/40 uppercase tracking-wider">{stat.label}</span>
                                    <span className="font-bold text-[#255d74]">{stat.value}</span>
                                </div>
                            ))}
                        </div>

                        <button
                            onClick={() => setShowEnrollmentForm(true)}
                            className="w-full mt-10 bg-[#255d74] text-white py-4 rounded-2xl font-bold hover:bg-[#1e4a5f] transition-all shadow-xl shadow-[#255d74]/20"
                        >
                            Daftar Kelas Ini
                        </button>
                    </div>

                    {classItem.curriculum && classItem.curriculum.length > 0 && (
                        <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-gray-100 mb-8">
                            <h2 className="text-xl font-bold text-[#255d74] mb-6">Materi Pembelajaran</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {classItem.curriculum.map((item: string, index: number) => (
                                    <div key={index} className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl">
                                        <CheckCircle className="w-5 h-5 text-green-500 shrink-0" />
                                        <span className="text-sm font-bold text-[#255d74]/80">{item}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </>
            ) : (
                <div className="bg-white rounded-[2.5rem] p-10 shadow-sm border border-gray-100">
                    <h2 className="text-2xl font-bold text-[#255d74] mb-2">Form Pendaftaran</h2>
                    <p className="text-[#255d74]/60 mb-10">Konfirmasi jadwal dan lengkapi data siswa</p>

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                        <div>
                            <label className="block text-sm font-bold text-[#255d74] mb-4 uppercase tracking-wider">Pilih Jadwal</label>
                            <div className="grid grid-cols-1 gap-4">
                                {schedules.map((schedule: any) => (
                                    <label
                                        key={schedule.id}
                                        className={`flex items-start gap-4 p-5 rounded-2xl border-2 cursor-pointer transition-all ${
                                            register("schedule_id") ? 'hover:border-[#255d74]/50' : ''
                                        }`}
                                    >
                                        <input
                                            type="radio"
                                            value={schedule.id}
                                            {...register("schedule_id")}
                                            className="mt-1"
                                        />
                                        <div className="flex-1">
                                            <p className="font-bold text-[#255d74]">{schedule.batch_name}</p>
                                            <div className="flex flex-wrap gap-4 text-xs text-[#255d74]/60 mt-2 font-medium">
                                                <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" />{schedule.start_date}</span>
                                                <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" />{schedule.time}</span>
                                                <span className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" />{schedule.location}</span>
                                            </div>
                                            <p className="text-[10px] font-bold text-green-600 mt-2 uppercase tracking-wide">{schedule.remaining_slots} slot tersisa</p>
                                        </div>
                                    </label>
                                ))}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-gray-100">
                            {[
                                { name: "student_name", label: "Nama Siswa", type: "text" },
                                { name: "student_email", label: "Email Siswa", type: "email" },
                                { name: "student_phone", label: "No. Telepon Siswa", type: "tel" },
                                { name: "student_age", label: "Usia Siswa", type: "number" },
                            ].map((field) => (
                                <div key={field.name}>
                                    <label className="block text-xs font-bold text-[#255d74]/60 uppercase tracking-widest mb-2">{field.label}</label>
                                    <input
                                        type={field.type}
                                        {...register(field.name as any, field.type === 'number' ? { valueAsNumber: true } : {})}
                                        className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-[#255d74]/20 text-[#255d74] font-bold"
                                    />
                                    {errors[field.name as keyof EnrollmentFormData] && (
                                        <p className="mt-1 text-[10px] font-bold text-red-500 uppercase tracking-wide">
                                            {errors[field.name as keyof EnrollmentFormData]?.message}
                                        </p>
                                    )}
                                </div>
                            ))}
                        </div>

                        <button
                            type="submit"
                            disabled={enrollMutation.isPending}
                            className="w-full bg-[#255d74] text-white py-4 rounded-2xl font-bold hover:bg-[#1e4a5f] transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-xl shadow-[#255d74]/20"
                        >
                            {enrollMutation.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : "Selesaikan Pendaftaran"}
                        </button>
                    </form>
                </div>
            )}
        </div>
    );
}
