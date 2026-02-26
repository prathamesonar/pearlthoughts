"use client";

import { useState, useRef, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Stethoscope } from "lucide-react";
import Swal from "sweetalert2";
import { registerUser, setUserSession, registerDoctor, setDoctorSession } from "../lib/data";
import type { User, DoctorUser } from "../lib/data";

function OTPContent() {
  const [digits, setDigits] = useState<string[]>(["", "", "", "", "", ""]);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const router = useRouter();
  const searchParams = useSearchParams();
  const phone = searchParams.get("phone");
  const flow = searchParams.get("flow"); // "login" or null (signup)
  const role = searchParams.get("role"); // "doctor" or null (user)

  const correctOTP = "123456";
  const [timer, setTimer] = useState(60);

  useEffect(() => {
    if (timer <= 0) return;
    const interval = setInterval(() => {
      setTimer((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [timer]);

  const handleResend = () => {
    setTimer(60);
    setDigits(["", "", "", "", "", ""]);
    inputRefs.current[0]?.focus();
  };

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newDigits = [...digits];
    newDigits[index] = value.slice(-1);
    setDigits(newDigits);
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    const newDigits = [...digits];
    for (let i = 0; i < pasted.length; i++) {
      newDigits[i] = pasted[i];
    }
    setDigits(newDigits);
    const nextIndex = Math.min(pasted.length, 5);
    inputRefs.current[nextIndex]?.focus();
  };

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    const otp = digits.join("");

    if (otp.length < 6) {
      Swal.fire({
        icon: "warning",
        title: "Incomplete OTP",
        text: "Please enter all 6 digits.",
        confirmButtonColor: "#22d3ee",
      });
      return;
    }

    if (otp === correctOTP) {
      // ─── Doctor flows ───
      if (role === "doctor") {
        if (flow === "login") {
          // Doctor login — finalize session
          const pendingRaw = sessionStorage.getItem("schedula_login_pending_doctor");
          if (pendingRaw) {
            const doctor: DoctorUser = JSON.parse(pendingRaw);
            setDoctorSession(doctor);
            sessionStorage.removeItem("schedula_login_pending_doctor");
          }
          Swal.fire({
            icon: "success",
            title: "Welcome, Doctor!",
            text: "OTP verified successfully.",
            timer: 1500,
            showConfirmButton: false,
          }).then(() => {
            router.push("/doctor-dashboard");
          });
        } else {
          // Doctor signup — register doctor
          const pendingRaw = sessionStorage.getItem("schedula_pending_doctor");
          if (pendingRaw) {
            const pendingDoctor: DoctorUser = JSON.parse(pendingRaw);
            const success = registerDoctor(pendingDoctor);
            if (!success) {
              Swal.fire({
                icon: "warning",
                title: "Email Already Exists",
                text: "A doctor account with this email already exists. Please login instead.",
                confirmButtonColor: "#22d3ee",
              }).then(() => {
                router.push("/login");
              });
              return;
            }
            sessionStorage.removeItem("schedula_pending_doctor");
          }
          Swal.fire({
            icon: "success",
            title: "Doctor Account Created!",
            text: "Your doctor account has been successfully created. Please login.",
            confirmButtonColor: "#22d3ee",
          }).then(() => {
            router.push("/login");
          });
        }
      }
      // ─── User flows ───
      else if (flow === "login") {
        const pendingRaw = sessionStorage.getItem("schedula_login_pending");
        if (pendingRaw) {
          const user: User = JSON.parse(pendingRaw);
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
        // User signup
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
              router.push("/login");
            });
            return;
          }
          sessionStorage.removeItem("schedula_pending_user");
        }
        Swal.fire({
          icon: "success",
          title: "Account Created!",
          text: "Your account has been successfully created.",
          confirmButtonColor: "#22d3ee",
        }).then(() => {
          router.push("/login");
        });
      }
    } else {
      Swal.fire({
        icon: "error",
        title: "Invalid OTP",
        text: "Please enter the correct OTP.",
        confirmButtonColor: "#22d3ee",
      });
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center px-4 overflow-hidden font-sans">
      <div className="absolute inset-0 z-0">
        <img
          src="https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&q=80&w=2070"
          alt="Medical Background"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-cyan-900/40 backdrop-blur-sm mix-blend-multiply"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-cyan-900/60 to-transparent"></div>
      </div>

      <div className="relative w-full max-w-md p-8 sm:p-10 rounded-3xl bg-white/95 backdrop-blur-sm shadow-2xl border border-white/50 z-10">
        <div className="flex items-center justify-center gap-2 mb-6">
          <Stethoscope className="w-8 h-8 text-cyan-500" />
          <span className="text-2xl font-bold text-gray-900">Schedula</span>
          <span className="text-xs text-cyan-500 font-medium bg-cyan-50 px-2 py-0.5 rounded-full">Healthcare</span>
        </div>

        <h2 className="text-2xl font-bold text-gray-900 text-center mb-2">OTP Code Verification</h2>
        {role === "doctor" && (
          <p className="text-center text-cyan-600 text-xs font-medium mb-1">🩺 Doctor Verification</p>
        )}
        <p className="text-center text-gray-500 text-sm mb-2">Code has been sent to</p>
        <p className="text-center text-gray-900 font-semibold mb-6">
          +91 {phone ? phone.slice(0, 3) + " ****" + phone.slice(-2) : "XXX ****XX"}
        </p>

        <form onSubmit={handleVerify} className="space-y-6">
          <div className="flex justify-center gap-3" onPaste={handlePaste}>
            {digits.map((digit, i) => (
              <input
                key={i}
                ref={(el) => { inputRefs.current[i] = el; }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(i, e.target.value)}
                onKeyDown={(e) => handleKeyDown(i, e)}
                className={`w-12 h-14 text-center text-xl font-bold rounded-xl border-2 transition-all duration-200 outline-none
                  ${digit
                    ? "border-cyan-500 bg-cyan-50 text-gray-900 shadow-sm"
                    : "border-gray-200 bg-gray-50 text-gray-400"
                  }
                  focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200 focus:bg-white`}
              />
            ))}
          </div>

          <button
            type="submit"
            className="w-full py-3.5 rounded-xl bg-cyan-500 text-white font-bold hover:bg-cyan-600 hover:-translate-y-0.5 transition transform duration-200 shadow-lg cursor-pointer"
          >
            Verify
          </button>
        </form>

        <div className="text-center mt-6">
          {timer > 0 ? (
            <p className="text-gray-500 text-sm">
              Resend code in <span className="font-bold text-cyan-500">{timer}s</span>
            </p>
          ) : (
            <p className="text-gray-500 text-sm">
              Didn&apos;t receive code?{" "}
              <button
                onClick={handleResend}
                className="font-bold text-cyan-500 hover:text-cyan-600 hover:underline transition-colors bg-transparent border-none cursor-pointer"
              >
                Resend
              </button>
            </p>
          )}
        </div>
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
