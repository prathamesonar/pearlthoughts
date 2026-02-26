"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Users, Calendar, Clock, Star, MapPin } from "lucide-react";
import { getLoggedInDoctor } from "../lib/data";
import type { DoctorUser } from "../lib/data";

interface Appointment {
    id: string;
    doctorId: string;
    doctorName: string;
    specialty: string;
    userEmail: string;
    userName?: string;
    userPhone?: string;
    userBirthdate?: string;
    date: string;
    timeSlot: string;
    status: string;
}

export default function DoctorDashboardPage() {
    const router = useRouter();
    const [doctor, setDoctor] = useState<DoctorUser | null>(null);
    const [mounted, setMounted] = useState(false);
    const [todayAppointments, setTodayAppointments] = useState<Appointment[]>([]);
    const [totalPatients, setTotalPatients] = useState(0);
    const [totalSlots, setTotalSlots] = useState(0);

    useEffect(() => {
        const d = getLoggedInDoctor();
        if (!d) { router.push("/login"); return; }
        setDoctor(d);

        // Get appointments for this doctor
        const raw = localStorage.getItem("schedula_appointments");
        if (raw) {
            const all: Appointment[] = JSON.parse(raw);
            const mine = all.filter((a) => a.doctorId === d.id || a.doctorName === d.name);
            const today = new Date().toISOString().split("T")[0];
            setTodayAppointments(mine.filter((a) => a.date.split("T")[0] === today && a.status !== "Cancelled"));
            setTotalPatients(new Set(mine.map((a) => a.userEmail)).size);
        }

        // Get slots count
        const slotsRaw = localStorage.getItem(`schedula_doctor_slots_${d.id}`);
        if (slotsRaw) {
            const slotsData = JSON.parse(slotsRaw);
            setTotalSlots(slotsData.length);
        }

        setMounted(true);
    }, [router]);

    const getGreeting = () => {
        const h = new Date().getHours();
        if (h < 12) return "Good morning";
        if (h < 17) return "Good afternoon";
        return "Good evening";
    };

    if (!mounted || !doctor) return null;

    const firstName = doctor.name.replace("Dr. ", "").split(" ")[0];

    const stats = [
        { icon: Users, value: totalPatients.toString(), label: "Total Patients", color: "text-blue-500", bg: "bg-blue-50" },
        { icon: Calendar, value: todayAppointments.length.toString(), label: "Today", color: "text-emerald-500", bg: "bg-emerald-50" },
        { icon: Clock, value: totalSlots.toString(), label: "Slot Configs", color: "text-amber-500", bg: "bg-amber-50" },
        { icon: Star, value: "5.0", label: "Rating", color: "text-purple-500", bg: "bg-purple-50" },
    ];

    return (
        <div className="space-y-6">
            {/* Welcome Card */}
            <div className="bg-gradient-to-r from-cyan-500 to-teal-500 rounded-2xl p-4 sm:p-6 text-white shadow-lg">
                <div className="flex items-center justify-between gap-2 sm:gap-4">
                    <div>
                        <p className="text-cyan-100 text-xs sm:text-sm font-medium">{getGreeting()},</p>
                        <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mt-0.5 sm:mt-1">
                            Hello, Dr. {firstName}! 🩺
                        </h2>
                        <p className="text-cyan-100 text-xs sm:text-sm mt-1.5 sm:mt-2 flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                            {doctor.location}
                        </p>
                    </div>
                    <div className="flex gap-2 sm:gap-4">
                        <div className="bg-white/20 backdrop-blur-sm rounded-xl px-3 py-2 sm:px-4 sm:py-3 text-center">
                            <p className="text-xl sm:text-2xl font-bold">{totalPatients}</p>
                            <p className="text-[10px] sm:text-xs text-cyan-100">Patients</p>
                        </div>
                        <div className="bg-white/20 backdrop-blur-sm rounded-xl px-3 py-2 sm:px-4 sm:py-3 text-center">
                            <p className="text-xl sm:text-2xl font-bold">{todayAppointments.length}</p>
                            <p className="text-[10px] sm:text-xs text-cyan-100">Today</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {stats.map((stat, i) => (
                    <div key={i} className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
                        <div className={`w-10 h-10 ${stat.bg} rounded-xl flex items-center justify-center mb-3`}>
                            <stat.icon className={`w-5 h-5 ${stat.color}`} />
                        </div>
                        <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{stat.label}</p>
                    </div>
                ))}
            </div>

            {/* Today's Appointments */}
            <div>
                <h3 className="text-lg font-bold text-gray-900 mb-3">Today&apos;s Appointments</h3>
                {todayAppointments.length === 0 ? (
                    <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center shadow-sm">
                        <Calendar className="w-12 h-12 text-gray-200 mx-auto mb-3" />
                        <p className="text-gray-500 font-medium">No appointments today</p>
                        <p className="text-gray-400 text-sm mt-1">Your schedule is clear!</p>
                    </div>
                ) : (
                    <div className="grid gap-3">
                        {todayAppointments.map((apt, index) => (
                            <div key={apt.id} className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm flex items-center justify-between gap-3">
                                <div className="flex items-center gap-3 min-w-0">
                                    <span className="text-sm font-bold text-gray-400 w-6 text-center flex-shrink-0">{index + 1}.</span>
                                    <div className="min-w-0">
                                        <p className="font-semibold text-gray-900 text-sm truncate">{apt.userName || apt.userEmail}</p>
                                        <p className="text-xs text-gray-400 truncate">{apt.userEmail}</p>
                                        <div className="flex flex-wrap items-center gap-2 mt-1">
                                            <span className="text-xs text-gray-500">{apt.timeSlot}</span>
                                            {apt.userPhone && (
                                                <span className="text-xs text-gray-400">📞 {apt.userPhone}</span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <span className="bg-emerald-100 text-emerald-600 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase flex-shrink-0">
                                    {apt.status === "Cancelled" ? "Cancelled" : "Booked"}
                                </span>
                            </div>
                        ))}
                    </div>)}
            </div>

            {/* Quick Actions */}
            <div>
                <h3 className="text-lg font-bold text-gray-900 mb-3">Quick Actions</h3>
                <div className="grid grid-cols-2 gap-3">
                    <button
                        onClick={() => router.push("/doctor-dashboard/slots")}
                        className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm hover:shadow-md transition text-left cursor-pointer group"
                    >
                        <Clock className="w-8 h-8 text-cyan-500 mb-2 group-hover:scale-110 transition-transform" />
                        <p className="font-semibold text-gray-900 text-sm">Manage Slots</p>
                        <p className="text-xs text-gray-500 mt-0.5">Create or edit time slots</p>
                    </button>
                    <button
                        onClick={() => router.push("/doctor-dashboard/appointments")}
                        className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm hover:shadow-md transition text-left cursor-pointer group"
                    >
                        <Calendar className="w-8 h-8 text-emerald-500 mb-2 group-hover:scale-110 transition-transform" />
                        <p className="font-semibold text-gray-900 text-sm">View Appointments</p>
                        <p className="text-xs text-gray-500 mt-0.5">See patient bookings</p>
                    </button>
                </div>
            </div>
        </div>
    );
}
