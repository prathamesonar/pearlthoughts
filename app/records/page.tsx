"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
    Activity, ArrowRight, Calendar, ChevronLeft, Clock,
    Download, FileText, Heart, LogOut, Menu, Pill, Search, ShieldCheck, Thermometer, User, X
} from "lucide-react";
import mockData from "@/data/mockData.json";

export default function RecordsPage() {
    const router = useRouter();
    const [userName, setUserName] = useState("");
    const [userEmail, setUserEmail] = useState("");
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [activeTab, setActiveTab] = useState("records");
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
        const storedEmail = localStorage.getItem("userEmail");
        if (!storedEmail) {
            router.push("/login");
            return;
        }
        setUserName(mockData.testUser.name);
        setUserEmail(storedEmail);
    }, [router]);

    const handleLogout = () => {
        ["verificationPhone", "userEmail", "socialLogin", "favorites"].forEach(k => localStorage.removeItem(k));
        router.push("/login");
    };

    const upcomingCount = typeof window !== "undefined" ?
        (JSON.parse(localStorage.getItem("appointments") || "[]").length > 0 ? JSON.parse(localStorage.getItem("appointments") || "[]").filter((a: any) => a.type === "upcoming").length : mockData.appointments.filter(a => a.type === "upcoming").length)
        : 0;

    const navItems = [
        { id: "find", label: "Find a Doctor", short: "Find", icon: Search, path: "/home" },
        { id: "appointments", label: "Appointments", short: "Visits", icon: Calendar, path: "/appointments", badge: upcomingCount },
        { id: "records", label: "Medical Records", short: "Records", icon: FileText, path: "/records" },
        { id: "profile", label: "Profile", short: "Me", icon: User, path: "/profile" },
    ];

    if (!isClient) return null;

    const { vitalSigns, testReports, documents } = mockData.testUser;

    return (
        <div className="min-h-screen bg-gray-50 flex font-sans">
            {/* Sidebar */}
            <aside className={`hidden md:flex flex-col bg-white border-r border-gray-100 transition-all duration-300 ${sidebarCollapsed ? 'w-20' : 'w-64'} z-20`}>
                <div className="h-16 flex items-center justify-between px-4 border-b border-gray-100">
                    <div className="flex items-center gap-2 text-cyan-500 overflow-hidden">
                        <Activity className="w-8 h-8 flex-shrink-0" />
                        {!sidebarCollapsed && <span className="text-xl font-bold text-gray-900 whitespace-nowrap">Schedula</span>}
                    </div>
                    <button onClick={() => setSidebarCollapsed(!sidebarCollapsed)} className="p-1 rounded-md hover:bg-gray-100 text-gray-500">
                        <Menu className="w-5 h-5" />
                    </button>
                </div>

                <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
                    {navItems.map(item => {
                        const isActive = activeTab === item.id;
                        return (
                            <button key={item.id} onClick={() => router.push(item.path)} className={`w-full flex items-center p-3 rounded-xl transition-colors group ${isActive ? 'bg-cyan-50 text-cyan-600' : 'text-gray-900 font-semibold hover:bg-gray-100 hover:text-cyan-600'}`}>
                                <item.icon className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-cyan-600' : 'text-gray-400 group-hover:text-cyan-600'}`} />
                                {!sidebarCollapsed && <span className="ml-3 font-medium flex-1 text-left">{item.label}</span>}
                                {!sidebarCollapsed && item.badge && item.badge > 0 && (
                                    <span className="ml-2 bg-rose-100 text-rose-600 py-0.5 px-2 rounded-full text-xs font-bold">{item.badge}</span>
                                )}
                            </button>
                        )
                    })}
                </nav>

                <div className="p-4 border-t border-gray-100">
                    {!sidebarCollapsed ? (
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-cyan-100 flex items-center justify-center text-cyan-600 font-bold overflow-hidden">
                                {mockData.testUser.avatar ? <img src={mockData.testUser.avatar} className="w-full h-full object-cover" /> : userName.charAt(0)}
                            </div>
                            <div className="flex-1 overflow-hidden">
                                <p className="text-sm font-bold text-gray-900 truncate">{userName}</p>
                                <p className="text-xs text-gray-500 truncate">{userEmail}</p>
                            </div>
                            <button onClick={() => { if (confirm("Logout?")) handleLogout(); }} className="p-2 text-gray-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors">
                                <LogOut className="w-5 h-5" />
                            </button>
                        </div>
                    ) : (
                        <button onClick={() => { if (confirm("Logout?")) handleLogout(); }} className="w-full p-2 flex justify-center text-gray-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors">
                            <LogOut className="w-5 h-5" />
                        </button>
                    )}
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col h-screen overflow-hidden">
                <header className="bg-white border-b border-gray-100 px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 z-10 shadow-sm">
                    <div className="flex items-center gap-4">
                        <button onClick={() => router.push("/home")} className="md:hidden p-2 bg-gray-100 hover:bg-gray-200 rounded-full text-gray-600 transition-colors">
                            <ChevronLeft className="w-5 h-5" />
                        </button>
                        <div className="flex items-center gap-3 md:hidden">
                            <Activity className="w-7 h-7 text-cyan-500" />
                            <span className="text-xl font-bold text-gray-900">Schedula</span>
                        </div>
                        <div className="hidden md:block">
                            <h1 className="text-2xl font-black text-gray-900">Medical Records</h1>
                            <p className="text-sm text-gray-500">Your latest test results, vitals, and documents</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <button onClick={() => router.push("/prescriptions")} className="flex items-center gap-2 bg-white border border-cyan-200 text-cyan-600 hover:bg-cyan-50 px-4 py-2 rounded-xl text-sm font-bold transition-all shadow-sm">
                            <Pill className="w-4 h-4" /> Prescriptions
                        </button>
                        <button className="md:hidden p-2 text-gray-400 hover:text-cyan-600" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
                            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                        </button>
                    </div>
                </header>

                <div className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 space-y-8 max-w-7xl mx-auto w-full">
                    {/* Vitals Overview */}
                    <section>
                        <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2"><Activity className="w-5 h-5 text-rose-500" /> Recent Vitals</h2>
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                            {vitalSigns.slice(0, 4).map((vital, idx) => (
                                <div key={idx} className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
                                    <div className="flex justify-between items-start mb-2">
                                        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">{vital.label}</p>
                                        {vital.icon === 'bp' && <Heart className="w-5 h-5 text-rose-500" />}
                                        {vital.icon === 'heart' && <Activity className="w-5 h-5 text-emerald-500" />}
                                        {vital.icon === 'sugar' && <Activity className="w-5 h-5 text-blue-500" />}
                                        {vital.icon === 'spo2' && <Activity className="w-5 h-5 text-cyan-500" />}
                                    </div>
                                    <div className="flex items-baseline gap-1">
                                        <h3 className="text-2xl font-black text-gray-900">{vital.value}</h3>
                                        <span className="text-sm font-medium text-gray-500">{vital.unit}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Test Reports */}
                        <section>
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2"><FileText className="w-5 h-5 text-cyan-500" /> Lab Reports</h2>
                            </div>
                            <div className="space-y-4">
                                {testReports.map(report => (
                                    <div key={report.id} className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-shadow">
                                        <div className="flex justify-between items-start mb-3">
                                            <div>
                                                <h3 className="font-bold text-gray-900">{report.name}</h3>
                                                <p className="text-xs text-gray-500 flex items-center gap-1 mt-1"><Calendar className="w-3.5 h-3.5" /> {report.date} • {report.lab}</p>
                                            </div>
                                            <span className={`px-2 py-1 text-[10px] font-bold uppercase rounded-md ${report.status === 'Normal' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
                                                {report.status}
                                            </span>
                                        </div>
                                        <div className="grid grid-cols-2 gap-2 mb-4">
                                            {report.findings.slice(0, 4).map((finding, idx) => (
                                                <div key={idx} className="bg-gray-50 rounded-lg p-2 border border-gray-100 flex justify-between items-center text-sm">
                                                    <span className="text-gray-600 truncate mr-2" title={finding.test}>{finding.test}</span>
                                                    <span className={`font-bold ${finding.flag === 'H' ? 'text-rose-600' : finding.flag === 'L' ? 'text-blue-600' : 'text-gray-900'}`}>
                                                        {finding.result}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                        <button className="w-full py-2 bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-700 text-sm font-bold rounded-xl transition-colors flex items-center justify-center gap-2">
                                            <Search className="w-4 h-4" /> View Full Report
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </section>

                        {/* Documents */}
                        <section>
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2"><ShieldCheck className="w-5 h-5 text-blue-500" /> Medical Documents</h2>
                            </div>
                            <div className="space-y-4">
                                {documents.map(doc => (
                                    <div key={doc.id} className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm hover:shadow-md transition-shadow flex items-center gap-4 cursor-pointer group">
                                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${doc.type === 'Discharge' ? 'bg-rose-50 text-rose-500' : doc.type === 'Insurance' ? 'bg-emerald-50 text-emerald-500' : 'bg-blue-50 text-blue-500'}`}>
                                            <FileText className="w-6 h-6" />
                                        </div>
                                        <div className="flex-1 overflow-hidden">
                                            <h3 className="font-bold text-gray-900 truncate group-hover:text-cyan-600 transition-colors">{doc.name}</h3>
                                            <p className="text-xs text-gray-500 flex items-center gap-2 mt-1">
                                                <span>{doc.date}</span> • <span>{doc.pages} Pages</span>
                                            </p>
                                        </div>
                                        <button className="p-2 text-gray-400 hover:text-cyan-600 hover:bg-cyan-50 rounded-lg transition-colors">
                                            <Download className="w-5 h-5" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </section>
                    </div>
                </div>
            </main>

            {/* Mobile Bottom Nav */}
            <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 py-2 px-6 flex justify-between items-center z-40 pb-safe">
                {navItems.map(item => (
                    <button
                        key={item.id}
                        onClick={() => router.push(item.path)}
                        className={`flex flex-col items-center gap-1 relative p-2 rounded-xl transition-colors ${activeTab === item.id ? 'text-cyan-600' : 'text-gray-400'}`}
                    >
                        <item.icon className={`${activeTab === item.id ? 'w-6 h-6' : 'w-5 h-5'}`} />
                        <span className={`text-[10px] font-medium ${activeTab === item.id ? 'font-bold' : ''}`}>
                            {item.short}
                        </span>
                        {item.badge && item.badge > 0 && (
                            <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-rose-500 rounded-full ring-2 ring-white"></span>
                        )}
                    </button>
                ))}
            </nav>

            {/* Mobile Side Menu Overlay */}
            {isMobileMenuOpen && (
                <div className="md:hidden fixed inset-0 z-50 bg-black/50 flex">
                    <div className="w-64 bg-white h-full flex flex-col p-4 animate-in slide-in-from-left">
                        <div className="flex justify-between items-center mb-6">
                            <span className="text-xl font-bold text-gray-900">Menu</span>
                            <button onClick={() => setIsMobileMenuOpen(false)} className="text-gray-500"><X className="w-6 h-6" /></button>
                        </div>
                        <div className="flex items-center gap-3 mb-8 p-3 bg-gray-50 rounded-xl border border-gray-100">
                            <div className="w-10 h-10 rounded-full bg-cyan-100 flex items-center justify-center text-cyan-600 font-bold overflow-hidden">
                                {mockData.testUser.avatar ? <img src={mockData.testUser.avatar} className="w-full h-full object-cover" /> : userName.charAt(0)}
                            </div>
                            <div className="overflow-hidden">
                                <p className="text-sm font-bold text-gray-900 truncate">{userName}</p>
                                <p className="text-xs text-gray-500 truncate">{userEmail}</p>
                            </div>
                        </div>
                        <button onClick={() => { if (confirm("Logout?")) handleLogout(); }} className="mt-auto flex items-center gap-2 p-3 text-rose-500 font-bold hover:bg-rose-50 rounded-xl transition-colors">
                            <LogOut className="w-5 h-5" /> Logout
                        </button>
                    </div>
                    <div className="flex-1" onClick={() => setIsMobileMenuOpen(false)}></div>
                </div>
            )}
        </div>
    );
}
