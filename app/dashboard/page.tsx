"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Search, Heart, MapPin, Clock } from "lucide-react";
import { doctors, getLoggedInUser } from "../lib/data";
import type { User, Doctor } from "../lib/data";

export default function DashboardPage() {
    const router = useRouter();
    const [user, setUser] = useState<User | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [mounted, setMounted] = useState(false);
    const [favorites, setFavorites] = useState<string[]>([]);

    useEffect(() => {
        const u = getLoggedInUser();
        if (!u) {
            router.push("/");
            return;
        }
        setUser(u);

        // Load favorites from localStorage
        const saved = localStorage.getItem("schedula_favorites");
        if (saved) setFavorites(JSON.parse(saved));

        setMounted(true);
    }, [router]);

    const toggleFavorite = (id: string) => {
        setFavorites((prev) => {
            const next = prev.includes(id)
                ? prev.filter((f) => f !== id)
                : [...prev, id];
            localStorage.setItem("schedula_favorites", JSON.stringify(next));
            return next;
        });
    };

    const filtered: Doctor[] = doctors.filter(
        (d) =>
            d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            d.specialty.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (!mounted || !user) return null;

    const firstName = user.name.split(" ")[0];
    const getGreeting = () => {
        const h = new Date().getHours();
        if (h < 12) return "Good morning";
        if (h < 17) return "Good afternoon";
        return "Good evening";
    };

    return (
        <div className="max-w-5xl mx-auto space-y-6">
            {/* Welcome Card */}
            <div className="bg-gradient-to-r from-cyan-500 to-teal-500 rounded-2xl p-6 md:p-8 text-white shadow-lg">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <p className="text-cyan-100 text-sm font-medium">
                            {getGreeting()},
                        </p>
                        <h2 className="text-2xl md:text-3xl font-bold mt-1">
                            Hello, {firstName}! 👋
                        </h2>
                        <p className="text-cyan-100 text-sm mt-2 flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            {user.location}
                        </p>
                    </div>
                    <div className="flex gap-4">
                        <div className="bg-white/20 backdrop-blur-sm rounded-xl px-4 py-3 text-center">
                            <p className="text-2xl font-bold">{doctors.length}</p>
                            <p className="text-xs text-cyan-100">Doctors</p>
                        </div>
                        <div className="bg-white/20 backdrop-blur-sm rounded-xl px-4 py-3 text-center">
                            <p className="text-2xl font-bold">8+</p>
                            <p className="text-xs text-cyan-100">Specialties</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Search */}
            <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                    type="text"
                    placeholder="Search Doctors by name or specialty..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-12 pr-4 py-3.5 rounded-xl border border-gray-200 bg-white text-gray-900
            placeholder-gray-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-cyan-500
            focus:border-transparent transition text-sm"
                />
            </div>

            {/* Results Count */}
            <div className="flex items-center justify-between">
                <h3 className="text-base font-semibold text-gray-900">
                    {filtered.length} Doctor{filtered.length !== 1 ? "s" : ""} Found
                </h3>
                {searchQuery && (
                    <button
                        onClick={() => setSearchQuery("")}
                        className="text-sm text-cyan-500 hover:text-cyan-600 font-medium cursor-pointer"
                    >
                        Clear search
                    </button>
                )}
            </div>

            {/* Doctor Cards */}
            {filtered.length === 0 ? (
                <div className="text-center py-16">
                    <div className="text-6xl mb-4">🔍</div>
                    <p className="text-gray-500 font-medium">No doctors found</p>
                    <p className="text-sm text-gray-400 mt-1">
                        Try searching with a different name or specialty
                    </p>
                </div>
            ) : (
                <div className="grid gap-4">
                    {filtered.map((doctor) => (
                        <div
                            key={doctor.id}
                            onClick={() => router.push(`/dashboard/doctor/${doctor.id}`)}
                            className="bg-white rounded-2xl border border-gray-100 p-4 flex gap-4 
                shadow-sm hover:shadow-md hover:border-cyan-200 
                transition-all duration-200 cursor-pointer group"
                        >
                            {/* Doctor Image */}
                            <div className="flex-shrink-0">
                                <img
                                    src={doctor.imageUrl}
                                    alt={doctor.name}
                                    className="w-20 h-20 md:w-24 md:h-24 rounded-xl object-cover 
                    group-hover:scale-105 transition-transform duration-300"
                                />
                            </div>

                            {/* Info */}
                            <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <h4 className="font-bold text-gray-900 text-base">
                                            {doctor.name}
                                        </h4>
                                        <p className="text-cyan-500 text-sm font-medium">
                                            {doctor.specialty}
                                        </p>
                                    </div>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            toggleFavorite(doctor.id);
                                        }}
                                        className="p-1.5 rounded-full hover:bg-red-50 transition cursor-pointer"
                                    >
                                        <Heart
                                            className={`w-5 h-5 transition-colors ${favorites.includes(doctor.id)
                                                    ? "fill-red-500 text-red-500"
                                                    : "text-gray-300"
                                                }`}
                                        />
                                    </button>
                                </div>

                                {/* Availability Badge */}
                                <span
                                    className={`inline-block mt-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${doctor.availability === "Available today"
                                            ? "bg-emerald-50 text-emerald-600"
                                            : "bg-amber-50 text-amber-600"
                                        }`}
                                >
                                    {doctor.availability}
                                </span>

                                {/* About (truncated) */}
                                <p className="text-gray-500 text-xs mt-2 line-clamp-2 leading-relaxed">
                                    {doctor.about}
                                </p>

                                {/* Timings */}
                                <div className="flex items-center gap-1.5 mt-2 text-gray-400 text-xs">
                                    <Clock className="w-3.5 h-3.5" />
                                    {doctor.timings}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
