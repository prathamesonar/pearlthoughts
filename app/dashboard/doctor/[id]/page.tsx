"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import {
    ArrowLeft,
    Users,
    Clock,
    Star,
    MessageSquare,
    Calendar,
} from "lucide-react";
import Swal from "sweetalert2";
import { doctors, getLoggedInUser } from "../../../lib/data";
import type { Doctor } from "../../../lib/data";

export default function DoctorDetailPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = use(params);
    const router = useRouter();
    const [doctor, setDoctor] = useState<Doctor | null>(null);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        const u = getLoggedInUser();
        if (!u) {
            router.push("/");
            return;
        }
        const found = doctors.find((d) => d.id === id);
        if (!found) {
            router.push("/dashboard");
            return;
        }
        setDoctor(found);
        setMounted(true);
    }, [id, router]);

    const handleBookAppointment = () => {
        const user = getLoggedInUser();
        if (!user || !doctor) return;

        // Save appointment in localStorage
        const raw = localStorage.getItem("schedula_appointments");
        const appointments = raw ? JSON.parse(raw) : [];
        const newAppointment = {
            id: Date.now().toString(),
            doctorId: doctor.id,
            doctorName: doctor.name,
            specialty: doctor.specialty,
            userEmail: user.email,
            date: new Date().toISOString(),
            status: "upcoming",
        };
        appointments.push(newAppointment);
        localStorage.setItem(
            "schedula_appointments",
            JSON.stringify(appointments)
        );

        Swal.fire({
            icon: "success",
            title: "Appointment Booked!",
            html: `Your appointment with <strong>${doctor.name}</strong> has been successfully scheduled.`,
            confirmButtonColor: "#22d3ee",
        });
    };

    if (!mounted || !doctor) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center">
                <div className="animate-pulse text-gray-400">Loading...</div>
            </div>
        );
    }

    const stats = [
        { icon: Users, value: doctor.patients, label: "patients" },
        { icon: Clock, value: `${doctor.experience} years exper..`, label: "" },
        { icon: Star, value: doctor.rating.toString(), label: "rating" },
        {
            icon: MessageSquare,
            value: doctor.reviews.toLocaleString(),
            label: "reviews",
        },
    ];

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            {/* Back Button */}
            <button
                onClick={() => router.back()}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 
          transition font-medium text-sm cursor-pointer"
            >
                <ArrowLeft className="w-5 h-5" />
                Back
            </button>

            {/* Doctor Card */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                <div className="flex gap-5">
                    <img
                        src={doctor.imageUrl}
                        alt={doctor.name}
                        className="w-24 h-24 md:w-28 md:h-28 rounded-2xl object-cover shadow-md"
                    />
                    <div className="flex-1">
                        <h2 className="text-xl md:text-2xl font-bold text-gray-900">
                            {doctor.name}
                        </h2>
                        <p className="text-cyan-500 font-medium mt-0.5">
                            {doctor.specialty}
                        </p>
                        <p className="text-emerald-500 text-sm font-medium mt-1">
                            🎓 {doctor.qualification}
                        </p>
                        <p className="text-gray-400 text-xs mt-1">
                            Fellow of Sanskara Netralaya, Chennai
                        </p>
                    </div>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-4 gap-3">
                {stats.map((stat, i) => (
                    <div
                        key={i}
                        className="bg-white rounded-xl border border-gray-100 p-3 text-center shadow-sm"
                    >
                        <stat.icon className="w-5 h-5 text-cyan-500 mx-auto mb-1.5" />
                        <p className="text-sm font-bold text-gray-900">{stat.value}</p>
                        <p className="text-xs text-gray-400">{stat.label}</p>
                    </div>
                ))}
            </div>

            {/* About Doctor */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm space-y-4">
                <h3 className="text-base font-bold text-gray-900">About Doctor</h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                    {doctor.about}
                </p>
            </div>

            {/* Services & Specialization */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm space-y-4">
                <h3 className="text-base font-bold text-gray-900">
                    Service & Specialization
                </h3>
                <div className="space-y-3">
                    {doctor.services.map((s, i) => (
                        <div
                            key={i}
                            className="flex items-center justify-between text-sm"
                        >
                            <span className="text-gray-500">{s.service}</span>
                            <span className="font-medium text-gray-900">{s.value}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Availability */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm space-y-4">
                <h3 className="text-base font-bold text-gray-900">
                    Availability For Consulting
                </h3>
                <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">{doctor.availableDays}</span>
                    <span className="font-medium text-gray-900">{doctor.timings}</span>
                </div>
            </div>

            {/* Book Appointment CTA */}
            <button
                onClick={handleBookAppointment}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-cyan-500 to-teal-500 
          text-white font-bold text-base shadow-lg hover:shadow-xl 
          hover:-translate-y-0.5 transition-all duration-200
          flex items-center justify-center gap-2 cursor-pointer"
            >
                <Calendar className="w-5 h-5" />
                Book Appointment
            </button>
        </div>
    );
}
