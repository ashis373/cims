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
} from "lucide-react";
import { Toaster } from "@/components/ui/sonner";
import { cn } from "@/lib/utils";
import { API_BASE_URL } from "@/config/api";

const nav = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  {
    to: "/jobs",
    label: "Job Openings",
    icon: Briefcase,
    children: [
      { to: "/jobs/all", label: "All Jobs" },
      { to: "/jobs/create", label: "Create Job" },
    ],
  },
  {
    to: "/candidates",
    label: "Candidates",
    icon: Users,
    children: [
      { to: "/candidates", label: "All Candidates" },
      { to: "/candidates/add", label: "Add Candidate" },
      { to: "/candidates/duplicate-check", label: "Duplicate Check" },
      { to: "/candidates/timeline", label: "Candidate Timeline" },
    ],
  },
  {
    to: "/interviews",
    label: "Interviews",
    icon: CalendarDays,
    children: [
      { to: "/interviews/upcoming", label: "Upcoming Interviews" },
      { to: "/interviews/feedback-pending", label: "Feedback Pending" },
      { to: "/interviews/history", label: "Interview History" },
    ],
  },
  {
    to: "/pipeline",
    label: "Recruitment Pipeline",
    icon: KanbanSquare,
  },
  {
    to: "/offers",
    label: "Offers",
    icon: FileText,
    children: [
      { to: "/offers/management", label: "Offer Management" },
      { to: "/offers/joining-tracker", label: "Joining Tracker" },
      { to: "/offers/no-joiners", label: "No-Joiners" },
    ],
  },
  {
    to: "/rejections",
    label: "Risk Management",
    icon: Ban,
    children: [
      { to: "/rejections/rejected", label: "Rejected Candidates" },
      { to: "/rejections/blacklisted", label: "Blacklisted Candidates" },
    ],
  },
  {
    to: "/reports",
    label: "Reports",
    icon: BarChart3,
    children: [
      { to: "/reports/candidate", label: "Candidate Report" },
      { to: "/reports/recruiter-performance", label: "Recruiter Performance" },
      { to: "/reports/hiring", label: "Hiring Report" },
      { to: "/reports/rejection-analysis", label: "Rejection Analysis" },
      { to: "/reports/blacklist", label: "Blacklist Report" },
      { to: "/reports/no-joiners", label: "No-Joiner Report" },
    ],
  },
  {
    to: "/notifications",
    label: "Alerts Center",
    icon: Bell,
    children: [
      { to: "/notifications/alerts", label: "Alerts Center" },
    ],
  },
  {
    to: "/email-settings",
    label: "Email Settings",
    icon: Mail,
    children: [
      { to: "/email-settings/templates", label: "Email Templates" },
      { to: "/email-settings/triggers", label: "Auto Email Triggers" },
      { to: "/email-settings/logs", label: "Email Logs" },
    ],
  },
  {
    to: "/system-settings",
    label: "System Settings",
    icon: Settings,
    children: [
      { to: "/system-settings/profile", label: "User Profile" },
      { to: "/system-settings/roles", label: "User Roles & Permissions" },
      { to: "/system-settings/general", label: "System Settings" },
    ],
  },
];

