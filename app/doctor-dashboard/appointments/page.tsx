"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Calendar, Clock, Phone, User as UserIcon, Cake, PlayCircle, CheckCircle2, XCircle, AlertTriangle } from "lucide-react";
import { getLoggedInDoctor, getUserByEmail } from "../../lib/data";
import type { DoctorUser } from "../../lib/data";

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

type FilterTab = "All" | "Booked" | "In Progress" | "Completed" | "Cancelled" | "No Show";

const STATUS_CONFIG: Record<string, { label: string; bg: string; text: string; dot: string }> = {
    upcoming: { label: "Booked", bg: "bg-blue-50", text: "text-blue-600", dot: "bg-blue-500" },
    "in-progress": { label: "In Progress", bg: "bg-amber-50", text: "text-amber-600", dot: "bg-amber-500" },
    completed: { label: "Completed", bg: "bg-emerald-50", text: "text-emerald-600", dot: "bg-emerald-500" },
    Cancelled: { label: "Cancelled", bg: "bg-red-50", text: "text-red-500", dot: "bg-red-500" },
    "no-show": { label: "No Show", bg: "bg-gray-100", text: "text-gray-500", dot: "bg-gray-400" },
};

function calculateAge(birthdate: string): number {
    const birth = new Date(birthdate);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
        age--;
    }
    return age;
}

