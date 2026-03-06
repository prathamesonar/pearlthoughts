"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import mockData from "@/data/mockData.json";
import {
    Calendar, CheckCircle2, ChevronLeft, Clock,
    MapPin, MoreHorizontal, LogOut, Menu, X, XCircle, Search, User, FileText
} from "lucide-react";

interface Appointment {
    id: number;
    appointmentNumber: string;
    doctorId: number;
    doctorName: string;
    doctorSpecialty: string;
    doctorQualification: string;
    status: string;
    reportingTime: string;
    date: string;
    time: string;
    tokenNumber: string;
    paymentStatus: string;
    type: string;
}

interface BookedSlot {
    doctorId: number;
    date: string;
    time: string;
    bookedBy: string;
    appointmentId: number;
}

type TabType = "upcoming" | "completed" | "canceled";

export default function AppointmentsPage() {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<TabType>("upcoming");
    const [allAppointments, setAllAppointments] = useState<Appointment[]>([]);
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [openMenuId, setOpenMenuId] = useState<number | null>(null);
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [sortBy, setSortBy] = useState<"date" | "name">("date");
    const menuRef = useRef<HTMLDivElement>(null);

    const [modal, setModal] = useState<{
        open: boolean;
        title: string;
        message: string;
        confirmLabel: string;
        confirmVariant: "danger" | "primary";
        onConfirm: () => void;
    }>({
        open: false, title: "", message: "", confirmLabel: "", confirmVariant: "danger", onConfirm: () => { },
    });

    const [toast, setToast] = useState<{
        show: boolean; message: string; type: "success" | "error" | "info";
    }>({ show: false, message: "", type: "info" });

    const [doctorsWithOverrides, setDoctorsWithOverrides] = useState<typeof mockData.doctors>(mockData.doctors);

    const showToast = useCallback((message: string, type: "success" | "error" | "info" = "info") => {
        setToast({ show: true, message, type });
        setTimeout(() => setToast(p => ({ ...p, show: false })), 3500);
    }, []);

    const freeBookedSlot = (appointmentId: number) => {
        try {
            const stored = localStorage.getItem("bookedSlots");
            if (stored) {
                const slots: BookedSlot[] = JSON.parse(stored);
                localStorage.setItem("bookedSlots", JSON.stringify(slots.filter(s => s.appointmentId !== appointmentId)));
            }
        } catch { }
    };

    const freeBookedSlotByDetails = (doctorId: number, date: string, time: string) => {
        try {
            const stored = localStorage.getItem("bookedSlots");
            if (stored) {
                const slots: BookedSlot[] = JSON.parse(stored);
                localStorage.setItem("bookedSlots", JSON.stringify(slots.filter(s => !(s.doctorId === doctorId && s.date === date && s.time === time))));
            }
        } catch { }
    };

    useEffect(() => {
        const storedEmail = localStorage.getItem("userEmail");
        if (!storedEmail) {
            router.push("/login"); return;
        }
        try {
            const stored = localStorage.getItem("appointments");
            const data: Appointment[] = stored ? JSON.parse(stored) : (mockData.appointments as Appointment[]);
            if (!stored) localStorage.setItem("appointments", JSON.stringify(data));
            setAllAppointments(data);
        } catch {
            setAllAppointments(mockData.appointments as Appointment[]);
        }
    }, [router]);

    useEffect(() => {
        try {
            const raw = localStorage.getItem("doctorOverrides");
            if (!raw) return setDoctorsWithOverrides(mockData.doctors);
            const overrides = JSON.parse(raw) as Record<number, any>;
            const merged = (mockData.doctors as any[]).map(doc => overrides[doc.id] ? { ...doc, ...overrides[doc.id] } : doc);
            setDoctorsWithOverrides(merged);
        } catch {
            setDoctorsWithOverrides(mockData.doctors);
        }
    }, []);

    useEffect(() => {
        let filtered = allAppointments.filter(a => a.type === activeTab);
        filtered.sort(sortBy === "date"
            ? (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
            : (a, b) => a.doctorName.localeCompare(b.doctorName)
        );
        setAppointments(filtered);
    }, [activeTab, allAppointments, sortBy]);

    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(e.target as Node)) setOpenMenuId(null);
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    const persist = (updated: Appointment[]) => {
        setAllAppointments(updated);
        localStorage.setItem("appointments", JSON.stringify(updated));
    };

    const handleCancel = (apt: Appointment) => {
        setOpenMenuId(null);
        setModal({
            open: true,
            title: "Cancel Appointment",
            message: `Cancel your appointment with ${apt.doctorName} on ${apt.date} at ${apt.time}?\n\nThis action cannot be undone.`,
            confirmLabel: "Yes, Cancel",
            confirmVariant: "danger",
            onConfirm: () => {
                freeBookedSlot(apt.id);
                freeBookedSlotByDetails(apt.doctorId, apt.date, apt.time);
                persist(allAppointments.map(a => a.id === apt.id ? { ...a, type: "canceled", status: "Canceled" } : a));
                setModal(p => ({ ...p, open: false }));
                showToast("Appointment canceled. Time slot is now available.", "success");
            },
        });
    };

    const handleReschedule = (apt: Appointment) => {
        setOpenMenuId(null);
        setModal({
            open: true,
            title: "Reschedule",
            message: `Reschedule your appointment with ${apt.doctorName}?`,
            confirmLabel: "Reschedule",
            confirmVariant: "primary",
            onConfirm: () => {
                freeBookedSlot(apt.id);
                freeBookedSlotByDetails(apt.doctorId, apt.date, apt.time);
                persist(allAppointments.map(a => a.id === apt.id ? { ...a, type: "canceled", status: "Rescheduled" } : a));
                setModal(p => ({ ...p, open: false }));
                showToast("Redirecting to book a new slot...", "info");
                setTimeout(() => router.push(`/appointment/${apt.doctorId}`), 600);
            },
        });
    };

    const handleMarkComplete = (apt: Appointment) => {
        setOpenMenuId(null);
        freeBookedSlot(apt.id);
        freeBookedSlotByDetails(apt.doctorId, apt.date, apt.time);
        persist(allAppointments.map(a => a.id === apt.id ? { ...a, type: "completed", status: "Completed" } : a));
        showToast(`Marked as completed`, "success");
    };

    const handlePay = (apt: Appointment) => {
        const fee = (doctorsWithOverrides as any[]).find(d => d.id === apt.doctorId)?.consultationFee ?? 0;
        setModal({
            open: true, title: "Confirm Payment", message: `Pay ₹${fee} for ${apt.doctorName}?\nToken: ${apt.tokenNumber}`,
            confirmLabel: `Pay ₹${fee}`, confirmVariant: "primary",
            onConfirm: () => {
                persist(allAppointments.map(a => a.id === apt.id ? { ...a, paymentStatus: "paid" } : a));
                setModal(p => ({ ...p, open: false }));
                showToast(`₹${fee} payment successful!`, "success");
            },
        });
    };

    const handleLogout = () => {
        ["verificationPhone", "userEmail", "socialLogin", "favorites"].forEach(k => localStorage.removeItem(k));
        router.push("/login");
    };

    const tabCounts = {
        upcoming: allAppointments.filter(a => a.type === "upcoming").length,
        completed: allAppointments.filter(a => a.type === "completed").length,
        canceled: allAppointments.filter(a => a.type === "canceled").length,
    };

    const navItems = [
        { id: "find", label: "Find a Doctor", short: "Find", icon: Search, action: () => router.push("/home") },
        { id: "appointments", label: "Appointments", short: "Visits", icon: Calendar, action: () => { } },
        { id: "records", label: "Records", short: "Data", icon: FileText, action: () => router.push("/records") },
        { id: "profile", label: "Profile", short: "Me", icon: User, action: () => router.push("/profile") },
    ];

    return (
        <div className="min-h-screen bg-gray-50 flex font-sans">

            {/* Toast Notification */}
            {toast.show && (
                <div className={`fixed top-4 right-4 z-50 px-6 py-3 rounded-xl shadow-xl flex items-center gap-3 animate-in slide-in-from-top-4 ${toast.type === 'success' ? 'bg-emerald-500 text-white' : toast.type === 'error' ? 'bg-rose-500 text-white' : 'bg-gray-800 text-white'}`}>
                    {toast.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : toast.type === 'error' ? <XCircle className="w-5 h-5" /> : <Clock className="w-5 h-5" />}
                    <span className="font-medium text-sm">{toast.message}</span>
                    <button onClick={() => setToast(p => ({ ...p, show: false }))}><X className="w-4 h-4 ml-2 opacity-70 hover:opacity-100" /></button>
                </div>
            )}

            {/* Modal */}
            {modal.open && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm animate-in fade-in" onClick={() => setModal(p => ({ ...p, open: false }))}>
                    <div className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-2xl scale-100 transition-transform" onClick={e => e.stopPropagation()}>
                        <div className={`w-12 h-12 rounded-full mb-4 flex items-center justify-center ${modal.confirmVariant === 'danger' ? 'bg-rose-100 text-rose-600' : 'bg-cyan-100 text-cyan-600'}`}>
                            {modal.confirmVariant === 'danger' ? <XCircle className="w-6 h-6" /> : <CheckCircle2 className="w-6 h-6" />}
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">{modal.title}</h3>
                        <p className="text-sm text-gray-500 whitespace-pre-wrap">{modal.message}</p>
                        <div className="mt-8 flex gap-3">
                            <button
                                onClick={() => setModal(p => ({ ...p, open: false }))}
                                className="flex-1 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={modal.onConfirm}
                                className={`flex-1 px-4 py-2.5 font-bold rounded-xl transition-colors text-white ${modal.confirmVariant === 'danger' ? 'bg-rose-500 hover:bg-rose-600 shadow-rose-200 shadow-lg' : 'bg-cyan-500 hover:bg-cyan-600 shadow-cyan-200 shadow-lg'}`}
                            >
                                {modal.confirmLabel}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Sidebar */}
            <aside className={`hidden md:flex flex-col bg-white border-r border-gray-100 transition-all duration-300 ${sidebarCollapsed ? 'w-20' : 'w-64'}`}>
                <div className="h-16 flex items-center justify-between px-4 border-b border-gray-100">
                    <div className="flex items-center gap-2 text-cyan-500 overflow-hidden">
                        <Calendar className="w-8 h-8 flex-shrink-0" />
                        {!sidebarCollapsed && <span className="text-xl font-bold text-gray-900 whitespace-nowrap">Schedula</span>}
                    </div>
                    <button onClick={() => setSidebarCollapsed(!sidebarCollapsed)} className="p-1 rounded-md hover:bg-gray-100 text-gray-500">
                        <Menu className="w-5 h-5" />
                    </button>
                </div>
                <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
                    {navItems.map(item => {
                        const isActive = item.id === 'appointments';
                        return (
                            <button key={item.id} onClick={item.action} className={`w-full flex items-center p-3 rounded-xl transition-colors group ${isActive ? 'bg-cyan-50 text-cyan-600' : 'text-gray-900 font-semibold hover:bg-gray-100 hover:text-cyan-600'}`}>
                                <item.icon className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-cyan-600' : 'text-gray-400 group-hover:text-cyan-600'}`} />
                                {!sidebarCollapsed && <span className="ml-3 font-medium flex-1 text-left">{item.label}</span>}
                                {!sidebarCollapsed && item.id === 'appointments' && tabCounts.upcoming > 0 && (
                                    <span className="ml-2 bg-rose-100 text-rose-600 py-0.5 px-2 rounded-full text-xs font-bold">{tabCounts.upcoming}</span>
                                )}
                            </button>
                        )
                    })}
                </nav>
                <div className="p-4 border-t border-gray-100 flex justify-center">
                    <button onClick={() => { if (confirm('Logout?')) handleLogout(); }} className="p-2 text-gray-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg">
                        <LogOut className="w-5 h-5" />
                    </button>
                </div>
            </aside>

            {/* Main Area */}
            <main className="flex-1 flex flex-col h-screen overflow-hidden bg-gray-50">

                {/* Header */}
                <header className="bg-white border-b border-gray-100 px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 z-10 shadow-sm">
                    <div className="flex items-center gap-4">
                        <button onClick={() => router.push("/home")} className="p-2 bg-gray-100 hover:bg-gray-200 rounded-full text-gray-600 transition-colors">
                            <ChevronLeft className="w-5 h-5" />
                        </button>
                        <div>
                            <h1 className="text-2xl font-black text-gray-900">Appointments</h1>
                            <p className="text-sm text-gray-500">Manage your bookings</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 px-3 py-1.5 rounded-lg">
                            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Sort:</span>
                            <select value={sortBy} onChange={(e) => setSortBy(e.target.value as any)} className="bg-transparent text-sm font-medium text-gray-900 outline-none">
                                <option value="date">Date</option>
                                <option value="name">Doctor</option>
                            </select>
                        </div>

                        <button onClick={() => router.push("/home")} className="hidden sm:flex items-center gap-2 bg-cyan-500 hover:bg-cyan-600 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-md shadow-cyan-200 transition-all">
                            <Calendar className="w-4 h-4" /> New Booking
                        </button>
                    </div>
                </header>

                {/* Tabs */}
                <div className="bg-white border-b border-gray-100 px-6 flex items-center gap-8 overflow-x-auto hide-scrollbar">
                    {(["upcoming", "completed", "canceled"] as TabType[]).map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`py-4 relative text-sm font-bold transition-colors whitespace-nowrap ${activeTab === tab ? 'text-cyan-600' : 'text-gray-500 hover:text-gray-900'}`}
                        >
                            <span className="capitalize">{tab}</span>
                            {tabCounts[tab] > 0 && (
                                <span className={`ml-2 px-2 py-0.5 rounded-full text-[10px] bg-gray-100 text-gray-500 ${activeTab === tab ? 'bg-cyan-100 text-cyan-600' : ''}`}>
                                    {tabCounts[tab]}
                                </span>
                            )}
                            {activeTab === tab && (
                                <span className="absolute bottom-0 left-0 w-full h-1 bg-cyan-500 rounded-t-full"></span>
                            )}
                        </button>
                    ))}
                </div>

                {/* List Content */}
                <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
                    {appointments.length > 0 ? (
                        <div className="max-w-4xl mx-auto space-y-4">
                            {appointments.map((apt) => (
                                <article key={apt.id} className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-shadow relative">
                                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">

                                        <div className="flex items-start gap-4">
                                            <div className="w-14 h-14 bg-cyan-50 text-cyan-500 rounded-xl flex items-center justify-center font-bold text-xl flex-shrink-0">
                                                {apt.doctorName.charAt(4)}
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2 mb-1">
                                                    <h3 className="font-bold text-gray-900 text-lg">{apt.doctorName}</h3>
                                                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase ${apt.type === 'upcoming' ? 'bg-cyan-50 text-cyan-600' : apt.type === 'completed' ? 'bg-emerald-50 text-emerald-600' : 'bg-gray-100 text-gray-500'}`}>
                                                        {apt.status}
                                                    </span>
                                                </div>
                                                <p className="text-sm font-medium text-cyan-600">{apt.doctorSpecialty}</p>
                                                <p className="text-xs text-gray-500 mt-1">{apt.doctorQualification}</p>
                                            </div>
                                        </div>

                                        <div className="bg-gray-50 rounded-xl p-3 flex items-center gap-4 sm:min-w-[200px] border border-gray-100">
                                            <div className="w-10 h-10 bg-white shadow-sm rounded-full flex items-center justify-center text-cyan-500 flex-shrink-0">
                                                <Calendar className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-gray-900">{apt.date}</p>
                                                <p className="text-xs font-medium text-gray-500">{apt.time}</p>
                                            </div>
                                        </div>

                                    </div>

                                    <div className="mt-5 pt-4 border-t border-gray-100 flex flex-wrap items-center justify-between gap-4">
                                        <div className="flex items-center gap-3">
                                            <span className="bg-gray-100 text-gray-600 text-xs font-bold px-2 py-1 rounded-md tracking-wider">
                                                ID: {apt.appointmentNumber}
                                            </span>
                                            {apt.paymentStatus === 'paid' && (
                                                <span className="flex items-center gap-1 text-emerald-600 text-xs font-bold bg-emerald-50 px-2 py-1 rounded-md">
                                                    <CheckCircle2 className="w-3 h-3" /> Paid
                                                </span>
                                            )}
                                        </div>

                                        {/* Actions */}
                                        <div className="flex items-center gap-2 relative" ref={menuRef}>
                                            {activeTab === 'upcoming' && (
                                                <>
                                                    <div className="hidden sm:flex gap-2">
                                                        {apt.paymentStatus !== "paid" && (
                                                            <button onClick={() => handlePay(apt)} className="px-4 py-1.5 text-xs font-bold bg-cyan-50 text-cyan-600 hover:bg-cyan-500 hover:text-white rounded-lg transition-colors border border-cyan-100">Pay Now</button>
                                                        )}
                                                        <button onClick={() => handleReschedule(apt)} className="px-4 py-1.5 text-xs font-bold text-gray-600 hover:bg-gray-100 border border-gray-200 rounded-lg transition-colors">Reschedule</button>
                                                        <button onClick={() => handleCancel(apt)} className="px-4 py-1.5 text-xs font-bold text-rose-600 hover:bg-rose-50 border border-rose-100 rounded-lg transition-colors">Cancel</button>
                                                        <button onClick={() => handleMarkComplete(apt)} className="px-4 py-1.5 text-xs font-bold text-emerald-600 hover:bg-emerald-50 border border-emerald-100 rounded-lg transition-colors">Done</button>
                                                    </div>

                                                    <div className="sm:hidden">
                                                        <button onClick={() => setOpenMenuId(openMenuId === apt.id ? null : apt.id)} className="p-2 text-gray-500 bg-gray-50 rounded-lg">
                                                            <MoreHorizontal className="w-5 h-5" />
                                                        </button>
                                                        {openMenuId === apt.id && (
                                                            <div className="absolute right-0 bottom-12 bg-white border border-gray-100 shadow-xl rounded-xl w-40 p-1 z-20 animate-in fade-in zoom-in-95">
                                                                <button onClick={() => handlePay(apt)} className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg">Pay Now</button>
                                                                <button onClick={() => handleReschedule(apt)} className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg">Reschedule</button>
                                                                <button onClick={() => handleCancel(apt)} className="w-full text-left px-4 py-2 text-sm text-rose-600 hover:bg-rose-50 rounded-lg">Cancel</button>
                                                                <button onClick={() => handleMarkComplete(apt)} className="w-full text-left px-4 py-2 text-sm text-emerald-600 hover:bg-emerald-50 rounded-lg">Mark Complete</button>
                                                            </div>
                                                        )}
                                                    </div>
                                                </>
                                            )}
                                            {activeTab !== 'upcoming' && (
                                                <button onClick={() => router.push(`/appointment/${apt.doctorId}`)} className="px-4 py-1.5 text-xs font-bold bg-cyan-50 text-cyan-600 hover:bg-cyan-500 hover:text-white rounded-lg transition-colors">
                                                    Book Again
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </article>
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center p-12 text-center bg-white rounded-3xl border border-gray-100 border-dashed max-w-2xl mx-auto mt-10 shadow-sm">
                            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-6 text-gray-400">
                                <Calendar className="w-10 h-10" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">No {activeTab} appointments</h3>
                            <p className="text-gray-500 mb-8 max-w-sm">Looks like you don&apos;t have any {activeTab} appointments. Need a doctor?</p>
                            <button
                                onClick={() => router.push("/home")}
                                className="px-6 py-3 bg-cyan-500 hover:bg-cyan-600 text-white font-bold rounded-xl transition-colors shadow-lg shadow-cyan-200/50 flex items-center gap-2"
                            >
                                <Search className="w-5 h-5" /> Browse Doctors
                            </button>
                        </div>
                    )}
                </div>
            </main>

            {/* Mobile Bottom Nav */}
            <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 py-2 px-6 flex justify-between items-center z-50">
                {navItems.map(item => (
                    <button
                        key={item.id}
                        onClick={item.action}
                        className={`flex flex-col items-center gap-1 relative p-2 rounded-xl transition-colors ${item.id === 'appointments' ? 'text-cyan-600' : 'text-gray-400'}`}
                    >
                        <item.icon className="w-5 h-5" />
                        <span className={`text-[10px] font-medium ${item.id === 'appointments' ? 'font-bold' : ''}`}>
                            {item.short}
                        </span>
                        {item.id === 'appointments' && tabCounts.upcoming > 0 && (
                            <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-rose-500 rounded-full ring-2 ring-white"></span>
                        )}
                    </button>
                ))}
            </nav>
        </div>
    );
}
