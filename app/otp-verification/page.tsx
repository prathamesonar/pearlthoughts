"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Swal from "sweetalert2";
import { registerUser, setUserSession } from "../lib/data";
import type { User } from "../lib/data";

function OTPContent() {
  const [otp, setOtp] = useState("");
  const router = useRouter();
  const searchParams = useSearchParams();
  const phone = searchParams.get("phone");
  const flow = searchParams.get("flow"); // "login" or null (signup)

  const correctOTP = "123456"; // Simulated OTP

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    if (otp === correctOTP) {
      if (flow === "login") {
        // Login flow: user is already authenticated in localStorage, go to dashboard
        const pendingRaw = sessionStorage.getItem("schedula_login_pending");
        if (pendingRaw) {
          const user: User = JSON.parse(pendingRaw);
          // Only NOW set the session — this is the gate
          setUserSession(user);
          sessionStorage.removeItem("schedula_login_pending");
        }
        Swal.fire({
          icon: "success",
          title: "Welcome Back!",
          text: "OTP verified successfully.",
          timer: 1500,
          showConfirmButton: false,
        }).then(() => {
          router.push("/dashboard");
        });
      } else {
        // Signup flow: register the pending user
        const pendingRaw = sessionStorage.getItem("schedula_pending_user");
        if (pendingRaw) {
          const pendingUser: User = JSON.parse(pendingRaw);
          const success = registerUser(pendingUser);
          if (!success) {
            Swal.fire({
              icon: "warning",
              title: "Email Already Exists",
              text: "An account with this email already exists. Please login instead.",
              confirmButtonColor: "#22d3ee",
            }).then(() => {
              router.push("/");
            });
            return;
          }
          sessionStorage.removeItem("schedula_pending_user");
        }

        Swal.fire({
          icon: "success",
          title: "Account Created!",
          text: `Your account for ${phone} has been successfully created.`,
          confirmButtonColor: "#22d3ee",
        }).then(() => {
          router.push("/");
        });
      }
    } else {
      Swal.fire({
        icon: "error",
        title: "Invalid OTP",
        text: "Please enter the correct OTP sent to your mobile number.",
        confirmButtonColor: "#22d3ee",
      });
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center px-4 overflow-hidden font-sans">

      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <img
          src="https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&q=80&w=2070"
          alt="Medical Background"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-cyan-900/40 backdrop-blur-sm mix-blend-multiply"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-cyan-900/60 to-transparent"></div>
      </div>

      {/* OTP Card */}
      <div className="relative w-full max-w-md p-8 rounded-3xl bg-white/95 backdrop-blur-sm shadow-2xl border border-white/50 z-10">
        <h2 className="text-2xl font-bold text-gray-900 text-center mb-4">Verify OTP</h2>
        <p className="text-center text-gray-600 mb-2">
          Enter the 6-digit OTP sent to <br />
          <span className="font-semibold text-cyan-600">{phone ?? "your phone"}</span>
        </p>

        {/* Hint */}
        <div className="mb-6 bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-center text-sm">
          <p className="text-emerald-700">💡 Hint: OTP is <span className="font-mono font-bold">123456</span></p>
        </div>

        <form onSubmit={handleVerify} className="space-y-6">
          <input
            type="text"
            maxLength={6}
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            placeholder="Enter 6-digit OTP"
            className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50/50 focus:ring-2 focus:ring-cyan-500 focus:border-transparent focus:outline-none placeholder-gray-400 text-gray-900 text-center tracking-widest text-lg transition"
            required
          />
          <button
            type="submit"
            className="w-full py-3.5 rounded-xl bg-cyan-500 text-white font-bold hover:bg-cyan-600 hover:-translate-y-0.5 transition transform duration-200 shadow-lg"
          >
            Verify OTP
          </button>
        </form>

        <p className="text-center text-gray-500 text-sm mt-6">
          Didn&apos;t receive code?{" "}
          <button className="font-bold text-cyan-500 hover:text-cyan-600 hover:underline transition-colors bg-transparent border-none cursor-pointer">
            Resend
          </button>
        </p>
      </div>
    </div>
  );
}

export default function OTPPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-400">Loading...</p>
      </div>
    }>
      <OTPContent />
    </Suspense>
  );
}