const NavItem = ({
  item,
  isActive,
  pathname,
}: {
  item: {
    to: string;
    label: string;
    icon: React.ElementType;
    children?: { to: string; label: string }[];
  };
  isActive: (to: string) => boolean;
  pathname: string;
}) => {
  const isChildrenActive = item.children?.some(
    (child: { to: string; label: string }) =>
      pathname === child.to || pathname.startsWith(child.to + "?"),
  );
  const isDirectActive = isActive(item.to);
  const [isOpen, setIsOpen] = useState(isChildrenActive || isDirectActive);

  const active = isDirectActive || isChildrenActive;

  if (!item.children) {
    return (
      <Link
        to={item.to}
        className={cn(
          "flex items-center gap-3.5 rounded-xl px-4 py-3 text-[13px] font-bold transition-all duration-300 group relative overflow-hidden",
          active
            ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-900/20 ring-1 ring-white/10"
            : "text-slate-400 hover:bg-slate-800/50 hover:text-slate-50",
        )}
      >
        {active && (
          <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent pointer-events-none" />
        )}
        <item.icon
          className={cn(
            "h-[18px] w-[18px] shrink-0 transition-colors duration-300 relative z-10",
            active ? "text-white" : "text-slate-400 group-hover:text-blue-400",
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
              active && !isOpen ? "text-blue-400" : "text-slate-400 group-hover:text-blue-400",
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
          {item.children.map((child: { to: string; label: string }) => {
            const childActive = pathname === child.to || pathname.startsWith(child.to + "?");
            return (
              <Link
                key={child.to}
                to={child.to}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-[12px] font-bold transition-all duration-300 relative group",
                  childActive
                    ? "text-white bg-blue-500/10 ring-1 ring-blue-500/20"
                    : "text-slate-400 hover:text-slate-100 hover:bg-slate-800/50",
                )}
              >
                {childActive ? (
                  <div className="absolute -left-[17px] top-1/2 -translate-y-1/2 w-4 h-[2px] bg-blue-500" />
                ) : (
                  <div className="absolute -left-[17px] top-1/2 -translate-y-1/2 w-2 h-[2px] bg-slate-700 transition-all duration-300 group-hover:w-4 group-hover:bg-blue-400" />
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

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/notifications.php`);
        const data = await res.json();
        const count = data.filter((a: any) => a.unread).length;
        setUnreadCount(count);
      } catch (err) {
        console.error("Failed to load notifications", err);
      }
    };
    fetchNotifications();
  }, [pathname]);

  const isActive = (to: string) => (to === "/" ? pathname === "/" : pathname === to);

  return (
    <div className="flex min-h-screen w-full bg-slate-50 text-slate-900 antialiased selection:bg-blue-500/10 selection:text-blue-700">
      <aside className="hidden md:flex w-[280px] shrink-0 flex-col bg-[#0A0F1C] border-r border-slate-800/50 shadow-[4px_0_24px_-10px_rgba(0,0,0,0.5)] relative z-30">
        <div className="flex items-center gap-4 px-6 py-8 w-full">
          <img src="/logos.png" alt="Logo" className="h-14 w-auto object-contain shrink-0" />
          <div className="text-left">
            <div className="text-[22px] font-black leading-none tracking-tight text-white">
              Hireflow
            </div>
            <div className="mt-1.5 text-[10px] font-black uppercase tracking-[0.2em] text-blue-400">
              Buddy ATS
            </div>
          </div>
        </div>

        <nav className="flex flex-1 flex-col gap-1 overflow-y-auto px-5 pb-4 pt-2 scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent">
          {nav.map((n) => (
            <NavItem key={n.label} item={n} isActive={isActive} pathname={pathname} />
          ))}
        </nav>

        <div className="shrink-0 p-5 border-t border-slate-800/50">
          <div className="flex items-center gap-3 rounded-2xl bg-slate-800/30 hover:bg-slate-800/60 p-3 transition-colors cursor-pointer border border-slate-800/50 shadow-sm">
            <img
              src="https://api.dicebear.com/7.x/notionists/svg?seed=John"
              alt="User profile"
              className="h-10 w-10 rounded-full bg-slate-800 object-cover ring-2 ring-slate-800 shadow-sm"
            />
            <div className="flex flex-col items-start flex-1 min-w-0">
              <span className="text-[13px] font-bold text-white leading-none truncate w-full">
                John Doe
              </span>
              <span className="text-[11px] font-bold text-slate-400 mt-1.5 leading-none truncate w-full">
                HR Manager
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
            {nav.map((n) => {
              const active =
                isActive(n.to) || (n.children && n.children.some((c) => pathname === c.to));
              return (
                <Link
                  key={n.label}
                  to={n.to}
                  title={n.label}
                  className={cn(
                    "flex shrink-0 items-center gap-1.5 rounded-lg px-2.5 py-2 text-xs font-bold transition-all",
                    active ? "bg-white text-blue-600 shadow-sm ring-1 ring-slate-200" : "text-slate-500 hover:text-slate-900",
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
              <Bell className="h-4 w-4 text-slate-600" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 flex h-4 min-w-[16px] px-1 items-center justify-center rounded-full bg-rose-500 text-[9px] font-bold text-white ring-2 ring-white">
                  {unreadCount}
                </span>
              )}
            </Link>
            <div className="h-8 w-px bg-slate-200" />
            <button className="flex items-center gap-3 hover:bg-white bg-slate-50 p-1.5 rounded-full pr-5 transition-colors border border-slate-200 shadow-sm">
              <img
                src="https://api.dicebear.com/7.x/notionists/svg?seed=John"
                alt="User profile"
                className="h-8 w-8 rounded-full bg-white shadow-sm object-cover"
              />
              <div className="hidden sm:flex flex-col items-start">
                <span className="text-[13px] font-bold text-slate-900 leading-none">John Doe</span>
                <span className="text-[10px] font-bold text-slate-500 mt-1.5 leading-none uppercase tracking-wider">
                  HR Manager
                </span>
              </div>
              <ChevronDown className="h-3.5 w-3.5 text-slate-400 ml-1 hidden sm:block" />
            </button>
          </div>
        </header>
        <main className="flex-1 px-4 py-6 md:px-10 md:py-8 overflow-x-hidden">{children}</main>
      </div>
      <Toaster position="bottom-right" richColors closeButton />
    </div>
  );
}
