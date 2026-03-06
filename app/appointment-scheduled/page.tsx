"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CheckCircle2, Calendar, Clock, MapPin, User, ArrowRight } from "lucide-react";

function AppointmentScheduledContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
    }, []);

    if (!isClient) return null;

    const aptId = searchParams.get("id");
    const docName = searchParams.get("docName");
    const dateStr = searchParams.get("date");
    const timeStr = searchParams.get("time");

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4 font-sans">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-cyan-100 via-gray-50 to-gray-50 -z-10"></div>

            <div className="w-full max-w-md animate-in slide-in-from-bottom-8 duration-700">
                <div className="bg-white rounded-[2rem] shadow-xl shadow-cyan-900/5 p-8 border border-gray-100 text-center relative overflow-hidden">

                    {/* Success Checkmark */}
                    <div className="w-24 h-24 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-6 relative">
                        <div className="absolute inset-0 bg-emerald-100 rounded-full animate-ping opacity-50"></div>
                        <CheckCircle2 className="w-12 h-12 text-emerald-500 relative z-10" />
                    </div>

                    <h1 className="text-3xl font-black text-gray-900 mb-2">Booking Confirmed!</h1>
                    <p className="text-gray-500 mb-8 font-medium">Your appointment has been successfully scheduled. We&apos;ve sent a confirmation to your email.</p>

                    <div className="bg-gray-50 rounded-2xl p-5 mb-8 text-left space-y-4 border border-gray-100">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-cyan-50 flex items-center justify-center flex-shrink-0">
                                <User className="w-5 h-5 text-cyan-600" />
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Doctor</p>
                                <p className="font-bold text-gray-900">{docName || "Doctor"}</p>
                            </div>
                        </div>

                        <div className="w-full h-px bg-gray-200"></div>

                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-cyan-50 flex items-center justify-center flex-shrink-0">
                                <Calendar className="w-5 h-5 text-cyan-600" />
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Date</p>
                                <p className="font-bold text-gray-900">{dateStr || "N/A"}</p>
                            </div>
                        </div>

                        <div className="w-full h-px bg-gray-200"></div>

                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-cyan-50 flex items-center justify-center flex-shrink-0">
                                <Clock className="w-5 h-5 text-cyan-600" />
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Time</p>
                                <p className="font-bold text-gray-900">{timeStr || "N/A"}</p>
                            </div>
                        </div>

                        <div className="w-full h-px bg-gray-200"></div>

                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-cyan-50 flex items-center justify-center flex-shrink-0">
                                <MapPin className="w-5 h-5 text-cyan-600" />
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Appointment ID</p>
                                <p className="font-bold text-gray-900">#{aptId || Math.floor(Math.random() * 10000)}</p>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <button
                            onClick={() => router.push("/appointments")}
                            className="w-full py-4 bg-cyan-500 hover:bg-cyan-600 shadow-lg shadow-cyan-200 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2 hover:-translate-y-0.5"
                        >
                            View My Appointments <ArrowRight className="w-5 h-5" />
                        </button>
                        <button
                            onClick={() => router.push("/home")}
                            className="w-full py-4 bg-white border-2 border-gray-100 hover:border-gray-200 text-gray-600 font-bold rounded-xl transition-all"
                        >
                            Back to Home
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function AppointmentScheduled() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-gray-50 flex items-center justify-center font-sans">Loading...</div>}>
            <AppointmentScheduledContent />
        </Suspense>
    );
}
