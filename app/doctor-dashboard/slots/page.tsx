"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Clock, Trash2, Plus, Calendar as CalendarIcon } from "lucide-react";
import Swal from "sweetalert2";
import { getLoggedInDoctor } from "../../lib/data";
import type { DoctorUser } from "../../lib/data";

const DAYS_OF_WEEK = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const DURATIONS = [
    { label: "15 minutes", value: 15 },
    { label: "30 minutes", value: 30 },
    { label: "45 minutes", value: 45 },
    { label: "60 minutes", value: 60 },
];

interface SlotConfig {
    id: string;
    specificDate: string;
    recurringDay: string;
    startTime: string;
    endTime: string;
    duration: number;
    appointmentType: "individual" | "group";
    maxPatients: number;
    slots: string[];
}

function generateTimeSlots(startTime: string, endTime: string, durationMin: number): string[] {
    const slots: string[] = [];
    const [sh, sm] = startTime.split(":").map(Number);
    const [eh, em] = endTime.split(":").map(Number);
    let current = sh * 60 + sm;
    const end = eh * 60 + em;
    while (current + durationMin <= end) {
        const h = Math.floor(current / 60);
        const m = current % 60;
        const nextM = current + durationMin;
        const nh = Math.floor(nextM / 60);
        const nm = nextM % 60;
        const format = (hr: number, mn: number) =>
            `${hr.toString().padStart(2, "0")}:${mn.toString().padStart(2, "0")}`;
        slots.push(`${format(h, m)} - ${format(nh, nm)}`);
        current = nextM;
    }
    return slots;
}

