import { useState, useEffect, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import {
  ShieldAlert,
  Users,
  Pencil,
  Plus,
  Trash2,
  PowerOff,
  RefreshCw,
  MoreHorizontal,
  Gauge,
  Briefcase,
  Users2,
  Calendar,
  Filter,
  MailOpen,
  Shield,
  BarChart3,
  Bell,
  Mail,
  UserCog,
  Settings,
  Info,
  Lock,
  Unlock,
  Check,
  X
} from "lucide-react";

type PermissionConfig = {
  label: string;
  view: boolean;
  add: boolean;
  edit: boolean;
  delete: boolean;
  scopes: string[];
};

const moduleConfig: Record<string, PermissionConfig> = {
  "dashboard": { label: "Dashboard", view: true, add: true, edit: true, delete: true, scopes: ["All", "Assigned", "None"] },
  "job_openings": { label: "Job Openings", view: true, add: true, edit: true, delete: true, scopes: ["All", "Assigned", "None"] },
  "candidates": { label: "Candidates", view: true, add: true, edit: true, delete: true, scopes: ["All", "Assigned", "None"] },
  "interviews": { label: "Interviews", view: true, add: true, edit: true, delete: true, scopes: ["All", "Assigned", "None"] },
  "pipeline": { label: "Recruitment Pipeline", view: true, add: true, edit: true, delete: true, scopes: ["All", "Assigned", "None"] },
  "offers": { label: "Offers & Joining", view: true, add: true, edit: true, delete: true, scopes: ["All", "Assigned", "None"] },
  "risk_management": { label: "Risk Management", view: true, add: true, edit: true, delete: true, scopes: ["All", "Assigned", "None"] },
  "reports": { label: "Reports", view: true, add: true, edit: true, delete: true, scopes: ["All", "Assigned", "None"] },
  "alerts": { label: "Alerts Center", view: true, add: true, edit: true, delete: true, scopes: ["All", "Assigned", "None"] },
  "email_settings": { label: "Email Settings", view: true, add: true, edit: true, delete: true, scopes: ["All", "Assigned", "None"] },
  "users_roles": { label: "Users & Roles", view: false, add: false, edit: false, delete: false, scopes: ["All"] },
  "system_settings": { label: "System Settings", view: true, add: true, edit: true, delete: true, scopes: ["All", "Assigned", "None"] }
};

const moduleIcons: Record<string, any> = {
  "dashboard": Gauge,
  "job_openings": Briefcase,
  "candidates": Users2,
  "interviews": Calendar,
  "pipeline": Filter,
  "offers": MailOpen,
  "risk_management": Shield,
  "reports": BarChart3,
  "alerts": Bell,
  "email_settings": Mail,
  "users_roles": UserCog,
  "system_settings": Settings
};

const mockModules = Object.keys(moduleConfig);

import { API_BASE_URL } from "@/config/api";

export default function UserRoles() {
  const [roles, setRoles] = useState<any[]>([]);
  const [activeUsers, setActiveUsers] = useState<any[]>([]);
  const [activeLockouts, setActiveLockouts] = useState<any[]>([]);
  const [userFilter, setUserFilter] = useState<'all' | 'locked' | 'active'>('all');
  const [isSaving, setIsSaving] = useState(false);
  const [isAuthorized, setIsAuthorized] = useState(true);

  // Modals
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    type: 'unlock_single' | 'unlock_all' | 'lock_single' | 'delete_user';
    user?: any;
    email?: string;
    name?: string;
    attempts?: number;
    ip?: string;
    isProcessing?: boolean;
  }>({
    isOpen: false,
    type: 'unlock_single',
    isProcessing: false
  });
  const [selectedPhoto, setSelectedPhoto] = useState<File | null>(null);

  const [editingUser, setEditingUser] = useState<any>(null);
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    mobile: '',
    designation: '',
    department: '',
    password: '',
    role_id: '',
    is_active: true
  });
  
  const [passwordData, setPasswordData] = useState({
    id: null,
    password: ''
  });

  const [editingRole, setEditingRole] = useState<any>(null);
  const [roleData, setRoleData] = useState({
    role_name: '',
    description: ''
  });

  const currentUserData = useMemo(() => {
    try {
      const raw = localStorage.getItem('user');
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }, []);

  type PermissionEntry = {
    view: boolean;
    add: boolean;
    edit: boolean;
    delete: boolean;
    scope: string;
  };
  const [permissions, setPermissions] = useState<Record<string, PermissionEntry>>({});

  const fetchUsers = () => {
    fetch(`${API_BASE_URL}/system/users.php`, { credentials: 'include' })
      .then(res => res.json())
      .then(res => {
        if (res.status === "success") {
          setActiveUsers(res.data || []);
          setActiveLockouts(res.lockouts || []);
        }
      });
  };

  const filteredUsers = useMemo(() => {
    if (userFilter === 'locked') {
      return activeUsers.filter(u => Number(u.is_locked) === 1 || Number(u.failed_attempts) >= 5);
    }
    if (userFilter === 'active') {
      return activeUsers.filter(u => u.is_active && Number(u.is_locked) !== 1 && Number(u.failed_attempts) < 5);
    }
    return activeUsers;
  }, [activeUsers, userFilter]);

  const fetchRoles = () => {
    fetch(`${API_BASE_URL}/system/roles.php`, { credentials: 'include' })
      .then(res => res.json())
      .then(res => {
        if (res.status === "success") {
          setRoles(res.data);
        }
      });
  };

  useEffect(() => {
    const userStr = localStorage.getItem("cims_user");
    if (userStr) {
      const user = JSON.parse(userStr);
      if (user.role_name !== 'Administrator') {
        setIsAuthorized(false);
        return;
      }
    } else {
      setIsAuthorized(false);
      return;
    }

    fetchRoles();
    fetchUsers();
  }, []);

  const getInitPermissions = () => {
    const map: Record<string, PermissionEntry> = {};
    mockModules.forEach(mod => {
      map[mod] = { view: false, add: false, edit: false, delete: false, scope: 'Assigned' };
    });
    return map;
  };

  const openRoleModal = (role?: any) => {
    if (role) {
      setEditingRole(role);
      setRoleData({ role_name: role.role_name, description: role.description || '' });
      // Fetch permissions
      fetch(`${API_BASE_URL}/system/permissions.php?role_id=${role.id}`, { credentials: 'include' })
        .then(res => res.json())
        .then(res => {
          if (res.status === "success") {
            const permMap = getInitPermissions();
            res.data.forEach((p: any) => {
              const config = moduleConfig[p.module_name];
              let scope = p.scope || 'Assigned';
              let view = !!p.can_view;
              let add = !!p.can_add;
              let edit = !!p.can_edit;
              let deletePerm = !!p.can_delete;
              
              // Auto-correct state mismatches from DB
              if (config) {
                if (scope === 'All') {
                  view = true; add = true; edit = true; deletePerm = true;
                } else if (scope === 'None') {
                  view = false; add = false; edit = false; deletePerm = false;
                } else {
                  const allChecked = view && add && edit && deletePerm;
                  const noneChecked = !view && !add && !edit && !deletePerm;
                  if (allChecked && config.scopes.includes('All')) scope = 'All';
                  else if (noneChecked && config.scopes.includes('None')) scope = 'None';
                  else if (config.scopes.includes('Assigned')) scope = 'Assigned';
                }
              }

              if (permMap[p.module_name]) {
                permMap[p.module_name] = {
                  view,
                  add,
                  edit,
                  delete: deletePerm,
                  scope
                };
              }
            });
            setPermissions(permMap);
            setIsRoleModalOpen(true);
          }
        });
    } else {
      setEditingRole(null);
      setRoleData({ role_name: '', description: '' });
      setPermissions(getInitPermissions());
      setIsRoleModalOpen(true);
    }
  };

  const updatePermission = (mod: string, field: keyof PermissionEntry, val: any) => {
    setPermissions(prev => {
      const updated = { ...prev[mod], [field]: val };
      const config = moduleConfig[mod];
      
      // Auto-check all permissions if scope is set to 'All', or uncheck if 'None'
      if (field === 'scope') {
        if (val === 'All') {
          updated.view = true;
          updated.add = true;
          updated.edit = true;
          updated.delete = true;
        } else if (val === 'None') {
          updated.view = false;
          updated.add = false;
          updated.edit = false;
          updated.delete = false;
        }
      } else {
        // A checkbox was changed. Auto-update scope.
        const allChecked = updated.view && updated.add && updated.edit && updated.delete;
        const noneChecked = !updated.view && !updated.add && !updated.edit && !updated.delete;
        
        if (allChecked && config.scopes.includes('All')) {
          updated.scope = 'All';
        } else if (noneChecked && config.scopes.includes('None')) {
          updated.scope = 'None';
        } else if (config.scopes.includes('Assigned')) {
          updated.scope = 'Assigned';
        }
      }
      
      return {
        ...prev,
        [mod]: updated
      };
    });
  };

  const handleRoleSubmit = async () => {
    setIsSaving(true);
    const method = editingRole ? 'PUT' : 'POST';
    const payload = { ...roleData, id: editingRole?.id };
    
    try {
      const res = await fetch(`${API_BASE_URL}/system/roles.php`, {
        method,
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      }).then(r => r.json());

      if (res.status === "success") {
        const roleId = editingRole ? editingRole.id : res.data?.id; // Assuming POST returns new ID
        if (roleId) {
          // Save permissions
          const payloadArray = mockModules.map(mod => ({
            module_name: mod,
            can_view: !!permissions[mod]?.view,
            can_add: !!permissions[mod]?.add,
            can_edit: !!permissions[mod]?.edit,
            can_delete: !!permissions[mod]?.delete,
            scope: permissions[mod]?.scope || 'Assigned'
          }));
          await fetch(`${API_BASE_URL}/system/permissions.php`, {
            method: 'PUT',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ role_id: roleId, permissions: payloadArray })
          });
        }
        
        toast.success(res.message || "Role saved successfully");
        setIsRoleModalOpen(false);
        fetchRoles();
      } else {
        toast.error(res.message);
      }
    } catch (err) {
      toast.error("Failed to save role");
    } finally {
      setIsSaving(false);
    }
  };

  const handleUserSubmit = async (e: any) => {
    e.preventDefault();
    const method = editingUser ? 'PUT' : 'POST';
    const payload = { ...formData, id: editingUser?.id };
    
    try {
      const res = await fetch(`${API_BASE_URL}/system/users.php`, {
        method,
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      }).then(r => r.json());

      if (res.status === "success") {
        toast.success(res.message);
        
        // Handle photo upload if a file was selected
        const userId = editingUser ? editingUser.id : res.data?.id;
        if (selectedPhoto && userId) {
          const fd = new FormData();
          fd.append('photo', selectedPhoto);
          fd.append('id', userId);
          try {
            await fetch(`${API_BASE_URL}/system/users.php?action=upload_photo`, {
              method: 'POST',
              credentials: 'include',
              body: fd
            });
          } catch (e) {
            toast.error("User saved, but failed to upload photo");
          }
        }
        
        setIsUserModalOpen(false);
        setSelectedPhoto(null);
        fetchUsers();
      } else {
        toast.error(res.message);
      }
    } catch (err) {
      toast.error("Failed to save user");
    }
  };

  const handlePasswordReset = async (e: any) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE_URL}/system/users.php?action=reset_password`, {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(passwordData)
      }).then(r => r.json());

      if (res.status === "success") {
        toast.success(res.message);
        setIsPasswordModalOpen(false);
      } else {
        toast.error(res.message);
      }
    } catch (err) {
      toast.error("Failed to reset password");
    }
  };

  const toggleUserStatus = async (user: any) => {
    try {
      const res = await fetch(`${API_BASE_URL}/system/users.php?action=toggle_status`, {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: user.id, is_active: !user.is_active })
      }).then(r => r.json());

      if (res.status === "success") {
        toast.success("User status updated");
        fetchUsers();
      } else {
        toast.error(res.message);
      }
    } catch (err) {
      toast.error("Failed to toggle user status");
    }
  };

  const promptUnlockUser = (userOrLockout: any) => {
    const isEmail = typeof userOrLockout === 'string';
    const email = isEmail ? userOrLockout : (userOrLockout?.email || '');
    const user = !isEmail ? userOrLockout : activeUsers.find(u => u.email?.toLowerCase() === email.toLowerCase());
    const name = user?.full_name || user?.name || userOrLockout?.full_name || email;
    const attempts = userOrLockout?.attempts || user?.failed_attempts || 5;
    const ip = userOrLockout?.ip_address;

    setConfirmModal({
      isOpen: true,
      type: 'unlock_single',
      user,
      email,
      name,
      attempts: Number(attempts) || 0,
      ip,
      isProcessing: false
    });
  };

  const promptUnlockAll = () => {
    setConfirmModal({
      isOpen: true,
      type: 'unlock_all',
      isProcessing: false
    });
  };

  const promptLockUser = (user: any) => {
    setConfirmModal({
      isOpen: true,
      type: 'lock_single',
      user,
      name: user.full_name || user.name || user.email,
      email: user.email,
      isProcessing: false
    });
  };

  const promptDeleteUser = (user: any) => {
    setConfirmModal({
      isOpen: true,
      type: 'delete_user',
      user,
      name: user.full_name || user.name || user.email,
      email: user.email,
      isProcessing: false
    });
  };

  // Safe fallback aliases to guarantee NO native browser alert/confirm is ever triggered
  const unlockUser = (userOrEmail: any) => promptUnlockUser(userOrEmail);
  const lockUser = (user: any) => promptLockUser(user);
  const unlockAllUsers = () => promptUnlockAll();
  const deleteUser = (user: any) => promptDeleteUser(user);

  const handleConfirmAction = async () => {
    if (!confirmModal.isOpen || confirmModal.isProcessing) return;
    setConfirmModal(prev => ({ ...prev, isProcessing: true }));

    try {
      if (confirmModal.type === 'unlock_single') {
        const email = confirmModal.email || confirmModal.user?.email || '';
        const id = confirmModal.user?.id;
        const res = await fetch(`${API_BASE_URL}/system/users.php?action=unlock`, {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id, email })
        }).then(r => r.json());

        if (res.status === "success") {
          toast.success(res.message || `Account for ${confirmModal.name || email} has been unblocked successfully`);
          fetchUsers();
          setConfirmModal(prev => ({ ...prev, isOpen: false, isProcessing: false }));
        } else {
          toast.error(res.message || "Failed to unblock account");
          setConfirmModal(prev => ({ ...prev, isProcessing: false }));
        }
      } else if (confirmModal.type === 'unlock_all') {
        const res = await fetch(`${API_BASE_URL}/system/users.php?action=unlock_all`, {
          method: 'POST',
          credentials: 'include'
        }).then(r => r.json());

        if (res.status === "success") {
          toast.success(res.message || "All accounts have been unblocked & unlocked in database");
          fetchUsers();
          setConfirmModal(prev => ({ ...prev, isOpen: false, isProcessing: false }));
        } else {
          toast.error(res.message || "Failed to clear lockouts");
          setConfirmModal(prev => ({ ...prev, isProcessing: false }));
        }
      } else if (confirmModal.type === 'lock_single') {
        const res = await fetch(`${API_BASE_URL}/system/users.php?action=lock`, {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: confirmModal.user?.id })
        }).then(r => r.json());

        if (res.status === "success") {
          toast.success(res.message || `Account for ${confirmModal.name} is now locked in database`);
          fetchUsers();
          setConfirmModal(prev => ({ ...prev, isOpen: false, isProcessing: false }));
        } else {
          toast.error(res.message || "Failed to lock account");
          setConfirmModal(prev => ({ ...prev, isProcessing: false }));
        }
      } else if (confirmModal.type === 'delete_user') {
        const res = await fetch(`${API_BASE_URL}/system/users.php?id=${confirmModal.user?.id}`, {
          method: 'DELETE',
          credentials: 'include'
        }).then(r => r.json());

        if (res.status === "success") {
          toast.success(res.message || "User deleted successfully");
          fetchUsers();
          setConfirmModal(prev => ({ ...prev, isOpen: false, isProcessing: false }));
        } else {
          toast.error(res.message || "Failed to delete user");
          setConfirmModal(prev => ({ ...prev, isProcessing: false }));
        }
      }
    } catch (err) {
      toast.error("An error occurred while executing request");
      setConfirmModal(prev => ({ ...prev, isProcessing: false }));
    }
  };

  if (!isAuthorized) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-[80vh] p-8">
        <ShieldAlert className="h-20 w-20 text-rose-500 mb-6 opacity-80" />
        <h1 className="text-3xl font-black tracking-tight text-slate-900 mb-2">403 Access Denied</h1>
        <p className="text-slate-500 max-w-md text-center">
          You do not have the required permissions to view or manage User Roles. Only Administrators can access this page.
        </p>
        <Button 
          onClick={() => window.history.back()}
          className="mt-8 bg-slate-900 hover:bg-slate-800 text-white rounded-xl px-6 h-11 font-bold"
        >
          Go Back
        </Button>
      </div>
    );
  }

  return (
    <div className="flex-1 w-full space-y-8 pb-20">
      {/* Top Banner (Dark Teal / Cyan Gradient) */}
      <div className="relative overflow-hidden rounded-[28px] bg-gradient-to-r from-[#000C22] via-[#0B2524] to-[#0D2823] shadow-lg border border-teal-900/40 p-8 sm:p-10 text-white flex flex-col xl:flex-row items-start xl:items-center justify-between gap-6">
        <div className="relative z-10 flex flex-col justify-center max-w-xl">
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight mb-2 text-white">Users & Roles</h1>
          <p className="text-[#60C042] text-[14px] sm:text-[15px] font-medium leading-relaxed">
            Manage user permissions, configure access control, and define system security policies.
          </p>
        </div>

        <div className="relative z-10 flex items-center gap-3 self-stretch xl:self-auto justify-end">
          <Button 
            onClick={() => {
              setEditingUser(null);
              setFormData({ full_name: '', email: '', mobile: '', designation: '', department: '', password: '', role_id: roles[0]?.id ? String(roles[0].id) : '', is_active: true });
              setIsUserModalOpen(true);
            }}
            className="btn-primary h-11 px-6 rounded-xl font-bold shadow-lg transition-transform active:scale-95"
          >
            <Plus className="w-4 h-4 mr-2" /> Add User
          </Button>

          <Button
            onClick={promptUnlockAll}
            variant="outline"
            className="h-11 px-5 rounded-xl font-bold text-slate-800 bg-white/95 hover:bg-white border-white/40 shadow-lg flex items-center gap-2 transition-transform active:scale-95 cursor-pointer"
            title="Clear all failed attempts and unblock all accounts in database"
          >
            <Unlock className="w-4 h-4 text-emerald-600" /> Unblock Accounts
          </Button>

          <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 shadow-inner flex-shrink-0 cursor-pointer hover:scale-105 transition-transform duration-300">
            <span className="text-3xl select-none filter drop-shadow-md hover:animate-bounce">🛡️</span>
          </div>
        </div>

        {/* Decorative Background Elements */}
        <div className="absolute -right-16 -top-16 w-80 h-80 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute right-40 -bottom-20 w-60 h-60 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
      </div>

      {/* Users Table */}
      <div className="space-y-4">
        {/* Dedicated Active Database Lockouts & Security Alerts Panel */}
        {activeLockouts.length > 0 && (
          <div className="p-5 rounded-3xl bg-rose-500/10 border-2 border-rose-500/30 text-slate-900 shadow-sm space-y-3.5 animate-in fade-in">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <ShieldAlert className="w-5 h-5 text-rose-600 animate-pulse shrink-0" />
                <div>
                  <h3 className="text-sm font-black text-rose-900 uppercase tracking-wider">
                    {activeLockouts.filter(l => Number(l.is_locked) === 1 || Number(l.attempts) >= 5).length > 0
                      ? `Locked Accounts Detected in Database (${activeLockouts.filter(l => Number(l.is_locked) === 1 || Number(l.attempts) >= 5).length})`
                      : `Failed Login Attempts Recorded in Database (${activeLockouts.length})`}
                  </h3>
                  <p className="text-xs text-rose-700">
                    The following account(s) have failed login attempts recorded in MySQL. Click <strong>Unblock</strong> on any account to immediately restore access.
                  </p>
                </div>
              </div>
              <Button
                onClick={promptUnlockAll}
                size="sm"
                className="h-8 px-4 text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white rounded-xl shadow-xs cursor-pointer"
              >
                <Unlock className="w-3.5 h-3.5 mr-1" /> Unblock All Accounts
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 pt-1">
              {activeLockouts.map((lockout, idx) => (
                <div key={idx} className="p-4 rounded-2xl bg-white border border-rose-200 shadow-xs flex items-center justify-between gap-3">
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-1.5 font-bold text-sm text-slate-900 truncate">
                      <Lock className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                      <span className="truncate">{lockout.full_name || lockout.email}</span>
                    </div>
                    <div className="text-xs text-slate-500 truncate">{lockout.email}</div>
                    <div className="flex items-center gap-2 pt-0.5">
                      <span className={cn(
                        "text-[10px] font-black uppercase px-2 py-0.5 rounded-md",
                        Number(lockout.is_locked) === 1 || Number(lockout.attempts) >= 5 
                          ? "bg-rose-100 text-rose-700 border border-rose-200" 
                          : "bg-amber-100 text-amber-700 border border-amber-200"
                      )}>
                        {Number(lockout.is_locked) === 1 || Number(lockout.attempts) >= 5 ? "Locked (5/5)" : `${lockout.attempts} Failed`}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">IP: {lockout.ip_address}</span>
                    </div>
                  </div>
                  <Button
                    onClick={() => promptUnlockUser(lockout)}
                    size="sm"
                    className="h-8 px-3 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-xs shrink-0 cursor-pointer"
                    title="Unblock this account in database"
                  >
                    <Unlock className="w-3.5 h-3.5 mr-1" /> Unblock
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3">
            <h2 className="text-lg font-bold text-slate-900">Users</h2>
            
            {/* Filter Tabs to easily see which accounts are locked */}
            <div className="inline-flex p-1 bg-slate-100 rounded-xl gap-1">
              <button
                type="button"
                onClick={() => setUserFilter('all')}
                className={cn(
                  "px-3 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer",
                  userFilter === 'all' ? "bg-white text-slate-900 shadow-xs" : "text-slate-500 hover:text-slate-900"
                )}
              >
                All Users ({activeUsers.length})
              </button>
              <button
                type="button"
                onClick={() => setUserFilter('locked')}
                className={cn(
                  "px-3 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center gap-1",
                  userFilter === 'locked' ? "bg-white text-rose-700 shadow-xs" : "text-slate-500 hover:text-rose-600",
                  activeUsers.some(u => Number(u.is_locked) === 1 || Number(u.failed_attempts) >= 5) && "text-rose-600 font-black"
                )}
              >
                <Lock className="w-3 h-3 text-rose-600" />
                Locked ({activeUsers.filter(u => Number(u.is_locked) === 1 || Number(u.failed_attempts) >= 5).length})
              </button>
              <button
                type="button"
                onClick={() => setUserFilter('active')}
                className={cn(
                  "px-3 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer",
                  userFilter === 'active' ? "bg-white text-emerald-700 shadow-xs" : "text-slate-500 hover:text-emerald-600"
                )}
              >
                Active ({activeUsers.filter(u => u.is_active && Number(u.is_locked) !== 1 && Number(u.failed_attempts) < 5).length})
              </button>
            </div>
          </div>
          
          {/* Always-visible Unlock All Accounts button above the table */}
          <Button
            onClick={promptUnlockAll}
            size="sm"
            variant="outline"
            className="h-9 px-3.5 text-xs font-bold text-emerald-700 border-emerald-300 bg-emerald-50/60 hover:bg-emerald-100 rounded-xl flex items-center gap-1.5 shadow-xs cursor-pointer"
            title="Clear all failed attempts and unblock all users in MySQL database"
          >
            <Unlock className="w-3.5 h-3.5 text-emerald-600" /> Unblock All Accounts
          </Button>
        </div>
        <Card className="rounded-3xl border-slate-200/60 shadow-sm overflow-hidden bg-white">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50/80 border-b border-slate-100 text-xs font-bold text-slate-500 uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-4">Name</th>
                  <th className="px-6 py-4">Email</th>
                  <th className="px-6 py-4">Department</th>
                  <th className="px-6 py-4">Role</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Joined</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredUsers.map((user, idx) => (
                  <tr 
                    key={idx} 
                    className={cn(
                      "transition-colors",
                      Number(user.is_locked) === 1 || Number(user.failed_attempts) >= 5 
                        ? "bg-rose-50/50 hover:bg-rose-50/70 border-l-4 border-l-rose-500" 
                        : "hover:bg-slate-50/50"
                    )}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {user.profile_photo ? (
                          <img src={user.profile_photo.startsWith('http') ? user.profile_photo : `${API_BASE_URL.replace('/api', '')}/${user.profile_photo.replace(/^(?:\.\.\/)+|^(?:\.\/)+/, '')}`} alt={user.full_name || user.name} className="h-9 w-9 rounded-full object-cover border border-slate-200 shadow-sm" />
                        ) : (
                          <div className="h-9 w-9 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs shrink-0 border border-indigo-200">
                            {(user.full_name || user.name || 'U').charAt(0).toUpperCase()}
                          </div>
                        )}
                        <div>
                          <div className="font-bold text-slate-900">{user.full_name || user.name}</div>
                          <div className="text-xs text-slate-500 font-medium">{user.designation || 'No designation'}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-600 font-medium">{user.email}</td>
                    <td className="px-6 py-4 text-slate-600 font-medium">{user.department || "N/A"}</td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2 py-1 rounded-md bg-indigo-50 text-indigo-700 text-xs font-bold">
                        {user.role || 'Unassigned'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {Number(user.is_locked) === 1 || Number(user.failed_attempts) >= 5 ? (
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-rose-50 text-rose-700 text-xs font-bold border border-rose-200 shadow-xs animate-pulse" title="Account locked due to 5+ failed login attempts">
                            <Lock className="w-3.5 h-3.5 text-rose-600" /> Locked ({user.failed_attempts}/5)
                          </span>
                          <Button
                            onClick={() => promptUnlockUser(user)}
                            size="sm"
                            className="h-7 px-2.5 text-[11px] font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg shadow-xs flex items-center gap-1 cursor-pointer"
                            title="Click to unblock this account in the database"
                          >
                            <Unlock className="w-3 h-3" /> Unblock
                          </Button>
                        </div>
                      ) : Number(user.failed_attempts) > 0 ? (
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-amber-50 text-amber-700 text-xs font-bold border border-amber-200" title="Recent failed login attempts detected">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span> {user.failed_attempts} Failed
                          </span>
                          <Button
                            onClick={() => promptUnlockUser(user)}
                            size="sm"
                            variant="outline"
                            className="h-7 px-2 text-[11px] font-semibold text-amber-700 border-amber-300 hover:bg-amber-50 rounded-lg flex items-center gap-1 cursor-pointer"
                            title="Reset failed login attempts in database"
                          >
                            <Unlock className="w-3 h-3" /> Reset / Unblock
                          </Button>
                        </div>
                      ) : user.is_active ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-700 text-xs font-bold">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-100 text-slate-600 text-xs font-bold">
                          <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span> Inactive
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-slate-500 font-medium">
                      {user.created_at ? new Date(user.created_at).toLocaleDateString() : "-"}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {Number(user.is_locked) === 1 || Number(user.failed_attempts) > 0 ? (
                          <Button 
                            onClick={() => promptUnlockUser(user)}
                            size="sm"
                            className="h-8 px-2.5 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg shadow-xs flex items-center gap-1 cursor-pointer"
                            title="Unblock account & clear failed login attempts in database"
                          >
                            <Unlock className="w-3.5 h-3.5" /> Unblock
                          </Button>
                        ) : (
                          <Button 
                            onClick={() => promptLockUser(user)}
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg cursor-pointer"
                            title="Lock account in database (prevents user from logging in)"
                          >
                            <Lock className="w-4 h-4" />
                          </Button>
                        )}
                        <Button 
                          onClick={() => {
                            setEditingUser(user);
                            setFormData({
                              full_name: user.full_name || user.name || '',
                              email: user.email || '',
                              mobile: user.mobile || '',
                              designation: user.designation || '',
                              department: user.department || '',
                              password: '',
                              role_id: user.role_id ? String(user.role_id) : '',
                              is_active: user.is_active === 1 || user.is_active === true || user.is_active === undefined
                            });
                            setIsUserModalOpen(true);
                          }}
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 text-slate-400 hover:text-[#1447E6] hover:bg-indigo-50 rounded-lg"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button 
                          onClick={() => {
                            setPasswordData({ id: user.id, password: '' });
                            setIsPasswordModalOpen(true);
                          }}
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg"
                        >
                          <RefreshCw className="h-4 w-4" />
                        </Button>
                        {(() => {
                          const isLastActiveAdmin = user.role === 'Administrator' && activeUsers.filter(u => u.role === 'Administrator' && u.is_active).length <= 1;
                          const isCurrentSelf = currentUserData?.id && Number(currentUserData.id) === Number(user.id);
                          if (isLastActiveAdmin || isCurrentSelf) return null;
                          return (
                            <>
                              <Button 
                                onClick={() => toggleUserStatus(user)}
                                variant="ghost" 
                                size="icon" 
                                className={cn(
                                  "h-8 w-8 rounded-lg",
                                  user.is_active ? "text-slate-400 hover:text-rose-600 hover:bg-rose-50" : "text-slate-400 hover:text-emerald-600 hover:bg-emerald-50"
                                )}
                              >
                                <PowerOff className="h-4 w-4" />
                              </Button>
                              <Button 
                                onClick={() => deleteUser(user)}
                                variant="ghost" 
                                size="icon" 
                                className="h-8 w-8 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </>
                          );
                        })()}
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredUsers.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-6 py-8 text-center text-slate-500 font-medium">
                      {userFilter === 'locked' ? "No locked accounts found. All users are currently unlocked." : "No users found."}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {/* Roles Overview */}
      <div className="space-y-4 pt-6 border-t border-slate-200">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-black text-slate-900 tracking-tight">Roles Overview</h2>
          <span className="text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1 rounded-full border border-slate-200/60">
            {roles.length} system roles
          </span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {roles.map(role => {
            const usersInRole = activeUsers.filter(u => u.role_id === role.id).length;
            const isAdmin = role.role_name === 'Administrator';
            return (
              <Card key={role.id} className="relative overflow-hidden rounded-2xl border border-slate-200/80 shadow-sm bg-white p-5 flex flex-col justify-between transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md hover:border-teal-200 group">
                <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-gradient-to-br from-teal-500/10 to-transparent rounded-full blur-2xl pointer-events-none" />
                
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-black uppercase tracking-wider bg-teal-50 text-teal-700 border border-teal-200/60">
                      {usersInRole} {usersInRole === 1 ? 'user' : 'users'}
                    </span>
                    <div className="p-1.5 rounded-lg bg-slate-50 text-slate-400 group-hover:text-teal-600 group-hover:bg-teal-50 transition-colors">
                      <Shield className="w-4 h-4" />
                    </div>
                  </div>

                  <h3 className="text-base font-black text-slate-900 mb-1 group-hover:text-emerald-700 transition-colors">{role.role_name}</h3>
                  <p className="text-xs font-medium text-slate-500 mb-5 line-clamp-2 leading-relaxed">
                    {role.description || (isAdmin ? "Full access to all system modules and settings" : "Standard role permissions.")}
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-100 mt-auto">
                  {!isAdmin ? (
                    <Button 
                      onClick={() => openRoleModal(role)}
                      variant="outline"
                      className="w-full h-9 rounded-xl text-xs font-bold border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors"
                    >
                      Manage Role
                    </Button>
                  ) : (
                    <div className="w-full h-9 rounded-xl bg-slate-50 border border-slate-100 text-slate-400 font-bold text-[11px] flex items-center justify-center">
                      Full System Access
                    </div>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Role Information Modal */}
      {isRoleModalOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm"
          onClick={() => setIsRoleModalOpen(false)}
        >
          <div 
            className="bg-white rounded-3xl shadow-xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh]"
            onClick={e => e.stopPropagation()}
          >
            <div className="px-8 py-5 border-b border-slate-100 flex items-center justify-between shrink-0">
              <h3 className="text-xl font-black text-slate-900">Role Information</h3>
              <button onClick={() => setIsRoleModalOpen(false)} className="text-slate-400 hover:text-slate-600">×</button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-8 flex flex-col space-y-8">
              <div className="flex flex-col md:flex-row gap-8">
                <div className="flex-1 space-y-6">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Role Name</label>
                  <input 
                    type="text" 
                    value={roleData.role_name}
                    onChange={e => setRoleData({...roleData, role_name: e.target.value})}
                    className="w-full h-11 px-4 rounded-xl border border-slate-200 focus:border-[#1447E6] focus:ring-2 focus:ring-[#1447E6]/10 font-bold text-slate-900 bg-slate-50"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Active Users</label>
                  <div className="text-slate-900 font-medium">
                    {editingRole ? activeUsers.filter(u => u.role_id === editingRole.id).length : 0}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Description</label>
                  <textarea 
                    value={roleData.description}
                    onChange={e => setRoleData({...roleData, description: e.target.value})}
                    className="w-full h-24 p-4 rounded-xl border border-slate-200 focus:border-[#1447E6] focus:ring-2 focus:ring-[#1447E6]/10 font-medium text-slate-600 bg-slate-50 resize-none"
                  />
                </div>

                <div className="pt-2">
                  <div className="mb-4">
                    <label className="block text-sm font-bold text-slate-900">Role Default Permissions</label>
                    <span className="text-xs text-slate-500">Permissions assigned to this role apply to all users with this role.</span>
                  </div>
                  <div className="text-[12px] text-slate-600 mb-6 bg-[#f8fbff] p-4 rounded-xl border border-blue-100 flex gap-3 items-start">
                    <Info className="w-4 h-4 text-[#1447E6] shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-[#1447E6] font-bold mb-2 block">Scope Guide</strong>
                      <ul className="space-y-1.5 list-disc list-inside">
                        <li><strong>All</strong> &ndash; Access all records.</li>
                        <li><strong>Assigned</strong> &ndash; Access only records assigned to the user by admin.</li>
                        <li><strong>None</strong> &ndash; No access to this module.</li>
                      </ul>
                    </div>
                  </div>
                  <div className="overflow-x-auto border border-slate-200 rounded-xl bg-white shadow-sm">
                    <table className="w-full text-sm text-left">
                      <thead className="bg-slate-50/50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase">
                        <tr>
                          <th className="px-6 py-4">Module</th>
                          <th className="px-3 py-4 text-center">View</th>
                          <th className="px-3 py-4 text-center">Add</th>
                          <th className="px-3 py-4 text-center">Edit</th>
                          <th className="px-3 py-4 text-center">Delete</th>
                          <th className="px-6 py-4 text-center">Scope</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {mockModules.map(mod => {
                          const config = moduleConfig[mod];
                          const p = permissions[mod] || { view: false, add: false, edit: false, delete: false, scope: config.scopes.includes('Assigned') ? 'Assigned' : 'All' };
                          const CheckBox = ({ checked, onChange, allowed }: { checked: boolean, onChange: (val: boolean) => void, allowed: boolean }) => {
                            if (!allowed) {
                              return <div className="w-5 h-5 flex items-center justify-center text-slate-300 font-bold">—</div>;
                            }
                            return (
                              <button
                                type="button"
                                onClick={() => onChange(!checked)}
                                className={cn(
                                  "w-5 h-5 rounded flex items-center justify-center transition-all border outline-none focus:ring-2 focus:ring-[#42bc24]/30", 
                                  checked ? "bg-gradient-to-br from-[#42bc24] to-[#36961c] text-white border-transparent shadow-sm" : "bg-white text-transparent border-slate-300 hover:border-[#42bc24]"
                                )}
                              >
                                <Check className="w-3.5 h-3.5" strokeWidth={3} />
                              </button>
                            );
                          };
                          const Icon = moduleIcons[mod] || Settings;

                          return (
                            <tr key={mod} className="hover:bg-slate-50/50">
                              <td className="px-6 py-4">
                                <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-teal-50 border border-teal-100">
                                    <Icon className="w-4 h-4 text-teal-700" strokeWidth={2} />
                                  </div>
                                  <span className="font-bold text-[13px] text-slate-700">{config.label}</span>
                                </div>
                              </td>
                              <td className="px-3 py-4"><div className="flex justify-center"><CheckBox checked={p.view} allowed={config.view} onChange={v => updatePermission(mod, 'view', v)} /></div></td>
                              <td className="px-3 py-4"><div className="flex justify-center"><CheckBox checked={p.add} allowed={config.add} onChange={v => updatePermission(mod, 'add', v)} /></div></td>
                              <td className="px-3 py-4"><div className="flex justify-center"><CheckBox checked={p.edit} allowed={config.edit} onChange={v => updatePermission(mod, 'edit', v)} /></div></td>
                              <td className="px-3 py-4"><div className="flex justify-center"><CheckBox checked={p.delete} allowed={config.delete} onChange={v => updatePermission(mod, 'delete', v)} /></div></td>
                              <td className="px-6 py-4">
                                {config.scopes.length <= 1 ? (
                                  <div className="w-[140px] h-9 mx-auto px-3 rounded-lg border border-slate-200 bg-slate-50 flex items-center justify-between text-[12px] font-bold text-slate-400">
                                    <span>{config.scopes[0]}</span>
                                    <Lock className="w-3.5 h-3.5 opacity-50" />
                                  </div>
                                ) : (
                                  <select 
                                    value={p.scope} 
                                    onChange={e => updatePermission(mod, 'scope', e.target.value)}
                                    className="w-[140px] mx-auto block h-9 text-[12px] font-bold rounded-lg border-slate-200 focus:ring-[#42bc24] text-slate-700 bg-white shadow-sm"
                                  >
                                    {config.scopes.map(s => <option key={s} value={s}>{s}</option>)}
                                  </select>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
                </div>
              </div>

              <div className="pt-6 border-t border-slate-100">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <Users className="w-4 h-4 text-teal-600" />
                    Users assigned to this role ({editingRole ? activeUsers.filter(u => u.role_id === editingRole.id).length : 0})
                  </h4>
                  <Button variant="outline" size="sm" className="h-8 text-xs font-bold text-teal-700 border-teal-200 bg-teal-50/50 hover:bg-teal-50">
                    View Users
                  </Button>
                </div>
                {(!editingRole || activeUsers.filter(u => u.role_id === editingRole.id).length === 0) ? (
                  <div className="bg-slate-50 border border-slate-100 rounded-xl p-6 text-center">
                    <p className="text-sm font-medium text-slate-500">No users currently assigned to this role.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {activeUsers.filter(u => u.role_id === editingRole.id).map(u => (
                      <div key={u.id} className="flex items-center gap-4 bg-white border border-slate-200 p-4 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                        {u.profile_photo ? (
                          <img 
                            src={u.profile_photo.startsWith('http') ? u.profile_photo : `${API_BASE_URL.replace('/api', '')}/${u.profile_photo.replace(/^(?:\.\.\/)+|^(?:\.\/)+/, '')}`} 
                            alt={u.full_name || u.name} 
                            className="h-10 w-10 rounded-full object-cover border border-slate-200 shadow-sm shrink-0" 
                          />
                        ) : (
                          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-[#42bc24] to-[#36961c] text-white flex items-center justify-center font-black text-sm shrink-0 shadow-inner">
                            {u.full_name?.charAt(0) || u.email?.charAt(0)}
                          </div>
                        )}
                        <div className="min-w-0 flex-1">
                          <div className="text-sm font-bold text-slate-900 truncate">{u.full_name || u.name}</div>
                          <div className="text-xs font-medium text-slate-500 truncate">{u.email}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="px-8 py-5 border-t border-slate-100 bg-slate-50 flex items-center justify-end gap-3 shrink-0">
              <Button type="button" variant="ghost" onClick={() => setIsRoleModalOpen(false)} className="rounded-xl font-bold text-slate-600 hover:bg-slate-200/60">Cancel</Button>
              <Button 
                onClick={handleRoleSubmit}
                disabled={isSaving}
                className="btn-primary h-11 px-6 rounded-xl font-bold shadow-lg transition-transform active:scale-95"
              >
                {isSaving ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* User Modal */}
      {isUserModalOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm"
          onClick={() => setIsUserModalOpen(false)}
        >
          <div 
            className="bg-white rounded-3xl shadow-xl w-full max-w-md overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-lg font-black text-slate-900">{editingUser ? 'Edit User' : 'Add New User'}</h3>
              <button onClick={() => setIsUserModalOpen(false)} className="text-slate-400 hover:text-slate-600">×</button>
            </div>
            <form onSubmit={handleUserSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Profile Photo (Optional)</label>
                <input 
                  type="file" 
                  accept="image/*"
                  onChange={e => {
                    if (e.target.files && e.target.files[0]) {
                      const file = e.target.files[0];
                      if (file.size > 2 * 1024 * 1024) {
                        toast.error("File size must be less than 2MB");
                        e.target.value = '';
                        setSelectedPhoto(null);
                        return;
                      }
                      setSelectedPhoto(file);
                    }
                  }}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl bg-slate-50 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-teal-50 file:text-teal-700 hover:file:bg-teal-100 cursor-pointer"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Full Name</label>
                <input 
                  type="text" 
                  required
                  maxLength={100}
                  value={formData.full_name}
                  onChange={e => setFormData({...formData, full_name: e.target.value})}
                  className="w-full h-11 px-4 rounded-xl border border-slate-200 focus:border-[#42bc24] focus:ring-2 focus:ring-[#42bc24]/20 text-sm font-medium outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Email Address</label>
                <input 
                  type="email" 
                  required
                  maxLength={150}
                  value={formData.email}
                  onChange={e => setFormData({...formData, email: e.target.value})}
                  className="w-full h-11 px-4 rounded-xl border border-slate-200 focus:border-[#42bc24] focus:ring-2 focus:ring-[#42bc24]/20 text-sm font-medium outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Mobile Number</label>
                <input 
                  type="text" 
                  maxLength={10}
                  pattern="[0-9]{10}"
                  title="Please enter exactly 10 digits"
                  value={formData.mobile}
                  onChange={e => {
                    const val = e.target.value.replace(/\D/g, '').slice(0, 10);
                    setFormData({...formData, mobile: val});
                  }}
                  className="w-full h-11 px-4 rounded-xl border border-slate-200 focus:border-[#42bc24] focus:ring-2 focus:ring-[#42bc24]/20 text-sm font-medium outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Designation</label>
                  <input 
                    type="text" 
                    value={formData.designation}
                    onChange={e => setFormData({...formData, designation: e.target.value})}
                    className="w-full h-11 px-4 rounded-xl border border-slate-200 focus:border-[#42bc24] focus:ring-2 focus:ring-[#42bc24]/20 text-sm font-medium outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Department</label>
                  <input 
                    type="text" 
                    value={formData.department}
                    onChange={e => setFormData({...formData, department: e.target.value})}
                    className="w-full h-11 px-4 rounded-xl border border-slate-200 focus:border-[#42bc24] focus:ring-2 focus:ring-[#42bc24]/20 text-sm font-medium outline-none"
                  />
                </div>
              </div>
              {!editingUser && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Initial Password</label>
                  <input 
                    type="password" 
                    required
                    value={formData.password}
                    onChange={e => setFormData({...formData, password: e.target.value})}
                    className="w-full h-11 px-4 rounded-xl border border-slate-200 focus:border-[#42bc24] focus:ring-2 focus:ring-[#42bc24]/20 text-sm font-medium outline-none"
                  />
                </div>
              )}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Assign Role</label>
                <select 
                  required
                  value={String(formData.role_id)}
                  onChange={e => setFormData({...formData, role_id: e.target.value})}
                  className="w-full h-11 px-4 rounded-xl border border-slate-200 focus:border-[#42bc24] focus:ring-2 focus:ring-[#42bc24]/20 text-sm bg-white font-medium outline-none"
                >
                  <option value="" disabled>Select a role...</option>
                  {roles.map(r => (
                    <option key={r.id} value={String(r.id)}>{r.role_name}</option>
                  ))}
                </select>
              </div>
              <div className="flex items-center gap-2 pt-2">
                <input 
                  type="checkbox" 
                  id="isActive"
                  checked={formData.is_active}
                  onChange={e => setFormData({...formData, is_active: e.target.checked})}
                  className="w-4 h-4 rounded border-slate-300 text-[#42bc24] focus:ring-[#42bc24]"
                />
                <label htmlFor="isActive" className="text-sm font-bold text-slate-700 cursor-pointer">Active Account</label>
              </div>
              <div className="pt-4 flex items-center justify-end gap-3">
                <Button type="button" variant="ghost" onClick={() => setIsUserModalOpen(false)} className="rounded-xl font-bold">Cancel</Button>
                <Button type="submit" className="btn-primary h-11 px-6 rounded-xl font-bold shadow-lg transition-transform active:scale-95">Save User</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Password Reset Modal */}
      {isPasswordModalOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm"
          onClick={() => setIsPasswordModalOpen(false)}
        >
          <div 
            className="bg-white rounded-3xl shadow-xl w-full max-w-sm overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-lg font-black text-slate-900">Reset Password</h3>
              <button onClick={() => setIsPasswordModalOpen(false)} className="text-slate-400 hover:text-slate-600">×</button>
            </div>
            <form onSubmit={handlePasswordReset} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">New Password</label>
                <input 
                  type="password" 
                  required
                  value={passwordData.password}
                  onChange={e => setPasswordData({...passwordData, password: e.target.value})}
                  className="w-full h-11 px-4 rounded-xl border border-slate-200 focus:border-[#42bc24] focus:ring-2 focus:ring-[#42bc24]/20 text-sm font-medium outline-none"
                />
              </div>
              <div className="pt-2 flex items-center justify-end gap-3">
                <Button type="button" variant="ghost" onClick={() => setIsPasswordModalOpen(false)} className="rounded-xl font-bold">Cancel</Button>
                <Button type="submit" className="btn-primary h-11 px-6 rounded-xl font-bold shadow-lg transition-transform active:scale-95">Reset Password</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Good Pop-up Confirmation Modal (No native alerts) */}
      {confirmModal.isOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => !confirmModal.isProcessing && setConfirmModal(prev => ({ ...prev, isOpen: false }))}
        >
          <div 
            className="bg-white rounded-3xl shadow-2xl border border-slate-100 w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200 relative"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top Accent Bar */}
            <div className={cn(
              "h-2 w-full",
              confirmModal.type === 'unlock_single' || confirmModal.type === 'unlock_all'
                ? "bg-gradient-to-r from-emerald-400 via-teal-500 to-[#42bc24]"
                : confirmModal.type === 'lock_single'
                ? "bg-gradient-to-r from-amber-400 to-rose-500"
                : "bg-gradient-to-r from-rose-500 to-red-600"
            )} />

            {/* Close Button */}
            <button 
              type="button"
              disabled={confirmModal.isProcessing}
              onClick={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))} 
              className="absolute right-4 top-5 p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="p-6 sm:p-7 space-y-5">
              {/* Header with glowing icon badge */}
              <div className="flex items-center gap-4">
                <div className={cn(
                  "w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-inner",
                  confirmModal.type === 'unlock_single' || confirmModal.type === 'unlock_all'
                    ? "bg-emerald-50 text-emerald-600 border border-emerald-200/80"
                    : confirmModal.type === 'lock_single'
                    ? "bg-amber-50 text-amber-600 border border-amber-200/80"
                    : "bg-rose-50 text-rose-600 border border-rose-200/80"
                )}>
                  {confirmModal.type === 'unlock_single' && <Unlock className="w-7 h-7" />}
                  {confirmModal.type === 'unlock_all' && <ShieldAlert className="w-7 h-7" />}
                  {confirmModal.type === 'lock_single' && <Lock className="w-7 h-7" />}
                  {confirmModal.type === 'delete_user' && <Trash2 className="w-7 h-7" />}
                </div>

                <div>
                  <h3 className="text-lg font-black text-slate-900 leading-snug">
                    {confirmModal.type === 'unlock_single' && "Unblock User Account"}
                    {confirmModal.type === 'unlock_all' && "Unblock All Accounts"}
                    {confirmModal.type === 'lock_single' && "Lock User Account"}
                    {confirmModal.type === 'delete_user' && "Delete User Account"}
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {confirmModal.type === 'unlock_single' && "Confirm database account unblocking"}
                    {confirmModal.type === 'unlock_all' && "Clear all lockout records in MySQL"}
                    {confirmModal.type === 'lock_single' && "Restrict dashboard sign-in access"}
                    {confirmModal.type === 'delete_user' && "Permanently remove user credentials"}
                  </p>
                </div>
              </div>

              {/* Target User Info or Summary Box */}
              {(confirmModal.type === 'unlock_single' || confirmModal.type === 'lock_single' || confirmModal.type === 'delete_user') && (
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center gap-3.5 shadow-xs">
                  {confirmModal.user?.profile_photo ? (
                    <img 
                      src={confirmModal.user.profile_photo.startsWith('http') ? confirmModal.user.profile_photo : `${API_BASE_URL.replace('/api', '')}/${confirmModal.user.profile_photo.replace(/^(?:\.\.\/)+|^(?:\.\/)+/, '')}`} 
                      alt={confirmModal.name} 
                      className="w-12 h-12 rounded-full object-cover border border-slate-200 shadow-sm shrink-0" 
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center font-black text-base shrink-0 shadow-sm">
                      {(confirmModal.name || confirmModal.email || 'U').charAt(0).toUpperCase()}
                    </div>
                  )}

                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="font-bold text-sm text-slate-900 truncate">
                      {confirmModal.name || confirmModal.email}
                    </div>
                    <div className="text-xs text-slate-500 truncate font-mono">
                      {confirmModal.email || confirmModal.user?.email}
                    </div>
                    <div className="flex flex-wrap items-center gap-2 pt-0.5">
                      {confirmModal.attempts !== undefined && confirmModal.attempts > 0 && (
                        <span className={cn(
                          "text-[10px] font-black uppercase px-2 py-0.5 rounded-md",
                          confirmModal.attempts >= 5 ? "bg-rose-100 text-rose-700" : "bg-amber-100 text-amber-700"
                        )}>
                          {confirmModal.attempts >= 5 ? "Locked (5/5 Failed)" : `${confirmModal.attempts} Failed Attempts`}
                        </span>
                      )}
                      {confirmModal.ip && (
                        <span className="text-[10px] text-slate-500 font-mono">
                          IP: {confirmModal.ip}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {confirmModal.type === 'unlock_all' && (
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between shadow-xs">
                  <div className="space-y-0.5">
                    <span className="text-xs text-slate-500 font-medium">Registered Accounts</span>
                    <div className="text-xl font-black text-slate-900">{activeUsers.length} Users</div>
                  </div>
                  <div className="h-9 w-px bg-slate-200" />
                  <div className="space-y-0.5 text-right">
                    <span className="text-xs text-rose-600 font-bold">Active Lockouts</span>
                    <div className="text-xl font-black text-rose-600">{activeLockouts.length} in DB</div>
                  </div>
                </div>
              )}

              {/* Informative Explanation Notice */}
              <div className={cn(
                "p-3.5 rounded-2xl text-xs leading-relaxed flex items-start gap-2.5",
                confirmModal.type === 'unlock_single' || confirmModal.type === 'unlock_all'
                  ? "bg-emerald-50 text-emerald-900 border border-emerald-200/80"
                  : confirmModal.type === 'lock_single'
                  ? "bg-amber-50 text-amber-900 border border-amber-200/80"
                  : "bg-rose-50 text-rose-900 border border-rose-200/80"
              )}>
                <Info className="w-4 h-4 shrink-0 mt-0.5" />
                <div>
                  {confirmModal.type === 'unlock_single' && (
                    <span>
                      Unblocking this account will reset failed attempts to 0 and clear temporary IP blocks in MySQL. The user will be able to sign in immediately.
                    </span>
                  )}
                  {confirmModal.type === 'unlock_all' && (
                    <span>
                      This will truncate all failed login attempts across the MySQL database. All accounts currently locked out will regain instant login access.
                    </span>
                  )}
                  {confirmModal.type === 'lock_single' && (
                    <span>
                      This will insert 5 failed attempts in the database for this user. They will be prevented from logging in until an admin unblocks them.
                    </span>
                  )}
                  {confirmModal.type === 'delete_user' && (
                    <span>
                      Are you sure you want to delete this user? Their account details and role associations will be permanently removed.
                    </span>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex items-center justify-end gap-3">
                <Button 
                  type="button" 
                  variant="ghost" 
                  disabled={confirmModal.isProcessing}
                  onClick={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))} 
                  className="h-11 px-5 rounded-xl font-bold text-slate-600 hover:bg-slate-100 hover:text-slate-900 cursor-pointer"
                >
                  Cancel
                </Button>

                <Button 
                  type="button"
                  disabled={confirmModal.isProcessing}
                  onClick={handleConfirmAction}
                  className={cn(
                    "h-11 px-6 rounded-xl font-bold text-white shadow-md flex items-center gap-2 cursor-pointer transition-all active:scale-95",
                    confirmModal.type === 'unlock_single' || confirmModal.type === 'unlock_all'
                      ? "bg-emerald-600 hover:bg-emerald-700"
                      : confirmModal.type === 'lock_single'
                      ? "bg-amber-600 hover:bg-amber-700"
                      : "bg-rose-600 hover:bg-rose-700"
                  )}
                >
                  {confirmModal.isProcessing ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin mr-1" />
                      Processing...
                    </>
                  ) : (
                    <>
                      {confirmModal.type === 'unlock_single' && (
                        <>
                          <Unlock className="w-4 h-4" />
                          Confirm & Unblock
                        </>
                      )}
                      {confirmModal.type === 'unlock_all' && (
                        <>
                          <Unlock className="w-4 h-4" />
                          Unblock All Accounts
                        </>
                      )}
                      {confirmModal.type === 'lock_single' && (
                        <>
                          <Lock className="w-4 h-4" />
                          Lock Account
                        </>
                      )}
                      {confirmModal.type === 'delete_user' && (
                        <>
                          <Trash2 className="w-4 h-4" />
                          Delete User
                        </>
                      )}
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
