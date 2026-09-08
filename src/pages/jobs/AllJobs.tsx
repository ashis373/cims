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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
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
  Power,
  Trash2,
  Copy,
  ExternalLink
} from "lucide-react";
import { cn } from "@/lib/utils";
import { API_BASE_URL } from "@/config/api";
import { getAuthHeaders } from "@/services/candidate-api";



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
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const [recruiterFilter, setRecruiterFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
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
        const res = await fetch(`${API_BASE_URL}/jobs/jobs.php`, {
          credentials: 'include',
          headers: getAuthHeaders(false)
        });
        const data = await res.json();
        if (res.ok && Array.isArray(data)) {
          setJobs(data);
        } else if (!res.ok && data.message) {
          toast.error(data.message);
        }
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
      const res = await fetch(`${API_BASE_URL}/jobs/jobs.php?job_id=${jobId}`, { 
        credentials: 'include', 
        method: "DELETE",
        headers: getAuthHeaders(false)
      });
      const data = await res.json();
      if (res.ok && !data.error && !data.message) {
        setJobs(jobs.filter(j => j.id !== jobId));
        toast.success("Job deleted successfully");
      } else {
        toast.error(data.message || data.error || "Failed to delete job");
      }
    } catch (e) {
      toast.error("Failed to delete job");
    }
    setConfirmDialog(prev => ({ ...prev, isOpen: false }));
  };

  const handleUpdateStatus = async (jobId: string, newStatus: string) => {
    try {
      const res = await fetch(`${API_BASE_URL}/jobs/jobs.php`, { 
        credentials: 'include', 
        method: "PUT",
        headers: getAuthHeaders(true),
        body: JSON.stringify({ job_id: jobId, status: newStatus })
      });
      const data = await res.json();
      if (res.ok && !data.error && !data.message) {
        setJobs(jobs.map(j => j.id === jobId ? { ...j, status: newStatus } : j));
        toast.success(`Job marked as ${newStatus}`);
      } else {
        toast.error(data.message || data.error || "Failed to update status");
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

  const confirmUpdateStatus = (jobId: string, newStatus: string) => {
    setConfirmDialog({
      isOpen: true,
      title: `Mark as ${newStatus}`,
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
    const matchesDept = departmentFilter === "all" || job.department === departmentFilter;
    const matchesRecruiter = recruiterFilter === "all" || job.recruiter_name === recruiterFilter;
    return matchesSearch && matchesStatus && matchesDept && matchesRecruiter;
  });

  const totalPages = Math.ceil(filteredJobs.length / itemsPerPage);
  const paginatedJobs = filteredJobs.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, departmentFilter, recruiterFilter]);

  // Dynamic Departments
  const departmentCounts = jobs.reduce((acc: any, job) => {
    acc[job.department] = (acc[job.department] || 0) + 1;
    return acc;
  }, {});

  // Dynamic Recruiters
  const recruiterCounts = jobs.reduce((acc: any, job) => {
    if (job.recruiter_name) {
      acc[job.recruiter_name] = (acc[job.recruiter_name] || 0) + 1;
    }
    return acc;
  }, {});

  const colors = ["#3b82f6", "#8b5cf6", "#ec4899", "#10b981", "#f59e0b", "#ef4444"];
  const dynamicDepartments = Object.keys(departmentCounts).map((key, index) => ({
    name: key,
    value: totalJobs > 0 ? Math.round((departmentCounts[key] / totalJobs) * 100) : 0,
    count: departmentCounts[key],
    color: colors[index % colors.length]
  })).sort((a, b) => b.value - a.value);

  const recentJobs = [...jobs].reverse().slice(0, 4);
  
  return (
    <div className="flex flex-col gap-6 w-full pb-10">
      {/* Top Banner (Dark Teal / Cyan Gradient) */}
      <div className="relative overflow-hidden rounded-[28px] bg-gradient-to-r from-[#000C22] via-[#0B2524] to-[#0D2823] shadow-lg border border-teal-900/40 p-8 sm:p-10 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="relative z-10 flex flex-col justify-center max-w-xl">
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight mb-2 text-white">Job Openings</h1>
          <p className="text-[#60C042] text-[14px] sm:text-[15px] font-medium leading-relaxed">
            Manage and track all open, paused, and closed job positions across departments.
          </p>
        </div>
        <div className="relative z-10 flex items-center gap-6 self-stretch sm:self-auto justify-between sm:justify-end">
          <Link to="/jobs/create">
            <Button className="rounded-xl font-bold btn-primary hover:opacity-95 px-6 h-11 text-white transition-all shadow-md">
              <Plus className="w-4 h-4 mr-2" />
              Create Job
            </Button>
          </Link>
          <div className="shrink-0 group cursor-pointer">
            <span className="text-7xl drop-shadow-2xl inline-block origin-bottom hover:animate-bounce cursor-default select-none">
              💼
            </span>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-4">
        <TopStat title="Total Jobs" value={isLoading ? "..." : totalJobs} icon={Briefcase} tone="bg-indigo-50 text-indigo-600" borderTone="border-indigo-500" />
        <TopStat title="Open Jobs" value={isLoading ? "..." : openJobs} icon={CheckCircle2} tone="bg-emerald-50 text-emerald-600" borderTone="border-emerald-500" />
        <TopStat title="Closed Jobs" value={isLoading ? "..." : closedJobs} icon={XCircle} tone="bg-slate-50 text-slate-600" borderTone="border-slate-500" />
        <TopStat title="On Hold" value={isLoading ? "..." : onHoldJobs} icon={Clock} tone="bg-amber-50 text-amber-600" borderTone="border-amber-500" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <Card className="p-6 rounded-3xl border-slate-100 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] bg-white flex flex-col justify-center">
          <h3 className="text-[15px] font-bold text-slate-900 mb-4">Jobs by Department</h3>
          <div className="flex flex-col sm:flex-row items-center gap-6 flex-1">
            <div className="h-[150px] w-full sm:w-1/2 relative shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={dynamicDepartments}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={75}
                    paddingAngle={2}
                    dataKey="value"
                    stroke="none"
                  >
                    {dynamicDepartments.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value: any, name: any, props: any) => [`${props.payload.count} Jobs (${value}%)`, name]}
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
            
            <div className="w-full sm:w-1/2 flex flex-col gap-2 max-h-[150px] overflow-y-auto pr-2 custom-scrollbar">
              {dynamicDepartments.map((dept, index) => (
                <div key={index} className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-100/50 hover:bg-slate-100 transition-colors">
                  <div className="flex items-center gap-2 overflow-hidden">
                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: dept.color }} />
                    <span className="text-[11px] font-bold text-slate-700 truncate" title={dept.name}>{dept.name}</span>
                  </div>
                  <span className="text-[12px] font-black text-slate-900 bg-white px-2 py-0.5 rounded-md shadow-sm border border-slate-100 shrink-0">
                    {dept.count}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </Card>

        <Card className="p-6 rounded-3xl border-slate-100 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] bg-white lg:col-span-2 flex flex-col">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-[15px] font-bold text-slate-900">Recently Added Jobs</h3>
            <Button variant="outline" size="sm" className="rounded-xl font-bold border-slate-200 text-slate-600" onClick={() => {
              setSearchTerm('');
              setStatusFilter('all');
              setDepartmentFilter('all');
              setRecruiterFilter('all');
              window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
            }}>
              View All
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {recentJobs.map((job) => (
              <div key={job.id} onClick={() => handleView(job)} className="flex gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-100 hover:bg-white hover:border-indigo-200 hover:shadow-md transition-all cursor-pointer group">
                <div className="h-10 w-10 shrink-0 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100 group-hover:bg-indigo-50 group-hover:text-indigo-600 group-hover:border-indigo-200 transition-colors">
                  <Briefcase className="h-4 w-4" />
                </div>
                <div className="flex-1 overflow-hidden">
                  <h4 className="text-[13px] font-bold text-slate-900 leading-tight truncate group-hover:text-indigo-700 transition-colors">{job.title}</h4>
                  <p className="text-[11px] font-semibold text-slate-500 mt-1 truncate">{job.department} • {job.location}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="flex flex-col gap-6 items-start w-full">
        <Card className="w-full rounded-3xl border-slate-100 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] overflow-hidden flex flex-col">
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
              <Select value={recruiterFilter} onValueChange={setRecruiterFilter}>
                <SelectTrigger className="w-full sm:w-[150px] h-10 rounded-xl bg-slate-50 border-slate-200 text-[13px] font-bold">
                  <SelectValue placeholder="Recruiter" />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectItem value="all">All Recruiters</SelectItem>
                  {Object.keys(recruiterCounts).sort().map((recruiter) => (
                    <SelectItem key={recruiter} value={recruiter}>{recruiter}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                <SelectTrigger className="w-full sm:w-[170px] h-10 rounded-xl bg-slate-50 border-slate-200 text-[13px] font-bold">
                  <SelectValue placeholder="Department" />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectItem value="all">All Departments</SelectItem>
                  {Object.keys(departmentCounts).map((dept) => (
                    <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
                  <th className="px-6 py-4">Department & Type</th>
                  <th className="px-6 py-4">Location</th>
                  <th className="px-6 py-4">Experience & Salary</th>
                  <th className="px-6 py-4">Stats</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Author & Recruiter</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {isLoading ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-10 text-center text-slate-500 font-medium">Loading jobs...</td>
                  </tr>
                ) : filteredJobs.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-10 text-center text-slate-500 font-medium">No jobs found.</td>
                  </tr>
                ) : (
                  paginatedJobs.map((job) => (
                    <tr key={job.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-900">{job.title}</div>
                      <div className="text-slate-500 text-xs mt-0.5">{job.id}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-slate-700">{job.department}</div>
                      <div className="text-slate-500 text-[11px] font-bold mt-0.5">{job.job_type} • {job.work_mode}</div>
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-600">{job.location}</td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-slate-700">{job.min_exp}-{job.max_exp} Years</div>
                      <div className="text-slate-500 text-[11px] font-bold mt-0.5">₹{job.min_salary} - ₹{job.max_salary}</div>
                    </td>
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
                      <div className="font-bold text-slate-700" title="Created By">👤 {job.author}</div>
                      {job.recruiter_name && <div className="text-blue-600 text-[11px] font-bold mt-1" title="Assigned Recruiter">🎯 {job.recruiter_name}</div>}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 text-[12px] font-bold text-slate-500 hover:text-indigo-600">
                            View &middot; Edit &middot; More
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="rounded-xl border-border/40 w-48">
                          <DropdownMenuItem onClick={() => handleView(job)} className="cursor-pointer font-medium">
                            <Eye className="h-4 w-4 mr-2 text-slate-400" /> View Details
                          </DropdownMenuItem>
                          
                          <Link to={`/jobs/edit/${job.id}`}>
                            <DropdownMenuItem className="cursor-pointer font-medium">
                              <Edit className="h-4 w-4 mr-2 text-slate-400" /> Edit Job
                            </DropdownMenuItem>
                          </Link>
                          
                          <DropdownMenuItem className="cursor-pointer font-medium text-slate-600">
                            <Copy className="h-4 w-4 mr-2 text-slate-400" /> Duplicate Job
                          </DropdownMenuItem>
                          
                          <DropdownMenuSeparator />
                          
                          {job.status !== 'Closed' && (
                            <DropdownMenuItem onClick={() => confirmUpdateStatus(job.id, 'Closed')} className="cursor-pointer font-medium text-slate-600">
                              <CheckCircle2 className="h-4 w-4 mr-2 text-slate-400" /> Mark as Closed
                            </DropdownMenuItem>
                          )}
                          {job.status !== 'On Hold' && (
                            <DropdownMenuItem onClick={() => confirmUpdateStatus(job.id, 'On Hold')} className="cursor-pointer font-medium text-slate-600">
                              <Clock className="h-4 w-4 mr-2 text-slate-400" /> Mark as On Hold
                            </DropdownMenuItem>
                          )}
                          {job.status !== 'Open' && (
                            <DropdownMenuItem onClick={() => confirmUpdateStatus(job.id, 'Open')} className="cursor-pointer font-medium text-slate-600">
                              <Briefcase className="h-4 w-4 mr-2 text-slate-400" /> Mark as Open
                            </DropdownMenuItem>
                          )}

                          <DropdownMenuSeparator />
                          
                          <DropdownMenuItem onClick={() => confirmDelete(job.id)} className="cursor-pointer font-medium text-rose-600 focus:text-rose-700 focus:bg-rose-50">
                            <Trash2 className="h-4 w-4 mr-2 text-rose-500" /> Delete Job
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                )))}
              </tbody>
            </table>
          </div>
          
          <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
            <span className="text-[13px] font-bold text-slate-500">
              Showing {filteredJobs.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0} to {Math.min(currentPage * itemsPerPage, filteredJobs.length)} of {filteredJobs.length} entries
            </span>
            <div className="flex items-center gap-1.5">
              <Button 
                variant="outline" 
                size="sm" 
                className="rounded-xl h-8.5 px-3 text-xs font-bold border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors" 
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              >
                Previous
              </Button>
              
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <Button 
                  key={page}
                  variant="outline" 
                  size="sm" 
                  className={cn(
                    "rounded-xl h-8.5 w-8.5 p-0 text-xs font-black transition-all",
                    currentPage === page 
                      ? "bg-gradient-to-br from-[#42bc24] to-[#36961c] text-white border-transparent shadow-md shadow-[#42bc24]/30 hover:brightness-105" 
                      : "border-slate-200 text-slate-600 hover:bg-slate-100"
                  )}
                  onClick={() => setCurrentPage(page)}
                >
                  {page}
                </Button>
              ))}

              <Button 
                variant="outline" 
                size="sm" 
                className="rounded-xl h-8.5 px-3 text-xs font-bold border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors"
                disabled={currentPage === totalPages || totalPages === 0}
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              >
                Next
              </Button>
            </div>
          </div>
        </Card>
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
                    <p className="font-semibold text-slate-700">₹{selectedJob.min_salary || 0} - ₹{selectedJob.max_salary || 0}</p>
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
                  {selectedJob.recruiter_name && (
                    <div>
                      <p className="text-[11px] uppercase font-bold text-slate-400 mb-1">Assigned Recruiter</p>
                      <p className="font-semibold text-slate-700">{selectedJob.recruiter_name}</p>
                    </div>
                  )}
                </div>

                {selectedJob.description && (
                  <div className="mb-6">
                    <p className="text-[11px] uppercase font-bold text-slate-400 mb-2">Job Description</p>
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">
                      {selectedJob.description}
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
