import { Link, useLocation } from "react-router-dom";
import { useState, useEffect, type ReactNode } from "react";
import {
  LayoutDashboard,
  Users,
  KanbanSquare,
  Briefcase,
  BarChart3,
  CalendarDays,
  FileText,
  Ban,
  Bell,
  Settings,
  Mail,
  ChevronDown,
  ChevronRight,
  LogOut,
  Plus,
  UserCheck,
} from "lucide-react";
import { Toaster } from "@/components/ui/sonner";
import { cn } from "@/lib/utils";
import { API_BASE_URL } from "@/config/api";

function ManualEmailDraftModal() {
  const [draft, setDraft] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const handleDraft = (e: any) => {
      setDraft(e.detail);
    };
    window.addEventListener('EMAIL_DRAFT', handleDraft);
    return () => window.removeEventListener('EMAIL_DRAFT', handleDraft);
  }, []);

  if (!draft) return null;

  const sendEmail = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/settings/email/send_manual.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(draft)
      });
      const data = await res.json();
      if (data.success) {
        toast.success(data.message);
        setDraft(null);
      } else {
        toast.error(data.message || "Failed to send email");
      }
    } catch (e) {
      toast.error("Failed to send email");
    }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div>
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">Manual Email Trigger</h2>
            <p className="text-xs text-slate-500 mt-1">Review the automated draft before sending.</p>
          </div>
          <button onClick={() => setDraft(null)} className="h-8 w-8 flex items-center justify-center rounded-full hover:bg-slate-200 text-slate-500 transition-colors">
            <span className="sr-only">Close</span>
            <svg width="15" height="15" viewBox="0 0 15 15" fill="none"><path d="M12.8536 2.85355C13.0488 2.65829 13.0488 2.34171 12.8536 2.14645C12.6583 1.95118 12.3417 1.95118 12.1464 2.14645L7.5 6.79289L2.85355 2.14645C2.65829 1.95118 2.34171 1.95118 2.14645 2.14645C1.95118 2.34171 1.95118 2.65829 2.14645 2.85355L6.79289 7.5L2.14645 12.1464C1.95118 12.3417 1.95118 12.6583 2.14645 12.8536C2.34171 13.0488 2.65829 13.0488 2.85355 12.8536L7.5 8.20711L12.1464 12.8536C12.3417 13.0488 12.6583 13.0488 12.8536 12.8536C13.0488 12.6583 13.0488 12.3417 12.8536 12.1464L8.20711 7.5L12.8536 2.85355Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path></svg>
          </button>
        </div>
        <div className="p-5 overflow-y-auto space-y-4">
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">To</label>
            <input value={draft.to} readOnly className="w-full text-sm bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-700 outline-none" />
          </div>
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Subject</label>
            <input value={draft.subject} onChange={e => setDraft({ ...draft, subject: e.target.value })} className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 text-slate-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all" />
          </div>
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Message Body</label>
            <textarea value={draft.body} onChange={e => setDraft({ ...draft, body: e.target.value })} rows={10} className="w-full text-sm border border-slate-200 rounded-lg px-3 py-3 text-slate-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all font-mono"></textarea>
          </div>
        </div>
        <div className="p-5 border-t border-slate-100 flex items-center justify-end gap-3 bg-slate-50/50">
          <button onClick={() => setDraft(null)} className="px-4 py-2 text-sm font-bold text-slate-600 hover:text-slate-900 transition-colors">Cancel</button>
          <button onClick={sendEmail} disabled={loading} className="px-5 py-2 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-sm transition-colors flex items-center gap-2">
            {loading ? "Sending..." : "Send Email"}
          </button>
        </div>
      </div>
    </div>
  );
}

