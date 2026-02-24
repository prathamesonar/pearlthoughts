import Link from "next/link";
import {
  Stethoscope,
  Calendar,
  Shield,
  Clock,
  Heart,
  Users,
  Star,
  ChevronRight,
} from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white font-sans">
      {/* ========== NAVBAR ========== */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <Stethoscope className="w-7 h-7 text-cyan-500" />
            <span className="text-xl font-bold text-gray-900">Schedula</span>
            <span className="text-[10px] text-cyan-500 font-medium bg-cyan-50 px-1.5 py-0.5 rounded-full hidden sm:inline">
              Healthcare
            </span>
          </div>

          {/* Nav Links */}
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="px-5 py-2 text-sm font-medium text-gray-700 hover:text-cyan-600 transition-colors"
            >
              Login
            </Link>
            <Link
              href="/signup"
              className="px-5 py-2.5 text-sm font-bold text-white bg-cyan-500 rounded-xl hover:bg-cyan-600 hover:-translate-y-0.5 transition-all duration-200 shadow-md shadow-cyan-200"
            >
              Sign Up
            </Link>
          </div>
        </div>
      </nav>

      {/* ========== HERO ========== */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-50 via-white to-teal-50"></div>
        <div className="absolute top-20 right-0 w-96 h-96 bg-cyan-200/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-teal-200/20 rounded-full blur-3xl"></div>

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 py-20 md:py-28">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Left content */}
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 bg-cyan-50 border border-cyan-200 rounded-full px-4 py-1.5 text-sm text-cyan-600 font-medium">
                <Heart className="w-4 h-4" />
                Trusted by 10,000+ patients
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-gray-900 leading-tight">
                Your Health,{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-500 to-teal-500">
                  Our Priority
                </span>
              </h1>
              <p className="text-lg text-gray-600 leading-relaxed max-w-lg">
                Book appointments with top doctors in seconds. Access medical records,
                manage prescriptions, and take control of your healthcare journey.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <Link
                  href="/signup"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-cyan-500 to-teal-500 text-white font-bold rounded-2xl text-base shadow-lg shadow-cyan-200 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200"
                >
                  Get Started Free
                  <ChevronRight className="w-5 h-5" />
                </Link>
                <Link
                  href="/login"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-gray-700 font-bold rounded-2xl text-base border-2 border-gray-200 hover:border-cyan-300 hover:-translate-y-0.5 transition-all duration-200"
                >
                  Login to Dashboard
                </Link>
              </div>

              {/* Trust badges */}
              <div className="flex items-center gap-6 pt-4">
                <div className="flex items-center gap-1.5">
                  <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                  <span className="text-sm font-bold text-gray-900">4.9</span>
                  <span className="text-sm text-gray-500">Rating</span>
                </div>
                <div className="h-4 w-px bg-gray-200"></div>
                <div className="flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-cyan-500" />
                  <span className="text-sm font-bold text-gray-900">50+</span>
                  <span className="text-sm text-gray-500">Doctors</span>
                </div>
                <div className="h-4 w-px bg-gray-200"></div>
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-emerald-500" />
                  <span className="text-sm font-bold text-gray-900">10K+</span>
                  <span className="text-sm text-gray-500">Bookings</span>
                </div>
              </div>
            </div>

            {/* Right image */}
            <div className="relative hidden md:block">
              <div className="rounded-3xl overflow-hidden shadow-2xl border border-gray-100">
                <img
                  src="https://images.unsplash.com/photo-1631217868264-e5b90bb7e133?auto=format&fit=crop&q=80&w=800"
                  alt="Doctor consultation"
                  className="w-full h-[480px] object-cover"
                />
              </div>
              {/* Floating card */}
              <div className="absolute -bottom-6 -left-6 bg-white rounded-2xl p-4 shadow-xl border border-gray-100 flex items-center gap-3">
                <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-emerald-500" />
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-900">Appointment Booked!</p>
                  <p className="text-xs text-gray-500">Dr. Kumar Das • 10:00 AM</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========== FEATURES ========== */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-3">
              Why Choose Schedula?
            </h2>
            <p className="text-gray-500 text-lg max-w-xl mx-auto">
              Everything you need to manage your healthcare, all in one place.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: Calendar,
                title: "Easy Booking",
                desc: "Book appointments with top doctors in just a few clicks. Choose your preferred date and time slot.",
                color: "cyan",
              },
              {
                icon: Shield,
                title: "OTP Secured Login",
                desc: "Every login is verified with a 6-digit OTP for maximum account security and data protection.",
                color: "emerald",
              },
              {
                icon: Clock,
                title: "Real-Time Availability",
                desc: "See doctor availability in real-time. No more calling clinics — book instantly online.",
                color: "violet",
              },
              {
                icon: Heart,
                title: "Medical Records",
                desc: "Store and access your medical records, lab reports, and prescriptions securely anytime.",
                color: "rose",
              },
              {
                icon: Users,
                title: "Top Specialists",
                desc: "Browse verified doctors across cardiology, dermatology, orthopedics, and more specialties.",
                color: "amber",
              },
              {
                icon: Star,
                title: "Ratings & Reviews",
                desc: "Read genuine patient reviews and ratings to make informed decisions about your healthcare.",
                color: "blue",
              },
            ].map((feature, i) => (
              <div
                key={i}
                className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300"
              >
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${feature.color === "cyan"
                      ? "bg-cyan-100 text-cyan-500"
                      : feature.color === "emerald"
                        ? "bg-emerald-100 text-emerald-500"
                        : feature.color === "violet"
                          ? "bg-violet-100 text-violet-500"
                          : feature.color === "rose"
                            ? "bg-rose-100 text-rose-500"
                            : feature.color === "amber"
                              ? "bg-amber-100 text-amber-500"
                              : "bg-blue-100 text-blue-500"
                    }`}
                >
                  <feature.icon className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========== HOW IT WORKS ========== */}
      <section className="py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-3">
              How It Works
            </h2>
            <p className="text-gray-500 text-lg max-w-xl mx-auto">
              Get started in 3 simple steps
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                title: "Create Account",
                desc: "Sign up with your email and phone number. Verify with OTP for secure access.",
              },
              {
                step: "02",
                title: "Find a Doctor",
                desc: "Browse specialists, check availability, and read reviews to find the right doctor.",
              },
              {
                step: "03",
                title: "Book Appointment",
                desc: "Select your preferred date and time slot. Get instant confirmation for your visit.",
              },
            ].map((item, i) => (
              <div key={i} className="text-center">
                <div className="w-16 h-16 mx-auto mb-5 rounded-2xl bg-gradient-to-br from-cyan-500 to-teal-500 flex items-center justify-center text-white text-xl font-black shadow-lg shadow-cyan-200">
                  {item.step}
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed max-w-xs mx-auto">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========== CTA ========== */}
      <section className="py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="bg-gradient-to-r from-cyan-500 to-teal-500 rounded-3xl p-10 md:p-16 text-center text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-black/10 rounded-full blur-3xl"></div>
            <div className="relative z-10">
              <h2 className="text-3xl md:text-4xl font-black mb-4">
                Ready to Book Your Appointment?
              </h2>
              <p className="text-lg text-cyan-100 mb-8 max-w-lg mx-auto">
                Join thousands of patients who manage their healthcare effortlessly with Schedula.
              </p>
              <Link
                href="/signup"
                className="inline-flex items-center gap-2 px-10 py-4 bg-white text-cyan-600 font-bold rounded-2xl text-base shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200"
              >
                Get Started — It&apos;s Free
                <ChevronRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ========== FOOTER ========== */}
      <footer className="bg-gray-50 border-t border-gray-100 py-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Stethoscope className="w-5 h-5 text-cyan-500" />
              <span className="font-bold text-gray-900">Schedula</span>
              <span className="text-[10px] text-cyan-500 font-medium bg-cyan-50 px-1.5 py-0.5 rounded-full">
                Healthcare
              </span>
            </div>
            <p className="text-sm text-gray-400">
              © 2026 Schedula Healthcare. All rights reserved.
            </p>
            <div className="flex items-center gap-4">
              <Link href="/login" className="text-sm text-gray-500 hover:text-cyan-500 transition">
                Login
              </Link>
              <Link href="/signup" className="text-sm text-gray-500 hover:text-cyan-500 transition">
                Sign Up
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
