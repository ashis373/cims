import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Lock, Mail } from "lucide-react";
import { cn } from "@/lib/utils";


export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Please enter both email and password");
      return;
    }

    setIsLoading(true);
    try {
      // In a production app, the correct API_BASE_URL would be used
      const apiUrl = import.meta.env.PROD 
        ? "https://demo.hexalearn.com/cimss/api" 
        : "http://localhost/full-cims/api";
        
      const res = await fetch(`${apiUrl}/auth/login.php`, { credentials: 'include', 
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();

      if (data.status === "success") {
        // Store user, token and login time in localStorage
        localStorage.setItem("cims_user", JSON.stringify(data.data));
        if (data.token) {
          localStorage.setItem("cims_token", data.token);
        }
        localStorage.setItem("cims_login_time", Date.now().toString());
        toast.success("Login successful!");
        navigate("/");
      } else {
        toast.error(data.message || "Invalid email or password");
      }
    } catch (err) {
      toast.error("Network error. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  const testAccounts = [
    { role: "Super Admin", email: "ashiskrout1@gmail.com", pass: "Admin@123" },
    { role: "HR Manager", email: "hrmanager@hireflow.com", pass: "HRManager@123" },
    { role: "Recruiter", email: "recruiter@hireflow.com", pass: "Recruiter@123" },
    { role: "Hiring Manager", email: "hiringmanager@hireflow.com", pass: "HiringManager@123" },
  ];

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-slate-50 p-4 relative overflow-hidden">
      {/* Decorative Background */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-blue-500/10 blur-[120px]" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-500/10 blur-[120px]" />

      <div className="w-full max-w-md relative z-10 space-y-8">
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-2 mb-6">
            <img src="/logos.png" alt="Logo" className="h-10 w-auto object-contain shrink-0" />
            <span className="text-2xl font-black tracking-tight text-slate-900">Hireflow</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Welcome back</h1>
          <p className="text-sm text-slate-500">Enter your credentials to access your account</p>
        </div>

        <Card className="p-8 bg-white/80 backdrop-blur-xl border-white/50 shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-3xl">
          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-2">
              <label className="text-[12px] font-bold text-slate-700">Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-4 w-4 text-slate-400" />
                </div>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="pl-10 h-11 rounded-xl bg-slate-50/50 border-slate-200 focus:bg-white transition-colors"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-[12px] font-bold text-slate-700">Password</label>
                <a href="#" className="text-[11px] font-bold text-[#1447E6] hover:underline">Forgot password?</a>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-4 w-4 text-slate-400" />
                </div>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="pl-10 h-11 rounded-xl bg-slate-50/50 border-slate-200 focus:bg-white transition-colors"
                />
              </div>
            </div>

            <Button 
              type="submit" 
              disabled={isLoading}
              className="w-full h-11 rounded-xl font-bold bg-[#1447E6] hover:bg-[#0c31a6] text-white shadow-md shadow-[#1447E6]/20 transition-all mt-2"
            >
              {isLoading ? "Signing in..." : "Sign in"}
            </Button>
          </form>
        </Card>

        {/* Test Accounts Reference - Only visible in development mode */}
        {import.meta.env.DEV && (
          <div className="p-5 bg-slate-200/50 backdrop-blur-sm border border-slate-200 rounded-3xl mt-8">
            <h3 className="text-xs font-black text-slate-600 uppercase tracking-wider mb-3 text-center">Test Accounts</h3>
            <div className="grid grid-cols-1 gap-2">
              {testAccounts.map((acc, idx) => (
                <div key={idx} className="flex flex-col sm:flex-row sm:items-center justify-between p-2.5 bg-white rounded-xl shadow-sm border border-slate-100 cursor-pointer hover:border-[#1447E6]/30 transition-colors"
                     onClick={() => { setEmail(acc.email); setPassword(acc.pass); }}>
                  <div className="mb-1 sm:mb-0">
                    <div className="text-[10px] font-black uppercase text-[#1447E6] tracking-wider leading-none mb-1">{acc.role}</div>
                    <div className="text-xs font-medium text-slate-700 leading-none">{acc.email}</div>
                  </div>
                  <div className="text-xs font-mono font-medium text-slate-500 bg-slate-50 px-2 py-1 rounded-lg border border-slate-100">
                    {acc.pass}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
