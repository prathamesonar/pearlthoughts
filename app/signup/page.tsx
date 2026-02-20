"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";
import Link from "next/link";

export default function SignupPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleSignup = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const target = e.target as typeof e.target & {
      fullname: { value: string };
      email: { value: string };
      phone: { value: string };
      password: { value: string };
      confirmPassword: { value: string };
    };

    const { fullname, email, phone, password, confirmPassword } = target;

    if (!fullname.value || !email.value || !phone.value || !password.value || !confirmPassword.value) {
      Swal.fire({
        icon: "error",
        title: "All fields are required",
        confirmButtonColor: "#22d3ee",
      });
      return;
    }

    if (password.value !== confirmPassword.value) {
      Swal.fire({
        icon: "error",
        title: "Passwords do not match",
        confirmButtonColor: "#22d3ee",
      });
      return;
    }

    // Store pending user data in sessionStorage for OTP verification
    sessionStorage.setItem(
      "schedula_pending_user",
      JSON.stringify({
        name: fullname.value,
        email: email.value,
        phone: phone.value,
        password: password.value,
        location: "India",
      })
    );

    // Simulate sending OTP and redirect to OTP verification page
    router.push(`/otp-verification?phone=${phone.value}`);
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

      {/* Signup Card */}
      <div className="relative w-full max-w-md p-8 sm:p-10 rounded-3xl bg-white/95 backdrop-blur-sm shadow-2xl border border-white/50 z-10">
        <h2 className="text-3xl font-bold text-gray-900 text-center mb-2">
          Create Account
        </h2>
        <p className="text-gray-600 text-center mb-8">
          Sign up to get started
        </p>

        <form className="space-y-5" onSubmit={handleSignup}>
          <div>
            <input
              type="text"
              name="fullname"
              placeholder="Enter your full name"
              required
              className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50/50 focus:ring-2 focus:ring-cyan-500 focus:border-transparent focus:outline-none placeholder-gray-400 text-gray-900 transition"
            />
          </div>

          <div>
            <input
              type="email"
              name="email"
              placeholder="Enter your email"
              required
              className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50/50 focus:ring-2 focus:ring-cyan-500 focus:border-transparent focus:outline-none placeholder-gray-400 text-gray-900 transition"
            />
          </div>

          <div>
            <input
              type="tel"
              name="phone"
              placeholder="Enter your phone number"
              required
              className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50/50 focus:ring-2 focus:ring-cyan-500 focus:border-transparent focus:outline-none placeholder-gray-400 text-gray-900 transition"
            />
          </div>

          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Enter your password"
              required
              className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50/50 focus:ring-2 focus:ring-cyan-500 focus:border-transparent focus:outline-none placeholder-gray-400 text-gray-900 transition pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-3 text-gray-400 hover:text-gray-600 transition-colors"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          <div className="relative">
            <input
              type={showConfirmPassword ? "text" : "password"}
              name="confirmPassword"
              placeholder="Confirm your password"
              required
              className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50/50 focus:ring-2 focus:ring-cyan-500 focus:border-transparent focus:outline-none placeholder-gray-400 text-gray-900 transition pr-10"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-3 text-gray-400 hover:text-gray-600 transition-colors"
            >
              {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          <button
            type="submit"
            className="w-full py-3.5 rounded-xl bg-cyan-500 text-white font-bold hover:bg-cyan-600 hover:-translate-y-0.5 transition transform duration-200 shadow-lg"
          >
            Sign Up
          </button>
        </form>

        {/* OR Separator */}
        <div className="flex items-center my-6">
          <hr className="flex-1 border-gray-300" />
          <span className="px-3 text-gray-500 text-sm font-medium">OR</span>
          <hr className="flex-1 border-gray-300" />
        </div>

        {/* Social Sign Up */}
        <div className="space-y-3">
          <button
            type="button"
            className="w-full flex items-center justify-center py-3 rounded-xl border border-gray-200 bg-white shadow-sm hover:shadow-md hover:bg-gray-50 transition duration-300 group"
          >
            <img
              src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/google/google-original.svg"
              alt="Google"
              className="w-5 h-5 mr-3 group-hover:scale-110 transition-transform"
            />
            <span className="text-gray-700 font-medium">Sign up with Google</span>
          </button>

          <button
            type="button"
            className="w-full flex items-center justify-center py-3 rounded-xl border border-gray-200 bg-white shadow-sm hover:shadow-md hover:bg-gray-50 transition duration-300 group"
          >
            <svg className="h-5 w-5 mr-3 text-black group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.74 1.18 0 2.24-.93 4.15-.84 1.14.05 2.19.51 2.89 1.41-5.17 2.6-1.54 9.17 2.37 10.74-.22.65-.54 1.41-.98 2.35-.49 1.05-1.06 2.05-2.02 2.88l-1.49-1.31zM12.03 7.25c-.25-1.95 1.09-3.9 2.85-5.01.27 2.1-1.78 4.29-2.85 5.01z" />
            </svg>
            <span className="text-gray-700 font-medium">Sign up with Apple</span>
          </button>
        </div>

        {/* Login Link */}
        <p className="text-center text-gray-600 text-sm mt-8">
          Already have an account?{" "}
          <Link href="/" className="font-bold text-cyan-500 hover:text-cyan-600 hover:underline transition-colors">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}
