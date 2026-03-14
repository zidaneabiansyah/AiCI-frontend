"use client";

/**
 * Dashboard Placement Test Execution
 */

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { placementTestApi } from '@/lib/api';
import { useTimer } from '@/lib/hooks/use-timer';
import toast from 'react-hot-toast';
import { Clock, CheckCircle, AlertCircle, Loader2, Send } from 'lucide-react';
import Image from 'next/image';

export default function DashboardTestExecutionPage() {
    const params = useParams();
    const router = useRouter();
    const searchParams = useSearchParams();
    const queryClient = useQueryClient();

    const slug = params.slug as string;
    const attemptId = searchParams.get('attempt');

    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [selectedAnswer, setSelectedAnswer] = useState<string>('');
    const [questionStartTime, setQuestionStartTime] = useState(Date.now());

    // Fetch test attempt data - disable auto refetch to prevent timer reset
    const { data, isLoading, error } = useQuery({
        queryKey: ['test-attempt', attemptId],
        queryFn: () => placementTestApi.getAttempt(attemptId!),
        enabled: !!attemptId,
        refetchInterval: false,
        refetchOnWindowFocus: false,
        refetchOnMount: false,
        staleTime: Infinity, // Don't refetch automatically
    });

    const attempt = data?.data?.attempt;
    const test = data?.data?.test;
    const questions = data?.data?.questions || [];
    const progress = data?.data?.progress;
    const currentQuestion = questions[currentQuestionIndex];

    // Timer - use server-provided time remaining for accuracy
    // IMPORTANT: Only initialize timer when data is ready
    const serverTimeRemaining = data?.data?.attempt?.time_remaining_seconds;
    const expiresAt = attempt?.expires_at;
    
    // Only initialize timer when we have valid data
    const shouldInitializeTimer = !isLoading && serverTimeRemaining !== undefined && serverTimeRemaining > 0;
    
    const { formatTime, getPercentage, timeRemaining } = useTimer({
        expiresAt: expiresAt || new Date().toISOString(),
        initialTimeRemaining: serverTimeRemaining,
        enabled: shouldInitializeTimer,
        onExpire: () => {
            toast.error('Waktu habis! Test akan diselesaikan otomatis.');
            if (!isCompletingRef.current) {
                completeTestMutation.mutate();
            }
        },
    });

    // Submit answer mutation
    const submitAnswerMutation = useMutation({
        mutationFn: (answer: string) => {
            const timeSpent = Math.floor((Date.now() - questionStartTime) / 1000);
            return placementTestApi.submitAnswer(attemptId!, {
                test_question_id: currentQuestion.id,
                user_answer: answer,
                time_spent_seconds: timeSpent,
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['test-attempt', attemptId] });

            if (currentQuestionIndex < questions.length - 1) {
                setCurrentQuestionIndex(currentQuestionIndex + 1);
                setSelectedAnswer('');
                setQuestionStartTime(Date.now());
            } else {
                completeTestMutation.mutate();
            }
        },
        onError: (error: any) => {
            toast.error(error.message || 'Gagal menyimpan jawaban');
        },
    });

    // Complete test mutation - with guard to prevent double submission
    const isCompletingRef = useRef(false);
    const completeTestMutation = useMutation({
        mutationFn: () => {
            if (isCompletingRef.current) {
                return Promise.reject(new Error('Already completing'));
            }
            isCompletingRef.current = true;
            return placementTestApi.complete(attemptId!);
        },
        onSuccess: () => {
            toast.success('Test selesai! Melihat hasil...');
            router.push(`/dashboard/tests`);
        },
        onError: (error: any) => {
            if (error.message !== 'Already completing') {
                toast.error(error.message || 'Gagal menyelesaikan test');
            }
            isCompletingRef.current = false;
        },
    });

    const handleSubmitAnswer = () => {
        if (!selectedAnswer) {
            toast.error('Pilih jawaban terlebih dahulu');
            return;
        }
        submitAnswerMutation.mutate(selectedAnswer);
    };

    const handleSkip = () => {
        if (currentQuestionIndex < questions.length - 1) {
            setCurrentQuestionIndex(currentQuestionIndex + 1);
            setSelectedAnswer('');
            setQuestionStartTime(Date.now());
        }
    };

    useEffect(() => {
        if (currentQuestion?.is_answered && currentQuestion?.user_answer) {
            setSelectedAnswer(currentQuestion.user_answer);
        } else {
            setSelectedAnswer('');
        }
        setQuestionStartTime(Date.now());
    }, [currentQuestionIndex, currentQuestion]);

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center py-40">
                <Loader2 className="w-12 h-12 animate-spin text-[#255d74] mb-4" />
                <p className="text-[#255d74] font-bold animate-pulse">Menyiapkan Lembar Test...</p>
            </div>
        );
    }

    if (error || !attempt || !test) {
        return (
            <div className="text-center py-20">
                <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                <h1 className="text-2xl font-bold text-[#255d74] mb-4">Gagal Memuat Test</h1>
                <button
                    onClick={() => router.push(`/dashboard/tests/available/${slug}`)}
                    className="bg-[#255d74] text-white px-6 py-2 rounded-xl font-bold shadow-lg"
                >
                    Coba Lagi
                </button>
            </div>
        );
    }

    const timerPercentage = getPercentage(test.duration_minutes * 60);
    const isTimeCritical = timerPercentage < 20;

    return (
        <div className="max-w-4xl mx-auto">
            {/* Header / Info Panel */}
            <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-gray-100 mb-8 sticky top-0 z-10">
                <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                    <div>
                        <h1 className="text-lg font-bold text-[#255d74]">{test.title}</h1>
                        <p className="text-sm text-[#255d74]/60">
                            Soal {currentQuestionIndex + 1} dari {questions.length}
                        </p>
                    </div>

                    <div className={`flex items-center gap-3 px-4 py-2 rounded-xl ${isTimeCritical ? 'bg-red-50 text-red-600' : 'bg-[#255d74]/5 text-[#255d74]'}`}>
                        <Clock className={`w-5 h-5 ${isTimeCritical ? 'animate-pulse' : ''}`} />
                        <span className="font-bold text-lg">
                            {shouldInitializeTimer ? formatTime() : '--:--'}
                        </span>
                    </div>
                </div>

                <div className="mt-4">
                    <div className="flex items-center justify-between text-[10px] font-bold text-[#255d74]/40 uppercase tracking-widest mb-2">
                        <span>Progres Pengerjaan</span>
                        <span>{progress?.percentage.toFixed(0)}%</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-linear-to-r from-[#255d74] to-secondary transition-all duration-300"
                            style={{ width: `${progress?.percentage || 0}%` }}
                        />
                    </div>
                </div>
            </div>

            {/* Question Content */}
            <div className="bg-white rounded-[2.5rem] p-8 md:p-12 shadow-sm border border-gray-100 mb-8">
                <div className="inline-block px-4 py-2 bg-[#255d74]/5 text-[#255d74] rounded-xl font-bold text-xs mb-6 uppercase tracking-wider">
                    Pertanyaan {currentQuestionIndex + 1}
                </div>

                <h2 className="text-2xl font-bold text-[#255d74] mb-8 leading-relaxed">
                    {currentQuestion?.question}
                </h2>

                {currentQuestion?.image && (
                    <div className="relative w-full h-64 mb-10 rounded-2xl overflow-hidden border border-gray-100">
                        <Image
                            src={currentQuestion.image}
                            alt="Question illustration"
                            fill
                            className="object-contain"
                            sizes="(max-width: 768px) 100vw, 768px"
                        />
                    </div>
                )}

                <div className="space-y-4 mb-10">
                    {currentQuestion?.type === 'multiple_choice' && currentQuestion?.options?.map((option: string, index: number) => (
                        <button
                            key={index}
                            onClick={() => setSelectedAnswer(option)}
                            disabled={currentQuestion.is_answered || submitAnswerMutation.isPending}
                            className={`w-full text-left p-6 rounded-2xl border-2 transition-all ${selectedAnswer === option
                                ? 'border-[#255d74] bg-[#255d74]/5'
                                : 'border-gray-50 bg-gray-50/50 hover:border-[#255d74]/30'
                            } ${currentQuestion.is_answered ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}
                        >
                            <div className="flex items-center gap-4">
                                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${selectedAnswer === option
                                    ? 'border-[#255d74] bg-[#255d74]'
                                    : 'border-gray-300'
                                }`}>
                                    {selectedAnswer === option && (
                                        <CheckCircle className="w-3.5 h-3.5 text-white" />
                                    )}
                                </div>
                                <span className="flex-1 font-bold text-[#255d74]">{option}</span>
                            </div>
                        </button>
                    ))}

                    {currentQuestion?.type === 'essay' && (
                        <textarea
                            value={selectedAnswer}
                            onChange={(e) => setSelectedAnswer(e.target.value)}
                            disabled={currentQuestion.is_answered || submitAnswerMutation.isPending}
                            className="w-full p-6 rounded-2xl border-2 border-gray-100 focus:border-[#255d74] focus:outline-none resize-none bg-gray-50/50"
                            rows={6}
                            placeholder="Tulis jawaban Anda di sini..."
                        />
                    )}

                    {currentQuestion?.type === 'true_false' && (
                        <div className="grid grid-cols-2 gap-4">
                            {['true', 'false'].map((val) => (
                                <button
                                    key={val}
                                    onClick={() => setSelectedAnswer(val)}
                                    disabled={currentQuestion.is_answered || submitAnswerMutation.isPending}
                                    className={`text-left p-6 rounded-2xl border-2 transition-all ${selectedAnswer === val
                                        ? 'border-[#255d74] bg-[#255d74]/5'
                                        : 'border-gray-50 bg-gray-50/50 hover:border-[#255d74]/30'
                                    }`}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${selectedAnswer === val ? 'border-[#255d74] bg-[#255d74]' : 'border-gray-300'}`}>
                                            {selectedAnswer === val && <CheckCircle className="w-3.5 h-3.5 text-white" />}
                                        </div>
                                        <span className="font-bold text-[#255d74] text-lg uppercase tracking-wider">{val === 'true' ? 'Benar' : 'Salah'}</span>
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                <div className="flex gap-4">
                    {!currentQuestion?.is_answered && currentQuestionIndex < questions.length - 1 && (
                        <button
                            onClick={handleSkip}
                            disabled={submitAnswerMutation.isPending}
                            className="flex-1 border-2 border-gray-100 text-[#255d74] py-4 rounded-2xl font-bold hover:bg-gray-50 transition-all uppercase tracking-widest text-xs"
                        >
                            Lewati
                        </button>
                    )}

                    {!currentQuestion?.is_answered ? (
                        <button
                            onClick={handleSubmitAnswer}
                            disabled={!selectedAnswer || submitAnswerMutation.isPending}
                            className="flex-2 bg-[#255d74] text-white py-4 rounded-2xl font-bold hover:bg-[#1e4a5f] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-xl shadow-[#255d74]/20 uppercase tracking-widest text-xs"
                        >
                            {submitAnswerMutation.isPending ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : currentQuestionIndex === questions.length - 1 ? (
                                "Selesaikan Test"
                            ) : (
                                "Kirim Jawaban"
                            )}
                        </button>
                    ) : (
                        <button
                            onClick={() => {
                                if (currentQuestionIndex < questions.length - 1) {
                                    setCurrentQuestionIndex(currentQuestionIndex + 1);
                                } else {
                                    completeTestMutation.mutate();
                                }
                            }}
                            className="flex-1 bg-secondary text-white py-4 rounded-2xl font-bold hover:bg-[#e63c1e] transition-all flex items-center justify-center gap-2 uppercase tracking-widest text-xs"
                        >
                            {currentQuestionIndex === questions.length - 1 ? 'Lihat Hasil' : 'Soal Berikutnya'}
                        </button>
                    )}
                </div>
            </div>

            {/* Question Navigator */}
            <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-gray-100">
                <h3 className="text-xs font-bold text-[#255d74]/40 mb-6 uppercase tracking-widest">Navigasi Soal</h3>
                <div className="flex flex-wrap gap-3">
                    {questions.map((q: any, index: number) => (
                        <button
                            key={index}
                            onClick={() => setCurrentQuestionIndex(index)}
                            className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold transition-all ${index === currentQuestionIndex
                                ? 'bg-[#255d74] text-white shadow-lg'
                                : q.is_answered
                                    ? 'bg-green-50 text-green-600 hover:bg-green-100 border border-green-100'
                                    : 'bg-gray-50 text-[#255d74]/40 hover:bg-gray-100'
                            }`}
                        >
                            {index + 1}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}
