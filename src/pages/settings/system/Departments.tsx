import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { Plus, Building2, MoreHorizontal, Pencil, PowerOff, LayoutGrid, List } from "lucide-react";
import { API_BASE_URL } from "@/config/api";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

export default function Departments() {
  const [departments, setDepartments] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDept, setEditingDept] = useState<any>(null);
  const [view, setView] = useState<'grid' | 'table'>('table');
  
  const [formData, setFormData] = useState({ name: '', status: 'Active' });
  const [isSaving, setIsSaving] = useState(false);

  const fetchDepartments = () => {
    fetch(`${API_BASE_URL}/jobs/departments.php`)
      .then(res => res.json())
      .then(res => {
        if (Array.isArray(res)) setDepartments(res);
      });
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  const openModal = (dept?: any) => {
    if (dept) {
      setEditingDept(dept);
      setFormData({ name: dept.name, status: dept.status || 'Active' });
    } else {
      setEditingDept(null);
      setFormData({ name: '', status: 'Active' });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    
    const method = editingDept ? 'PUT' : 'POST';
    const payload = { ...formData, id: editingDept?.id };

    try {
      const res = await fetch(`${API_BASE_URL}/jobs/departments.php`, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      }).then(r => r.json());

      if (res.success) {
        toast.success(editingDept ? "Department updated" : "Department added");
        setIsModalOpen(false);
        fetchDepartments();
      } else {
        toast.error(res.error || "Failed to save department");
      }
    } catch (err) {
      toast.error("An error occurred");
    } finally {
      setIsSaving(false);
    }
  };

  const toggleStatus = async (dept: any) => {
    try {
      const newStatus = dept.status === 'Active' ? 'Inactive' : 'Active';
      const res = await fetch(`${API_BASE_URL}/jobs/departments.php`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: dept.id, action: 'toggle_status', status: newStatus })
      }).then(r => r.json());

      if (res.success) {
        toast.success(`Department marked as ${newStatus}`);
        fetchDepartments();
      } else {
        toast.error(res.error || "Failed to update status");
      }
    } catch (err) {
      toast.error("An error occurred");
    }
  };

  return (
    <div className="flex-1 w-full p-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900">Departments</h1>
          <p className="text-sm font-medium text-slate-500 mt-1">Manage company departments and teams</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="bg-slate-100 p-1 rounded-xl flex items-center">
            <button
              onClick={() => setView('grid')}
              className={cn(
                "px-3 py-1.5 rounded-lg text-sm font-bold flex items-center transition-colors",
                view === 'grid' ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
              )}
            >
              <LayoutGrid className="w-4 h-4 mr-2" /> Grid
            </button>
            <button
              onClick={() => setView('table')}
              className={cn(
                "px-3 py-1.5 rounded-lg text-sm font-bold flex items-center transition-colors",
                view === 'table' ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
              )}
            >
              <List className="w-4 h-4 mr-2" /> Table
            </button>
          </div>
          <Button 
            onClick={() => openModal()}
            className="h-10 px-4 rounded-xl font-bold bg-[#1447E6] hover:bg-[#0c31a6] text-white shadow-md shadow-[#1447E6]/20"
          >
            <Plus className="w-4 h-4 mr-2" /> Add Department
          </Button>
        </div>
      </div>

      {/* Grid View */}
      {view === 'grid' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {departments.map((dept, idx) => (
          <Card key={idx} className="rounded-3xl border-slate-200/60 shadow-sm overflow-hidden bg-white flex flex-col relative group">
            <div className="p-6 pb-4 border-b border-slate-100 flex-1">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${dept.color_theme || 'bg-slate-50 border-slate-100 text-slate-600'}`}>
                    <Building2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-[15px] font-black text-slate-900 leading-tight">{dept.name}</h3>
                    <div className="text-[11px] font-bold text-slate-500 mt-0.5">{dept.dept_id || `DEPT-${String(dept.id).padStart(3, '0')}`}</div>
                  </div>
                </div>
                {dept.status === 'Active' ? (
                  <span className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-emerald-50 text-emerald-700 text-[10px] font-bold uppercase tracking-wider">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Active
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-slate-100 text-slate-600 text-[10px] font-bold uppercase tracking-wider">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span> Inactive
                  </span>
                )}
              </div>
              
              <div className="grid grid-cols-2 gap-4 mt-6">
                <div>
                  <div className="text-2xl font-black text-slate-900">{dept.jobs_count || 0}</div>
                  <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">Jobs</div>
                </div>
                <div>
                  <div className="text-2xl font-black text-slate-900">{dept.candidates_count || 0}</div>
                  <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">Candidates</div>
                </div>
              </div>
            </div>
            
            <div className="bg-slate-50 p-4 py-3 flex items-center justify-between">
              <div className="text-xs font-bold text-slate-500">
                Created: {dept.created_at ? new Date(dept.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '-'}
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 text-[12px] font-bold text-slate-500 hover:text-indigo-600">
                    Edit &middot; More
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="rounded-xl border-border/40 w-48">
                  <DropdownMenuItem onClick={() => openModal(dept)} className="cursor-pointer font-medium">
                    <Pencil className="h-4 w-4 mr-2 text-slate-400" /> Edit Department
                  </DropdownMenuItem>
                  
                  <DropdownMenuItem onClick={() => toggleStatus(dept)} className="cursor-pointer font-medium text-slate-600">
                    <PowerOff className="h-4 w-4 mr-2 text-slate-400" /> 
                    {dept.status === 'Active' ? 'Deactivate' : 'Activate'}
                  </DropdownMenuItem>
                  
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </Card>
        ))}
        </div>
      )}

      {/* Table View */}
      {view === 'table' && (
        <Card className="rounded-3xl border-slate-200/60 shadow-sm overflow-hidden bg-white">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50/80 border-b border-slate-100 text-xs font-bold text-slate-500 uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-4">Department Name</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Jobs</th>
                  <th className="px-6 py-4">Candidates</th>
                  <th className="px-6 py-4">Created Date</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {departments.map((dept, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border ${dept.color_theme || 'bg-slate-50 border-slate-100 text-slate-600'}`}>
                          <Building2 className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="font-bold text-slate-900">{dept.name}</div>
                          <div className="text-[11px] font-bold text-slate-500 mt-0.5">{dept.dept_id || `DEPT-${String(dept.id).padStart(3, '0')}`}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {dept.status === 'Active' ? (
                        <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-emerald-50 text-emerald-700 text-xs font-bold">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-slate-100 text-slate-600 text-xs font-bold">
                          <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span> Inactive
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 font-bold text-slate-700">{dept.jobs_count || 0}</td>
                    <td className="px-6 py-4 font-bold text-slate-700">{dept.candidates_count || 0}</td>
                    <td className="px-6 py-4 text-slate-500 font-medium">
                      {dept.created_at ? new Date(dept.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '-'}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-indigo-600 rounded-lg">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="rounded-xl border-border/40 w-48">
                          <DropdownMenuItem onClick={() => openModal(dept)} className="cursor-pointer font-medium">
                            <Pencil className="h-4 w-4 mr-2 text-slate-400" /> Edit Department
                          </DropdownMenuItem>
                          
                          <DropdownMenuItem onClick={() => toggleStatus(dept)} className="cursor-pointer font-medium text-slate-600">
                            <PowerOff className="h-4 w-4 mr-2 text-slate-400" /> 
                            {dept.status === 'Active' ? 'Deactivate' : 'Activate'}
                          </DropdownMenuItem>
                          
                          </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))}
                {departments.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-slate-500 font-medium">No departments found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm"
          onClick={() => setIsModalOpen(false)}
        >
          <div 
            className="bg-white rounded-3xl shadow-xl w-full max-w-md overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-lg font-black text-slate-900">{editingDept ? 'Edit Department' : 'Add Department'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">×</button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Department Name <span className="text-rose-500">*</span></label>
                <input 
                  type="text" 
                  required
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Engineering, Marketing..."
                  className="w-full h-11 px-4 rounded-xl border border-slate-200 focus:border-[#1447E6] focus:ring-2 focus:ring-[#1447E6]/10 text-sm font-medium"
                />
              </div>
              
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Status</label>
                <select 
                  value={formData.status}
                  onChange={e => setFormData({ ...formData, status: e.target.value })}
                  className="w-full h-11 px-4 rounded-xl border border-slate-200 focus:border-[#1447E6] focus:ring-2 focus:ring-[#1447E6]/10 text-sm bg-white font-medium"
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>

              <div className="pt-4 flex items-center justify-end gap-3">
                <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)} className="rounded-xl font-bold">Cancel</Button>
                <Button disabled={isSaving} type="submit" className="bg-[#1447E6] hover:bg-[#0c31a6] text-white rounded-xl font-bold shadow-md shadow-[#1447E6]/20">
                  {isSaving ? "Saving..." : "Save Department"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}


    </div>
  );
}
