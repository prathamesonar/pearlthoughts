"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import mockData from "@/data/mockData.json";
import {
    Activity, Calendar, Clock, LogOut, Menu, Settings, Users,
    Wallet, ShieldCheck, X, CheckCircle2, ChevronRight, Edit3, Save, Power, Star, FileText, Plus, Pill
} from "lucide-react";
import { prescriptionStore, Prescription, Medication } from "@/app/lib/prescriptionStore";

export default function DoctorDashboard() {
    const router = useRouter();
    const [doctorId, setDoctorId] = useState<number | null>(null);
    const [doctor, setDoctor] = useState<any>(null);
    const [isClient, setIsClient] = useState(false);
    const [activeTab, setActiveTab] = useState("overview");

    // Edit states
    const [isEditingFees, setIsEditingFees] = useState(false);
    const [editFee, setEditFee] = useState(0);

    const [isEditingTiming, setIsEditingTiming] = useState(false);
    const [editStartTime, setEditStartTime] = useState("10:00");
    const [editEndTime, setEditEndTime] = useState("17:00");
    const [editSlotDuration, setEditSlotDuration] = useState(30);
    const [editMaxPatients, setEditMaxPatients] = useState(1);

    const [appointments, setAppointments] = useState<any[]>([]);

    // Prescription states
    const [prescriptionModal, setPrescriptionModal] = useState<{ open: boolean; appointmentId?: number; patientName?: string; patientEmail?: string; }>({ open: false });
    const [prescDiagnosis, setPrescDiagnosis] = useState("");
    const [prescNotes, setPrescNotes] = useState("");
    const [prescFollowUp, setPrescFollowUp] = useState("");
    const [prescMedications, setPrescMedications] = useState<Medication[]>([{ id: "1", name: "", dosage: "", frequency: "", duration: "" }]);

    const handleSavePrescription = () => {
        if (!prescriptionModal.appointmentId || !doctor || !prescDiagnosis) {
            alert("Diagnosis is required.");
            return;
        }
        const filteredMeds = prescMedications.filter(m => m.name.trim() !== "");
        const newPresc: Prescription = {
            id: Date.now().toString(),
            appointmentId: prescriptionModal.appointmentId.toString(),
            doctorId: doctor.id.toString(),
            doctorName: doctor.name,
            specialty: doctor.specialty,
            patientEmail: prescriptionModal.patientEmail || mockData.testUser.email,
            date: new Date().toISOString(),
            diagnosis: prescDiagnosis,
            medications: filteredMeds,
            notes: prescNotes,
            followUpDate: prescFollowUp || undefined
        };
        prescriptionStore.save(newPresc);
        alert("Prescription saved successfully!");
        setPrescriptionModal({ open: false });
        setPrescDiagnosis("");
        setPrescNotes("");
        setPrescFollowUp("");
        setPrescMedications([{ id: "1", name: "", dosage: "", frequency: "", duration: "" }]);
    };

    useEffect(() => {
        setIsClient(true);
        const sid = localStorage.getItem("doctorSessionId");
        if (!sid) {
            router.push("/doctor/login");
            return;
        }
        const id = parseInt(sid, 10);
        setDoctorId(id);

        // Load overrides and base profile
        const base = (mockData.doctors as any[]).find(d => d.id === id);
        if (!base) {
            router.push("/doctor/login");
            return;
        }

        let merged = { ...base };
        try {
            const raw = localStorage.getItem("doctorOverrides");
            if (raw) {
                const ovs = JSON.parse(raw);
                if (ovs[id]) merged = { ...merged, ...ovs[id] };
            }
        } catch { }

        setDoctor(merged);
        setEditFee(merged.consultationFee);

        // Default slot times based on existing or default
        if (merged.defaultStartTime) setEditStartTime(merged.defaultStartTime);
        if (merged.defaultEndTime) setEditEndTime(merged.defaultEndTime);
        if (merged.slotDurationMinutes) setEditSlotDuration(merged.slotDurationMinutes);
        if (merged.maxPatientsPerSlot) setEditMaxPatients(merged.maxPatientsPerSlot);

        // Load appointments
        try {
            const userAppts = localStorage.getItem("appointments");
            const allApts = userAppts ? JSON.parse(userAppts) : mockData.appointments;
            setAppointments(allApts.filter((a: any) => a.doctorId === id));
        } catch {
            setAppointments(mockData.appointments.filter((a: any) => a.doctorId === id));
        }

    }, [router]);

    if (!isClient || !doctor) return <div className="min-h-screen flex items-center justify-center"><Activity className="w-8 h-8 text-cyan-500 animate-spin" /></div>;

    const handleSaveOverrides = (updates: any) => {
        try {
            const raw = localStorage.getItem("doctorOverrides");
            const ovs = raw ? JSON.parse(raw) : {};
            ovs[doctor.id] = { ...(ovs[doctor.id] || {}), ...updates };
            localStorage.setItem("doctorOverrides", JSON.stringify(ovs));

            setDoctor((p: any) => ({ ...p, ...updates }));
            alert("Changes saved successfully!");
        } catch (e) {
            alert("Failed to save changes.");
        }
    };

    const toggleAvailability = () => {
        handleSaveOverrides({ available: !doctor.available });
    };

    const handleLogout = () => {
        localStorage.removeItem("doctorSessionId");
        router.push("/doctor/login");
    };

    const upcomingAppts = appointments.filter(a => a.type === "upcoming" || a.status === "Confirmed");

    return (
        <div className="min-h-screen bg-gray-50 flex font-sans">

            {/* Sidebar */}
            <aside className="hidden md:flex flex-col w-64 bg-white border-r border-gray-100 shadow-sm z-10 relative">
                <div className="h-20 flex items-center px-6 border-b border-gray-100">
                    <div className="flex items-center gap-2 text-cyan-600">
                        <Activity className="w-8 h-8" />
                        <span className="text-xl font-black text-gray-900 tracking-tight">Provider Portal</span>
                    </div>
                </div>

                <div className="p-6 border-b border-gray-100 flex flex-col items-center text-center">
                    <div className="w-20 h-20 rounded-2xl bg-gray-100 border-4 border-white shadow-md overflow-hidden mb-3 relative">
                        {doctor.image ? <img src={doctor.image} alt={doctor.name} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-2xl font-bold text-gray-400 bg-gray-100">{doctor.name.charAt(0)}</div>}
                        <div className={`absolute bottom-0 right-0 w-4 h-4 rounded-full border-2 border-white \${doctor.available ? 'bg-emerald-500' : 'bg-gray-400'}`}></div>
                    </div>
                    <h2 className="font-bold text-gray-900 leading-tight">Doctor 👋</h2>
                    <p className="text-xs font-bold text-cyan-600 uppercase tracking-widest mt-1">{doctor.specialty}</p>
                </div>

                <nav className="flex-1 overflow-y-auto px-4 py-6 space-y-2">
                    {[
                        { id: "overview", label: "Dashboard Overview", icon: Activity },
                        { id: "appointments", label: "Patient Appointments", icon: Users },
                        { id: "slots", label: "Slot Configuration", icon: Clock },
                        { id: "settings", label: "Fees & Profile", icon: Wallet }
                    ].map(item => (
                        <button
                            key={item.id}
                            onClick={() => setActiveTab(item.id)}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-bold text-sm \${activeTab === item.id ? 'bg-cyan-500 text-white shadow-md shadow-cyan-200/50' : 'text-gray-500 hover:bg-gray-50 hover:text-cyan-600'}`}
                        >
                            <item.icon className="w-5 h-5" /> {item.label}
                        </button>
                    ))}
                </nav>

                <div className="p-4 border-t border-gray-100">
                    <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-rose-500 hover:bg-rose-50 rounded-xl transition-colors">
                        <LogOut className="w-5 h-5" /> Sign Out
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col h-screen overflow-y-auto relative">
                <header className="h-20 bg-white border-b border-gray-100 flex items-center justify-between px-6 sm:px-10 sticky top-0 z-20">
                    <div>
                        <h1 className="text-2xl font-black text-gray-900 capitalize tracking-tight">{activeTab.replace("-", " ")}</h1>
                    </div>

                    <div className="flex items-center gap-4 border border-gray-200 rounded-full p-1 pl-4 pr-1 bg-gray-50">
                        <span className="text-sm font-bold text-gray-600 uppercase tracking-wide mr-2">Status</span>
                        <button
                            onClick={toggleAvailability}
                            className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2 shadow-sm \${doctor.available ? 'bg-emerald-500 text-white shadow-emerald-200' : 'bg-gray-200 text-gray-500 hover:bg-gray-300'}`}
                        >
                            <Power className="w-3.5 h-3.5" /> {doctor.available ? "Online" : "Offline"}
                        </button>
                    </div>
                </header>

                <div className="p-6 sm:p-10 space-y-8 max-w-6xl mx-auto w-full">

                    {/* Overview Tab */}
                    {activeTab === "overview" && (
                        <>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm flex items-center gap-5">
                                    <div className="w-14 h-14 bg-cyan-50 text-cyan-600 rounded-2xl flex items-center justify-center">
                                        <Users className="w-7 h-7" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-gray-500 uppercase tracking-wider">Total Patients</p>
                                        <p className="text-3xl font-black text-gray-900 mt-1">{doctor.patients}</p>
                                    </div>
                                </div>
                                <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm flex items-center gap-5">
                                    <div className="w-14 h-14 bg-amber-50 text-amber-500 rounded-2xl flex items-center justify-center">
                                        <Star className="w-7 h-7 fill-amber-500" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-gray-500 uppercase tracking-wider">Reviews</p>
                                        <p className="text-3xl font-black text-gray-900 mt-1">{doctor.reviews}</p>
                                    </div>
                                </div>
                                <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm flex items-center gap-5">
                                    <div className="w-14 h-14 bg-emerald-50 text-emerald-500 rounded-2xl flex items-center justify-center">
                                        <Calendar className="w-7 h-7" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-gray-500 uppercase tracking-wider">Upcoming</p>
                                        <p className="text-3xl font-black text-gray-900 mt-1">{upcomingAppts.length}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                                <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                                    <h3 className="font-bold text-lg text-gray-900 flex items-center gap-2">
                                        <Clock className="w-5 h-5 text-cyan-500" /> Today&apos;s Appointments
                                    </h3>
                                    <button onClick={() => setActiveTab("appointments")} className="text-sm font-bold text-cyan-600 hover:text-cyan-700">View All</button>
                                </div>
                                <div className="divide-y divide-gray-50">
                                    {upcomingAppts.slice(0, 5).map(apt => (
                                        <div key={apt.id} className="p-4 px-6 hover:bg-gray-50 transition-colors flex items-center justify-between">
                                            <div>
                                                <p className="font-bold text-gray-900">{apt.doctorName === doctor.name ? "Patient" : apt.doctorName} (Token: {apt.tokenNumber})</p>
                                                <p className="text-sm font-medium text-gray-500">{apt.date}</p>
                                            </div>
                                            <div className="text-right">
                                                <span className="inline-block px-3 py-1 bg-cyan-100 text-cyan-700 text-xs font-bold rounded-full">{apt.time}</span>
                                            </div>
                                        </div>
                                    ))}
                                    {upcomingAppts.length === 0 && (
                                        <div className="p-10 text-center text-gray-500">No appointments scheduled for today.</div>
                                    )}
                                </div>
                            </div>
                        </>
                    )}

                    {/* Settings Tab */}
                    {activeTab === "settings" && (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                            {/* Consultation Fee */}
                            <div className="bg-white rounded-3xl border border-gray-100 p-8 shadow-sm">
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="text-xl font-bold text-gray-900 flex items-center gap-3">
                                        <Wallet className="w-6 h-6 text-emerald-500" /> Consultation Fee
                                    </h3>
                                    <button onClick={() => {
                                        if (isEditingFees) handleSaveOverrides({ consultationFee: editFee });
                                        setIsEditingFees(!isEditingFees);
                                    }} className="flex items-center gap-2 text-sm font-bold text-cyan-600 bg-cyan-50 px-3 py-1.5 rounded-lg hover:bg-cyan-100">
                                        {isEditingFees ? <><Save className="w-4 h-4" /> Save</> : <><Edit3 className="w-4 h-4" /> Edit</>}
                                    </button>
                                </div>

                                <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100 flex items-center justify-between">
                                    <span className="text-gray-600 font-medium">Standard Patient Visit</span>
                                    {isEditingFees ? (
                                        <div className="relative">
                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-gray-500">₹</span>
                                            <input type="number" value={editFee} onChange={(e) => setEditFee(Number(e.target.value))} className="w-32 pl-8 pr-4 py-2 border border-cyan-300 rounded-xl font-black text-gray-900 outline-none focus:ring-2 focus:ring-cyan-100 bg-white shadow-inner" />
                                        </div>
                                    ) : (
                                        <span className="text-2xl font-black text-gray-900">₹{doctor.consultationFee}</span>
                                    )}
                                </div>
                            </div>

                            {/* Profile Overview (Read Only mostly) */}
                            <div className="bg-white rounded-3xl border border-gray-100 p-8 shadow-sm space-y-6">
                                <h3 className="text-xl font-bold text-gray-900 flex items-center gap-3">
                                    <ShieldCheck className="w-6 h-6 text-cyan-500" /> Professional Info
                                </h3>

                                <div>
                                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Affiliation</label>
                                    <p className="font-bold text-gray-900">{doctor.affiliation}</p>
                                </div>
                                <div className="w-full h-px bg-gray-100"></div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Qualifications</label>
                                    <p className="font-bold text-gray-900">{doctor.qualification}</p>
                                </div>
                                <div className="w-full h-px bg-gray-100"></div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">About</label>
                                    <p className="font-medium text-gray-600 leading-relaxed text-sm">{doctor.about}</p>
                                </div>
                            </div>

                        </div>
                    )}

                    {/* Slots Tab */}
                    {activeTab === "slots" && (
                        <div className="bg-white rounded-3xl border border-gray-100 p-8 shadow-sm">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                                <div>
                                    <h3 className="text-xl font-bold text-gray-900 flex items-center gap-3 mb-1">
                                        <Calendar className="w-6 h-6 text-cyan-500" /> Schedule Configuration
                                    </h3>
                                    <p className="text-sm text-gray-500">Control your working hours and slot durations.</p>
                                </div>
                                <button onClick={() => {
                                    if (isEditingTiming) {
                                        handleSaveOverrides({
                                            defaultStartTime: editStartTime,
                                            defaultEndTime: editEndTime,
                                            slotDurationMinutes: editSlotDuration,
                                            maxPatientsPerSlot: editMaxPatients
                                        });
                                    }
                                    setIsEditingTiming(!isEditingTiming);
                                }} className="flex items-center justify-center gap-2 text-sm font-bold text-white bg-cyan-500 px-6 py-2.5 rounded-xl hover:bg-cyan-600 shadow-md shadow-cyan-200">
                                    {isEditingTiming ? <><Save className="w-4 h-4" /> Save Configuration</> : <><Edit3 className="w-4 h-4" /> Modify Schedule</>}
                                </button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Working Hours */}
                                <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
                                    <h4 className="font-bold text-gray-900 mb-4 border-b border-gray-200 pb-3">Daily Working Hours</h4>
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Start Time</label>
                                            <input type="time" disabled={!isEditingTiming} value={editStartTime} onChange={(e) => setEditStartTime(e.target.value)} className="w-full px-4 py-2 bg-white border border-gray-200 rounded-xl disabled:opacity-75 disabled:bg-gray-100 font-bold focus:ring-2 focus:ring-cyan-100 outline-none text-gray-900" />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">End Time</label>
                                            <input type="time" disabled={!isEditingTiming} value={editEndTime} onChange={(e) => setEditEndTime(e.target.value)} className="w-full px-4 py-2 bg-white border border-gray-200 rounded-xl disabled:opacity-75 disabled:bg-gray-100 font-bold focus:ring-2 focus:ring-cyan-100 outline-none text-gray-900" />
                                        </div>
                                    </div>
                                </div>

                                {/* Slot Config */}
                                <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
                                    <h4 className="font-bold text-gray-900 mb-4 border-b border-gray-200 pb-3">Slot Settings</h4>
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Slot Duration (Minutes)</label>
                                            <select disabled={!isEditingTiming} value={editSlotDuration} onChange={(e) => setEditSlotDuration(Number(e.target.value))} className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl disabled:opacity-75 disabled:bg-gray-100 font-bold focus:ring-2 focus:ring-cyan-100 outline-none text-gray-900">
                                                <option value={15}>15 Minutes</option>
                                                <option value={20}>20 Minutes</option>
                                                <option value={30}>30 Minutes</option>
                                                <option value={45}>45 Minutes</option>
                                                <option value={60}>1 Hour</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Max Patients Per Slot</label>
                                            <input type="number" min="1" max="50" disabled={!isEditingTiming} value={editMaxPatients} onChange={(e) => setEditMaxPatients(Number(e.target.value))} className="w-full px-4 py-2 bg-white border border-gray-200 rounded-xl disabled:opacity-75 disabled:bg-gray-100 font-bold focus:ring-2 focus:ring-cyan-100 outline-none text-gray-900" />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-6 bg-cyan-50 rounded-xl p-4 flex gap-3 text-cyan-800 text-sm">
                                <Activity className="w-5 h-5 flex-shrink-0 text-cyan-600" />
                                <p><strong>Note:</strong> Adjusting these parameters will instantly change patient facing portals for booking new slots. Existing bookings remain unaffected.</p>
                            </div>
                        </div>
                    )}

                    {/* Appointments Tab */}
                    {activeTab === "appointments" && (
                        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                                <h3 className="font-bold text-xl text-gray-900 flex items-center gap-3">
                                    <Users className="w-6 h-6 text-cyan-500" /> All Appointments
                                </h3>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-gray-50 border-b border-gray-200">
                                            <th className="py-4 px-6 font-bold text-xs uppercase tracking-wider text-gray-500">Date &amp; Time</th>
                                            <th className="py-4 px-6 font-bold text-xs uppercase tracking-wider text-gray-500">Patient</th>
                                            <th className="py-4 px-6 font-bold text-xs uppercase tracking-wider text-gray-500">Token ID</th>
                                            <th className="py-4 px-6 font-bold text-xs uppercase tracking-wider text-gray-500">Status</th>
                                            <th className="py-4 px-6 font-bold text-xs uppercase tracking-wider text-gray-500 text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {appointments.map(apt => (
                                            <tr key={apt.id} className="hover:bg-gray-50/50 transition-colors">
                                                <td className="py-4 px-6">
                                                    <p className="font-bold text-gray-900">{apt.date}</p>
                                                    <p className="text-xs font-bold text-cyan-600">{apt.time}</p>
                                                </td>
                                                <td className="py-4 px-6 font-medium text-gray-800">
                                                    {apt.doctorName === doctor.name ? mockData.testUser.name : "Patient"}
                                                </td>
                                                <td className="py-4 px-6">
                                                    <span className="bg-gray-100 text-gray-600 text-xs font-bold px-3 py-1 rounded-full">{apt.tokenNumber}</span>
                                                </td>
                                                <td className="py-4 px-6">
                                                    <span className={`text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide \${apt.type === 'upcoming' ? 'bg-amber-100 text-amber-700' : apt.type === 'completed' ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'}`}>
                                                        {apt.status}
                                                    </span>
                                                </td>
                                                <td className="py-4 px-6 text-right">
                                                    {apt.type === 'completed' && (
                                                        <button
                                                            onClick={() => {
                                                                const exists = prescriptionStore.getByAppointmentId(apt.id.toString());
                                                                if (exists) {
                                                                    alert("Prescription already created for this appointment.");
                                                                } else {
                                                                    setPrescriptionModal({ open: true, appointmentId: apt.id, patientName: apt.doctorName === doctor.name ? mockData.testUser.name : "Patient", patientEmail: mockData.testUser.email });
                                                                }
                                                            }}
                                                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-cyan-50 text-cyan-600 hover:bg-cyan-500 hover:text-white rounded-lg text-xs font-bold transition-colors"
                                                        >
                                                            <FileText className="w-3.5 h-3.5" /> Prescribe
                                                        </button>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                {appointments.length === 0 && (
                                    <div className="p-16 flex flex-col items-center justify-center text-center">
                                        <div className="w-16 h-16 bg-gray-50 flex items-center justify-center rounded-full mb-4">
                                            <Users className="w-8 h-8 text-gray-400" />
                                        </div>
                                        <p className="text-lg font-bold text-gray-900">No Patient History Found</p>
                                        <p className="text-sm text-gray-500 mt-1 max-w-xs">You don&apos;t have any past or upcoming appointments scheduled.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                </div>
            </main>

            {/* Prescription Modal */}
            {prescriptionModal.open && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm animate-in fade-in" onClick={() => setPrescriptionModal({ open: false })}>
                    <div className="bg-white rounded-3xl w-full max-w-2xl p-8 shadow-2xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                        <div className="flex justify-between items-start mb-6 border-b border-gray-100 pb-4">
                            <div>
                                <h3 className="text-xl font-black text-gray-900 flex items-center gap-2"><FileText className="w-5 h-5 text-cyan-500" /> Issue Prescription</h3>
                                <p className="text-sm text-gray-500 mt-1">For patient: <span className="font-bold text-gray-700">{prescriptionModal.patientName}</span></p>
                            </div>
                            <button onClick={() => setPrescriptionModal({ open: false })} className="text-gray-400 hover:text-gray-600"><X className="w-6 h-6" /></button>
                        </div>

                        <div className="space-y-6">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Primary Diagnosis <span className="text-rose-500">*</span></label>
                                <textarea value={prescDiagnosis} onChange={e => setPrescDiagnosis(e.target.value)} rows={2} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl font-medium focus:ring-2 focus:ring-cyan-100 outline-none" placeholder="e.g. Viral Pharyngitis"></textarea>
                            </div>

                            <div>
                                <div className="flex justify-between items-center mb-2">
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Medications</label>
                                    <button onClick={() => setPrescMedications([...prescMedications, { id: Date.now().toString(), name: "", dosage: "", frequency: "", duration: "" }])} className="text-xs font-bold text-cyan-600 flex items-center gap-1 hover:text-cyan-700"><Plus className="w-3.5 h-3.5" /> Add Drug</button>
                                </div>
                                <div className="space-y-3">
                                    {prescMedications.map((med, index) => (
                                        <div key={med.id} className="grid grid-cols-12 gap-2 items-start bg-gray-50 p-3 rounded-xl border border-gray-100">
                                            <div className="col-span-12 sm:col-span-1 flex items-center justify-center h-10 text-gray-400"><Pill className="w-5 h-5" /></div>
                                            <input className="col-span-11 sm:col-span-3 h-10 px-3 bg-white border border-gray-200 rounded-lg text-sm font-medium" placeholder="Medicine Name" value={med.name} onChange={e => { const nm = [...prescMedications]; nm[index].name = e.target.value; setPrescMedications(nm); }} />
                                            <input className="col-span-4 sm:col-span-3 h-10 px-3 bg-white border border-gray-200 rounded-lg text-sm" placeholder="Dosage (500mg)" value={med.dosage} onChange={e => { const nm = [...prescMedications]; nm[index].dosage = e.target.value; setPrescMedications(nm); }} />
                                            <input className="col-span-4 sm:col-span-2 h-10 px-3 bg-white border border-gray-200 rounded-lg text-sm" placeholder="Freq (1x)" value={med.frequency} onChange={e => { const nm = [...prescMedications]; nm[index].frequency = e.target.value; setPrescMedications(nm); }} />
                                            <input className="col-span-3 sm:col-span-2 h-10 px-3 bg-white border border-gray-200 rounded-lg text-sm" placeholder="Days (5d)" value={med.duration} onChange={e => { const nm = [...prescMedications]; nm[index].duration = e.target.value; setPrescMedications(nm); }} />
                                            <button onClick={() => setPrescMedications(prescMedications.filter((_, i) => i !== index))} className="col-span-1 sm:col-span-1 h-10 flex items-center justify-center text-rose-400 hover:bg-rose-50 rounded-lg"><X className="w-4 h-4" /></button>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Additional Notes</label>
                                    <textarea value={prescNotes} onChange={e => setPrescNotes(e.target.value)} rows={2} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl font-medium focus:ring-2 focus:ring-cyan-100 outline-none" placeholder="Drink plenty of water..."></textarea>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Follow-up Date</label>
                                    <input type="date" value={prescFollowUp} onChange={e => setPrescFollowUp(e.target.value)} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl font-bold focus:ring-2 focus:ring-cyan-100 outline-none text-gray-700" />
                                </div>
                            </div>
                        </div>

                        <div className="mt-8 pt-6 border-t border-gray-100 flex justify-end gap-3">
                            <button onClick={() => setPrescriptionModal({ open: false })} className="px-6 py-2.5 text-sm font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors">Cancel</button>
                            <button onClick={handleSavePrescription} className="px-6 py-2.5 text-sm font-bold text-white bg-cyan-500 hover:bg-cyan-600 rounded-xl transition-all shadow-md shadow-cyan-200 flex items-center gap-2"><CheckCircle2 className="w-4 h-4" /> Save Prescription</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
