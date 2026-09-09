import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { 
  Lock, 
  Mail, 
  Eye, 
  EyeOff, 
  Sparkles, 
  ShieldCheck, 
  Users, 
  ArrowRight, 
  Zap,
  CheckCircle2
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (!email || !password) {
      const msg = "Please enter both email and password";
      setErrorMessage(msg);
      toast.error(msg);
      return;
    }

    setIsLoading(true);
    try {
      const apiUrl = import.meta.env.VITE_API_BASE_URL;
        
      const res = await fetch(`${apiUrl}/auth/login.php`, { 
        credentials: 'include', 
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();

      if (data.status === "success") {
        localStorage.setItem("cims_user", JSON.stringify(data.data));
        if (data.token) {
          localStorage.setItem("cims_token", data.token);
        }
        localStorage.setItem("cims_login_time", Date.now().toString());
        toast.success("Welcome back! Login successful.");
        navigate("/");
      } else {
        const errorMsg = data.message || "Invalid email or password";
        setErrorMessage(errorMsg);
        toast.error(errorMsg);
      }
    } catch (err) {
      const msg = "Network error. Please check your connection and try again.";
      setErrorMessage(msg);
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const testAccounts = [
    { role: "Administrator", email: "admin@gmail.com", pass: "Admin@123", badge: "Super Admin" },
    { role: "HR Manager", email: "hrmanager@hireflow.com", pass: "HRManager@123", badge: "HR Management" },
    { role: "Recruiter", email: "recruiter@hireflow.com", pass: "Recruiter@123", badge: "Talent Acquisition" },
    { role: "Hiring Manager", email: "hiringmanager@hireflow.com", pass: "HiringManager@123", badge: "Interviewer" },
  ];

  return (
    <div className="min-h-screen w-full flex bg-[#011627] text-slate-100 selection:bg-[#42bc24] selection:text-white relative overflow-hidden">
      {/* Brand Theme Glows (Navy + Emerald Green) */}
      <div className="absolute top-[-10%] left-[-10%] w-[45vw] h-[45vw] rounded-full bg-[#42bc24]/10 blur-[150px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-5%] w-[40vw] h-[40vw] rounded-full bg-[#36961c]/10 blur-[150px] pointer-events-none" />
      <div className="absolute top-[35%] right-[25%] w-[30vw] h-[30vw] rounded-full bg-cyan-500/5 blur-[130px] pointer-events-none" />

      {/* Main Container */}
      <div className="w-full grid lg:grid-cols-12 min-h-screen z-10">
        
        {/* Left Section: Branding & Highlights (Styled in Hireflow #011627 + #42bc24 Theme) */}
        <div className="hidden lg:flex lg:col-span-7 xl:col-span-7 flex-col justify-between p-12 xl:p-16 relative border-r border-slate-800/60 bg-gradient-to-br from-[#011627] via-[#011d33]/80 to-[#022b42]/40 backdrop-blur-2xl">
          {/* Top Logo */}
          <div className="flex items-center gap-4">
            <img src="/logos.png" alt="Hireflow Logo" className="h-14 w-auto object-contain shrink-0" />
            <div className="text-left">
              <div className="text-[24px] font-black leading-none tracking-tight text-white">
                Hireflow
              </div>
              <div className="mt-1.5 text-[11px] font-black uppercase tracking-[0.2em] text-[#60C042]">
                Buddy ATS
              </div>
            </div>
          </div>

          {/* Central Hero Visual Showcase */}
          <div className="space-y-8 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#42bc24]/10 border border-[#42bc24]/30 text-xs font-semibold text-[#60C042]">
              <Sparkles className="w-3.5 h-3.5 text-[#42bc24] animate-pulse" />
              Candidate Intelligence & Recruitment Management System
            </div>

            <div className="space-y-4">
              <h1 className="text-4xl xl:text-5xl font-extrabold tracking-tight text-white leading-[1.15]">
                Accelerate recruitment with smart pipelines.
              </h1>
              <p className="text-base text-slate-300/90 leading-relaxed">
                Seamless candidate tracking, AI-assisted screening, automated interview scheduling, and instant offer workflows.
              </p>
            </div>

            {/* Feature Badges in #011627 & #42bc24 Palette */}
            <div className="grid grid-cols-2 gap-4 pt-2">
              <div className="flex items-start gap-3 p-4 rounded-2xl bg-[#011627]/80 border border-slate-800 backdrop-blur-md shadow-sm">
                <div className="h-9 w-9 rounded-xl bg-[#42bc24]/10 border border-[#42bc24]/25 flex items-center justify-center text-[#42bc24] shrink-0">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">Enterprise Security</h4>
                  <p className="text-xs text-slate-400 mt-0.5">Role-based controls & verified session protection.</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 rounded-2xl bg-[#011627]/80 border border-slate-800 backdrop-blur-md shadow-sm">
                <div className="h-9 w-9 rounded-xl bg-[#42bc24]/10 border border-[#42bc24]/25 flex items-center justify-center text-[#42bc24] shrink-0">
                  <Zap className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">Smart Automation</h4>
                  <p className="text-xs text-slate-400 mt-0.5">Automated screening, duplicate check & stage triggers.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Metrics */}
          <div className="flex items-center justify-between pt-6 border-t border-slate-800/60 text-xs text-slate-400">
            <span>© {new Date().getFullYear()} Hireflow ATS. All rights reserved.</span>
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1.5 text-[#60C042] font-semibold">
                <span className="h-2 w-2 rounded-full bg-[#42bc24] animate-ping inline-block" />
                System Active
              </span>
            </div>
          </div>
        </div>

        {/* Right Section: Login Form */}
        <div className="lg:col-span-5 xl:col-span-5 flex flex-col justify-center items-center p-6 sm:p-10 lg:p-12 bg-[#011627]/90">
          <div className="w-full max-w-md space-y-6">
            
            {/* Mobile Header */}
            <div className="lg:hidden text-center space-y-3 mb-4">
              <div className="inline-flex items-center justify-center h-16 w-auto p-2">
                <img src="/logos.png" alt="Logo" className="h-12 w-auto object-contain" />
              </div>
              <div>
                <h2 className="text-2xl font-black tracking-tight text-white">Hireflow</h2>
                <div className="text-[10px] font-black uppercase tracking-[0.2em] text-[#60C042]">Buddy ATS</div>
              </div>
            </div>

            <div className="space-y-1.5 text-center lg:text-left">
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">Welcome back</h2>
              <p className="text-sm text-slate-400">
                Sign in with your organizational credentials to continue.
              </p>
            </div>

            {/* Login Card */}
            <Card className="p-7 sm:p-8 bg-[#011627]/95 backdrop-blur-2xl border-slate-800 shadow-[0_20px_50px_rgba(0,0,0,0.6)] rounded-3xl">
              <form onSubmit={handleLogin} className="space-y-5">
                
                {/* Error Banner */}
                {errorMessage && (
                  <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs font-medium flex items-start gap-3 animate-in fade-in duration-200">
                    <span className="text-rose-400 font-bold shrink-0 text-sm">⚠️</span>
                    <span className="leading-relaxed">{errorMessage}</span>
                  </div>
                )}

                {/* Email Field */}
                <div className="space-y-2">
                  <label className="text-[13px] font-semibold text-slate-300">Email Address</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                      <Mail className="h-4 w-4 text-slate-500" />
                    </div>
                    <Input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@company.com"
                      required
                      className="pl-10 h-11 rounded-xl bg-slate-900/80 border-slate-800 text-white placeholder:text-slate-500 focus:border-[#42bc24] focus:ring-1 focus:ring-[#42bc24] transition-all text-sm"
                    />
                  </div>
                </div>
                
                {/* Password Field */}
                <div className="space-y-2">
                  <label className="text-[13px] font-semibold text-slate-300">Password</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                      <Lock className="h-4 w-4 text-slate-500" />
                    </div>
                    <Input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      className="pl-10 pr-10 h-11 rounded-xl bg-slate-900/80 border-slate-800 text-white placeholder:text-slate-500 focus:border-[#42bc24] focus:ring-1 focus:ring-[#42bc24] transition-all text-sm"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-500 hover:text-slate-300 transition-colors focus:outline-none"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {/* Submit Button in Custom Brand Green Gradient */}
                <Button 
                  type="submit" 
                  disabled={isLoading}
                  className="w-full h-11 rounded-xl font-bold bg-gradient-to-r from-[#42bc24] to-[#36961c] hover:from-[#4ecf2e] hover:to-[#42bc24] text-white shadow-lg shadow-[#42bc24]/20 border border-white/20 transition-all transform active:scale-[0.99] mt-2 flex items-center justify-center gap-2 group cursor-pointer"
                >
                  {isLoading ? (
                    <span className="flex items-center gap-2">
                      <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Authenticating...
                    </span>
                  ) : (
                    <>
                      <span>Sign in to Dashboard</span>
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </>
                  )}
                </Button>
              </form>
            </Card>

            {/* Quick Demo Credentials (Development Helper in Brand Colors) */}
            {import.meta.env.DEV && (
              <div className="p-5 bg-slate-900/50 backdrop-blur-sm border border-slate-800/80 rounded-3xl space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-[#60C042]" />
                    Quick Fill Test Accounts
                  </h3>
                  <span className="text-[10px] text-slate-500 font-medium">Click to fill</span>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {testAccounts.map((acc, idx) => (
                    <div 
                      key={idx} 
                      onClick={() => { setEmail(acc.email); setPassword(acc.pass); }}
                      className="p-2.5 rounded-xl bg-[#011627]/90 border border-slate-800 hover:border-[#42bc24]/50 hover:bg-slate-900 transition-all cursor-pointer group flex flex-col justify-between gap-1"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-slate-200 group-hover:text-[#60C042] transition-colors">
                          {acc.role}
                        </span>
                        <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                          {acc.pass}
                        </span>
                      </div>
                      <div className="text-[11px] font-medium text-slate-400 truncate">
                        {acc.email}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        </div>

      </div>
    </div>
  );
}
