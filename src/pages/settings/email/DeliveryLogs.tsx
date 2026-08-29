import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, RefreshCcw, CheckCircle2, XCircle, Clock, Eye, MoreHorizontal, Mail } from "lucide-react";
import { cn } from "@/lib/utils";
import { API_BASE_URL } from "@/config/api";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

export default function DeliveryLogs() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selectedLog, setSelectedLog] = useState<any>(null);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/settings/email/logs.php`);
      setLogs(await res.json());
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Delivery Logs</h1>
          <p className="text-[13px] text-slate-500 mt-1">Monitor the status of all outgoing messages.</p>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input 
            placeholder="Search by recipient or subject..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-10 w-full text-sm bg-white border-slate-200 shadow-sm rounded-xl"
          />
        </div>
        <Button onClick={fetchLogs} variant="outline" className="h-10 text-sm font-semibold bg-white border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl">
          <RefreshCcw className="mr-2 h-4 w-4" /> Refresh Logs
        </Button>
      </div>

      <Card className="bg-white border-border/50 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] rounded-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-500 delay-100">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-[12px]">
            <thead className="bg-slate-50/80 text-slate-500 font-semibold border-b border-slate-100">
              <tr>
                <th className="px-5 py-3 font-bold">Candidate Name</th>
                <th className="px-5 py-3 font-bold">Recipient Email</th>
                <th className="px-5 py-3 font-bold">Template</th>
                <th className="px-5 py-3 font-bold">Subject</th>
                <th className="px-5 py-3 font-bold">Sending Method</th>
                <th className="px-5 py-3 font-bold">Status</th>
                <th className="px-5 py-3 font-bold">Date & Time</th>
                <th className="px-5 py-3 font-bold text-center">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr><td colSpan={8} className="p-4 text-center text-slate-500">Loading logs...</td></tr>
              ) : logs.length === 0 ? (
                <tr><td colSpan={8} className="p-8 text-center text-slate-500">No email logs found.</td></tr>
              ) : logs.filter(l => l.recipient.toLowerCase().includes(searchQuery.toLowerCase()) || l.subject.toLowerCase().includes(searchQuery.toLowerCase())).map((log) => (
                <tr key={log.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="px-5 py-3.5 font-bold text-slate-800">{log.candidate_name || "Unknown"}</td>
                  <td className="px-5 py-3.5 font-medium text-slate-600">{log.recipient}</td>
                  <td className="px-5 py-3.5">
                    <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-700 border border-slate-200">
                      {log.template_name || "Unknown"}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-slate-600 truncate max-w-[200px] font-medium">{log.subject}</td>
                  <td className="px-5 py-3.5">
                    <span className={cn(
                      "px-2.5 py-1 rounded-full text-[10px] font-bold",
                      log.unique_hash?.startsWith('auto-') ? "bg-purple-50 text-purple-600" : "bg-blue-50 text-blue-600"
                    )}>
                      {log.unique_hash?.startsWith('auto-') ? "Automatic" : "Manual"}
                    </span>
                  </td>
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
                  <td className="px-5 py-3.5 text-slate-500 font-semibold">{log.date}</td>
                  <td className="px-5 py-3.5 text-center">
                    <Button onClick={() => { setSelectedLog(log); setDetailsOpen(true); }} variant="outline" size="sm" className="h-7 text-[10px] font-bold px-3 hover:text-blue-600">
                      View
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="max-w-2xl bg-white rounded-2xl p-0 border-0 shadow-2xl overflow-hidden">
          <DialogHeader className="p-6 border-b border-slate-100 bg-slate-50/50">
            <DialogTitle className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <Mail className="h-5 w-5 text-slate-400" /> Message Details
            </DialogTitle>
          </DialogHeader>
          <div className="p-6 space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <div>
                <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Candidate Name</div>
                <div className="text-[13px] font-bold text-slate-900">{selectedLog?.candidate_name || "Unknown"}</div>
              </div>
              <div>
                <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Recipient Email</div>
                <div className="text-[13px] font-bold text-slate-900">{selectedLog?.recipient}</div>
              </div>
              <div>
                <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Template</div>
                <div className="text-[13px] font-semibold text-slate-700">{selectedLog?.template_name || "Unknown"}</div>
              </div>
              <div>
                <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Date & Time</div>
                <div className="text-[13px] font-semibold text-slate-700">{selectedLog?.date}</div>
              </div>
              <div className="col-span-2">
                <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Subject</div>
                <div className="text-[13px] font-semibold text-slate-700">{selectedLog?.subject}</div>
              </div>
            </div>
            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <div className="bg-slate-50 border-b border-slate-200 px-4 py-2 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Message Body
              </div>
              <div className="p-4 bg-white text-[13px] text-slate-800 whitespace-pre-wrap min-h-[150px] max-h-[300px] overflow-y-auto">
                {selectedLog?.body || <span className="text-slate-400 italic">No message body available.</span>}
              </div>
            </div>
            
            {selectedLog?.status === "Failed" && selectedLog?.error_message && (
              <div className="border border-red-200 rounded-xl overflow-hidden mt-4">
                <div className="bg-red-50 border-b border-red-200 px-4 py-2 text-[11px] font-bold text-red-600 uppercase tracking-wider">
                  Error Details
                </div>
                <div className="p-4 bg-white text-[13px] text-red-600 whitespace-pre-wrap">
                  {selectedLog.error_message}
                </div>
              </div>
            )}
          </div>
          <DialogFooter className="p-4 border-t border-slate-100 bg-slate-50/50">
            <Button variant="outline" onClick={() => setDetailsOpen(false)} className="text-[11px] font-bold">Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
