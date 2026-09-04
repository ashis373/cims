import { useState, useEffect, useRef } from "react";
import { API_BASE_URL } from "@/config/api";
import { Briefcase, MapPin, Building2, Clock, Upload, Loader2, CheckCircle2, ChevronRight, Search, ArrowLeft, AlertCircle, Users, Heart, TrendingUp, Shield, HelpCircle, Mail, Phone, Calendar, ClipboardCheck, Lightbulb, GraduationCap, Settings, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

export default function CareersPage() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedJob, setSelectedJob] = useState<any | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  // Form State
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [resume, setResume] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [formError, setFormError] = useState("");
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [alternateMobile, setAlternateMobile] = useState("");
  const [location, setLocation] = useState("");
  const [preferredLocation, setPreferredLocation] = useState("");
  const [experience, setExperience] = useState("");
  const [relevantExperience, setRelevantExperience] = useState("");
  const [currentCompany, setCurrentCompany] = useState("");
  const [currentDesignation, setCurrentDesignation] = useState("");
  const [currentCtc, setCurrentCtc] = useState("");
  const [expectedCtc, setExpectedCtc] = useState("");
  const [noticePeriod, setNoticePeriod] = useState("");
  const [skills, setSkills] = useState("");
  const [linkedInProfile, setLinkedInProfile] = useState("");
  const [photo, setPhoto] = useState<File | null>(null);
  const photoInputRef = useRef<HTMLInputElement>(null);


  useEffect(() => {
    fetch(`${API_BASE_URL}/public/jobs.php`)
      .then(r => r.json())
      .then(data => {
        setJobs(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to load jobs", err);
        setLoading(false);
      });
  }, []);

  const filteredJobs = jobs.filter(j =>
    j.title?.toLowerCase().includes(search.toLowerCase()) ||
    j.department?.toLowerCase().includes(search.toLowerCase())
  );

  const jobsPerPage = 8;
  const totalPages = Math.ceil(filteredJobs.length / jobsPerPage);
  const paginatedJobs = filteredJobs.slice((currentPage - 1) * jobsPerPage, currentPage * jobsPerPage);

  useEffect(() => {
    setCurrentPage(1);
  }, [search]);


  const validateForm = () => {
    setFormError("");
    if (!/^[a-zA-Z\s]{2,50}$/.test(name)) {
      setFormError("Name must contain only letters and be between 2 to 50 characters.");
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setFormError("Please enter a valid email address.");
      return false;
    }
    if (phone && !/^\d{10}$/.test(phone.replace(/\D/g, ''))) {
      setFormError("Phone number must be exactly 10 digits.");
      return false;
    }
    if (alternateMobile && !/^\d{10}$/.test(alternateMobile.replace(/\D/g, ''))) {
      setFormError("Alternate mobile must be exactly 10 digits.");
      return false;
    }
    if (linkedInProfile && !/^(https?:\/\/)?([\w]+\.)?linkedin\.com\/.*$/i.test(linkedInProfile)) {
      setFormError("Please enter a valid LinkedIn URL.");
      return false;
    }
    if (currentCtc && !/^\d+(\.\d+)?$/.test(currentCtc.replace(/[^\d.]/g, ''))) {
      setFormError("Current CTC should contain valid numbers.");
      return false;
    }
    if (expectedCtc && !/^\d+(\.\d+)?$/.test(expectedCtc.replace(/[^\d.]/g, ''))) {
      setFormError("Expected CTC should contain valid numbers.");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setHasSubmitted(true);
    setFormError("");
    if (!name || !email || !resume || !selectedJob) {
      setFormError("Please fill in all required fields and attach your resume.");
      return;
    }
    if (!validateForm()) return;


    setSubmitting(true);
    const formData = new FormData();
    formData.append("name", name);
    formData.append("email", email);
    formData.append("phone", phone);
    formData.append("role", selectedJob.title);
    formData.append("department", selectedJob.department);
    formData.append("resume", resume);

    formData.append("alternateMobile", alternateMobile);
    formData.append("location", location);
    formData.append("preferredLocation", preferredLocation);
    formData.append("experience", experience);
    formData.append("relevantExperience", relevantExperience);
    formData.append("currentCompany", currentCompany);
    formData.append("currentDesignation", currentDesignation);
    formData.append("currentCtc", currentCtc);
    formData.append("expectedCtc", expectedCtc);
    formData.append("noticePeriod", noticePeriod);
    formData.append("skills", skills ? JSON.stringify(skills.split(',').map(s => s.trim())) : '[]');
    formData.append("linkedInProfile", linkedInProfile);
    if (photo) formData.append("photo", photo);


    try {
      const res = await fetch(`${API_BASE_URL}/public/apply.php`, {
        method: "POST",
        body: formData,
      });
      const result = await res.json();
      if (res.ok && result.success) {
        setSuccess(true);
      } else {
        toast.error(result.error || "Failed to submit application");
      }
    } catch (err) {
      toast.error("An error occurred while submitting.");
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] text-center border border-slate-100">
          <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="h-10 w-10" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Application Received!</h2>
          <p className="text-slate-500 mb-8 text-[15px]">
            Thank you for applying for the <strong>{selectedJob?.title}</strong> position. Our recruiting team will review your application and get back to you shortly.
          </p>
          <Button onClick={() => { setSuccess(false); setSelectedJob(null); }} className="w-full h-12 rounded-xl text-[15px] font-bold bg-[#4F46E5] hover:bg-[#4338CA]">
            View More Jobs
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans">
      {/* Hero Section */}
      <div className="bg-[#0A0F2C] text-white pt-20 pb-32 px-6 relative overflow-hidden">
        {/* Background Decorative */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute right-0 top-0 w-1/3 h-full bg-[#1A2352] skew-x-[-15deg] transform origin-top-right opacity-50"></div>
          {/* Dot pattern */}
          <div className="absolute top-10 right-[40%] grid grid-cols-4 gap-2 opacity-20">
            {[...Array(16)].map((_, i) => <div key={i} className="w-1.5 h-1.5 bg-white rounded-full"></div>)}
          </div>
          <div className="absolute bottom-10 right-10 grid grid-cols-4 gap-2 opacity-20">
            {[...Array(16)].map((_, i) => <div key={i} className="w-1.5 h-1.5 bg-white rounded-full"></div>)}
          </div>
        </div>

        {/* White bottom curve */}
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-[#F8FAFC] rounded-t-[100%] scale-x-150 translate-y-1/2 z-10"></div>

        <div className="max-w-[1200px] mx-auto relative z-20 flex flex-col md:flex-row items-center gap-12">
          {/* Left Content */}
          <div className="flex-1 pt-8">
            <Badge className="bg-white/5 text-white border border-white/10 mb-6 px-4 py-1.5 rounded-full text-[12px] font-semibold flex items-center w-fit gap-2">
              JOIN OUR TEAM <Users className="w-3.5 h-3.5" />
            </Badge>
            <h1 className="text-5xl md:text-[56px] font-bold tracking-tight mb-4 leading-[1.15]">
              Build the Future<br />
              <span className="text-[#3B82F6]">With Us</span>
            </h1>
            <p className="text-[15px] text-slate-300 max-w-[420px] mb-10 leading-relaxed">
              Discover opportunities to make an impact, grow your career, and work alongside passionate individuals.
            </p>

            {/* Value Props */}
            <div className="flex flex-wrap gap-8">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#6366F1] flex items-center justify-center shadow-lg shadow-indigo-500/30">
                  <Heart className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="text-[13px] font-bold text-white">Great Culture</div>
                  <div className="text-[11px] text-slate-400">People first culture</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#3B82F6] flex items-center justify-center shadow-lg shadow-blue-500/30">
                  <TrendingUp className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="text-[13px] font-bold text-white">Growth & Learning</div>
                  <div className="text-[11px] text-slate-400">Constantly upskill</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#10B981] flex items-center justify-center shadow-lg shadow-emerald-500/30">
                  <Shield className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="text-[13px] font-bold text-white">Make an Impact</div>
                  <div className="text-[11px] text-slate-400">Work that matters</div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Image */}
          <div className="flex-1 relative hidden md:block z-20">
            <div className="relative overflow-hidden rounded-[2rem] rounded-bl-[6rem] border-[6px] border-white/5 w-full h-[380px] bg-slate-800">
              <img src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" alt="Team" className="w-full h-full object-cover opacity-80" />
            </div>

            {/* Floating Stats */}
            <div className="absolute -bottom-6 -left-8 bg-white rounded-2xl p-5 shadow-[0_10px_40px_rgba(0,0,0,0.1)] flex items-center gap-4 z-30 min-w-[200px]">
              <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-slate-900">20+</div>
                <div className="text-[12px] text-slate-500 font-medium">Open Positions</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-[1200px] mx-auto px-6 py-12 relative z-30">
        {!selectedJob ? (
          <>
            {/* Search Filter Bar */}
            <div className="bg-white p-3 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 flex flex-col md:flex-row items-center gap-3 mb-10 -mt-24 relative z-30">
              <div className="flex items-center gap-3 flex-1 px-3 py-2 w-full">
                <Search className="h-5 w-5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search by job title, keyword or skills..."
                  className="w-full bg-transparent border-none outline-none text-[14px] text-slate-700 placeholder:text-slate-400"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <Button className="w-full md:w-auto bg-[#4F46E5] hover:bg-[#4338CA] text-white px-8 h-12 rounded-xl text-[14px] font-medium shrink-0 flex items-center gap-2">
                <Search className="w-4 h-4" /> Search Jobs
              </Button>
            </div>

            <div className="flex flex-col lg:flex-row gap-8">
              {/* Main Job List */}
              <div className="flex-1">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-[20px] font-bold text-slate-900 flex items-center gap-2">
                    <Users className="w-5 h-5 text-indigo-500" /> All Open Positions
                  </h2>
                  <div className="flex items-center gap-2 text-[13px] text-slate-500">
                    Sort by:
                    <select className="bg-transparent font-medium text-slate-700 outline-none">
                      <option>Recently Posted</option>
                    </select>
                  </div>
                </div>

                {loading ? (
                  <div className="flex justify-center py-20">
                    <Loader2 className="h-10 w-10 text-indigo-500 animate-spin" />
                  </div>
                ) : (
                  <div className="grid gap-4">
                    {filteredJobs.length === 0 ? (
                      <div className="text-center py-20 bg-white rounded-2xl border border-slate-100">
                        <p className="text-slate-500 font-medium">No open positions found.</p>
                      </div>
                    ) : (
                      paginatedJobs.map(job => (
                        <div
                          key={job.id}
                          className="bg-white p-5 rounded-2xl border border-slate-100 shadow-[0_2px_10px_rgb(0,0,0,0.02)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] hover:border-indigo-100 transition-all flex flex-col md:flex-row md:items-center justify-between gap-5 group"
                        >
                          <div className="flex gap-4">
                            <div className="w-12 h-12 rounded-xl bg-indigo-50/50 flex items-center justify-center shrink-0 border border-indigo-50 group-hover:bg-indigo-50 transition-colors">
                              <Briefcase className="w-5 h-5 text-indigo-500" />
                            </div>
                            <div>
                              <div className="flex items-center gap-3 mb-1">
                                <h3 className="text-[16px] font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                                  {job.title}
                                </h3>
                                <Badge className="bg-emerald-50 text-emerald-600 hover:bg-emerald-50 border-transparent rounded-md px-2 py-0.5 text-[10px] font-bold">
                                  {job.type || 'Full Time'}
                                </Badge>
                              </div>
                              <div className="text-[13px] text-indigo-600 font-medium mb-3">
                                {job.department}
                              </div>
                              <div className="flex flex-wrap items-center gap-4 text-[12px] text-slate-500 font-medium">
                                <span className="flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5" /> {job.location || 'Remote'}</span>
                                <span className="flex items-center gap-1.5"><Briefcase className="h-3.5 w-3.5" /> {job.experience || '2-4 Yrs'}</span>
                                <span className="flex items-center gap-1.5"><Clock className="h-3.5 w-3.5" /> {job.type || 'Full Time'}</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex flex-col items-end gap-3 shrink-0">
                            <div className="text-[11px] text-slate-400 font-medium">{job.created_at ? new Date(job.created_at).toLocaleDateString() : '2d ago'}</div>
                            <Button variant="outline" onClick={() => setSelectedJob(job)} className="h-9 rounded-lg text-[13px] font-semibold border-slate-200 text-indigo-600 hover:bg-indigo-50 hover:text-indigo-700 hover:border-indigo-200 px-5 gap-2 group-hover:border-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                              Apply Now <ChevronRight className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      ))
                    )}

                    {/* Pagination */}
                    {totalPages > 1 && (
                      <div className="flex items-center justify-center gap-2 mt-6">
                        <Button 
                          variant="outline" 
                          className="h-9 px-4 text-[13px] text-slate-500 border-slate-200" 
                          disabled={currentPage === 1}
                          onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                        >
                          Previous
                        </Button>
                        
                        {[...Array(totalPages)].map((_, i) => (
                          <Button 
                            key={i}
                            variant={currentPage === i + 1 ? "default" : "outline"} 
                            className={`h-9 w-9 p-0 rounded-lg ${currentPage === i + 1 ? 'bg-indigo-600 text-white hover:bg-indigo-700' : 'text-slate-600 border-slate-200 hover:bg-slate-50'}`}
                            onClick={() => setCurrentPage(i + 1)}
                          >
                            {i + 1}
                          </Button>
                        ))}
                        
                        <Button 
                          variant="outline" 
                          className="h-9 px-4 text-[13px] text-slate-600 border-slate-200 hover:bg-slate-50"
                          disabled={currentPage === totalPages}
                          onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                        >
                          Next
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Right Sidebar */}
              <div className="w-full lg:w-[320px] flex flex-col gap-6 shrink-0">
                {/* Jobs by Department */}
                <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-[0_2px_10px_rgb(0,0,0,0.02)]">
                  <h3 className="text-[15px] font-bold text-slate-900 flex items-center gap-2 mb-5">
                    <Building2 className="w-4 h-4 text-indigo-500" /> Jobs by Department
                  </h3>
                  <div className="flex items-center justify-between text-[13px] font-bold text-slate-900 mb-3 border-b border-slate-100 pb-2">
                    <span>Total</span>
                    <span>{jobs.length || 20}</span>
                  </div>
                  <div className="space-y-4">
                    {[
                      { name: 'Software Development', count: jobs.filter(j => j.department?.toLowerCase().includes('software')).length || 6, color: 'bg-blue-500' },
                      { name: 'Multimedia Design', count: jobs.filter(j => j.department?.toLowerCase().includes('design')).length || 4, color: 'bg-pink-500' },
                      { name: 'Elearning', count: jobs.filter(j => j.department?.toLowerCase().includes('learn')).length || 3, color: 'bg-indigo-500' },
                      { name: 'QA Testing', count: jobs.filter(j => j.department?.toLowerCase().includes('qa')).length || 3, color: 'bg-amber-400' },
                      { name: 'Business Development', count: jobs.filter(j => j.department?.toLowerCase().includes('business')).length || 2, color: 'bg-emerald-500' }
                    ].map((dept, i) => (
                      <div key={i} className="text-[12px] font-medium text-slate-600">
                        <div className="flex justify-between mb-1.5">
                          <span>{dept.name}</span>
                          <span className="font-bold text-slate-900">{dept.count}</span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-1.5">
                          <div className={`${dept.color} h-1.5 rounded-full`} style={{ width: `${(dept.count / Math.max(1, jobs.length || 20)) * 100}%` }}></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Why Join Us? */}
                <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-[0_2px_10px_rgb(0,0,0,0.02)]">
                  <h3 className="text-[15px] font-bold text-slate-900 flex items-center gap-2 mb-5">
                    <Building2 className="w-4 h-4 text-indigo-500" /> Why Join Us?
                  </h3>
                  <div className="space-y-4">
                    <div className="flex gap-3">
                      <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                        <Badge className="p-0 bg-transparent text-emerald-600 hover:bg-transparent">$</Badge>
                      </div>
                      <div>
                        <div className="text-[13px] font-bold text-slate-900">Competitive Salary</div>
                        <div className="text-[11px] text-slate-500">We value your skills and experience</div>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                        <Heart className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-[13px] font-bold text-slate-900">Health & Wellness</div>
                        <div className="text-[11px] text-slate-500">Comprehensive health coverage</div>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                        <Settings className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-[13px] font-bold text-slate-900">Flexible Work</div>
                        <div className="text-[11px] text-slate-500">Remote & flexible work options</div>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                        <GraduationCap className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-[13px] font-bold text-slate-900">Learning & Growth</div>
                        <div className="text-[11px] text-slate-500">Continuous learning opportunities</div>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <div className="w-8 h-8 rounded-lg bg-pink-50 text-pink-600 flex items-center justify-center shrink-0">
                        <Users className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-[13px] font-bold text-slate-900">Team Culture</div>
                        <div className="text-[11px] text-slate-500">Collaborative and inclusive culture</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Don't see the right role? */}
                <div className="bg-[#6366F1] p-6 rounded-2xl text-white relative overflow-hidden shadow-lg shadow-indigo-500/20">
                  <div className="absolute right-0 top-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10"></div>
                  <h3 className="text-[16px] font-bold mb-2 relative z-10">Don't see the right role?</h3>
                  <p className="text-[13px] text-indigo-100 mb-5 relative z-10 leading-relaxed">
                    We're always looking for talented people to join our team.
                  </p>
                  <Button className="w-full bg-white text-indigo-600 hover:bg-slate-50 h-10 rounded-xl text-[13px] font-bold relative z-10 gap-2 shadow-sm">
                    <Upload className="w-4 h-4" /> Submit Your Resume
                  </Button>
                </div>

                {/* Need Help? */}
                <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-[0_2px_10px_rgb(0,0,0,0.02)]">
                  <div className="flex items-start gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                      <HelpCircle className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-[14px] font-bold text-slate-900">Need Help?</h3>
                      <p className="text-[12px] text-slate-500 mt-1">Our HR team is here to help you find the perfect role.</p>
                    </div>
                  </div>
                  <div className="space-y-3 pt-3 border-t border-slate-100 text-[13px] font-medium text-slate-600">
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-slate-400" /> contact-us@hexalearn.com
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-slate-400" /> +91-9938339054
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Sections */}
            <div className="mt-20 pt-16 border-t border-slate-200">
              <div className="text-center max-w-2xl mx-auto mb-12">
                <h2 className="text-3xl font-bold text-slate-900 mb-3">Life at Our Company</h2>
                <p className="text-slate-500 text-[15px]">We're building more than products, we're building a better future together.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm text-center md:text-left">
                  <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mb-4 mx-auto md:mx-0">
                    <Lightbulb className="w-6 h-6" />
                  </div>
                  <h4 className="text-[15px] font-bold text-slate-900 mb-2">Innovative Environment</h4>
                  <p className="text-[13px] text-slate-500 leading-relaxed">Work with cutting-edge technologies and solve real-world problems.</p>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm text-center md:text-left">
                  <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4 mx-auto md:mx-0">
                    <Users className="w-6 h-6" />
                  </div>
                  <h4 className="text-[15px] font-bold text-slate-900 mb-2">Collaborative Team</h4>
                  <p className="text-[13px] text-slate-500 leading-relaxed">Work with talented, passionate individuals who support and inspire you.</p>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-emerald-100/50 shadow-sm bg-emerald-50/10 text-center md:text-left">
                  <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4 mx-auto md:mx-0">
                    <Heart className="w-6 h-6" />
                  </div>
                  <h4 className="text-[15px] font-bold text-slate-900 mb-2">Career Growth</h4>
                  <p className="text-[13px] text-slate-500 leading-relaxed">Clear career paths with mentorship and skill development.</p>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-amber-100/50 shadow-sm bg-amber-50/10 text-center md:text-left">
                  <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-4 mx-auto md:mx-0">
                    <Clock className="w-6 h-6" />
                  </div>
                  <h4 className="text-[15px] font-bold text-slate-900 mb-2">Work-Life Balance</h4>
                  <p className="text-[13px] text-slate-500 leading-relaxed">We value your time and wellbeing with flexible arrangements.</p>
                </div>
              </div>

              {/* Application Process */}
              <div className="bg-white rounded-3xl p-10 border border-slate-100 shadow-sm text-center mb-20">
                <h2 className="text-2xl font-bold text-slate-900 mb-12">Our Application Process</h2>
                <div className="flex flex-col md:flex-row justify-between relative">
                  {/* Connecting Line */}
                  <div className="hidden md:block absolute top-6 left-[10%] right-[10%] h-0.5 bg-slate-100 border-t-2 border-dashed border-slate-200 z-0"></div>

                  {[
                    { step: '1', title: 'Apply', desc: 'Submit your application online', icon: <ClipboardCheck className="w-5 h-5" /> },
                    { step: '2', title: 'Screening', desc: 'Our team reviews your application', icon: <Users className="w-5 h-5" /> },
                    { step: '3', title: 'Interview', desc: 'Shortlisted candidates will be interviewed', icon: <Calendar className="w-5 h-5" /> },
                    { step: '4', title: 'Selection', desc: 'Successful candidates receive an offer', icon: <CheckCircle2 className="w-5 h-5" /> },
                    { step: '5', title: 'Onboarding', desc: 'Welcome aboard! Your journey begins here', icon: <Shield className="w-5 h-5" /> }
                  ].map((process, i) => (
                    <div key={i} className="relative z-10 flex flex-col items-center w-full md:w-1/5 mb-8 md:mb-0 group cursor-pointer">
                      <div className="w-12 h-12 rounded-full bg-white border-[3px] border-indigo-100 text-indigo-500 flex items-center justify-center mb-4 shadow-sm group-hover:-translate-y-2 group-hover:scale-110 group-hover:border-indigo-400 group-hover:shadow-md group-hover:text-indigo-600 transition-all duration-300 ease-out">
                        {process.icon}
                      </div>
                      <h4 className="text-[14px] font-bold text-slate-900 mb-1 group-hover:text-indigo-600 transition-colors duration-300">{process.step}. {process.title}</h4>
                      <p className="text-[12px] text-slate-500 max-w-[120px] group-hover:text-slate-700 transition-colors duration-300">{process.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 overflow-hidden flex flex-col md:flex-row max-w-5xl mx-auto my-10">
            {/* Job Details Sidebar */}
            <div className="w-full md:w-[40%] bg-[#0A0F2C] text-white p-8 md:p-10 flex flex-col relative overflow-hidden">
              <div className="absolute top-0 right-0 w-[150%] h-[150%] bg-[#3B82F6]/10 rounded-full blur-[80px] pointer-events-none" />

              <button
                onClick={() => setSelectedJob(null)}
                className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-[13px] font-bold w-fit mb-8 relative z-10"
              >
                <ArrowLeft className="h-4 w-4" /> Back to jobs
              </button>

              <div className="relative z-10">
                <Badge className="bg-white/10 text-white border-transparent rounded-lg px-3 py-1 mb-4">
                  {selectedJob.department}
                </Badge>
                <h2 className="text-3xl font-extrabold mb-6 leading-tight">
                  {selectedJob.title}
                </h2>

                <div className="space-y-4 mb-8">
                  <div className="flex items-center gap-3 text-slate-300">
                    <div className="bg-white/5 p-2.5 rounded-xl"><MapPin className="h-5 w-5 text-blue-400" /></div>
                    <div>
                      <div className="text-[11px] text-slate-500 font-bold uppercase tracking-wider">Location</div>
                      <div className="font-medium">{selectedJob.location || 'Remote'}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-slate-300">
                    <div className="bg-white/5 p-2.5 rounded-xl"><Clock className="h-5 w-5 text-emerald-400" /></div>
                    <div>
                      <div className="text-[11px] text-slate-500 font-bold uppercase tracking-wider">Type</div>
                      <div className="font-medium">{selectedJob.type}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-slate-300">
                    <div className="bg-white/5 p-2.5 rounded-xl"><Briefcase className="h-5 w-5 text-amber-400" /></div>
                    <div>
                      <div className="text-[11px] text-slate-500 font-bold uppercase tracking-wider">Experience</div>
                      <div className="font-medium">{selectedJob.experience || 'Entry Level'}</div>
                    </div>
                  </div>
                </div>

                <div className="prose prose-invert prose-sm max-w-none text-slate-300">
                  <h3 className="text-white text-[15px] font-bold mb-2">About the Role</h3>
                  <div dangerouslySetInnerHTML={{ __html: selectedJob.description || '<p>We are looking for a talented individual to join our team.</p>' }} />
                </div>
              </div>
            </div>

            {/* Application Form */}
            <div className="w-full md:w-[60%] p-8 md:p-12 bg-white relative z-10">
              <h3 className="text-2xl font-bold text-slate-900 mb-8">Apply for this position</h3>

              {/* Note: I'm preserving the existing form unchanged as per user request to only change UI, but giving it minor tailwind updates to match the new clean look */}
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <Label className="text-slate-600 mb-2 block font-bold">Full Name *</Label>
                    <Input
                      value={name}
                      onChange={e => setName(e.target.value)}
                      placeholder="John Doe"
                      className={`h-12 rounded-xl focus-visible:ring-indigo-500 ${hasSubmitted && !name ? 'bg-red-50 border-red-400' : 'bg-slate-50 border-slate-200'}`}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-slate-600 mb-2 block font-bold">Email Address *</Label>
                      <Input
                        type="email"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        placeholder="john@example.com"
                        className={`h-12 rounded-xl focus-visible:ring-indigo-500 ${hasSubmitted && !email ? 'bg-red-50 border-red-400' : 'bg-slate-50 border-slate-200'}`}
                      />
                    </div>
                    <div>
                      <Label className="text-slate-600 mb-2 block font-bold">Phone Number</Label>
                      <Input
                        value={phone}
                        onChange={e => setPhone(e.target.value)}
                        placeholder="+1 (555) 000-0000"
                        className="h-12 bg-slate-50 border-slate-200 rounded-xl focus-visible:ring-indigo-500"
                      />
                    </div>
                  </div>


                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-slate-600 mb-2 block font-bold">Alternate Mobile</Label>
                      <Input value={alternateMobile} onChange={e => setAlternateMobile(e.target.value)} placeholder="+1 (555) 000-0000" className="h-12 bg-slate-50 border-slate-200 rounded-xl focus-visible:ring-indigo-500" />
                    </div>
                    <div>
                      <Label className="text-slate-600 mb-2 block font-bold">LinkedIn Profile</Label>
                      <Input value={linkedInProfile} onChange={e => setLinkedInProfile(e.target.value)} placeholder="https://linkedin.com/in/johndoe" className="h-12 bg-slate-50 border-slate-200 rounded-xl focus-visible:ring-indigo-500" />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-slate-600 mb-2 block font-bold">Current Location</Label>
                      <Input value={location} onChange={e => setLocation(e.target.value)} placeholder="New York, NY" className="h-12 bg-slate-50 border-slate-200 rounded-xl focus-visible:ring-indigo-500" />
                    </div>
                    <div>
                      <Label className="text-slate-600 mb-2 block font-bold">Preferred Location</Label>
                      <Input value={preferredLocation} onChange={e => setPreferredLocation(e.target.value)} placeholder="Remote / San Francisco" className="h-12 bg-slate-50 border-slate-200 rounded-xl focus-visible:ring-indigo-500" />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-slate-600 mb-2 block font-bold">Total Experience</Label>
                      <select value={experience} onChange={e => setExperience(e.target.value)} className={`w-full h-12 rounded-xl px-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 border ${hasSubmitted && !experience ? 'bg-red-50 border-red-400' : 'bg-slate-50 border-slate-200'}`}>
                        <option value="">Select Experience</option>
                        <option value="Fresher">Fresher</option>
                        <option value="1-3 Years">1-3 Years</option>
                        <option value="3-5 Years">3-5 Years</option>
                        <option value="5-8 Years">5-8 Years</option>
                        <option value="8+ Years">8+ Years</option>
                      </select>
                    </div>
                    <div>
                      <Label className="text-slate-600 mb-2 block font-bold">Relevant Experience</Label>
                      <select value={relevantExperience} onChange={e => setRelevantExperience(e.target.value)} className={`w-full h-12 rounded-xl px-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 border ${hasSubmitted && !relevantExperience ? 'bg-red-50 border-red-400' : 'bg-slate-50 border-slate-200'}`}>
                        <option value="">Select Relevant Exp</option>
                        <option value="Fresher">Fresher</option>
                        <option value="1-3 Years">1-3 Years</option>
                        <option value="3-5 Years">3-5 Years</option>
                        <option value="5-8 Years">5-8 Years</option>
                        <option value="8+ Years">8+ Years</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-slate-600 mb-2 block font-bold">Current Company</Label>
                      <Input value={currentCompany} onChange={e => setCurrentCompany(e.target.value)} placeholder="Acme Corp" className="h-12 bg-slate-50 border-slate-200 rounded-xl focus-visible:ring-indigo-500" />
                    </div>
                    <div>
                      <Label className="text-slate-600 mb-2 block font-bold">Current Designation</Label>
                      <Input value={currentDesignation} onChange={e => setCurrentDesignation(e.target.value)} placeholder="Software Engineer" className="h-12 bg-slate-50 border-slate-200 rounded-xl focus-visible:ring-indigo-500" />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label className="text-slate-600 mb-2 block font-bold">Current CTC</Label>
                      <Input value={currentCtc} onChange={e => setCurrentCtc(e.target.value)} placeholder="e.g. 10 LPA" className="h-12 bg-slate-50 border-slate-200 rounded-xl focus-visible:ring-indigo-500" />
                    </div>
                    <div>
                      <Label className="text-slate-600 mb-2 block font-bold">Expected CTC</Label>
                      <Input value={expectedCtc} onChange={e => setExpectedCtc(e.target.value)} placeholder="e.g. 15 LPA" className="h-12 bg-slate-50 border-slate-200 rounded-xl focus-visible:ring-indigo-500" />
                    </div>
                    <div>
                      <Label className="text-slate-600 mb-2 block font-bold">Notice Period</Label>
                      <select value={noticePeriod} onChange={e => setNoticePeriod(e.target.value)} className="w-full h-12 bg-slate-50 border border-slate-200 rounded-xl px-3 focus:outline-none focus:ring-2 focus:ring-indigo-500">
                        <option value="">Select Notice Period</option>
                        <option value="Immediate">Immediate</option>
                        <option value="15 Days">15 Days</option>
                        <option value="30 Days">30 Days</option>
                        <option value="60 Days">60 Days</option>
                        <option value="90 Days">90 Days</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <Label className="text-slate-600 mb-2 block font-bold">Skills (comma separated)</Label>
                    <Input value={skills} onChange={e => setSkills(e.target.value)} placeholder="React, Node.js, Typescript" className="h-12 bg-slate-50 border-slate-200 rounded-xl focus-visible:ring-indigo-500" />
                  </div>


                  <div>
                    <Label className="text-slate-600 mb-2 block font-bold">Resume / CV *</Label>
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${resume ? 'border-indigo-500 bg-indigo-50/50' : (hasSubmitted && !resume ? 'border-red-400 bg-red-50 hover:bg-red-100' : 'border-slate-200 bg-slate-50 hover:bg-slate-100 hover:border-slate-300')}`}
                    >
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={e => setResume(e.target.files?.[0] || null)}
                        accept=".pdf,.doc,.docx"
                        className="hidden"
                      />
                      <div className={`w-12 h-12 mx-auto rounded-full flex items-center justify-center mb-3 ${resume ? 'bg-indigo-100 text-indigo-600' : 'bg-white text-slate-400 shadow-sm'}`}>
                        <Upload className="h-5 w-5" />
                      </div>
                      {resume ? (
                        <>
                          <p className="text-[14px] font-bold text-slate-900">{resume.name}</p>
                          <p className="text-[12px] text-slate-500 mt-1">{(resume.size / 1024 / 1024).toFixed(2)} MB</p>
                        </>
                      ) : (
                        <>
                          <p className="text-[14px] font-bold text-slate-700">Click to upload your resume</p>
                          <p className="text-[12px] text-slate-500 mt-1">PDF, DOC, DOCX up to 10MB</p>
                        </>
                      )}
                    </div>
                  </div>
                </div>


                <div>
                  <Label className="text-slate-600 mb-2 block font-bold">Profile Photo</Label>
                  <div
                    onClick={() => photoInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-2xl p-4 text-center cursor-pointer transition-all ${photo ? 'border-emerald-500 bg-emerald-50/50' : 'border-slate-200 bg-slate-50 hover:bg-slate-100 hover:border-slate-300'}`}
                  >
                    <input
                      type="file"
                      ref={photoInputRef}
                      onChange={e => setPhoto(e.target.files?.[0] || null)}
                      accept=".jpg,.jpeg,.png"
                      className="hidden"
                    />
                    <div className={`w-10 h-10 mx-auto rounded-full flex items-center justify-center mb-2 ${photo ? 'bg-emerald-100 text-emerald-600' : 'bg-white text-slate-400 shadow-sm'}`}>
                      <Upload className="h-4 w-4" />
                    </div>
                    {photo ? (
                      <p className="text-[13px] font-bold text-slate-900">{photo.name}</p>
                    ) : (
                      <p className="text-[13px] font-bold text-slate-700">Upload Photo (Optional)</p>
                    )}
                  </div>
                </div>


                {formError && (
                  <div className="bg-red-50 text-red-600 border border-red-200 p-3 rounded-xl text-[14px] font-bold flex items-center gap-2">
                    <AlertCircle className="h-5 w-5" /> {formError}
                  </div>
                )}

                <Button
                  type="submit"
                  disabled={submitting}
                  className="w-full h-14 rounded-xl text-[16px] font-bold bg-[#4F46E5] hover:bg-[#4338CA] text-white shadow-lg shadow-indigo-500/25"
                >
                  {submitting ? (
                    <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Submitting Application...</>
                  ) : (
                    "Submit Application"
                  )}
                </Button>
                <p className="text-center text-[12px] text-slate-400 font-medium">
                  By submitting, you agree to our Terms and Privacy Policy.
                </p>
              </form>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="text-center py-8 text-[13px] text-white font-medium bg-[#000C22] mt-auto">
        © 2011-2026 HexaLearn – All Rights Reserved.
      </footer>
    </div>
  );
}
