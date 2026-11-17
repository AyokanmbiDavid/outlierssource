
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { LazyMotion, domAnimation, m } from "framer-motion";
import { useNotifications } from "../context/NotificationContext";

import {
  ShieldCheck,
  LockKeyhole,
  UserRound,
  Eye,
  EyeOff,
  ArrowRight,
  GraduationCap,
  ArrowLeft,
  Fingerprint
} from "lucide-react";

import { supabase } from "../services/supabase";

export default function AdminLogin() {
  const { notify } = useNotifications();
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const [form, setForm] = useState({
    email: "",
    password: ""
  });

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  

const handleSubmit = async (e) => {
  e.preventDefault();
  setMessage("");

  if (!form.email.trim() || !form.password) {
    const msg = "Enter your administrator email and password.";
    setMessage(msg);
    notify(msg, "warning", { title: "Missing details" });
    return;
  }

  setLoading(true);

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: form.email.trim(),
      password: form.password
    });

    if (error) throw error;

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("id, role")
      .eq("id", data.user.id)
      .maybeSingle();

    if (profileError) {
      await supabase.auth.signOut();
      throw new Error(`Profile lookup failed: ${profileError.message}`);
    }

    if (!profile) {
      await supabase.auth.signOut();
      throw new Error("No profile was found for this administrator account.");
    }

    if (String(profile.role).trim().toLowerCase() !== "admin") {
      await supabase.auth.signOut();
      throw new Error("Access denied. This account is not an administrator.");
    }

    notify("Welcome to your administration workspace.", "success", {
      title: "Admin login successful"
    });

    navigate("/admin/dashboard", { replace: true });

  } catch (error) {
    console.error("Admin login error:", error);

    const msg = error.message === "Invalid login credentials"
      ? "Incorrect email or password."
      : error.message || "Unable to sign in. Please try again.";

    setMessage(msg);
    notify(msg, "error", { title: "Login failed" });

  } finally {
    setLoading(false);
  }
};



  return (
    <LazyMotion features={domAnimation}>
      <main className="min-h-screen bg-[#F5F8F6] flex items-center justify-center p-4 sm:p-8">

        <div className="w-full max-w-6xl bg-white rounded-[30px] overflow-hidden shadow-[0_12px_60px_rgba(24,75,65,0.07)] grid lg:grid-cols-2">

          {/* LEFT ADMIN BRAND PANEL */}
          <m.section
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.45 }}
            className="hidden lg:flex flex-col justify-between bg-[#E7F3EF] p-12 relative overflow-hidden"
          >
            <div className="absolute -right-24 -bottom-24 w-80 h-80 rounded-full bg-[#C9E5DB] opacity-60" />

            <div className="relative z-10 flex items-center gap-3">
              <div className="w-12 h-12 bg-[#176D68] rounded-2xl flex items-center justify-center text-white">
                <GraduationCap size={25} />
              </div>

              <div>
                <h1 className="text-xl font-bold text-[#203B35]">
                  OutliersSource
                </h1>
                <p className="text-xs text-[#648079]">
                  Departmental Portal
                </p>
              </div>
            </div>

            <div className="relative z-10 max-w-md">
              <div className="w-16 h-16 rounded-2xl bg-white flex items-center justify-center text-[#176D68] shadow-sm mb-7">
                <Fingerprint size={32} />
              </div>

              <h2 className="text-4xl font-bold leading-tight text-[#203B35]">
                Manage your department with confidence.
              </h2>

              <p className="mt-5 text-[#648079] leading-7">
                Manage academic activities, student records,
                learning materials and departmental updates
                from your administration workspace.
              </p>

              <div className="flex items-center gap-3 mt-9 text-sm text-[#47736A]">
                <ShieldCheck size={19} />
                <span>Restricted administrator access</span>
              </div>
            </div>

            <p className="relative z-10 text-xs text-[#78938B]">
              © {new Date().getFullYear()} OutliersSource
            </p>
          </m.section>

          {/* RIGHT ADMIN LOGIN */}
          <m.section
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="p-6 sm:p-10 lg:p-14 flex flex-col justify-center"
          >

            {/* Mobile branding */}
            <div className="flex lg:hidden items-center gap-3 mb-10">
              <div className="w-11 h-11 rounded-xl bg-[#176D68] text-white flex items-center justify-center">
                <GraduationCap size={23} />
              </div>

              <div>
                <h1 className="font-bold text-lg text-[#203B35]">
                  OutliersSource
                </h1>
                <p className="text-xs text-[#81918B]">
                  Administration
                </p>
              </div>
            </div>

            <div className="max-w-md w-full mx-auto">

              <button
                type="button"
                onClick={() => navigate("/sign")}
                className="flex items-center gap-2 text-sm text-[#71827C] hover:text-[#176D68] mb-9 transition"
              >
                <ArrowLeft size={17} />
                Student portal
              </button>

              <div className="mb-9">
                <div className="inline-flex items-center gap-2 px-3 py-2 rounded-full bg-[#E4F2EF] text-[#176D68] text-xs font-semibold mb-5">
                  <ShieldCheck size={15} />
                  ADMINISTRATION
                </div>

                <h2 className="text-3xl sm:text-4xl font-bold text-[#20302D]">
                  Admin sign in
                </h2>

                <p className="text-sm text-[#81918B] mt-3">
                  Sign in to access your administration workspace.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">

                {/* Email */}
                <div>
                  <label className="block text-sm font-semibold text-[#354540] mb-2">
                    Administrator email
                  </label>

                  <div className="flex items-center bg-[#F1F5F3] rounded-2xl px-4 focus-within:ring-2 focus-within:ring-[#A5D2C4] transition">
                    <UserRound size={19} className="text-[#78918A]" />

                    <input
                      type="email"
                      name="email"
                      value={form.email}
                      onChange={handleChange}
                      placeholder="Enter admin email"
                      autoComplete="username"
                      required
                      className="w-full bg-transparent outline-none py-4 px-3 text-sm text-[#20302D] placeholder:text-[#A0ADA8]"
                    />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <label className="block text-sm font-semibold text-[#354540] mb-2">
                    Password
                  </label>

                  <div className="flex items-center bg-[#F1F5F3] rounded-2xl px-4 focus-within:ring-2 focus-within:ring-[#A5D2C4] transition">
                    <LockKeyhole size={19} className="text-[#78918A]" />

                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={form.password}
                      onChange={handleChange}
                      placeholder="Enter admin password"
                      autoComplete="current-password"
                      required
                      className="w-full bg-transparent outline-none py-4 px-3 text-sm text-[#20302D] placeholder:text-[#A0ADA8]"
                    />

                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="text-[#78918A] p-1"
                      aria-label="Toggle password visibility"
                    >
                      {showPassword ? <EyeOff size={19} /> : <Eye size={19} />}
                    </button>
                  </div>
                </div>

                {/* Feedback */}
                {message && (
                  <p
                    role="alert"
                    className="text-sm text-[#B45B46] bg-[#FFF2ED] rounded-xl p-3"
                  >
                    {message}
                  </p>
                )}

                {/* Submit */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#176D68] hover:bg-[#105A55] disabled:opacity-60 text-white rounded-full py-4 font-semibold flex items-center justify-center gap-3 transition active:scale-[0.98]"
                >
                  {loading ? "Verifying..." : "Access admin workspace"}
                  {!loading && <ArrowRight size={19} />}
                </button>

              </form>

              <div className="mt-9 bg-[#F1F5F3] rounded-2xl p-4 flex gap-3">
                <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-[#176D68] shrink-0">
                  <ShieldCheck size={20} />
                </div>

                <div>
                  <p className="text-sm font-semibold text-[#354540]">
                    Secure administrator access
                  </p>

                  <p className="text-xs text-[#81918B] mt-1 leading-5">
                    This area is reserved for authorised departmental administrators.
                  </p>
                </div>
              </div>

              <p className="text-center text-xs text-[#A0ADA8] mt-9">
                OutliersSource Administration Portal
              </p>

            </div>
          </m.section>

        </div>
      </main>
    </LazyMotion>
  );
}
