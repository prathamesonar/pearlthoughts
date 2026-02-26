"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Calendar, Clock, Trash2 } from "lucide-react";
import Swal from "sweetalert2";
import { getLoggedInUser } from "../../lib/data";

interface Appointment {
    id: string;
    doctorName: string;
    specialty: string;
    userEmail: string;
    date: string;
    timeSlot: string;
    status: string;
}

export default function AppointmentsPage() {
    const router = useRouter();
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [filter, setFilter] = useState<'Booked' | 'Cancelled'>('Booked');
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        const u = getLoggedInUser();
        if (!u) { router.push("/login"); return; }

        const raw = localStorage.getItem("schedula_appointments");
        if (raw) {
            const all: Appointment[] = JSON.parse(raw);
            setAppointments(all.filter((a) => a.userEmail === u.email));
        }
        setMounted(true);
    }, [router]);

    const cancelAppointment = (id: string) => {
        Swal.fire({
            title: "Cancel Appointment?",
            text: "This action cannot be undone.",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#ef4444",
            cancelButtonColor: "#6b7280",
            confirmButtonText: "Yes, cancel it",
        }).then((result) => {
            if (result.isConfirmed) {
                const raw = localStorage.getItem("schedula_appointments");
                if (raw) {
                    const all = JSON.parse(raw).map((a: Appointment) => a.id === id ? { ...a, status: 'Cancelled' } : a);
                    localStorage.setItem("schedula_appointments", JSON.stringify(all));
                    setAppointments((prev) => prev.map((a) => a.id === id ? { ...a, status: 'Cancelled' } : a));
                }
                Swal.fire({ icon: "success", title: "Cancelled!", timer: 1200, showConfirmButton: false });
            }
        });
    };

    if (!mounted) return null;

    const filteredAppointments = appointments.filter((a) => filter === 'Booked' ? a.status !== 'Cancelled' : a.status === 'Cancelled');

    return (
        <div className="max-w-3xl mx-auto space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-xl font-bold text-gray-900">Your Appointments</h2>
                    <p className="text-gray-500 text-sm mt-1">Manage your booking history</p>
                </div>

                {/* Tabs */}
                <div className="flex bg-gray-100 p-1 rounded-xl w-fit">
                    <button
                        onClick={() => setFilter('Booked')}
                        className={`px-4 py-1.5 text-sm font-medium rounded-lg transition-all ${filter === 'Booked'
                            ? 'bg-white text-cyan-600 shadow-sm'
                            : 'text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        Booked
                    </button>
                    <button
                        onClick={() => setFilter('Cancelled')}
                        className={`px-4 py-1.5 text-sm font-medium rounded-lg transition-all ${filter === 'Cancelled'
                            ? 'bg-white text-gray-900 shadow-sm'
                            : 'text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        Cancelled
                    </button>
                </div>
            </div>

            {filteredAppointments.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-3xl border border-gray-100 shadow-sm">
                    <Calendar className="w-16 h-16 text-gray-200 mx-auto mb-4" />
                    <p className="text-gray-500 font-medium text-lg">
                        {filter === 'Booked' ? 'No booked appointments yet' : 'No cancelled appointments'}
                    </p>
                    {filter === 'Booked' && (
                        <>
                            <p className="text-gray-400 text-sm mt-1">Book a doctor from the Find a Doctor page</p>
                            <button
                                onClick={() => router.push("/dashboard")}
                                className="mt-6 px-6 py-2.5 bg-cyan-500 text-white rounded-xl font-medium hover:bg-cyan-600 transition cursor-pointer"
                            >
                                Find a Doctor
                            </button>
                        </>
                    )}
                </div>
            ) : (
                <div className="grid gap-4">
                    {filteredAppointments.map((apt) => {
                        const isCancelled = apt.status === 'Cancelled';
                        const isTerminal = ['completed', 'Cancelled', 'no-show'].includes(apt.status);
                        const statusConfig: Record<string, { label: string; bg: string; text: string }> = {
                            upcoming: { label: "Booked", bg: "bg-blue-50", text: "text-blue-600" },
                            "in-progress": { label: "In Progress", bg: "bg-amber-50", text: "text-amber-600" },
                            completed: { label: "Completed", bg: "bg-emerald-50", text: "text-emerald-600" },
                            Cancelled: { label: "Cancelled", bg: "bg-red-50", text: "text-red-500" },
                            "no-show": { label: "No Show", bg: "bg-gray-100", text: "text-gray-500" },
                        };
                        const sc = statusConfig[apt.status] || statusConfig.upcoming;
                        return (
                            <div key={apt.id} className={`bg-white rounded-2xl border border-gray-100 p-5 shadow-sm ${isTerminal && apt.status !== 'completed' ? 'opacity-75' : ''}`}>
                                <div className="flex items-start justify-between">
                                    <div>
                                        <div className="flex flex-wrap items-center gap-2 mb-1">
                                            <h3 className={`font-bold ${isCancelled ? 'text-gray-600 line-through decoration-gray-300' : 'text-gray-900'}`}>{apt.doctorName}</h3>
                                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${sc.bg} ${sc.text}`}>
                                                {sc.label}
                                            </span>
                                        </div>
                                        <p className="text-cyan-500 text-sm font-medium">{apt.specialty}</p>
                                        <div className="flex items-center gap-1.5 mt-2 text-gray-400 text-xs">
                                            <Clock className="w-3.5 h-3.5" />
                                            {new Date(apt.date).toLocaleDateString("en-IN", {
                                                weekday: "short", day: "numeric", month: "short", year: "numeric",
                                            })}
                                            {apt.timeSlot && (
                                                <span className="ml-2 text-cyan-500 font-medium">• {apt.timeSlot}</span>
                                            )}
                                        </div>
                                    </div>
                                    {!isTerminal && (
                                        <button
                                            onClick={() => cancelAppointment(apt.id)}
                                            className="p-2 rounded-xl hover:bg-red-50 text-gray-400 hover:text-red-500 transition cursor-pointer"
                                            title="Cancel Appointment"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    )}
                                </div>
                            </div>
                        )
                    })}
                </div>
            )}
        </div>
    );
}
