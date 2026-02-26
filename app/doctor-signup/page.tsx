"use client";

import { useState } from "react";
import { Eye, EyeOff, Stethoscope, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";
import Link from "next/link";

const SPECIALTIES = [
    "General Physician",
    "Cardiologist",
    "Dermatologist",
    "Pediatrician",
    "Orthopedic Surgeon",
    "Gynecologist",
    "ENT Specialist",
    "Ophthalmologist",
    "Psychiatrist",
    "Neurologist",
    "Dentist",
    "Urologist",
    "Pulmonologist",
    "Gastroenterologist",
];

const AVAILABLE_DAYS_OPTIONS = [
    "Monday to Friday",
    "Monday to Saturday",
    "Tuesday to Saturday",
    "All Days",
];

export default function DoctorSignupPage() {
    const router = useRouter();
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const handleSignup = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const form = e.target as HTMLFormElement;
        const data = new FormData(form);
        const fullname = data.get("fullname") as string;
        const email = data.get("email") as string;
        const phone = data.get("phone") as string;
        const password = data.get("password") as string;
        const confirmPassword = data.get("confirmPassword") as string;
        const specialty = data.get("specialty") as string;
        const qualification = data.get("qualification") as string;
        const experience = data.get("experience") as string;
        const availableDays = data.get("availableDays") as string;
        const timings = data.get("timings") as string;
        const about = data.get("about") as string;

        if (!fullname || !email || !phone || !password || !confirmPassword || !specialty || !qualification) {
            Swal.fire({ icon: "error", title: "All fields are required", confirmButtonColor: "#22d3ee" });
            return;
        }

        if (password !== confirmPassword) {
            Swal.fire({ icon: "error", title: "Passwords do not match", confirmButtonColor: "#22d3ee" });
            return;
        }

        sessionStorage.setItem(
            "schedula_pending_doctor",
            JSON.stringify({
                id: `doc_${Date.now()}`,
                name: fullname.startsWith("Dr.") ? fullname : `Dr. ${fullname}`,
                email,
                phone,
                password,
                specialty,
                qualification,
                experience: experience || "1+",
                about: about || `Experienced ${specialty} providing quality healthcare.`,
                timings: timings || "09:00 AM - 05:00 PM",
                availableDays: availableDays || "Monday to Friday",
                imageUrl: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&q=80&w=300",
                location: "India",
            })
        );

        router.push(`/otp-verification?phone=${phone}&role=doctor`);
    };

    return (
        <div className="relative min-h-screen flex items-center justify-center px-4 overflow-hidden font-sans">
            <div className="absolute inset-0 z-0">
                <img
                    src="https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&q=80&w=2070"
                    alt="Medical Background"
                    className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-cyan-900/40 backdrop-blur-sm mix-blend-multiply" />
                <div className="absolute inset-0 bg-gradient-to-t from-cyan-900/60 to-transparent" />
            </div>

            <div className="relative w-full max-w-lg p-6 sm:p-8 md:p-10 rounded-3xl bg-white/95 backdrop-blur-sm shadow-2xl border border-white/50 z-10 my-8">
                <Link
                    href="/login"
                    className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-cyan-600 transition-colors mb-5 group"
                >
                    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
                    Back to Login
                </Link>

                <div className="flex items-center justify-center gap-2 mb-6">
                    <Stethoscope className="w-8 h-8 text-cyan-500" />
                    <span className="text-2xl font-bold text-gray-900">Schedula</span>
                    <span className="text-xs text-cyan-500 font-medium bg-cyan-50 px-2 py-0.5 rounded-full">Healthcare</span>
                </div>

                <h2 className="text-2xl font-bold text-gray-900 text-center mb-1">Doctor Registration</h2>
                <p className="text-gray-500 text-center mb-6 text-sm">Create your doctor account to manage appointments</p>

                <form className="space-y-4" onSubmit={handleSignup}>
                    {/* Row 1: Name + Email */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <input type="text" name="fullname" placeholder="Full Name (e.g. Dr. John)" required
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50/50 focus:ring-2 focus:ring-cyan-500 focus:border-transparent focus:outline-none placeholder-gray-400 text-gray-900 transition" />
                        <input type="email" name="email" placeholder="Email address" required
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50/50 focus:ring-2 focus:ring-cyan-500 focus:border-transparent focus:outline-none placeholder-gray-400 text-gray-900 transition" />
                    </div>

                    {/* Row 2: Phone + Specialty */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <input type="tel" name="phone" placeholder="Phone number" required
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50/50 focus:ring-2 focus:ring-cyan-500 focus:border-transparent focus:outline-none placeholder-gray-400 text-gray-900 transition" />
                        <select name="specialty" required
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50/50 focus:ring-2 focus:ring-cyan-500 focus:border-transparent focus:outline-none text-gray-900 transition appearance-none cursor-pointer">
                            <option value="">Select Specialty</option>
                            {SPECIALTIES.map((s) => (
                                <option key={s} value={s}>{s}</option>
                            ))}
                        </select>
                    </div>

                    {/* Row 3: Qualification + Experience */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <input type="text" name="qualification" placeholder="Qualification (e.g. MBBS, MD)" required
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50/50 focus:ring-2 focus:ring-cyan-500 focus:border-transparent focus:outline-none placeholder-gray-400 text-gray-900 transition" />
                        <input type="text" name="experience" placeholder="Experience (e.g. 5+)"
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50/50 focus:ring-2 focus:ring-cyan-500 focus:border-transparent focus:outline-none placeholder-gray-400 text-gray-900 transition" />
                    </div>

                    {/* Row 4: Available Days + Timings */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <select name="availableDays"
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50/50 focus:ring-2 focus:ring-cyan-500 focus:border-transparent focus:outline-none text-gray-900 transition appearance-none cursor-pointer">
                            {AVAILABLE_DAYS_OPTIONS.map((d) => (
                                <option key={d} value={d}>{d}</option>
                            ))}
                        </select>
                        <input type="text" name="timings" placeholder="Timings (e.g. 09:00 AM - 05:00 PM)"
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50/50 focus:ring-2 focus:ring-cyan-500 focus:border-transparent focus:outline-none placeholder-gray-400 text-gray-900 transition" />
                    </div>

                    {/* About */}
                    <textarea name="about" placeholder="About yourself (optional)" rows={3}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50/50 focus:ring-2 focus:ring-cyan-500 focus:border-transparent focus:outline-none placeholder-gray-400 text-gray-900 transition resize-none" />

                    {/* Passwords */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="relative">
                            <input type={showPassword ? "text" : "password"} name="password" placeholder="Password" required
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50/50 focus:ring-2 focus:ring-cyan-500 focus:border-transparent focus:outline-none placeholder-gray-400 text-gray-900 transition pr-10" />
                            <button type="button" onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-3 text-gray-400 hover:text-gray-600 transition-colors">
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                        <div className="relative">
                            <input type={showConfirmPassword ? "text" : "password"} name="confirmPassword" placeholder="Confirm Password" required
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50/50 focus:ring-2 focus:ring-cyan-500 focus:border-transparent focus:outline-none placeholder-gray-400 text-gray-900 transition pr-10" />
                            <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                className="absolute right-3 top-3 text-gray-400 hover:text-gray-600 transition-colors">
                                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </div>

                    <button type="submit"
                        className="w-full py-3.5 rounded-xl bg-cyan-500 text-white font-bold hover:bg-cyan-600 hover:-translate-y-0.5 transition transform duration-200 shadow-lg cursor-pointer">
                        Register as Doctor
                    </button>
                </form>

                <p className="text-center text-gray-600 text-sm mt-6">
                    Already have an account?{" "}
                    <Link href="/login" className="font-bold text-cyan-500 hover:text-cyan-600 hover:underline transition-colors">
                        Login
                    </Link>
                </p>
            </div>
        </div>
    );
}
