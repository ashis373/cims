import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Mail,
  Settings,
  Activity,
  Plus,
  Search,
  MoreHorizontal,
  Edit2,
  Trash2,
  Eye,
  CheckCircle2,
  XCircle,
  Clock,
  Server,
  Lock,
  RefreshCcw,
  Send
} from "lucide-react";
import { cn } from "@/lib/utils";
import { API_BASE_URL } from "@/config/api";

export default function EmailManagement() {
  const [activeTab, setActiveTab] = useState<"templates" | "config" | "logs">("templates");
  const [searchQuery, setSearchQuery] = useState("");

  const [templates, setTemplates] = useState<any[]>([]);
  const [logs, setLogs] = useState<any[]>([]);
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

  const fetchData = async () => {
    setLoading(true);
    try {
      const [tRes, cRes, lRes] = await Promise.all([
        fetch(`${API_BASE_URL}/settings/email/templates.php`),
        fetch(`${API_BASE_URL}/settings/email/smtp.php`),
        fetch(`${API_BASE_URL}/settings/email/logs.php`)
      ]);
      setTemplates(await tRes.json());
      setSmtpConfig(await cRes.json());
      setLogs(await lRes.json());
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
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

  const toggleTemplate = async (id: number, currentStatus: number) => {
    const newStatus = currentStatus ? 0 : 1;
    try {
      const res = await fetch(`${API_BASE_URL}/settings/email/templates.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'toggle', id, is_active: newStatus })
      });
      const data = await res.json();
      if (data.success) {
        setTemplates(templates.map(t => t.id === id ? { ...t, is_active: newStatus } : t));
      }
    } catch (e) {
      console.error(e);
      alert("Failed to toggle template.");
    }
  };

  const toggleAllTemplates = async (status: number) => {
    try {
      const res = await fetch(`${API_BASE_URL}/settings/email/templates.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'toggle_all', is_active: status })
      });
      const data = await res.json();
      if (data.success) {
        setTemplates(templates.map(t => ({ ...t, is_active: status })));
      }
    } catch (e) {
      console.error(e);
      alert("Failed to toggle templates.");
    }
  };

  const renderTemplatesTab = () => (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input 
            placeholder="Search templates..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-10 w-full text-sm bg-white border-slate-200 shadow-sm rounded-xl"
          />
        </div>
        <div className="flex items-center gap-3">
          <Button 
            variant="outline"
            onClick={() => {
              const anyActive = templates.some(t => t.is_active);
              toggleAllTemplates(anyActive ? 0 : 1);
            }}
            className={cn(
              "h-10 text-sm font-semibold rounded-xl transition-colors",
              templates.some(t => t.is_active) 
                ? "text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300 hover:text-red-700" 
                : "text-emerald-600 border-emerald-200 hover:bg-emerald-50 hover:border-emerald-300 hover:text-emerald-700"
            )}
          >
            {templates.some(t => t.is_active) ? (
               <><XCircle className="mr-1.5 h-4 w-4" /> Disable All</>
            ) : (
               <><CheckCircle2 className="mr-1.5 h-4 w-4" /> Enable All</>
            )}
          </Button>
          <Button className="h-10 text-sm bg-blue-600 hover:bg-blue-700 text-white shadow-sm font-semibold rounded-xl">
            <Plus className="mr-1.5 h-4 w-4" /> Create Template
          </Button>
        </div>
      </div>

      <Card className="bg-white border-border/50 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-[12px]">
            <thead className="bg-slate-50/80 text-slate-500 font-semibold border-b border-slate-100">
              <tr>
                <th className="px-5 py-3 font-bold">Template Name</th>
                <th className="px-5 py-3 font-bold">Subject Line</th>
                <th className="px-5 py-3 font-bold">Category</th>
                <th className="px-5 py-3 font-bold">Status</th>
                <th className="px-5 py-3 font-bold">Last Updated</th>
                <th className="px-5 py-3 font-bold text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr><td colSpan={5} className="p-4 text-center text-slate-500">Loading templates...</td></tr>
              ) : templates.filter(t => t.name.toLowerCase().includes(searchQuery.toLowerCase())).map((template) => (
                <tr key={template.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
                        <Mail className="h-4 w-4" />
                      </div>
                      <span className="font-bold text-slate-900">{template.name}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-slate-600 truncate max-w-[250px]">{template.subject}</td>
                  <td className="px-5 py-3.5">
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600">
                      {template.type}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <button
                      onClick={() => toggleTemplate(template.id, template.is_active)}
                      className={cn("w-9 h-5 rounded-full relative transition-colors flex items-center px-0.5", template.is_active ? "bg-blue-600 justify-end" : "bg-slate-300 justify-start")}
                    >
                      <div className="w-4 h-4 rounded-full bg-white shadow-sm" />
                    </button>
                  </td>
                  <td className="px-5 py-3.5 text-slate-500">{template.updatedAt}</td>
                  <td className="px-5 py-3.5 text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-slate-400 hover:text-blue-600">
                        <Edit2 className="h-3.5 w-3.5" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-slate-400 hover:text-blue-600">
                        <Eye className="h-3.5 w-3.5" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-slate-400 hover:text-red-600">
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );

  const renderConfigTab = () => (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500 max-w-4xl">
      <Card className="bg-white border-border/50 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] rounded-2xl overflow-hidden p-6 md:p-8">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
            <Server className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900">SMTP Configuration</h3>
            <p className="text-sm text-slate-500">Connect your email server to send emails directly from the ATS.</p>
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
  );

  const renderLogsTab = () => (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input 
            placeholder="Search by recipient or subject..." 
            className="pl-9 h-10 w-full text-sm bg-white border-slate-200 shadow-sm rounded-xl"
          />
        </div>
        <Button onClick={fetchData} variant="outline" className="h-10 text-sm font-semibold bg-white border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl">
          <RefreshCcw className="mr-2 h-4 w-4" /> Refresh Logs
        </Button>
      </div>

      <Card className="bg-white border-border/50 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-[12px]">
            <thead className="bg-slate-50/80 text-slate-500 font-semibold border-b border-slate-100">
              <tr>
                <th className="px-5 py-3 font-bold">Recipient</th>
                <th className="px-5 py-3 font-bold">Subject</th>
                <th className="px-5 py-3 font-bold">Status</th>
                <th className="px-5 py-3 font-bold">Date & Time</th>
                <th className="px-5 py-3 font-bold text-center">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr><td colSpan={5} className="p-4 text-center text-slate-500">Loading logs...</td></tr>
              ) : logs.length === 0 ? (
                <tr><td colSpan={5} className="p-8 text-center text-slate-500">No email logs found.</td></tr>
              ) : logs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="px-5 py-3.5 font-semibold text-slate-800">{log.recipient}</td>
                  <td className="px-5 py-3.5 text-slate-600">{log.subject}</td>
                  <td className="px-5 py-3.5">
                    <span className={cn(
                      "px-2.5 py-1 rounded-full text-[10px] font-bold flex items-center w-fit gap-1.5",
                      log.status === "Delivered" ? "bg-emerald-50 text-emerald-600" :
                      log.status === "Opened" ? "bg-blue-50 text-blue-600" :
                      log.status === "Processing" ? "bg-amber-50 text-amber-600" :
                      "bg-red-50 text-red-600"
                    )}>
                      {log.status === "Delivered" && <CheckCircle2 className="h-3 w-3" />}
                      {log.status === "Opened" && <Eye className="h-3 w-3" />}
                      {log.status === "Processing" && <Clock className="h-3 w-3" />}
                      {log.status === "Bounced" && <XCircle className="h-3 w-3" />}
                      {log.status}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-slate-500">{log.date}</td>
                  <td className="px-5 py-3.5 text-center">
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-slate-400 hover:text-slate-700">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Email Management</h1>
          <p className="text-[13px] text-slate-500 mt-1">Configure your email gateway, manage templates, and monitor outgoing messages.</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200">
        <button
          onClick={() => setActiveTab("templates")}
          className={cn(
            "px-4 py-3 text-sm font-bold border-b-2 transition-colors flex items-center gap-2",
            activeTab === "templates" ? "border-blue-600 text-blue-600" : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
          )}
        >
          <Mail className="h-4 w-4" /> Templates
        </button>
        <button
          onClick={() => setActiveTab("config")}
          className={cn(
            "px-4 py-3 text-sm font-bold border-b-2 transition-colors flex items-center gap-2",
            activeTab === "config" ? "border-blue-600 text-blue-600" : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
          )}
        >
          <Settings className="h-4 w-4" /> SMTP Settings
        </button>
        <button
          onClick={() => setActiveTab("logs")}
          className={cn(
            "px-4 py-3 text-sm font-bold border-b-2 transition-colors flex items-center gap-2",
            activeTab === "logs" ? "border-blue-600 text-blue-600" : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
          )}
        >
          <Activity className="h-4 w-4" /> Delivery Logs
        </button>
      </div>

      {/* Content */}
      <div className="pt-2">
        {activeTab === "templates" && renderTemplatesTab()}
        {activeTab === "config" && renderConfigTab()}
        {activeTab === "logs" && renderLogsTab()}
      </div>
    </div>
  );
}