export default function ManageSlotsPage() {
    const router = useRouter();
    const [doctor, setDoctor] = useState<DoctorUser | null>(null);
    const [mounted, setMounted] = useState(false);
    const [slotConfigs, setSlotConfigs] = useState<SlotConfig[]>([]);

    // Form state
    const [specificDate, setSpecificDate] = useState("");
    const [recurringDay, setRecurringDay] = useState("");
    const [startTime, setStartTime] = useState("09:00");
    const [endTime, setEndTime] = useState("17:00");
    const [duration, setDuration] = useState(30);
    const [appointmentType, setAppointmentType] = useState<"individual" | "group">("group");
    const [maxPatients, setMaxPatients] = useState(1);

    useEffect(() => {
        const d = getLoggedInDoctor();
        if (!d) { router.push("/login"); return; }
        setDoctor(d);

        const raw = localStorage.getItem(`schedula_doctor_slots_${d.id}`);
        if (raw) setSlotConfigs(JSON.parse(raw));
        setMounted(true);
    }, [router]);

    const previewSlots = generateTimeSlots(startTime, endTime, duration);

    const handleSave = () => {
        if (!doctor) return;
        if (!specificDate && !recurringDay) {
            Swal.fire({ icon: "warning", title: "Select Date", text: "Please select a specific date or a recurring day.", confirmButtonColor: "#22d3ee" });
            return;
        }
        if (previewSlots.length === 0) {
            Swal.fire({ icon: "warning", title: "No Slots", text: "The time range doesn't produce any slots. Adjust start/end time or duration.", confirmButtonColor: "#22d3ee" });
            return;
        }

        const newConfig: SlotConfig = {
            id: Date.now().toString(),
            specificDate,
            recurringDay,
            startTime,
            endTime,
            duration,
            appointmentType,
            maxPatients: appointmentType === "individual" ? 1 : maxPatients,
            slots: previewSlots,
        };

        const updated = [...slotConfigs, newConfig];
        setSlotConfigs(updated);
        localStorage.setItem(`schedula_doctor_slots_${doctor.id}`, JSON.stringify(updated));

        Swal.fire({ icon: "success", title: "Slots Saved!", text: `${previewSlots.length} time slots have been created.`, timer: 1500, showConfirmButton: false });

        // Reset form
        setSpecificDate("");
        setRecurringDay("");
    };

    const deleteConfig = (id: string) => {
        if (!doctor) return;
        Swal.fire({
            title: "Delete Slot Configuration?",
            text: "This will remove this slot setup.",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#ef4444",
            cancelButtonColor: "#6b7280",
            confirmButtonText: "Yes, delete",
        }).then((result) => {
            if (result.isConfirmed) {
                const updated = slotConfigs.filter((s) => s.id !== id);
                setSlotConfigs(updated);
                localStorage.setItem(`schedula_doctor_slots_${doctor.id}`, JSON.stringify(updated));
                Swal.fire({ icon: "success", title: "Deleted!", timer: 1000, showConfirmButton: false });
            }
        });
    };

    if (!mounted || !doctor) return null;

    return (
        <div className="max-w-3xl mx-auto space-y-6">
            <div>
                <h2 className="text-xl font-bold text-gray-900">Manage Slots</h2>
                <p className="text-gray-500 text-sm mt-1">Create appointment time slots for patients to book</p>
            </div>

            {/* Instructions */}
            <div className="bg-cyan-50 border border-cyan-200 rounded-2xl p-4 text-sm space-y-1">
                <p className="font-semibold text-cyan-700">How it works:</p>
                <ul className="text-cyan-600 space-y-0.5 ml-4 list-disc">
                    <li><strong>Date Selection:</strong> Choose specific date or recurring day</li>
                    <li><strong>Time Setup:</strong> Set start time, end time, and slot duration</li>
                    <li><strong>Appointment Types:</strong> Individual (stream) or Group (wave)</li>
                    <li><strong>Recurring:</strong> Generate weekly repeating appointments</li>
                </ul>
            </div>

            {/* Slot Creation Form */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5 sm:p-6 shadow-sm space-y-5">
                {/* Date / Recurring Day */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label className="text-xs font-semibold text-gray-700 mb-1.5 flex items-center gap-1.5">
                            <CalendarIcon className="w-3.5 h-3.5" /> Specific Date
                        </label>
                        <input
                            type="date"
                            value={specificDate}
                            onChange={(e) => { setSpecificDate(e.target.value); setRecurringDay(""); }}
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50/50 focus:ring-2 focus:ring-cyan-500 focus:border-transparent focus:outline-none text-gray-900 transition text-sm"
                        />
                    </div>
                    <div>
                        <label className="text-xs font-semibold text-gray-700 mb-1.5 flex items-center gap-1.5">
                            🔄 Or Select Recurring Day
                        </label>
                        <select
                            value={recurringDay}
                            onChange={(e) => { setRecurringDay(e.target.value); setSpecificDate(""); }}
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50/50 focus:ring-2 focus:ring-cyan-500 focus:border-transparent focus:outline-none text-gray-900 transition appearance-none cursor-pointer text-sm"
                        >
                            <option value="">Select day for recurring</option>
                            {DAYS_OF_WEEK.map((d) => (
                                <option key={d} value={d}>{d}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Time Range + Duration */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                        <label className="text-xs font-semibold text-gray-700 mb-1.5 block">Start Time</label>
                        <input
                            type="time"
                            value={startTime}
                            onChange={(e) => setStartTime(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50/50 focus:ring-2 focus:ring-cyan-500 focus:border-transparent focus:outline-none text-gray-900 transition text-sm"
                        />
                    </div>
                    <div>
                        <label className="text-xs font-semibold text-gray-700 mb-1.5 block">End Time</label>
                        <input
                            type="time"
                            value={endTime}
                            onChange={(e) => setEndTime(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50/50 focus:ring-2 focus:ring-cyan-500 focus:border-transparent focus:outline-none text-gray-900 transition text-sm"
                        />
                    </div>
                    <div>
                        <label className="text-xs font-semibold text-gray-700 mb-1.5 block">Slot Duration</label>
                        <select
                            value={duration}
                            onChange={(e) => setDuration(Number(e.target.value))}
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50/50 focus:ring-2 focus:ring-cyan-500 focus:border-transparent focus:outline-none text-gray-900 transition appearance-none cursor-pointer text-sm"
                        >
                            {DURATIONS.map((d) => (
                                <option key={d.value} value={d.value}>{d.label}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Appointment Type + Max Patients */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label className="text-xs font-semibold text-gray-700 mb-1.5 flex items-center gap-1.5">
                            👥 Appointment Type
                        </label>
                        <select
                            value={appointmentType}
                            onChange={(e) => {
                                const val = e.target.value as "individual" | "group";
                                setAppointmentType(val);
                                if (val === "individual") setMaxPatients(1);
                            }}
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50/50 focus:ring-2 focus:ring-cyan-500 focus:border-transparent focus:outline-none text-gray-900 transition appearance-none cursor-pointer text-sm"
                        >
                            <option value="individual">Individual (Single patient per slot)</option>
                            <option value="group">Group (Multiple patients per slot)</option>
                        </select>
                    </div>
                    <div>
                        <label className="text-xs font-semibold text-gray-700 mb-1.5 block">Max Patients per Slot</label>
                        <input
                            type="number"
                            min={1}
                            max={20}
                            value={appointmentType === "individual" ? 1 : maxPatients}
                            onChange={(e) => setMaxPatients(Number(e.target.value))}
                            disabled={appointmentType === "individual"}
                            className={`w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50/50 focus:ring-2 focus:ring-cyan-500 focus:border-transparent focus:outline-none text-gray-900 transition text-sm ${appointmentType === "individual" ? "opacity-50 cursor-not-allowed" : ""}`}
                        />
                    </div>
                </div>

                {/* Preview */}
                {previewSlots.length > 0 && (
                    <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                        <p className="text-sm font-semibold text-gray-700 mb-3">
                            Preview: {previewSlots.length} time slots
                            {recurringDay && ` on ${recurringDay}`}
                            {specificDate && ` on ${new Date(specificDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}`}
                        </p>
                        <div className="flex flex-wrap gap-2">
                            {previewSlots.map((slot, i) => (
                                <span key={i} className="bg-cyan-500 text-white text-xs font-medium px-3 py-1.5 rounded-lg">
                                    {slot}
                                </span>
                            ))}
                        </div>
                        <p className="text-xs text-gray-400 mt-2 flex items-center justify-between">
                            <span>{appointmentType === "group" ? `Group (${maxPatients} max)` : "Individual (1 patient)"}</span>
                            <span className="bg-blue-50 text-blue-600 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
                                {appointmentType === "group" ? `Group (${maxPatients} max)` : "Individual"}
                            </span>
                        </p>
                    </div>
                )}

                {/* Save Button */}
                <button
                    onClick={handleSave}
                    className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-cyan-500 to-teal-500 text-white rounded-xl font-bold hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 cursor-pointer shadow-md"
                >
                    <Plus className="w-4 h-4" />
                    Save Slots
                </button>
            </div>

            {/* Existing Slot Configurations */}
            {slotConfigs.length > 0 && (
                <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-3">Saved Slot Configurations</h3>
                    <div className="grid gap-3">
                        {slotConfigs.map((config) => (
                            <div key={config.id} className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
                                <div className="flex items-start justify-between mb-3">
                                    <div>
                                        <p className="font-semibold text-gray-900 text-sm">
                                            {config.recurringDay
                                                ? `Every ${config.recurringDay}`
                                                : new Date(config.specificDate).toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short", year: "numeric" })}
                                        </p>
                                        <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-1">
                                            <Clock className="w-3 h-3" />
                                            {config.startTime} – {config.endTime} • {config.duration}min slots • {config.appointmentType === "group" ? `Group (${config.maxPatients} max)` : "Individual"}
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => deleteConfig(config.id)}
                                        className="p-2 rounded-xl hover:bg-red-50 text-gray-400 hover:text-red-500 transition cursor-pointer"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                                <div className="flex flex-wrap gap-1.5">
                                    {config.slots.map((slot, i) => (
                                        <span key={i} className="bg-cyan-50 text-cyan-600 text-[11px] font-medium px-2.5 py-1 rounded-lg">
                                            {slot}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
