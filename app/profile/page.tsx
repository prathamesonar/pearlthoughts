"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
    Activity, Calendar, ChevronLeft, Droplet, FileText,
    LogOut, Menu, Phone, Search, ShieldAlert, User, X, MapPin
} from "lucide-react";
import mockData from "@/data/mockData.json";

export default function ProfilePage() {
    const router = useRouter();
    const [userName, setUserName] = useState("");
    const [userEmail, setUserEmail] = useState("");
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [activeTab, setActiveTab] = useState("profile");
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

    const user = mockData.testUser;

    return (
        <div className="min-h-screen bg-gray-50 flex font-sans">
            {/* Sidebar */}
            <aside className={`hidden md:flex flex-col bg-white border-r border-gray-100 transition-all duration-300 ${sidebarCollapsed ? 'w-20' : 'w-64'} z-20`}>
                <div className="h-16 flex items-center justify-between px-4 border-b border-gray-100">
                    <div className="flex items-center gap-2 text-cyan-500 overflow-hidden">
                        <User className="w-8 h-8 flex-shrink-0" />
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
                                {user.avatar ? <img src={user.avatar} className="w-full h-full object-cover" /> : userName.charAt(0)}
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
                            <h1 className="text-2xl font-black text-gray-900">My Profile</h1>
                            <p className="text-sm text-gray-500">Manage your personal information and settings</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <button className="md:hidden p-2 text-gray-400 hover:text-cyan-600" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
                            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                        </button>
                    </div>
                </header>

                <div className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
                    <div className="max-w-4xl mx-auto space-y-8">

                        {/* Summary / Hero Card */}
                        <section className="bg-white rounded-[2rem] border border-gray-100 p-8 shadow-sm flex flex-col sm:flex-row items-center sm:items-start gap-8 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 z-0"></div>

                            <div className="relative z-10">
                                <div className="w-32 h-32 rounded-3xl bg-gray-100 border-4 border-white shadow-lg overflow-hidden flex items-center justify-center text-4xl font-black text-gray-400">
                                    {user.avatar ? <img src={user.avatar} className="w-full h-full object-cover" /> : userName.charAt(0)}
                                </div>
                            </div>

                            <div className="relative z-10 flex-1 text-center sm:text-left">
                                <h2 className="text-3xl font-black text-gray-900 mb-1">{userName}</h2>
                                <p className="text-gray-500 font-medium mb-6">{userEmail} • {user.mobile}</p>

                                <div className="flex flex-wrap justify-center sm:justify-start gap-4">
                                    <div className="flex items-center gap-2 bg-gray-50 px-4 py-2 rounded-xl border border-gray-100">
                                        <Calendar className="w-4 h-4 text-cyan-500" />
                                        <span className="text-sm font-bold text-gray-700">{user.dob}</span>
                                    </div>
                                    <div className="flex items-center gap-2 bg-gray-50 px-4 py-2 rounded-xl border border-gray-100">
                                        <User className="w-4 h-4 text-cyan-500" />
                                        <span className="text-sm font-bold text-gray-700">{user.gender}</span>
                                    </div>
                                    <div className="flex items-center gap-2 bg-rose-50 px-4 py-2 rounded-xl border border-rose-100">
                                        <Droplet className="w-4 h-4 text-rose-500" />
                                        <span className="text-sm font-bold text-rose-700">{user.bloodGroup} Blood</span>
                                    </div>
                                </div>
                            </div>
                        </section>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {/* Emergency Contact */}
                            <section className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm">
                                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2 mb-6"><Phone className="w-5 h-5 text-rose-500" /> Emergency Contact</h3>
                                <div className="bg-rose-50 border border-rose-100 rounded-2xl p-5 flex items-center justify-between">
                                    <div>
                                        <p className="font-bold text-gray-900 text-lg">{user.emergencyContact.name}</p>
                                        <p className="text-sm text-rose-600 font-medium mb-2">{user.emergencyContact.relation}</p>
                                        <p className="text-gray-700 font-bold">{user.emergencyContact.phone}</p>
                                    </div>
                                    <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm text-rose-500">
                                        <Phone className="w-5 h-5" />
                                    </div>
                                </div>
                            </section>

                            {/* Address Details */}
                            <section className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm">
                                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2 mb-6"><MapPin className="w-5 h-5 text-cyan-500" /> Primary Address</h3>
                                <div className="bg-gray-50 rounded-2xl p-5 border border-gray-100 text-gray-700 font-medium leading-relaxed">
                                    <p>{user.address}</p>
                                    <div className="mt-4 pt-4 border-t border-gray-200">
                                        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1">City/Area</span>
                                        <span className="font-bold text-gray-900">{user.location}</span>
                                    </div>
                                </div>
                            </section>

                            {/* Medical Information */}
                            <section className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm md:col-span-2">
                                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2 mb-6"><ShieldAlert className="w-5 h-5 text-amber-500" /> Medical Alerts &amp; Conditions</h3>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                    <div>
                                        <h4 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3">Known Allergies</h4>
                                        {user.allergies.length > 0 ? (
                                            <div className="flex flex-wrap gap-2">
                                                {user.allergies.map((allergy, i) => (
                                                    <span key={i} className="px-3 py-1.5 bg-amber-50 text-amber-700 border border-amber-200 rounded-lg text-sm font-bold">
                                                        {allergy}
                                                    </span>
                                                ))}
                                            </div>
                                        ) : (
                                            <p className="text-sm text-gray-500">No known allergies reported.</p>
                                        )}
                                    </div>

                                    <div>
                                        <h4 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3">Chronic Conditions</h4>
                                        {user.chronicConditions.length > 0 ? (
                                            <div className="flex flex-wrap gap-2">
                                                {user.chronicConditions.map((condition, i) => (
                                                    <span key={i} className="px-3 py-1.5 bg-cyan-50 text-cyan-700 border border-cyan-200 rounded-lg text-sm font-bold">
                                                        {condition}
                                                    </span>
                                                ))}
                                            </div>
                                        ) : (
                                            <p className="text-sm text-gray-500">No chronic conditions reported.</p>
                                        )}
                                    </div>
                                </div>
                            </section>

                        </div>
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
                                {user.avatar ? <img src={user.avatar} className="w-full h-full object-cover" /> : userName.charAt(0)}
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
