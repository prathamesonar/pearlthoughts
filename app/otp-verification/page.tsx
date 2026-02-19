"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Swal from "sweetalert2";

export default function OTPPage() {
  const [otp, setOtp] = useState("");
  const [phone, setPhone] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const searchParams = useSearchParams();
    setPhone(searchParams.get("phone"));
  }, []);

  const correctOTP = "123456"; // Simulated OTP

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    if (otp === correctOTP) {
      Swal.fire({
        icon: "success",
        title: "Account Created!",
        text: `Your account for ${phone} has been successfully created.`,
        confirmButtonColor: "#22d3ee", // Cyan-400
      }).then(() => {
        router.push("/"); // redirect to login
      });
    } else {
      Swal.fire({
        icon: "error",
        title: "Invalid OTP",
        text: "Please enter the correct OTP sent to your mobile number.",
        confirmButtonColor: "#22d3ee", // Cyan-400
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
        <p className="text-center text-gray-600 mb-8">
          Enter the 6-digit OTP sent to <br />
          <span className="font-semibold text-cyan-600">{phone ?? "your phone"}</span>
        </p>
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
          Didn't receive code?{" "}
          <button className="font-bold text-cyan-500 hover:text-cyan-600 hover:underline transition-colors bg-transparent border-none cursor-pointer">
            Resend
          </button>
        </p>
      </div>
    </div>
  );
}
