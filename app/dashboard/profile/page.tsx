"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { User, Mail, Phone, MapPin, LogOut } from "lucide-react";
import Swal from "sweetalert2";
import { getLoggedInUser, logoutUser } from "../../lib/data";
import type { User as UserType } from "../../lib/data";

export default function ProfilePage() {
    const router = useRouter();
    const [user, setUser] = useState<UserType | null>(null);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        const u = getLoggedInUser();
        if (!u) { router.push("/"); return; }
        setUser(u);
        setMounted(true);
    }, [router]);

    const handleLogout = () => {
        Swal.fire({
            title: "Logout?",
            text: "Are you sure you want to logout?",
            icon: "question",
            showCancelButton: true,
            confirmButtonColor: "#ef4444",
            confirmButtonText: "Yes, logout",
        }).then((result) => {
            if (result.isConfirmed) {
                logoutUser();
                router.push("/");
            }
        });
    };

    if (!mounted || !user) return null;

    const profileFields = [
        { icon: User, label: "Full Name", value: user.name },
        { icon: Mail, label: "Email", value: user.email },
        { icon: Phone, label: "Phone", value: user.phone },
        { icon: MapPin, label: "Location", value: user.location },
    ];

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            {/* Avatar Card */}
            <div className="bg-gradient-to-r from-cyan-500 to-teal-500 rounded-2xl p-8 text-center text-white shadow-lg">
                <div className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center mx-auto mb-4 text-3xl font-bold">
                    {user.name.charAt(0)}
                </div>
                <h2 className="text-2xl font-bold">{user.name}</h2>
                <p className="text-cyan-100 text-sm mt-1">Patient</p>
            </div>

            {/* Profile Info */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm divide-y divide-gray-50">
                {profileFields.map((field, i) => (
                    <div key={i} className="flex items-center gap-4 px-6 py-4">
                        <div className="w-10 h-10 rounded-xl bg-cyan-50 flex items-center justify-center flex-shrink-0">
                            <field.icon className="w-5 h-5 text-cyan-500" />
                        </div>
                        <div>
                            <p className="text-xs text-gray-400 font-medium">{field.label}</p>
                            <p className="text-sm font-semibold text-gray-900">{field.value}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Logout */}
            <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl border-2 border-red-200 text-red-500 font-bold hover:bg-red-50 transition cursor-pointer"
            >
                <LogOut className="w-5 h-5" />
                Logout
            </button>
        </div>
    );
}
