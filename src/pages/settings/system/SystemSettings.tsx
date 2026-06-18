import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { 
  Building2, 
  Settings2, 
  AlertOctagon, 
  Database, 
  UploadCloud, 
  Plus, 
  Trash2, 
  Save, 
  RotateCcw,
  Download,
  ExternalLink,
  Pencil
} from "lucide-react";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost/cims_api";

export default function SystemSettings() {
  const [company, setCompany] = useState<any>({
    id: 1,
    name: "Hexalearn Solutions",
    website: "https://hexalearn.com",
    timezone: "UTC",
    dateFormat: "MM/DD/YYYY"
  });

  const [recruitment, setRecruitment] = useState<any>({
    id: 1,
    noticePeriod: 30,
    maxInterviews: 4,
    autoDuplicate: true,
    blacklistApproval: true,
    offerExpiry: 7
  });

  const [rejectionReasons, setRejectionReasons] = useState<any[]>([]);
  const [blacklistReasons, setBlacklistReasons] = useState<any[]>([]);

  const [dataSettings, setDataSettings] = useState({
    autoDelete: false,
    retentionDays: 365
  });

  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    // Fetch Company Settings
    fetch(`${API_BASE_URL}/system/settings.php?type=company`)
      .then(r => r.json())
      .then(res => {
        if (res.status === 'success' && res.data) {
          setCompany({
            id: res.data.id,
            name: res.data.company_name || "",
            website: res.data.website || "",
            timezone: res.data.timezone || "UTC",
            dateFormat: res.data.date_format || "MM/DD/YYYY"
          });
        }
      });

    // Fetch Recruitment Settings
    fetch(`${API_BASE_URL}/system/settings.php?type=recruitment`)
      .then(r => r.json())
      .then(res => {
        if (res.status === 'success' && res.data) {
          setRecruitment({
            id: res.data.id,
            noticePeriod: parseInt(res.data.notice_period) || 30,
            maxInterviews: parseInt(res.data.max_rounds) || 4,
            autoDuplicate: !!parseInt(res.data.auto_duplicate_check),
            blacklistApproval: !!parseInt(res.data.blacklist_approval),
            offerExpiry: parseInt(res.data.offer_expiry_days) || 7
          });
        }
      });

    // Fetch Rejection Reasons
    fetch(`${API_BASE_URL}/system/reasons.php?type=rejection`)
      .then(r => r.json())
      .then(res => {
        if (res.status === 'success') {
          setRejectionReasons(res.data);
        }
      });

    // Fetch Blacklist Reasons
    fetch(`${API_BASE_URL}/system/reasons.php?type=blacklist`)
      .then(r => r.json())
      .then(res => {
        if (res.status === 'success') {
          setBlacklistReasons(res.data);
        }
      });
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Save Company
      await fetch(`${API_BASE_URL}/system/settings.php?type=company`, { credentials: 'include', 
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: company.id,
          company_name: company.name,
          website: company.website,
          timezone: company.timezone,
          date_format: company.dateFormat
        })
      });

      // Save Recruitment
      await fetch(`${API_BASE_URL}/system/settings.php?type=recruitment`, { credentials: 'include', 
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: recruitment.id,
          notice_period: recruitment.noticePeriod,
          max_rounds: recruitment.maxInterviews,
          auto_duplicate_check: recruitment.autoDuplicate,
          blacklist_approval: recruitment.blacklistApproval,
          offer_expiry_days: recruitment.offerExpiry
        })
      });

      toast.success("Settings saved successfully");
    } catch (e) {
      toast.error("Failed to save settings");
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddReason = async (type: 'rejection' | 'blacklist') => {
    const text = prompt("Enter new reason:");
    if (!text) return;
    
    try {
      const res = await fetch(`${API_BASE_URL}/system/reasons.php?type=${type}`, { credentials: 'include', 
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason_text: text })
      }).then(r => r.json());

      if (res.status === 'success') {
        const newItem = { id: res.id, reason_text: text };
        if (type === 'rejection') setRejectionReasons([...rejectionReasons, newItem]);
        else setBlacklistReasons([...blacklistReasons, newItem]);
      }
    } catch (e) {
      toast.error("Failed to add reason");
    }
  };

  const handleDeleteReason = async (type: 'rejection' | 'blacklist', id: number) => {
    if (!confirm("Are you sure you want to delete this reason?")) return;

    try {
      await fetch(`${API_BASE_URL}/system/reasons.php?type=${type}&id=${id}`, { credentials: 'include', 
        method: 'DELETE'
      });
      if (type === 'rejection') {
        setRejectionReasons(rejectionReasons.filter(r => r.id !== id));
      } else {
        setBlacklistReasons(blacklistReasons.filter(r => r.id !== id));
      }
    } catch (e) {
      toast.error("Failed to delete reason");
    }
  };

  return (
    <div className="space-y-6 pb-10">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">System Settings</h1>
          <p className="text-[13px] text-slate-500 mt-1">
            Configure global application settings, recruitment parameters, and data retention policies.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="h-10 px-4 rounded-xl font-bold border-slate-200 text-slate-600 bg-white">
            <RotateCcw className="w-4 h-4 mr-2" /> Reset Defaults
          </Button>
          <Button disabled={isSaving} onClick={handleSave} className="h-10 px-4 rounded-xl font-bold bg-[#1447E6] hover:bg-[#0c31a6] text-white shadow-md shadow-[#1447E6]/20">
            <Save className="w-4 h-4 mr-2" /> {isSaving ? "Saving..." : "Save Settings"}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* Section 1: Company Settings */}
        <Card className="p-8 bg-white border-border/50 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] rounded-3xl">
          <h2 className="text-[14px] font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-4 mb-6">
            <Building2 className="h-4 w-4 text-indigo-500" /> Company Configuration
          </h2>
          <div className="space-y-5">
            <div className="flex items-center gap-4 mb-2">
              <div className="w-16 h-16 rounded-2xl bg-slate-50 border-2 border-dashed border-slate-300 flex items-center justify-center text-slate-400 hover:text-indigo-500 hover:border-indigo-300 hover:bg-indigo-50 cursor-pointer transition-colors">
                <UploadCloud className="w-6 h-6" />
              </div>
              <div>
                <div className="text-[12px] font-bold text-slate-900">Company Logo</div>
                <div className="text-[10px] text-slate-500 mt-0.5">Recommended 512x512px PNG</div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[12px] font-bold text-slate-700">Company Name</label>
              <Input value={company.name} onChange={e => setCompany({...company, name: e.target.value})} className="h-10 rounded-xl bg-slate-50 border-slate-200" />
            </div>
            <div className="space-y-2">
              <label className="text-[12px] font-bold text-slate-700">Website URL</label>
              <Input value={company.website} onChange={e => setCompany({...company, website: e.target.value})} className="h-10 rounded-xl bg-slate-50 border-slate-200" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[12px] font-bold text-slate-700">System Timezone</label>
                <Select value={company.timezone} onValueChange={v => setCompany({...company, timezone: v})}>
                  <SelectTrigger className="h-10 rounded-xl bg-slate-50 border-slate-200 text-xs font-semibold">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl text-xs">
                    <SelectItem value="UTC">UTC (GMT+0)</SelectItem>
                    <SelectItem value="EST">EST (GMT-5)</SelectItem>
                    <SelectItem value="PST">PST (GMT-8)</SelectItem>
                    <SelectItem value="IST">IST (GMT+5:30)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-[12px] font-bold text-slate-700">Date Format</label>
                <Select value={company.dateFormat} onValueChange={v => setCompany({...company, dateFormat: v})}>
                  <SelectTrigger className="h-10 rounded-xl bg-slate-50 border-slate-200 text-xs font-semibold">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl text-xs">
                    <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                    <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                    <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </Card>

        {/* Section 2: Recruitment Settings */}
        <Card className="p-8 bg-white border-border/50 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] rounded-3xl">
          <h2 className="text-[14px] font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-4 mb-6">
            <Settings2 className="h-4 w-4 text-emerald-500" /> Recruitment Logic
          </h2>
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[12px] font-bold text-slate-700">Default Notice Period (Days)</label>
                <Input type="number" value={recruitment.noticePeriod} onChange={e => setRecruitment({...recruitment, noticePeriod: Number(e.target.value)})} className="h-10 rounded-xl bg-slate-50 border-slate-200" />
              </div>
              <div className="space-y-2">
                <label className="text-[12px] font-bold text-slate-700">Max Interview Rounds</label>
                <Input type="number" value={recruitment.maxInterviews} onChange={e => setRecruitment({...recruitment, maxInterviews: Number(e.target.value)})} className="h-10 rounded-xl bg-slate-50 border-slate-200" />
              </div>
              <div className="space-y-2 col-span-2">
                <label className="text-[12px] font-bold text-slate-700">Offer Expiry (Days)</label>
                <Input type="number" value={recruitment.offerExpiry} onChange={e => setRecruitment({...recruitment, offerExpiry: Number(e.target.value)})} className="h-10 rounded-xl bg-slate-50 border-slate-200" />
              </div>
            </div>

            <div className="space-y-4 pt-2">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-[13px] font-bold text-slate-900">Auto Duplicate Check</div>
                  <div className="text-[11px] text-slate-500">Scan via email/phone upon candidate creation</div>
                </div>
                <Switch checked={recruitment.autoDuplicate} onCheckedChange={c => setRecruitment({...recruitment, autoDuplicate: c})} />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-[13px] font-bold text-slate-900">Blacklist Requires Approval</div>
                  <div className="text-[11px] text-slate-500">HR Manager must approve blacklist requests</div>
                </div>
                <Switch checked={recruitment.blacklistApproval} onCheckedChange={c => setRecruitment({...recruitment, blacklistApproval: c})} />
              </div>
            </div>
          </div>
        </Card>

        {/* Section 3: Rejection & Blacklist Reasons */}
        <Card className="lg:col-span-2 p-8 bg-white border-border/50 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] rounded-3xl">
          <h2 className="text-[14px] font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-4 mb-6">
            <AlertOctagon className="h-4 w-4 text-rose-500" /> Predefined Reasons
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-[12px] font-bold text-slate-700">Rejection Reasons</h3>
                <Button onClick={() => handleAddReason('rejection')} variant="ghost" size="sm" className="h-7 px-2 text-[10px] font-bold text-[#1447E6] hover:bg-blue-50">
                  <Plus className="w-3.5 h-3.5 mr-1" /> Add Reason
                </Button>
              </div>
              <div className="space-y-2 bg-slate-50 p-4 rounded-2xl border border-slate-100 h-[200px] overflow-y-auto">
                {rejectionReasons.map((r) => (
                  <div key={r.id} className="flex items-center justify-between bg-white p-2.5 rounded-xl border border-slate-100 shadow-sm group">
                    <span className="text-[11px] font-medium text-slate-700">{r.reason_text}</span>
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                      <button onClick={() => handleDeleteReason('rejection', r.id)} className="text-slate-400 hover:text-rose-600 p-1"><Trash2 className="w-3 h-3" /></button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-[12px] font-bold text-slate-700">Blacklist Reasons</h3>
                <Button onClick={() => handleAddReason('blacklist')} variant="ghost" size="sm" className="h-7 px-2 text-[10px] font-bold text-[#1447E6] hover:bg-blue-50">
                  <Plus className="w-3.5 h-3.5 mr-1" /> Add Reason
                </Button>
              </div>
              <div className="space-y-2 bg-slate-50 p-4 rounded-2xl border border-slate-100 h-[200px] overflow-y-auto">
                {blacklistReasons.map((r) => (
                  <div key={r.id} className="flex items-center justify-between bg-white p-2.5 rounded-xl border border-slate-100 shadow-sm group">
                    <span className="text-[11px] font-medium text-slate-700">{r.reason_text}</span>
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                      <button onClick={() => handleDeleteReason('blacklist', r.id)} className="text-slate-400 hover:text-rose-600 p-1"><Trash2 className="w-3 h-3" /></button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Card>

        {/* Section 4: Data & Storage */}
        <Card className="lg:col-span-2 p-8 bg-white border-border/50 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] rounded-3xl">
          <h2 className="text-[14px] font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-4 mb-6">
            <Database className="h-4 w-4 text-purple-500" /> Data & Storage Policies
          </h2>
          <div className="flex flex-col md:flex-row gap-8 items-start">
            <div className="flex-1 space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-[13px] font-bold text-slate-900">Auto-Delete Old Data</div>
                  <div className="text-[11px] text-slate-500">Automatically remove rejected candidates after retention period</div>
                </div>
                <Switch checked={dataSettings.autoDelete} onCheckedChange={c => setDataSettings({...dataSettings, autoDelete: c})} />
              </div>
              <div className={cn("space-y-2 transition-opacity duration-300", dataSettings.autoDelete ? "opacity-100" : "opacity-50 pointer-events-none")}>
                <label className="text-[12px] font-bold text-slate-700">Data Retention Period (Days)</label>
                <Input type="number" value={dataSettings.retentionDays} onChange={e => setDataSettings({...dataSettings, retentionDays: Number(e.target.value)})} className="h-10 rounded-xl bg-slate-50 border-slate-200 max-w-[200px]" />
              </div>
            </div>
            
            <div className="flex-1 w-full bg-slate-50 rounded-2xl p-6 border border-slate-100 flex flex-col gap-4">
              <div>
                <h4 className="text-[12px] font-bold text-slate-900 mb-1">Data Management</h4>
                <p className="text-[11px] text-slate-500 mb-4">Export all ATS data as CSV or view the comprehensive security audit log.</p>
                <div className="flex flex-wrap gap-3">
                  <Button variant="outline" className="h-9 text-[11px] font-bold border-slate-200 text-slate-700 bg-white">
                    <Download className="w-3.5 h-3.5 mr-2 text-indigo-500" /> Export All Data
                  </Button>
                  <Button variant="outline" className="h-9 text-[11px] font-bold border-slate-200 text-slate-700 bg-white">
                    <ExternalLink className="w-3.5 h-3.5 mr-2 text-slate-400" /> System Audit Log
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </Card>

      </div>
    </div>
  );
}
