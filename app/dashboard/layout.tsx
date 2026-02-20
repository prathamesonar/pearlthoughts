"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import {
    Search,
    Calendar,
    FileText,
    User,
    LogOut,
    Menu,
    X,
    Stethoscope,
} from "lucide-react";
import { getLoggedInUser, logoutUser, seedDefaultUser } from "../lib/data";
import type { User as UserType } from "../lib/data";

const navItems = [
    { href: "/dashboard", label: "Find a Doctor", icon: Search },
    { href: "/dashboard/appointments", label: "Appointments", icon: Calendar },
    { href: "/dashboard/records", label: "Records", icon: FileText },
    { href: "/dashboard/profile", label: "Profile", icon: User },
];

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const router = useRouter();
    const pathname = usePathname();
    const [user, setUser] = useState<UserType | null>(null);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        seedDefaultUser();
        const u = getLoggedInUser();
        if (!u) {
            router.push("/");
            return;
        }
        setUser(u);
        setMounted(true);
    }, [router]);

    const handleLogout = () => {
        logoutUser();
        router.push("/");
    };

    const getGreeting = () => {
        const h = new Date().getHours();
        if (h < 12) return "Good morning";
        if (h < 17) return "Good afternoon";
        return "Good evening";
    };

    const getPageTitle = () => {
        if (pathname === "/dashboard") return "Find a Doctor";
        if (pathname === "/dashboard/appointments") return "Appointments";
        if (pathname === "/dashboard/records") return "Medical Records";
        if (pathname === "/dashboard/profile") return "Profile";
        if (pathname.includes("/doctor/")) return "Book Appointment";
        return "Dashboard";
    };

    if (!mounted || !user) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="animate-pulse flex flex-col items-center gap-3">
                    <Stethoscope className="w-10 h-10 text-cyan-500" />
                    <p className="text-gray-400">Loading...</p>
                </div>
            </div>
        );
    }

    const firstName = user.name.split(" ")[0];

    return (
        <div className="min-h-screen bg-gray-50 text-gray-900 flex">
            {/* Sidebar Overlay (mobile) */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/40 z-40 md:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside
                className={`
          fixed top-0 left-0 z-50 h-full w-64 bg-white border-r border-gray-200 
          flex flex-col transition-transform duration-300 ease-in-out
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
          md:translate-x-0 md:static md:z-auto
        `}
            >
                {/* Logo */}
                <div className="flex items-center gap-2 px-6 py-5 border-b border-gray-100">
                    <Stethoscope className="w-7 h-7 text-cyan-500" />
                    <span className="text-xl font-bold text-gray-900">
                        Schedula
                    </span>
                    <span className="text-xs text-cyan-500 font-medium bg-cyan-50 px-2 py-0.5 rounded-full ml-auto">
                        Healthcare
                    </span>
                </div>

                {/* Nav Links */}
                <nav className="flex-1 px-4 py-6 space-y-1">
                    {navItems.map((item) => {
                        const isActive =
                            item.href === "/dashboard"
                                ? pathname === "/dashboard"
                                : pathname.startsWith(item.href);
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={() => setSidebarOpen(false)}
                                className={`
                  flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium
                  transition-all duration-200
                  ${isActive
                                        ? "bg-cyan-50 text-cyan-600 shadow-sm"
                                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                                    }
                `}
                            >
                                <item.icon className="w-5 h-5" />
                                {item.label}
                            </Link>
                        );
                    })}
                </nav>

                {/* User + Logout */}
                <div className="border-t border-gray-100 px-4 py-4">
                    <div className="flex items-center gap-3 px-3 mb-3">
                        <div className="w-9 h-9 rounded-full bg-cyan-100 flex items-center justify-center text-cyan-600 font-bold text-sm">
                            {user.name.charAt(0)}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-gray-900 truncate">
                                {user.name}
                            </p>
                            <p className="text-xs text-gray-400">Patient</p>
                        </div>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-2 w-full px-4 py-2.5 rounded-xl text-sm font-medium
              text-red-500 hover:bg-red-50 transition-colors cursor-pointer"
                    >
                        <LogOut className="w-4 h-4" />
                        Logout
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-h-screen">
                {/* Top Header */}
                <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-lg border-b border-gray-100">
                    <div className="flex items-center justify-between px-4 md:px-8 py-4">
                        <div className="flex items-center gap-3">
                            {/* Mobile menu button */}
                            <button
                                className="md:hidden p-2 rounded-xl hover:bg-gray-100 transition cursor-pointer"
                                onClick={() => setSidebarOpen(!sidebarOpen)}
                            >
                                {sidebarOpen ? (
                                    <X className="w-5 h-5 text-gray-600" />
                                ) : (
                                    <Menu className="w-5 h-5 text-gray-600" />
                                )}
                            </button>
                            <div>
                                <h1 className="text-lg md:text-xl font-bold text-gray-900">
                                    {getPageTitle()}
                                </h1>
                                <p className="text-xs text-gray-400 hidden sm:block">
                                    {new Date().toLocaleDateString("en-IN", {
                                        weekday: "long",
                                        day: "numeric",
                                        month: "long",
                                        year: "numeric",
                                    })}
                                </p>
                            </div>
                        </div>

                        {/* Right side: user avatar */}
                        <div className="flex items-center gap-3">
                            <div className="hidden sm:block text-right">
                                <p className="text-sm font-semibold text-gray-900">
                                    {getGreeting()}, {firstName}!
                                </p>
                                <p className="text-xs text-gray-400">
                                    📍 {user.location}
                                </p>
                            </div>
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-400 to-teal-500 flex items-center justify-center text-white font-bold text-sm shadow-md">
                                {user.name.charAt(0)}
                            </div>
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1 p-4 md:p-8 pb-24 md:pb-8">{children}</main>

                {/* Bottom Tab Bar (mobile) */}
                <nav className="fixed bottom-0 left-0 right-0 z-30 bg-white border-t border-gray-200 md:hidden">
                    <div className="flex justify-around items-center py-2">
                        {navItems.map((item) => {
                            const isActive =
                                item.href === "/dashboard"
                                    ? pathname === "/dashboard"
                                    : pathname.startsWith(item.href);
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={`
                    flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-lg
                    transition-colors text-xs font-medium
                    ${isActive
                                            ? "text-cyan-500"
                                            : "text-gray-400 hover:text-gray-600"
                                        }
                  `}
                                >
                                    <item.icon className="w-5 h-5" />
                                    <span className="truncate max-w-[60px]">
                                        {item.label === "Find a Doctor"
                                            ? "Find a Doctor"
                                            : item.label.length > 8
                                                ? item.label.slice(0, 7) + ".."
                                                : item.label}
                                    </span>
                                </Link>
                            );
                        })}
                    </div>
                </nav>
            </div>
        </div>
    );
}
