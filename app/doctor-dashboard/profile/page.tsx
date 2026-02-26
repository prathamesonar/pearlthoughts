"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Mail, Phone, MapPin, Award, Clock, Calendar, Stethoscope } from "lucide-react";
import { getLoggedInDoctor } from "../../lib/data";
import type { DoctorUser } from "../../lib/data";

export default function DoctorProfilePage() {
    const router = useRouter();
    const [doctor, setDoctor] = useState<DoctorUser | null>(null);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        const d = getLoggedInDoctor();
        if (!d) { router.push("/login"); return; }
        setDoctor(d);
        setMounted(true);
    }, [router]);

    if (!mounted || !doctor) return null;

    const infoItems = [
        { icon: Mail, label: "Email", value: doctor.email },
        { icon: Phone, label: "Phone", value: doctor.phone },
        { icon: MapPin, label: "Location", value: doctor.location },
        { icon: Stethoscope, label: "Specialty", value: doctor.specialty },
        { icon: Award, label: "Qualification", value: doctor.qualification },
        { icon: Clock, label: "Experience", value: `${doctor.experience} years` },
        { icon: Calendar, label: "Available Days", value: doctor.availableDays },
        { icon: Clock, label: "Timings", value: doctor.timings },
    ];

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            {/* Profile Card */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                <div className="flex flex-col sm:flex-row items-center gap-5">
                    <img
                        src={doctor.imageUrl}
                        alt={doctor.name}
                        className="w-24 h-24 rounded-2xl object-cover shadow-md"
                    />
                    <div className="text-center sm:text-left">
                        <h2 className="text-xl font-bold text-gray-900">{doctor.name}</h2>
                        <p className="text-cyan-500 font-medium">{doctor.specialty}</p>
                        <p className="text-gray-500 text-sm mt-1">{doctor.qualification}</p>
                    </div>
                </div>
            </div>

            {/* About */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                <h3 className="text-base font-bold text-gray-900 mb-2">About</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{doctor.about}</p>
            </div>

            {/* Info Grid */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                <h3 className="text-base font-bold text-gray-900 mb-4">Contact & Details</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {infoItems.map((item, i) => (
                        <div key={i} className="flex items-start gap-3">
                            <div className="w-9 h-9 bg-cyan-50 rounded-xl flex items-center justify-center flex-shrink-0">
                                <item.icon className="w-4 h-4 text-cyan-500" />
                            </div>
                            <div>
                                <p className="text-xs text-gray-500">{item.label}</p>
                                <p className="text-sm font-medium text-gray-900">{item.value}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
