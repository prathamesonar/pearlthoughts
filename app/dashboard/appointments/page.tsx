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
    date: string;
    status: string;
}

export default function AppointmentsPage() {
    const router = useRouter();
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        const u = getLoggedInUser();
        if (!u) { router.push("/"); return; }

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
                    const all = JSON.parse(raw).filter((a: Appointment) => a.id !== id);
                    localStorage.setItem("schedula_appointments", JSON.stringify(all));
                    setAppointments((prev) => prev.filter((a) => a.id !== id));
                }
                Swal.fire({ icon: "success", title: "Cancelled!", timer: 1200, showConfirmButton: false });
            }
        });
    };

    if (!mounted) return null;

    return (
        <div className="max-w-3xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">Your Appointments</h2>
                <span className="bg-cyan-50 text-cyan-600 px-3 py-1 rounded-full text-sm font-medium">
                    {appointments.length} total
                </span>
            </div>

            {appointments.length === 0 ? (
                <div className="text-center py-20">
                    <Calendar className="w-16 h-16 text-gray-200 mx-auto mb-4" />
                    <p className="text-gray-500 font-medium text-lg">No appointments yet</p>
                    <p className="text-gray-400 text-sm mt-1">Book a doctor from the Find a Doctor page</p>
                    <button
                        onClick={() => router.push("/dashboard")}
                        className="mt-6 px-6 py-2.5 bg-cyan-500 text-white rounded-xl font-medium hover:bg-cyan-600 transition cursor-pointer"
                    >
                        Find a Doctor
                    </button>
                </div>
            ) : (
                <div className="grid gap-4">
                    {appointments.map((apt) => (
                        <div key={apt.id} className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
                            <div className="flex items-start justify-between">
                                <div>
                                    <h3 className="font-bold text-gray-900">{apt.doctorName}</h3>
                                    <p className="text-cyan-500 text-sm font-medium">{apt.specialty}</p>
                                    <div className="flex items-center gap-1.5 mt-2 text-gray-400 text-xs">
                                        <Clock className="w-3.5 h-3.5" />
                                        {new Date(apt.date).toLocaleDateString("en-IN", {
                                            weekday: "short", day: "numeric", month: "short", year: "numeric",
                                        })}
                                    </div>
                                </div>
                                <button
                                    onClick={() => cancelAppointment(apt.id)}
                                    className="p-2 rounded-xl hover:bg-red-50 text-gray-400 hover:text-red-500 transition cursor-pointer"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
