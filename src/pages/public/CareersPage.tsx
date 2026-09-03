import { useState, useEffect, useRef } from "react";
import { API_BASE_URL } from "@/config/api";
import { Briefcase, MapPin, Building2, Clock, Upload, Loader2, CheckCircle2, ChevronRight, Search, ArrowLeft, AlertCircle } from "lucide-react";
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
    formData.append("skills", skills ? JSON.stringify(skills.split(',').map(s=>s.trim())) : '[]');
    formData.append("linkedInProfile", linkedInProfile);
    if(photo) formData.append("photo", photo);


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
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 shadow-xl text-center border border-slate-100">
          <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="h-10 w-10" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Application Received!</h2>
          <p className="text-slate-500 mb-8">
            Thank you for applying for the <strong>{selectedJob?.title}</strong> position. Our recruiting team will review your application and get back to you shortly.
          </p>
          <Button onClick={() => { setSuccess(false); setSelectedJob(null); }} className="w-full h-12 rounded-xl text-[15px] font-bold">
            View More Jobs
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      {/* Header */}
      <div className="bg-slate-900 text-white py-20 px-6 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute -top-[20%] -right-[10%] w-[50%] h-[150%] bg-blue-500/20 rounded-full blur-[120px]" />
          <div className="absolute -bottom-[20%] -left-[10%] w-[50%] h-[150%] bg-emerald-500/20 rounded-full blur-[120px]" />
        </div>
        
        <div className="max-w-5xl mx-auto relative z-10 text-center">
          <Badge className="bg-white/10 text-white hover:bg-white/20 border-transparent mb-6 px-4 py-1.5 rounded-full text-[13px]">
            Join Our Team
          </Badge>
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6 leading-tight">
            Build the Future <br className="hidden md:block"/> With Us
          </h1>
          <p className="text-lg text-slate-300 max-w-2xl mx-auto font-medium">
            Discover opportunities to make an impact, grow your career, and work alongside passionate individuals.
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-12 -mt-8 relative z-20">
        {!selectedJob ? (
          <>
            {/* Search Bar */}
            <div className="bg-white p-3 rounded-2xl shadow-xl shadow-slate-200/50 flex items-center gap-3 mb-10">
              <div className="bg-slate-100 p-3 rounded-xl text-slate-400">
                <Search className="h-5 w-5" />
              </div>
              <input 
                type="text" 
                placeholder="Search by job title or department..." 
                className="w-full bg-transparent border-none outline-none text-[15px] font-medium text-slate-700 placeholder:text-slate-400"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            {loading ? (
              <div className="flex justify-center py-20">
                <Loader2 className="h-10 w-10 text-blue-500 animate-spin" />
              </div>
            ) : (
              <div className="grid gap-4">
                {filteredJobs.length === 0 ? (
                  <div className="text-center py-20 bg-white rounded-3xl border border-slate-100">
                    <p className="text-slate-500 font-medium">No open positions found.</p>
                  </div>
                ) : (
                  filteredJobs.map(job => (
                    <div 
                      key={job.id} 
                      onClick={() => setSelectedJob(job)}
                      className="group bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-blue-500/10 hover:border-blue-200 transition-all cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-6"
                    >
                      <div>
                        <div className="flex items-center gap-3 mb-3">
                          <Badge className="bg-blue-50 text-blue-700 hover:bg-blue-100 border-transparent rounded-lg px-2.5 py-1">
                            {job.department}
                          </Badge>
                          <Badge className="bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border-transparent rounded-lg px-2.5 py-1">
                            {job.type}
                          </Badge>
                        </div>
                        <h3 className="text-[18px] font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                          {job.title}
                        </h3>
                        <div className="flex flex-wrap items-center gap-4 mt-3 text-[13px] text-slate-500 font-medium">
                          <span className="flex items-center gap-1.5"><MapPin className="h-4 w-4 text-slate-400" /> {job.location || 'Remote'}</span>
                          <span className="flex items-center gap-1.5"><Briefcase className="h-4 w-4 text-slate-400" /> {job.experience || 'Entry Level'}</span>
                        </div>
                      </div>
                      <div className="bg-slate-50 p-3 rounded-2xl text-slate-400 group-hover:bg-blue-600 group-hover:text-white transition-colors shrink-0 self-start md:self-auto">
                        <ChevronRight className="h-6 w-6" />
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </>
        ) : (
          <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden flex flex-col md:flex-row">
            {/* Job Details Sidebar */}
            <div className="w-full md:w-[40%] bg-slate-900 text-white p-8 md:p-10 flex flex-col relative overflow-hidden">
              <div className="absolute top-0 right-0 w-[150%] h-[150%] bg-blue-500/10 rounded-full blur-[80px] pointer-events-none" />
              
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
            <div className="w-full md:w-[60%] p-8 md:p-12 bg-white">
              <h3 className="text-2xl font-bold text-slate-900 mb-8">Apply for this position</h3>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <Label className="text-slate-600 mb-2 block font-bold">Full Name *</Label>
                    <Input 
                      value={name} 
                      onChange={e => setName(e.target.value)} 
                      placeholder="John Doe"
                      className={`h-12 rounded-xl focus-visible:ring-blue-500 ${hasSubmitted && !name ? 'bg-red-50 border-red-400' : 'bg-slate-50 border-slate-200'}`}
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
                        className={`h-12 rounded-xl focus-visible:ring-blue-500 ${hasSubmitted && !email ? 'bg-red-50 border-red-400' : 'bg-slate-50 border-slate-200'}`}
                      />
                    </div>
                    <div>
                      <Label className="text-slate-600 mb-2 block font-bold">Phone Number</Label>
                      <Input 
                        value={phone} 
                        onChange={e => setPhone(e.target.value)} 
                        placeholder="+1 (555) 000-0000"
                        className="h-12 bg-slate-50 border-slate-200 rounded-xl focus-visible:ring-blue-500"
                      />
                    </div>
                  </div>


                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-slate-600 mb-2 block font-bold">Alternate Mobile</Label>
                      <Input value={alternateMobile} onChange={e => setAlternateMobile(e.target.value)} placeholder="+1 (555) 000-0000" className="h-12 bg-slate-50 border-slate-200 rounded-xl focus-visible:ring-blue-500"/>
                    </div>
                    <div>
                      <Label className="text-slate-600 mb-2 block font-bold">LinkedIn Profile</Label>
                      <Input value={linkedInProfile} onChange={e => setLinkedInProfile(e.target.value)} placeholder="https://linkedin.com/in/johndoe" className="h-12 bg-slate-50 border-slate-200 rounded-xl focus-visible:ring-blue-500"/>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-slate-600 mb-2 block font-bold">Current Location</Label>
                      <Input value={location} onChange={e => setLocation(e.target.value)} placeholder="New York, NY" className="h-12 bg-slate-50 border-slate-200 rounded-xl focus-visible:ring-blue-500"/>
                    </div>
                    <div>
                      <Label className="text-slate-600 mb-2 block font-bold">Preferred Location</Label>
                      <Input value={preferredLocation} onChange={e => setPreferredLocation(e.target.value)} placeholder="Remote / San Francisco" className="h-12 bg-slate-50 border-slate-200 rounded-xl focus-visible:ring-blue-500"/>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-slate-600 mb-2 block font-bold">Total Experience</Label>
                      <select value={experience} onChange={e => setExperience(e.target.value)} className={`w-full h-12 rounded-xl px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 border ${hasSubmitted && !experience ? 'bg-red-50 border-red-400' : 'bg-slate-50 border-slate-200'}`}>
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
                      <select value={relevantExperience} onChange={e => setRelevantExperience(e.target.value)} className={`w-full h-12 rounded-xl px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 border ${hasSubmitted && !relevantExperience ? 'bg-red-50 border-red-400' : 'bg-slate-50 border-slate-200'}`}>
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
                      <Input value={currentCompany} onChange={e => setCurrentCompany(e.target.value)} placeholder="Acme Corp" className="h-12 bg-slate-50 border-slate-200 rounded-xl focus-visible:ring-blue-500"/>
                    </div>
                    <div>
                      <Label className="text-slate-600 mb-2 block font-bold">Current Designation</Label>
                      <Input value={currentDesignation} onChange={e => setCurrentDesignation(e.target.value)} placeholder="Software Engineer" className="h-12 bg-slate-50 border-slate-200 rounded-xl focus-visible:ring-blue-500"/>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label className="text-slate-600 mb-2 block font-bold">Current CTC</Label>
                      <Input value={currentCtc} onChange={e => setCurrentCtc(e.target.value)} placeholder="e.g. 10 LPA" className="h-12 bg-slate-50 border-slate-200 rounded-xl focus-visible:ring-blue-500"/>
                    </div>
                    <div>
                      <Label className="text-slate-600 mb-2 block font-bold">Expected CTC</Label>
                      <Input value={expectedCtc} onChange={e => setExpectedCtc(e.target.value)} placeholder="e.g. 15 LPA" className="h-12 bg-slate-50 border-slate-200 rounded-xl focus-visible:ring-blue-500"/>
                    </div>
                    <div>
                      <Label className="text-slate-600 mb-2 block font-bold">Notice Period</Label>
                      <select value={noticePeriod} onChange={e => setNoticePeriod(e.target.value)} className="w-full h-12 bg-slate-50 border border-slate-200 rounded-xl px-3 focus:outline-none focus:ring-2 focus:ring-blue-500">
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
                    <Input value={skills} onChange={e => setSkills(e.target.value)} placeholder="React, Node.js, Typescript" className="h-12 bg-slate-50 border-slate-200 rounded-xl focus-visible:ring-blue-500"/>
                  </div>


                  <div>
                    <Label className="text-slate-600 mb-2 block font-bold">Resume / CV *</Label>
                    <div 
                      onClick={() => fileInputRef.current?.click()}
                      className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${resume ? 'border-blue-500 bg-blue-50/50' : (hasSubmitted && !resume ? 'border-red-400 bg-red-50 hover:bg-red-100' : 'border-slate-200 bg-slate-50 hover:bg-slate-100 hover:border-slate-300')}`}
                    >
                      <input 
                        type="file" 
                        ref={fileInputRef} 
                        onChange={e => setResume(e.target.files?.[0] || null)}
                        accept=".pdf,.doc,.docx"
                        className="hidden" 
                      />
                      <div className={`w-12 h-12 mx-auto rounded-full flex items-center justify-center mb-3 ${resume ? 'bg-blue-100 text-blue-600' : 'bg-white text-slate-400 shadow-sm'}`}>
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
                  className="w-full h-14 rounded-xl text-[16px] font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/25"
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
    </div>
  );
}
