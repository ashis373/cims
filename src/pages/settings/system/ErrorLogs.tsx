import { useState, useEffect } from "react";
import { API_BASE_URL } from "@/config/api";
import { RefreshCw, Trash2, AlertTriangle, Bug } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export default function ErrorLogs() {
  const [logs, setLogs] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchLogs = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    
    try {
      const res = await fetch(`${API_BASE_URL}/system/error_logs.php`);
      const data = await res.json();
      
      if (res.ok) {
        setLogs(data.logs || "");
        setError(null);
      } else {
        setError(data.message || "Failed to fetch logs");
      }
    } catch (err) {
      setError("Network error occurred while fetching logs");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const clearLogs = async () => {
    if (!confirm("Are you sure you want to clear all error logs?")) return;
    
    setRefreshing(true);
    try {
      const res = await fetch(`${API_BASE_URL}/system/error_logs.php`, {
        method: 'DELETE'
      });
      const data = await res.json();
      
      if (res.ok) {
        setLogs("");
      } else {
        setError(data.message || "Failed to clear logs");
      }
    } catch (err) {
      setError("Network error occurred while clearing logs");
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  return (
    <div className="flex flex-col gap-6 w-full max-w-6xl mx-auto pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <Bug className="h-6 w-6 text-red-500" />
            System Error Logs
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            View raw backend errors, exceptions, and warnings captured in production.
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <button
            onClick={() => fetchLogs(true)}
            disabled={refreshing || loading}
            className="h-10 px-4 bg-white border border-slate-200 rounded-lg text-sm font-semibold text-slate-700 flex items-center gap-2 hover:bg-slate-50 transition-colors shadow-sm disabled:opacity-50"
          >
            <RefreshCw className={cn("h-4 w-4", refreshing && "animate-spin")} /> 
            Refresh
          </button>
          
          <button
            onClick={clearLogs}
            disabled={loading || refreshing || !logs}
            className="h-10 px-4 bg-red-50 border border-red-200 rounded-lg text-sm font-semibold text-red-600 flex items-center gap-2 hover:bg-red-100 transition-colors shadow-sm disabled:opacity-50"
          >
            <Trash2 className="h-4 w-4" /> 
            Clear Logs
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
          <div className="text-sm font-medium text-red-800">{error}</div>
        </div>
      )}

      <div className="bg-[#1E1E1E] border border-slate-800 rounded-xl shadow-lg overflow-hidden flex flex-col min-h-[500px]">
        <div className="px-4 py-3 bg-[#2D2D2D] border-b border-[#404040] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500" />
            <div className="w-3 h-3 rounded-full bg-yellow-500" />
            <div className="w-3 h-3 rounded-full bg-green-500" />
          </div>
          <span className="text-xs font-medium text-slate-400 font-mono">api/error.log</span>
        </div>
        
        <div className="p-4 flex-1 overflow-auto bg-[#1E1E1E]">
          {loading ? (
            <div className="space-y-2">
              <Skeleton className="h-4 w-3/4 bg-slate-800" />
              <Skeleton className="h-4 w-1/2 bg-slate-800" />
              <Skeleton className="h-4 w-5/6 bg-slate-800" />
              <Skeleton className="h-4 w-2/3 bg-slate-800" />
            </div>
          ) : logs ? (
            <pre className="text-xs text-green-400 font-mono whitespace-pre-wrap leading-relaxed break-all">
              {logs}
            </pre>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-slate-500 gap-3 py-20">
              <CheckCircle className="h-10 w-10 text-slate-600" />
              <p className="text-sm font-medium">No errors recorded! System is healthy.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function CheckCircle(props: any) {
  return (
    <svg
      {...props}
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  );
}
