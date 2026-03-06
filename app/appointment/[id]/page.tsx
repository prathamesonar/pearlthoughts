"use client";

import { useState, useEffect, useMemo, use } from "react";
import { useRouter } from "next/navigation";
import { getDoctorWithOverrides } from "@/utils/getDoctorWithOverrides";
import {
    ArrowLeft, Calendar as CalendarIcon, Clock, Star, MapPin,
    Info, ShieldCheck, CheckCircle2, ChevronRight, ChevronLeft
} from "lucide-react";

interface Slot {
    time: string;
    isFull: boolean;
    bookedCount: number;
}

function parseDaysString(daysStr?: string): number[] {
    if (!daysStr) return [1, 2, 3, 4, 5]; // Default Mon-Fri
    const daysMap: Record<string, number> = {
        sunday: 0, monday: 1, tuesday: 2, wednesday: 3, thursday: 4, friday: 5, saturday: 6,
    };
    const parts = daysStr.toLowerCase().split("to").map((s) => s.trim());
    if (parts.length === 2 && daysMap[parts[0]] !== undefined && daysMap[parts[1]] !== undefined) {
        let start = daysMap[parts[0]];
        let end = daysMap[parts[1]];
        let valid = [];
        if (start <= end) {
            for (let i = start; i <= end; i++) valid.push(i);
        } else {
            for (let i = start; i <= 6; i++) valid.push(i);
            for (let i = 0; i <= end; i++) valid.push(i);
        }
        return valid;
    }
    return [1, 2, 3, 4, 5];
}

function parseTimeStr(timeStr: string): number {
    const [time, modifier] = timeStr.trim().split(/\s+/);
    let [hours, minutes] = time.split(":").map(Number);
    if (!minutes) minutes = 0;
    if (modifier?.toLowerCase() === "pm" && hours < 12) hours += 12;
    if (modifier?.toLowerCase() === "am" && hours === 12) hours = 0;
    return hours * 60 + minutes;
}