export default function DoctorAppointmentsPage() {
    const router = useRouter();
    const [doctor, setDoctor] = useState<DoctorUser | null>(null);
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [filter, setFilter] = useState<FilterTab>("All");
    const [mounted, setMounted] = useState(false);

    const loadAppointments = (doc: DoctorUser) => {
        const raw = localStorage.getItem("schedula_appointments");
        if (raw) {
            const all: Appointment[] = JSON.parse(raw);
            setAppointments(all.filter((a) => a.doctorId === doc.id || a.doctorName === doc.name));
        }
    };

    useEffect(() => {
        const d = getLoggedInDoctor();
        if (!d) { router.push("/login"); return; }
        setDoctor(d);
        loadAppointments(d);
        setMounted(true);
    }, [router]);

    const updateAppointmentStatus = (aptId: string, newStatus: string) => {
        const raw = localStorage.getItem("schedula_appointments");
        if (!raw) return;
        const all: Appointment[] = JSON.parse(raw);
        const updated = all.map((a) => a.id === aptId ? { ...a, status: newStatus } : a);
        localStorage.setItem("schedula_appointments", JSON.stringify(updated));
        if (doctor) loadAppointments(doctor);
    };

    if (!mounted || !doctor) return null;

    const filteredAppointments = appointments.filter((a) => {
        if (filter === "All") return true;
        if (filter === "Booked") return a.status === "upcoming";
        if (filter === "In Progress") return a.status === "in-progress";
        if (filter === "Completed") return a.status === "completed";
        if (filter === "Cancelled") return a.status === "Cancelled";
        if (filter === "No Show") return a.status === "no-show";
        return true;
    });

    const getPatientInfo = (apt: Appointment) => {
        let name = apt.userName || "";
        let phone = apt.userPhone || "";
        let birthdate = apt.userBirthdate || "";
        if (!name || !phone || !birthdate) {
            const user = getUserByEmail(apt.userEmail);
            if (user) {
                if (!name) name = user.name;
                if (!phone) phone = user.phone || "";
                if (!birthdate) birthdate = user.birthdate || "";
            }
        }
        if (!name) name = apt.userEmail.split("@")[0];
        const age = birthdate ? calculateAge(birthdate) : null;
        return { name, phone, birthdate, age };
    };

    const tabs: FilterTab[] = ["All", "Booked", "In Progress", "Completed", "Cancelled", "No Show"];
    const tabCounts: Record<FilterTab, number> = {
        All: appointments.length,
        Booked: appointments.filter((a) => a.status === "upcoming").length,
        "In Progress": appointments.filter((a) => a.status === "in-progress").length,
        Completed: appointments.filter((a) => a.status === "completed").length,
        Cancelled: appointments.filter((a) => a.status === "Cancelled").length,
        "No Show": appointments.filter((a) => a.status === "no-show").length,
    };

    return (
        <div className="max-w-3xl mx-auto space-y-6">
            <div>
                <h2 className="text-xl font-bold text-gray-900">Patient Appointments</h2>
                <p className="text-gray-500 text-sm mt-1">Manage and track appointment status</p>
            </div>

            {/* Filter Tabs */}
            <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
                {tabs.map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setFilter(tab)}
                        className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${filter === tab
                            ? "bg-cyan-500 text-white shadow-sm shadow-cyan-200"
                            : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                            }`}
                    >
                        {tab}
                        <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${filter === tab ? "bg-white/25 text-white" : "bg-gray-200 text-gray-600"
                            }`}>
                            {tabCounts[tab]}
                        </span>
                    </button>
                ))}
            </div>

            {filteredAppointments.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-3xl border border-gray-100 shadow-sm">
                    <Calendar className="w-16 h-16 text-gray-200 mx-auto mb-4" />
                    <p className="text-gray-500 font-medium text-lg">No {filter === "All" ? "" : filter.toLowerCase()} appointments</p>
                    <p className="text-gray-400 text-sm mt-1">Patients will appear here once they book a slot</p>
                </div>
            ) : (
                <div className="grid gap-4">
                    {filteredAppointments.map((apt, index) => {
                        const patient = getPatientInfo(apt);
                        const sc = STATUS_CONFIG[apt.status] || STATUS_CONFIG.upcoming;
                        const isTerminal = ["completed", "Cancelled", "no-show"].includes(apt.status);

                        return (
                            <div key={apt.id} className={`bg-white rounded-2xl border border-gray-100 p-4 sm:p-5 shadow-sm transition-all ${isTerminal ? "opacity-80" : ""}`}>
                                {/* Header: Index + Name + Status */}
                                <div className="flex items-start justify-between gap-3 mb-3">
                                    <div className="flex items-center gap-3 min-w-0">
                                        <span className="text-sm font-bold text-gray-300 w-5 text-center flex-shrink-0">{index + 1}</span>
                                        <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-gradient-to-br from-cyan-400 to-teal-500 flex items-center justify-center flex-shrink-0">
                                            <UserIcon className="w-5 h-5 text-white" />
                                        </div>
                                        <div className="min-w-0">
                                            <h3 className={`font-bold text-sm sm:text-base truncate ${isTerminal && apt.status !== "completed" ? "text-gray-400" : "text-gray-900"}`}>
                                                {patient.name}
                                            </h3>
                                            <p className="text-xs text-gray-400 truncate">{apt.userEmail}</p>
                                        </div>
                                    </div>
                                    <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider whitespace-nowrap flex-shrink-0 flex items-center gap-1 ${sc.bg} ${sc.text}`}>
                                        <span className={`w-1.5 h-1.5 rounded-full ${sc.dot}`} />
                                        {sc.label}
                                    </span>
                                </div>

                                {/* Patient Details Grid */}
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3 mb-3">
                                    {patient.phone && (
                                        <div className="flex items-center gap-1.5 bg-gray-50 rounded-lg px-2.5 py-2">
                                            <Phone className="w-3.5 h-3.5 text-cyan-500 flex-shrink-0" />
                                            <span className="text-xs text-gray-700 truncate">{patient.phone}</span>
                                        </div>
                                    )}
                                    {patient.age !== null && (
                                        <div className="flex items-center gap-1.5 bg-gray-50 rounded-lg px-2.5 py-2">
                                            <UserIcon className="w-3.5 h-3.5 text-purple-500 flex-shrink-0" />
                                            <span className="text-xs text-gray-700">{patient.age} yrs old</span>
                                        </div>
                                    )}
                                    {patient.birthdate && (
                                        <div className="flex items-center gap-1.5 bg-gray-50 rounded-lg px-2.5 py-2">
                                            <Cake className="w-3.5 h-3.5 text-pink-500 flex-shrink-0" />
                                            <span className="text-xs text-gray-700 truncate">
                                                {new Date(patient.birthdate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                                            </span>
                                        </div>
                                    )}
                                </div>

                                {/* Date & Time */}
                                <div className="flex flex-wrap items-center gap-2 text-xs border-t border-gray-100 pt-3">
                                    <div className="flex items-center gap-1.5 text-gray-500">
                                        <Clock className="w-3.5 h-3.5" />
                                        <span>
                                            {new Date(apt.date).toLocaleDateString("en-IN", {
                                                weekday: "short", day: "numeric", month: "short", year: "numeric",
                                            })}
                                        </span>
                                    </div>
                                    {apt.timeSlot && (
                                        <span className="bg-cyan-50 text-cyan-600 font-semibold px-2.5 py-1 rounded-lg">
                                            {apt.timeSlot}
                                        </span>
                                    )}
                                </div>

                                {/* Action Buttons */}
                                {!isTerminal && (
                                    <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-gray-100">
                                        {apt.status === "upcoming" && (
                                            <>
                                                <button
                                                    onClick={() => updateAppointmentStatus(apt.id, "in-progress")}
                                                    className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 text-amber-600 hover:bg-amber-100 text-xs font-semibold rounded-lg transition-all cursor-pointer"
                                                >
                                                    <PlayCircle className="w-3.5 h-3.5" />
                                                    Start Checkup
                                                </button>
                                                <button
                                                    onClick={() => updateAppointmentStatus(apt.id, "no-show")}
                                                    className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 text-gray-500 hover:bg-gray-100 text-xs font-semibold rounded-lg transition-all cursor-pointer"
                                                >
                                                    <AlertTriangle className="w-3.5 h-3.5" />
                                                    No Show
                                                </button>
                                                <button
                                                    onClick={() => updateAppointmentStatus(apt.id, "Cancelled")}
                                                    className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-500 hover:bg-red-100 text-xs font-semibold rounded-lg transition-all cursor-pointer"
                                                >
                                                    <XCircle className="w-3.5 h-3.5" />
                                                    Cancel
                                                </button>
                                            </>
                                        )}
                                        {apt.status === "in-progress" && (
                                            <button
                                                onClick={() => updateAppointmentStatus(apt.id, "completed")}
                                                className="flex items-center gap-1.5 px-4 py-2 bg-emerald-500 text-white hover:bg-emerald-600 text-xs font-bold rounded-lg transition-all cursor-pointer shadow-sm shadow-emerald-200"
                                            >
                                                <CheckCircle2 className="w-4 h-4" />
                                                Mark as Completed
                                            </button>
                                        )}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
