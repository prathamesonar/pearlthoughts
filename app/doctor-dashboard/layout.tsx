"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import {
    LayoutDashboard,
    Calendar,
    Clock,
    User,
    LogOut,
    Menu,
    X,
    Stethoscope,
} from "lucide-react";
import { getLoggedInDoctor, logoutDoctor, seedDefaultDoctor } from "../lib/data";
import type { DoctorUser } from "../lib/data";

const navItems = [
    { href: "/doctor-dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/doctor-dashboard/appointments", label: "My Appointments", icon: Calendar },
    { href: "/doctor-dashboard/slots", label: "Manage Slots", icon: Clock },
    { href: "/doctor-dashboard/profile", label: "Profile", icon: User },
];

export default function DoctorDashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const router = useRouter();
    const pathname = usePathname();
    const [doctor, setDoctor] = useState<DoctorUser | null>(null);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        seedDefaultDoctor();
        const d = getLoggedInDoctor();
        if (!d) {
            router.push("/login");
            return;
        }
        setDoctor(d);
        setMounted(true);
    }, [router]);

    const handleLogout = () => {
        logoutDoctor();
        router.push("/login");
    };

    const getPageTitle = () => {
        if (pathname === "/doctor-dashboard") return "Dashboard";
        if (pathname === "/doctor-dashboard/appointments") return "My Appointments";
        if (pathname === "/doctor-dashboard/slots") return "Manage Slots";
        if (pathname === "/doctor-dashboard/profile") return "Profile";
        return "Doctor Dashboard";
    };

    if (!mounted || !doctor) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="flex flex-col items-center gap-3">
                    <div className="w-8 h-8 border-3 border-cyan-500 border-t-transparent rounded-full animate-spin" />
                    <p className="text-gray-400 text-sm">Loading...</p>
                </div>
            </div>
        );
    }

    const initials = doctor.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase();

    return (
        <div className="min-h-screen bg-gray-50 font-sans">
            {/* Mobile Sidebar Overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Desktop Sidebar */}
            <aside className="fixed left-0 top-0 h-full w-64 bg-white border-r border-gray-100 z-50 hidden lg:block shadow-sm">
                <div className="p-5 border-b border-gray-100">
                    <div className="flex items-center gap-2">
                        <Stethoscope className="w-7 h-7 text-cyan-500" />
                        <span className="text-xl font-bold text-gray-900">Schedula</span>
                        <span className="text-[10px] text-cyan-500 font-medium bg-cyan-50 px-1.5 py-0.5 rounded-full">Doctor</span>
                    </div>
                </div>

                <div className="p-4 border-b border-gray-100">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-cyan-500 rounded-full flex items-center justify-center text-white font-bold text-sm">{initials}</div>
                        <div className="flex-1 min-w-0">
                            <p className="font-medium text-gray-900 truncate text-sm">{doctor.name}</p>
                            <p className="text-xs text-gray-500 truncate">{doctor.specialty}</p>
                        </div>
                    </div>
                </div>

                <nav className="p-3 space-y-1">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${isActive
                                        ? "bg-cyan-50 text-cyan-600"
                                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                                    }`}
                            >
                                <item.icon className="w-5 h-5" />
                                {item.label}
                            </Link>
                        );
                    })}
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-600 hover:bg-red-50 hover:text-red-600 transition-all w-full cursor-pointer"
                    >
                        <LogOut className="w-5 h-5" />
                        Logout
                    </button>
                </nav>
            </aside>

            {/* Mobile Sidebar */}
            <aside className={`fixed left-0 top-0 h-full w-64 bg-white border-r border-gray-100 z-50 lg:hidden shadow-lg transform transition-transform ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
                <div className="p-5 border-b border-gray-100 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Stethoscope className="w-7 h-7 text-cyan-500" />
                        <span className="text-xl font-bold text-gray-900">Schedula</span>
                    </div>
                    <button onClick={() => setSidebarOpen(false)} className="p-1 text-gray-400 hover:text-gray-600 cursor-pointer">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-4 border-b border-gray-100">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-cyan-500 rounded-full flex items-center justify-center text-white font-bold text-sm">{initials}</div>
                        <div className="flex-1 min-w-0">
                            <p className="font-medium text-gray-900 truncate text-sm">{doctor.name}</p>
                            <p className="text-xs text-gray-500 truncate">{doctor.specialty}</p>
                        </div>
                    </div>
                </div>

                <nav className="p-3 space-y-1">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={() => setSidebarOpen(false)}
                                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${isActive
                                        ? "bg-cyan-50 text-cyan-600"
                                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                                    }`}
                            >
                                <item.icon className="w-5 h-5" />
                                {item.label}
                            </Link>
                        );
                    })}
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-600 hover:bg-red-50 hover:text-red-600 transition-all w-full cursor-pointer"
                    >
                        <LogOut className="w-5 h-5" />
                        Logout
                    </button>
                </nav>
            </aside>

            {/* Main Content */}
            <div className="lg:ml-64 min-h-screen pb-20 lg:pb-6">
                {/* Top Header */}
                <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-gray-100 px-4 sm:px-6 py-3">
                    <div className="flex items-center justify-between max-w-5xl mx-auto">
                        <div className="flex items-center gap-3">
                            <button onClick={() => setSidebarOpen(true)} className="p-2 hover:bg-gray-100 rounded-xl lg:hidden transition cursor-pointer">
                                <Menu className="w-5 h-5 text-gray-600" />
                            </button>
                            <h1 className="text-lg font-bold text-gray-900">{getPageTitle()}</h1>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 bg-cyan-500 rounded-full flex items-center justify-center text-white font-bold text-sm">{initials}</div>
                            <button onClick={handleLogout} className="p-2 hover:bg-gray-100 rounded-xl transition text-gray-500 hover:text-red-500 cursor-pointer">
                                <LogOut className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <main className="px-4 sm:px-6 py-6 max-w-5xl mx-auto">
                    {children}
                </main>
            </div>

            {/* Mobile Bottom Nav */}
            <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 z-30 lg:hidden px-2 py-2">
                <div className="flex justify-around">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-all ${isActive ? "text-cyan-500" : "text-gray-400 hover:text-gray-600"
                                    }`}
                            >
                                <item.icon className="w-5 h-5" />
                                <span className="text-[10px] font-medium">{item.label.split(" ").pop()}</span>
                            </Link>
                        );
                    })}
                </div>
            </nav>
        </div>
    );
}
