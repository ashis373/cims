import { Link } from "react-router-dom";
import { useState, useEffect, useMemo } from "react";
import { useAts } from "@/services/ats-store";
import { STAGE_COLORS } from "@/types/ats-types";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Users,
  CalendarCheck,
  Star,
  Mail,
  CheckCircle,
  XCircle,
  Plus,
  Upload,
  Briefcase,
  Download,
  AlertTriangle,
  FileText,
  Search,
  MoreHorizontal,
  ArrowUp,
  Video,
  Phone,
  MapPin,
  CalendarDays,
  ChevronRight,
  ClipboardList,
  UserPlus,
  UserX,
  Eye,
  ExternalLink,
  ChevronLeft
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { API_BASE_URL } from "@/config/api";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, AreaChart, Area, XAxis, YAxis, CartesianGrid } from 'recharts';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05 } },
};

const item: import("framer-motion").Variants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] } },
};

function StatCard({
  label,
  value,
  icon: Icon,
  trend,
  theme,
}: {
  label: string;
  value: number | string;
  icon: React.ElementType;
  trend: string;
  theme: 'blue' | 'emerald' | 'purple' | 'amber' | 'cyan' | 'rose' | 'teal' | 'zinc' | 'orange';
}) {
  const styles = {
    blue: { 
      cardBg: "bg-blue-50/40",
      badge: "bg-blue-50 text-blue-700 border-blue-100", 
      border: "border-blue-200/70 hover:border-blue-400",
      iconBg: "bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-blue-500/20", 
      glow: "from-white to-transparent",
      trendText: "text-blue-700 bg-white/80"
    },
    emerald: { 
      cardBg: "bg-emerald-50/40",
      badge: "bg-emerald-50 text-emerald-700 border-emerald-100", 
      border: "border-emerald-200/70 hover:border-emerald-400",
      iconBg: "bg-gradient-to-br from-[#42bc24] to-[#36961c] text-white shadow-emerald-500/20", 
      glow: "from-white to-transparent",
      trendText: "text-emerald-700 bg-white/80"
    },
    purple: { 
      cardBg: "bg-purple-50/40",
      badge: "bg-purple-50 text-purple-700 border-purple-100", 
      border: "border-purple-200/70 hover:border-purple-400",
      iconBg: "bg-gradient-to-br from-purple-500 to-indigo-600 text-white shadow-purple-500/20", 
      glow: "from-white to-transparent",
      trendText: "text-purple-700 bg-white/80"
    },
    amber: { 
      cardBg: "bg-amber-50/40",
      badge: "bg-amber-50 text-amber-700 border-amber-100", 
      border: "border-amber-200/70 hover:border-amber-400",
      iconBg: "bg-gradient-to-br from-amber-500 to-orange-500 text-white shadow-amber-500/20", 
      glow: "from-white to-transparent",
      trendText: "text-amber-700 bg-white/80"
    },
    cyan: { 
      cardBg: "bg-cyan-50/40",
      badge: "bg-cyan-50 text-cyan-700 border-cyan-100", 
      border: "border-cyan-200/70 hover:border-cyan-400",
      iconBg: "bg-gradient-to-br from-cyan-500 to-teal-600 text-white shadow-cyan-500/20", 
      glow: "from-white to-transparent",
      trendText: "text-cyan-700 bg-white/80"
    },
    rose: { 
      cardBg: "bg-rose-50/40",
      badge: "bg-rose-50 text-rose-700 border-rose-100", 
      border: "border-rose-200/70 hover:border-rose-400",
      iconBg: "bg-gradient-to-br from-rose-500 to-red-600 text-white shadow-rose-500/20", 
      glow: "from-white to-transparent",
      trendText: "text-rose-700 bg-white/80"
    },
    teal: { 
      cardBg: "bg-teal-50/40",
      badge: "bg-teal-50 text-teal-700 border-teal-100", 
      border: "border-teal-200/70 hover:border-teal-400",
      iconBg: "bg-gradient-to-br from-teal-500 to-emerald-600 text-white shadow-teal-500/20", 
      glow: "from-white to-transparent",
      trendText: "text-teal-700 bg-white/80"
    },
    zinc: { 
      cardBg: "bg-slate-50/60",
      badge: "bg-slate-100 text-slate-700 border-slate-200", 
      border: "border-slate-300/70 hover:border-slate-400",
      iconBg: "bg-gradient-to-br from-slate-600 to-slate-800 text-white shadow-slate-500/20", 
      glow: "from-white to-transparent",
      trendText: "text-slate-700 bg-white/80"
    },
    orange: { 
      cardBg: "bg-orange-50/40",
      badge: "bg-orange-50 text-orange-700 border-orange-100", 
      border: "border-orange-200/70 hover:border-orange-400",
      iconBg: "bg-gradient-to-br from-orange-500 to-amber-600 text-white shadow-orange-500/20", 
      glow: "from-white to-transparent",
      trendText: "text-orange-700 bg-white/80"
    }
  }[theme];

  return (
    <motion.div variants={item} className="h-full group">
      <Card className={cn(
        "relative overflow-hidden shadow-xs border rounded-xl h-full flex flex-col p-3.5 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-sm",
        styles.cardBg,
        styles.border
      )}>
        <div className={cn("absolute top-0 right-0 -mt-3 -mr-3 w-20 h-20 bg-gradient-to-br to-transparent rounded-full blur-xl pointer-events-none opacity-60", styles.glow)} />
        
        <div className="flex items-start justify-between mb-1.5 relative z-10">
          <div className="text-[10.5px] font-bold text-slate-500 uppercase tracking-wider pr-1.5 leading-tight truncate">
            {label}
          </div>
          <div className={cn("p-1.5 rounded-lg shrink-0 shadow-xs", styles.iconBg)}>
            <Icon className="w-3.5 h-3.5" />
          </div>
        </div>
        
        <div className="mt-auto relative z-10 pt-1">
          <div className="text-2xl font-black tracking-tight text-slate-900 leading-none mb-1.5">
            {value}
          </div>
          <div className="flex items-center gap-1.5 text-[9.5px] font-bold text-slate-400">
            <span className={cn("inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded font-bold", styles.trendText)}>
              <ArrowUp className="w-2.5 h-2.5" /> {trend}
            </span>
            <span className="text-slate-400 font-medium truncate">vs last month</span>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}

const SCHEDULE_ITEM_THEMES = [
  {
    badge: "bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white border-blue-100",
    border: "hover:border-blue-200",
    title: "group-hover:text-blue-600",
    iconBg: "group-hover:bg-blue-50 group-hover:text-blue-500",
  },
  {
    badge: "bg-amber-50 text-amber-600 group-hover:bg-amber-500 group-hover:text-white border-amber-100",
    border: "hover:border-amber-200",
    title: "group-hover:text-amber-600",
    iconBg: "group-hover:bg-amber-50 group-hover:text-amber-500",
  },
  {
    badge: "bg-purple-50 text-purple-600 group-hover:bg-purple-600 group-hover:text-white border-purple-100",
    border: "hover:border-purple-200",
    title: "group-hover:text-purple-600",
    iconBg: "group-hover:bg-purple-50 group-hover:text-purple-500",
  },
  {
    badge: "bg-emerald-50 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white border-emerald-100",
    border: "hover:border-emerald-200",
    title: "group-hover:text-emerald-600",
    iconBg: "group-hover:bg-emerald-50 group-hover:text-emerald-500",
  },
];

const getScheduleModeIcon = (mode: string) => {
  const m = (mode || "").toLowerCase();
  if (m.includes("offline") || m.includes("person") || m.includes("office")) {
    return <MapPin className="w-4 h-4" />;
  }
  if (m.includes("phone") || m.includes("call")) {
    return <Phone className="w-4 h-4" />;
  }
  return <Video className="w-4 h-4" />;
};

function Dashboard() {
  const { candidates } = useAts();
  const [counts, setCounts] = useState<any>({
    total: 0, active: 0, scheduled: 0, selected: 0, offersReleased: 0, offersAccepted: 0, offersDeclined: 0, offersPending: 0, joined: 0, rejected: 0, blacklisted: 0, noShow: 0, funnel: {}, quickStats: null, todaySchedule: [], scheduleIsUpcoming: false
  });
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [trendPeriod, setTrendPeriod] = useState<string>("this_year");
  const [isTrendLoading, setIsTrendLoading] = useState(false);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [calendarViewDate, setCalendarViewDate] = useState(() => {
    const t = new Date();
    return new Date(t.getFullYear(), t.getMonth(), 1);
  });
  const [calendarSelectedDay, setCalendarSelectedDay] = useState<number | null>(() => new Date().getDate());

  useEffect(() => {
    const userStr = localStorage.getItem("cims_user");
    if (userStr) {
      try {
        setCurrentUser(JSON.parse(userStr));
      } catch (e) { }
    }
  }, []);

  useEffect(() => {
    setIsTrendLoading(true);
    fetch(`${API_BASE_URL}/dashboard/stats.php?period=${trendPeriod}`)
      .then(res => res.json())
      .then(data => setCounts(data))
      .catch(console.error)
      .finally(() => setIsTrendLoading(false));
  }, [trendPeriod]);

  const recent = [...candidates]
    .sort((a, b) => +new Date(b.updatedAt) - +new Date(a.updatedAt))
    .slice(0, 5);

  const pipelineStages = [
    { label: "New", count: counts.funnel?.["New Applicant"] || 0, icon: Users, color: "text-blue-500", bg: "bg-blue-50", border: "border-blue-500" },
    { label: "Screening", count: counts.funnel?.["HR Call Scheduled"] || 0, icon: Search, color: "text-cyan-500", bg: "bg-cyan-50", border: "border-cyan-500" },
    { label: "Interview", count: counts.funnel?.["Interview Scheduled"] || 0, icon: CalendarCheck, color: "text-purple-500", bg: "bg-purple-50", border: "border-purple-500" },
    { label: "Shortlisted", count: counts.selected || 0, icon: Star, color: "text-amber-500", bg: "bg-amber-50", border: "border-amber-500" },
    { label: "Offered", count: counts.funnel?.["Offer Released"] || 0, icon: Mail, color: "text-teal-500", bg: "bg-teal-50", border: "border-teal-500" },
    { label: "Joined", count: counts.funnel?.["Joined"] || 0, icon: CheckCircle, color: "text-emerald-500", bg: "bg-emerald-50", border: "border-emerald-500" },
  ];

  const maxPipeline = Math.max(...pipelineStages.map(s => s.count), 1);
  const conversionRate = counts.total > 0 ? Math.round(((counts.funnel?.["Joined"] || 0) / counts.total) * 100) : 0;

  const sourceData = [
    { name: 'Website', value: 38, color: '#3b82f6' },
    { name: 'LinkedIn', value: 22, color: '#0ea5e9' },
    { name: 'Referral', value: 18, color: '#f59e0b' },
    { name: 'Job Portal', value: 14, color: '#8b5cf6' },
    { name: 'Others', value: 8, color: '#cbd5e1' },
  ];

  const isDataLoaded = counts.total > 0 || counts.offersReleased > 0;
  const acceptedVal = isDataLoaded ? (counts.offersAccepted || 0) : 0;
  const declinedVal = isDataLoaded ? (counts.offersDeclined || 0) : 0;
  const releasedVal = isDataLoaded ? (counts.offersReleased || 0) : 0;
  const pendingVal = isDataLoaded ? (counts.offersPending ?? 0) : 0;
  const totalOffersVal = acceptedVal + declinedVal + pendingVal;

  const offerData = [
    { name: 'Accepted', value: acceptedVal, color: '#10b981', bg: 'bg-emerald-50', text: 'text-emerald-700' },
    { name: 'Declined', value: declinedVal, color: '#ef4444', bg: 'bg-rose-50', text: 'text-rose-700' },
    { name: 'Pending', value: pendingVal, color: '#f59e0b', bg: 'bg-amber-50', text: 'text-amber-700' },
  ];

  const skillsData = [
    { name: 'React.js', pct: 68, color: 'bg-blue-500' },
    { name: 'Python', pct: 59, color: 'bg-emerald-500' },
    { name: 'Java', pct: 52, color: 'bg-amber-500' },
    { name: 'UI/UX', pct: 46, color: 'bg-purple-500' },
    { name: 'SQL', pct: 39, color: 'bg-cyan-500' },
  ];

  const trendData = (counts.trend && Array.isArray(counts.trend) && counts.trend.length > 0)
    ? counts.trend
    : [
        { month: 'Jan', applied: 0, interviews: 0, selected: 0, joined: 0 },
        { month: 'Feb', applied: 0, interviews: 0, selected: 0, joined: 0 },
        { month: 'Mar', applied: 0, interviews: 0, selected: 0, joined: 0 },
        { month: 'Apr', applied: 0, interviews: 0, selected: 0, joined: 0 },
        { month: 'May', applied: 0, interviews: 0, selected: 0, joined: 0 },
        { month: 'Jun', applied: 0, interviews: 0, selected: 0, joined: 0 },
      ];

  const calYear = calendarViewDate.getFullYear();
  const calMonth = calendarViewDate.getMonth();
  const calMonthLabel = calendarViewDate.toLocaleDateString("en-US", { month: "long", year: "numeric" });

  const calendarEvents = useMemo(() => {
    const events: any[] = [];
    candidates.forEach((c, i) => {
      if (c.interviews && c.interviews.length > 0) {
        c.interviews.forEach((iv: any) => {
          const d = new Date(iv.date);
          if (d.getFullYear() === calYear && d.getMonth() === calMonth) {
            events.push({
              id: iv.id || `${c.id}-${iv.date}`,
              date: d,
              candidateId: c.id,
              candidateName: c.name,
              role: c.role,
              type: iv.type || "Interview",
              stage: c.stage,
            });
          }
        });
        return;
      }

      if (c.stage === "Interview Scheduled" || c.stage === "Interview Completed") {
        const day = ((i * 7 + (c.name ? c.name.length : 5)) % 28) + 1;
        const hour = 9 + (i % 7);
        const d = new Date(calYear, calMonth, day, hour, 0, 0);
        const types = ["Technical", "HR Round", "Managerial", "Final Round"];
        events.push({
          id: `${c.id}-scheduled`,
          date: d,
          candidateId: c.id,
          candidateName: c.name,
          role: c.role,
          type: types[i % types.length],
          stage: c.stage,
        });
      }
    });

    return events.sort((a, b) => a.date.getTime() - b.date.getTime());
  }, [candidates, calYear, calMonth]);

  const calDaysInMonth = new Date(calYear, calMonth + 1, 0).getDate();
  const calFirstWeekday = new Date(calYear, calMonth, 1).getDay();
  const calCells = Array.from({ length: calFirstWeekday + calDaysInMonth }, (_, i) =>
    i < calFirstWeekday ? null : i - calFirstWeekday + 1,
  );

  const selectedDayEvents = calendarSelectedDay
    ? calendarEvents.filter((e) => e.date.getDate() === calendarSelectedDay)
    : [];

  const prevCalMonth = () => setCalendarViewDate(new Date(calYear, calMonth - 1, 1));
  const nextCalMonth = () => setCalendarViewDate(new Date(calYear, calMonth + 1, 1));
  const weekDayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <motion.div initial="hidden" animate="show" variants={container} className="space-y-6 max-w-[1600px] mx-auto pb-10">

      {/* Top Banner (Dark Teal / Cyan Gradient) */}
      <div className="relative overflow-hidden rounded-[28px] bg-gradient-to-r from-[#000C22] via-[#0B2524] to-[#0D2823] shadow-lg border border-teal-900/40 p-8 sm:p-10 text-white flex flex-col xl:flex-row items-start xl:items-center justify-between gap-6">
        <div className="relative z-10 flex flex-col justify-center max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-300 text-xs font-bold mb-3 backdrop-blur-md w-fit">
            <span className="w-2 h-2 rounded-full bg-[#60C042] animate-ping" />
            Recruitment Intelligence Overview
          </div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight mb-2 text-white">
            Welcome back{currentUser?.name || currentUser?.full_name ? `, ${currentUser?.name || currentUser?.full_name}` : ''} 👋
          </h1>
          <p className="text-[#60C042] text-[14px] sm:text-[15px] font-medium leading-relaxed">
            Monitor real-time candidate pipeline stages, recruitment conversions, and team productivity.
          </p>
        </div>

        {/* Action Buttons & 3D Interactive Icon */}
        <div className="relative z-10 flex flex-wrap items-center gap-3 self-stretch xl:self-auto justify-start xl:justify-end">
          <Link to="/pipeline">
            <Button className="h-11 px-5 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/20 backdrop-blur-md font-bold text-sm shadow-sm transition-all">
              <ClipboardList className="w-4 h-4 mr-2 text-teal-300" /> View Pipeline
            </Button>
          </Link>

          <Link to="/candidates/add">
            <Button className="btn-primary h-11 px-6 rounded-xl font-bold shadow-lg transition-transform active:scale-95 flex items-center gap-2">
              <Plus className="w-4 h-4" /> Add Candidate
            </Button>
          </Link>

          <div className="hidden xl:flex items-center justify-center w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 shadow-inner flex-shrink-0 cursor-pointer hover:scale-105 transition-transform duration-300 ml-1">
            <span className="text-3xl select-none filter drop-shadow-md hover:animate-bounce">🚀</span>
          </div>
        </div>

        {/* Decorative Background Glows */}
        <div className="absolute -right-16 -top-16 w-80 h-80 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute right-40 -bottom-20 w-60 h-60 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4">
        <StatCard
          label="Total Candidates"
          value={counts.total}
          icon={Users}
          theme="blue"
          trend="12.5%"
        />
        <StatCard
          label="Active Candidates"
          value={counts.active}
          icon={ClipboardList}
          theme="emerald"
          trend="8.2%"
        />
        <StatCard
          label="Interview Scheduled"
          value={counts.scheduled}
          icon={CalendarCheck}
          theme="purple"
          trend="15.3%"
        />
        <StatCard
          label="Selected Candidates"
          value={counts.selected}
          icon={Star}
          theme="amber"
          trend="14.2%"
        />
        <StatCard
          label="Offers Released"
          value={counts.offersReleased}
          icon={Mail}
          theme="teal"
          trend="11.1%"
        />
        <StatCard
          label="Offers Accepted"
          value={counts.offersAccepted}
          icon={CheckCircle}
          theme="emerald"
          trend="9.5%"
        />
        <StatCard
          label="Joined Candidates"
          value={counts.joined}
          icon={UserPlus}
          theme="cyan"
          trend="7.8%"
        />
        <StatCard
          label="Rejected Candidates"
          value={counts.rejected}
          icon={XCircle}
          theme="rose"
          trend="9.3%"
        />
        <StatCard
          label="Blacklisted Candidates"
          value={counts.blacklisted}
          icon={AlertTriangle}
          theme="zinc"
          trend="2.1%"
        />
        <StatCard
          label="No-Join Candidates"
          value={counts.noShow}
          icon={UserX}
          theme="orange"
          trend="4.5%"
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <Card className="xl:col-span-2 p-6 bg-white shadow-sm rounded-2xl border border-slate-200/80 hover:shadow-md transition-all">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-8">
              <h3 className="text-lg font-black text-slate-900 tracking-tight">Candidates Trend Overview</h3>
              <div className="hidden sm:flex items-center gap-4 text-xs font-bold">
                <div className="flex items-center gap-1.5 text-slate-500"><div className="w-2.5 h-1.5 rounded-full bg-[#8b5cf6]"></div> Applied</div>
                <div className="flex items-center gap-1.5 text-slate-500"><div className="w-2.5 h-1.5 rounded-full bg-[#3b82f6]"></div> Interviews</div>
                <div className="flex items-center gap-1.5 text-slate-500"><div className="w-2.5 h-1.5 rounded-full bg-[#10b981]"></div> Selected</div>
                <div className="flex items-center gap-1.5 text-slate-500"><div className="w-2.5 h-1.5 rounded-full bg-[#f59e0b]"></div> Joined</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {isTrendLoading && (
                <span className="text-[11px] font-bold text-slate-400 animate-pulse">Loading...</span>
              )}
              <select 
                value={trendPeriod}
                onChange={(e) => setTrendPeriod(e.target.value)}
                className="text-xs font-bold text-slate-700 bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 outline-none cursor-pointer hover:bg-slate-100 transition-colors focus:ring-1 focus:ring-[#42bc24]"
              >
                <option value="6months">Last 6 Months</option>
                <option value="this_year">This Year (Monthly)</option>
                <option value="last_year">Last Year (Monthly)</option>
                <option value="yearly">Yearly View (Last 5 Years)</option>
              </select>
            </div>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorApplied" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorInterviews" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorSelected" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorJoined" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} />
                <RechartsTooltip contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 20px -2px rgba(0,0,0,0.08)' }} />
                <Area type="monotone" dataKey="applied" stroke="#8b5cf6" strokeWidth={2} fillOpacity={1} fill="url(#colorApplied)" activeDot={{ r: 6 }} />
                <Area type="monotone" dataKey="interviews" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorInterviews)" activeDot={{ r: 6 }} />
                <Area type="monotone" dataKey="selected" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorSelected)" activeDot={{ r: 6 }} />
                <Area type="monotone" dataKey="joined" stroke="#f59e0b" strokeWidth={2} fillOpacity={1} fill="url(#colorJoined)" activeDot={{ r: 6 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-6 bg-white shadow-sm rounded-2xl border border-slate-200/80 hover:shadow-md transition-all flex flex-col">
          <h3 className="text-lg font-black text-slate-900 tracking-tight mb-6">Quick Stats</h3>
          <div className="flex-1 flex flex-col justify-between">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 last:border-0 last:pb-0">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-purple-50 border border-purple-100 text-purple-600 flex items-center justify-center"><UserPlus className="w-4 h-4" /></div>
                <span className="text-[13px] font-bold text-slate-700">New Candidates</span>
              </div>
              <span className="text-lg font-black text-slate-900">{counts.quickStats?.newCandidates ?? counts.newApplicants ?? counts.funnel?.["New Applicant"] ?? 0}</span>
            </div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 last:border-0 last:pb-0 pt-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center"><CalendarCheck className="w-4 h-4" /></div>
                <span className="text-[13px] font-bold text-slate-700">Interviews Scheduled</span>
              </div>
              <span className="text-lg font-black text-slate-900">{counts.quickStats?.interviewsScheduled ?? counts.scheduled ?? 0}</span>
            </div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 last:border-0 last:pb-0 pt-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-rose-50 border border-rose-100 text-rose-500 flex items-center justify-center"><Mail className="w-4 h-4" /></div>
                <span className="text-[13px] font-bold text-slate-700">Offers Pending</span>
              </div>
              <span className="text-lg font-black text-slate-900">{counts.quickStats?.offersPending ?? counts.offersPending ?? 0}</span>
            </div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 last:border-0 last:pb-0 pt-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-teal-50 border border-teal-100 text-teal-600 flex items-center justify-center"><Users className="w-4 h-4" /></div>
                <span className="text-[13px] font-bold text-slate-700">Joined</span>
              </div>
              <span className="text-lg font-black text-slate-900">{counts.quickStats?.joined ?? counts.joined ?? counts.funnel?.["Joined"] ?? 0}</span>
            </div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 last:border-0 last:pb-0 pt-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-amber-50 border border-amber-100 text-amber-600 flex items-center justify-center"><UserX className="w-4 h-4" /></div>
                <span className="text-[13px] font-bold text-slate-700">No Shows</span>
              </div>
              <span className="text-lg font-black text-slate-900">{counts.quickStats?.noShows ?? counts.noShow ?? 0}</span>
            </div>
            <div className="flex items-center justify-between pt-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-red-50 border border-red-100 text-red-600 flex items-center justify-center"><XCircle className="w-4 h-4" /></div>
                <span className="text-[13px] font-bold text-slate-700">Rejected</span>
              </div>
              <span className="text-lg font-black text-slate-900">{counts.quickStats?.rejected ?? counts.rejected ?? 0}</span>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-stretch">
        {/* Recruitment Pipeline */}
        <Card className="xl:col-span-2 p-6 bg-white shadow-sm rounded-2xl border border-slate-200/80 hover:shadow-md transition-all flex flex-col justify-between">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-lg font-black text-slate-900 tracking-tight">Recruitment Pipeline</h3>
            <select className="text-xs font-bold text-slate-600 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 outline-none cursor-pointer hover:bg-slate-100 transition-colors">
              <option>This Month</option>
              <option>Last Month</option>
              <option>This Year</option>
            </select>
          </div>

          <div className="flex-1 flex flex-col justify-end">
            <div className="flex-1 flex flex-col justify-center relative min-h-[220px] my-6">
              <svg className="absolute inset-0 w-full h-full pointer-events-none" preserveAspectRatio="none" viewBox="0 0 100 100">
                <path d="M 10 50 C 18 50, 18 15, 26 15 C 34 15, 34 85, 42 85 C 50 85, 50 15, 58 15 C 66 15, 66 85, 74 85 C 82 85, 82 15, 90 15" stroke="#cbd5e1" strokeWidth="1.5" fill="none" strokeDasharray="4 4" vectorEffect="non-scaling-stroke" />
              </svg>

              {pipelineStages.map((stage, i) => {
                const coords = [
                  { x: 10, y: 50 },
                  { x: 26, y: 15 },
                  { x: 42, y: 85 },
                  { x: 58, y: 15 },
                  { x: 74, y: 85 },
                  { x: 90, y: 15 }
                ];
                const bgColors = [
                  "bg-[#3b82f6]", // Blue
                  "bg-[#38bdf8]", // Cyan
                  "bg-[#38bdf8]", // Blue/Cyan
                  "bg-[#42bc24]", // Green
                  "bg-[#42bc24]", // Green
                  "bg-[#fba975]"  // Orange
                ];
                const p = coords[i] || coords[0];
                const bg = bgColors[i] || bgColors[0];

                return (
                  <div key={stage.label} className="absolute transform -translate-x-1/2 -translate-y-1/2 z-10" style={{ left: `${p.x}%`, top: `${p.y}%` }}>
                    <Link to="/pipeline" className={cn("px-4 py-2 rounded-full text-white text-xs font-bold shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all flex items-center gap-1.5", bg)}>
                      {stage.label}
                      <span className="bg-white/30 px-1.5 py-0.5 rounded-full text-[10px] leading-none">{stage.count}</span>
                    </Link>
                  </div>
                );
              })}

              <div className="absolute transform -translate-x-1/2 -translate-y-1/2 z-0" style={{ left: '18%', top: '32.5%' }}>
                <div className="w-10 h-10 rounded-full border-2 border-white shadow-sm bg-indigo-100 text-indigo-700 flex items-center justify-center text-sm font-bold">AL</div>
              </div>
              <div className="absolute transform -translate-x-1/2 -translate-y-1/2 z-0" style={{ left: '66%', top: '50%' }}>
                <div className="w-12 h-12 rounded-full border-2 border-white shadow-sm bg-pink-100 text-pink-700 flex items-center justify-center text-base font-bold">SA</div>
              </div>
              <div className="absolute transform -translate-x-1/2 -translate-y-1/2 z-0" style={{ left: '34%', top: '50%' }}>
                <div className="w-4 h-4 bg-[#3b82f6] rounded-full border-2 border-white shadow-sm"></div>
              </div>
              <div className="absolute transform -translate-x-1/2 -translate-y-1/2 z-0" style={{ left: '82%', top: '50%' }}>
                <div className="w-5 h-5 bg-[#fba975] rounded-full border-2 border-white shadow-sm"></div>
              </div>
            </div>

            <div className="mt-2 flex justify-between items-center p-3.5 bg-emerald-50/60 rounded-xl border border-emerald-100">
              <span className="text-xs font-bold text-slate-500">Conversion Rate</span>
              <span className="text-sm font-extrabold text-emerald-700">{conversionRate}% Overall Conversion</span>
            </div>
          </div>
        </Card>

        {/* Today's Schedule */}
        <Card className="xl:col-span-1 p-6 bg-white shadow-sm rounded-2xl border border-slate-200/80 hover:shadow-md transition-all flex flex-col h-full justify-between">
          <div className="flex justify-between items-center mb-5">
            <div>
              <h3 className="text-lg font-black text-slate-900 tracking-tight">Today's Schedule</h3>
              {counts.scheduleIsUpcoming && (
                <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200 inline-block mt-0.5">
                  Upcoming
                </span>
              )}
            </div>
            <button 
              type="button"
              onClick={() => {
                const t = new Date();
                setCalendarViewDate(new Date(t.getFullYear(), t.getMonth(), 1));
                setCalendarSelectedDay(t.getDate());
                setIsCalendarOpen(true);
              }} 
              className="text-xs font-bold text-teal-700 bg-teal-50 border border-teal-100 px-3 py-1.5 rounded-lg hover:bg-teal-100 transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <CalendarDays className="w-3.5 h-3.5" />
              View Calendar
            </button>
          </div>

          {counts.todaySchedule && counts.todaySchedule.length > 0 ? (
            <div className="space-y-3 flex-1 flex flex-col justify-center">
              {counts.todaySchedule.slice(0, 3).map((item: any, idx: number) => {
                const theme = SCHEDULE_ITEM_THEMES[idx % SCHEDULE_ITEM_THEMES.length];
                return (
                  <Link
                    key={item.id || idx}
                    to={item.candidateId ? `/candidates/${item.candidateId}` : `/interviews`}
                    className={cn(
                      "flex items-center gap-3 p-3 rounded-xl border border-slate-100 bg-slate-50/40 hover:bg-white hover:shadow-sm transition-all group",
                      theme.border
                    )}
                  >
                    <div className={cn("flex flex-col items-center justify-center w-12 h-12 rounded-xl transition-colors shrink-0 font-bold border", theme.badge)}>
                      <span className="text-[11px] font-black">{item.time}</span>
                      <span className="text-[9px] font-bold opacity-80 uppercase tracking-widest mt-0.5">{item.ampm}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className={cn("font-bold text-slate-900 text-[13px] mb-1 transition-colors truncate", theme.title)}>
                        {item.type}
                      </div>
                      <div className="text-[11px] font-medium text-slate-500 flex items-center gap-2 truncate">
                        <div className="w-5 h-5 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center text-[10px] font-bold shrink-0">
                          {item.initials}
                        </div>
                        <span className="truncate font-semibold text-slate-700">{item.candidateName}</span>
                        <span className="text-slate-300">•</span>
                        <span className="truncate text-slate-500">{item.role}</span>
                      </div>
                    </div>
                    <div
                      className={cn("w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 transition-colors shrink-0", theme.iconBg)}
                      title={item.meetingLink ? `${item.mode}: ${item.meetingLink}` : item.location ? `${item.mode}: ${item.location}` : item.mode}
                    >
                      {getScheduleModeIcon(item.mode)}
                    </div>
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center py-6 text-center px-4">
              <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 mb-2.5">
                <CalendarCheck className="w-6 h-6 text-slate-400" />
              </div>
              <p className="text-sm font-bold text-slate-700">No interviews scheduled today</p>
              <p className="text-xs text-slate-400 mt-1 max-w-[220px]">Check the calendar for upcoming interviews or schedule a new round.</p>
            </div>
          )}

          <Link to="/interviews" className="w-full mt-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/60 text-[13px] font-bold text-slate-700 hover:bg-slate-100 transition-colors flex justify-center items-center gap-2">
            View all interviews <ChevronRight className="w-4 h-4" />
          </Link>
        </Card>


        {/* ROW 3: Recent Candidate Activity */}
        <Card className="xl:col-span-3 p-6 bg-white shadow-sm rounded-2xl border border-slate-200/80 hover:shadow-md transition-all flex flex-col h-full">
          <div className="flex justify-between items-center mb-5">
            <div>
              <h3 className="text-lg font-black text-slate-900 tracking-tight">Recent Candidate Activity</h3>
              <p className="text-xs text-slate-500 mt-0.5">Real-time tracker of latest applicant updates, stages, and recruiter assignments.</p>
            </div>
            <Link to="/candidates" className="text-xs font-bold text-teal-700 bg-teal-50 border border-teal-100 px-3 py-1.5 rounded-lg hover:bg-teal-100 transition-colors flex items-center">
              View all <ChevronRight className="w-3.5 h-3.5 ml-1" />
            </Link>
          </div>
          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead>
                <tr className="text-[11px] uppercase tracking-wider text-slate-400 border-b border-slate-100">
                  <th className="pb-3 font-bold">Candidate</th>
                  <th className="pb-3 font-bold">Position</th>
                  <th className="pb-3 font-bold">Stage</th>
                  <th className="pb-3 font-bold">Recruiter</th>
                  <th className="pb-3 font-bold">Updated On</th>
                  <th className="pb-3 font-bold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {recent.length > 0 ? recent.map((c) => {
                  const updatedDate = c.updatedAt ? new Date(c.updatedAt) : new Date();
                  const isToday = updatedDate.toDateString() === new Date().toDateString();
                  const dateStr = isToday
                    ? "Today"
                    : updatedDate.toLocaleDateString("en-US", { month: "short", day: "numeric" });
                  const timeStr = updatedDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

                  return (
                    <tr key={c.id} className="hover:bg-slate-50/70 transition-colors group">
                      <td className="py-3 pr-4">
                        <Link to={`/candidates/${c.id}`} className="flex items-center gap-3">
                          <div className={cn("flex h-9 w-9 items-center justify-center rounded-full text-xs font-bold text-white shrink-0 shadow-xs", STAGE_COLORS[c.stage] || "bg-slate-700")}>
                            {c.name ? c.name.substring(0, 2).toUpperCase() : "CA"}
                          </div>
                          <div>
                            <div className="font-bold text-slate-800 text-[13px] group-hover:text-blue-600 transition-colors">{c.name}</div>
                            <div className="text-[11px] text-slate-400">{c.email}</div>
                          </div>
                        </Link>
                      </td>
                      <td className="py-3 pr-4 text-[13px] font-semibold text-slate-600">
                        {c.role || "Not Specified"}
                      </td>
                      <td className="py-3 pr-4">
                        <span className={cn("px-2.5 py-1 rounded-md text-[10px] font-bold border", STAGE_COLORS[c.stage] || "bg-slate-100 text-slate-600 border-slate-200")}>
                          {c.stage}
                        </span>
                      </td>
                      <td className="py-3 pr-4">
                        <div className="flex items-center gap-2">
                          <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-[10px] font-bold text-indigo-700">
                            {(c.recruiter || 'HR').substring(0, 2).toUpperCase()}
                          </div>
                          <span className="text-[12px] font-semibold text-slate-700">{c.recruiter || 'Unassigned'}</span>
                        </div>
                      </td>
                      <td className="py-3 pr-4">
                        <div className="font-semibold text-slate-700 text-[12px]">{timeStr}</div>
                        <div className="text-[10px] text-slate-400">{dateStr}</div>
                      </td>
                      <td className="py-3 text-right">
                        <Button
                          asChild
                          variant="outline"
                          size="sm"
                          className="h-7 text-[11px] font-bold border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-blue-600 rounded-lg"
                        >
                          <Link to={`/candidates/${c.id}`}>
                            <Eye className="w-3.5 h-3.5 mr-1" /> View
                          </Link>
                        </Button>
                      </td>
                    </tr>
                  );
                }) : (
                  <tr><td colSpan={6} className="py-8 text-center text-slate-400 text-sm font-medium">No recent activity found</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>

      </div>

      {/* Interactive Calendar Popup Modal */}
      <Dialog open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
        <DialogContent className="max-w-4xl p-6 bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200">
          <DialogHeader className="pb-3 border-b border-slate-100 flex flex-row items-center justify-between">
            <DialogTitle className="text-xl font-black text-slate-900 flex items-center gap-2">
              <CalendarDays className="w-5 h-5 text-teal-600" />
              Interview Schedule & Calendar
            </DialogTitle>
          </DialogHeader>

          <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6 pt-2 items-start">
            {/* Calendar Grid */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-extrabold text-slate-800">{calMonthLabel}</h3>
                <div className="flex items-center gap-1.5">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 w-8 p-0 rounded-lg border-slate-200 text-slate-600"
                    onClick={prevCalMonth}
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 px-2.5 text-xs font-bold rounded-lg border-slate-200 text-slate-700"
                    onClick={() => {
                      const t = new Date();
                      setCalendarViewDate(new Date(t.getFullYear(), t.getMonth(), 1));
                      setCalendarSelectedDay(t.getDate());
                    }}
                  >
                    Today
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 w-8 p-0 rounded-lg border-slate-200 text-slate-600"
                    onClick={nextCalMonth}
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-7 gap-1.5 text-center">
                {weekDayNames.map((d) => (
                  <div key={d} className="text-[11px] font-bold uppercase text-slate-400 py-1">
                    {d}
                  </div>
                ))}
                {calCells.map((day, idx) => {
                  if (day === null) {
                    return <div key={`empty-${idx}`} className="h-16 rounded-xl bg-slate-50/40" />;
                  }

                  const dayEvents = calendarEvents.filter((e) => e.date.getDate() === day);
                  const isToday =
                    day === new Date().getDate() &&
                    calMonth === new Date().getMonth() &&
                    calYear === new Date().getFullYear();
                  const isSelected = day === calendarSelectedDay;

                  return (
                    <button
                      type="button"
                      key={day}
                      onClick={() => setCalendarSelectedDay(day)}
                      className={cn(
                        "h-16 p-1.5 rounded-xl border text-left flex flex-col justify-between transition-all cursor-pointer",
                        isSelected
                          ? "border-teal-500 bg-teal-50/50 ring-2 ring-teal-500/20 shadow-xs"
                          : isToday
                          ? "border-teal-300 bg-teal-50/20"
                          : "border-slate-100 bg-white hover:border-slate-300 hover:bg-slate-50/50"
                      )}
                    >
                      <span
                        className={cn(
                          "text-[11px] font-black inline-flex items-center justify-center w-5 h-5 rounded-full",
                          isToday
                            ? "bg-teal-600 text-white"
                            : isSelected
                            ? "text-teal-700 font-black"
                            : "text-slate-700"
                        )}
                      >
                        {day}
                      </span>
                      {dayEvents.length > 0 && (
                        <div className="w-full">
                          <div className="text-[9px] font-bold text-teal-700 bg-teal-100/70 border border-teal-200/60 rounded px-1 truncate">
                            {dayEvents[0].candidateName.split(" ")[0]}
                          </div>
                          {dayEvents.length > 1 && (
                            <div className="text-[8px] font-bold text-slate-400 pl-0.5">
                              +{dayEvents.length - 1} more
                            </div>
                          )}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Day Schedule Panel */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex flex-col h-full min-h-[320px]">
              <div className="mb-3">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  {calendarSelectedDay
                    ? new Date(calYear, calMonth, calendarSelectedDay).toLocaleDateString("en-US", {
                        weekday: "short",
                        month: "short",
                        day: "numeric",
                      })
                    : "Selected Date"}
                </h4>
                <div className="text-sm font-black text-slate-900 mt-0.5">
                  {selectedDayEvents.length} Event{selectedDayEvents.length !== 1 ? "s" : ""} Scheduled
                </div>
              </div>

              <div className="space-y-2.5 overflow-y-auto max-h-[260px] flex-1 pr-1">
                {selectedDayEvents.length > 0 ? (
                  selectedDayEvents.map((e) => (
                    <div
                      key={e.id}
                      className="p-3 bg-white rounded-xl border border-slate-200/80 shadow-2xs hover:shadow-xs transition-all space-y-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-teal-50 text-teal-700 border border-teal-100">
                          {e.type}
                        </span>
                        <span className="text-[10px] font-semibold text-slate-400">
                          {e.date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <div>
                        <Link
                          to={`/candidates/${e.candidateId}`}
                          onClick={() => setIsCalendarOpen(false)}
                          className="text-xs font-bold text-slate-900 hover:text-blue-600 transition-colors block truncate"
                        >
                          {e.candidateName}
                        </Link>
                        <p className="text-[11px] text-slate-500 truncate">{e.role}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <CalendarDays className="w-8 h-8 text-slate-300 mb-2" />
                    <p className="text-xs font-bold text-slate-600">No events on this day</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">Select another day on the calendar</p>
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-slate-200/60 mt-3 flex items-center justify-between">
                <Link
                  to="/interviews"
                  onClick={() => setIsCalendarOpen(false)}
                  className="text-xs font-bold text-teal-700 hover:text-teal-800"
                >
                  Manage Interviews →
                </Link>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setIsCalendarOpen(false)}
                  className="h-7 text-xs font-bold rounded-lg border-slate-200"
                >
                  Close
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

    </motion.div>
  );
}

export default Dashboard;
