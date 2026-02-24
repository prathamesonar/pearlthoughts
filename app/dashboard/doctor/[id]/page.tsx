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
    CheckCircle,
} from "lucide-react";
import Swal from "sweetalert2";
import { doctors, getLoggedInUser } from "../../../lib/data";
import type { Doctor } from "../../../lib/data";

const TIME_SLOTS = [
    "09:00 AM - 09:30 AM",
    "10:00 AM - 10:30 AM",
    "11:00 AM - 11:30 AM",
    "02:00 PM - 02:30 PM",
    "04:00 PM - 04:30 PM",
    "06:00 PM - 06:30 PM",
];

function getNextWeekdays(count: number) {
    const days: { date: Date; day: string; num: number }[] = [];
    const curr = new Date();
    let d = new Date(curr);
    while (days.length < count) {
        const dow = d.getDay();
        if (dow !== 0 && dow !== 6) {
            days.push({
                date: new Date(d),
                day: d.toLocaleDateString("en-US", { weekday: "short" }),
                num: d.getDate(),
            });
        }
        d.setDate(d.getDate() + 1);
    }
    return days;
}

export default function DoctorDetailPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = use(params);
    const router = useRouter();
    const [doctor, setDoctor] = useState<Doctor | null>(null);
    const [mounted, setMounted] = useState(false);
    const [selectedDate, setSelectedDate] = useState<number>(0);
    const [selectedSlot, setSelectedSlot] = useState<string>("");

    const weekdays = getNextWeekdays(5);

    useEffect(() => {
        const u = getLoggedInUser();
        if (!u) {
            router.push("/login");
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

        if (selectedSlot === "") {
            Swal.fire({
                icon: "warning",
                title: "Select a Slot",
                text: "Please select a date and time slot to book your appointment.",
                confirmButtonColor: "#22d3ee",
            });
            return;
        }

        const chosenDate = weekdays[selectedDate].date;
        const formattedDate = chosenDate.toLocaleDateString("en-IN", {
            weekday: "short",
            day: "numeric",
            month: "short",
            year: "numeric",
        });

        const raw = localStorage.getItem("schedula_appointments");
        const appointments = raw ? JSON.parse(raw) : [];
        const newAppointment = {
            id: Date.now().toString(),
            doctorId: doctor.id,
            doctorName: doctor.name,
            specialty: doctor.specialty,
            userEmail: user.email,
            date: chosenDate.toISOString(),
            timeSlot: selectedSlot,
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
            html: `
                <div style="text-align:left;font-size:14px;line-height:1.8">
                    <p><strong>Doctor:</strong> ${doctor.name}</p>
                    <p><strong>Specialty:</strong> ${doctor.specialty}</p>
                    <p><strong>Date:</strong> ${formattedDate}</p>
                    <p><strong>Time:</strong> ${selectedSlot}</p>
                </div>
            `,
            confirmButtonColor: "#22d3ee",
            confirmButtonText: "View Appointments",
        }).then((result) => {
            if (result.isConfirmed) {
                router.push("/dashboard/appointments");
            }
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
        { icon: Clock, value: `${doctor.experience}yr`, label: "experience" },
        { icon: Star, value: doctor.rating.toString(), label: "rating" },
        {
            icon: MessageSquare,
            value: doctor.reviews.toLocaleString(),
            label: "reviews",
        },
    ];

    return (
        <div className="max-w-2xl mx-auto space-y-6 pb-8">
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

            {/* ========== BOOKING SECTION ========== */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm space-y-6">
                {/* Select Date */}
                <div>
                    <h3 className="text-base font-bold text-gray-900 mb-4">Select Date</h3>
                    <div className="flex gap-3 overflow-x-auto pb-1">
                        {weekdays.map((day, i) => (
                            <button
                                key={i}
                                onClick={() => setSelectedDate(i)}
                                className={`flex flex-col items-center min-w-[64px] py-3 px-4 rounded-xl border-2 transition-all duration-200 cursor-pointer
                                    ${selectedDate === i
                                        ? "bg-cyan-500 border-cyan-500 text-white shadow-lg shadow-cyan-200"
                                        : "bg-white border-gray-200 text-gray-600 hover:border-cyan-300"
                                    }`}
                            >
                                <span className="text-lg font-bold">{day.num}</span>
                                <span className="text-xs font-medium mt-0.5">{day.day}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Select Time Slot */}
                <div>
                    <h3 className="text-base font-bold text-gray-900 mb-4">Select Time Slot</h3>
                    <div className="grid grid-cols-2 gap-3">
                        {TIME_SLOTS.map((slot) => (
                            <button
                                key={slot}
                                onClick={() => setSelectedSlot(slot)}
                                className={`py-3 px-4 rounded-xl border-2 text-sm font-medium transition-all duration-200 cursor-pointer
                                    ${selectedSlot === slot
                                        ? "bg-cyan-500 border-cyan-500 text-white shadow-lg shadow-cyan-200"
                                        : "bg-white border-gray-200 text-gray-600 hover:border-cyan-300"
                                    }`}
                            >
                                {slot}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Selected Summary */}
                {selectedSlot && (
                    <div className="bg-cyan-50 border border-cyan-200 rounded-xl p-4 flex items-center gap-3">
                        <CheckCircle className="w-5 h-5 text-cyan-500 flex-shrink-0" />
                        <div className="text-sm">
                            <span className="text-gray-600">Your appointment: </span>
                            <span className="font-bold text-gray-900">
                                {weekdays[selectedDate].day}, {weekdays[selectedDate].num}{" "}
                            </span>
                            <span className="text-gray-600">at </span>
                            <span className="font-bold text-cyan-600">{selectedSlot}</span>
                        </div>
                    </div>
                )}

                {/* Book Button */}
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
        </div>
    );
}
