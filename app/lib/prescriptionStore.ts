export interface Medication {
    id?: string;
    name: string;
    dosage: string;
    frequency: string;
    duration: string;
}

export interface Prescription {
    id: string;
    appointmentId: string;
    doctorId: string;
    doctorName: string;
    specialty: string;
    patientEmail: string;
    date: string;
    diagnosis: string;
    medications: Medication[];
    notes?: string;
    followUpDate?: string;
}

export const prescriptionStore = {
    getAll: (): Prescription[] => {
        if (typeof window === "undefined") return [];
        try {
            const stored = localStorage.getItem("prescriptions");
            return stored ? JSON.parse(stored) : [];
        } catch {
            return [];
        }
    },

    save: (prescription: Prescription) => {
        if (typeof window === "undefined") return;
        try {
            const all = prescriptionStore.getAll();
            const existingIdx = all.findIndex(p => p.id === prescription.id);
            if (existingIdx !== -1) {
                all[existingIdx] = prescription;
            } else {
                all.push(prescription);
            }
            localStorage.setItem("prescriptions", JSON.stringify(all));
        } catch (e) {
            console.error("Failed saving prescription:", e);
        }
    },

    getByAppointmentId: (appId: string): Prescription | undefined => {
        const all = prescriptionStore.getAll();
        return all.find(p => p.appointmentId === appId);
    }
};
