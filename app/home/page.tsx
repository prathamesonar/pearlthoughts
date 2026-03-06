"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
    Search, Bell, LogOut, Menu, X,
    MapPin, Star, Heart, Calendar, FileText, User,
    ChevronRight, Activity, Clock
} from "lucide-react";

import mockData from "@/data/mockData.json";

interface Doctor {
    id: number;
    name: string;
    specialty: string;
    experience: string;
    available: boolean;
    timing: string;
    description: string;
    image: string;
    rating: number;
    consultationFee: number;
}

export default function HomePage() {
    const router = useRouter();
    const [searchQuery, setSearchQuery] = useState("");
    const [favorites, setFavorites] = useState<number[]>([]);
    const [activeTab, setActiveTab] = useState("find");
    const [notifications, setNotifications] = useState(3);
    const [userName, setUserName] = useState("");
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [activeSpecialty, setActiveSpecialty] = useState("All");
    const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
    const [showMobileSearch, setShowMobileSearch] = useState(false);
    const [doctors, setDoctors] = useState<Doctor[]>(mockData.doctors as Doctor[]);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    useEffect(() => {
        const storedEmail = localStorage.getItem("userEmail");
        if (!storedEmail) {
            router.push("/login");
            return;
        }
        setUserName(mockData.testUser.name);

        const loadDoctorsWithOverrides = () => {
            try {
                const raw = localStorage.getItem("doctorOverrides");
                if (raw) {
                    const overrides = JSON.parse(raw) as Record<
                        number,
                        Partial<Doctor> & {
                            availabilityDays?: string;
                            availabilityHours?: string;
                        }
                    >;
                    const merged = (mockData.doctors as Doctor[]).map((doc) => {
                        const ov = overrides[doc.id];
                        if (!ov) return doc;
                        const availability =
                            "availabilityDays" in ov || "availabilityHours" in ov
                                ? {
                                    ...(doc as any).availability,
                                    days: ov.availabilityDays ?? (doc as any).availability?.days,
                                    hours: ov.availabilityHours ?? (doc as any).availability?.hours,
                                }
                                : (doc as any).availability;
                        const { availabilityDays, availabilityHours, ...rest } = ov as any;
                        return { ...doc, ...rest, availability } as Doctor;
                    });
                    setDoctors(merged);
                } else {
                    setDoctors(mockData.doctors as Doctor[]);
                }
            } catch {
                setDoctors(mockData.doctors as Doctor[]);
            }
        };

        loadDoctorsWithOverrides();
        const savedFavorites = localStorage.getItem("favorites");
        if (savedFavorites) setFavorites(JSON.parse(savedFavorites));

        const handleFocus = () => loadDoctorsWithOverrides();
        const handleStorage = (e: StorageEvent) => {
            if (e.key === "doctorOverrides") {
                loadDoctorsWithOverrides();
            }
        };

        window.addEventListener("focus", handleFocus);
        window.addEventListener("storage", handleStorage);

        return () => {
            window.removeEventListener("focus", handleFocus);
            window.removeEventListener("storage", handleStorage);
        };
    }, [router]);

    const specialties = useMemo(() => {
        const specs = Array.from(new Set(doctors.map((d) => d.specialty)));
        return ["All", ...specs];
    }, [doctors]);

    const filteredDoctors = useMemo(() => {
        let docs = doctors as Doctor[];
        if (activeSpecialty !== "All") {
            docs = docs.filter((d) => d.specialty === activeSpecialty);
        }
        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase();
            docs = docs.filter(
                (d) =>
                    d.name.toLowerCase().includes(q) ||
                    d.specialty.toLowerCase().includes(q)
            );
        }
        return docs;
    }, [searchQuery, activeSpecialty, doctors]);

    const toggleFavorite = (doctorId: number) => {
        const updated = favorites.includes(doctorId)
            ? favorites.filter((id) => id !== doctorId)
            : [...favorites, doctorId];
        setFavorites(updated);
        localStorage.setItem("favorites", JSON.stringify(updated));
    };

    const handleDoctorClick = (doctor: Doctor) => {
        router.push(`/appointment/${doctor.id}`);
    };

    const handleLogout = () => {
        localStorage.removeItem("verificationPhone");
        localStorage.removeItem("userEmail");
        localStorage.removeItem("socialLogin");
        localStorage.removeItem("favorites");
        router.push("/login");
    };

    const handleNotificationClick = () => {
        setNotifications(0);
        alert(
            "📬 Notifications:\\n\\n✓ Appointment with Dr. Prakash Das confirmed for tomorrow 10:00 AM\\n✓ Dr. Sarah Johnson sent you a message\\n✓ 2 new doctors available in your area"
        );
    };

    const upcomingCount = mockData.appointments.filter(
        (a) => a.type === "upcoming"
    ).length;

    const navItems = [
        { id: "find", label: "Find a Doctor", icon: Search, path: "/home" },
        { id: "appointments", label: "Appointments", icon: Calendar, path: "/appointments", badge: upcomingCount },
        { id: "records", label: "Medical Records", icon: FileText, action: () => alert("📋 Medical Records coming soon!") },
        { id: "profile", label: "Profile", icon: User, action: () => alert("User Profile Coming Soon!") },
    ];

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row font-sans">

            {/* ========== SIDEBAR (Desktop) ========== */}
            <aside className={`hidden md:flex flex-col bg-white border-r border-gray-100 transition-all duration-300 \${sidebarCollapsed ? 'w-20' : 'w-64'}`}>
                <div className="h-16 flex items-center justify-between px-4 border-b border-gray-100">
                    <div className="flex items-center gap-2 text-cyan-500 overflow-hidden">
                        <Activity className="w-8 h-8 flex-shrink-0" />
                        {!sidebarCollapsed && <span className="text-xl font-bold text-gray-900 whitespace-nowrap">Schedula</span>}
                    </div>
                    <button onClick={() => setSidebarCollapsed(!sidebarCollapsed)} className="p-1 rounded-md hover:bg-gray-100 text-gray-500">
                        <Menu className="w-5 h-5" />
                    </button>
                </div>

                <nav className="flex-1 overflow-y-auto py-4">
                    <ul className="space-y-1 px-3">
                        {navItems.map((item) => {
                            const Icon = item.icon;
                            const isActive = activeTab === item.id;

                            const btnContent = (
                                <button
                                    onClick={() => {
                                        if (item.path) {
                                            router.push(item.path);
                                            setActiveTab(item.id);
                                        } else if (item.action) {
                                            item.action();
                                        }
                                    }}
                                    className={`w-full flex items-center p-3 rounded-xl transition-all duration-200 group \${isActive ? 'bg-cyan-50 text-cyan-600' : 'text-gray-600 hover:bg-gray-50 hover:text-cyan-600'}`}
                                    title={sidebarCollapsed ? item.label : undefined}
                                >
                                    <Icon className={`w-5 h-5 flex-shrink-0 \${isActive ? 'text-cyan-600' : 'text-gray-400 group-hover:text-cyan-600'}`} />
                                    {!sidebarCollapsed && (
                                        <span className="ml-3 font-medium whitespace-nowrap flex-1 text-left">{item.label}</span>
                                    )}
                                    {item.badge && item.badge > 0 && !sidebarCollapsed && (
                                        <span className="ml-2 bg-rose-100 text-rose-600 py-0.5 px-2 rounded-full text-xs font-bold">
                                            {item.badge}
                                        </span>
                                    )}
                                    {item.badge && item.badge > 0 && sidebarCollapsed && (
                                        <span className="absolute right-2 top-2 bg-rose-500 w-2 h-2 rounded-full"></span>
                                    )}
                                </button>
                            );

                            return <li key={item.id} className="relative">{btnContent}</li>;
                        })}
                    </ul>
                </nav>

                <div className="p-4 border-t border-gray-100">
                    {!sidebarCollapsed ? (
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-cyan-100 flex items-center justify-center text-cyan-600 font-bold">
                                {userName.charAt(0)}
                            </div>
                            <div className="flex-1 overflow-hidden">
                                <p className="text-sm font-bold text-gray-900 truncate">{userName}</p>
                                <p className="text-xs text-gray-500 truncate">{mockData.testUser.email}</p>
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

            {/* ========== MAIN CONTENT ========== */}
            <main className="flex-1 flex flex-col h-screen overflow-hidden">

                {/* Topbar */}
                <header className="h-16 bg-white border-b border-gray-100 flex items-center justify-between px-4 sm:px-6 z-10 shadow-sm">
                    <div className="flex items-center gap-3 md:hidden">
                        <Activity className="w-7 h-7 text-cyan-500" />
                        <span className="text-xl font-bold text-gray-900">Schedula</span>
                    </div>

                    <div className="hidden md:flex flex-col">
                        <span className="text-xs text-gray-500 font-medium tracking-wide uppercase">
                            Good {new Date().getHours() < 12 ? "Morning" : new Date().getHours() < 17 ? "Afternoon" : "Evening"},
                        </span>
                        <h1 className="text-lg font-bold text-gray-900 leading-none">User 👋</h1>
                    </div>

                    <div className="flex items-center gap-2 sm:gap-4">
                        {/* Desktop Search */}
                        <div className="hidden md:flex relative group">
                            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 group-focus-within:text-cyan-500 transition-colors" />
                            <input
                                type="text"
                                placeholder="Search doctors, specialties..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-9 pr-4 py-2 bg-gray-50 border border-transparent rounded-full text-sm w-64 focus:bg-white focus:border-cyan-300 focus:ring-2 focus:ring-cyan-100 outline-none transition-all"
                            />
                            {searchQuery && (
                                <button onClick={() => setSearchQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                                    <X className="w-4 h-4" />
                                </button>
                            )}
                        </div>

                        <button className="md:hidden p-2 text-gray-400 hover:text-cyan-600" onClick={() => setShowMobileSearch(!showMobileSearch)}>
                            <Search className="w-5 h-5" />
                        </button>

                        <button className="relative p-2 text-gray-400 hover:text-cyan-600 focus:outline-none focus:ring-2 focus:ring-cyan-100 rounded-full transition-colors" onClick={handleNotificationClick}>
                            <Bell className="w-5 h-5" />
                            {notifications > 0 && (
                                <span className="absolute top-1 right-1.5 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-white"></span>
                            )}
                        </button>

                        <button className="md:hidden p-2 text-gray-400 hover:text-cyan-600" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
                            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                        </button>
                    </div>
                </header>

                {/* Mobile Search Input */}
                {showMobileSearch && (
                    <div className="md:hidden p-4 bg-white border-b border-gray-100 animate-in slide-in-from-top-2">
                        <div className="relative">
                            <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                            <input
                                type="text"
                                placeholder="Search doctors..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-10 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:border-cyan-300 focus:ring-2 focus:ring-cyan-100 outline-none"
                                autoFocus
                            />
                            <button onClick={() => { setShowMobileSearch(false); setSearchQuery(""); }} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                )}

                {/* Scrollable Content */}
                <div className="flex-1 overflow-y-auto">
                    <div className="max-w-7xl mx-auto p-4 md:p-6 lg:p-8 space-y-8">

                        {/* Hero Section */}
                        <section className="relative overflow-hidden bg-gradient-to-r from-cyan-500 to-teal-500 rounded-2xl md:rounded-3xl p-6 md:p-10 text-white shadow-lg shadow-cyan-200/50">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                            <div className="absolute bottom-0 left-0 w-48 h-48 bg-black/10 rounded-full blur-2xl translate-y-1/2 -translate-x-1/4"></div>

                            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                                <div className="max-w-xl">
                                    <h2 className="text-3xl md:text-4xl font-black mb-3 leading-tight">
                                        Find &amp; Book <br className="hidden md:block" />
                                        <span className="text-cyan-100">Top Doctors</span>
                                    </h2>
                                    <p className="text-cyan-50 text-base md:text-lg mb-6 opacity-90 max-w-md">
                                        Get expert medical care from verified professionals. Book your appointment in minutes.
                                    </p>

                                    <div className="flex flex-wrap items-center gap-4 text-sm font-medium">
                                        <div className="px-4 py-2 bg-white/20 backdrop-blur-md rounded-xl border border-white/20 shadow-inner">
                                            <strong className="text-lg mr-1">{doctors.filter(d => d.available).length}</strong> Available
                                        </div>
                                        <div className="px-4 py-2 bg-white/20 backdrop-blur-md rounded-xl border border-white/20 shadow-inner">
                                            <strong className="text-lg mr-1">{upcomingCount}</strong> Upcoming
                                        </div>
                                    </div>
                                </div>

                                <div className="hidden md:flex items-center justify-center p-6 bg-white/10 backdrop-blur-lg border border-white/20 rounded-full w-40 h-40 shadow-xl">
                                    <Heart className="w-16 h-16 text-white" />
                                </div>
                            </div>
                        </section>

                        {/* Specialties */}
                        <section>
                            <div className="flex overflow-x-auto hide-scrollbar gap-2 pb-2">
                                {specialties.map((spec) => (
                                    <button
                                        key={spec}
                                        onClick={() => setActiveSpecialty(spec)}
                                        className={`px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-all duration-200 border \${
                      activeSpecialty === spec 
                      ? 'bg-cyan-500 text-white border-cyan-500 shadow-md shadow-cyan-200/50' 
                      : 'bg-white text-gray-600 border-gray-200 hover:border-cyan-300 hover:text-cyan-600'
                    }`}
                                    >
                                        {spec}
                                    </button>
                                ))}
                            </div>
                        </section>

                        {/* Doctor Feed */}
                        <section>
                            <div className="flex items-end justify-between mb-6">
                                <div>
                                    <h2 className="text-xl md:text-2xl font-bold text-gray-900">
                                        {searchQuery
                                            ? `Results for "\${searchQuery}"`
                                            : activeSpecialty !== "All"
                                                ? activeSpecialty
                                                : "Recommended Doctors"}
                                    </h2>
                                    <p className="text-sm text-gray-500 mt-1">{filteredDoctors.length} doctors found</p>
                                </div>

                                <div className="hidden sm:flex bg-gray-100 p-1 rounded-lg">
                                    <button
                                        onClick={() => setViewMode("grid")}
                                        className={`p-1.5 rounded-md transition-colors \${viewMode === 'grid' ? 'bg-white shadow-sm text-cyan-600' : 'text-gray-500 hover:text-gray-700'}`}
                                    >
                                        <Menu className="w-4 h-4 rotate-90" />
                                    </button>
                                    <button
                                        onClick={() => setViewMode("list")}
                                        className={`p-1.5 rounded-md transition-colors \${viewMode === 'list' ? 'bg-white shadow-sm text-cyan-600' : 'text-gray-500 hover:text-gray-700'}`}
                                    >
                                        <Menu className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>

                            {filteredDoctors.length > 0 ? (
                                <div className={`grid gap-6 \${viewMode === 'grid' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'}`}>
                                    {filteredDoctors.map((doctor) => (
                                        <article
                                            key={doctor.id}
                                            onClick={() => handleDoctorClick(doctor)}
                                            className={`bg-white rounded-2xl border border-gray-200 hover:border-cyan-300 shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer overflow-hidden group flex \${viewMode === 'list' ? 'flex-row' : 'flex-col'}`}
                                        >
                                            <div className={`relative bg-gray-100 \${viewMode === 'list' ? 'w-32 flex-shrink-0' : 'w-full aspect-[4/3]'} overflow-hidden`}>
                                                {doctor.image ? (
                                                    <img
                                                        src={doctor.image}
                                                        alt={doctor.name}
                                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-4xl font-black text-gray-300">
                                                        {doctor.name.charAt(0)}
                                                    </div>
                                                )}

                                                <div className="absolute top-3 right-3 z-10">
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); toggleFavorite(doctor.id); }}
                                                        className="p-2 bg-white/80 backdrop-blur-md rounded-full shadow-sm hover:bg-white transition-colors"
                                                    >
                                                        <Heart className={`w-4 h-4 \${favorites.includes(doctor.id) ? 'fill-rose-500 text-rose-500' : 'text-gray-400 hover:text-rose-500'}`} />
                                                    </button>
                                                </div>

                                                <div className="absolute bottom-3 left-3 flex gap-2">
                                                    {doctor.available ? (
                                                        <span className="bg-emerald-500 text-white text-[10px] font-bold px-2 py-1 rounded-md shadow-sm flex items-center gap-1">
                                                            <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></span> Available
                                                        </span>
                                                    ) : (
                                                        <span className="bg-gray-800/80 backdrop-blur-md text-white text-[10px] font-bold px-2 py-1 rounded-md shadow-sm">
                                                            Offline
                                                        </span>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="p-4 flex flex-col flex-1">
                                                <div className="mb-3">
                                                    <h3 className="font-bold text-gray-900 text-lg group-hover:text-cyan-600 transition-colors">{doctor.name}</h3>
                                                    <p className="text-cyan-600 text-sm font-medium">{doctor.specialty}</p>
                                                </div>

                                                <div className="flex items-center gap-4 text-xs text-gray-500 mb-4 font-medium">
                                                    <div className="flex items-center gap-1">
                                                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                                                        <span className="text-gray-900 font-bold">{doctor.rating}</span>
                                                    </div>
                                                    <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
                                                    <div className="flex items-center gap-1">
                                                        <Clock className="w-3.5 h-3.5" />
                                                        <span>{doctor.experience} yrs</span>
                                                    </div>
                                                </div>

                                                <div className="mt-auto pt-4 border-t border-gray-100 flex items-center justify-between">
                                                    <div className="flex flex-col">
                                                        <span className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">Consultation Fee</span>
                                                        <span className="font-bold text-gray-900">₹{doctor.consultationFee}</span>
                                                    </div>
                                                    <button
                                                        disabled={!doctor.available}
                                                        className={`px-4 py-2 rounded-xl text-sm font-bold transition-all \${
                              doctor.available 
                              ? 'bg-cyan-50 text-cyan-600 hover:bg-cyan-500 hover:text-white' 
                              : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            }`}
                                                    >
                                                        Book
                                                    </button>
                                                </div>
                                            </div>
                                        </article>
                                    ))}
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center p-12 text-center bg-white rounded-3xl border border-gray-100 border-dashed">
                                    <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4 text-gray-400">
                                        <Search className="w-8 h-8" />
                                    </div>
                                    <h3 className="text-lg font-bold text-gray-900 mb-1">No doctors found</h3>
                                    <p className="text-gray-500 mb-6 max-w-sm">We couldn&apos;t find any doctors matching your search criteria. Try a different specialty or term.</p>
                                    <button
                                        onClick={() => { setSearchQuery(""); setActiveSpecialty("All"); }}
                                        className="px-6 py-2 bg-cyan-500 hover:bg-cyan-600 text-white font-bold rounded-xl transition-colors shadow-md shadow-cyan-200/50"
                                    >
                                        Clear All Filters
                                    </button>
                                </div>
                            )}
                        </section>

                    </div>
                </div>
            </main>

            {/* ========== MOBILE BOTTOM NAV ========== */}
            <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 py-2 px-6 flex justify-between items-center z-50 pb-safe">
                {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeTab === item.id;
                    return (
                        <button
                            key={item.id}
                            onClick={() => {
                                if (item.path) {
                                    router.push(item.path);
                                    setActiveTab(item.id);
                                } else if (item.action) {
                                    item.action();
                                }
                            }}
                            className={`flex flex-col items-center gap-1 relative p-2 rounded-xl transition-colors \${isActive ? 'text-cyan-600' : 'text-gray-400'}`}
                        >
                            <Icon className="\${isActive ? 'w-6 h-6' : 'w-5 h-5'}" />
                            <span className={`text-[10px] font-medium \${isActive ? 'font-bold' : ''}`}>
                                {item.id === 'appointments' ? 'Appts' : item.id === 'find' ? 'Find' : item.label}
                            </span>
                            {item.badge && item.badge > 0 && (
                                <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-rose-500 rounded-full ring-2 ring-white"></span>
                            )}
                        </button>
                    );
                })}
            </nav>

            {/* Mobile Side Menu Overlay */}
            {isMobileMenuOpen && (
                <div className="md:hidden fixed inset-0 z-50 bg-black/50 flex">
                    <div className="w-64 bg-white h-full flex flex-col p-4">
                        <div className="flex justify-between items-center mb-6">
                            <span className="text-xl font-bold text-gray-900">Menu</span>
                            <button onClick={() => setIsMobileMenuOpen(false)}><X className="w-6 h-6 text-gray-500" /></button>
                        </div>

                        <div className="flex items-center gap-3 mb-8 p-3 bg-gray-50 rounded-xl border border-gray-100">
                            <div className="w-10 h-10 rounded-full bg-cyan-100 flex items-center justify-center text-cyan-600 font-bold">
                                {userName.charAt(0)}
                            </div>
                            <div>
                                <p className="text-sm font-bold text-gray-900">User</p>
                                <p className="text-xs text-gray-500 truncate">{mockData.testUser.email}</p>
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
