import { useState, useEffect, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Camera, Save, RotateCcw, Lock, User, Bell, Building, Phone, Mail } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const API_BASE_URL = import.meta.env.PROD
  ? "https://demo.hexalearn.com/cimss/api"
  : "http://localhost/full-cims/api";
import { getAuthHeaders } from "@/services/candidate-api";

export default function UserProfile() {
  const [profile, setProfile] = useState({
    id: "",
    name: "",
    email: "",
    mobile: "",
    designation: "",
    department: "",
    role_name: "",
    is_active: 0,
    created_at: "",
    last_login: "",
    last_password_change: "",
    permissions: "",
    profile_photo: ""
  });

  const [password, setPassword] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [departments, setDepartments] = useState<any[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch(`${API_BASE_URL}/system/profile.php`, {
      credentials: 'include',
      headers: getAuthHeaders(false)
    })
      .then(res => res.json())
      .then(res => {
        if (res.status === 'success') {
          setProfile({
            id: res.data.id || "",
            name: res.data.full_name || "",
            email: res.data.email || "",
            mobile: res.data.mobile || "",
            designation: res.data.designation || "",
            department: res.data.department || "",
            role_name: res.data.role_name || "",
            is_active: res.data.is_active || 0,
            created_at: res.data.created_at || "",
            last_login: res.data.last_login || "",
            last_password_change: res.data.last_password_change || "",
            permissions: res.data.permissions || "",
            profile_photo: res.data.profile_photo || ""
          });
        }
      });
      
    // Fetch departments
    fetch(`${API_BASE_URL}/jobs/departments.php`, {
      credentials: 'include',
      headers: getAuthHeaders(false)
    })
      .then(res => res.json())
      .then(res => setDepartments(Array.isArray(res) ? res : []))
      .catch(() => {});
  }, []);

  const handleSave = async () => {
    if (!profile.name?.trim()) return toast.error("Full Name is required");
    if (!profile.email?.trim()) return toast.error("Email Address is required");
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(profile.email)) return toast.error("Please enter a valid email address");
    
    if (!profile.mobile?.trim()) return toast.error("Mobile Number is required");
    const mobileRegex = /^\d{10}$/;
    if (!mobileRegex.test(profile.mobile)) return toast.error("Mobile Number must be exactly 10 digits");
    
    if (!profile.designation?.trim()) return toast.error("Designation is required");
    if (!profile.department?.trim()) return toast.error("Department is required");

    if (password && password.length < 6) return toast.error("New Password must be at least 6 characters long");

    setIsSaving(true);
    try {
      // Save Profile info
      await fetch(`${API_BASE_URL}/system/profile.php?action=profile`, {
        credentials: 'include',
        method: 'PUT',
        headers: getAuthHeaders(true),
        body: JSON.stringify({
          full_name: profile.name,
          email: profile.email,
          mobile: profile.mobile,
          designation: profile.designation,
          department: profile.department
        })
      });

      // Save Password if set
      if (password) {
        await fetch(`${API_BASE_URL}/system/profile.php?action=password`, {
          credentials: 'include',
          method: 'PUT',
          headers: getAuthHeaders(true),
          body: JSON.stringify({ new_password: password })
        });
        setPassword("");
      }

      toast.success("Profile saved successfully");
    } catch (err) {
      toast.error("Failed to save profile");
    } finally {
      setIsSaving(false);
    }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    const formData = new FormData();
    formData.append("photo", file);
    
    const toastId = toast.loading("Uploading photo...");
    try {
      const res = await fetch(`${API_BASE_URL}/system/profile.php?action=photo`, {
        method: "POST",
        credentials: "include",
        headers: getAuthHeaders(false),
        body: formData
      });
      const data = await res.json();
      if (data.status === "success") {
        toast.success("Photo uploaded successfully", { id: toastId });
        // Reload to show the photo if necessary, or update state
        window.location.reload();
      } else {
        toast.error(data.message || "Failed to upload photo", { id: toastId });
      }
    } catch {
      toast.error("Upload failed", { id: toastId });
    }
  };

  const getStrength = (pass: string) => {
    if (pass.length === 0) return 0;
    if (pass.length < 6) return 33;
    if (pass.length < 10) return 66;
    return 100;
  };
  const strength = getStrength(password);

  return (
    <div className="space-y-6 pb-10">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">User Profile</h1>
        <p className="text-[13px] text-slate-500 mt-1">
          Manage your personal information, security credentials, and notification preferences.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        <div className="lg:col-span-2 space-y-6">
          <Card className="p-8 bg-white border-border/50 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] rounded-3xl">
            <h2 className="text-[14px] font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-4 mb-6">
              <User className="h-4 w-4 text-indigo-500" /> Personal Information
            </h2>

            <div className="flex flex-col sm:flex-row gap-8 mb-8">
              <div className="flex flex-col items-center gap-3">
                <div className="relative group">
                  <div className="w-28 h-28 rounded-full bg-slate-100 border-4 border-white shadow-md flex items-center justify-center overflow-hidden">
                    {profile.profile_photo ? (
                      <img 
                        src={profile.profile_photo.startsWith('http') ? profile.profile_photo : `${API_BASE_URL}/${profile.profile_photo.replace('../../', '../')}`} 
                        alt="Profile" 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-3xl font-black text-slate-300">{profile.name ? profile.name.charAt(0) : "U"}</span>
                    )}
                  </div>
                  <button onClick={() => fileInputRef.current?.click()} className="absolute bottom-0 right-0 w-8 h-8 bg-indigo-600 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-indigo-700 transition-colors">
                    <Camera className="w-4 h-4" />
                  </button>
                  <input type="file" ref={fileInputRef} onChange={handlePhotoUpload} accept="image/*" className="hidden" />
                </div>
                <div className="text-[11px] font-bold text-slate-500">Upload Photo</div>
              </div>

              <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <label className="text-[12px] font-bold text-slate-700">Full Name</label>
                  <Input value={profile.name} onChange={e => setProfile({ ...profile, name: e.target.value })} className="h-10 rounded-xl bg-slate-50 border-slate-200" />
                </div>
                <div className="space-y-2">
                  <label className="text-[12px] font-bold text-slate-700">Email Address</label>
                  <Input value={profile.email} onChange={e => setProfile({ ...profile, email: e.target.value })} className="h-10 rounded-xl bg-slate-50 border-slate-200" />
                </div>
                <div className="space-y-2">
                  <label className="text-[12px] font-bold text-slate-700">Mobile Number</label>
                  <Input value={profile.mobile} onChange={e => setProfile({ ...profile, mobile: e.target.value })} className="h-10 rounded-xl bg-slate-50 border-slate-200" />
                </div>
                <div className="space-y-2">
                  <label className="text-[12px] font-bold text-slate-700">Designation</label>
                  <Input value={profile.designation} onChange={e => setProfile({ ...profile, designation: e.target.value })} className="h-10 rounded-xl bg-slate-50 border-slate-200" />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <label className="text-[12px] font-bold text-slate-700">Department</label>
                  <Select value={profile.department} onValueChange={v => setProfile({ ...profile, department: v })}>
                    <SelectTrigger className="h-10 rounded-xl bg-slate-50 border-slate-200">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      {departments.length > 0 ? (
                        departments.map((dept) => (
                          <SelectItem key={dept.id} value={dept.name}>{dept.name}</SelectItem>
                        ))
                      ) : (
                        <SelectItem value="loading" disabled>Loading...</SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Right Preview */}
        <div className="lg:col-span-1">
          <Card className="bg-white border-border/50 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] rounded-3xl overflow-hidden sticky top-6">
            <div className="h-24 bg-gradient-to-r from-[#1447E6] to-indigo-500 relative" />
            <div className="px-6 pb-6 relative flex flex-col items-center text-center">
              <div className="w-20 h-20 rounded-full bg-white border-4 border-white shadow-md flex items-center justify-center overflow-hidden -mt-10 mb-3">
                {profile.profile_photo ? (
                  <img 
                    src={profile.profile_photo.startsWith('http') ? profile.profile_photo : `${API_BASE_URL}/${profile.profile_photo.replace('../../', '../')}`} 
                    alt="Profile" 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-2xl font-black text-[#1447E6]">{profile.name ? profile.name.charAt(0) : "U"}</span>
                )}
              </div>
              <h3 className="text-[16px] font-black text-slate-900 leading-tight">{profile.name || "Your Name"}</h3>
              <p className="text-[12px] font-bold text-[#1447E6] mt-1">{profile.role_name || profile.designation || "Designation"}</p>

              <div className="mt-3 flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full border border-emerald-100">
                <span className={cn("w-2 h-2 rounded-full", profile.is_active ? "bg-emerald-500" : "bg-red-500")} />
                <span className="text-[11px] font-bold uppercase tracking-wider">{profile.is_active ? "Active" : "Inactive"}</span>
              </div>

              <div className="w-full h-px bg-slate-100 my-4" />

              <div className="w-full space-y-3">
                <div className="flex items-center gap-3 text-left">
                  <div className="w-7 h-7 rounded-lg bg-slate-50 flex items-center justify-center shrink-0">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                  </div>
                  <div className="truncate text-[11px] font-medium text-slate-600">{profile.email || "Email address"}</div>
                </div>
                <div className="flex items-center gap-3 text-left">
                  <div className="w-7 h-7 rounded-lg bg-slate-50 flex items-center justify-center shrink-0">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                  </div>
                  <div className="truncate text-[11px] font-medium text-slate-600">{profile.mobile || "Phone number"}</div>
                </div>
                <div className="flex items-center gap-3 text-left">
                  <div className="w-7 h-7 rounded-lg bg-slate-50 flex items-center justify-center shrink-0">
                    <Building className="w-3.5 h-3.5 text-slate-400" />
                  </div>
                  <div className="truncate text-[11px] font-medium text-slate-600 capitalize">{profile.department || "Department"}</div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
            <Card className="p-8 bg-white border-border/50 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] rounded-3xl h-full">
              <h2 className="text-[14px] font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-4 mb-6">
                <User className="h-4 w-4 text-blue-500" /> Account Information
              </h2>
              <div className="grid grid-cols-1 gap-5">
                <div className="space-y-1">
                  <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">User ID</div>
                  <div className="text-[13px] font-bold text-slate-900">USR-{String(profile.id).padStart(4, '0')}</div>
                </div>
                <div className="space-y-1">
                  <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Role</div>
                  <div className="text-[13px] font-bold text-slate-900">{profile.role_name || "Unknown"}</div>
                </div>
                <div className="space-y-1">
                  <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Account Status</div>
                  <div className="text-[13px] font-bold flex items-center gap-1.5">
                    <span className={cn("w-2 h-2 rounded-full", profile.is_active ? "bg-emerald-500" : "bg-red-500")} />
                    <span className={profile.is_active ? "text-emerald-700" : "text-red-700"}>{profile.is_active ? "Active" : "Inactive"}</span>
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Created At</div>
                  <div className="text-[13px] font-medium text-slate-700">{profile.created_at ? new Date(profile.created_at).toLocaleString() : "Unknown"}</div>
                </div>
                <div className="space-y-1">
                  <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Last Login</div>
                  <div className="text-[13px] font-medium text-slate-700">{profile.last_login ? new Date(profile.last_login).toLocaleString() : "Never"}</div>
                </div>
              </div>
            </Card>

            <Card className="p-8 bg-white border-border/50 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] rounded-3xl h-full flex flex-col">
              <h2 className="text-[14px] font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-4 mb-6">
                <User className="h-4 w-4 text-purple-500" /> My Access
              </h2>
              <div className="grid grid-cols-1 gap-5 flex-1">
                <div className="space-y-1">
                  <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Role</div>
                  <div className="text-[13px] font-bold text-slate-900">{profile.role_name || "Unknown"}</div>
                </div>
                <div className="space-y-1">
                  <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Access Level</div>
                  <div className="text-[13px] font-bold text-slate-900">{profile.role_name === 'Administrator' ? 'Full Access' : 'Restricted Access'}</div>
                </div>
                <div className="space-y-1">
                  <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Permissions</div>
                  <div className="text-[13px] font-medium text-slate-700 truncate max-w-full">
                    {profile.role_name === 'Administrator' ? 'All system permissions' : (
                      profile.permissions ? (
                        typeof profile.permissions === 'string' ? (
                          (() => { try { return JSON.parse(profile.permissions).join(", "); } catch { return "None"; } })()
                        ) : "Custom permissions"
                      ) : "None"
                    )}
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Scope</div>
                  <div className="text-[13px] font-medium text-slate-700">All System</div>
                </div>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-100">
                <Button disabled variant="outline" className="w-full h-10 rounded-xl font-bold border-slate-200 text-slate-400 bg-slate-50 cursor-not-allowed">
                  View Permissions
                </Button>
              </div>
            </Card>
            <Card className="p-8 bg-white border-border/50 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] rounded-3xl h-full flex flex-col">
            <h2 className="text-[14px] font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-4 mb-6">
              <Lock className="h-4 w-4 text-emerald-500" /> Account Security
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 max-w-2xl mb-8">
              <div className="space-y-1">
                <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Last Login</div>
                <div className="text-[13px] font-medium text-slate-700">{profile.last_login ? new Date(profile.last_login).toLocaleString() : "Never"}</div>
              </div>
              <div className="space-y-1">
                <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Last Password Change</div>
                <div className="text-[13px] font-medium text-slate-700">{profile.last_password_change ? new Date(profile.last_password_change).toLocaleString() : "Never"}</div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-5 pt-4 border-t border-slate-100 flex-1">
              <div className="space-y-2">
                <label className="text-[12px] font-bold text-slate-700">Current Password</label>
                <Input type="password" placeholder="••••••••" className="h-10 rounded-xl bg-slate-50 border-slate-200" />
              </div>
              <div className="space-y-2">
                <label className="text-[12px] font-bold text-slate-700">New Password</label>
                <Input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" className="h-10 rounded-xl bg-slate-50 border-slate-200" />
                {password && (
                  <div className="mt-2 space-y-1.5">
                    <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden flex gap-1">
                      <div className={cn("h-full transition-all duration-300", strength >= 33 ? "bg-rose-500 w-1/3" : "w-0")} />
                      <div className={cn("h-full transition-all duration-300", strength >= 66 ? "bg-amber-500 w-1/3" : "w-0")} />
                      <div className={cn("h-full transition-all duration-300", strength === 100 ? "bg-emerald-500 w-1/3" : "w-0")} />
                    </div>
                    <div className="text-[10px] font-bold text-slate-500 text-right">
                      {strength === 100 ? 'Strong' : strength >= 66 ? 'Medium' : 'Weak'}
                    </div>
                  </div>
                )}
              </div>
              <div className="space-y-2">
                <label className="text-[12px] font-bold text-slate-700">Confirm Password</label>
                <Input type="password" placeholder="••••••••" className="h-10 rounded-xl bg-slate-50 border-slate-200" />
              </div>
            </div>
          </Card>
          </div>

          <div className="flex items-center justify-end gap-3 mt-4">
            <Button variant="outline" className="h-11 px-6 rounded-xl font-bold border-slate-200 text-slate-600 bg-white">
              <RotateCcw className="w-4 h-4 mr-2" /> Reset
            </Button>
            <Button disabled={isSaving} onClick={handleSave} className="h-11 px-6 rounded-xl font-bold bg-[#1447E6] hover:bg-[#0c31a6] text-white shadow-md shadow-[#1447E6]/20">
              <Save className="w-4 h-4 mr-2" /> {isSaving ? "Saving..." : "Save Changes"}
            </Button>
          </div>
    </div>
  );
}
