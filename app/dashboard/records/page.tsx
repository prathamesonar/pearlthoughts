"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { FileText, Upload, Trash2, Search, Filter } from "lucide-react";
import Swal from "sweetalert2";
import { getLoggedInUser } from "../../lib/data";

interface Record {
    id: string;
    name: string;
    type: string;
    doctor: string;
    notes: string;
    date: string;
}

const RECORD_TYPES = [
    "Lab Report",
    "Prescription",
    "X-Ray / Scan",
    "MRI Report",
    "Blood Test",
    "Ultrasound",
    "ECG Report",
    "Vaccination",
    "Discharge Summary",
    "Insurance Document",
    "Other",
];

export default function RecordsPage() {
    const router = useRouter();
    const [records, setRecords] = useState<Record[]>([]);
    const [mounted, setMounted] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [filterType, setFilterType] = useState("All");

    useEffect(() => {
        const u = getLoggedInUser();
        if (!u) { router.push("/login"); return; }

        const raw = localStorage.getItem("schedula_records");
        if (raw) setRecords(JSON.parse(raw));
        setMounted(true);
    }, [router]);

    const filteredRecords = records.filter((rec) => {
        const matchesSearch =
            rec.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            rec.doctor.toLowerCase().includes(searchQuery.toLowerCase()) ||
            rec.notes.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesType = filterType === "All" || rec.type === filterType;
        return matchesSearch && matchesType;
    });

    const addRecord = () => {
        Swal.fire({
            title: "Add Medical Record",
            html: `
                <div style="text-align:left;display:flex;flex-direction:column;gap:14px">
                    <div>
                        <label style="display:block;font-size:13px;font-weight:600;color:#374151;margin-bottom:4px">Record Name *</label>
                        <input id="rec-name" class="swal2-input" placeholder="e.g. Complete Blood Count" style="margin:0;width:100%;box-sizing:border-box;font-size:15px;padding:12px 14px">
                    </div>
                    <div>
                        <label style="display:block;font-size:13px;font-weight:600;color:#374151;margin-bottom:4px">Record Type *</label>
                        <select id="rec-type" style="width:100%;padding:12px 14px;border:1px solid #d1d5db;border-radius:8px;font-size:15px;background:#fff;color:#374151">
                            ${RECORD_TYPES.map(t => `<option value="${t}">${t}</option>`).join("")}
                        </select>
                    </div>
                    <div>
                        <label style="display:block;font-size:13px;font-weight:600;color:#374151;margin-bottom:4px">Doctor Name</label>
                        <input id="rec-doctor" class="swal2-input" placeholder="e.g. Dr. Priya Sharma" style="margin:0;width:100%;box-sizing:border-box;font-size:15px;padding:12px 14px">
                    </div>
                    <div>
                        <label style="display:block;font-size:13px;font-weight:600;color:#374151;margin-bottom:4px">Notes</label>
                        <textarea id="rec-notes" class="swal2-textarea" placeholder="Additional details..." style="margin:0;width:100%;box-sizing:border-box;font-size:15px;padding:12px 14px;min-height:80px;resize:vertical"></textarea>
                    </div>
                </div>
            `,
            confirmButtonColor: "#22d3ee",
            confirmButtonText: "Save Record",
            showCancelButton: true,
            cancelButtonColor: "#9ca3af",
            width: 480,
            preConfirm: () => {
                const name = (document.getElementById("rec-name") as HTMLInputElement).value;
                const type = (document.getElementById("rec-type") as HTMLSelectElement).value;
                const doctor = (document.getElementById("rec-doctor") as HTMLInputElement).value;
                const notes = (document.getElementById("rec-notes") as HTMLTextAreaElement).value;
                if (!name) { Swal.showValidationMessage("Please enter a record name"); return; }
                return { name, type, doctor: doctor || "N/A", notes: notes || "" };
            },
        }).then((result) => {
            if (result.isConfirmed && result.value) {
                const newRecord: Record = {
                    id: Date.now().toString(),
                    name: result.value.name,
                    type: result.value.type,
                    doctor: result.value.doctor,
                    notes: result.value.notes,
                    date: new Date().toISOString(),
                };
                const updated = [...records, newRecord];
                setRecords(updated);
                localStorage.setItem("schedula_records", JSON.stringify(updated));
                Swal.fire({ icon: "success", title: "Record Saved!", timer: 1200, showConfirmButton: false });
            }
        });
    };

    const deleteRecord = (id: string) => {
        Swal.fire({
            icon: "warning",
            title: "Delete Record?",
            text: "This action cannot be undone.",
            showCancelButton: true,
            confirmButtonColor: "#ef4444",
            confirmButtonText: "Delete",
            cancelButtonColor: "#9ca3af",
        }).then((result) => {
            if (result.isConfirmed) {
                const updated = records.filter((r) => r.id !== id);
                setRecords(updated);
                localStorage.setItem("schedula_records", JSON.stringify(updated));
                Swal.fire({ icon: "success", title: "Deleted!", timer: 1000, showConfirmButton: false });
            }
        });
    };

    const getTypeColor = (type: string) => {
        const colors: { [key: string]: string } = {
            "Lab Report": "bg-blue-100 text-blue-600",
            "Prescription": "bg-emerald-100 text-emerald-600",
            "X-Ray / Scan": "bg-violet-100 text-violet-600",
            "MRI Report": "bg-purple-100 text-purple-600",
            "Blood Test": "bg-red-100 text-red-600",
            "Ultrasound": "bg-indigo-100 text-indigo-600",
            "ECG Report": "bg-pink-100 text-pink-600",
            "Vaccination": "bg-amber-100 text-amber-600",
            "Discharge Summary": "bg-teal-100 text-teal-600",
            "Insurance Document": "bg-orange-100 text-orange-600",
        };
        return colors[type] || "bg-gray-100 text-gray-600";
    };

    if (!mounted) return null;

    return (
        <div className="max-w-3xl mx-auto space-y-5 sm:space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                    <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Medical Records</h2>
                    <p className="text-sm text-gray-500 mt-0.5">{records.length} record{records.length !== 1 ? "s" : ""} stored</p>
                </div>
                <button
                    onClick={addRecord}
                    className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-cyan-500 to-teal-500 text-white rounded-xl text-sm font-bold hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 cursor-pointer shadow-md shadow-cyan-200"
                >
                    <Upload className="w-4 h-4" />
                    Add Record
                </button>
            </div>

            {/* Search & Filter */}
            <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search records, doctors, notes..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 bg-white text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition shadow-sm"
                    />
                </div>
                <div className="relative">
                    <Filter className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <select
                        value={filterType}
                        onChange={(e) => setFilterType(e.target.value)}
                        className="pl-10 pr-8 py-3 rounded-xl border border-gray-200 bg-white text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition shadow-sm appearance-none cursor-pointer min-w-[180px]"
                    >
                        <option value="All">All Types</option>
                        {RECORD_TYPES.map((t) => (
                            <option key={t} value={t}>{t}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Records List */}
            {filteredRecords.length === 0 ? (
                <div className="text-center py-16 sm:py-20">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gray-50 flex items-center justify-center">
                        <FileText className="w-8 h-8 text-gray-300" />
                    </div>
                    <p className="text-gray-500 font-semibold text-lg">
                        {records.length === 0 ? "No records yet" : "No matching records"}
                    </p>
                    <p className="text-gray-400 text-sm mt-1">
                        {records.length === 0
                            ? "Add your medical records to keep them organized"
                            : "Try adjusting your search or filter"
                        }
                    </p>
                </div>
            ) : (
                <div className="grid gap-3 sm:gap-4">
                    {filteredRecords.map((rec) => (
                        <div key={rec.id} className="bg-white rounded-2xl border border-gray-100 p-4 sm:p-5 shadow-sm hover:shadow-md transition-shadow duration-200">
                            <div className="flex items-start gap-3 sm:gap-4">
                                <div className={`w-10 h-10 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${getTypeColor(rec.type)}`}>
                                    <FileText className="w-5 h-5" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-start justify-between gap-2">
                                        <div className="min-w-0">
                                            <h3 className="font-semibold text-gray-900 text-sm sm:text-base truncate">{rec.name}</h3>
                                            <div className="flex flex-wrap items-center gap-2 mt-1">
                                                <span className={`text-[11px] sm:text-xs font-medium px-2 py-0.5 rounded-full ${getTypeColor(rec.type)}`}>
                                                    {rec.type}
                                                </span>
                                                {rec.doctor && rec.doctor !== "N/A" && (
                                                    <span className="text-[11px] sm:text-xs text-gray-400">
                                                        Dr. {rec.doctor.replace(/^Dr\.?\s*/i, "")}
                                                    </span>
                                                )}
                                            </div>
                                            {rec.notes && (
                                                <p className="text-xs text-gray-400 mt-1.5 line-clamp-2">{rec.notes}</p>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-2 flex-shrink-0">
                                            <span className="text-[11px] sm:text-xs text-gray-400 hidden sm:block">
                                                {new Date(rec.date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                                            </span>
                                            <button
                                                onClick={() => deleteRecord(rec.id)}
                                                className="p-1.5 rounded-lg text-gray-300 hover:text-red-500 hover:bg-red-50 transition cursor-pointer"
                                                title="Delete record"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                    <span className="text-[10px] text-gray-400 sm:hidden mt-1 block">
                                        {new Date(rec.date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
