import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { API_BASE_URL } from "@/config/api";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Briefcase, ArrowLeft, Save, Building2, Users, MapPin } from "lucide-react";

export default function CreateJob() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dbDepartments, setDbDepartments] = useState<any[]>([]);

  useEffect(() => {
    const fetchDepts = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/departments.php`);
        const data = await res.json();
        if (Array.isArray(data)) setDbDepartments(data);
      } catch (e) {
        console.error("Failed to fetch departments", e);
      }
    };
    fetchDepts();
  }, []);

  const [formData, setFormData] = useState({
    title: "",
    department: "software development",
    location: "",
    openings: "" as number | string,
    author: "Admin",
    job_type: "Full Time",
    work_mode: "Hybrid",
    min_exp: 0,
    max_exp: 0,
    min_salary: 0,
    max_salary: 0,
    description: "",
    target_date: "",
    priority: "Medium",
    internal_notes: ""
  });

  const handleSubmit = async () => {
    if (!formData.title || !formData.openings || !formData.author) {
      toast.error("Please fill in all mandatory fields.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch(`${API_BASE_URL}/jobs.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });

      const data = await res.json();
      if (res.ok && data.success) {
        toast.success("Job created successfully!");
        navigate("/jobs/all");
      } else {
        toast.error(data.error || "Failed to create job.");
      }
    } catch (e) {
      toast.error("Network error. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 w-full pb-10">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 relative overflow-hidden rounded-3xl bg-white shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border border-slate-100 p-8 sm:p-10">
        <div className="flex items-center gap-5 relative z-10">
          <Link to="/jobs/all">
            <Button variant="outline" size="icon" className="h-14 w-14 rounded-2xl border-slate-200 text-slate-500 hover:text-slate-900 hover:bg-slate-50">
              <ArrowLeft className="h-6 w-6" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">Create Job</h1>
            <p className="text-slate-500 text-[13px] sm:text-[14px] font-medium mt-1.5 max-w-lg leading-relaxed">
              Add a new position to your organization's recruitment pipeline.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 relative z-10 w-full sm:w-auto">
          <Link to="/jobs/all" className="w-full sm:w-auto">
            <Button variant="outline" className="w-full sm:w-auto rounded-xl font-bold border-slate-200 text-slate-600 h-11 px-6">
              Cancel
            </Button>
          </Link>
          <Button onClick={handleSubmit} disabled={isSubmitting} className="w-full sm:w-auto rounded-xl font-bold bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-600/20 h-11 px-6">
            <Save className="w-4 h-4 mr-2" />
            {isSubmitting ? "Creating..." : "Create Job"}
          </Button>
        </div>
      </div>

      <div className="flex flex-col gap-6 items-start w-full">
        <div className="flex flex-col gap-6 w-full">
          <Card className="p-8 rounded-3xl border-slate-100 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] bg-white">
            <div className="flex items-center gap-3 mb-8">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                <Briefcase className="h-5 w-5" />
              </div>
              <h2 className="text-lg font-black text-slate-900">Job Details</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2 md:col-span-2">
                <label className="text-[13px] font-bold text-slate-700">Job Title <span className="text-rose-500">*</span></label>
                <Input value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} placeholder="e.g. Senior Frontend Engineer" className="h-11 rounded-xl bg-slate-50 border-slate-200 focus-visible:ring-indigo-500 font-medium" />
              </div>

              <div className="space-y-2">
                <label className="text-[13px] font-bold text-slate-700">Department</label>
                <Select value={formData.department} onValueChange={v => setFormData({ ...formData, department: v })}>
                  <SelectTrigger className="h-11 rounded-xl bg-slate-50 border-slate-200 font-medium">
                    <SelectValue placeholder="Select Department" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    {dbDepartments.length > 0 ? (
                      dbDepartments.map((d) => (
                        <SelectItem key={d.id} value={d.name}>{d.name}</SelectItem>
                      ))
                    ) : (
                      <>
                        <SelectItem value="Elearning">Elearning</SelectItem>
                        <SelectItem value="software development">Software Development</SelectItem>
                        <SelectItem value="multimedia design">Multimedia Design</SelectItem>
                        <SelectItem value="QA testing">QA Testing</SelectItem>
                        <SelectItem value="Digital Marketing">Digital Marketing</SelectItem>
                        <SelectItem value="Business Development">Business Development</SelectItem>
                      </>
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-[13px] font-bold text-slate-700">Job Location</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input value={formData.location} onChange={e => setFormData({ ...formData, location: e.target.value })} placeholder="e.g. San Francisco, CA" className="pl-10 h-11 rounded-xl bg-slate-50 border-slate-200 focus-visible:ring-indigo-500 font-medium" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[13px] font-bold text-slate-700">Number of Openings <span className="text-rose-500">*</span></label>
                <div className="relative">
                  <Users className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input value={formData.openings} onChange={e => setFormData({ ...formData, openings: e.target.value ? parseInt(e.target.value) : "" })} type="number" min="1" placeholder="1" className="pl-10 h-11 rounded-xl bg-slate-50 border-slate-200 focus-visible:ring-indigo-500 font-medium" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[13px] font-bold text-slate-700">Job Type</label>
                <Select value={formData.job_type} onValueChange={v => setFormData({ ...formData, job_type: v })}>
                  <SelectTrigger className="h-11 rounded-xl bg-slate-50 border-slate-200 font-medium">
                    <SelectValue placeholder="Select Type" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    <SelectItem value="Full Time">Full Time</SelectItem>
                    <SelectItem value="Part Time">Part Time</SelectItem>
                    <SelectItem value="Contract">Contract</SelectItem>
                    <SelectItem value="Internship">Internship</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-[13px] font-bold text-slate-700">Work Mode</label>
                <Select value={formData.work_mode} onValueChange={v => setFormData({ ...formData, work_mode: v })}>
                  <SelectTrigger className="h-11 rounded-xl bg-slate-50 border-slate-200 font-medium">
                    <SelectValue placeholder="Select Mode" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    <SelectItem value="On-site">On-site</SelectItem>
                    <SelectItem value="Remote">Remote</SelectItem>
                    <SelectItem value="Hybrid">Hybrid</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-[13px] font-bold text-slate-700">Experience Required (Years)</label>
                <div className="flex gap-3">
                  <Input value={formData.min_exp || ''} onChange={e => setFormData({ ...formData, min_exp: parseInt(e.target.value) || 0 })} type="number" min="0" placeholder="Min" className="h-11 rounded-xl bg-slate-50 border-slate-200 focus-visible:ring-indigo-500 font-medium w-full" />
                  <Input value={formData.max_exp || ''} onChange={e => setFormData({ ...formData, max_exp: parseInt(e.target.value) || 0 })} type="number" min="0" placeholder="Max" className="h-11 rounded-xl bg-slate-50 border-slate-200 focus-visible:ring-indigo-500 font-medium w-full" />
                </div>
              </div>

              <div className="space-y-2 md:col-span-2">
                <label className="text-[13px] font-bold text-slate-700">Salary Range (CTC)</label>
                <div className="flex gap-3">
                  <div className="relative w-full">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">$</span>
                    <Input value={formData.min_salary || ''} onChange={e => setFormData({ ...formData, min_salary: parseInt(e.target.value) || 0 })} type="number" placeholder="Min Salary" className="pl-8 h-11 rounded-xl bg-slate-50 border-slate-200 focus-visible:ring-indigo-500 font-medium w-full" />
                  </div>
                  <div className="relative w-full">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">$</span>
                    <Input value={formData.max_salary || ''} onChange={e => setFormData({ ...formData, max_salary: parseInt(e.target.value) || 0 })} type="number" placeholder="Max Salary" className="pl-8 h-11 rounded-xl bg-slate-50 border-slate-200 focus-visible:ring-indigo-500 font-medium w-full" />
                  </div>
                </div>
              </div>

              <div className="space-y-2 md:col-span-2">
                <label className="text-[13px] font-bold text-slate-700">Job Description</label>
                <Textarea
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Enter detailed job description, responsibilities, and requirements..."
                  className="min-h-[160px] rounded-xl bg-slate-50 border-slate-200 focus-visible:ring-indigo-500 font-medium p-4"
                />
              </div>
            </div>
          </Card>
        </div>

        <div className="flex flex-col gap-6 w-full">
          <Card className="p-8 rounded-3xl border-slate-100 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] bg-white">
            <div className="flex items-center gap-3 mb-8">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                <Building2 className="h-5 w-5" />
              </div>
              <h2 className="text-lg font-black text-slate-900">Recruitment Details</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="space-y-2">
                <label className="text-[13px] font-bold text-slate-700">Assigned Recruiter <span className="text-rose-500">*</span></label>
                <Select>
                  <SelectTrigger className="h-11 rounded-xl bg-slate-50 border-slate-200 font-medium">
                    <SelectValue placeholder="Select Recruiter" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    <SelectItem value="john">John Doe</SelectItem>
                    <SelectItem value="sarah">Sarah Smith</SelectItem>
                    <SelectItem value="mike">Mike Johnson</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-[13px] font-bold text-slate-700">Target Closure Date</label>
                <Input value={formData.target_date} onChange={e => setFormData({ ...formData, target_date: e.target.value })} type="date" className="h-11 rounded-xl bg-slate-50 border-slate-200 focus-visible:ring-indigo-500 font-medium" />
              </div>

              <div className="space-y-2">
                <label className="text-[13px] font-bold text-slate-700">Priority</label>
                <Select value={formData.priority} onValueChange={v => setFormData({ ...formData, priority: v })}>
                  <SelectTrigger className="h-11 rounded-xl bg-slate-50 border-slate-200 font-medium">
                    <SelectValue placeholder="Select Priority" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    <SelectItem value="High">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-rose-500" />
                        <span className="font-bold text-slate-700">High Priority</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="Medium">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-amber-500" />
                        <span className="font-bold text-slate-700">Medium Priority</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="Low">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-emerald-500" />
                        <span className="font-bold text-slate-700">Low Priority</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2 md:col-span-2 lg:col-span-3">
                <label className="text-[13px] font-bold text-slate-700">Internal Notes</label>
                <Textarea
                  value={formData.internal_notes}
                  onChange={e => setFormData({ ...formData, internal_notes: e.target.value })}
                  placeholder="Any internal notes for the recruiting team..."
                  className="min-h-[120px] rounded-xl bg-slate-50 border-slate-200 focus-visible:ring-indigo-500 font-medium p-4"
                />
              </div>
            </div>
          </Card>

          <div className="flex items-center justify-end gap-3 mt-2">
            <Link to="/jobs/all">
              <Button variant="outline" className="rounded-xl font-bold border-slate-200 text-slate-600 h-11 px-6">
                Cancel
              </Button>
            </Link>
            <Button onClick={handleSubmit} disabled={isSubmitting} className="rounded-xl font-bold bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-600/20 h-11 px-6">
              <Save className="w-4 h-4 mr-2" />
              {isSubmitting ? "Creating..." : "Create Job"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
