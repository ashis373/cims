import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mail, Search, Edit2, Trash2, Eye, CheckCircle2, XCircle, Plus, Send } from "lucide-react";
import { cn } from "@/lib/utils";
import { Checkbox } from "@/components/ui/checkbox";
import { API_BASE_URL } from "@/config/api";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { useNavigate } from "react-router-dom";
import { getAuthHeaders } from "@/services/candidate-api";
import { toast } from "sonner";

export default function EmailTemplates() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [templates, setTemplates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Dialog States
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<any>(null);
  
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewTemplate, setPreviewTemplate] = useState<any>(null);

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [templateToDelete, setTemplateToDelete] = useState<number | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    subject: "",
    type: "Interview",
    sending_method: "Automatic",
    body: "",
    is_active: 1
  });

  const fetchTemplates = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/settings/email/templates.php`, {
        credentials: 'include',
        headers: getAuthHeaders(false)
      });
      const data = await res.json();
      if (!res.ok && data.message) {
        toast.error(data.message);
      } else {
        setTemplates(data);
      }
    } catch (e: any) {
      console.error(e);
      toast.error(e.message || "Failed to load templates.");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

  const toggleTemplate = async (id: number, currentStatus: number) => {
    const newStatus = currentStatus ? 0 : 1;
    try {
      const res = await fetch(`${API_BASE_URL}/settings/email/templates.php`, {
        method: 'POST',
        credentials: 'include',
        headers: getAuthHeaders(),
        body: JSON.stringify({ action: 'toggle', id, is_active: newStatus })
      });
      const data = await res.json();
      if (!res.ok && data.message) {
        toast.error(data.message);
        return;
      }
      if (data.success) {
        setTemplates(templates.map(t => t.id === id ? { ...t, is_active: newStatus } : t));
        toast.success(newStatus ? "Template enabled" : "Template disabled");
      }
    } catch (e: any) {
      console.error(e);
      toast.error(e.message || "Failed to toggle template.");
    }
  };

  const updateTemplateMethod = async (id: number, method: string) => {
    try {
      const res = await fetch(`${API_BASE_URL}/settings/email/templates.php`, {
        method: 'POST',
        credentials: 'include',
        headers: getAuthHeaders(),
        body: JSON.stringify({ action: 'update_method', id, sending_method: method })
      });
      const data = await res.json();
      if (!res.ok && data.message) {
        toast.error(data.message);
        return;
      }
      if (data.success) {
        setTemplates(templates.map(t => t.id === id ? { ...t, sending_method: method } : t));
        toast.success("Template sending method updated");
      }
    } catch (e: any) {
      console.error(e);
      toast.error(e.message || "Failed to update sending method.");
    }
  };

  const toggleAllTemplates = async (status: number) => {
    try {
      const res = await fetch(`${API_BASE_URL}/settings/email/templates.php`, {
        method: 'POST',
        credentials: 'include',
        headers: getAuthHeaders(),
        body: JSON.stringify({ action: 'toggle_all', is_active: status })
      });
      const data = await res.json();
      if (!res.ok && data.message) {
        toast.error(data.message);
        return;
      }
      if (data.success) {
        setTemplates(templates.map(t => ({ ...t, is_active: status })));
        toast.success(status ? "All templates enabled" : "All templates disabled");
      }
    } catch (e: any) {
      console.error(e);
      toast.error(e.message || "Failed to toggle templates.");
    }
  };

  const openCreateDialog = () => {
    setEditingTemplate(null);
    setFormData({
      name: "",
      subject: "",
      type: "Interview",
      sending_method: "Automatic",
      body: "",
      is_active: 1
    });
    setDialogOpen(true);
  };

  const openEditDialog = (template: any) => {
    setEditingTemplate(template);
    setFormData({
      name: template.name,
      subject: template.subject,
      type: template.type,
      sending_method: template.sending_method,
      body: template.body || "",
      is_active: template.is_active
    });
    setDialogOpen(true);
  };

  const saveTemplate = async () => {
    if (!formData.name || !formData.subject || !formData.body) {
      alert("Name, subject, and body are required.");
      return;
    }
    try {
      const action = editingTemplate ? 'update' : 'create';
      const payload = { ...formData, action, id: editingTemplate?.id };
      
      const res = await fetch(`${API_BASE_URL}/settings/email/templates.php`, {
        method: 'POST',
        credentials: 'include',
        headers: getAuthHeaders(),
        body: JSON.stringify(payload)
      });
      
      const data = await res.json();
      if (!res.ok && data.message) {
        toast.error(data.message);
        return;
      }
      if (data.success) {
        setDialogOpen(false);
        fetchTemplates();
        toast.success(editingTemplate ? "Template updated successfully" : "Template created successfully");
      } else {
        toast.error(data.error || "Failed to save template.");
      }
    } catch (e: any) {
      console.error(e);
      toast.error(e.message || "An error occurred while saving the template.");
    }
  };

  const confirmDelete = async () => {
    if (!templateToDelete) return;
    try {
      const res = await fetch(`${API_BASE_URL}/settings/email/templates.php`, {
        method: 'POST',
        credentials: 'include',
        headers: getAuthHeaders(),
        body: JSON.stringify({ action: 'delete', id: templateToDelete })
      });
      
      const data = await res.json();
      if (!res.ok && data.message) {
        toast.error(data.message);
        return;
      }
      if (data.success) {
        setDeleteOpen(false);
        setTemplateToDelete(null);
        fetchTemplates();
        toast.success("Template deleted successfully");
      } else {
        toast.error(data.error || "Failed to delete template.");
      }
    } catch (e: any) {
      console.error(e);
      toast.error(e.message || "An error occurred while deleting.");
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner (Dark Teal / Cyan Gradient) */}
      <div className="relative overflow-hidden rounded-[28px] bg-gradient-to-r from-[#000C22] via-[#0B2524] to-[#0D2823] shadow-lg border border-teal-900/40 p-8 sm:p-10 text-white flex flex-col xl:flex-row items-start xl:items-center justify-between gap-6">
        <div className="relative z-10 flex flex-col justify-center max-w-xl">
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight mb-2 text-white">Email Templates</h1>
          <p className="text-[#60C042] text-[14px] sm:text-[15px] font-medium leading-relaxed">
            Manage standard system emails, customize templates, and automate notification workflows.
          </p>
        </div>

        {/* Action Controls & Search on Right */}
        <div className="relative z-10 flex flex-wrap items-center gap-3 w-full xl:w-auto justify-start xl:justify-end">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-teal-200/60" />
            <Input 
              placeholder="Search templates..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-10 w-full text-sm bg-white/10 border-white/20 text-white placeholder:text-teal-200/60 focus-visible:ring-teal-400 backdrop-blur-md rounded-xl shadow-inner"
            />
          </div>

          <Button 
            variant="outline"
            onClick={() => {
              const anyActive = templates.some(t => t.is_active);
              toggleAllTemplates(anyActive ? 0 : 1);
            }}
            className={cn(
              "h-10 text-sm font-semibold rounded-xl transition-all backdrop-blur-md",
              templates.some(t => t.is_active) 
                ? "bg-red-500/10 border-red-400/30 text-red-300 hover:bg-red-500/20 hover:text-white" 
                : "bg-emerald-500/10 border-emerald-400/30 text-emerald-300 hover:bg-emerald-500/20 hover:text-white"
            )}
          >
            {templates.some(t => t.is_active) ? (
               <><XCircle className="mr-1.5 h-4 w-4" /> Disable All</>
            ) : (
               <><CheckCircle2 className="mr-1.5 h-4 w-4" /> Enable All</>
            )}
          </Button>

          <Button 
            onClick={() => navigate("/email-settings/send")} 
            className="h-10 text-sm bg-white/10 hover:bg-white/20 text-white border border-white/20 backdrop-blur-md font-semibold rounded-xl shadow-sm transition-all"
          >
            <Send className="mr-1.5 h-4 w-4" /> Send Email
          </Button>

          <Button 
            onClick={openCreateDialog} 
            className="btn-primary h-10 px-5 text-sm font-bold rounded-xl flex items-center shadow-lg transition-transform active:scale-95"
          >
            <Plus className="mr-1.5 h-4 w-4" /> Create Template
          </Button>

          <div className="hidden xl:flex items-center justify-center w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 shadow-inner flex-shrink-0 cursor-pointer hover:scale-105 transition-transform duration-300 ml-1">
            <span className="text-3xl select-none filter drop-shadow-md hover:animate-bounce">✉️</span>
          </div>
        </div>

        {/* Decorative Background Elements */}
        <div className="absolute -right-16 -top-16 w-80 h-80 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute right-40 -bottom-20 w-60 h-60 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
      </div>

      <Card className="bg-white border-border/50 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-[12px]">
            <thead className="bg-slate-50/80 text-slate-500 font-semibold border-b border-slate-100">
              <tr>
                <th className="px-5 py-3 font-bold">Template Name</th>
                <th className="px-5 py-3 font-bold">Subject Line</th>
                <th className="px-5 py-3 font-bold">Category</th>
                <th className="px-5 py-3 font-bold">Sending Method</th>
                <th className="px-5 py-3 font-bold">Status</th>
                <th className="px-5 py-3 font-bold">Last Updated</th>
                <th className="px-5 py-3 font-bold text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr><td colSpan={7} className="p-4 text-center text-slate-500">Loading templates...</td></tr>
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
                    <select
                      className="text-[11px] font-semibold border-slate-200 rounded-md bg-white text-slate-600 focus:ring-blue-500 focus:border-blue-500 py-1"
                      value={template.sending_method || "Automatic"}
                      onChange={(e) => updateTemplateMethod(template.id, e.target.value)}
                    >
                      <option value="Automatic">Automatic</option>
                      <option value="Manual">Manual</option>
                    </select>
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
                      <Button onClick={() => openEditDialog(template)} variant="ghost" size="icon" className="h-7 w-7 text-slate-400 hover:text-blue-600">
                        <Edit2 className="h-3.5 w-3.5" />
                      </Button>
                      <Button onClick={() => { setPreviewTemplate(template); setPreviewOpen(true); }} variant="ghost" size="icon" className="h-7 w-7 text-slate-400 hover:text-blue-600">
                        <Eye className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
              {!loading && templates.length === 0 && (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-400 font-semibold">No templates found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Create / Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl bg-white rounded-2xl p-0 border-0 shadow-2xl overflow-hidden">
          <DialogHeader className="p-6 border-b border-slate-100 bg-slate-50/50">
            <DialogTitle className="text-xl font-bold text-slate-900">{editingTemplate ? "Edit Template" : "Create Template"}</DialogTitle>
          </DialogHeader>
          <div className="p-6 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Template Name</label>
                <Input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="e.g. Interview Invite" className="h-9 text-[12px] font-semibold" />
              </div>
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Category</label>
                <select 
                  value={formData.type} 
                  onChange={e => setFormData({...formData, type: e.target.value})}
                  className="w-full h-9 px-3 py-1 text-[12px] font-semibold border border-slate-200 rounded-md focus:ring-1 focus:ring-blue-500 outline-none"
                >
                  <option value="Interview">Interview</option>
                  <option value="Offer">Offer</option>
                  <option value="Rejection">Rejection</option>
                  <option value="General">General</option>
                </select>
              </div>
            </div>
            
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Subject Line</label>
              <Input value={formData.subject} onChange={e => setFormData({...formData, subject: e.target.value})} placeholder="e.g. Interview Invitation: {CandidateName}" className="h-9 text-[12px] font-semibold" />
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Sending Method</label>
              <select 
                  value={formData.sending_method} 
                  onChange={e => setFormData({...formData, sending_method: e.target.value})}
                  className="w-full h-9 px-3 py-1 text-[12px] font-semibold border border-slate-200 rounded-md focus:ring-1 focus:ring-blue-500 outline-none"
                >
                  <option value="Automatic">Automatic</option>
                  <option value="Manual">Manual</option>
                </select>
            </div>
            
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex justify-between">
                <span>Email Body</span>
                <span className="text-[9px] text-slate-400">Use {'{CandidateName}'}, {'{Role}'}, {'{Date}'} for placeholders</span>
              </label>
              <textarea 
                value={formData.body} 
                onChange={e => setFormData({...formData, body: e.target.value})} 
                placeholder="Hello {CandidateName}..." 
                className="w-full h-48 px-3 py-2 text-[12px] font-semibold border border-slate-200 rounded-md focus:ring-1 focus:ring-blue-500 outline-none resize-none"
              />
            </div>
          </div>
          <DialogFooter className="p-4 border-t border-slate-100 bg-slate-50/50">
            <Button variant="outline" onClick={() => setDialogOpen(false)} className="text-[11px] font-bold">Cancel</Button>
            <Button onClick={saveTemplate} className="bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-bold">Save Template</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Preview Dialog */}
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-w-2xl bg-white rounded-2xl p-0 border-0 shadow-2xl overflow-hidden">
          <DialogHeader className="p-6 border-b border-slate-100 bg-slate-50/50">
            <DialogTitle className="text-xl font-bold text-slate-900">Preview: {previewTemplate?.name}</DialogTitle>
          </DialogHeader>
          <div className="p-6 space-y-4">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
              <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Subject</div>
              <div className="text-[13px] font-bold text-slate-900">{previewTemplate?.subject}</div>
            </div>
            <div className="p-4 bg-white rounded-xl border border-slate-200 min-h-[200px]">
              <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">Body</div>
              <div className="text-[13px] text-slate-800 whitespace-pre-wrap">{previewTemplate?.body}</div>
            </div>
          </div>
          <DialogFooter className="p-4 border-t border-slate-100 bg-slate-50/50">
            <Button variant="outline" onClick={() => setPreviewOpen(false)} className="text-[11px] font-bold">Close Preview</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent className="max-w-sm bg-white rounded-2xl p-6 border-0 shadow-2xl">
          <div className="text-center">
            <Trash2 className="mx-auto h-8 w-8 text-red-500 mb-4" />
            <h3 className="text-lg font-bold text-slate-900 mb-2">Delete Template</h3>
            <p className="text-[13px] font-medium text-slate-500 mb-6">
              Are you sure you want to permanently delete this template? This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-center">
              <Button variant="outline" onClick={() => setDeleteOpen(false)} className="text-[11px] font-bold w-full">Cancel</Button>
              <Button onClick={confirmDelete} className="bg-red-600 hover:bg-red-700 text-white text-[11px] font-bold w-full">Delete</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
