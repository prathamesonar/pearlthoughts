"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Activity, ArrowRight, CheckCircle2, AlertCircle, ShieldCheck } from "lucide-react";
import mockData from "@/data/mockData.json";

export default function DoctorLogin() {
    const router = useRouter();
    const [doctorId, setDoctorId] = useState("");
    const [otp, setOtp] = useState("");
    const [step, setStep] = useState<1 | 2>(1);
    const [error, setError] = useState("");

    const handleSendOtp = (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        const doc = (mockData.doctors as any[]).find(d => d.id.toString() === doctorId);
        if (!doc) {
            setError("Doctor ID not found in system.");
            return;
        }
        setStep(2);
        // Auto-fill OTP for mock purposes
        setTimeout(() => setOtp(mockData.doctorAuth.otp), 500);
    };

    const handleVerify = (e: React.FormEvent) => {
        e.preventDefault();
        if (otp === mockData.doctorAuth.otp) {
            localStorage.setItem("doctorSessionId", doctorId);
            router.push("/doctor/dashboard");
        } else {
            setError("Invalid OTP code.");
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 font-sans relative overflow-hidden">

            {/* Background decoration */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-cyan-200/30 rounded-full blur-[100px] pointer-events-none"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-teal-200/30 rounded-full blur-[100px] pointer-events-none"></div>

            <div className="w-full max-w-md relative z-10 animate-in fade-in slide-in-from-bottom-8 duration-700">
                <div className="bg-white rounded-[2rem] shadow-xl p-8 border border-gray-100">

                    <div className="flex justify-center mb-8">
                        <div className="w-16 h-16 bg-cyan-50 rounded-2xl flex items-center justify-center shadow-inner relative">
                            <div className="absolute inset-0 bg-cyan-400/20 blur-xl rounded-2xl"></div>
                            <Activity className="w-8 h-8 text-cyan-600 relative z-10" />
                        </div>
                    </div>

                    <h1 className="text-2xl font-black text-center text-gray-900 mb-2">Provider Portal</h1>
                    <p className="text-center text-gray-500 font-medium mb-8">
                        {step === 1 ? "Sign in to manage your practice" : "Verify your identity"}
                    </p>

                    {error && (
                        <div className="mb-6 p-4 bg-rose-50 border border-rose-100 rounded-xl flex items-center gap-3 animate-in shake">
                            <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />
                            <p className="text-sm font-bold text-rose-600">{error}</p>
                        </div>
                    )}

                    {step === 1 ? (
                        <form onSubmit={handleSendOtp} className="space-y-6">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">Doctor ID</label>
                                <input
                                    type="text"
                                    required
                                    value={doctorId}
                                    onChange={(e) => setDoctorId(e.target.value)}
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 transition-all font-medium text-gray-900 outline-none placeholder:text-gray-400"
                                    placeholder="Enter your Provider ID (e.g. 1)"
                                />
                            </div>
                            <button
                                type="submit"
                                className="w-full py-4 bg-cyan-500 hover:bg-cyan-600 shadow-lg shadow-cyan-200 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2"
                            >
                                Continue <ArrowRight className="w-5 h-5" />
                            </button>
                        </form>
                    ) : (
                        <form onSubmit={handleVerify} className="space-y-6">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide flex justify-between">
                                    <span>Enter OTP</span>
                                    <span className="text-cyan-600 cursor-pointer" onClick={() => setStep(1)}>Change ID</span>
                                </label>
                                <div className="relative">
                                    <ShieldCheck className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                                    <input
                                        type="text"
                                        required
                                        value={otp}
                                        onChange={(e) => setOtp(e.target.value)}
                                        className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-black tracking-widest text-gray-900 outline-none text-center"
                                        placeholder="••••"
                                        maxLength={4}
                                    />
                                </div>
                                <p className="text-xs text-gray-500 mt-2 text-center font-medium">OTP has been auto-filled for testing</p>
                            </div>
                            <button
                                type="submit"
                                className="w-full py-4 bg-emerald-500 hover:bg-emerald-600 shadow-lg shadow-emerald-200 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2"
                            >
                                Verify &amp; Login <CheckCircle2 className="w-5 h-5" />
                            </button>
                        </form>
                    )}

                    <div className="mt-8 pt-6 border-t border-gray-100 text-center">
                        <p className="text-sm text-gray-500 font-medium">
                            Not a provider? <a href="/login" className="text-cyan-600 font-bold hover:underline">Patient Login</a>
                        </p>
                    </div>

                </div>
            </div>
        </div>
    );
}
