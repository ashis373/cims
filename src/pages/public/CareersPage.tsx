import { useState, useEffect, useRef } from "react";
import { API_BASE_URL } from "@/config/api";
import { Briefcase, MapPin, Building2, Clock, Upload, Loader2, CheckCircle2, ChevronRight, Search, ArrowLeft, AlertCircle, Users, Heart, TrendingUp, Shield, HelpCircle, Mail, Phone, Calendar, ClipboardCheck, Lightbulb, GraduationCap, Settings, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import DOMPurify from "dompurify";

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


  const [selectedDept, setSelectedDept] = useState<string>("All");
  const [selectedWorkMode, setSelectedWorkMode] = useState<string>("All");

  useEffect(() => {
    fetch(`${API_BASE_URL}/public/jobs`)
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

  // Dynamically extract unique departments from live open jobs
  const departments = Array.from(new Set(jobs.map(j => j.department).filter(Boolean))).sort();

  const filteredJobs = jobs.filter(j => {
    const matchesSearch = 
      j.title?.toLowerCase().includes(search.toLowerCase()) ||
      j.department?.toLowerCase().includes(search.toLowerCase()) ||
      j.location?.toLowerCase().includes(search.toLowerCase()) ||
      j.description?.toLowerCase().includes(search.toLowerCase());

    const matchesDept = selectedDept === "All" || j.department?.toLowerCase() === selectedDept.toLowerCase();
    const matchesWorkMode = selectedWorkMode === "All" || j.work_mode?.toLowerCase() === selectedWorkMode.toLowerCase();

    return matchesSearch && matchesDept && matchesWorkMode;
  });

  const jobsPerPage = 8;
  const totalPages = Math.ceil(filteredJobs.length / jobsPerPage);
  const paginatedJobs = filteredJobs.slice((currentPage - 1) * jobsPerPage, currentPage * jobsPerPage);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, selectedDept, selectedWorkMode]);


  const isFresher = experience === "Fresher";

  const validateForm = () => {
    setFormError("");
    if (!name.trim()) {
      setFormError("Full Name is required.");
      return false;
    }
    if (!/^[a-zA-Z\s]{2,50}$/.test(name.trim())) {
      setFormError("Name must contain only letters and be between 2 to 50 characters.");
      return false;
    }
    if (!email.trim()) {
      setFormError("Email Address is required.");
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setFormError("Please enter a valid email address.");
      return false;
    }
    if (!phone.trim()) {
      setFormError("Phone Number is required.");
      return false;
    }
    if (!/^\d{10}$/.test(phone.replace(/\D/g, ''))) {
      setFormError("Phone number must be a valid 10-digit number.");
      return false;
    }
    if (alternateMobile.trim() && !/^\d{10}$/.test(alternateMobile.replace(/\D/g, ''))) {
      setFormError("Alternate mobile must be exactly 10 digits.");
      return false;
    }
    if (linkedInProfile.trim() && !/^(https?:\/\/)?([\w]+\.)?linkedin\.com\/.*$/i.test(linkedInProfile.trim())) {
      setFormError("Please enter a valid LinkedIn URL.");
      return false;
    }
    if (!location.trim()) {
      setFormError("Current Location is required.");
      return false;
    }
    if (!preferredLocation.trim()) {
      setFormError("Preferred Location is required.");
      return false;
    }
    if (!experience) {
      setFormError("Total Experience is required.");
      return false;
    }
    if (!relevantExperience) {
      setFormError("Relevant Experience is required.");
      return false;
    }

    // Conditional requirements: Required for experienced candidates, optional for freshers
    if (!isFresher) {
      if (!currentCompany.trim()) {
        setFormError("Current Company is required for experienced candidates.");
        return false;
      }
      if (!currentDesignation.trim()) {
        setFormError("Current Designation is required for experienced candidates.");
        return false;
      }
      if (!currentCtc.trim()) {
        setFormError("Current CTC is required for experienced candidates.");
        return false;
      }
    }

    if (currentCtc.trim() && !/^\d+(\.\d+)?$/.test(currentCtc.replace(/[^\d.]/g, ''))) {
      setFormError("Current CTC should contain valid numbers (e.g. 6 LPA).");
      return false;
    }

    if (!expectedCtc.trim()) {
      setFormError("Expected CTC is required.");
      return false;
    }
    if (!/^\d+(\.\d+)?$/.test(expectedCtc.replace(/[^\d.]/g, ''))) {
      setFormError("Expected CTC should contain valid numbers (e.g. 10 LPA).");
      return false;
    }

    if (!noticePeriod) {
      setFormError("Notice Period is required.");
      return false;
    }
    if (!skills.trim()) {
      setFormError("Key Skills are required.");
      return false;
    }
    if (!resume) {
      setFormError("Please upload your Resume / CV.");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setHasSubmitted(true);
    setFormError("");
    if (resume) {
      const resumeExt = resume.name.split('.').pop()?.toLowerCase();
      if (!['pdf', 'doc', 'docx'].includes(resumeExt || '')) {
        setFormError("Resume must be a PDF, DOC, or DOCX file.");
        return;
      }
      if (resume.size > 5 * 1024 * 1024) {
        setFormError("Resume file size cannot exceed 5MB.");
        return;
      }
    }
    if (photo) {
      const photoExt = photo.name.split('.').pop()?.toLowerCase();
      if (!['jpg', 'jpeg', 'png'].includes(photoExt || '')) {
        setFormError("Profile photo must be a JPG or PNG image.");
        return;
      }
      if (photo.size > 1 * 1024 * 1024) {
        setFormError("Profile photo file size cannot exceed 1MB.");
        return;
      }
    }
    if (!validateForm()) return;


    setSubmitting(true);
    const formData = new FormData();
    if (selectedJob?.id) {
      formData.append("job_id", String(selectedJob.id));
    }
    formData.append("name", name);
    formData.append("email", email);
    formData.append("phone", phone);
    formData.append("role", selectedJob.title);
    formData.append("department", selectedJob.department);
    if (resume) {
      formData.append("resume", resume);
    }

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
      const res = await fetch(`${API_BASE_URL}/public/apply`, {
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
          <div className="w-20 h-20 bg-emerald-50 text-[#42bc24] border border-emerald-200/80 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
            <CheckCircle2 className="h-10 w-10" />
          </div>
          <h2 className="text-2xl font-black text-slate-900 mb-2">Application Received!</h2>
          <p className="text-slate-500 mb-8 text-[14.5px] leading-relaxed">
            Thank you for applying for the <strong className="text-slate-900">{selectedJob?.title}</strong> position. Our recruiting team will review your application and get back to you shortly.
          </p>
          <Button 
            onClick={() => { setSuccess(false); setSelectedJob(null); }} 
            className="w-full h-12 rounded-xl text-[14px] font-bold bg-[#42bc24] hover:bg-[#36961c] text-white shadow-lg shadow-emerald-500/20"
          >
            View More Openings
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans">
      {/* Hero Section */}
      <div className="bg-gradient-to-b from-[#000C22] via-[#04161F] to-[#0B2524] text-white pt-20 pb-32 px-6 relative overflow-hidden">
        {/* Background Decorative */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute right-0 top-0 w-1/2 h-full bg-[#42bc24]/10 blur-[120px] pointer-events-none"></div>
          {/* Dot pattern */}
          <div className="absolute top-10 right-[35%] grid grid-cols-4 gap-2 opacity-20">
            {[...Array(16)].map((_, i) => <div key={i} className="w-1.5 h-1.5 bg-[#42bc24] rounded-full"></div>)}
          </div>
          <div className="absolute bottom-12 right-10 grid grid-cols-4 gap-2 opacity-20">
            {[...Array(16)].map((_, i) => <div key={i} className="w-1.5 h-1.5 bg-white rounded-full"></div>)}
          </div>
        </div>

        {/* White bottom curve */}
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-[#F8FAFC] rounded-t-[100%] scale-x-150 translate-y-1/2 z-10"></div>

        <div className="max-w-[1200px] mx-auto relative z-20 flex flex-col md:flex-row items-center gap-12">
          {/* Left Content */}
          <div className="flex-1 pt-8">
            <Badge className="bg-[#42bc24]/15 text-[#42bc24] border border-[#42bc24]/30 mb-6 px-4.5 py-2 rounded-full text-[13px] font-black flex items-center w-fit gap-2 shadow-xs">
              JOIN OUR TEAM <Users className="w-4 h-4" />
            </Badge>
            <h1 className="text-5xl md:text-[62px] lg:text-[68px] font-black tracking-tight mb-5 leading-[1.12]">
              Build the Future<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#42bc24] via-emerald-400 to-teal-200">With Us</span>
            </h1>
            <p className="text-[17px] text-slate-200 max-w-[480px] mb-10 leading-relaxed font-normal">
              Discover high-impact opportunities, accelerate your career, and work alongside passionate innovators.
            </p>

            {/* Value Props */}
            <div className="flex flex-wrap gap-8">
              <div className="flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-2xl bg-[#42bc24] flex items-center justify-center shadow-lg shadow-emerald-500/25">
                  <Heart className="w-5.5 h-5.5 text-white" />
                </div>
                <div>
                  <div className="text-[14px] font-black text-white">Great Culture</div>
                  <div className="text-[12px] text-slate-300">People-first workplace</div>
                </div>
              </div>
              <div className="flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-2xl bg-[#0084FF] flex items-center justify-center shadow-lg shadow-blue-500/25">
                  <TrendingUp className="w-5.5 h-5.5 text-white" />
                </div>
                <div>
                  <div className="text-[14px] font-black text-white">Growth &amp; Learning</div>
                  <div className="text-[12px] text-slate-300">Continuous mentorship</div>
                </div>
              </div>
              <div className="flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-2xl bg-[#0D9488] flex items-center justify-center shadow-lg shadow-teal-500/25">
                  <Shield className="w-5.5 h-5.5 text-white" />
                </div>
                <div>
                  <div className="text-[14px] font-black text-white">Make an Impact</div>
                  <div className="text-[12px] text-slate-300">Work that truly matters</div>
                </div>
              </div>
            </div>
          </div>

          {/* Right SVG Artwork - Tailored Career & Talent Growth Graphic (Full View) */}
          <div className="flex-1 relative hidden md:block z-20">
            <div className="relative overflow-hidden rounded-[2.5rem] border-[3px] border-[#42bc24]/30 bg-gradient-to-br from-[#001026]/95 via-[#041d22]/85 to-[#001518]/95 p-6 shadow-2xl backdrop-blur-md">
              <div className="w-full flex flex-col items-center pointer-events-none relative z-10">
                <svg viewBox="0 0 800 480" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet" className="w-full h-auto max-h-[380px]">
                  <defs>
                    <filter id="cimsGlow" x="-30%" y="-30%" width="160%" height="160%">
                      <feGaussianBlur stdDeviation="4.5" result="blur"></feGaussianBlur>
                      <feMerge>
                        <feMergeNode in="blur"></feMergeNode>
                        <feMergeNode in="SourceGraphic"></feMergeNode>
                      </feMerge>
                    </filter>
                    <filter id="hubCoreGlow" x="-50%" y="-50%" width="200%" height="200%">
                      <feGaussianBlur stdDeviation="9" result="blur"></feGaussianBlur>
                      <feMerge>
                        <feMergeNode in="blur"></feMergeNode>
                        <feMergeNode in="SourceGraphic"></feMergeNode>
                      </feMerge>
                    </filter>
                    <linearGradient id="careerGreenGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#42bc24" stopOpacity="0.95"></stop>
                      <stop offset="100%" stopColor="#1e5412" stopOpacity="0.45"></stop>
                    </linearGradient>
                    <linearGradient id="careerCyanGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#00d2d4" stopOpacity="0.85"></stop>
                      <stop offset="100%" stopColor="#004593" stopOpacity="0.45"></stop>
                    </linearGradient>
                    <linearGradient id="stairGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#42bc24" stopOpacity="0.2"></stop>
                      <stop offset="50%" stopColor="#00d2d4" stopOpacity="0.35"></stop>
                      <stop offset="100%" stopColor="#ffcd26" stopOpacity="0.45"></stop>
                    </linearGradient>
                    <linearGradient id="beaconGrad" x1="0%" y1="100%" x2="0%" y2="0%">
                      <stop offset="0%" stopColor="#42bc24" stopOpacity="0"></stop>
                      <stop offset="100%" stopColor="#42bc24" stopOpacity="0.45"></stop>
                    </linearGradient>
                  </defs>

                  {/* Floor Platform & Grid Lines */}
                  <ellipse cx="400" cy="430" rx="360" ry="30" fill="url(#stairGrad)" opacity="0.45"></ellipse>
                  <line x1="80" y1="430" x2="720" y2="430" stroke="rgba(66, 188, 36, 0.35)" strokeWidth="1.8"></line>
                  <line x1="140" y1="440" x2="660" y2="440" stroke="rgba(0, 210, 212, 0.45)" strokeWidth="1.2" strokeDasharray="6 8"></line>

                  {/* Background Upward Energy Rays / Beacon */}
                  <polygon points="340,430 460,430 520,60 280,60" fill="url(#beaconGrad)"></polygon>

                  {/* Career Ladder / Stepping Stones (Ascending Pathway) */}
                  <g transform="translate(125, 255)">
                    {/* Step 1 */}
                    <rect x="0" y="120" width="75" height="18" rx="5" fill="#001a33" stroke="#42bc24" strokeWidth="1.8" filter="url(#cimsGlow)"></rect>
                    <text x="37" y="133" fill="#42bc24" fontSize="11" fontWeight="900" textAnchor="middle" letterSpacing="0.06em">JOIN</text>
                    {/* Step 2 */}
                    <rect x="55" y="80" width="80" height="18" rx="5" fill="#001a33" stroke="#00d2d4" strokeWidth="1.8" filter="url(#cimsGlow)"></rect>
                    <text x="95" y="93" fill="#00d2d4" fontSize="11" fontWeight="900" textAnchor="middle" letterSpacing="0.06em">LEARN</text>
                    {/* Step 3 */}
                    <rect x="115" y="40" width="85" height="18" rx="5" fill="#001a33" stroke="#ffcd26" strokeWidth="1.8" filter="url(#cimsGlow)"></rect>
                    <text x="157" y="53" fill="#ffcd26" fontSize="11" fontWeight="900" textAnchor="middle" letterSpacing="0.06em">BUILD</text>
                    {/* Step 4 (Summit) */}
                    <rect x="180" y="0" width="92" height="20" rx="5" fill="#42bc24" stroke="#ffffff" strokeWidth="2" filter="url(#cimsGlow)"></rect>
                    <text x="226" y="14" fill="#ffffff" fontSize="12" fontWeight="900" textAnchor="middle" letterSpacing="0.06em">LEAD 🚀</text>

                    {/* Connecting Ascending Line */}
                    <path d="M 37 120 L 95 80 L 157 40 L 226 0" fill="none" stroke="#42bc24" strokeWidth="2.4" strokeDasharray="4 4"></path>
                  </g>

                  {/* Candidate / Employee Climbing Career Steps (Left Figure) */}
                  <g transform="translate(190, 215)">
                    <circle cx="20" cy="18" r="11" fill="#001838" stroke="#00d2d4" strokeWidth="1.8"></circle>
                    {/* Hair */}
                    <path d="M 11 15 C 15 7, 29 7, 30 16 Z" fill="#00d2d4"></path>
                    {/* Body */}
                    <path d="M 11 30 L 29 30 L 25 75 L 7 75 Z" fill="url(#careerCyanGrad)" stroke="#00d2d4" strokeWidth="1.5"></path>
                    {/* Arms reaching upward to next step */}
                    <path d="M 24 36 L 46 22 L 60 16" fill="none" stroke="#00d2d4" strokeWidth="2.6" strokeLinecap="round"></path>
                    <path d="M 14 38 L 32 30" fill="none" stroke="#00d2d4" strokeWidth="2.2" strokeLinecap="round"></path>
                    {/* Legs climbing */}
                    <path d="M 12 75 L 24 105 L 38 118" fill="none" stroke="#ffffff" strokeWidth="2.4" strokeLinecap="round"></path>
                    <path d="M 22 75 L 6 95 L -4 135" fill="none" stroke="#ffffff" strokeWidth="2.4" strokeLinecap="round"></path>
                  </g>

                  {/* Central Talent Innovation Core / Hub */}
                  <g transform="translate(400, 160)">
                    <animateTransform attributeName="transform" type="translate" values="400,160; 400,152; 400,160" dur="4s" repeatCount="indefinite"></animateTransform>
                    
                    {/* Pulsing Outer Rings */}
                    <circle cx="0" cy="0" r="68" fill="rgba(66, 188, 36, 0.1)" filter="url(#hubCoreGlow)"></circle>
                    <circle cx="0" cy="0" r="50" fill="none" stroke="#42bc24" strokeWidth="1.6" strokeDasharray="4 4">
                      <animateTransform attributeName="transform" type="rotate" from="0" to="360" dur="20s" repeatCount="indefinite"></animateTransform>
                    </circle>
                    <circle cx="0" cy="0" r="38" fill="rgba(0, 24, 56, 0.95)" stroke="#42bc24" strokeWidth="2.2" filter="url(#cimsGlow)"></circle>
                    
                    {/* Core Career Emblem / Star */}
                    <path d="M 0 -20 L 6 -6 L 20 0 L 6 6 L 0 20 L -6 6 L -20 0 L -6 -6 Z" fill="#ffcd26" filter="url(#cimsGlow)"></path>
                    <circle cx="0" cy="0" r="5.5" fill="#ffffff"></circle>

                    {/* Orbiting Opportunity Nodes */}
                    <g>
                      <animateTransform attributeName="transform" type="rotate" from="0" to="360" dur="12s" repeatCount="indefinite"></animateTransform>
                      <circle cx="72" cy="0" r="8" fill="#42bc24" filter="url(#cimsGlow)"></circle>
                      <circle cx="-72" cy="0" r="7" fill="#00d2d4" filter="url(#cimsGlow)"></circle>
                      <circle cx="0" cy="72" r="7" fill="#ffcd26" filter="url(#cimsGlow)"></circle>
                      <circle cx="0" cy="-72" r="6" fill="#38bdf8" filter="url(#cimsGlow)"></circle>
                    </g>
                  </g>

                  {/* Right Leader / High Achiever Candidate with Laptop & Trophy */}
                  <g transform="translate(560, 235)">
                    <circle cx="45" cy="20" r="13" fill="#001838" stroke="#42bc24" strokeWidth="1.8"></circle>
                    {/* Cap / Style */}
                    <path d="M 32 16 C 35 6, 55 6, 58 16 Z" fill="#42bc24"></path>
                    {/* Body */}
                    <path d="M 34 34 L 56 34 L 51 85 L 29 85 Z" fill="url(#careerGreenGrad)" stroke="#42bc24" strokeWidth="1.5"></path>
                    {/* Holding Laptop */}
                    <path d="M 34 40 L 15 50 L 5 44" fill="none" stroke="#42bc24" strokeWidth="2.4" strokeLinecap="round"></path>
                    <rect x="-8" y="38" width="24" height="15" rx="2" fill="#001a33" stroke="#00d2d4" strokeWidth="1.4" transform="rotate(-15)"></rect>
                    {/* Raising Victory Arm */}
                    <path d="M 52 38 L 74 20 L 85 10" fill="none" stroke="#42bc24" strokeWidth="2.6" strokeLinecap="round"></path>
                    {/* Floating Star in Hand */}
                    <circle cx="90" cy="8" r="6" fill="#ffcd26" filter="url(#cimsGlow)"></circle>
                    {/* Legs standing proud */}
                    <path d="M 34 85 L 28 145 L 20 170" fill="none" stroke="#ffffff" strokeWidth="2.4" strokeLinecap="round"></path>
                    <path d="M 48 85 L 56 145 L 68 170" fill="none" stroke="#ffffff" strokeWidth="2.4" strokeLinecap="round"></path>
                  </g>

                  {/* Floating Skill & Role Opportunity Badges Matching Live Departments */}
                  {/* Badge 1: Software Development */}
                  <g transform="translate(70, 65)">
                    <animateTransform attributeName="transform" type="translate" values="70,65; 70,57; 70,65" dur="3.2s" repeatCount="indefinite"></animateTransform>
                    <rect x="0" y="0" width="205" height="42" rx="12" fill="#001838" stroke="#00d2d4" strokeWidth="1.8" filter="url(#cimsGlow)"></rect>
                    <circle cx="22" cy="21" r="9" fill="#00d2d4"></circle>
                    <text x="38" y="27" fill="#ffffff" fontSize="14.5" fontWeight="900" fontFamily="system-ui, sans-serif">💻 Software Dev</text>
                  </g>

                  {/* Badge 2: Multimedia Design */}
                  <g transform="translate(530, 55)">
                    <animateTransform attributeName="transform" type="translate" values="530,55; 530,47; 530,55" dur="3.6s" repeatCount="indefinite"></animateTransform>
                    <rect x="0" y="0" width="215" height="42" rx="12" fill="#001838" stroke="#42bc24" strokeWidth="1.8" filter="url(#cimsGlow)"></rect>
                    <circle cx="22" cy="21" r="9" fill="#42bc24"></circle>
                    <text x="38" y="27" fill="#ffffff" fontSize="14.5" fontWeight="900" fontFamily="system-ui, sans-serif">🎨 Multimedia Design</text>
                  </g>

                  {/* Badge 3: Elearning */}
                  <g transform="translate(560, 145)">
                    <animateTransform attributeName="transform" type="translate" values="560,145; 560,139; 560,145" dur="4.2s" repeatCount="indefinite"></animateTransform>
                    <rect x="0" y="0" width="165" height="40" rx="12" fill="#001838" stroke="#ffcd26" strokeWidth="1.8" filter="url(#cimsGlow)"></rect>
                    <circle cx="20" cy="20" r="8" fill="#ffcd26"></circle>
                    <text x="36" y="26" fill="#ffffff" fontSize="14.5" fontWeight="900" fontFamily="system-ui, sans-serif">📚 Elearning</text>
                  </g>

                  {/* Badge 4: QA Testing */}
                  <g transform="translate(90, 150)">
                    <animateTransform attributeName="transform" type="translate" values="90,150; 90,144; 90,150" dur="3.8s" repeatCount="indefinite"></animateTransform>
                    <rect x="0" y="0" width="165" height="40" rx="12" fill="#001838" stroke="#38bdf8" strokeWidth="1.8" filter="url(#cimsGlow)"></rect>
                    <circle cx="20" cy="20" r="8" fill="#38bdf8"></circle>
                    <text x="36" y="26" fill="#ffffff" fontSize="14.5" fontWeight="900" fontFamily="system-ui, sans-serif">🔬 QA Testing</text>
                  </g>

                  {/* 4 Animated Laser Connection Streams linking Badges to Central Round Hub */}
                  {/* Link 1: Software Dev to Hub */}
                  <path id="linkSoftwareDev" d="M 180 86 C 260 90, 310 130, 360 150" fill="none" stroke="rgba(0, 210, 212, 0.55)" strokeWidth="2" strokeDasharray="5 7"></path>
                  <circle r="4.5" fill="#00d2d4" filter="url(#cimsGlow)">
                    <animateMotion path="M 180 86 C 260 90, 310 130, 360 150" dur="2.8s" repeatCount="indefinite"></animateMotion>
                  </circle>

                  {/* Link 2: Multimedia Design to Hub */}
                  <path id="linkMultimedia" d="M 620 80 C 540 85, 490 130, 440 150" fill="none" stroke="rgba(66, 188, 36, 0.55)" strokeWidth="2" strokeDasharray="5 7"></path>
                  <circle r="4.5" fill="#42bc24" filter="url(#cimsGlow)">
                    <animateMotion path="M 620 80 C 540 85, 490 130, 440 150" dur="3.2s" repeatCount="indefinite"></animateMotion>
                  </circle>

                  {/* Link 3: QA Testing to Hub */}
                  <path id="linkQA" d="M 180 170 C 250 170, 300 165, 360 165" fill="none" stroke="rgba(56, 189, 248, 0.55)" strokeWidth="2" strokeDasharray="5 7"></path>
                  <circle r="4.5" fill="#38bdf8" filter="url(#cimsGlow)">
                    <animateMotion path="M 180 170 C 250 170, 300 165, 360 165" dur="3s" repeatCount="indefinite"></animateMotion>
                  </circle>

                  {/* Link 4: Elearning to Hub */}
                  <path id="linkElearning" d="M 620 165 C 550 165, 500 165, 440 165" fill="none" stroke="rgba(255, 205, 38, 0.55)" strokeWidth="2" strokeDasharray="5 7"></path>
                  <circle r="4.5" fill="#ffcd26" filter="url(#cimsGlow)">
                    <animateMotion path="M 620 165 C 550 165, 500 165, 440 165" dur="3.4s" repeatCount="indefinite"></animateMotion>
                  </circle>

                  {/* Bottom Brand Motto */}
                  <g transform="translate(400, 465)" textAnchor="middle">
                    <text fill="#42bc24" fontSize="13.5" fontWeight="900" letterSpacing="0.22em" fontFamily="system-ui, sans-serif">
                      DISCOVER YOUR POTENTIAL • GROW WITH HEXALEARN
                    </text>
                  </g>
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-[1200px] mx-auto px-6 py-12 relative z-30">
        {!selectedJob ? (
          <>
            {/* Search and Quick Filters Bar */}
            <div className="bg-white p-4.5 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-200/70 mb-8 -mt-20 relative z-30 space-y-4">
              <div className="flex flex-col md:flex-row items-center gap-3">
                <div className="flex items-center gap-3 flex-1 px-3.5 py-2 w-full bg-slate-50/80 rounded-xl border border-slate-200/70 focus-within:border-[#42bc24] focus-within:bg-white focus-within:ring-2 focus-within:ring-emerald-500/10 transition-all">
                  <Search className="h-4.5 w-4.5 text-slate-400 shrink-0" />
                  <input
                    type="text"
                    placeholder="Search by job title, department, skills or location..."
                    className="w-full bg-transparent border-none outline-none text-[13.5px] text-slate-800 placeholder:text-slate-400"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                  {search && (
                    <button onClick={() => setSearch("")} className="text-xs font-bold text-slate-400 hover:text-slate-600 px-1.5 py-0.5">
                      Clear
                    </button>
                  )}
                </div>

                {/* Work Mode Toggle Filter */}
                <div className="flex items-center gap-1.5 p-1 bg-slate-100/90 rounded-xl shrink-0 w-full md:w-auto overflow-x-auto">
                  {["All", "Remote", "Hybrid", "On-site"].map((mode) => (
                    <button
                      key={mode}
                      onClick={() => setSelectedWorkMode(mode)}
                      className={cn(
                        "px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all whitespace-nowrap",
                        selectedWorkMode.toLowerCase() === mode.toLowerCase()
                          ? "bg-white text-emerald-800 shadow-xs font-black"
                          : "text-slate-600 hover:text-slate-900"
                      )}
                    >
                      {mode === "All" ? "All Modes" : mode}
                    </button>
                  ))}
                </div>
              </div>

              {/* Dynamic Department Filter Pills */}
              {departments.length > 0 && (
                <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1.5 scrollbar-none border-t border-slate-100">
                  <span className="text-[11.5px] font-black uppercase tracking-wider text-slate-400 shrink-0 mr-1 flex items-center gap-1">
                    <Building2 className="w-3.5 h-3.5 text-[#42bc24]" /> Department:
                  </span>
                  <button
                    onClick={() => setSelectedDept("All")}
                    className={cn(
                      "px-3.5 py-1.5 text-[12.5px] font-bold rounded-full transition-all shrink-0 border flex items-center gap-1.5 shadow-xs",
                      selectedDept === "All"
                        ? "bg-[#42bc24] text-white border-[#42bc24]"
                        : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100 hover:text-slate-900"
                    )}
                  >
                    <span>All</span>
                    <span className={cn(
                      "px-1.5 py-0.2 rounded-full text-[11px] font-black",
                      selectedDept === "All" ? "bg-white/20 text-white" : "bg-slate-200 text-slate-700"
                    )}>
                      {jobs.length}
                    </span>
                  </button>
                  {departments.map((dept) => {
                    const count = jobs.filter(j => j.department === dept).length;
                    const isSelected = selectedDept.toLowerCase() === dept.toLowerCase();
                    return (
                      <button
                        key={dept}
                        onClick={() => setSelectedDept(dept)}
                        className={cn(
                          "px-3.5 py-1.5 text-[12.5px] font-bold rounded-full transition-all shrink-0 border flex items-center gap-1.5 shadow-xs capitalize",
                          isSelected
                            ? "bg-[#42bc24] text-white border-[#42bc24]"
                            : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100 hover:text-slate-900"
                        )}
                      >
                        <span>{dept}</span>
                        <span className={cn(
                          "px-1.5 py-0.2 rounded-full text-[11px] font-black",
                          isSelected ? "bg-white/20 text-white" : "bg-slate-200 text-slate-700"
                        )}>
                          {count}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="flex flex-col lg:flex-row gap-8">
              {/* Main Job List */}
              <div className="flex-1">
                <div className="flex items-center justify-between mb-5">
                  <h2 className="text-[19px] font-black text-slate-900 flex items-center gap-2">
                    <Users className="w-5 h-5 text-[#42bc24]" /> Open Positions
                    <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                      {filteredJobs.length} {filteredJobs.length === 1 ? 'Job' : 'Jobs'}
                    </span>
                  </h2>
                </div>

                {loading ? (
                  <div className="flex justify-center py-20">
                    <Loader2 className="h-10 w-10 text-[#42bc24] animate-spin" />
                  </div>
                ) : (
                  <div className="grid gap-3.5">
                    {filteredJobs.length === 0 ? (
                      <div className="text-center py-20 bg-white rounded-2xl border border-slate-200/80 p-8 shadow-xs">
                        <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center mx-auto mb-3 text-[#42bc24] border border-emerald-100">
                          <Briefcase className="w-7 h-7" />
                        </div>
                        <h4 className="text-base font-bold text-slate-900 mb-1">No positions match your criteria</h4>
                        <p className="text-slate-500 text-xs max-w-sm mx-auto mb-4">Try clearing filters or search query to explore all open opportunities.</p>
                        <Button 
                          variant="outline" 
                          onClick={() => { setSearch(""); setSelectedDept("All"); setSelectedWorkMode("All"); }}
                          className="rounded-xl text-xs font-bold border-slate-200 hover:border-emerald-300 text-slate-700"
                        >
                          Reset Filters
                        </Button>
                      </div>
                    ) : (
                      paginatedJobs.map(job => (
                        <div
                          key={job.id}
                          className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-[0_2px_10px_rgb(0,0,0,0.02)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] hover:border-emerald-300 transition-all flex flex-col md:flex-row md:items-center justify-between gap-5 group"
                        >
                          <div className="flex gap-4">
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#42bc24] to-[#36961c] flex items-center justify-center shrink-0 text-white shadow-md shadow-emerald-500/20 group-hover:scale-105 transition-transform">
                              <Briefcase className="w-5 h-5" />
                            </div>
                            <div>
                              <div className="flex flex-wrap items-center gap-2 mb-1">
                                <h3 className="text-[16px] font-black text-slate-900 group-hover:text-emerald-700 transition-colors">
                                  {job.title}
                                </h3>
                                <Badge className="bg-slate-100 text-slate-700 hover:bg-slate-100 border-slate-200 rounded-md px-2 py-0.5 text-[10.5px] font-bold">
                                  {job.job_type || 'Full Time'}
                                </Badge>
                                {job.work_mode && (
                                  <Badge className="bg-emerald-50 text-emerald-800 hover:bg-emerald-50 border-emerald-200 rounded-md px-2 py-0.5 text-[10.5px] font-bold">
                                    {job.work_mode}
                                  </Badge>
                                )}
                              </div>
                              <div className="text-[12.5px] text-emerald-700 font-bold mb-2.5">
                                {job.department}
                              </div>
                              <div className="flex flex-wrap items-center gap-4 text-[11.5px] text-slate-500 font-medium">
                                <span className="flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5 text-slate-400" /> {job.location || 'Remote'}</span>
                                <span className="flex items-center gap-1.5">
                                  <Briefcase className="h-3.5 w-3.5 text-slate-400" /> 
                                  {job.min_exp || job.max_exp ? `${job.min_exp}-${job.max_exp} Yrs` : '0-2 Yrs'}
                                </span>
                                {job.min_salary > 0 && (
                                  <span className="flex items-center gap-1 text-slate-700 font-bold">
                                    ₹{(job.min_salary / 100000).toFixed(0)}L - ₹{(job.max_salary / 100000).toFixed(0)}L
                                  </span>
                                )}
                                {job.openings > 1 && (
                                  <span className="text-[11px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                                    {job.openings} Openings
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="flex flex-col sm:flex-row md:flex-col items-start md:items-end justify-between md:justify-center gap-3 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-slate-100">
                            <div className="text-[11px] text-slate-400 font-bold">
                              {job.created_at ? new Date(job.created_at).toLocaleDateString("en-US", { month: 'short', day: 'numeric', year: 'numeric' }) : 'Recently'}
                            </div>
                            <Button 
                              onClick={() => setSelectedJob(job)} 
                              className="h-9.5 rounded-xl text-[12.5px] font-bold bg-[#42bc24] text-white hover:bg-[#36961c] px-5 gap-1.5 transition-all shadow-sm shadow-emerald-500/20"
                            >
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
                          className="h-9 px-4 text-[13px] text-slate-600 border-slate-200 hover:bg-slate-50 rounded-xl font-bold" 
                          disabled={currentPage === 1}
                          onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                        >
                          Previous
                        </Button>
                        
                        {[...Array(totalPages)].map((_, i) => (
                          <Button 
                            key={i}
                            variant={currentPage === i + 1 ? "default" : "outline"} 
                            className={`h-9 w-9 p-0 rounded-xl font-bold ${currentPage === i + 1 ? 'bg-[#42bc24] text-white hover:bg-[#36961c] shadow-xs' : 'text-slate-600 border-slate-200 hover:bg-slate-50'}`}
                            onClick={() => setCurrentPage(i + 1)}
                          >
                            {i + 1}
                          </Button>
                        ))}
                        
                        <Button 
                          variant="outline" 
                          className="h-9 px-4 text-[13px] text-slate-600 border-slate-200 hover:bg-slate-50 rounded-xl font-bold" 
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
                {/* Dynamic Jobs by Department */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-[0_2px_10px_rgb(0,0,0,0.02)]">
                  <h3 className="text-[15px] font-bold text-slate-900 flex items-center gap-2 mb-4">
                    <Building2 className="w-4 h-4 text-[#42bc24]" /> Jobs by Department
                  </h3>
                  <div className="flex items-center justify-between text-[12.5px] font-bold text-slate-900 mb-3 border-b border-slate-100 pb-2">
                    <span>Total Openings</span>
                    <span className="px-2.5 py-0.5 bg-emerald-50 text-emerald-800 rounded-full text-xs font-black border border-emerald-200">{jobs.length}</span>
                  </div>
                  <div className="space-y-3.5">
                    {departments.map((dept, i) => {
                      const count = jobs.filter(j => j.department === dept).length;
                      const colors = ['bg-[#42bc24]', 'bg-[#0084FF]', 'bg-[#8B5CF6]', 'bg-[#0D9488]', 'bg-[#F59E0B]', 'bg-[#F43F5E]'];
                      const barColor = colors[i % colors.length];
                      return (
                        <div 
                          key={dept} 
                          onClick={() => setSelectedDept(dept)}
                          className="text-[12px] font-medium text-slate-600 cursor-pointer hover:text-emerald-700 transition-colors group"
                        >
                          <div className="flex justify-between mb-1.5">
                            <span className="font-bold group-hover:text-emerald-700">{dept}</span>
                            <span className="font-bold text-slate-900">{count}</span>
                          </div>
                          <div className="w-full bg-slate-100 rounded-full h-1.5">
                            <div className={`${barColor} h-1.5 rounded-full`} style={{ width: `${(count / Math.max(1, jobs.length)) * 100}%` }}></div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Why Join Us? */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-[0_2px_10px_rgb(0,0,0,0.02)]">
                  <h3 className="text-[15px] font-bold text-slate-900 flex items-center gap-2 mb-5">
                    <Building2 className="w-4 h-4 text-[#42bc24]" /> Why Join Us?
                  </h3>
                  <div className="space-y-4">
                    <div className="flex gap-3">
                      <div className="w-8 h-8 rounded-lg bg-emerald-50 text-[#42bc24] border border-emerald-200 flex items-center justify-center shrink-0 font-bold text-xs">
                        ₹
                      </div>
                      <div>
                        <div className="text-[13px] font-bold text-slate-900">Competitive Compensation</div>
                        <div className="text-[11px] text-slate-500">We value your talent and industry impact</div>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 border border-purple-200 flex items-center justify-center shrink-0">
                        <Heart className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-[13px] font-bold text-slate-900">Health & Wellness</div>
                        <div className="text-[11px] text-slate-500">Comprehensive health and medical support</div>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 border border-blue-200 flex items-center justify-center shrink-0">
                        <Settings className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-[13px] font-bold text-slate-900">Flexible Work Arrangements</div>
                        <div className="text-[11px] text-slate-500">Hybrid & remote-friendly collaboration</div>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center shrink-0">
                        <GraduationCap className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-[13px] font-bold text-slate-900">Learning & Upskilling</div>
                        <div className="text-[11px] text-slate-500">Continuous workshops & learning stipends</div>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <div className="w-8 h-8 rounded-lg bg-emerald-50 text-[#42bc24] border border-emerald-200 flex items-center justify-center shrink-0">
                        <Users className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-[13px] font-bold text-slate-900">Inclusive Culture</div>
                        <div className="text-[11px] text-slate-500">Collaborative, supportive, and open teams</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Don't see the right role? */}
                <div className="bg-gradient-to-br from-[#0B2524] to-[#000C22] p-6 rounded-2xl text-white relative overflow-hidden shadow-lg border border-emerald-900/40">
                  <div className="absolute right-0 top-0 w-32 h-32 bg-[#42bc24]/10 rounded-full blur-2xl -mr-10 -mt-10"></div>
                  <h3 className="text-[16px] font-bold mb-2 relative z-10">Don't see the right role?</h3>
                  <p className="text-[13px] text-slate-300 mb-5 relative z-10 leading-relaxed">
                    We are always keen to connect with driven people. Submit your profile for future roles.
                  </p>
                  <Button 
                    onClick={() => {
                      if (jobs.length > 0) setSelectedJob(jobs[0]);
                    }} 
                    className="w-full bg-[#42bc24] hover:bg-[#36961c] text-white h-10 rounded-xl text-[13px] font-bold relative z-10 gap-2 shadow-sm"
                  >
                    <Upload className="w-4 h-4" /> Submit General Application
                  </Button>
                </div>

                {/* Need Help? */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-[0_2px_10px_rgb(0,0,0,0.02)]">
                  <div className="flex items-start gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 text-[#42bc24] border border-emerald-200 flex items-center justify-center shrink-0">
                      <HelpCircle className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-[14px] font-bold text-slate-900">Need Assistance?</h3>
                      <p className="text-[12px] text-slate-500 mt-1">Our Talent Acquisition team is here to assist you.</p>
                    </div>
                  </div>
                  <div className="space-y-3 pt-3 border-t border-slate-100 text-[13px] font-medium text-slate-600">
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-emerald-600" /> contact-us@hexalearn.com
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-emerald-600" /> +91-9938339054
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Sections */}
            <div className="mt-20 pt-16 border-t border-slate-200">
              <div className="text-center max-w-2xl mx-auto mb-12">
                <h2 className="text-3xl font-black text-slate-900 mb-3">Life at Our Company</h2>
                <p className="text-slate-500 text-[15px]">We are building more than products — we are shaping careers and empowering creators.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
                <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs text-center md:text-left hover:border-emerald-300 transition-colors">
                  <div className="w-12 h-12 rounded-xl bg-emerald-50 text-[#42bc24] border border-emerald-200 flex items-center justify-center mb-4 mx-auto md:mx-0">
                    <Lightbulb className="w-6 h-6" />
                  </div>
                  <h4 className="text-[15px] font-bold text-slate-900 mb-2">Innovative Culture</h4>
                  <p className="text-[13px] text-slate-500 leading-relaxed">Work with modern technology stacks and solve complex challenges.</p>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs text-center md:text-left hover:border-blue-300 transition-colors">
                  <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 border border-blue-200 flex items-center justify-center mb-4 mx-auto md:mx-0">
                    <Users className="w-6 h-6" />
                  </div>
                  <h4 className="text-[15px] font-bold text-slate-900 mb-2">Collaborative Teams</h4>
                  <p className="text-[13px] text-slate-500 leading-relaxed">Work with supportive, smart teammates in an open environment.</p>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-emerald-200/80 shadow-xs bg-emerald-50/20 text-center md:text-left hover:border-emerald-400 transition-colors">
                  <div className="w-12 h-12 rounded-xl bg-emerald-50 text-[#42bc24] border border-emerald-200 flex items-center justify-center mb-4 mx-auto md:mx-0">
                    <Heart className="w-6 h-6" />
                  </div>
                  <h4 className="text-[15px] font-bold text-slate-900 mb-2">Career Acceleration</h4>
                  <p className="text-[13px] text-slate-500 leading-relaxed">Structured growth paths, fast reviews, and leadership opportunities.</p>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs text-center md:text-left hover:border-amber-300 transition-colors">
                  <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center mb-4 mx-auto md:mx-0">
                    <Clock className="w-6 h-6" />
                  </div>
                  <h4 className="text-[15px] font-bold text-slate-900 mb-2">Work-Life Balance</h4>
                  <p className="text-[13px] text-slate-500 leading-relaxed">We value your wellbeing with flexible schedules and generous leave.</p>
                </div>
              </div>

              {/* Application Process */}
              <div className="bg-white rounded-3xl p-10 border border-slate-200/80 shadow-xs text-center mb-20">
                <h2 className="text-2xl font-black text-slate-900 mb-12">Our Hiring Journey</h2>
                <div className="flex flex-col md:flex-row justify-between relative">
                  {/* Connecting Line */}
                  <div className="hidden md:block absolute top-6 left-[10%] right-[10%] h-0.5 bg-slate-100 border-t-2 border-dashed border-emerald-200 z-0"></div>

                  {[
                    { step: '1', title: 'Apply', desc: 'Submit application online', icon: <ClipboardCheck className="w-5 h-5" /> },
                    { step: '2', title: 'Screening', desc: 'Recruiter profile review', icon: <Users className="w-5 h-5" /> },
                    { step: '3', title: 'Interview', desc: 'Technical & culture rounds', icon: <Calendar className="w-5 h-5" /> },
                    { step: '4', title: 'Offer', desc: 'Formal offer roll-out', icon: <CheckCircle2 className="w-5 h-5" /> },
                    { step: '5', title: 'Welcome', desc: 'Smooth onboarding journey', icon: <Shield className="w-5 h-5" /> }
                  ].map((process, i) => (
                    <div key={i} className="relative z-10 flex flex-col items-center w-full md:w-1/5 mb-8 md:mb-0 group cursor-pointer">
                      <div className="w-12 h-12 rounded-full bg-white border-[3px] border-emerald-100 text-[#42bc24] flex items-center justify-center mb-4 shadow-sm group-hover:-translate-y-2 group-hover:scale-110 group-hover:border-[#42bc24] group-hover:shadow-md group-hover:bg-emerald-50 transition-all duration-300 ease-out">
                        {process.icon}
                      </div>
                      <h4 className="text-[14px] font-bold text-slate-900 mb-1 group-hover:text-[#42bc24] transition-colors duration-300">{process.step}. {process.title}</h4>
                      <p className="text-[12px] text-slate-500 max-w-[120px] group-hover:text-slate-700 transition-colors duration-300">{process.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-200/80 overflow-hidden flex flex-col md:flex-row max-w-5xl mx-auto my-10">
            {/* Job Details Sidebar */}
            <div className="w-full md:w-[40%] bg-gradient-to-b from-[#000C22] via-[#04161F] to-[#0B2524] text-white p-8 md:p-10 flex flex-col relative overflow-hidden">
              <div className="absolute top-0 right-0 w-[150%] h-[150%] bg-[#42bc24]/10 rounded-full blur-[80px] pointer-events-none" />

              <button
                onClick={() => setSelectedJob(null)}
                className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-[13px] font-bold w-fit mb-8 relative z-10"
              >
                <ArrowLeft className="h-4 w-4" /> Back to open jobs
              </button>

              <div className="relative z-10">
                <Badge className="bg-[#42bc24]/20 text-[#42bc24] border border-[#42bc24]/30 rounded-lg px-3 py-1 mb-4 font-bold">
                  {selectedJob.department}
                </Badge>
                <h2 className="text-3xl font-black mb-6 leading-tight">
                  {selectedJob.title}
                </h2>

                <div className="space-y-4 mb-8">
                  <div className="flex items-center gap-3 text-slate-300">
                    <div className="bg-white/5 p-2.5 rounded-xl"><MapPin className="h-5 w-5 text-emerald-400" /></div>
                    <div>
                      <div className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">Location</div>
                      <div className="font-medium text-white">{selectedJob.location || 'Remote'}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-slate-300">
                    <div className="bg-white/5 p-2.5 rounded-xl"><Clock className="h-5 w-5 text-teal-400" /></div>
                    <div>
                      <div className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">Type & Mode</div>
                      <div className="font-medium text-white">{selectedJob.job_type || selectedJob.type || 'Full Time'} • {selectedJob.work_mode || 'Hybrid'}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-slate-300">
                    <div className="bg-white/5 p-2.5 rounded-xl"><Briefcase className="h-5 w-5 text-amber-400" /></div>
                    <div>
                      <div className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">Experience</div>
                      <div className="font-medium text-white">{selectedJob.min_exp}-{selectedJob.max_exp} Years</div>
                    </div>
                  </div>
                  {selectedJob.min_salary > 0 && (
                    <div className="flex items-center gap-3 text-slate-300">
                      <div className="bg-white/5 p-2.5 rounded-xl"><Badge className="p-0 bg-transparent text-[#42bc24] font-bold text-base">₹</Badge></div>
                      <div>
                        <div className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">Salary Range</div>
                        <div className="font-bold text-white">₹{(selectedJob.min_salary / 100000).toFixed(1)}L - ₹{(selectedJob.max_salary / 100000).toFixed(1)} LPA</div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="prose prose-invert prose-sm max-w-none text-slate-300">
                  <h3 className="text-white text-[15px] font-bold mb-2">Role Overview</h3>
                  <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(selectedJob.description || '<p>We are looking for a talented individual to join our team.</p>') }} />
                </div>
              </div>
            </div>

            {/* Application Form */}
            <div className="w-full md:w-[60%] p-8 md:p-12 bg-white relative z-10 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-6 mb-8 border-b border-slate-100">
                  <div>
                    <h3 className="text-2xl font-black text-slate-900 tracking-tight">Apply for this position</h3>
                    <p className="text-xs text-slate-500 font-medium mt-1">Please complete the form below. Fields marked with <span className="text-rose-500 font-bold">*</span> are required.</p>
                  </div>
                  <Badge className="bg-emerald-50 text-emerald-800 border-emerald-200 px-3 py-1 text-[11px] font-bold rounded-lg shrink-0">
                    {selectedJob.job_type || selectedJob.type || 'Full Time'}
                  </Badge>
                </div>

                <form onSubmit={handleSubmit} className="space-y-8">
                  {/* Section 1: Personal Information */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-slate-400">
                      <Users className="w-3.5 h-3.5 text-[#42bc24]" />
                      Personal Information
                    </div>

                    <div>
                      <Label className="text-slate-700 text-xs font-bold mb-1.5 block">Full Name <span className="text-rose-500">*</span></Label>
                      <Input
                        value={name}
                        onChange={e => setName(e.target.value)}
                        placeholder="e.g. John Doe"
                        className={`h-11 rounded-xl text-xs font-semibold focus-visible:ring-[#42bc24] ${hasSubmitted && !name ? 'bg-red-50/50 border-red-400' : 'bg-slate-50/60 border-slate-200'}`}
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <Label className="text-slate-700 text-xs font-bold mb-1.5 block">Email Address <span className="text-rose-500">*</span></Label>
                        <Input
                          type="email"
                          value={email}
                          onChange={e => setEmail(e.target.value)}
                          placeholder="john@example.com"
                          className={`h-11 rounded-xl text-xs font-semibold focus-visible:ring-[#42bc24] ${hasSubmitted && !email ? 'bg-red-50/50 border-red-400' : 'bg-slate-50/60 border-slate-200'}`}
                        />
                      </div>
                      <div>
                        <Label className="text-slate-700 text-xs font-bold mb-1.5 block">Phone Number <span className="text-rose-500">*</span></Label>
                        <Input
                          value={phone}
                          onChange={e => setPhone(e.target.value)}
                          placeholder="+91 98765 43210"
                          className={`h-11 rounded-xl text-xs font-semibold focus-visible:ring-[#42bc24] ${hasSubmitted && !phone ? 'bg-red-50/50 border-red-400' : 'bg-slate-50/60 border-slate-200'}`}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <Label className="text-slate-700 text-xs font-bold mb-1.5 block">Alternate Mobile <span className="text-slate-400 font-normal">(Optional)</span></Label>
                        <Input 
                          value={alternateMobile} 
                          onChange={e => setAlternateMobile(e.target.value)} 
                          placeholder="+91 98765 43211" 
                          className="h-11 bg-slate-50/60 border-slate-200 rounded-xl text-xs font-semibold focus-visible:ring-[#42bc24]" 
                        />
                      </div>
                      <div>
                        <Label className="text-slate-700 text-xs font-bold mb-1.5 block">LinkedIn Profile <span className="text-slate-400 font-normal">(Optional)</span></Label>
                        <Input 
                          value={linkedInProfile} 
                          onChange={e => setLinkedInProfile(e.target.value)} 
                          placeholder="https://linkedin.com/in/username" 
                          className="h-11 bg-slate-50/60 border-slate-200 rounded-xl text-xs font-semibold focus-visible:ring-[#42bc24]" 
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <Label className="text-slate-700 text-xs font-bold mb-1.5 block">Current Location <span className="text-rose-500">*</span></Label>
                        <Input 
                          value={location} 
                          onChange={e => setLocation(e.target.value)} 
                          placeholder="e.g. Bhubaneswar, India" 
                          className={`h-11 rounded-xl text-xs font-semibold focus-visible:ring-[#42bc24] ${hasSubmitted && !location ? 'bg-red-50/50 border-red-400' : 'bg-slate-50/60 border-slate-200'}`} 
                        />
                      </div>
                      <div>
                        <Label className="text-slate-700 text-xs font-bold mb-1.5 block">Preferred Location <span className="text-rose-500">*</span></Label>
                        <Input 
                          value={preferredLocation} 
                          onChange={e => setPreferredLocation(e.target.value)} 
                          placeholder="e.g. Remote / Hybrid" 
                          className={`h-11 rounded-xl text-xs font-semibold focus-visible:ring-[#42bc24] ${hasSubmitted && !preferredLocation ? 'bg-red-50/50 border-red-400' : 'bg-slate-50/60 border-slate-200'}`} 
                        />
                      </div>
                    </div>
                  </div>

                  {/* Section 2: Professional & Experience Details */}
                  <div className="space-y-4 pt-4 border-t border-slate-100">
                    <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-slate-400">
                      <Briefcase className="w-3.5 h-3.5 text-[#42bc24]" />
                      Professional & Experience
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <Label className="text-slate-700 text-xs font-bold mb-1.5 block">Total Experience <span className="text-rose-500">*</span></Label>
                        <select 
                          value={experience} 
                          onChange={e => setExperience(e.target.value)} 
                          className={`w-full h-11 rounded-xl px-3 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#42bc24] border ${hasSubmitted && !experience ? 'bg-red-50/50 border-red-400' : 'bg-slate-50/60 border-slate-200 text-slate-700'}`}
                        >
                          <option value="">Select Experience</option>
                          <option value="Fresher">Fresher (0 years)</option>
                          <option value="1-3 Years">1-3 Years</option>
                          <option value="3-5 Years">3-5 Years</option>
                          <option value="5-8 Years">5-8 Years</option>
                          <option value="8+ Years">8+ Years</option>
                        </select>
                      </div>
                      <div>
                        <Label className="text-slate-700 text-xs font-bold mb-1.5 block">Relevant Experience <span className="text-rose-500">*</span></Label>
                        <select 
                          value={relevantExperience} 
                          onChange={e => setRelevantExperience(e.target.value)} 
                          className={`w-full h-11 rounded-xl px-3 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#42bc24] border ${hasSubmitted && !relevantExperience ? 'bg-red-50/50 border-red-400' : 'bg-slate-50/60 border-slate-200 text-slate-700'}`}
                        >
                          <option value="">Select Relevant Exp</option>
                          <option value="Fresher">Fresher (0 years)</option>
                          <option value="1-3 Years">1-3 Years</option>
                          <option value="3-5 Years">3-5 Years</option>
                          <option value="5-8 Years">5-8 Years</option>
                          <option value="8+ Years">8+ Years</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <Label className="text-slate-700 text-xs font-bold mb-1.5 flex items-center justify-between">
                          <span>Current Company {!isFresher && <span className="text-rose-500">*</span>}</span>
                          {isFresher && <span className="text-[10px] text-slate-400 font-normal">Not required for Fresher</span>}
                        </Label>
                        <Input 
                          value={currentCompany} 
                          disabled={isFresher}
                          onChange={e => setCurrentCompany(e.target.value)} 
                          placeholder={isFresher ? "N/A (Fresher)" : "e.g. Acme Innovations"} 
                          className={`h-11 rounded-xl text-xs font-semibold focus-visible:ring-[#42bc24] ${isFresher ? 'bg-slate-100/60 text-slate-400 cursor-not-allowed border-slate-200' : hasSubmitted && !isFresher && !currentCompany ? 'bg-red-50/50 border-red-400' : 'bg-slate-50/60 border-slate-200'}`} 
                        />
                      </div>
                      <div>
                        <Label className="text-slate-700 text-xs font-bold mb-1.5 flex items-center justify-between">
                          <span>Current Designation {!isFresher && <span className="text-rose-500">*</span>}</span>
                          {isFresher && <span className="text-[10px] text-slate-400 font-normal">Not required for Fresher</span>}
                        </Label>
                        <Input 
                          value={currentDesignation} 
                          disabled={isFresher}
                          onChange={e => setCurrentDesignation(e.target.value)} 
                          placeholder={isFresher ? "N/A (Fresher)" : "e.g. Software Engineer"} 
                          className={`h-11 rounded-xl text-xs font-semibold focus-visible:ring-[#42bc24] ${isFresher ? 'bg-slate-100/60 text-slate-400 cursor-not-allowed border-slate-200' : hasSubmitted && !isFresher && !currentDesignation ? 'bg-red-50/50 border-red-400' : 'bg-slate-50/60 border-slate-200'}`} 
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <Label className="text-slate-700 text-xs font-bold mb-1.5 flex items-center justify-between">
                          <span>Current CTC {!isFresher && <span className="text-rose-500">*</span>}</span>
                          {isFresher && <span className="text-[10px] text-slate-400 font-normal">Not req.</span>}
                        </Label>
                        <Input 
                          value={currentCtc} 
                          disabled={isFresher}
                          onChange={e => setCurrentCtc(e.target.value)} 
                          placeholder={isFresher ? "N/A" : "e.g. 6 LPA"} 
                          className={`h-11 rounded-xl text-xs font-semibold focus-visible:ring-[#42bc24] ${isFresher ? 'bg-slate-100/60 text-slate-400 cursor-not-allowed border-slate-200' : hasSubmitted && !isFresher && !currentCtc ? 'bg-red-50/50 border-red-400' : 'bg-slate-50/60 border-slate-200'}`} 
                        />
                      </div>
                      <div>
                        <Label className="text-slate-700 text-xs font-bold mb-1.5 block">Expected CTC <span className="text-rose-500">*</span></Label>
                        <Input 
                          value={expectedCtc} 
                          onChange={e => setExpectedCtc(e.target.value)} 
                          placeholder="e.g. 9 LPA" 
                          className={`h-11 rounded-xl text-xs font-semibold focus-visible:ring-[#42bc24] ${hasSubmitted && !expectedCtc ? 'bg-red-50/50 border-red-400' : 'bg-slate-50/60 border-slate-200'}`} 
                        />
                      </div>
                      <div>
                        <Label className="text-slate-700 text-xs font-bold mb-1.5 block">Notice Period <span className="text-rose-500">*</span></Label>
                        <select 
                          value={noticePeriod} 
                          onChange={e => setNoticePeriod(e.target.value)} 
                          className={`w-full h-11 rounded-xl px-3 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#42bc24] text-slate-700 border ${hasSubmitted && !noticePeriod ? 'bg-red-50/50 border-red-400' : 'bg-slate-50/60 border-slate-200'}`}
                        >
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
                      <Label className="text-slate-700 text-xs font-bold mb-1.5 block">Key Skills <span className="text-rose-500">*</span></Label>
                      <Input 
                        value={skills} 
                        onChange={e => setSkills(e.target.value)} 
                        placeholder="e.g. React, Node.js, TypeScript, SQL" 
                        className={`h-11 rounded-xl text-xs font-semibold focus-visible:ring-[#42bc24] ${hasSubmitted && !skills ? 'bg-red-50/50 border-red-400' : 'bg-slate-50/60 border-slate-200'}`} 
                      />
                    </div>
                  </div>

                  {/* Section 3: Attachments */}
                  <div className="space-y-4 pt-4 border-t border-slate-100">
                    <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-slate-400">
                      <Upload className="w-3.5 h-3.5 text-[#42bc24]" />
                      Documents & Photo
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Resume Upload */}
                      <div>
                        <Label className="text-slate-700 text-xs font-bold mb-1.5 block">Resume / CV <span className="text-rose-500">*</span></Label>
                        <div
                          onClick={() => fileInputRef.current?.click()}
                          className={`border-2 border-dashed rounded-2xl p-5 text-center cursor-pointer transition-all ${resume ? 'border-[#42bc24] bg-emerald-50/40 ring-2 ring-emerald-500/10' : (hasSubmitted && !resume ? 'border-rose-400 bg-rose-50/50 hover:bg-rose-100/50' : 'border-slate-200 bg-slate-50/50 hover:bg-slate-100/70 hover:border-slate-300')}`}
                        >
                          <input
                            type="file"
                            ref={fileInputRef}
                            onChange={e => setResume(e.target.files?.[0] || null)}
                            accept=".pdf,.doc,.docx"
                            className="hidden"
                          />
                          <div className={`w-10 h-10 mx-auto rounded-xl flex items-center justify-center mb-2.5 transition-colors ${resume ? 'bg-[#42bc24] text-white shadow-md shadow-emerald-600/20' : 'bg-white text-slate-400 shadow-xs border border-slate-100'}`}>
                            <Upload className="h-4 w-4" />
                          </div>
                          {resume ? (
                            <div>
                              <p className="text-xs font-black text-slate-900 truncate max-w-[200px] mx-auto">{resume.name}</p>
                              <p className="text-[11px] font-bold text-emerald-700 mt-0.5">{(resume.size / 1024 / 1024).toFixed(2)} MB • Ready</p>
                            </div>
                          ) : (
                            <div>
                              <p className="text-xs font-bold text-slate-800">Upload Resume</p>
                              <p className="text-[10.5px] text-slate-400 font-semibold mt-0.5">PDF, DOC, DOCX up to 5MB</p>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Photo Upload */}
                      <div>
                        <Label className="text-slate-700 text-xs font-bold mb-1.5 block">Profile Photo <span className="text-slate-400 font-normal">(Optional)</span></Label>
                        <div
                          onClick={() => photoInputRef.current?.click()}
                          className={`border-2 border-dashed rounded-2xl p-5 text-center cursor-pointer transition-all ${photo ? 'border-[#42bc24] bg-emerald-50/40 ring-2 ring-emerald-500/10' : 'border-slate-200 bg-slate-50/50 hover:bg-slate-100/70 hover:border-slate-300'}`}
                        >
                          <input
                            type="file"
                            ref={photoInputRef}
                            onChange={e => setPhoto(e.target.files?.[0] || null)}
                            accept=".jpg,.jpeg,.png"
                            className="hidden"
                          />
                          <div className={`w-10 h-10 mx-auto rounded-xl flex items-center justify-center mb-2.5 transition-colors ${photo ? 'bg-[#42bc24] text-white shadow-md shadow-emerald-600/20' : 'bg-white text-slate-400 shadow-xs border border-slate-100'}`}>
                            <Upload className="h-4 w-4" />
                          </div>
                          {photo ? (
                            <div>
                              <p className="text-xs font-black text-slate-900 truncate max-w-[200px] mx-auto">{photo.name}</p>
                              <p className="text-[11px] font-bold text-emerald-700 mt-0.5">Photo Attached</p>
                            </div>
                          ) : (
                            <div>
                              <p className="text-xs font-bold text-slate-800">Upload Photo</p>
                              <p className="text-[10.5px] text-slate-400 font-semibold mt-0.5">JPG, PNG up to 1MB</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {formError && (
                    <div className="bg-rose-50 text-rose-700 border border-rose-200 p-3.5 rounded-xl text-xs font-bold flex items-center gap-2 shadow-xs">
                      <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" /> {formError}
                    </div>
                  )}

                  <div className="pt-2">
                    <Button
                      type="submit"
                      disabled={submitting}
                      className="w-full h-12 rounded-xl text-sm font-black bg-[#42bc24] hover:bg-[#36961c] text-white shadow-lg shadow-emerald-500/20 active:scale-[0.99] transition-all"
                    >
                      {submitting ? (
                        <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Submitting Application...</>
                      ) : (
                        "Submit Application"
                      )}
                    </Button>
                    <p className="text-center text-[11px] text-slate-400 font-medium mt-3">
                      By submitting, you agree to our Terms and Privacy Policy.
                    </p>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="text-center py-8 text-[13px] text-white font-medium bg-[#000C22] mt-auto border-t border-slate-800">
        © 2011-2026 HexaLearn – All Rights Reserved.
      </footer>
    </div>
  );
}