export default function BookAppointment({ params }: { params: Promise<{ id: string }> }) {
    const router = useRouter();
    const unwrappedParams = use(params);
    const doctorId = parseInt(unwrappedParams.id, 10);

    const [doctor, setDoctor] = useState<any>(null);
    const [slotConfig, setSlotConfig] = useState<any>(null);
    const [selectedDate, setSelectedDate] = useState<Date>(new Date());
    const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
    const [bookedSlotsState, setBookedSlotsState] = useState<any[]>([]);
    const [userEmail, setUserEmail] = useState<string | null>(null);
    const [myUpcomingAppointments, setMyUpcomingAppointments] = useState<any[]>([]);

    useEffect(() => {
        const email = localStorage.getItem("userEmail");
        if (!email) router.push("/login");
        else setUserEmail(email);

        const { doctor: doc, slotConfig: config } = getDoctorWithOverrides(doctorId);
        if (!doc) router.push("/home");
        else {
            setDoctor(doc);
            setSlotConfig(config);
        }

        try {
            const storedBooked = localStorage.getItem("bookedSlots");
            if (storedBooked) setBookedSlotsState(JSON.parse(storedBooked));

            const storedApts = localStorage.getItem("appointments");
            if (storedApts) {
                setMyUpcomingAppointments(JSON.parse(storedApts).filter((a: any) => a.type === "upcoming"));
            }
        } catch { }
    }, [doctorId, router]);

    const validDays = useMemo(() => {
        if (slotConfig?.selectedDates?.length) {
            return slotConfig.selectedDates.map((d: string) => new Date(d).toDateString());
        }
        return parseDaysString(doctor?.availability?.days);
    }, [doctor, slotConfig]);

    const availableDates = useMemo(() => {
        const dates = [];
        let d = new Date();
        d.setHours(0, 0, 0, 0);

        for (let i = 0; i < 30; i++) {
            const checkDate = new Date(d);
            checkDate.setDate(d.getDate() + i);

            if (slotConfig?.selectedDates?.length) {
                if (validDays.includes(checkDate.toDateString())) {
                    dates.push(checkDate);
                }
            } else {
                // It's an array of day indices
                if ((validDays as number[]).includes(checkDate.getDay())) {
                    dates.push(checkDate);
                }
            }
        }
        return dates;
    }, [validDays, slotConfig]);

    useEffect(() => {
        if (availableDates.length > 0) {
            setSelectedDate(availableDates[0]);
        }
    }, [doctor]); // Reset only when doctor loads (which affects dates)

    const slots: Slot[] = useMemo(() => {
        if (!doctor) return [];

        // Config values or defaults based on doctor hours
        let startMin = 600; // 10:00 AM
        let endMin = 1020;  // 5:00 PM
        let duration = slotConfig?.slotDurationMinutes || 30;
        const maxP = slotConfig?.maxPatientsPerSlot || 1;

        try {
            const [startStr, endStr] = (doctor.availability.hours as string).split(" To ").map(s => s.trim());
            startMin = parseTimeStr(startStr);
            endMin = parseTimeStr(endStr);
        } catch { }

        const generated = [];
        const dateStr = selectedDate.toDateString();

        const now = new Date();
        const isToday = selectedDate.getDate() === now.getDate() && selectedDate.getMonth() === now.getMonth();
        const currentMin = now.getHours() * 60 + now.getMinutes();

        for (let m = startMin; m < endMin; m += duration) {
            if (isToday && m <= currentMin + 30) continue; // Past or too close slots

            const h = Math.floor(m / 60);
            const min = m % 60;
            const h12 = h % 12 || 12;
            const period = h < 12 ? "AM" : "PM";
            const timeStr = `${h12}:${min.toString().padStart(2, '0')} ${period}`;

            const count = bookedSlotsState.filter(s => s.doctorId === doctorId && s.date === dateStr && s.time === timeStr).length;

            generated.push({
                time: timeStr,
                isFull: count >= maxP,
                bookedCount: count
            });
        }
        return generated;
    }, [doctor, selectedDate, slotConfig, bookedSlotsState, doctorId]);

    const handleBook = () => {
        if (!selectedSlot) return alert("Select a time slot.");

        const aptFound = myUpcomingAppointments.find(a => a.doctorId === doctorId && a.date === selectedDate.toDateString());
        if (aptFound) return alert("You already have an upcoming appointment with this doctor on this date!");

        const newAptId = Date.now();
        const newApt = {
            id: newAptId,
            appointmentNumber: `APT-${new Date().getFullYear()}-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`,
            doctorId: doctor.id,
            doctorName: doctor.name,
            doctorSpecialty: doctor.specialty,
            doctorQualification: doctor.qualification,
            status: "Confirmed",
            reportingTime: selectedSlot,
            date: selectedDate.toDateString(),
            time: selectedSlot,
            tokenNumber: `T-${Math.floor(Math.random() * 100).toString().padStart(3, '0')}`,
            paymentStatus: "not paid",
            type: "upcoming"
        };

        try {
            const saved = localStorage.getItem("appointments");
            const list = saved ? JSON.parse(saved) : [];
            list.unshift(newApt);
            localStorage.setItem("appointments", JSON.stringify(list));

            const savedSlots = localStorage.getItem("bookedSlots");
            const sList = savedSlots ? JSON.parse(savedSlots) : [];
            sList.push({
                doctorId,
                date: selectedDate.toDateString(),
                time: selectedSlot,
                bookedBy: userEmail,
                appointmentId: newAptId,
            });
            localStorage.setItem("bookedSlots", JSON.stringify(sList));

            router.push(`/appointment-scheduled?id=${newAptId}&docName=${encodeURIComponent(doctor.name)}&date=${encodeURIComponent(selectedDate.toDateString())}&time=${encodeURIComponent(selectedSlot)}`);
        } catch {
            alert("Failed to book appointment.");
        }
    };

    if (!doctor) return <div className="min-h-screen bg-gray-50 flex items-center justify-center font-sans"><div className="w-8 h-8 rounded-full border-4 border-cyan-500 border-t-transparent animate-spin"></div></div>;

    return (
        <div className="min-h-screen bg-gray-50 font-sans pb-24">

            {/* Navbar Overlayed style */}
            <nav className="bg-white px-4 md:px-6 h-16 flex items-center justify-between shadow-sm sticky top-0 z-50">
                <button onClick={() => router.back()} className="p-2 -ml-2 text-gray-400 hover:text-cyan-600 rounded-full hover:bg-cyan-50 transition-colors">
                    <ArrowLeft className="w-5 h-5" />
                </button>
                <span className="font-bold text-gray-900 absolute left-1/2 -translate-x-1/2">Book Appointment</span>
                <div className="w-9"></div>
            </nav>

            <main className="max-w-4xl mx-auto p-4 md:p-6 space-y-6 md:space-y-8 mt-2">

                {/* Doctor Summary */}
                <section className="bg-white rounded-3xl p-5 md:p-8 flex flex-col md:flex-row gap-6 items-center md:items-start shadow-sm border border-gray-100 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-50 rounded-bl-full -z-0"></div>

                    <div className="w-28 h-28 md:w-36 md:h-36 rounded-2xl overflow-hidden bg-gray-100 border-4 border-white shadow-md z-10 flex-shrink-0">
                        {doctor.image ? (
                            <img src={doctor.image} alt={doctor.name} className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-3xl font-bold text-gray-300 bg-gray-100">{doctor.name.charAt(0)}</div>
                        )}
                    </div>

                    <div className="flex-1 text-center md:text-left z-10 w-full">
                        <h1 className="text-2xl md:text-3xl font-black text-gray-900 mb-1">{doctor.name}</h1>
                        <p className="text-cyan-600 font-bold mb-3">{doctor.specialty}</p>

                        <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-sm font-medium text-gray-600 bg-gray-50 p-3 rounded-xl">
                            <span className="flex items-center gap-1.5"><Star className="w-4 h-4 text-amber-500 fill-amber-500" /> {doctor.rating}</span>
                            <div className="w-1.5 h-1.5 bg-gray-300 rounded-full"></div>
                            <span className="flex items-center gap-1.5"><Clock className="w-4 h-4" /> {doctor.experience} yrs</span>
                            <div className="w-1.5 h-1.5 bg-gray-300 rounded-full"></div>
                            <span className="flex items-center gap-1.5"><ShieldCheck className="w-4 h-4 text-emerald-500" /> Verified</span>
                        </div>
                    </div>

                    <div className="md:w-auto w-full flex md:flex-col items-center justify-between md:items-end gap-2 bg-gray-50 md:bg-transparent p-4 md:p-0 rounded-xl">
                        <div className="text-left md:text-right">
                            <span className="text-xs text-gray-500 font-bold uppercase tracking-wide">Consultation Fee</span>
                            <p className="text-xl font-black text-gray-900 mt-0.5">₹{doctor.consultationFee}</p>
                        </div>
                        {doctor.available ? (
                            <span className="text-xs font-bold text-emerald-600 bg-emerald-100 px-3 py-1 rounded-full flex items-center gap-1.5">
                                <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                                Available
                            </span>
                        ) : (
                            <span className="text-xs font-bold text-gray-100 bg-gray-800 px-3 py-1 rounded-full">
                                Offline
                            </span>
                        )}
                    </div>
                </section>

                {/* Date Selection */}
                <section className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
                    <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2 mb-4">
                        <CalendarIcon className="w-5 h-5 text-cyan-500" /> Select Date
                    </h3>

                    <div className="flex gap-3 overflow-x-auto pb-4 hide-scrollbar -mx-2 px-2 snap-x">
                        {availableDates.map((date, idx) => {
                            const isSelected = date.getTime() === selectedDate.getTime();
                            const textStyles = isSelected ? "text-white" : "text-gray-900";
                            const bgStyles = isSelected ? "bg-cyan-500 shadow-lg shadow-cyan-200" : "bg-gray-50 border border-gray-100 text-gray-500 hover:border-cyan-200";
                            return (
                                <button
                                    key={idx}
                                    onClick={() => { setSelectedDate(date); setSelectedSlot(null); }}
                                    className={`snap-center flex-shrink-0 flex flex-col items-center justify-center p-3 rounded-2xl w-20 transition-all duration-300 \${bgStyles}`}
                                >
                                    <span className={`text-xs font-medium uppercase tracking-wider mb-1 \${isSelected ? 'text-cyan-100' : 'text-gray-400'}`}>
                                        {date.toLocaleDateString('en-US', { weekday: 'short' })}
                                    </span>
                                    <span className={`text-2xl font-black \${textStyles}`}>
                                        {date.getDate()}
                                    </span>
                                    <span className={`text-[10px] font-bold mt-1 \${isSelected ? 'text-cyan-100' : 'text-gray-400'}`}>
                                        {date.toLocaleDateString('en-US', { month: 'short' })}
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                </section>

                {/* Time Slots */}
                <section className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
                    <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2 mb-4">
                        <Clock className="w-5 h-5 text-cyan-500" /> Select Time Slot
                    </h3>

                    <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                        {slots.map((slot, idx) => {
                            const isSelected = selectedSlot === slot.time;

                            if (slot.isFull) {
                                return (
                                    <div key={idx} className="p-3 bg-gray-100 border border-gray-200 rounded-xl text-center flex flex-col opacity-60 cursor-not-allowed">
                                        <span className="text-gray-500 font-bold text-sm strike-through line-through">{slot.time}</span>
                                        <span className="text-[10px] text-rose-500 font-bold mt-1 uppercase">Full</span>
                                    </div>
                                )
                            }

                            return (
                                <button
                                    key={idx}
                                    onClick={() => setSelectedSlot(slot.time)}
                                    className={`p-3 rounded-xl border text-center transition-all duration-200 \${isSelected ? 'bg-cyan-50 border-cyan-500 text-cyan-600 shadow-sm shadow-cyan-100 scale-105 z-10' : 'bg-white border-gray-200 hover:border-cyan-300 text-gray-700 hover:shadow-sm'}`}
                                >
                                    <span className="font-bold text-sm block">{slot.time}</span>
                                </button>
                            )
                        })}
                        {slots.length === 0 && (
                            <div className="col-span-full py-8 text-center bg-rose-50 rounded-xl">
                                <p className="text-rose-600 font-bold">No slots available for this date.</p>
                            </div>
                        )}
                    </div>
                </section>
            </main>

            {/* Floating Action Menu */}
            <footer className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 py-4 px-4 sm:px-6 flex items-center justify-between gap-4 z-50">
                <div className="hidden sm:block">
                    <span className="text-xs text-gray-500 font-bold uppercase tracking-wide block">Selected Time</span>
                    <span className="text-lg font-black text-gray-900">
                        {selectedSlot ? `${selectedSlot}` : "None"} • <span className="text-cyan-600">{selectedDate.toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>
                    </span>
                </div>
                <button
                    onClick={handleBook}
                    disabled={!doctor?.available || !selectedSlot}
                    className={`flex-1 sm:max-w-xs w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg \${
             (!doctor?.available || !selectedSlot) 
             ? 'bg-gray-100 text-gray-400 shadow-none cursor-not-allowed'
             : 'bg-cyan-500 hover:bg-cyan-600 text-white shadow-cyan-200 hover:-translate-y-0.5'
           }`}
                >
                    Confirm Booking <ChevronRight className="w-5 h-5" />
                </button>
            </footer>
        </div>
    );
}
