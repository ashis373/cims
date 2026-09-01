import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, RefreshCcw, CheckCircle2, XCircle, Clock, Eye, MoreHorizontal, Mail } from "lucide-react";
import { cn } from "@/lib/utils";
import { API_BASE_URL } from "@/config/api";
import { getAuthHeaders } from "@/services/candidate-api";
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
  const [dateFilter, setDateFilter] = useState("all");
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selectedLog, setSelectedLog] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const [queueData, setQueueData] = useState<{
    counts: { Pending: number; Processing: number; Sent: number; Failed: number };
    worker_running: boolean;
    last_processed: string | null;
    worker_enabled: boolean;
  }>({
    counts: { Pending: 0, Processing: 0, Sent: 0, Failed: 0 },
    worker_running: false,
    last_processed: null,
    worker_enabled: true
  });

  const [pauseDialogOpen, setPauseDialogOpen] = useState(false);
  const [toggling, setToggling] = useState(false);

  const toggleWorker = async (enabled: boolean) => {
    setToggling(true);
    try {
      await fetch(`${API_BASE_URL}/settings/email/toggle_worker.php`, {
        method: 'POST',
        credentials: 'include',
        headers: getAuthHeaders(true),
        body: JSON.stringify({ enabled })
      });
      await fetchLogs();
    } catch (e) {
      console.error(e);
    }
    setToggling(false);
    setPauseDialogOpen(false);
  };

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const [resLogs, resQueue] = await Promise.all([
        fetch(`${API_BASE_URL}/settings/email/logs.php`, { credentials: 'include', headers: getAuthHeaders(false) }),
        fetch(`${API_BASE_URL}/settings/email/queue_status.php`, { credentials: 'include', headers: getAuthHeaders(false) })
      ]);
      setLogs(await resLogs.json());
      setQueueData(await resQueue.json());
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const filteredLogs = logs.filter(l => {
    const matchesSearch = (l.recipient || '').toLowerCase().includes(searchQuery.toLowerCase()) || (l.subject || '').toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;
    
    if (dateFilter !== "all") {
      const logDate = l.timestamp_sort ? new Date(l.timestamp_sort * 1000) : new Date(l.date);
      const now = new Date();
      if (dateFilter === "today") {
        return logDate.toDateString() === now.toDateString();
      } else if (dateFilter === "7days") {
        const diffTime = Math.abs(now.getTime() - logDate.getTime());
        return diffTime <= (7 * 24 * 60 * 60 * 1000);
      } else if (dateFilter === "90days") {
        const diffTime = Math.abs(now.getTime() - logDate.getTime());
        return diffTime <= (90 * 24 * 60 * 60 * 1000);
      }
    }
    return true;
  });

  const totalPages = Math.max(1, Math.ceil(filteredLogs.length / 10));
  const paginatedLogs = filteredLogs.slice((currentPage - 1) * 10, currentPage * 10);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Delivery Logs</h1>
          <p className="text-[13px] text-slate-500 mt-1">Monitor the status of all outgoing messages.</p>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-6 bg-slate-50 border border-slate-200 rounded-2xl p-5 shadow-sm animate-in fade-in slide-in-from-bottom-2 duration-500">
        <div className="flex-1">
          <h3 className="text-[13px] font-black text-slate-900 tracking-tight mb-4 flex items-center gap-2">
            <Clock className="h-4 w-4 text-blue-600" /> Email Queue
          </h3>
          <div className="flex items-center gap-8">
            <div className="flex flex-col">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Pending</span>
              <span className="text-xl font-black text-slate-800">{queueData.counts.Pending}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[11px] font-bold text-blue-500 uppercase tracking-wider mb-1">Processing</span>
              <span className="text-xl font-black text-blue-700">{queueData.counts.Processing}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[11px] font-bold text-emerald-500 uppercase tracking-wider mb-1">Sent</span>
              <span className="text-xl font-black text-emerald-700">{queueData.counts.Sent}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[11px] font-bold text-red-500 uppercase tracking-wider mb-1">Failed</span>
              <span className="text-xl font-black text-red-700">{queueData.counts.Failed}</span>
            </div>
          </div>
        </div>
        
        <div className="w-px bg-slate-200 hidden md:block"></div>
        
        <div className="md:w-64 flex flex-col justify-center space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-[12px] font-bold text-slate-600">Worker Status:</span>
            {!queueData.worker_enabled ? (
              <span className="text-[12px] font-black flex items-center gap-1.5 text-amber-600">
                <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                Paused
              </span>
            ) : (
              <span className={cn(
                "text-[12px] font-black flex items-center gap-1.5",
                queueData.worker_running ? "text-emerald-600" : "text-slate-400"
              )}>
                <span className={cn(
                  "w-2 h-2 rounded-full",
                  queueData.worker_running ? "bg-emerald-500 animate-pulse" : "bg-slate-300"
                )}></span>
                {queueData.worker_running ? "Running" : "Idle"}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[12px] font-bold text-slate-600">Last Processed:</span>
            <span className="text-[12px] font-semibold text-slate-800">
              {queueData.last_processed ? new Date(queueData.last_processed).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' }) : "Never"}
            </span>
          </div>
        </div>

        <div className="w-px bg-slate-200 hidden md:block"></div>

        <div className="md:w-auto flex flex-col justify-center">
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">Worker Control</div>
          {queueData.worker_enabled ? (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setPauseDialogOpen(true)}
              className="h-8 text-[11px] font-bold text-slate-700 hover:text-amber-600 border-slate-200"
            >
              Pause Worker
            </Button>
          ) : (
            <Button 
              variant="default" 
              size="sm" 
              onClick={() => toggleWorker(true)}
              disabled={toggling}
              className="h-8 text-[11px] font-bold bg-emerald-600 hover:bg-emerald-700"
            >
              Resume Worker
            </Button>
          )}
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input 
            placeholder="Search by recipient or subject..." 
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1); // Reset to first page on search
            }}
            className="pl-9 h-10 w-full text-sm bg-white border-slate-200 shadow-sm rounded-xl"
          />
        </div>
        <div className="flex items-center gap-3">
          <select
            value={dateFilter}
            onChange={(e) => {
              setDateFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="h-10 text-sm font-semibold rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 px-3 outline-none"
          >
            <option value="all">All Time</option>
            <option value="today">Today</option>
            <option value="7days">Last 7 Days</option>
            <option value="90days">Last 90 Days</option>
          </select>
          <Button onClick={fetchLogs} variant="outline" className="h-10 text-sm font-semibold bg-white border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl">
            <RefreshCcw className="mr-2 h-4 w-4" /> Refresh Logs
          </Button>
        </div>
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
              ) : (
                (() => {
                  if (paginatedLogs.length === 0 && currentPage > 1) {
                    setCurrentPage(1);
                  }

                  return (
                    <>
                      {paginatedLogs.length === 0 ? (
                         <tr><td colSpan={8} className="p-8 text-center text-slate-500">No matching logs found.</td></tr>
                      ) : paginatedLogs.map((log) => (
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
                              (log.status === "Delivered" || log.status === "Sent") ? "bg-emerald-50 text-emerald-600" :
                              log.status === "Pending" ? "bg-slate-100 text-slate-600" :
                              log.status === "Processing" ? "bg-blue-50 text-blue-600" :
                              "bg-red-50 text-red-600"
                            )}>
                              {(log.status === "Delivered" || log.status === "Sent") && <CheckCircle2 className="h-3 w-3" />}
                              {log.status === "Pending" && <Clock className="h-3 w-3" />}
                              {log.status === "Processing" && <RefreshCcw className="h-3 w-3 animate-spin-slow" />}
                              {(log.status === "Failed" || log.status === "Bounced") && <XCircle className="h-3 w-3" />}
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
                    </>
                  );
                })()
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination Controls */}
        {!loading && logs.length > 0 && (
          <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between">
            <div className="text-[12px] font-medium text-slate-500">
              Showing <span className="font-bold text-slate-700">{(currentPage - 1) * 10 + 1}</span> to <span className="font-bold text-slate-700">{Math.min(currentPage * 10, filteredLogs.length)}</span> of <span className="font-bold text-slate-700">{filteredLogs.length}</span> entries
            </div>
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="h-8 px-3 text-[12px] font-bold"
              >
                Previous
              </Button>
              <div className="text-[12px] font-bold text-slate-700 px-2">
                Page {currentPage} of {totalPages}
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage >= totalPages}
                className="h-8 px-3 text-[12px] font-bold"
              >
                Next
              </Button>
            </div>
          </div>
        )}
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
      <Dialog open={pauseDialogOpen} onOpenChange={setPauseDialogOpen}>
        <DialogContent className="sm:max-w-md bg-white rounded-2xl border-0 shadow-2xl p-6">
          <DialogHeader>
            <DialogTitle className="text-xl font-black text-amber-600 flex items-center gap-2">
              <span className="h-8 w-8 rounded-full bg-amber-100 flex items-center justify-center">
                <XCircle className="h-5 w-5 text-amber-600" />
              </span>
              Pause Email Worker
            </DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-3">
            <p className="text-[14px] text-slate-600">
              Are you sure you want to pause the email worker?
            </p>
            <div className="p-3 bg-amber-50 rounded-xl border border-amber-100">
              <p className="text-[13px] font-medium text-amber-800">
                <strong className="block mb-1">⚠ Queued emails will remain safe.</strong>
                No new emails will be sent from the queue until the worker is explicitly resumed.
              </p>
            </div>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setPauseDialogOpen(false)} disabled={toggling} className="font-bold">
              Cancel
            </Button>
            <Button variant="destructive" onClick={() => toggleWorker(false)} disabled={toggling} className="font-bold bg-amber-600 hover:bg-amber-700">
              {toggling ? "Pausing..." : "Pause Worker"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
