"use client";

export interface Doctor {
    id: string;
    name: string;
    specialty: string;
    qualification: string;
    experience: string;
    patients: string;
    rating: number;
    reviews: number;
    availability: string;
    timings: string;
    about: string;
    imageUrl: string;
    services: { service: string; value: string }[];
    availableDays: string;
}

export interface User {
    name: string;
    email: string;
    phone: string;
    password: string;
    location: string;
}

export const doctors: Doctor[] = [
    {
        id: "1",
        name: "Dr. Prakash Das",
        specialty: "Sr. Psychologist",
        qualification: "MBBS, MD (Psychiatry)",
        experience: "7+",
        patients: "2,100+",
        rating: 4.6,
        reviews: 1820,
        availability: "Available today",
        timings: "09:30 AM - 07:00 PM",
        about:
            "As Psychologist Dr Das practices about 7+ years of experience in all aspects of mental health, including cognitive behavioral therapy and counseling.",
        imageUrl:
            "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&q=80&w=300",
        services: [
            { service: "Service", value: "Mental Health" },
            { service: "Specialization", value: "Psychology" },
        ],
        availableDays: "Monday to Friday",
    },
    {
        id: "2",
        name: "Dr. Kumar Das",
        specialty: "Ophthalmologist",
        qualification: "MBBS, MS (Surgeon)",
        experience: "10+",
        patients: "5,000+",
        rating: 4.8,
        reviews: 4942,
        availability: "Available today",
        timings: "10:00 AM - 05:00 PM",
        about:
            "15+ years of experience in all aspects of cardiology, including non-invasive and interventional, interventional procedures.",
        imageUrl:
            "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=300",
        services: [
            { service: "Service", value: "Medicare" },
            { service: "Specialization", value: "Cardiology" },
        ],
        availableDays: "Monday to Friday",
    },
    {
        id: "3",
        name: "Dr. Ananya Sharma",
        specialty: "Dermatologist",
        qualification: "MBBS, MD (Dermatology)",
        experience: "8+",
        patients: "3,500+",
        rating: 4.7,
        reviews: 2150,
        availability: "Available today",
        timings: "11:00 AM - 06:00 PM",
        about:
            "Specialist in skin care, cosmetic dermatology, and treatment of chronic skin conditions with 8+ years of experience.",
        imageUrl:
            "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=300",
        services: [
            { service: "Service", value: "Skin Care" },
            { service: "Specialization", value: "Dermatology" },
        ],
        availableDays: "Monday to Saturday",
    },
    {
        id: "4",
        name: "Dr. Rajesh Patel",
        specialty: "Cardiologist",
        qualification: "MBBS, DM (Cardiology)",
        experience: "15+",
        patients: "8,200+",
        rating: 4.9,
        reviews: 5630,
        availability: "Available tomorrow",
        timings: "09:00 AM - 04:00 PM",
        about:
            "Leading cardiologist with 15+ years of expertise in interventional cardiology, heart failure management, and preventive cardiology.",
        imageUrl:
            "https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&q=80&w=300",
        services: [
            { service: "Service", value: "Heart Care" },
            { service: "Specialization", value: "Cardiology" },
        ],
        availableDays: "Monday to Friday",
    },
    {
        id: "5",
        name: "Dr. Meera Joshi",
        specialty: "Pediatrician",
        qualification: "MBBS, MD (Pediatrics)",
        experience: "12+",
        patients: "6,100+",
        rating: 4.8,
        reviews: 3920,
        availability: "Available today",
        timings: "10:00 AM - 06:00 PM",
        about:
            "Dedicated pediatrician with 12+ years of experience in child healthcare, vaccinations, and developmental assessments.",
        imageUrl:
            "https://images.unsplash.com/photo-1594824476967-48c8b964ac31?auto=format&fit=crop&q=80&w=300",
        services: [
            { service: "Service", value: "Child Care" },
            { service: "Specialization", value: "Pediatrics" },
        ],
        availableDays: "Monday to Saturday",
    },
    {
        id: "6",
        name: "Dr. Arjun Mehta",
        specialty: "Orthopedic Surgeon",
        qualification: "MBBS, MS (Ortho)",
        experience: "11+",
        patients: "4,300+",
        rating: 4.7,
        reviews: 2780,
        availability: "Available today",
        timings: "08:00 AM - 03:00 PM",
        about:
            "Expert orthopedic surgeon specializing in joint replacements, sports injuries, and spine disorders with 11+ years of practice.",
        imageUrl:
            "https://images.unsplash.com/photo-1582750433449-648ed127bb54?auto=format&fit=crop&q=80&w=300",
        services: [
            { service: "Service", value: "Bone & Joint" },
            { service: "Specialization", value: "Orthopedics" },
        ],
        availableDays: "Tuesday to Saturday",
    },
    {
        id: "7",
        name: "Dr. Sneha Kulkarni",
        specialty: "Gynecologist",
        qualification: "MBBS, MS (OB-GYN)",
        experience: "9+",
        patients: "3,800+",
        rating: 4.8,
        reviews: 3100,
        availability: "Available today",
        timings: "10:00 AM - 05:00 PM",
        about:
            "Experienced gynecologist providing comprehensive women's healthcare including prenatal care, fertility treatments, and minimally invasive surgery.",
        imageUrl:
            "https://images.unsplash.com/photo-1651008376811-b90baee60c1f?auto=format&fit=crop&q=80&w=300",
        services: [
            { service: "Service", value: "Women's Health" },
            { service: "Specialization", value: "Gynecology" },
        ],
        availableDays: "Monday to Friday",
    },
    {
        id: "8",
        name: "Dr. Vikram Singh",
        specialty: "ENT Specialist",
        qualification: "MBBS, MS (ENT)",
        experience: "6+",
        patients: "1,900+",
        rating: 4.5,
        reviews: 1450,
        availability: "Available today",
        timings: "11:00 AM - 07:00 PM",
        about:
            "ENT specialist with 6+ years of experience treating ear, nose, and throat conditions, including sinus surgery and hearing disorders.",
        imageUrl:
            "https://images.unsplash.com/photo-1666214280557-f1b5022eb634?auto=format&fit=crop&q=80&w=300",
        services: [
            { service: "Service", value: "ENT Care" },
            { service: "Specialization", value: "Otolaryngology" },
        ],
        availableDays: "Monday to Saturday",
    },
];

