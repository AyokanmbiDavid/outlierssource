
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../services/supabase.js";
import { useNotifications } from "../context/NotificationContext";
import {
  GraduationCap, UserRound, LockKeyhole, Eye, EyeOff,
  ArrowRight, BookOpen, ShieldCheck
} from "lucide-react";

export default function LoginSignIn() {
  const navigate = useNavigate();
  const { notify } = useNotifications();

  const [mode, setMode] = useState("login");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("error");

  const [form, setForm] = useState({
    matric_number: "",
    surname: "",
    full_name: "",
    password: ""
  });

  const handleChange = e => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const switchMode = nextMode => {
    setMode(nextMode);
    setMessage("");
    setShowPassword(false);
  };

  const showToast = (title, message, type = "info") => {
    notify(message, type, { title });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setMessage("");

    if (!form.matric_number.trim() || !form.surname.trim() || !form.password || (mode === "register" && !form.full_name.trim())) {
      const text = "Please complete all required fields.";
      setMessageType("error");
      setMessage(text);
      showToast("Incomplete information", text, "warning");
      return;
    }

    if (form.password.length < 8) {
      const text = "Your password must contain at least 8 characters.";
      setMessageType("error");
      setMessage(text);
      showToast("Invalid password", text, "warning");
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke("swift-processor", {
        body: {
          action: mode,
          matric_number: form.matric_number.trim(),
          surname: form.surname.trim(),
          password: form.password,
          ...(mode === "register" && { full_name: form.full_name.trim() })
        }
      });

      if (error || !data?.success) {
        let errorMessage = data?.error || error?.message;

        if (error?.context?.json) {
          try {
            const response = await error.context.json();
            errorMessage = response.error || errorMessage;
          } catch {}
        }

        throw new Error(errorMessage || "Authentication failed.");
      }

      if (mode === "register") {
        const text = data.message || "Registration successful. Check your email to verify your account.";

        showToast("Registration successful", text, "success");
        setMessageType("success");
        setMessage(text);

        setForm(prev => ({ ...prev, password: "", full_name: "" }));
        setMode("login");
        setShowPassword(false);
        return;
      }

      if (!data.session?.access_token || !data.session?.refresh_token) {
        throw new Error("No authentication session was returned.");
      }

      const { error: sessionError } = await supabase.auth.setSession({
        access_token: data.session.access_token,
        refresh_token: data.session.refresh_token
      });

      if (sessionError) throw sessionError;

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", data.user?.id)
        .single();

      if (profileError || !profile) {
        await supabase.auth.signOut();
        throw new Error("Unable to verify your account. Please try again.");
      }

      showToast("Login successful", "Welcome back! You have successfully signed in to OutliersSource.", "success");

      navigate("/home", { replace: true });

    } catch (error) {
      const text = error.message || "Something went wrong. Please try again.";
      setMessageType("error");
      setMessage(text);
      showToast(mode === "login" ? "Login failed" : "Registration failed", text, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#F5F8F6] flex items-center justify-center p-4 sm:p-8">
      <div className="w-full max-w-6xl grid lg:grid-cols-2 bg-white rounded-[30px] overflow-hidden shadow-[0_12px_60px_rgba(24,75,65,0.07)]">

        <section className="hidden lg:flex flex-col justify-between bg-[#E7F3EF] p-12 relative overflow-hidden">
          <div className="absolute -right-24 -bottom-24 w-80 h-80 rounded-full bg-[#C9E5DB] opacity-60" />

          <div className="relative z-10 flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#176D68] flex items-center justify-center text-white">
              <GraduationCap size={25} />
            </div>
            <div>
              <h1 className="font-bold text-xl text-[#203B35]">OutliersSource</h1>
              <p className="text-xs text-[#648079]">Departmental Portal</p>
            </div>
          </div>

          <div className="relative z-10 max-w-md">
            <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-[#176D68] mb-7 shadow-sm">
              <BookOpen size={27} />
            </div>
            <h2 className="text-4xl font-bold leading-tight text-[#203B35]">Your academic journey starts here.</h2>
            <p className="mt-5 text-[#648079] leading-7">Access your courses, lecture materials, departmental updates and academic resources from one place.</p>
            <div className="mt-9 flex items-center gap-3 text-sm text-[#47736A]">
              <ShieldCheck size={19} />
              <span>One portal. Your academic world.</span>
            </div>
          </div>

          <p className="relative z-10 text-xs text-[#78938B]">© {new Date().getFullYear()} OutliersSource</p>
        </section>

        <section className="p-6 sm:p-10 lg:p-14 flex flex-col justify-center">
          <div className="flex lg:hidden items-center gap-3 mb-10">
            <div className="w-11 h-11 rounded-xl bg-[#176D68] text-white flex items-center justify-center">
              <GraduationCap size={23} />
            </div>
            <div>
              <h1 className="font-bold text-lg text-[#203B35]">OutliersSource</h1>
              <p className="text-xs text-[#81918B]">Departmental Portal</p>
            </div>
          </div>

          <div className="max-w-md w-full mx-auto">
            <div className="mb-9">
              <span className="text-xs font-semibold tracking-widest text-[#176D68] uppercase">Student portal</span>
              <h2 className="text-3xl sm:text-4xl font-bold text-[#20302D] mt-3">{mode === "login" ? "Welcome back" : "Create account"}</h2>
              <p className="text-sm text-[#81918B] mt-3">{mode === "login" ? "Sign in to continue your academic journey." : "Register with your approved student details."}</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {mode === "register" && (
                <div>
                  <label className="block text-sm font-semibold text-[#354540] mb-2">Full name</label>
                  <div className="flex items-center bg-[#F1F5F3] rounded-2xl px-4 focus-within:ring-2 focus-within:ring-[#A5D2C4]">
                    <UserRound size={19} className="text-[#78918A]" />
                    <input name="full_name" value={form.full_name} onChange={handleChange} placeholder="Enter your full name" autoComplete="name" className="w-full bg-transparent outline-none py-4 px-3 text-sm" />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-semibold text-[#354540] mb-2">Matric number</label>
                <div className="flex items-center bg-[#F1F5F3] rounded-2xl px-4 focus-within:ring-2 focus-within:ring-[#A5D2C4]">
                  <UserRound size={19} className="text-[#78918A]" />
                  <input name="matric_number" value={form.matric_number} onChange={handleChange} placeholder="Enter matric number" autoComplete="username" className="w-full bg-transparent outline-none py-4 px-3 text-sm" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#354540] mb-2">Surname</label>
                <div className="flex items-center bg-[#F1F5F3] rounded-2xl px-4 focus-within:ring-2 focus-within:ring-[#A5D2C4]">
                  <UserRound size={19} className="text-[#78918A]" />
                  <input name="surname" value={form.surname} onChange={handleChange} placeholder="Enter your surname" autoComplete="family-name" className="w-full bg-transparent outline-none py-4 px-3 text-sm" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#354540] mb-2">Password</label>
                <div className="flex items-center bg-[#F1F5F3] rounded-2xl px-4 focus-within:ring-2 focus-within:ring-[#A5D2C4]">
                  <LockKeyhole size={19} className="text-[#78918A]" />
                  <input type={showPassword ? "text" : "password"} name="password" value={form.password} onChange={handleChange} placeholder="Enter your password" autoComplete={mode === "login" ? "current-password" : "new-password"} className="w-full bg-transparent outline-none py-4 px-3 text-sm" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="text-[#78918A] p-1" aria-label="Toggle password visibility">
                    {showPassword ? <EyeOff size={19} /> : <Eye size={19} />}
                  </button>
                </div>
              </div>

              {mode === "login" && (
                <div className="flex items-center justify-between gap-3 text-sm">
                  <label className="flex items-center gap-2 text-[#71827C] cursor-pointer">
                    <input type="checkbox" checked={remember} onChange={e => setRemember(e.target.checked)} className="accent-[#176D68] w-4 h-4" />
                    Remember me
                  </label>
                  <button type="button" onClick={() => {
                    const text = "Contact your portal administrator to reset your password.";
                    setMessageType("error");
                    setMessage(text);
                    showToast("Password assistance", text, "info");
                  }} className="font-semibold text-[#176D68]">Forgot password?</button>
                </div>
              )}

              {message && (
                <p role="status" className={`text-sm rounded-xl p-3 ${messageType === "success" ? "text-[#176D68] bg-[#E7F3EF]" : "text-[#B45B46] bg-[#FFF2ED]"}`}>
                  {message}
                </p>
              )}

              <button type="submit" disabled={loading} className="w-full bg-[#176D68] hover:bg-[#105A55] disabled:opacity-60 text-white rounded-full py-4 font-semibold flex items-center justify-center gap-3 transition active:scale-[0.98]">
                {loading ? mode === "login" ? "Signing in..." : "Creating account..." : mode === "login" ? "Sign in to portal" : "Create account"}
                {!loading && <ArrowRight size={19} />}
              </button>
            </form>

            <div className="text-center mt-8">
              <p className="text-sm text-[#81918B]">
                {mode === "login" ? "Don't have an account? " : "Already have an account? "}
                <button type="button" onClick={() => switchMode(mode === "login" ? "register" : "login")} className="font-bold text-[#176D68]">
                  {mode === "login" ? "Register here" : "Sign in"}
                </button>
              </p>
            </div>

            <button type="button" onClick={() => navigate("/admin/login")} className="w-full mt-9 bg-[#F1F5F3] hover:bg-[#E7EFEB] rounded-2xl p-4 flex items-center justify-between transition">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-[#176D68]"><ShieldCheck size={20} /></div>
                <div className="text-left">
                  <p className="font-semibold text-sm text-[#354540]">Administrator?</p>
                  <p className="text-xs text-[#81918B]">Access admin portal</p>
                </div>
              </div>
              <ArrowRight size={18} className="text-[#176D68]" />
            </button>

            <p className="text-center text-xs text-[#A0ADA8] mt-9">Need assistance? Contact your department.</p>
          </div>
        </section>
      </div>
    </main>
  );
}
