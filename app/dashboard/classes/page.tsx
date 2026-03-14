"use client";

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { classesApi } from '@/lib/api';
import Link from 'next/link';
import { Clock, Users, Award, ArrowRight, Loader2, Filter, Search } from 'lucide-react';

export default function DashboardClassesListPage() {
    const [levelFilter, setLevelFilter] = useState<string>('all');
    const [searchQuery, setSearchQuery] = useState('');

    const { data, isLoading } = useQuery({
        queryKey: ['classes', levelFilter],
        queryFn: () => classesApi.list(levelFilter !== 'all' ? `level=${levelFilter}` : ''),
    });

    const classes = data?.data || [];

    const filteredClasses = classes.filter((c: any) => 
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.program_name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const levels = [
        { value: 'all', label: 'Semua Level' },
        { value: 'beginner', label: 'Pemula' },
        { value: 'elementary', label: 'Dasar' },
        { value: 'intermediate', label: 'Menengah' },
        { value: 'advanced', label: 'Lanjut' },
    ];

    const levelColors: Record<string, string> = {
        beginner: 'bg-blue-100 text-blue-600',
        elementary: 'bg-green-100 text-green-600',
        intermediate: 'bg-yellow-100 text-yellow-600',
        advanced: 'bg-purple-100 text-purple-600',
    };

    return (
        <div>
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-[#255d74] mb-2">Jelajahi Kelas</h1>
                <p className="text-[#255d74]/60">Temukan kelas AI & Robotika yang sesuai untuk level Anda</p>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-8">
                <div className="flex flex-col md:flex-row gap-6 justify-between items-center">
                    <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 w-full md:w-auto">
                        {levels.map((level) => (
                            <button
                                key={level.value}
                                onClick={() => setLevelFilter(level.value)}
                                className={`px-4 py-2 rounded-xl font-medium whitespace-nowrap transition-all ${levelFilter === level.value
                                        ? 'bg-[#255d74] text-white shadow-lg'
                                        : 'bg-gray-50 text-[#255d74]/60 hover:bg-gray-100'
                                    }`}
                            >
                                {level.label}
                            </button>
                        ))}
                    </div>

                    <div className="relative w-full md:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#255d74]/40" />
                        <input
                            type="text"
                            placeholder="Cari kelas..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-[#255d74]/20 transition-all text-[#255d74]"
                        />
                    </div>
                </div>
            </div>

            {isLoading ? (
                <div className="flex justify-center py-20">
                    <Loader2 className="w-12 h-12 animate-spin text-[#255d74]" />
                </div>
            ) : filteredClasses.length === 0 ? (
                <div className="bg-white rounded-2xl p-20 text-center border border-dashed border-gray-200">
                    <p className="text-[#255d74]/40 font-medium">Tidak ada kelas yang ditemukan.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {filteredClasses.map((classItem: any) => (
                        <div
                            key={classItem.id}
                            className="bg-white rounded-[2rem] overflow-hidden shadow-sm border border-gray-100 hover:shadow-xl transition-all group flex flex-col"
                        >
                            {classItem.image && (
                                <div className="relative h-48 bg-linear-to-br from-[#255d74]/10 to-secondary/10">
                                    <img
                                        src={classItem.image}
                                        alt={classItem.name}
                                        className="w-full h-full object-cover"
                                    />
                                    <div className="absolute top-4 right-4 flex gap-2">
                                        {classItem.is_featured && (
                                            <div className="px-3 py-1 bg-secondary text-white text-[10px] font-bold rounded-full uppercase tracking-wider">
                                                Featured
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            <div className="p-6 flex-1 flex flex-col">
                                <div className="flex items-center gap-2 mb-3">
                                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${levelColors[classItem.level] || 'bg-gray-100 text-gray-600'
                                        }`}>
                                        {classItem.level}
                                    </span>
                                    <span className="text-[10px] font-bold text-[#255d74]/40 uppercase tracking-wider">{classItem.program_name}</span>
                                </div>

                                <h3 className="text-lg font-bold text-[#255d74] mb-2 group-hover:text-secondary transition-colors line-clamp-1">
                                    {classItem.name}
                                </h3>
                                <p className="text-[#255d74]/60 text-sm mb-4 line-clamp-2">
                                    {classItem.description}
                                </p>

                                <div className="flex items-center gap-4 text-xs font-medium text-[#255d74]/60 mb-6 mt-auto">
                                    <div className="flex items-center gap-1.5">
                                        <Clock className="w-3.5 h-3.5" />
                                        <span>{classItem.duration_hours}h Belajar</span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <Users className="w-3.5 h-3.5" />
                                        <span>{classItem.capacity - classItem.enrolled_count} Slot Sisa</span>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                                    <div>
                                        <p className="text-[10px] font-bold text-[#255d74]/40 uppercase tracking-wider">Harga</p>
                                        <p className="text-lg font-bold text-[#255d74]">{classItem.price_formatted}</p>
                                    </div>
                                    <Link
                                        href={`/dashboard/classes/${classItem.slug}`}
                                        className="p-2.5 bg-[#255d74] text-white rounded-xl hover:bg-[#1e4a5f] transition-all flex items-center justify-center shadow-lg shadow-[#255d74]/20"
                                    >
                                        <ArrowRight className="w-5 h-5" />
                                    </Link>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