export const defaultUser: User = {
    name: "Priya Sharma",
    email: "demo@gmail.com",
    phone: "9876543210",
    password: "Demo@123",
    location: "Dombivali, Mumbai",
};

export function seedDefaultUser() {
    if (typeof window === "undefined") return;
    const existing = localStorage.getItem("schedula_users");
    if (!existing) {
        localStorage.setItem("schedula_users", JSON.stringify([defaultUser]));
    } else {
        const users: User[] = JSON.parse(existing);
        const hasDefault = users.some((u) => u.email === defaultUser.email);
        if (!hasDefault) {
            users.push(defaultUser);
            localStorage.setItem("schedula_users", JSON.stringify(users));
        }
    }
}

export function getLoggedInUser(): User | null {
    if (typeof window === "undefined") return null;
    const raw = localStorage.getItem("schedula_current_user");
    if (!raw) return null;
    return JSON.parse(raw) as User;
}

export function loginUser(email: string, password: string): User | null {
    if (typeof window === "undefined") return null;
    const raw = localStorage.getItem("schedula_users");
    if (!raw) return null;
    const users: User[] = JSON.parse(raw);
    const found = users.find(
        (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password
    );
    if (found) {
        localStorage.setItem("schedula_current_user", JSON.stringify(found));
        return found;
    }
    return null;
}

export function logoutUser() {
    if (typeof window === "undefined") return;
    localStorage.removeItem("schedula_current_user");
}

export function registerUser(user: User): boolean {
    if (typeof window === "undefined") return false;
    const raw = localStorage.getItem("schedula_users");
    const users: User[] = raw ? JSON.parse(raw) : [];
    const exists = users.some(
        (u) => u.email.toLowerCase() === user.email.toLowerCase()
    );
    if (exists) return false;
    users.push(user);
    localStorage.setItem("schedula_users", JSON.stringify(users));
    return true;
}
