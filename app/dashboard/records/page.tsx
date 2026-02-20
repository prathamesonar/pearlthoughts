"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { FileText, Upload } from "lucide-react";
import Swal from "sweetalert2";
import { getLoggedInUser } from "../../lib/data";

interface Record {
    id: string;
    name: string;
    type: string;
    date: string;
}

export default function RecordsPage() {
    const router = useRouter();
    const [records, setRecords] = useState<Record[]>([]);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        const u = getLoggedInUser();
        if (!u) { router.push("/"); return; }

        const raw = localStorage.getItem("schedula_records");
        if (raw) setRecords(JSON.parse(raw));
        setMounted(true);
    }, [router]);

    const addRecord = () => {
        Swal.fire({
            title: "Add Medical Record",
            html:
                '<input id="rec-name" class="swal2-input" placeholder="Record name (e.g. Blood Test)">' +
                '<select id="rec-type" class="swal2-select" style="margin-top:12px;padding:8px;border:1px solid #d1d5db;border-radius:8px;width:100%">' +
                '<option value="Lab Report">Lab Report</option>' +
                '<option value="Prescription">Prescription</option>' +
                '<option value="X-Ray / Scan">X-Ray / Scan</option>' +
                '<option value="Other">Other</option>' +
                "</select>",
            confirmButtonColor: "#22d3ee",
            confirmButtonText: "Save Record",
            showCancelButton: true,
            preConfirm: () => {
                const name = (document.getElementById("rec-name") as HTMLInputElement).value;
                const type = (document.getElementById("rec-type") as HTMLSelectElement).value;
                if (!name) { Swal.showValidationMessage("Please enter a record name"); return; }
                return { name, type };
            },
        }).then((result) => {
            if (result.isConfirmed && result.value) {
                const newRecord: Record = {
                    id: Date.now().toString(),
                    name: result.value.name,
                    type: result.value.type,
                    date: new Date().toISOString(),
                };
                const updated = [...records, newRecord];
                setRecords(updated);
                localStorage.setItem("schedula_records", JSON.stringify(updated));
                Swal.fire({ icon: "success", title: "Record Saved!", timer: 1200, showConfirmButton: false });
            }
        });
    };

    if (!mounted) return null;

    return (
        <div className="max-w-3xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">Medical Records</h2>
                <button
                    onClick={addRecord}
                    className="flex items-center gap-2 px-4 py-2 bg-cyan-500 text-white rounded-xl text-sm font-medium hover:bg-cyan-600 transition cursor-pointer"
                >
                    <Upload className="w-4 h-4" />
                    Add Record
                </button>
            </div>

            {records.length === 0 ? (
                <div className="text-center py-20">
                    <FileText className="w-16 h-16 text-gray-200 mx-auto mb-4" />
                    <p className="text-gray-500 font-medium text-lg">No records yet</p>
                    <p className="text-gray-400 text-sm mt-1">Add your medical records to keep them organized</p>
                </div>
            ) : (
                <div className="grid gap-4">
                    {records.map((rec) => (
                        <div key={rec.id} className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-cyan-50 flex items-center justify-center">
                                <FileText className="w-5 h-5 text-cyan-500" />
                            </div>
                            <div className="flex-1">
                                <h3 className="font-semibold text-gray-900 text-sm">{rec.name}</h3>
                                <p className="text-gray-400 text-xs">{rec.type}</p>
                            </div>
                            <span className="text-xs text-gray-400">
                                {new Date(rec.date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                            </span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
