"use client";

import { useState, useEffect } from "react";
import { Eye, EyeOff, Stethoscope, ArrowLeft } from "lucide-react";
import Swal from "sweetalert2";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { seedDefaultUser, validateCredentials, seedDefaultDoctor, validateDoctorCredentials } from "../lib/data";

export default function Home() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [role, setRole] = useState<"user" | "doctor">("user");

  useEffect(() => {
    seedDefaultUser();
    seedDefaultDoctor();
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    await new Promise((resolve) => setTimeout(resolve, 1000));

    if (!email || !password) {
      Swal.fire({
        icon: "error",
        title: "Missing Information",
        text: "Please fill in all required fields.",
        confirmButtonColor: "#22d3ee",
      });
      setIsLoading(false);
      return;
    }

    if (role === "doctor") {
      const doctor = validateDoctorCredentials(email, password);
      if (doctor) {
        sessionStorage.setItem("schedula_login_pending_doctor", JSON.stringify(doctor));
        localStorage.removeItem("schedula_current_doctor");
        Swal.fire({
          icon: "info",
          title: "OTP Sent!",
          text: `A verification code has been sent to ${doctor.phone}.`,
          timer: 1500,
          showConfirmButton: false,
        }).then(() => {
          router.push(`/otp-verification?phone=${doctor.phone}&flow=login&role=doctor`);
        });
      } else {
        Swal.fire({
          icon: "error",
          title: "Invalid Credentials",
          text: "Doctor email or password is incorrect.",
          confirmButtonColor: "#22d3ee",
        });
      }
    } else {
      const user = validateCredentials(email, password);
      if (user) {
        sessionStorage.setItem("schedula_login_pending", JSON.stringify(user));
        localStorage.removeItem("schedula_current_user");
        Swal.fire({
          icon: "info",
          title: "OTP Sent!",
          text: `A verification code has been sent to ${user.phone}.`,
          timer: 1500,
          showConfirmButton: false,
        }).then(() => {
          router.push(`/otp-verification?phone=${user.phone}&flow=login`);
        });
      } else {
        Swal.fire({
          icon: "error",
          title: "Invalid Credentials",
          text: "Email or password is incorrect.",
          confirmButtonColor: "#22d3ee",
        });
      }
    }

    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative px-4 py-8 font-sans">
      {/* Background */}
      <div className="absolute inset-0 z-0">
        <img
          src="https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&q=80&w=2070"
          alt="Medical Background"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-cyan-900/40 backdrop-blur-sm" />
      </div>

      {/* Card */}
      <div className="relative z-10 w-full max-w-md bg-white/95 p-6 sm:p-8 md:p-10 rounded-3xl shadow-2xl border border-gray-200">
        {/* Back to Home */}
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-cyan-600 transition-colors mb-5 group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          Back to Home
        </Link>

        {/* Logo */}
        <div className="flex items-center justify-center gap-2 mb-6">
          <Stethoscope className="w-8 h-8 text-cyan-500" />
          <span className="text-2xl font-bold text-gray-900">Schedula</span>
          <span className="text-xs text-cyan-500 font-medium bg-cyan-50 px-2 py-0.5 rounded-full">Healthcare</span>
        </div>

        {/* Role Toggle */}
        <div className="flex bg-gray-100 p-1 rounded-xl mb-6">
          <button
            type="button"
            onClick={() => { setRole("user"); setEmail(""); setPassword(""); }}
            className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all cursor-pointer ${role === "user"
                ? "bg-white text-cyan-600 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
              }`}
          >
            👤 Patient
          </button>
          <button
            type="button"
            onClick={() => { setRole("doctor"); setEmail(""); setPassword(""); }}
            className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all cursor-pointer ${role === "doctor"
                ? "bg-white text-cyan-600 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
              }`}
          >
            🩺 Doctor
          </button>
        </div>

        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          {role === "doctor" ? "Doctor Login" : "Login"}
        </h2>

        {/* Demo Credentials */}
        <div className="mb-5 bg-cyan-50 border border-cyan-200 rounded-xl p-3 text-sm">
          <p className="font-semibold text-cyan-700 mb-1">
            {role === "doctor" ? "Demo Doctor Credentials" : "Demo Credentials"}
          </p>
          {role === "doctor" ? (
            <>
              <p className="text-cyan-600">Email: <span className="font-mono font-medium">doctor@gmail.com</span></p>
              <p className="text-cyan-600">Password: <span className="font-mono font-medium">Doctor@123</span></p>
              <p className="text-cyan-600">OTP: <span className="font-mono font-medium">123456</span></p>
            </>
          ) : (
            <>
              <p className="text-cyan-600">Email: <span className="font-mono font-medium">demo@gmail.com</span></p>
              <p className="text-cyan-600">Password: <span className="font-mono font-medium">Demo@123</span></p>
              <p className="text-cyan-600">OTP: <span className="font-mono font-medium">123456</span></p>
            </>
          )}
        </div>

        <form className="space-y-6" onSubmit={handleLogin}>
          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Mobile / Email
            </label>
            <input
              type="text"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Login with Mobile or Email"
              className="
                w-full px-4 py-3 rounded-xl
                border border-gray-300
                bg-white text-gray-900
                placeholder-gray-400
                shadow-sm
                focus:outline-none
                focus:ring-2 focus:ring-cyan-500
                focus:border-cyan-500
                transition
              "
            />
          </div>

          {/* Password */}
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="
                w-full px-4 py-3 rounded-xl
                border border-gray-300
                bg-white text-gray-900
                placeholder-gray-400
                shadow-sm
                focus:outline-none
                focus:ring-2 focus:ring-cyan-500
                focus:border-cyan-500
                transition pr-10
              "
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          {/* Remember + Forgot */}
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 text-sm text-gray-600">
              <input type="checkbox" className="rounded border-gray-300" />
              Remember Me
            </label>
            <a className="text-sm text-rose-500 hover:text-rose-600 cursor-pointer">
              Forgot Password?
            </a>
          </div>

          {/* Login Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="
              w-full py-3.5 rounded-xl
              bg-cyan-500 text-white font-bold
              hover:bg-cyan-600
              transition shadow-lg
              disabled:opacity-70 cursor-pointer
            "
          >
            {isLoading ? "Processing..." : (role === "doctor" ? "Login as Doctor" : "Login")}
          </button>
        </form>

        {/* Divider */}
        <div className="my-8 flex items-center">
          <hr className="flex-1 border-gray-200" />
          <span className="px-4 text-sm text-gray-500">Or login with</span>
          <hr className="flex-1 border-gray-200" />
        </div>

        {/* Social Login */}
        <div className="space-y-3">
          <button
            type="button"
            className="
              w-full flex items-center justify-center
              py-3 px-4 rounded-xl
              border border-gray-300
              bg-gray-50 text-gray-700
              font-medium shadow-sm
              hover:bg-gray-100 hover:shadow-md
              transition
            "
          >
            <img
              src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/google/google-original.svg"
              alt="Google"
              className="w-5 h-5 mr-3"
            />
            Continue with Google
          </button>

          <button
            type="button"
            className="
              w-full flex items-center justify-center
              py-3 px-4 rounded-xl
              border border-gray-300
              bg-gray-50 text-gray-800
              font-medium shadow-sm
              hover:bg-gray-100 hover:shadow-md
              transition
            "
          >
            <svg
              className="w-5 h-5 mr-3 text-black"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.74 1.18 0 2.24-.93 4.15-.84 1.14.05 2.19.51 2.89 1.41-5.17 2.6-1.54 9.17 2.37 10.74-.22.65-.54 1.41-.98 2.35-.49 1.05-1.06 2.05-2.02 2.88zM12.03 7.25c-.25-1.95 1.09-3.9 2.85-5.01.27 2.1-1.78 4.29-2.85 5.01z" />
            </svg>
            Continue with Apple
          </button>
        </div>

        {/* Sign Up */}
        <p className="mt-8 text-center text-sm text-gray-500">
          Don&apos;t have an account?{" "}
          <Link
            href={role === "doctor" ? "/doctor-signup" : "/signup"}
            className="font-bold text-cyan-500 hover:text-cyan-600"
          >
            Sign Up {role === "doctor" ? "as Doctor" : ""}
          </Link>
        </p>
      </div>
    </div>
  );
}