const nav = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard, roles: ["Administrator", "HR Manager", "Recruiter", "Hiring Manager"], module: "dashboard" },
  {
    to: "/jobs",
    label: "Job Openings",
    icon: Briefcase,
    roles: ["Administrator", "HR Manager", "Recruiter"],
    module: "job_openings",
    children: [
      { to: "/jobs/all", label: "All Jobs", roles: ["Administrator", "HR Manager", "Recruiter"], module: "job_openings" },
      { to: "/jobs/create", label: "Create Job", roles: ["Administrator", "HR Manager", "Recruiter"], module: "job_openings" },
    ],
  },

  {
    to: "/candidates",
    label: "Candidates",
    icon: Users,
    roles: ["Administrator", "HR Manager", "Recruiter", "Hiring Manager"],
    module: "candidates",
    children: [
      { to: "/candidates", label: "All Candidates", roles: ["Administrator", "HR Manager", "Recruiter", "Hiring Manager"], module: "candidates" },
      { to: "/candidates/add", label: "Add Candidate", roles: ["Administrator", "HR Manager", "Recruiter"], module: "candidates" },
      { to: "/candidates/duplicate-check", label: "Duplicate Check", roles: ["Administrator", "HR Manager", "Recruiter"], module: "candidates" },
      { to: "/candidates/timeline", label: "Candidate Timeline", roles: ["Administrator", "HR Manager", "Recruiter"], module: "candidates" },
    ],
  },
  /* {
    to: "/interviews",
    label: "Interviews",
    icon: CalendarDays,
    roles: ["Administrator", "HR Manager", "Recruiter", "Hiring Manager"],
    module: "Interviews",
    children: [
      { to: "/interviews/upcoming", label: "Upcoming Interviews", roles: ["Administrator", "HR Manager", "Recruiter", "Hiring Manager"], module: "Interviews" },
      { to: "/interviews/feedback-pending", label: "Feedback Pending", roles: ["Administrator", "HR Manager", "Recruiter", "Hiring Manager"], module: "Interviews" },
      { to: "/interviews/history", label: "Interview History", roles: ["Administrator", "HR Manager", "Recruiter", "Hiring Manager"], module: "Interviews" },
    ],
  }, */
  {
    to: "/pipeline",
    label: "Recruitment Pipeline",
    icon: KanbanSquare,
    roles: ["Administrator", "HR Manager", "Recruiter"],
    module: "pipeline",
  },
  {
    to: "/offers",
    label: "Offers & Joining",
    icon: FileText,
    roles: ["Administrator", "HR Manager"],
    module: "offers",
    children: [
      { to: "/offers/management", label: "Offer Management", roles: ["Administrator", "HR Manager"], module: "offers", activeAliases: ["/offers/released", "/offers/accepted", "/offers/declined", "/offers/no-show", "/offers/joined"] },
      { to: "/offers/joining-tracker", label: "Joining Tracker", roles: ["Administrator", "HR Manager"], module: "offers" },
    ],
  },
  {
    to: "/rejections",
    label: "Risk Management",
    icon: Ban,
    roles: ["Administrator", "HR Manager"],
    module: "risk_management",
    children: [
      { to: "/rejections/rejected", label: "Rejected Candidates", roles: ["Administrator", "HR Manager"], module: "risk_management" },
      { to: "/rejections/blacklisted", label: "Blacklisted Candidates", roles: ["Administrator", "HR Manager"], module: "risk_management" },
    ],
  },
  {
    to: "/reports",
    label: "Reports",
    icon: BarChart3,
    roles: ["Administrator", "HR Manager"],
    module: "reports",
  },
  {
    to: "/notifications",
    label: "Alerts Center",
    icon: Bell,
    roles: ["Administrator", "HR Manager", "Recruiter", "Hiring Manager"],
    module: "alerts",
    children: [
      { to: "/notifications/alerts", label: "Alerts Center", roles: ["Administrator", "HR Manager", "Recruiter", "Hiring Manager"], module: "alerts" },
    ],
  },
  {
    to: "/email-settings",
    label: "Email Settings",
    icon: Mail,
    roles: ["Administrator", "HR Manager"],
    module: "email_settings",
    children: [
      { to: "/email-settings/templates", label: "Templates", roles: ["Administrator", "HR Manager"], module: "email_settings" },
      { to: "/email-settings/send", label: "Send Email", roles: ["Administrator", "HR Manager"], module: "email_settings" },
      { to: "/email-settings/smtp", label: "SMTP Settings", roles: ["Administrator", "HR Manager"], module: "email_settings" },
      { to: "/email-settings/logs", label: "Delivery Logs", roles: ["Administrator", "HR Manager"], module: "email_settings" },
    ],
  },
  {
    to: "/system-settings",
    label: "System Settings",
    icon: Settings,
    roles: ["Administrator", "HR Manager", "Recruiter", "Hiring Manager"],
    module: "system_settings",
    children: [
      { to: "/system-settings/profile", label: "User Profile", roles: ["Administrator", "HR Manager", "Recruiter", "Hiring Manager"] },
      { to: "/system-settings/roles", label: "User Roles & Permissions", roles: ["Administrator"], module: "users_roles" },
      { to: "/system-settings/departments", label: "Departments", roles: ["Administrator", "HR Manager"] },
      { to: "/recruiters", label: "Recruiters", roles: ["Administrator", "HR Manager"] },
      { to: "/system-settings/error-logs", label: "Error Logs", roles: ["Administrator"], module: "users_roles" },
    ],
  },
];

