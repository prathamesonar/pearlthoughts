"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, FileText, Download, User, Calendar, Stethoscope, Search, Pill } from "lucide-react";
import { Prescription, prescriptionStore } from "@/app/lib/prescriptionStore";
import { exportPrescriptionPDF } from "@/app/lib/pdfUtils";

export default function PrescriptionsPage() {
    const router = useRouter();
    const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [downloadingId, setDownloadingId] = useState<string | null>(null);

    useEffect(() => {
        const email = localStorage.getItem("userEmail");
        if (!email) {
            router.push("/login");
            return;
        }

        const all = prescriptionStore.getAll();
        setPrescriptions(all.filter((p) => p.patientEmail === email));
        setIsLoading(false);
    }, [router]);

    const handleDownload = async (prescription: Prescription) => {
        setDownloadingId(prescription.id);
        try {
            await exportPrescriptionPDF(prescription, `prescription-${prescription.doctorId}-${prescription.date}.pdf`);
        } catch (error) {
            alert("Failed to download prescription");
        } finally {
            setDownloadingId(null);
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center font-sans">
                <div className="animate-spin text-cyan-500 rounded-full h-8 w-8 border-t-2 border-b-2 border-cyan-500"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
            {/* Header */}
            <header className="bg-white border-b border-gray-100 px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 z-10 shadow-sm sticky top-0">
                <div className="flex items-center gap-4">
                    <button onClick={() => router.back()} className="p-2 bg-gray-100 hover:bg-gray-200 rounded-full text-gray-600 transition-colors">
                        <ChevronLeft className="w-5 h-5" />
                    </button>
                    <div>
                        <h1 className="text-2xl font-black text-gray-900">My Prescriptions</h1>
                        <p className="text-sm text-gray-500">View and download your medical records</p>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto w-full">
                {prescriptions.length === 0 ? (
                    <div className="bg-white rounded-3xl border border-gray-100 border-dashed p-12 text-center shadow-sm flex flex-col items-center justify-center mt-10 animate-in fade-in zoom-in-95">
                        <div className="w-20 h-20 bg-cyan-50 rounded-full flex items-center justify-center mb-6 text-cyan-500">
                            <FileText className="w-10 h-10" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">No prescriptions yet</h3>
                        <p className="text-gray-500 mb-8 max-w-md">You do not have any prescriptions available to view. Complete an appointment to receive one.</p>
                        <button
                            onClick={() => router.push("/home")}
                            className="px-6 py-3 bg-cyan-500 hover:bg-cyan-600 shadow-lg shadow-cyan-200/50 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2 hover:-translate-y-0.5"
                        >
                            <Search className="w-5 h-5" /> Book Appointment
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {prescriptions.map((prescription) => (
                            <article key={prescription.id} className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm hover:shadow-md transition-shadow relative group">
                                {/* Header Info */}
                                <div className="flex justify-between items-start mb-6">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-gray-50 text-cyan-600 rounded-xl flex items-center justify-center font-bold text-xl flex-shrink-0">
                                            <Stethoscope className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-gray-900 text-lg">Dr. {prescription.doctorName}</h3>
                                            <p className="text-sm font-medium text-cyan-600">{prescription.specialty}</p>
                                        </div>
                                    </div>
                                    <div className="bg-gray-100 text-gray-600 text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1">
                                        <Calendar className="w-3.5 h-3.5" />
                                        {new Date(prescription.date).toLocaleDateString()}
                                    </div>
                                </div>

                                <div className="w-full h-px bg-gray-100 mb-5"></div>

                                {/* Diagnosis */}
                                <div className="mb-5">
                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Primary Diagnosis</p>
                                    <p className="bg-gray-50 p-3 rounded-xl font-medium text-gray-800 text-sm border border-gray-100">{prescription.diagnosis}</p>
                                </div>

                                {/* Medications Snapshot */}
                                <div className="mb-6">
                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1.5"><Pill className="w-3.5 h-3.5" /> Prescribed Medications</p>
                                    <div className="space-y-2">
                                        {prescription.medications.slice(0, 2).map((med, idx) => (
                                            <div key={idx} className="flex justify-between text-sm items-center py-2 border-b border-gray-50 last:border-0 relative pl-4 before:content-[''] before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2 before:w-1.5 before:h-1.5 before:bg-cyan-400 before:rounded-full">
                                                <span className="font-bold text-gray-700">{med.name}</span>
                                                <span className="text-gray-500">{med.dosage} ({med.frequency})</span>
                                            </div>
                                        ))}
                                        {prescription.medications.length > 2 && (
                                            <div className="text-xs text-cyan-600 font-bold mt-2">
                                                + {prescription.medications.length - 2} more medications
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <button
                                    onClick={() => handleDownload(prescription)}
                                    disabled={downloadingId === prescription.id}
                                    className="w-full flex items-center justify-center gap-2 py-3 bg-cyan-50 text-cyan-700 font-bold rounded-xl hover:bg-cyan-500 hover:text-white hover:shadow-lg hover:shadow-cyan-200 transition-all border border-cyan-100 disabled:opacity-50"
                                >
                                    <Download className="w-4 h-4" />
                                    {downloadingId === prescription.id ? "Generating PDF..." : "Download Full PDF"}
                                </button>
                            </article>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}
