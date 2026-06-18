import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { 
  Briefcase, 
  Search, 
  Filter, 
  MoreVertical, 
  Plus, 
  CheckCircle2, 
  Clock, 
  XCircle,
  Eye,
  Edit,
  Power
} from "lucide-react";
import { cn } from "@/lib/utils";
import { API_BASE_URL } from "@/config/api";



interface TopStatProps {
  title: string;
  value: number | string;
  pct?: number;
  icon: any;
  tone: string;
  pctTone?: string;
  borderTone: string;
}

function TopStat({ title, value, pct, icon: Icon, tone, pctTone, borderTone }: TopStatProps) {
  return (
    <Card
      className={cn(
        "p-5 bg-white shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] rounded-3xl relative overflow-hidden group border-t-[3px] flex-1 min-w-[160px]",
        borderTone,
      )}
    >
      <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-gradient-to-br from-transparent to-black/[0.02] rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500" />
      <div className="flex items-start justify-between relative z-10">
        <div>
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
            {title}
          </div>
          <div className="text-3xl font-black tracking-tight text-slate-900">{value}</div>
          {pct !== undefined && <div className={cn("mt-1.5 text-[10px] font-bold", pctTone)}>+{pct}% this month</div>}
        </div>
        <div
          className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl", tone)}
        >
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </Card>
  );
}

const getStatusBadge = (status: string) => {
  switch (status) {
    case "Open":
      return "bg-emerald-50 text-emerald-600 border-emerald-200 ring-emerald-500/20";
    case "Closed":
      return "bg-slate-50 text-slate-600 border-slate-200 ring-slate-500/20";
    case "On Hold":
      return "bg-amber-50 text-amber-600 border-amber-200 ring-amber-500/20";
    case "Filled":
      return "bg-blue-50 text-blue-600 border-blue-200 ring-blue-500/20";
    default:
      return "bg-slate-50 text-slate-600 border-slate-200 ring-slate-500/20";
  }
};

