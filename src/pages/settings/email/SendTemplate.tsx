import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowLeft, Search, AlertCircle, Mail, MailPlus, Send, Users, CheckCircle2, UserCircle2, AlertTriangle, Info, Eye, RefreshCw, FileText, Settings, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { API_BASE_URL } from "@/config/api";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

export default function SendTemplate() {
  const navigate = useNavigate();

  const [templates, setTemplates] = useState<any[]>([]);
  const [candidates, setCandidates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedTemplateId, setSelectedTemplateId] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCandidates, setSelectedCandidates] = useState<string[]>([]);
  const [sending, setSending] = useState(false);

  const [dialogState, setDialogState] = useState<{
    isOpen: boolean;
    type: 'alert' | 'confirm';
    title: string;
    message: string;
    onConfirm?: () => void;
  }>({ isOpen: false, type: 'alert', title: '', message: '' });

  const showAlert = (title: string, message: string) => {
    setDialogState({ isOpen: true, type: 'alert', title, message });
  };

  const showConfirm = (title: string, message: string, onConfirm: () => void) => {
    setDialogState({ isOpen: true, type: 'confirm', title, message, onConfirm });
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [tplRes, candRes] = await Promise.all([
          fetch(`${API_BASE_URL}/settings/email/templates.php`),
          fetch(`${API_BASE_URL}/candidates/candidates.php`)
        ]);
        const allTemplates = await tplRes.json();
        setTemplates(allTemplates);
        
        // Auto-select Interview template by default
        const defaultTemplate = allTemplates.find((t: any) => t.type === "Interview");
        if (defaultTemplate) {
          setSelectedTemplateId(defaultTemplate.id.toString());
        }

        const allCandidates = await candRes.json();
        setCandidates(allCandidates);
      } catch (e) {
        console.error(e);
      }
      setLoading(false);
    };
    fetchData();
  }, []);

  const template = templates.find(t => t.id.toString() === selectedTemplateId);

  const getEligibleCandidates = () => {
    if (!template) return [];
    const eligible = candidates.filter(c => {
      if (template.type === "Interview") return c.stage === "Interview Scheduled";
      if (template.type === "Offer") return c.stage === "Offer Released";
      if (template.type === "Rejection") return c.stage === "Rejected";
      return true; // For "General"
    });
    return eligible.filter(c =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.email.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  const eligibleCandidates = getEligibleCandidates();

  // When template changes, reset selected candidates
  useEffect(() => {
    setSelectedCandidates([]);
  }, [selectedTemplateId]);

  const selectableCandidates = eligibleCandidates.filter(c => {
    const isSent = c.emailLogs?.some((log: any) => log.template_id === template?.id && log.status === 'Delivered');
    return !isSent;
  });

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedCandidates(selectableCandidates.map(c => c.id));
    } else {
      setSelectedCandidates([]);
    }
  };

  const handleSendEmails = async () => {
    if (selectedCandidates.length === 0) {
      showAlert("No Candidates Selected", "Please select at least one candidate before proceeding.");
      return;
    }
    if (!template) {
      showAlert("No Template Selected", "Please select a template before proceeding.");
      return;
    }

    showConfirm(
      "Confirm Send",
      `Are you sure you want to send emails to ${selectedCandidates.length} candidate(s)? This action cannot be undone.`,
      async () => {
        setDialogState(prev => ({ ...prev, isOpen: false }));
        setSending(true);
        let sentCount = 0;

        for (const candId of selectedCandidates) {
          const candidate = candidates.find(c => c.id === candId);
          if (!candidate) continue;

          let parsedBody = template.body
            .replace(/{CandidateName}/g, candidate.name)
            .replace(/{Role}/g, candidate.role || "the position")
            .replace(/{Date}/g, new Date().toLocaleDateString());
          let parsedSubject = template.subject
            .replace(/{CandidateName}/g, candidate.name)
            .replace(/{Role}/g, candidate.role || "the position")
            .replace(/{Date}/g, new Date().toLocaleDateString());

          try {
            await fetch(`${API_BASE_URL}/settings/email/send_manual.php`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                to: candidate.email,
                subject: parsedSubject,
                body: parsedBody,
                template_id: template.id,
                candidate_id: candidate.id
              })
            });
            sentCount++;
          } catch (e) {
            console.error("Failed to send to " + candidate.email);
          }
        }

        setSending(false);
        setSelectedCandidates([]);
        showAlert("Success", `${sentCount} emails queued successfully!`);
        // Refresh data to show updated email logs
        const res = await fetch(`${API_BASE_URL}/candidates/candidates.php`);
        setCandidates(await res.json());
      }
    );
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-slate-400">
        <MailPlus className="h-12 w-12 mb-4 animate-pulse" />
        <p className="font-semibold text-sm">Loading dispatch center...</p>
      </div>
    );
  }

  return (
    <div className="w-full pb-12">
      {/* Premium Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-900 via-blue-900 to-blue-800 p-8 text-white shadow-xl mb-8">
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>
        <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-blue-500/20 blur-3xl"></div>
        <div className="absolute -left-20 -bottom-20 h-64 w-64 rounded-full bg-indigo-500/20 blur-3xl"></div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex flex-col items-start">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 shadow-inner backdrop-blur-md ring-1 ring-white/20">
                <Send className="h-5 w-5 text-blue-100 -rotate-45 ml-1" />
              </div>
              <div>
                <h1 className="text-2xl font-black tracking-tight text-white drop-shadow-sm">Dispatch Email</h1>
                <p className="mt-1 text-[13px] font-medium text-blue-200/90 max-w-md">
                  Select a template and choose eligible candidates to send personalized emails.
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4 shrink-0">
            <div className="flex items-center gap-4 bg-black/20 p-2.5 rounded-2xl backdrop-blur-md border border-white/10">
              <div className="flex items-center gap-3 px-3 py-1">
                <Users className="h-5 w-5 text-blue-300" />
                <div className="flex flex-col text-left">
                  <span className="text-xl font-black text-white leading-none">{eligibleCandidates.length}</span>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-blue-300/80">Eligible</span>
                </div>
              </div>
              <div className="w-px h-8 bg-white/10" />
              <div className="flex items-center gap-3 px-3 py-1">
                <CheckCircle2 className="h-5 w-5 text-orange-400" />
                <div className="flex flex-col text-left">
                  <span className="text-xl font-black text-white leading-none">{selectedCandidates.length}</span>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-blue-300/80">Selected</span>
                </div>
              </div>
              <div className="w-px h-8 bg-white/10" />
              <div className="flex items-center gap-3 px-3 py-1">
                <Mail className="h-5 w-5 text-yellow-400" />
                <div className="flex flex-col text-left">
                  <span className="text-xl font-black text-white leading-none">{eligibleCandidates.length - selectableCandidates.length}</span>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-blue-300/80">Already Sent</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {selectedCandidates.length > 0 && (
                <Button
                  variant="outline"
                  onClick={() => setSelectedCandidates([])}
                  className="h-12 px-5 rounded-xl font-bold bg-white/10 text-white border-white/20 hover:bg-white/20 transition-all text-[12px]"
                >
                  Clear
                </Button>
              )}
              <Button
                onClick={handleSendEmails}
                disabled={sending || selectedCandidates.length === 0 || !template}
                className="h-12 px-6 rounded-xl font-bold bg-white text-blue-900 border-none hover:bg-blue-50 hover:scale-[1.02] transition-all text-sm flex items-center gap-2 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                {sending ? (
                  <>Sending...</>
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    Preview & Send Email
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">

        {/* Left Sidebar - Controls */}
        <div className="col-span-1 space-y-6">
          <Card className="p-5 rounded-3xl border-border/50 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] bg-white">
            <div className="space-y-4">
              <label className="text-[14px] font-bold text-slate-900 tracking-tight">1. Select Template</label>
              
              <div className="relative">
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 flex items-center justify-center w-8 h-8 rounded-lg bg-slate-100/80 pointer-events-none">
                  <FileText className="h-4 w-4 text-slate-500" />
                </div>
                <select
                  value={selectedTemplateId}
                  onChange={(e) => setSelectedTemplateId(e.target.value)}
                  className="w-full h-[60px] pl-[52px] pr-10 text-sm font-bold bg-white border border-slate-200 rounded-xl outline-none transition-all focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 appearance-none cursor-pointer text-slate-700 shadow-sm"
                >
                  <option value="" className="text-slate-400">Select Template</option>
                  {templates.map(t => (
                    <option key={t.id} value={t.id} className="font-semibold text-slate-900">
                      {t.name}
                    </option>
                  ))}
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 text-[10px]">
                  ▼
                </div>
                {template && (
                  <div className="absolute left-[52px] top-[32px] text-[10px] font-medium text-slate-500 pointer-events-none">
                    {template.subject.length > 25 ? template.subject.substring(0, 25) + '...' : template.subject}
                  </div>
                )}
              </div>

              {template && (
                <button className="flex items-center gap-1.5 text-blue-600 font-bold text-[12px] hover:text-blue-700 hover:underline px-1">
                  <Eye className="h-3.5 w-3.5" /> Preview Template
                </button>
              )}
            </div>
          </Card>



        </div>

        {/* Right Content - Table */}
        <div className="col-span-1 lg:col-span-3 space-y-4">
          <div className="flex items-center justify-between px-2 mb-2">
            <h2 className="text-[16px] font-black text-slate-900 tracking-tight">
              Eligible Candidates ({eligibleCandidates.length})
            </h2>
            {selectableCandidates.length > 0 && (
              <div className="flex items-center gap-2 cursor-pointer group" onClick={() => handleSelectAll(selectedCandidates.length !== selectableCandidates.length)}>
                <Checkbox
                  id="select-all-top"
                  checked={selectedCandidates.length === selectableCandidates.length && selectableCandidates.length > 0}
                  onCheckedChange={handleSelectAll}
                  className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600 pointer-events-none rounded"
                />
                <label className="text-[13px] font-bold text-blue-600 cursor-pointer group-hover:text-blue-700 transition-colors select-none">
                  Select All Eligible ({selectableCandidates.length})
                </label>
              </div>
            )}
          </div>

          <Card className="bg-white border-border/50 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] rounded-3xl overflow-hidden mb-24">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-[13px]">
                <thead className="bg-white border-b border-slate-100">
                  <tr>
                    <th className="px-6 py-4 w-[60px] text-center">
                      <span className="sr-only">Select</span>
                    </th>
                    <th className="px-4 py-4 font-bold text-slate-500 text-[11px]">Candidate</th>
                    <th className="px-4 py-4 font-bold text-slate-500 text-[11px]">Role / Department</th>
                    <th className="px-4 py-4 font-bold text-slate-500 text-[11px]">Stage</th>
                    <th className="px-4 py-4 font-bold text-slate-500 text-[11px]">Delivery Status</th>
                    <th className="px-4 py-4 font-bold text-slate-500 text-[11px]">Last Email Sent</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {!template ? (
                    <tr>
                      <td colSpan={5} className="p-20 text-center">
                        <div className="flex flex-col items-center justify-center text-slate-400">
                          <div className="h-16 w-16 bg-slate-50 rounded-full flex items-center justify-center mb-4 ring-8 ring-slate-50/50">
                            <MailPlus className="h-8 w-8 text-slate-300" />
                          </div>
                          <p className="font-bold text-slate-600 mb-1">No Template Selected</p>
                          <p className="text-xs font-medium text-slate-400 max-w-xs mx-auto">Please select an email template from the dropdown to load the list of eligible candidates.</p>
                        </div>
                      </td>
                    </tr>
                  ) : eligibleCandidates.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-20 text-center">
                        <div className="flex flex-col items-center justify-center text-slate-400">
                          <div className="h-16 w-16 bg-slate-50 rounded-full flex items-center justify-center mb-4 ring-8 ring-slate-50/50">
                            <AlertCircle className="h-8 w-8 text-slate-300" />
                          </div>
                          <p className="font-bold text-slate-600 mb-1">No Eligible Candidates</p>
                          <p className="text-xs font-medium text-slate-400 max-w-xs mx-auto">No candidates currently match the <strong>{template.type}</strong> stage required for this template.</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    eligibleCandidates.map((candidate) => {
                      const deliveryLog = candidate.emailLogs?.find((log: any) => log.template_id === template?.id && log.status === 'Delivered');
                      const isSent = !!deliveryLog;
                      const isSelected = selectedCandidates.includes(candidate.id);
                      const initial = candidate.name ? candidate.name.charAt(0).toUpperCase() : 'U';
                      
                      return (
                        <tr
                          key={candidate.id}
                          className={cn(
                            "transition-all duration-200 group cursor-pointer",
                            isSelected ? "bg-blue-50/40" : "hover:bg-slate-50/60",
                            isSent && !isSelected ? "opacity-75 bg-slate-50/30 grayscale-[20%]" : ""
                          )}
                          onClick={() => {
                            if (isSent && !isSelected) return; // Prevent clicking row if disabled
                            
                            if (isSelected) {
                              setSelectedCandidates(selectedCandidates.filter(id => id !== candidate.id));
                            } else {
                              setSelectedCandidates([...selectedCandidates, candidate.id]);
                            }
                          }}
                        >
                          <td className="px-5 py-4 text-center relative">
                            {isSelected && <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-600 rounded-r-md"></div>}
                            <Checkbox
                              checked={isSelected}
                              disabled={isSent && !isSelected}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  setSelectedCandidates([...selectedCandidates, candidate.id]);
                                } else {
                                  setSelectedCandidates(selectedCandidates.filter(id => id !== candidate.id));
                                }
                              }}
                              onClick={(e) => e.stopPropagation()}
                              className={cn(
                                "transition-transform",
                                isSelected ? "data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600 scale-110" : "group-hover:border-blue-400"
                              )}
                            />
                          </td>
                          <td className="px-4 py-4">
                            <div className="flex items-center gap-3">
                              <div className={cn(
                                "h-10 w-10 rounded-full flex items-center justify-center font-bold text-sm shrink-0 transition-colors shadow-sm",
                                isSelected ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-600 group-hover:bg-blue-100 group-hover:text-blue-700"
                              )}>
                                {candidate.photo ? (
                                  <img 
                                    src={`${API_BASE_URL}/candidates/uploads/${candidate.photo}`} 
                                    alt={candidate.name} 
                                    className="h-full w-full rounded-full object-cover" 
                                    onError={(e) => {
                                      (e.target as HTMLImageElement).style.display = 'none';
                                      (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden');
                                    }}
                                  />
                                ) : null}
                                <span className={candidate.photo ? "hidden" : ""}>
                                  {initial}
                                </span>
                              </div>
                              <div className="flex flex-col min-w-0">
                                <span className={cn(
                                  "font-bold truncate transition-colors",
                                  isSelected ? "text-blue-900" : "text-slate-900 group-hover:text-blue-700"
                                )}>
                                  {candidate.name}
                                </span>
                                <span className="text-slate-500 text-[11px] truncate mt-0.5 font-medium">{candidate.email}</span>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-4">
                            <div className="flex flex-col min-w-0">
                              <span className="font-bold text-slate-700 truncate">{candidate.role || "N/A"}</span>
                              <span className="text-slate-400 text-[11px] truncate mt-0.5 font-semibold">{candidate.department || "N/A"}</span>
                            </div>
                          </td>
                          <td className="px-4 py-4">
                            <span className={cn(
                              "inline-flex px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border",
                              isSelected
                                ? "bg-blue-100 text-blue-700 border-blue-200"
                                : "bg-slate-100 text-slate-600 border-slate-200 group-hover:bg-slate-200 group-hover:border-slate-300"
                            )}>
                              {candidate.stage}
                            </span>
                          </td>
                          <td className="px-4 py-4">
                            {isSent ? (
                              <div className="flex flex-col gap-1 items-start">
                                <div className="flex items-center gap-1.5 text-emerald-600 bg-emerald-50 px-2 py-1 rounded font-bold text-[11px]">
                                  <CheckCircle2 className="w-3.5 h-3.5" /> Already Sent
                                </div>
                                <div className="text-emerald-700/80 text-[10px] font-bold">
                                  {new Date(deliveryLog.sent_at).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                                </div>
                              </div>
                            ) : candidate.emailLogs?.some((log: any) => log.template_id === template?.id && log.status === 'Failed') ? (
                              <div className="flex flex-col gap-1 items-start">
                                <div className="flex items-center gap-1.5 text-red-600 bg-red-50 px-2 py-1 rounded font-bold text-[11px]">
                                  ✕ Failed
                                </div>
                                <div className="text-red-700/80 text-[10px] font-bold">
                                  {new Date(candidate.emailLogs.find((log: any) => log.template_id === template?.id && log.status === 'Failed').sent_at).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                                </div>
                              </div>
                            ) : (
                              <div className="flex items-center gap-1.5 text-amber-600 bg-amber-50 px-2 py-1 rounded font-bold text-[11px]">
                                Not Sent
                              </div>
                            )}
                          </td>
                          <td className="px-4 py-4">
                            {isSent || candidate.emailLogs?.some((log: any) => log.template_id === template?.id) ? (
                              <div className="flex flex-col">
                                <span className="font-bold text-slate-900 text-[12px]">{template?.name}</span>
                                <span className="text-slate-500 text-[11px] font-medium mt-0.5">{deliveryLog?.unique_hash?.startsWith('auto-') ? 'Automatic' : 'Manual'}</span>
                              </div>
                            ) : (
                              <span className="text-slate-400 font-bold">—</span>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      </div>

      {/* Custom Alert/Confirm Dialog */}
      <Dialog open={dialogState.isOpen} onOpenChange={(open) => !open && setDialogState(prev => ({ ...prev, isOpen: false }))}>
        <DialogContent className="max-w-md bg-white rounded-2xl p-0 border-0 shadow-2xl overflow-hidden">
          <DialogHeader className="p-6 border-b border-slate-100 bg-slate-50/50">
            <DialogTitle className="text-xl font-bold text-slate-900 flex items-center gap-2">
              {dialogState.type === 'alert' && dialogState.title === 'Success' && <CheckCircle2 className="h-5 w-5 text-emerald-500" />}
              {dialogState.type === 'alert' && dialogState.title !== 'Success' && <Info className="h-5 w-5 text-blue-500" />}
              {dialogState.type === 'confirm' && <AlertTriangle className="h-5 w-5 text-orange-500" />}
              {dialogState.title}
            </DialogTitle>
          </DialogHeader>
          <div className="p-6">
            <p className="text-[14px] text-slate-600 font-medium leading-relaxed">
              {dialogState.message}
            </p>
          </div>
          <DialogFooter className="p-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-end gap-2">
            {dialogState.type === 'confirm' && (
              <Button 
                variant="outline" 
                onClick={() => setDialogState(prev => ({ ...prev, isOpen: false }))} 
                className="text-[13px] font-bold h-9"
              >
                Cancel
              </Button>
            )}
            <Button 
              onClick={() => {
                if (dialogState.type === 'confirm' && dialogState.onConfirm) {
                  dialogState.onConfirm();
                } else {
                  setDialogState(prev => ({ ...prev, isOpen: false }));
                }
              }} 
              className={cn(
                "text-[13px] font-bold h-9",
                dialogState.type === 'confirm' ? "bg-blue-600 hover:bg-blue-700 text-white" : ""
              )}
            >
              {dialogState.type === 'confirm' ? 'Confirm' : 'OK'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
