import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import {
  ShieldAlert,
  Users,
  Pencil,
  Save,
  Plus,
  MoreHorizontal,
  Lock
} from "lucide-react";

const mockModules = [
  "Dashboard",
  "Candidates",
  "Interviews",
  "Pipeline",
  "Offers",
  "Risk Management",
  "Reports",
  "Alerts",
  "Email Settings",
  "System Settings"
];

// Helper colors for distinct roles based on index or name
const roleColors = [
  "bg-rose-50 text-rose-600 border-rose-200",
  "bg-indigo-50 text-indigo-600 border-indigo-200",
  "bg-emerald-50 text-emerald-600 border-emerald-200",
  "bg-amber-50 text-amber-600 border-amber-200",
  "bg-purple-50 text-purple-600 border-purple-200",
  "bg-blue-50 text-blue-600 border-blue-200",
];

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost/cims_api";

export default function UserRoles() {
  const [roles, setRoles] = useState<any[]>([]);
  const [selectedRole, setSelectedRole] = useState<number | null>(null);
  const [activeUsers, setActiveUsers] = useState<any[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  // permissions: { [module_name]: { can_view: true, can_add: false... } }
  const [permissions, setPermissions] = useState<Record<string, Record<string, boolean>>>({});

  // Fetch roles and active users on mount
  useEffect(() => {
    fetch(`${API_BASE_URL}/system/roles.php`)
      .then(res => res.json())
      .then(res => {
        if (res.status === "success") {
          setRoles(res.data);
          if (res.data.length > 0) {
            setSelectedRole(res.data[0].id);
          }
        }
      });

    fetch(`${API_BASE_URL}/system/users.php`)
      .then(res => res.json())
      .then(res => {
        if (res.status === "success") {
          setActiveUsers(res.data);
        }
      });
  }, []);

  // Fetch permissions when selected role changes
  useEffect(() => {
    if (!selectedRole) return;
    fetch(`${API_BASE_URL}/system/permissions.php?role_id=${selectedRole}`)
      .then(res => res.json())
      .then(res => {
        if (res.status === "success") {
          const permMap: Record<string, any> = {};
          res.data.forEach((p: any) => {
            permMap[p.module_name] = {
              View: !!p.can_view,
              Add: !!p.can_add,
              Edit: !!p.can_edit,
              Delete: !!p.can_delete
            };
          });
          setPermissions(permMap);
        }
      });
  }, [selectedRole]);

  const togglePermission = (mod: string, action: string) => {
    setPermissions(prev => {
      const modPerms = prev[mod] || { View: false, Add: false, Edit: false, Delete: false };
      return {
        ...prev,
        [mod]: {
          ...modPerms,
          [action]: !modPerms[action]
        }
      };
    });
  };

  const isChecked = (mod: string, action: string) => {
    return permissions[mod]?.[action] || false;
  };

  const handleSave = async () => {
    if (!selectedRole) return;
    setIsSaving(true);
    
    // Transform permissions back to API format
    const payloadArray = mockModules.map(mod => {
      const p = permissions[mod] || {};
      return {
        module_name: mod,
        can_view: p.View || false,
        can_add: p.Add || false,
        can_edit: p.Edit || false,
        can_delete: p.Delete || false
      };
    });

    try {
      const res = await fetch(`${API_BASE_URL}/system/permissions.php`, { credentials: 'include', 
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role_id: selectedRole, permissions: payloadArray })
      }).then(r => r.json());

      if (res.status === "success") {
        toast.success("Permissions updated successfully");
      } else {
        toast.error("Failed to update permissions");
      }
    } catch (error) {
      toast.error("An error occurred");
    } finally {
      setIsSaving(false);
    }
  };

  const activeRoleData = roles.find(r => r.id === selectedRole);

  return (
    <div className="space-y-6 pb-10">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Roles & Permissions</h1>
          <p className="text-[13px] text-slate-500 mt-1">
            Manage system access levels, create custom roles, and configure security permissions.
          </p>
        </div>
        <Button className="h-10 px-4 rounded-xl font-bold bg-[#1447E6] hover:bg-[#0c31a6] text-white shadow-md shadow-[#1447E6]/20">
          <Plus className="w-4 h-4 mr-2" /> Create New Role
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {roles.map((role, idx) => {
          const color = roleColors[idx % roleColors.length];
          return (
            <Card 
              key={role.id} 
              className={cn(
                "p-5 bg-white border-2 rounded-3xl cursor-pointer transition-all duration-200",
                selectedRole === role.id ? "border-[#1447E6] shadow-[0_4px_20px_-4px_rgba(20,71,230,0.15)] ring-4 ring-[#1447E6]/10" : "border-slate-100 shadow-sm hover:border-slate-300"
              )}
              onClick={() => setSelectedRole(role.id)}
            >
              <div className="flex items-start justify-between mb-3">
                <div className={cn("px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider border", color)}>
                  {role.role_name}
                </div>
                <button className="text-slate-400 hover:text-[#1447E6] transition-colors p-1">
                  <Pencil className="w-3.5 h-3.5" />
                </button>
              </div>
              <p className="text-[11px] font-medium text-slate-500 mb-4 line-clamp-2 h-8">
                {role.description}
              </p>
              <div className="flex items-center gap-2 pt-4 border-t border-slate-100">
                <Users className="w-4 h-4 text-slate-400" />
                <span className="text-[12px] font-bold text-slate-700">{role.user_count || 0} Assigned Users</span>
              </div>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        <div className="lg:col-span-3 space-y-6">
          <Card className="bg-white border-border/50 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] rounded-3xl overflow-hidden flex flex-col">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-indigo-500" />
                <h3 className="text-[14px] font-bold text-slate-900">
                  Permissions Matrix: <span className="text-indigo-600">{activeRoleData?.role_name}</span>
                </h3>
              </div>
              <span className="text-[11px] font-medium text-slate-500">Auto-saved</span>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left text-[12px]">
                <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="px-6 py-4 w-1/3">Module Name</th>
                    <th className="px-4 py-4 text-center">View</th>
                    <th className="px-4 py-4 text-center">Add</th>
                    <th className="px-4 py-4 text-center">Edit</th>
                    <th className="px-4 py-4 text-center">Delete</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {mockModules.map(mod => (
                    <tr key={mod} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4 font-bold text-slate-700">{mod}</td>
                      {["View", "Add", "Edit", "Delete"].map(action => {
                        const checked = isChecked(mod, action);
                        // Admin role (ID 1 usually) cannot be unchecked
                        const disabled = activeRoleData?.role_name === 'Administrator'; 
                        return (
                          <td key={action} className="px-4 py-4 text-center">
                            <label className="inline-flex items-center cursor-pointer">
                              <input 
                                type="checkbox" 
                                checked={checked}
                                onChange={() => togglePermission(mod, action)}
                                disabled={disabled}
                                className={cn(
                                  "w-4 h-4 rounded border-slate-300 focus:ring-indigo-500 transition-colors cursor-pointer",
                                  checked ? "text-[#1447E6]" : "text-slate-300",
                                  disabled ? "opacity-50 cursor-not-allowed" : ""
                                )}
                              />
                            </label>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          <div className="flex items-center justify-end">
            <Button 
              onClick={handleSave} 
              disabled={isSaving || activeRoleData?.role_name === 'Administrator'}
              className="h-11 px-6 rounded-xl font-bold bg-[#1447E6] hover:bg-[#0c31a6] text-white shadow-md shadow-[#1447E6]/20"
            >
              <Save className="w-4 h-4 mr-2" /> {isSaving ? "Saving..." : "Save Permissions"}
            </Button>
          </div>
        </div>

        <div className="lg:col-span-1">
          <Card className="p-5 bg-white border-border/50 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] rounded-3xl sticky top-6">
            <h3 className="text-[13px] font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Lock className="h-4 w-4 text-emerald-500" />
              Active Users
            </h3>
            <div className="space-y-4">
              {activeUsers.length === 0 ? (
                <div className="text-center text-xs text-slate-500 py-4">No active users found.</div>
              ) : (
                activeUsers.map((user, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 rounded-xl border border-slate-100 hover:border-slate-200 hover:bg-slate-50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-600">
                        {user.avatar}
                      </div>
                      <div>
                        <div className="text-[11px] font-bold text-slate-900">{user.name}</div>
                        <div className="text-[9px] font-bold text-[#1447E6]">{user.role}</div>
                      </div>
                    </div>
                    <button className="text-slate-400 hover:text-slate-900 p-1">
                      <MoreHorizontal className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))
              )}
              <Button variant="outline" className="w-full text-xs font-bold border-dashed border-slate-300 text-slate-500 hover:text-indigo-600 hover:border-indigo-300 hover:bg-indigo-50 rounded-xl h-9">
                Manage User Access
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
