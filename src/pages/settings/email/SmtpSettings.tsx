import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Server, Lock, Send } from "lucide-react";
import { API_BASE_URL } from "@/config/api";

export default function SmtpSettings() {
  const [smtpConfig, setSmtpConfig] = useState<any>({
    host: "",
    port: "",
    username: "",
    password: "",
    encryption: "tls",
    from_name: "",
    from_email: ""
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/settings/email/smtp.php`);
        setSmtpConfig(await res.json());
      } catch (e) {
        console.error(e);
      }
      setLoading(false);
    };
    fetchConfig();
  }, []);

  const saveConfig = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/settings/email/smtp.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(smtpConfig)
      });
      const data = await res.json();
      if (data.success) {
        alert("SMTP configuration saved!");
      } else {
        alert("Error saving configuration");
      }
    } catch (e) {
      console.error(e);
      alert("Error saving configuration");
    }
  };

  const testEmail = async () => {
    const email = prompt("Enter email address to send the test email to:");
    if (!email) return;
    
    try {
      const res = await fetch(`${API_BASE_URL}/settings/email/test.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const data = await res.json();
      alert(data.message);
    } catch (e) {
      console.error(e);
      alert("Failed to send test email.");
    }
  };

  if (loading) return <div className="p-4">Loading configuration...</div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">SMTP Settings</h1>
          <p className="text-[13px] text-slate-500 mt-1">Connect your email server to send emails directly from the ATS.</p>
        </div>
      </div>

      <div className="animate-in fade-in slide-in-from-bottom-2 duration-500 max-w-4xl">
        <Card className="bg-white border-border/50 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] rounded-2xl overflow-hidden p-6 md:p-8">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
              <Server className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">SMTP Configuration</h3>
              <p className="text-sm text-slate-500">Provide your outbound server details below.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[12px] font-bold text-slate-700">SMTP Host</label>
              <Input 
                placeholder="e.g. smtp.gmail.com" 
                value={smtpConfig.host || ""} 
                onChange={e => setSmtpConfig({...smtpConfig, host: e.target.value})}
                className="bg-slate-50 border-slate-200" 
              />
            </div>
            <div className="space-y-2">
              <label className="text-[12px] font-bold text-slate-700">SMTP Port</label>
              <Input 
                placeholder="e.g. 587 or 465" 
                value={smtpConfig.port || ""} 
                onChange={e => setSmtpConfig({...smtpConfig, port: e.target.value})}
                className="bg-slate-50 border-slate-200" 
              />
            </div>
            <div className="space-y-2">
              <label className="text-[12px] font-bold text-slate-700">Username</label>
              <Input 
                placeholder="SMTP Username" 
                value={smtpConfig.username || ""} 
                onChange={e => setSmtpConfig({...smtpConfig, username: e.target.value})}
                className="bg-slate-50 border-slate-200" 
              />
            </div>
            <div className="space-y-2">
              <label className="text-[12px] font-bold text-slate-700">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input 
                  type="password" 
                  placeholder="SMTP Password" 
                  value={smtpConfig.password || ""} 
                  onChange={e => setSmtpConfig({...smtpConfig, password: e.target.value})}
                  className="pl-9 bg-slate-50 border-slate-200" 
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[12px] font-bold text-slate-700">Encryption Method</label>
              <select 
                className="w-full h-10 px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={smtpConfig.encryption || "tls"}
                onChange={e => setSmtpConfig({...smtpConfig, encryption: e.target.value})}
              >
                <option value="tls">TLS (Recommended)</option>
                <option value="ssl">SSL</option>
                <option value="none">None</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-[12px] font-bold text-slate-700">Default "From" Name</label>
              <Input 
                placeholder="e.g. Acme Corp Careers" 
                value={smtpConfig.from_name || ""} 
                onChange={e => setSmtpConfig({...smtpConfig, from_name: e.target.value})}
                className="bg-slate-50 border-slate-200" 
              />
            </div>
            <div className="space-y-2">
              <label className="text-[12px] font-bold text-slate-700">Default "From" Email</label>
              <Input 
                placeholder="e.g. careers@company.com" 
                value={smtpConfig.from_email || ""} 
                onChange={e => setSmtpConfig({...smtpConfig, from_email: e.target.value})}
                className="bg-slate-50 border-slate-200" 
              />
            </div>
          </div>

          <div className="flex items-center justify-between mt-8 pt-6 border-t border-slate-100">
            <Button onClick={testEmail} variant="outline" className="h-10 text-sm font-semibold rounded-xl text-slate-700 border-slate-200 hover:bg-slate-50">
              <Send className="mr-2 h-4 w-4" /> Send Test Email
            </Button>
            <Button onClick={saveConfig} className="h-10 px-6 text-sm bg-blue-600 hover:bg-blue-700 text-white shadow-sm font-semibold rounded-xl">
              Save Configuration
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
