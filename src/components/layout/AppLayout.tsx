import { Link, useLocation } from "react-router-dom";
import { useState, type ReactNode } from "react";
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
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import { Toaster } from "@/components/ui/sonner";
import { cn } from "@/lib/utils";

const nav = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
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
    children: [
      { to: "/pipeline?status=new", label: "New" },
      { to: "/pipeline?status=contacted", label: "Contacted" },
      { to: "/pipeline?status=interview", label: "Interview" },
      { to: "/pipeline?status=selected", label: "Selected" },
      { to: "/pipeline?status=offer", label: "Offer" },
      { to: "/pipeline?status=joined", label: "Joined" },
      { to: "/pipeline?status=rejected", label: "Rejected" },
    ],
  },
  {
    to: "/offers",
    label: "Offers",
    icon: FileText,
    children: [
      { to: "/offers/released", label: "Offer Released" },
      { to: "/offers/accepted", label: "Accepted" },
      { to: "/offers/declined", label: "Declined" },
      { to: "/offers/no-join", label: "No Join" },
    ],
  },
  {
    to: "/rejections",
    label: "Rejection / Blacklist",
    icon: Ban,
    children: [
      { to: "/rejections/rejected", label: "Rejected Candidates" },
      { to: "/rejections/blacklisted", label: "Blacklisted Candidates" },
      { to: "/rejections/reasons", label: "Reasons" },
    ],
  },
  {
    to: "/reports",
    label: "Reports",
    icon: BarChart3,
    children: [
      { to: "/reports/candidate", label: "Candidate Report" },
      { to: "/reports/hiring", label: "Hiring Report" },
      { to: "/reports/rejection", label: "Rejection Report" },
    ],
  },
  { to: "/notifications", label: "Notifications", icon: Bell },
  {
    to: "/settings",
    label: "Settings",
    icon: Settings,
    children: [
      { to: "/settings/users", label: "Users" },
      { to: "/settings/roles", label: "Roles" },
      { to: "/settings/masters", label: "Masters" },
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
            ? "bg-white/10 text-white shadow-lg ring-1 ring-white/10"
            : "text-slate-400 hover:bg-white/5 hover:text-white",
        )}
      >
        {active && (
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/20 to-purple-500/0" />
        )}
        <item.icon
          className={cn(
            "h-[18px] w-[18px] shrink-0 transition-colors duration-300 relative z-10",
            active ? "text-indigo-400" : "text-slate-500 group-hover:text-indigo-400",
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
            ? "bg-white/5 text-white ring-1 ring-white/10"
            : "text-slate-400 hover:bg-white/5 hover:text-white",
        )}
      >
        <div className="flex items-center gap-3.5">
          <item.icon
            className={cn(
              "h-[18px] w-[18px] shrink-0 transition-colors duration-300",
              active && !isOpen ? "text-indigo-400" : "text-slate-500 group-hover:text-indigo-400",
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
          <div className="absolute left-[26px] top-0 bottom-4 w-px bg-slate-800" />
          {item.children.map((child: { to: string; label: string }) => {
            const childActive = pathname === child.to || pathname.startsWith(child.to + "?");
            return (
              <Link
                key={child.to}
                to={child.to}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-[12px] font-bold transition-all duration-300 relative group",
                  childActive
                    ? "text-white bg-indigo-500/10 ring-1 ring-indigo-500/30"
                    : "text-slate-400 hover:text-white hover:bg-white/5",
                )}
              >
                {childActive ? (
                  <div className="absolute -left-[17px] top-1/2 -translate-y-1/2 w-4 h-px bg-indigo-500" />
                ) : (
                  <div className="absolute -left-[17px] top-1/2 -translate-y-1/2 w-2 h-px bg-slate-700 transition-all duration-300 group-hover:w-4 group-hover:bg-slate-500" />
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

  const isActive = (to: string) => (to === "/" ? pathname === "/" : pathname === to);

  return (
    <div className="flex min-h-screen w-full bg-white text-foreground antialiased selection:bg-primary/10 selection:text-primary">
      <aside className="hidden md:flex w-[280px] shrink-0 flex-col bg-[#0b0f19] text-white border-r border-slate-800/60 shadow-[4px_0_24px_-10px_rgba(0,0,0,0.5)]">
        <div className="flex items-center gap-4 px-6 py-8">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 text-white shadow-[0_0_20px_rgba(99,102,241,0.4)] ring-1 ring-white/20">
            <Briefcase className="h-6 w-6" />
          </div>
          <div>
            <div className="text-[20px] font-black leading-none tracking-tight text-white">
              Hireflow
            </div>
            <div className="mt-1.5 text-[10px] font-black uppercase tracking-[0.25em] text-indigo-400">
              Buddy ATS
            </div>
          </div>
        </div>

        <nav className="flex flex-1 flex-col gap-1 overflow-y-auto px-5 pb-4 pt-2 scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent">
          {nav.map((n) => (
            <NavItem key={n.label} item={n} isActive={isActive} pathname={pathname} />
          ))}
        </nav>

        <div className="shrink-0 p-5">
          <div className="flex items-center gap-3 rounded-2xl bg-white/5 hover:bg-white/10 p-3 transition-colors cursor-pointer border border-white/5">
            <img
              src="https://api.dicebear.com/7.x/notionists/svg?seed=John"
              alt="User profile"
              className="h-10 w-10 rounded-full bg-slate-800 object-cover ring-2 ring-slate-700"
            />
            <div className="flex flex-col items-start flex-1 min-w-0">
              <span className="text-[13px] font-bold text-white leading-none truncate w-full">
                John Doe
              </span>
              <span className="text-[11px] font-medium text-slate-400 mt-1.5 leading-none truncate w-full">
                HR Manager
              </span>
            </div>
            <Settings className="h-4 w-4 text-slate-400" />
          </div>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col bg-white">
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-border/60 bg-white/95 px-4 backdrop-blur-sm md:px-8">
          <div className="flex items-center gap-2 md:hidden">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <Briefcase className="h-4 w-4" />
            </div>
            <span className="text-base font-bold tracking-tight">Hireflow</span>
          </div>

          <div className="flex max-w-full gap-1 overflow-x-auto rounded-xl border border-border/30 bg-slate-50 p-1 scrollbar-thin md:hidden">
            {nav.map((n) => {
              const active =
                isActive(n.to) || (n.children && n.children.some((c) => pathname === c.to));
              return (
                <Link
                  key={n.label}
                  to={n.to}
                  title={n.label}
                  className={cn(
                    "flex shrink-0 items-center gap-1.5 rounded-lg px-2.5 py-2 text-xs font-medium transition-all",
                    active ? "bg-white text-primary shadow-sm" : "text-muted-foreground",
                  )}
                >
                  <n.icon className="h-4 w-4 shrink-0" />
                  <span className="whitespace-nowrap">{n.label}</span>
                </Link>
              );
            })}
          </div>

          <div className="ml-auto flex items-center gap-4">
            <button className="relative flex items-center justify-center h-9 w-9 rounded-full bg-slate-100 hover:bg-slate-200 transition-colors">
              <Bell className="h-4 w-4 text-slate-600" />
              <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white" />
            </button>
            <div className="h-8 w-px bg-slate-200" />
            <button className="flex items-center gap-3 hover:bg-slate-50 p-1 rounded-full pr-4 transition-colors border border-transparent hover:border-slate-200">
              <img
                src="https://api.dicebear.com/7.x/notionists/svg?seed=John"
                alt="User profile"
                className="h-8 w-8 rounded-full bg-slate-100 border border-slate-200 object-cover"
              />
              <div className="hidden sm:flex flex-col items-start">
                <span className="text-[13px] font-bold text-slate-900 leading-none">John Doe</span>
                <span className="text-[11px] font-medium text-slate-500 mt-1.5 leading-none">
                  HR Manager
                </span>
              </div>
              <ChevronDown className="h-3.5 w-3.5 text-slate-400 ml-1 hidden sm:block" />
            </button>
          </div>
        </header>
        <main className="flex-1 bg-slate-50/80 px-6 py-6 md:px-10 md:py-8">{children}</main>
      </div>
      <Toaster position="bottom-right" richColors closeButton />
    </div>
  );
}