const NavItem = ({
  item,
  isActive,
  pathname,
  hasAccess,
}: {
  item: any;
  isActive: (to: string) => boolean;
  pathname: string;
  hasAccess: (item: any) => boolean;
}) => {
  const visibleChildren = item.children?.filter(hasAccess);

  const isChildrenActive = visibleChildren?.some(
    (child: any) => pathname === child.to || pathname.startsWith(child.to + "?") || (child.activeAliases && child.activeAliases.some((alias: string) => pathname.startsWith(alias))),
  );
  const isDirectActive = isActive(item.to);
  const [isOpen, setIsOpen] = useState(isChildrenActive || isDirectActive);

  if (!hasAccess(item)) return null;

  const active = isDirectActive || isChildrenActive;

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  if (!visibleChildren || visibleChildren.length === 0) {
    return (
      <Link
        to={item.to}
        className={cn(
          "flex items-center gap-3.5 rounded-xl px-4 py-3 text-[13px] font-bold transition-all duration-300 group relative overflow-hidden",
          active
            ? "bg-gradient-to-r from-[#42bc24] to-[#36961c] text-white shadow-md shadow-[#42bc24]/20 ring-1 ring-white/20"
            : "text-slate-400 hover:bg-slate-800/50 hover:text-slate-50",
        )}
      >
        {active && (
          <div className="absolute inset-0 bg-gradient-to-r from-white/15 to-transparent pointer-events-none" />
        )}
        <item.icon
          className={cn(
            "h-[18px] w-[18px] shrink-0 transition-colors duration-300 relative z-10",
            active ? "text-white" : "text-slate-400 group-hover:text-[#60C042]",
          )}
        />
        <span className="relative z-10 tracking-wide">{item.label}</span>
      </Link>
    );
  }

  return (
    <div className="flex flex-col gap-1 mb-1">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex items-center justify-between w-full rounded-xl px-4 py-3 text-[13px] font-bold transition-all duration-300 group",
          active && !isOpen
            ? "bg-slate-800/50 text-white ring-1 ring-white/5"
            : "text-slate-400 hover:bg-slate-800/50 hover:text-slate-50",
        )}
      >
        <div className="flex items-center gap-3.5">
          <item.icon
            className={cn(
              "h-[18px] w-[18px] shrink-0 transition-colors duration-300",
              active && !isOpen ? "text-[#60C042]" : "text-slate-400 group-hover:text-[#60C042]",
            )}
          />
          <span className="tracking-wide">{item.label}</span>
        </div>
        {isOpen ? (
          <ChevronDown className="h-4 w-4 opacity-50" />
        ) : (
          <ChevronRight className="h-4 w-4 opacity-50" />
        )}
      </button>

      {isOpen && (
        <div className="flex flex-col gap-1 pl-12 pr-2 pb-2 mt-1 relative">
          <div className="absolute left-[26px] top-0 bottom-4 w-[2px] bg-slate-800" />
          {visibleChildren.map((child: any) => {
            const childActive = pathname === child.to || pathname.startsWith(child.to + "?") || (child.activeAliases && child.activeAliases.some((alias: string) => pathname.startsWith(alias)));
            return (
              <Link
                key={child.to}
                to={child.to}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-[12px] font-bold transition-all duration-300 relative group",
                  childActive
                    ? "text-[#60C042] bg-[#42bc24]/10 ring-1 ring-[#42bc24]/25 font-black"
                    : "text-slate-400 hover:text-slate-100 hover:bg-slate-800/50",
                )}
              >
                {childActive ? (
                  <div className="absolute -left-[17px] top-1/2 -translate-y-1/2 w-4 h-[2px] bg-[#60C042]" />
                ) : (
                  <div className="absolute -left-[17px] top-1/2 -translate-y-1/2 w-2 h-[2px] bg-slate-700 transition-all duration-300 group-hover:w-4 group-hover:bg-[#60C042]" />
                )}
                <span className="tracking-wide">{child.label}</span>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
};

export function AppLayout({ children }: { children: ReactNode }) {
  const { pathname } = useLocation();
  const [unreadCount, setUnreadCount] = useState(0);
  const [currentUser, setCurrentUser] = useState(() => {
    const userStr = localStorage.getItem("cims_user");
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        return {
          name: user.full_name || user.email || "User",
          designation: user.designation || user.role_name || "User Role",
          role_name: user.role_name || "User Role",
          initial: user.full_name ? user.full_name.charAt(0) : "U",
          permissions: user.permissions
        };
      } catch (e) { }
    }
    return {
      name: "Loading...",
      designation: "Please wait",
      role_name: "Loading...",
      initial: "L",
      permissions: []
    };
  });

  const hasAccess = (navItem: any) => {
    if (currentUser?.role_name === 'Administrator') return true;
    if (navItem.module) {
      if (currentUser?.permissions && Array.isArray(currentUser.permissions)) {
        const p = currentUser.permissions.find((p: any) => p.module_name === navItem.module);
        return p ? (p.can_view === 1 || p.can_view === "1" || p.can_view === true) : false;
      }
    }
    // Fallback to static roles if no permissions array
    return navItem.roles.includes(currentUser?.role_name || "HR Manager");
  };

  useEffect(() => {
    const handleAlertsRead = () => setUnreadCount(0);
    window.addEventListener('ALERTS_READ', handleAlertsRead);
    return () => window.removeEventListener('ALERTS_READ', handleAlertsRead);
  }, []);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/notifications/notifications.php`);
        const data = await res.json();
        const lastRead = localStorage.getItem('cims_last_alerts_read');
        const lastReadTime = lastRead ? new Date(lastRead).getTime() : 0;

        const count = data.filter((a: any) => new Date(a.timeRaw).getTime() > lastReadTime).length;
        setUnreadCount(count);
      } catch (err) {
        console.error("Failed to load notifications", err);
      }
    };
    fetchNotifications();

    // Use synchronously available local storage data populated by PrivateRoute
    const userStr = localStorage.getItem("cims_user");
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        setCurrentUser({
          name: user.full_name || user.email || "User",
          designation: user.designation || user.role_name || "User Role",
          role_name: user.role_name || "User Role",
          initial: user.full_name ? user.full_name.charAt(0) : "U",
          permissions: user.permissions
        });
      } catch (e) {
        console.error("Failed to parse user data", e);
      }
    }
  }, [pathname]);
  // poor man's cron job for email worker - trigger email worker every 5 minutes while dashboard is open
  useEffect(() => {
    // Poor Man's Cron: Trigger email worker every 5 minutes while dashboard is open
    // This is useful for local XAMPP environments or shared hosting without Cron access.
    const triggerWorker = () => {
      fetch(`${API_BASE_URL}/settings/email/worker.php`).catch(() => { });
    };

    // Run once shortly after login/load
    const initialTimer = setTimeout(triggerWorker, 5000);

    // Run continuously every 5 minutes
    const intervalTimer = setInterval(triggerWorker, 5 * 60 * 1000);

    return () => {
      clearTimeout(initialTimer);
      clearInterval(intervalTimer);
    };
  }, []);

  const isActive = (to: string) => (to === "/" ? pathname === "/" : pathname === to);

  return (
    <div className="flex min-h-screen w-full bg-slate-50 text-slate-900 antialiased selection:bg-blue-500/10 selection:text-blue-700">
      <aside className="hidden md:flex w-[280px] shrink-0 flex-col bg-[#011627] border-r border-slate-800/50 shadow-[4px_0_24px_-10px_rgba(0,0,0,0.5)] relative z-30">
        <div className="flex items-center gap-4 px-6 py-8 w-full">
          <img src="/logos.png" alt="Logo" className="h-14 w-auto object-contain shrink-0" />
          <div className="text-left">
            <div className="text-[22px] font-black leading-none tracking-tight text-white">
              Hireflow
            </div>
            <div className="mt-1.5 text-[10px] font-black uppercase tracking-[0.2em] text-[#60C042]">
              Buddy ATS
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto py-6 px-4 space-y-1 scrollbar-hide">
          {nav.filter(hasAccess).map((item) => (
            <NavItem
              key={item.label}
              item={item as any}
              isActive={isActive}
              pathname={pathname}
              hasAccess={hasAccess}
            />
          ))}
        </div>

        <div className="shrink-0 p-5 border-t border-slate-800/50">
          <div className="flex items-center gap-3 rounded-2xl bg-slate-800/30 hover:bg-slate-800/60 p-3 transition-colors cursor-pointer border border-slate-800/50 shadow-sm">
            <div className="h-10 w-10 rounded-full bg-slate-700 flex items-center justify-center text-white font-bold ring-2 ring-slate-800 shadow-sm">
              {currentUser.initial}
            </div>
            <div className="flex flex-col items-start flex-1 min-w-0">
              <span className="text-[13px] font-bold text-white leading-none truncate w-full">
                {currentUser.name}
              </span>
              <span className="text-[11px] font-bold text-slate-400 mt-1.5 leading-none truncate w-full">
                {currentUser.designation}
              </span>
            </div>
            <Settings className="h-4 w-4 text-slate-400" />
          </div>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col bg-slate-50/50">
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-slate-200/60 bg-white/80 px-4 backdrop-blur-md md:px-8 shadow-[0_4px_24px_-10px_rgba(0,0,0,0.02)]">
          <div className="flex items-center gap-2 md:hidden">
            <img src="/logos.png" alt="Logo" className="h-8 w-auto object-contain shrink-0" />
            <span className="text-base font-black tracking-tight text-slate-900">Hireflow</span>
          </div>

          <div className="flex max-w-full gap-1 overflow-x-auto rounded-xl border border-slate-200/60 bg-slate-50 p-1 scrollbar-thin md:hidden">
            {nav.filter(hasAccess).map((n) => {
              const active =
                isActive(n.to) || (n.children && n.children.some((c: any) => pathname === c.to || (c.activeAliases && c.activeAliases.some((alias: string) => pathname.startsWith(alias)))));
              return (
                <Link
                  key={n.label}
                  to={n.to}
                  title={n.label}
                  className={cn(
                    "flex shrink-0 items-center gap-1.5 rounded-lg px-2.5 py-2 text-xs font-bold transition-all",
                    active ? "bg-white text-[#42bc24] shadow-sm ring-1 ring-slate-200" : "text-slate-500 hover:text-slate-900",
                  )}
                >
                  <n.icon className="h-4 w-4 shrink-0" />
                  <span className="whitespace-nowrap">{n.label}</span>
                </Link>
              );
            })}
          </div>

          <div className="ml-auto flex items-center gap-4">
            <Link to="/notifications/alerts" className="relative flex items-center justify-center h-10 w-10 rounded-full bg-white border border-slate-200 hover:bg-slate-50 transition-colors shadow-sm">
              <span className="text-[17px] hover:animate-bounce origin-bottom">🔔</span>
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 min-w-[16px] px-1 items-center justify-center rounded-full bg-[#FF3B30] text-[10px] font-black text-white ring-2 ring-white shadow-sm">
                  {unreadCount}
                </span>
              )}
            </Link>
            <div className="h-8 w-px bg-slate-200" />
            <button className="flex items-center gap-3 hover:bg-white bg-slate-50 p-1.5 rounded-full pr-5 transition-colors border border-slate-200 shadow-sm">
              <div className="h-8 w-8 rounded-full bg-gradient-to-br from-[#42bc24] to-[#36961c] flex items-center justify-center text-white font-bold shadow-sm ring-1 ring-emerald-400/30">
                {currentUser.initial}
              </div>
              <div className="hidden sm:flex flex-col items-start">
                <span className="text-[13px] font-bold text-slate-900 leading-none">{currentUser.name}</span>
                <span className="text-[10px] font-bold text-[#42bc24] mt-1.5 leading-none uppercase tracking-wider">
                  {currentUser.designation}
                </span>
              </div>
              <ChevronDown className="h-3.5 w-3.5 text-slate-400 ml-1 hidden sm:block" />
            </button>
            <div className="h-8 w-px bg-slate-200 hidden sm:block" />
            <button
              onClick={async () => {
                try {
                  await fetch(`${API_BASE_URL}/auth/logout.php`, { credentials: 'include' });
                } catch (e) {
                  console.error(e);
                }
                localStorage.removeItem('cims_user');
                localStorage.removeItem('cims_login_time');
                window.location.href = '/login';
              }}
              title="Log out"
              className="flex items-center justify-center h-10 w-10 rounded-full bg-slate-50 border border-slate-200 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 transition-colors shadow-sm text-slate-500"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </header>
        <main className="flex-1 px-4 py-6 md:px-10 md:py-8 overflow-x-hidden">{children}</main>
      </div>
      <ManualEmailDraftModal />
      <Toaster position="bottom-right" richColors closeButton />
    </div>
  );
}
