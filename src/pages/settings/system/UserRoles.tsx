import { useState, useEffect } from "react";
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
  MoreHorizontal
} from "lucide-react";

const mockModules = [
  "Dashboard",
  "Job Openings",
  "Candidates",
  "Interviews",
  "Pipeline",
  "Offers",
  "Risk Management",
  "Reports",
  "Alerts",
  "Email Settings",
  "Users & Roles",
  "System Settings"
];

// Map modules to descriptive names like in the reference
const moduleDescriptions: Record<string, string> = {
  "Dashboard": "Dashboard Access",
  "Job Openings": "Job Openings",
  "Candidates": "Candidate Management",
  "Interviews": "Interview Tracking",
  "Pipeline": "Pipeline Management",
  "Offers": "Offer Processing",
  "Risk Management": "Risk & Audit Control",
  "Reports": "Reports & Analytics",
  "Alerts": "Alerts & Notifications",
  "Email Settings": "Email Templates",
  "Users & Roles": "Users & Roles",
  "System Settings": "System Settings",
};

const API_BASE_URL = import.meta.env.PROD 
  ? "https://demo.hexalearn.com/cimss/api" 
  : "http://localhost/full-cims/api";

export default function UserRoles() {
  const [roles, setRoles] = useState<any[]>([]);
  const [activeUsers, setActiveUsers] = useState<any[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isAuthorized, setIsAuthorized] = useState(true);

  // Modals
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);

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

  // permissions: Record<module_name, boolean> (Simplified toggle for all actions)
  const [permissions, setPermissions] = useState<Record<string, boolean>>({});

  const fetchUsers = () => {
    fetch(`${API_BASE_URL}/system/users.php`, { credentials: 'include' })
      .then(res => res.json())
      .then(res => {
        if (res.status === "success") {
          setActiveUsers(res.data);
        }
      });
  };

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

  const openRoleModal = (role?: any) => {
    if (role) {
      setEditingRole(role);
      setRoleData({ role_name: role.role_name, description: role.description || '' });
      // Fetch permissions
      fetch(`${API_BASE_URL}/system/permissions.php?role_id=${role.id}`, { credentials: 'include' })
        .then(res => res.json())
        .then(res => {
          if (res.status === "success") {
            const permMap: Record<string, boolean> = {};
            res.data.forEach((p: any) => {
              permMap[p.module_name] = !!p.can_view; // Simple toggle
            });
            setPermissions(permMap);
            setIsRoleModalOpen(true);
          }
        });
    } else {
      setEditingRole(null);
      setRoleData({ role_name: '', description: '' });
      setPermissions({});
      setIsRoleModalOpen(true);
    }
  };

  const togglePermission = (mod: string) => {
    setPermissions(prev => ({
      ...prev,
      [mod]: !prev[mod]
    }));
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
            can_view: !!permissions[mod],
            can_add: !!permissions[mod],
            can_edit: !!permissions[mod],
            can_delete: !!permissions[mod]
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
        setIsUserModalOpen(false);
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

  const deleteUser = async (user: any) => {
    if (!confirm(`Are you sure you want to delete ${user.full_name}?`)) return;
    try {
      const res = await fetch(`${API_BASE_URL}/system/users.php?id=${user.id}`, {
        method: 'DELETE',
        credentials: 'include'
      }).then(r => r.json());

      if (res.status === "success") {
        toast.success(res.message);
        fetchUsers();
      } else {
        toast.error(res.message);
      }
    } catch (err) {
      toast.error("An error occurred while deleting user");
    }
  };

  if (!isAuthorized) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-[80vh] p-8">
        <ShieldAlert className="h-20 w-20 text-rose-500 mb-6 opacity-80" />
        <h1 className="text-3xl font-black tracking-tight text-slate-900 mb-2">403 Access Denied</h1>
        <p className="text-slate-500 max-w-md text-center">
          You do not have the required permissions to view or manage User Roles. Only Super Administrators can access this page.
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
    <div className="flex-1 w-full p-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900">Users & Roles</h1>
          <p className="text-sm font-medium text-slate-500 mt-1">Manage user permissions and access control</p>
        </div>
        <Button 
          onClick={() => {
            setEditingUser(null);
            setFormData({ full_name: '', email: '', password: '', role_id: roles[0]?.id ? String(roles[0].id) : '', is_active: true });
            setIsUserModalOpen(true);
          }}
          className="h-10 px-4 rounded-xl font-bold bg-[#1447E6] hover:bg-[#0c31a6] text-white shadow-md shadow-[#1447E6]/20"
        >
          <Plus className="w-4 h-4 mr-2" /> Add User
        </Button>
      </div>

      {/* Users Table */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-slate-900">Users</h2>
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
                {activeUsers.map((user, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {user.profile_photo ? (
                          <img src={user.profile_photo.startsWith('http') ? user.profile_photo : `${API_BASE_URL}/${user.profile_photo}`} alt={user.full_name || user.name} className="h-9 w-9 rounded-full object-cover border border-slate-200 shadow-sm" />
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
                      {user.is_active ? (
                        <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-emerald-50 text-emerald-700 text-xs font-bold">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-slate-100 text-slate-600 text-xs font-bold">
                          <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span> Inactive
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-slate-500 font-medium">
                      {user.created_at ? new Date(user.created_at).toLocaleDateString() : "-"}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1">
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
                        {(user.id != 1 && user.email !== 'ashiskrout1@gmail.com') && (
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
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {activeUsers.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-6 py-8 text-center text-slate-500 font-medium">No users found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {/* Roles Overview */}
      <div className="space-y-4 pt-4 border-t border-slate-200">
        <h2 className="text-lg font-bold text-slate-900">Roles Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {roles.map(role => {
            const usersInRole = activeUsers.filter(u => u.role_id === role.id).length;
            return (
              <Card key={role.id} className="rounded-3xl border-slate-200/60 shadow-sm bg-white p-6 flex flex-col">
                <div className="text-sm font-bold text-slate-500 mb-2">{usersInRole} users</div>
                <h3 className="text-lg font-black text-slate-900 mb-1">{role.role_name}</h3>
                <p className="text-sm font-medium text-slate-500 mb-6 flex-1 line-clamp-2">
                  {role.description || "No description provided."}
                </p>
                


                {role.role_name !== 'Administrator' && (
                  <Button 
                    onClick={() => openRoleModal(role)}
                    variant="outline"
                    className="w-full h-10 rounded-xl font-bold border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-slate-900"
                  >
                    Manage Role
                  </Button>
                )}
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
            
            <div className="flex-1 overflow-y-auto p-8 flex flex-col lg:flex-row gap-12">
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

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-4">Permissions</label>
                  <div className="space-y-4">
                    {mockModules.map(mod => (
                      <div key={mod} className="flex items-center justify-between">
                        <span className="text-sm font-bold text-slate-600">{moduleDescriptions[mod]}</span>
                        <button
                          type="button"
                          onClick={() => togglePermission(mod)}
                          className={cn(
                            "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-[#1447E6] focus:ring-offset-2",
                            permissions[mod] ? "bg-[#1447E6]" : "bg-slate-200"
                          )}
                        >
                          <span
                            className={cn(
                              "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out",
                              permissions[mod] ? "translate-x-5" : "translate-x-0"
                            )}
                          />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="w-full lg:w-72 bg-slate-50 p-6 rounded-2xl border border-slate-100">
                <h4 className="text-sm font-bold text-slate-900 mb-4">
                  Users with this Role ({editingRole ? activeUsers.filter(u => u.role_id === editingRole.id).length : 0})
                </h4>
                <div className="space-y-3">
                  {editingRole && activeUsers.filter(u => u.role_id === editingRole.id).map(u => (
                    <div key={u.id} className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs shrink-0">
                        {u.full_name?.charAt(0) || u.email?.charAt(0)}
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-slate-900 truncate">{u.full_name || u.name}</div>
                        <div className="text-[10px] font-medium text-slate-500 truncate">{u.email}</div>
                      </div>
                    </div>
                  ))}
                  {(!editingRole || activeUsers.filter(u => u.role_id === editingRole.id).length === 0) && (
                    <div className="text-sm font-medium text-slate-500">No users assigned to this role</div>
                  )}
                </div>
              </div>
            </div>

            <div className="px-8 py-5 border-t border-slate-100 bg-slate-50 flex items-center justify-end gap-3 shrink-0">
              <Button type="button" variant="ghost" onClick={() => setIsRoleModalOpen(false)} className="rounded-xl font-bold text-slate-600">Cancel</Button>
              <Button 
                onClick={handleRoleSubmit}
                disabled={isSaving}
                className="bg-[#1447E6] hover:bg-[#0c31a6] text-white rounded-xl font-bold shadow-md shadow-[#1447E6]/20"
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
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Full Name</label>
                <input 
                  type="text" 
                  required
                  value={formData.full_name}
                  onChange={e => setFormData({...formData, full_name: e.target.value})}
                  className="w-full h-11 px-4 rounded-xl border border-slate-200 focus:border-[#1447E6] focus:ring-2 focus:ring-[#1447E6]/10 text-sm font-medium"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Email Address</label>
                <input 
                  type="email" 
                  required
                  value={formData.email}
                  onChange={e => setFormData({...formData, email: e.target.value})}
                  className="w-full h-11 px-4 rounded-xl border border-slate-200 focus:border-[#1447E6] focus:ring-2 focus:ring-[#1447E6]/10 text-sm font-medium"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Mobile Number</label>
                <input 
                  type="text" 
                  value={formData.mobile}
                  onChange={e => setFormData({...formData, mobile: e.target.value})}
                  className="w-full h-11 px-4 rounded-xl border border-slate-200 focus:border-[#1447E6] focus:ring-2 focus:ring-[#1447E6]/10 text-sm font-medium"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Designation</label>
                  <input 
                    type="text" 
                    value={formData.designation}
                    onChange={e => setFormData({...formData, designation: e.target.value})}
                    className="w-full h-11 px-4 rounded-xl border border-slate-200 focus:border-[#1447E6] focus:ring-2 focus:ring-[#1447E6]/10 text-sm font-medium"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Department</label>
                  <input 
                    type="text" 
                    value={formData.department}
                    onChange={e => setFormData({...formData, department: e.target.value})}
                    className="w-full h-11 px-4 rounded-xl border border-slate-200 focus:border-[#1447E6] focus:ring-2 focus:ring-[#1447E6]/10 text-sm font-medium"
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
                    className="w-full h-11 px-4 rounded-xl border border-slate-200 focus:border-[#1447E6] focus:ring-2 focus:ring-[#1447E6]/10 text-sm font-medium"
                  />
                </div>
              )}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Assign Role</label>
                <select 
                  required
                  value={String(formData.role_id)}
                  onChange={e => setFormData({...formData, role_id: e.target.value})}
                  className="w-full h-11 px-4 rounded-xl border border-slate-200 focus:border-[#1447E6] focus:ring-2 focus:ring-[#1447E6]/10 text-sm bg-white font-medium"
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
                  className="w-4 h-4 rounded border-slate-300 text-[#1447E6] focus:ring-[#1447E6]"
                />
                <label htmlFor="isActive" className="text-sm font-bold text-slate-700 cursor-pointer">Active Account</label>
              </div>
              <div className="pt-4 flex items-center justify-end gap-3">
                <Button type="button" variant="ghost" onClick={() => setIsUserModalOpen(false)} className="rounded-xl font-bold">Cancel</Button>
                <Button type="submit" className="bg-[#1447E6] hover:bg-[#0c31a6] text-white rounded-xl font-bold shadow-md shadow-[#1447E6]/20">Save User</Button>
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
                  className="w-full h-11 px-4 rounded-xl border border-slate-200 focus:border-[#1447E6] focus:ring-2 focus:ring-[#1447E6]/10 text-sm font-medium"
                />
              </div>
              <div className="pt-2 flex items-center justify-end gap-3">
                <Button type="button" variant="ghost" onClick={() => setIsPasswordModalOpen(false)} className="rounded-xl font-bold">Cancel</Button>
                <Button type="submit" className="bg-[#1447E6] hover:bg-[#0c31a6] text-white rounded-xl font-bold shadow-md shadow-[#1447E6]/20">Reset Password</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
