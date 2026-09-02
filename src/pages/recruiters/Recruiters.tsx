import { useState, useEffect } from "react";
import { API_BASE_URL } from "@/config/api";
import { 
  Search, Plus, MoreHorizontal, Edit, UserCheck, UserX, Trash2, Shield
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter 
} from "@/components/ui/dialog";
import { 
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { 
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue 
} from "@/components/ui/select";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { getAuthHeaders } from "@/services/candidate-api";

interface Recruiter {
  id: string;
  name: string;
  email: string;
  mobile: string;
  status: "Active" | "Inactive";
  department?: string;
  designation?: string;
  employee_id?: string;
  photo?: string;
  notes?: string;
}

export default function Recruiters() {
  const [recruiters, setRecruiters] = useState<Recruiter[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchRecruiters = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/recruiters/recruiters.php`, { credentials: 'include', headers: getAuthHeaders(false) });
      const data = await res.json();
      if (res.ok && Array.isArray(data)) {
        setRecruiters(data);
      } else if (!res.ok && data.message) {
        toast.error(data.message);
      }
    } catch (e) {
      toast.error("Failed to fetch recruiters");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchDepartments = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/jobs/departments.php`, { credentials: 'include', headers: getAuthHeaders(false) });
      const data = await res.json();
      if (Array.isArray(data)) setDepartments(data.filter((d: any) => d.status !== 'Inactive'));
    } catch (e) {
      console.error("Failed to fetch departments", e);
    }
  };

  useEffect(() => {
    fetchRecruiters();
    fetchDepartments();
  }, []);

  const [q, setQ] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const [showAdd, setShowAdd] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({ 
    name: "", email: "", mobile: "", status: "Active" as "Active"|"Inactive",
    department: "", designation: "", employee_id: "", photo: "", notes: ""
  });

  const filtered = recruiters.filter(r => {
    if (statusFilter !== "All" && r.status !== statusFilter) return false;
    if (q) {
      const search = q.toLowerCase();
      if (!r.name.toLowerCase().includes(search) && !r.email.toLowerCase().includes(search)) {
        return false;
      }
    }
    return true;
  });

  const handleOpenAdd = () => {
    setEditingId(null);
    setFormData({ name: "", email: "", mobile: "", status: "Active", department: "", designation: "", employee_id: "", photo: "", notes: "" });
    setShowAdd(true);
  };

  const handleOpenEdit = (r: Recruiter) => {
    setEditingId(r.id);
    setFormData({ 
      name: r.name, email: r.email, mobile: r.mobile || "", status: r.status,
      department: r.department || "", designation: r.designation || "",
      employee_id: r.employee_id || "", photo: r.photo || "", notes: r.notes || ""
    });
    setShowAdd(true);
  };

  const handleSave = async () => {
    if (!formData.name || !formData.email) {
      toast.error("Name and Email are required");
      return;
    }
    if (!/^[A-Za-z\s]+$/.test(formData.name)) {
      toast.error("Name can only contain letters and spaces");
      return;
    }
    if (formData.name.length > 30) {
      toast.error("Name cannot exceed 30 characters");
      return;
    }
    if (formData.mobile && !/^\d{10}$/.test(formData.mobile)) {
      toast.error("Mobile number must be exactly 10 digits");
      return;
    }
    
    try {
      const url = editingId ? `${API_BASE_URL}/recruiters/recruiters.php?id=${editingId}` : `${API_BASE_URL}/recruiters/recruiters.php`;
      const method = editingId ? "PUT" : "POST";
      
      const res = await fetch(url, {
        method,
        headers: getAuthHeaders(true),
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      
      if (res.ok && (data.success || !data.error) && !data.message) {
        toast.success(editingId ? "Recruiter updated" : "Recruiter added successfully");
        fetchRecruiters();
        setShowAdd(false);
      } else {
        toast.error(data.message || data.error || "Failed to save recruiter");
      }
    } catch (e) {
      toast.error("An error occurred");
    }
  };

  const toggleStatus = async (r: Recruiter) => {
    try {
      const newStatus = r.status === "Active" ? "Inactive" : "Active";
      const res = await fetch(`${API_BASE_URL}/recruiters/recruiters.php?id=${r.id}`, {
        method: "PUT",
        headers: getAuthHeaders(true),
        body: JSON.stringify({ status: newStatus })
      });
      const data = await res.json();
      if (res.ok && !data.error && !data.message) {
        toast.success("Status updated");
        fetchRecruiters();
      } else {
        toast.error(data.message || data.error || "Failed to update status");
      }
    } catch (e) {
      toast.error("Failed to update status");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`${API_BASE_URL}/recruiters/recruiters.php?id=${id}`, {
        method: "DELETE",
        headers: getAuthHeaders(false)
      });
      const data = await res.json();
      if (res.ok && !data.error && !data.message) {
        toast.success("Recruiter deleted");
        fetchRecruiters();
      } else {
        toast.error(data.message || data.error || "Failed to delete recruiter");
      }
    } catch (e) {
      toast.error("Failed to delete recruiter");
    }
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  return (
    <div className="flex flex-col gap-6 w-full pb-10">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 relative overflow-hidden rounded-[28px] bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 shadow-lg border border-indigo-900/50 p-8 sm:p-10 text-white">

        <div className="relative z-10 flex items-center gap-6">
          <div className="flex h-[72px] w-[72px] items-center justify-center rounded-[20px] bg-white/10 border border-white/20 shadow-[0_0_20px_rgba(255,255,255,0.1)] backdrop-blur-md">
            <Shield className="h-8 w-8 text-indigo-100" />
          </div>
          <div>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight mb-2">Recruiters</h1>
            <p className="text-indigo-100/80 text-[14px] sm:text-[15px] font-medium max-w-lg leading-relaxed">
              Manage your recruiting team, control access, and monitor status.
            </p>
          </div>
        </div>
        <div className="relative z-10">
          <Button onClick={handleOpenAdd} className="h-12 px-6 rounded-2xl bg-white text-indigo-900 hover:bg-slate-50 font-bold shadow-[0_0_20px_rgba(255,255,255,0.2)] hover:shadow-[0_0_30px_rgba(255,255,255,0.4)] transition-all">
            <Plus className="mr-2 h-5 w-5" /> Add Recruiter
          </Button>
        </div>
      </div>

      <Card className="bg-white border-border/50 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] rounded-3xl overflow-hidden flex flex-col p-6">
        <div className="flex flex-col sm:flex-row items-center gap-4 mb-6">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input 
              placeholder="Search by name or email..." 
              value={q} 
              onChange={e => setQ(e.target.value)} 
              className="pl-10 h-11 rounded-xl bg-slate-50 border-slate-200 focus-visible:ring-indigo-500 font-medium"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[140px] h-11 rounded-xl bg-slate-50 border-slate-200 font-medium">
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="All">All Status</SelectItem>
              <SelectItem value="Active">Active</SelectItem>
              <SelectItem value="Inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-[13px]">
            <thead className="bg-slate-50/80 text-slate-500 font-semibold border-b border-slate-100">
              <tr>
                <th className="px-4 py-3 font-bold rounded-tl-xl">Recruiter Name</th>
                <th className="px-4 py-3 font-bold">Email Address</th>
                <th className="px-4 py-3 font-bold">Mobile</th>
                <th className="px-4 py-3 font-bold">Department</th>
                <th className="px-4 py-3 font-bold text-center">Assigned Jobs</th>
                <th className="px-4 py-3 font-bold text-center">Candidates</th>
                <th className="px-4 py-3 font-bold">Status</th>
                <th className="px-4 py-3 font-bold text-center rounded-tr-xl">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map(r => (
                <tr key={r.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-indigo-600 font-bold text-[11px]">
                        {getInitials(r.name)}
                      </div>
                      <div className="font-bold text-slate-900">{r.name}</div>
                    </div>
                  </td>
                  <td className="px-4 py-3 font-medium text-slate-600">{r.email}</td>
                  <td className="px-4 py-3 font-medium text-slate-600">{r.mobile || "—"}</td>
                  <td className="px-4 py-3 font-medium text-slate-600">{r.department || "—"}</td>
                  <td className="px-4 py-3 font-bold text-slate-900 text-center">
                    {(r as any).assigned_jobs !== undefined ? (r as any).assigned_jobs : 0}
                  </td>
                  <td className="px-4 py-3 font-bold text-slate-900 text-center">
                    {(r as any).candidates !== undefined ? (r as any).candidates : 0}
                  </td>
                  <td className="px-4 py-3">
                    <span className={cn(
                      "inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 font-bold text-[11px]",
                      r.status === "Active" ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-600"
                    )}>
                      <div className="h-1.5 w-1.5 rounded-full bg-current opacity-75" />
                      {r.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 text-[12px] font-bold text-slate-500 hover:text-indigo-600">
                          View &middot; Edit &middot; More
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="rounded-xl border-border/40 w-48">
                        <DropdownMenuItem onClick={() => handleOpenEdit(r)} className="cursor-pointer">
                          <Edit className="h-4 w-4 mr-2" /> Edit Details
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => toggleStatus(r)} className="cursor-pointer">
                          {r.status === "Active" ? (
                            <><UserX className="h-4 w-4 mr-2" /> Deactivate</>
                          ) : (
                            <><UserCheck className="h-4 w-4 mr-2" /> Activate</>
                          )}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDelete(r.id)} className="text-destructive focus:text-destructive cursor-pointer">
                          <Trash2 className="h-4 w-4 mr-2" /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-500 font-medium">
                    {isLoading ? "Loading recruiters..." : "No recruiters found."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent aria-describedby={undefined} className="sm:max-w-[600px] rounded-2xl bg-white border-0 shadow-2xl p-0 overflow-hidden max-h-[90vh] flex flex-col">
          <div className="p-6 overflow-y-auto">
            <DialogHeader className="mb-6">
              <DialogTitle className="text-lg font-black text-slate-900">
                {editingId ? "Edit Recruiter" : "Add Recruiter"}
              </DialogTitle>
            </DialogHeader>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[13px] font-bold text-slate-700">Full Name <span className="text-rose-500">*</span></label>
                <Input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value.replace(/[^A-Za-z\s]/g, '')})} maxLength={30} placeholder="e.g. Jane Doe" className="h-11 rounded-xl bg-slate-50 border-slate-200 focus-visible:ring-indigo-500 font-medium" />
              </div>
              <div className="space-y-2">
                <label className="text-[13px] font-bold text-slate-700">Email Address <span className="text-rose-500">*</span></label>
                <Input value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} placeholder="e.g. jane@company.com" className="h-11 rounded-xl bg-slate-50 border-slate-200 focus-visible:ring-indigo-500 font-medium" />
              </div>
              
              <div className="space-y-2">
                <label className="text-[13px] font-bold text-slate-700">Mobile Number</label>
                <Input value={formData.mobile} onChange={e => setFormData({...formData, mobile: e.target.value.replace(/[^0-9]/g, '')})} maxLength={10} placeholder="e.g. 9876543210" className="h-11 rounded-xl bg-slate-50 border-slate-200 focus-visible:ring-indigo-500 font-medium" />
              </div>
              <div className="space-y-2">
                <label className="text-[13px] font-bold text-slate-700">Status</label>
                <Select value={formData.status} onValueChange={(v: "Active"|"Inactive") => setFormData({...formData, status: v})}>
                  <SelectTrigger className="h-11 rounded-xl bg-slate-50 border-slate-200 font-medium">
                    <SelectValue placeholder="Select Status" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    <SelectItem value="Active">Active</SelectItem>
                    <SelectItem value="Inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-[13px] font-bold text-slate-700">Department</label>
                <Select value={formData.department || ""} onValueChange={(v) => setFormData({...formData, department: v})}>
                  <SelectTrigger className="h-11 rounded-xl bg-slate-50 border-slate-200 font-medium">
                    <SelectValue placeholder="Select Department" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    {departments.map((dept) => (
                      <SelectItem key={dept.id} value={dept.name}>{dept.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-[13px] font-bold text-slate-700">Designation</label>
                <Input value={formData.designation} onChange={e => setFormData({...formData, designation: e.target.value})} placeholder="e.g. Senior Recruiter" className="h-11 rounded-xl bg-slate-50 border-slate-200 focus-visible:ring-indigo-500 font-medium" />
              </div>

            </div>
            
            <div className="flex items-center justify-end gap-3 mt-8 pt-4 border-t border-slate-100">
              <Button variant="outline" onClick={() => setShowAdd(false)} className="rounded-xl font-bold border-slate-200 text-slate-600 h-11 px-6">
                Cancel
              </Button>
              <Button onClick={handleSave} className="rounded-xl font-bold bg-[#1447E6] hover:bg-[#0c31a6] shadow-md shadow-[#1447E6]/20 h-11 px-6 text-white transition-colors">
                {editingId ? "Save Changes" : "Add Recruiter"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