export default function AllJobs() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [jobs, setJobs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedJob, setSelectedJob] = useState<any>(null);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
    action: () => void;
    actionText: string;
    variant: "default" | "destructive";
  }>({
    isOpen: false,
    title: "",
    description: "",
    action: () => {},
    actionText: "Confirm",
    variant: "default"
  });

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/jobs.php`);
        const data = await res.json();
        setJobs(data);
      } catch (err) {
        console.error("Failed to fetch jobs", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchJobs();
  }, []);

  const handleDelete = async (jobId: string) => {
    try {
      const res = await fetch(`${API_BASE_URL}/jobs.php?job_id=${jobId}`, {
        method: "DELETE"
      });
      if (res.ok) {
        setJobs(jobs.filter(j => j.id !== jobId));
        toast.success("Job deleted successfully");
      }
    } catch (e) {
      toast.error("Failed to delete job");
    }
    setConfirmDialog(prev => ({ ...prev, isOpen: false }));
  };

  const handleUpdateStatus = async (jobId: string, newStatus: string) => {
    try {
      const res = await fetch(`${API_BASE_URL}/jobs.php`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ job_id: jobId, status: newStatus })
      });
      if (res.ok) {
        setJobs(jobs.map(j => j.id === jobId ? { ...j, status: newStatus } : j));
        toast.success(`Job marked as ${newStatus}`);
      }
    } catch (e) {
      toast.error("Failed to update status");
    }
    setConfirmDialog(prev => ({ ...prev, isOpen: false }));
  };

  const confirmDelete = (jobId: string) => {
    setConfirmDialog({
      isOpen: true,
      title: "Delete Job",
      description: "Are you sure you want to delete this job? This action cannot be undone.",
      action: () => handleDelete(jobId),
      actionText: "Delete",
      variant: "destructive"
    });
  };

  const confirmUpdateStatus = (jobId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'Open' ? 'Closed' : 'Open';
    setConfirmDialog({
      isOpen: true,
      title: "Update Job Status",
      description: `Are you sure you want to change the status of this job to ${newStatus}?`,
      action: () => handleUpdateStatus(jobId, newStatus),
      actionText: "Update Status",
      variant: "default"
    });
  };

  const handleView = (job: any) => {
    setSelectedJob(job);
    setIsViewOpen(true);
  };

  // Compute dynamic stats
  const totalJobs = jobs.length;
  const openJobs = jobs.filter(j => j.status === "Open").length;
  const closedJobs = jobs.filter(j => j.status === "Closed").length;
  const onHoldJobs = jobs.filter(j => j.status === "On Hold").length;
  const filledJobs = jobs.filter(j => j.status === "Filled").length;

  // Filter jobs for table
  const filteredJobs = jobs.filter(job => {
    const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) || job.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || job.status.toLowerCase() === statusFilter.toLowerCase();
    return matchesSearch && matchesStatus;
  });

  // Dynamic Departments
  const departmentCounts = jobs.reduce((acc: any, job) => {
    acc[job.department] = (acc[job.department] || 0) + 1;
    return acc;
  }, {});

  const colors = ["#3b82f6", "#8b5cf6", "#ec4899", "#10b981", "#f59e0b", "#ef4444"];
  const dynamicDepartments = Object.keys(departmentCounts).map((key, index) => ({
    name: key,
    value: totalJobs > 0 ? Math.round((departmentCounts[key] / totalJobs) * 100) : 0,
    count: departmentCounts[key],
    color: colors[index % colors.length]
  })).sort((a, b) => b.value - a.value);

  const recentJobs = [...jobs].reverse().slice(0, 3);
  
  return (
    <div className="flex flex-col gap-6 w-full pb-10">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 relative overflow-hidden rounded-3xl bg-white shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border border-slate-100 p-8 sm:p-10">
        <div className="flex items-center gap-5 relative z-10">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl shadow-sm border bg-blue-50 border-blue-100 text-blue-600">
            <Briefcase className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">Job Openings</h1>
            <p className="text-slate-500 text-[13px] sm:text-[14px] font-medium mt-1.5 max-w-lg leading-relaxed">
              Manage and track all open, paused, and closed job positions across departments.
            </p>
          </div>
        </div>
        <Link to="/jobs/create">
          <Button className="rounded-xl font-bold bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-600/20 px-6 h-11">
            <Plus className="w-4 h-4 mr-2" />
            Create Job
          </Button>
        </Link>
      </div>

      <div className="flex flex-wrap gap-4">
        <TopStat title="Total Jobs" value={isLoading ? "..." : totalJobs} icon={Briefcase} tone="bg-indigo-50 text-indigo-600" borderTone="border-indigo-500" />
        <TopStat title="Open Jobs" value={isLoading ? "..." : openJobs} icon={CheckCircle2} tone="bg-emerald-50 text-emerald-600" borderTone="border-emerald-500" />
        <TopStat title="Closed Jobs" value={isLoading ? "..." : closedJobs} icon={XCircle} tone="bg-slate-50 text-slate-600" borderTone="border-slate-500" />
        <TopStat title="On Hold" value={isLoading ? "..." : onHoldJobs} icon={Clock} tone="bg-amber-50 text-amber-600" borderTone="border-amber-500" />
        <TopStat title="Filled Jobs" value={isLoading ? "..." : filledJobs} icon={Briefcase} tone="bg-blue-50 text-blue-600" borderTone="border-blue-500" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 items-start">
        <Card className="xl:col-span-3 rounded-3xl border-slate-100 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] overflow-hidden flex flex-col">
          <div className="p-5 border-b border-slate-100 bg-white flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="relative w-full sm:max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search jobs by title or ID..."
                className="pl-9 h-10 rounded-xl bg-slate-50 border-slate-200 text-sm font-medium focus-visible:ring-indigo-500 w-full"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-[140px] h-10 rounded-xl bg-slate-50 border-slate-200 text-[13px] font-bold">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="open">Open</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
                  <SelectItem value="hold">On Hold</SelectItem>
                  <SelectItem value="filled">Filled</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" className="rounded-xl h-10 px-4 font-bold border-slate-200 text-slate-600 hover:bg-slate-50 shrink-0">
                <Filter className="h-4 w-4 mr-2" />
                More Filters
              </Button>
            </div>
          </div>
          
          <div className="overflow-x-auto w-full bg-white">
            <table className="w-full text-left text-[13px]">
              <thead className="bg-slate-50/50 text-slate-500 font-bold border-b border-slate-100">
                <tr>
                  <th className="px-6 py-4">Job Title</th>
                  <th className="px-6 py-4">Department</th>
                  <th className="px-6 py-4">Location</th>
                  <th className="px-6 py-4">Stats</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Created By</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {isLoading ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-10 text-center text-slate-500 font-medium">Loading jobs...</td>
                  </tr>
                ) : filteredJobs.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-10 text-center text-slate-500 font-medium">No jobs found.</td>
                  </tr>
                ) : (
                  filteredJobs.map((job) => (
                    <tr key={job.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-900">{job.title}</div>
                      <div className="text-slate-500 text-xs mt-0.5">{job.id}</div>
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-600">{job.department}</td>
                    <td className="px-6 py-4 font-medium text-slate-600">{job.location}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="text-center">
                          <div className="font-bold text-slate-900">{job.openings}</div>
                          <div className="text-[10px] uppercase font-bold text-slate-400">Openings</div>
                        </div>
                        <div className="w-px h-6 bg-slate-200" />
                        <div className="text-center">
                          <div className="font-bold text-slate-900">{job.applications}</div>
                          <div className="text-[10px] uppercase font-bold text-slate-400">Apps</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={cn(
                        "inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-bold border ring-1 ring-inset",
                        getStatusBadge(job.status)
                      )}>
                        {job.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-700">{job.author}</div>
                      <div className="text-slate-500 text-xs mt-0.5">{job.date}</div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50" onClick={() => handleView(job)} title="View Details">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50" onClick={() => confirmUpdateStatus(job.id, job.status)} title="Toggle Status">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50" onClick={() => confirmDelete(job.id)} title="Delete Job">
                          <Power className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                )))}
              </tbody>
            </table>
          </div>
          
          <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
            <span className="text-[13px] font-bold text-slate-500">Showing {filteredJobs.length > 0 ? 1 : 0} to {filteredJobs.length} of {totalJobs} entries</span>
            <div className="flex gap-1">
              <Button variant="outline" size="sm" className="rounded-lg h-8 text-xs font-bold" disabled>Previous</Button>
              <Button variant="outline" size="sm" className="rounded-lg h-8 w-8 p-0 text-xs font-bold bg-indigo-600 text-white border-indigo-600 hover:bg-indigo-700 hover:text-white">1</Button>
              <Button variant="outline" size="sm" className="rounded-lg h-8 w-8 p-0 text-xs font-bold">2</Button>
              <Button variant="outline" size="sm" className="rounded-lg h-8 w-8 p-0 text-xs font-bold">3</Button>
              <Button variant="outline" size="sm" className="rounded-lg h-8 text-xs font-bold">Next</Button>
            </div>
          </div>
        </Card>

        <div className="xl:col-span-1 flex flex-col gap-6">
          <Card className="p-6 rounded-3xl border-slate-100 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] bg-white">
            <h3 className="text-[15px] font-bold text-slate-900 mb-6">Jobs by Department</h3>
            <div className="h-[200px] w-full relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={dynamicDepartments}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="value"
                    stroke="none"
                  >
                    {dynamicDepartments.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px -5px rgba(0,0,0,0.1)' }}
                    itemStyle={{ fontWeight: 'bold' }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-2xl font-black text-slate-900">{totalJobs}</span>
                <span className="text-[10px] uppercase font-bold text-slate-400">Total</span>
              </div>
            </div>
            <div className="mt-6 flex flex-col gap-3">
              {dynamicDepartments.slice(0, 4).map((dept) => (
                <div key={dept.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: dept.color }} />
                    <span className="text-[13px] font-bold text-slate-600">{dept.name}</span>
                  </div>
                  <span className="text-[13px] font-black text-slate-900">{dept.value}%</span>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-6 rounded-3xl border-slate-100 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] bg-white">
            <h3 className="text-[15px] font-bold text-slate-900 mb-5">Recently Added</h3>
            <div className="flex flex-col gap-4">
              {recentJobs.map((job) => (
                <div key={job.id} className="flex gap-3">
                  <div className="h-10 w-10 shrink-0 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
                    <Briefcase className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="text-[13px] font-bold text-slate-900 leading-tight">{job.title}</h4>
                    <p className="text-[11px] font-semibold text-slate-500 mt-1">{job.department} • {job.location}</p>
                  </div>
                </div>
              ))}
            </div>
            <Button variant="outline" className="w-full mt-6 rounded-xl font-bold border-slate-200 text-slate-600">
              View All Recent
            </Button>
          </Card>
        </div>
      </div>

      <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
        <DialogContent className="sm:max-w-[600px] rounded-3xl p-0 overflow-hidden border-slate-100 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] gap-0">
          <DialogHeader className="sr-only">
            <DialogTitle>Job Details</DialogTitle>
            <DialogDescription>View full job details</DialogDescription>
          </DialogHeader>
          {selectedJob && (
            <>
              <div className="bg-slate-50 p-6 sm:p-8 border-b border-slate-100 flex items-start justify-between">
                <div>
                  <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">{selectedJob.title}</h2>
                  <p className="text-slate-500 font-medium text-sm mt-1">{selectedJob.id} • {selectedJob.department}</p>
                </div>
                <span className={cn(
                  "inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-bold border ring-1 ring-inset shrink-0",
                  getStatusBadge(selectedJob.status)
                )}>
                  {selectedJob.status}
                </span>
              </div>
              <div className="p-6 sm:p-8 overflow-y-auto max-h-[70vh]">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 mb-8">
                  <div>
                    <p className="text-[11px] uppercase font-bold text-slate-400 mb-1">Location</p>
                    <p className="font-semibold text-slate-700">{selectedJob.location}</p>
                  </div>
                  <div>
                    <p className="text-[11px] uppercase font-bold text-slate-400 mb-1">Openings</p>
                    <p className="font-semibold text-slate-700">{selectedJob.openings}</p>
                  </div>
                  <div>
                    <p className="text-[11px] uppercase font-bold text-slate-400 mb-1">Job Type</p>
                    <p className="font-semibold text-slate-700">{selectedJob.job_type || 'Full Time'}</p>
                  </div>
                  <div>
                    <p className="text-[11px] uppercase font-bold text-slate-400 mb-1">Work Mode</p>
                    <p className="font-semibold text-slate-700">{selectedJob.work_mode || 'Hybrid'}</p>
                  </div>
                  <div>
                    <p className="text-[11px] uppercase font-bold text-slate-400 mb-1">Experience</p>
                    <p className="font-semibold text-slate-700">{selectedJob.min_exp || 0} - {selectedJob.max_exp || 0} Years</p>
                  </div>
                  <div>
                    <p className="text-[11px] uppercase font-bold text-slate-400 mb-1">Salary Range</p>
                    <p className="font-semibold text-slate-700">${selectedJob.min_salary || 0} - ${selectedJob.max_salary || 0}</p>
                  </div>
                  <div>
                    <p className="text-[11px] uppercase font-bold text-slate-400 mb-1">Target Date</p>
                    <p className="font-semibold text-slate-700">{selectedJob.target_date || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-[11px] uppercase font-bold text-slate-400 mb-1">Priority</p>
                    <p className="font-semibold text-slate-700">{selectedJob.priority || 'Medium'}</p>
                  </div>
                  <div>
                    <p className="text-[11px] uppercase font-bold text-slate-400 mb-1">Created By</p>
                    <p className="font-semibold text-slate-700">{selectedJob.author}</p>
                  </div>
                </div>

                {selectedJob.description && (
                  <div className="mb-6">
                    <p className="text-[11px] uppercase font-bold text-slate-400 mb-2">Job Description</p>
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">
                      {selectedJob.description}
                    </div>
                  </div>
                )}

                {selectedJob.internal_notes && (
                  <div>
                    <p className="text-[11px] uppercase font-bold text-slate-400 mb-2">Internal Notes</p>
                    <div className="bg-amber-50 p-4 rounded-xl border border-amber-100 text-sm text-amber-800 whitespace-pre-wrap leading-relaxed">
                      {selectedJob.internal_notes}
                    </div>
                  </div>
                )}

                <div className="mt-8 flex justify-end gap-3 pt-6 border-t border-slate-100">
                  <Button variant="outline" className="rounded-xl font-bold border-slate-200 text-slate-600 h-10 px-6" onClick={() => setIsViewOpen(false)}>
                    Close
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={confirmDialog.isOpen} onOpenChange={(open) => !open && setConfirmDialog(prev => ({ ...prev, isOpen: false }))}>
        <AlertDialogContent className="rounded-3xl">
          <AlertDialogHeader>
            <AlertDialogTitle>{confirmDialog.title}</AlertDialogTitle>
            <AlertDialogDescription>{confirmDialog.description}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={(e) => {
                e.preventDefault();
                confirmDialog.action();
              }}
              className={cn(
                "rounded-xl",
                confirmDialog.variant === "destructive" ? "bg-rose-600 hover:bg-rose-700 text-white" : "bg-blue-600 hover:bg-blue-700 text-white"
              )}
            >
              {confirmDialog.actionText}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
