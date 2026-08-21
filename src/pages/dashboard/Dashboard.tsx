import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
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
  ChevronRight,
  ClipboardList,
  UserPlus,
  UserX
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { API_BASE_URL } from "@/config/api";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, AreaChart, Area, XAxis, YAxis, CartesianGrid } from 'recharts';

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
  theme: 'blue' | 'emerald' | 'purple' | 'amber' | 'cyan' | 'rose';
}) {
  const styles = {
    blue: { cardBg: "bg-blue-50/70", text: "text-blue-700", iconBg: "bg-blue-100/80 text-blue-700", border: "border-blue-200/50" },
    emerald: { cardBg: "bg-emerald-50/70", text: "text-emerald-700", iconBg: "bg-emerald-100/80 text-emerald-700", border: "border-emerald-200/50" },
    purple: { cardBg: "bg-purple-50/70", text: "text-purple-700", iconBg: "bg-purple-100/80 text-purple-700", border: "border-purple-200/50" },
    amber: { cardBg: "bg-amber-50/70", text: "text-amber-700", iconBg: "bg-amber-100/80 text-amber-700", border: "border-amber-200/50" },
    cyan: { cardBg: "bg-cyan-50/70", text: "text-cyan-700", iconBg: "bg-cyan-100/80 text-cyan-700", border: "border-cyan-200/50" },
    rose: { cardBg: "bg-rose-50/70", text: "text-rose-700", iconBg: "bg-rose-100/80 text-rose-700", border: "border-rose-200/50" }
  }[theme];

  return (
    <motion.div variants={item} className="h-full group">
      <Card className={cn(
        "relative overflow-hidden shadow-sm border rounded-2xl h-full flex flex-col p-4 transition-all duration-300 hover:-translate-y-1 hover:shadow-md",
        styles.cardBg,
        styles.border
      )}>
        <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-gradient-to-br from-white/40 to-transparent rounded-full blur-2xl pointer-events-none" />
        
        <div className="flex items-start justify-between mb-2 relative z-10">
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider pr-2 leading-tight">
            {label}
          </div>
          <div className={cn("p-1.5 rounded-lg shrink-0 border border-white/50 shadow-sm", styles.iconBg)}>
            <Icon className="w-4 h-4" />
          </div>
        </div>
        
        <div className="mt-auto relative z-10">
          <div className="text-2xl font-black tracking-tight text-slate-800">
            {value}
          </div>
          <div className="mt-1 flex items-center gap-1.5 text-[9px] font-bold text-slate-500 uppercase tracking-wider">
            <span className={cn("flex items-center gap-0.5 px-1.5 py-0.5 rounded shadow-sm border border-white/40 bg-white/60", styles.text)}>
              <ArrowUp className="w-3 h-3" /> {trend}
            </span>
            <span>vs last month</span>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}

function Dashboard() {
  const { candidates } = useAts();
  const [counts, setCounts] = useState<any>({
    total: 0, active: 0, scheduled: 0, selected: 0, offersReleased: 0, offersAccepted: 0, joined: 0, rejected: 0, blacklisted: 0, noShow: 0, funnel: {}
  });
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    const userStr = localStorage.getItem("cims_user");
    if (userStr) {
      try {
        setCurrentUser(JSON.parse(userStr));
      } catch (e) { }
    }

    fetch(`${API_BASE_URL}/dashboard/stats.php`)
      .then(res => res.json())
      .then(data => setCounts(data))
      .catch(console.error);
  }, []);

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
  const acceptedVal = isDataLoaded ? (counts.offersAccepted || 0) : 12;
  const declinedVal = isDataLoaded ? (counts.rejected || 0) : 4;
  const releasedVal = isDataLoaded ? (counts.offersReleased || 0) : 18;
  const pendingVal = isDataLoaded ? Math.max(0, releasedVal - acceptedVal - declinedVal) : 2;
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

  const trendData = [
    { month: 'Jan', applied: 180, interviews: 75, selected: 10, joined: 0 },
    { month: 'Feb', applied: 250, interviews: 110, selected: 35, joined: 0 },
    { month: 'Mar', applied: 360, interviews: 195, selected: 98, joined: 30 },
    { month: 'Apr', applied: 250, interviews: 120, selected: 45, joined: 20 },
    { month: 'May', applied: 260, interviews: 130, selected: 48, joined: 10 },
    { month: 'Jun', applied: 245, interviews: 118, selected: 32, joined: 2 },
    { month: 'Jul', applied: 345, interviews: 195, selected: 72, joined: 5 },
  ];

  return (
    <motion.div initial="hidden" animate="show" variants={container} className="space-y-6 max-w-[1600px] mx-auto pb-10">

      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
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
          label="Interviews Scheduled"
          value={counts.scheduled}
          icon={CalendarCheck}
          theme="purple"
          trend="15.3%"
        />
        <StatCard
          label="Offers Released"
          value={counts.offersReleased}
          icon={Star}
          theme="amber"
          trend="11.1%"
        />
        <StatCard
          label="Joined"
          value={counts.joined}
          icon={Users}
          theme="cyan"
          trend="7.8%"
        />
        <StatCard
          label="Rejected"
          value={counts.rejected}
          icon={XCircle}
          theme="rose"
          trend="9.3%"
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <Card className="xl:col-span-2 p-6 bg-white shadow-sm rounded-2xl border border-slate-100">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-8">
              <h3 className="text-lg font-bold text-slate-800">Candidates Trend Overview</h3>
              <div className="hidden sm:flex items-center gap-4 text-xs font-bold">
                <div className="flex items-center gap-1.5 text-slate-500"><div className="w-2.5 h-1.5 rounded-full bg-[#8b5cf6]"></div> Applied</div>
                <div className="flex items-center gap-1.5 text-slate-500"><div className="w-2.5 h-1.5 rounded-full bg-[#3b82f6]"></div> Interviews</div>
                <div className="flex items-center gap-1.5 text-slate-500"><div className="w-2.5 h-1.5 rounded-full bg-[#10b981]"></div> Selected</div>
                <div className="flex items-center gap-1.5 text-slate-500"><div className="w-2.5 h-1.5 rounded-full bg-[#f59e0b]"></div> Joined</div>
              </div>
            </div>
            <select className="text-xs font-semibold text-purple-600 bg-transparent border-none outline-none cursor-pointer">
              <option>This Year</option>
              <option>Last Year</option>
            </select>
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
                <RechartsTooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px -2px rgba(0,0,0,0.1)' }} />
                <Area type="monotone" dataKey="applied" stroke="#8b5cf6" strokeWidth={2} fillOpacity={1} fill="url(#colorApplied)" activeDot={{ r: 6 }} />
                <Area type="monotone" dataKey="interviews" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorInterviews)" activeDot={{ r: 6 }} />
                <Area type="monotone" dataKey="selected" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorSelected)" activeDot={{ r: 6 }} />
                <Area type="monotone" dataKey="joined" stroke="#f59e0b" strokeWidth={2} fillOpacity={1} fill="url(#colorJoined)" activeDot={{ r: 6 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-6 bg-white shadow-sm rounded-2xl border border-slate-100 flex flex-col">
          <h3 className="text-lg font-bold text-slate-800 mb-6">Quick Stats</h3>
          <div className="flex-1 flex flex-col justify-between">
            <div className="flex items-center justify-between pb-3 border-b border-slate-50 last:border-0 last:pb-0">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center"><UserPlus className="w-4 h-4" /></div>
                <span className="text-[13px] font-semibold text-slate-600">New Candidates</span>
              </div>
              <span className="text-lg font-black text-slate-800">{counts.funnel?.["New Applicant"] || counts.total || 0}</span>
            </div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-50 last:border-0 last:pb-0 pt-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center"><CalendarCheck className="w-4 h-4" /></div>
                <span className="text-[13px] font-semibold text-slate-600">Interviews Scheduled</span>
              </div>
              <span className="text-lg font-black text-slate-800">{counts.scheduled || 0}</span>
            </div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-50 last:border-0 last:pb-0 pt-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-500 flex items-center justify-center"><Mail className="w-4 h-4" /></div>
                <span className="text-[13px] font-semibold text-slate-600">Offers Pending</span>
              </div>
              <span className="text-lg font-black text-slate-800">{Math.max(0, (counts.offersReleased || 0) - (counts.offersAccepted || 0) - (counts.rejected || 0))}</span>
            </div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-50 last:border-0 last:pb-0 pt-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center"><Users className="w-4 h-4" /></div>
                <span className="text-[13px] font-semibold text-slate-600">Joined</span>
              </div>
              <span className="text-lg font-black text-slate-800">{counts.joined || counts.funnel?.["Joined"] || 0}</span>
            </div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-50 last:border-0 last:pb-0 pt-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-500 flex items-center justify-center"><UserX className="w-4 h-4" /></div>
                <span className="text-[13px] font-semibold text-slate-600">No Shows</span>
              </div>
              <span className="text-lg font-black text-slate-800">{counts.noShow || 0}</span>
            </div>
            <div className="flex items-center justify-between pt-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-red-50 text-red-500 flex items-center justify-center"><XCircle className="w-4 h-4" /></div>
                <span className="text-[13px] font-semibold text-slate-600">Rejected</span>
              </div>
              <span className="text-lg font-black text-slate-800">{counts.rejected || 0}</span>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-stretch">
        {/* ROW 1 */}
        <Card className="xl:col-span-2 p-6 bg-white shadow-sm rounded-2xl border border-slate-100 flex flex-col justify-between">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-lg font-bold text-slate-800">Recruitment Pipeline</h3>
            <select className="text-xs font-semibold text-blue-600 bg-blue-50 border-none outline-none py-1.5 px-3 rounded-lg cursor-pointer">
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
                  "bg-[#22c55e]", // Green
                  "bg-[#22c55e]", // Green
                  "bg-[#fba975]"  // Orange
                ];
                const p = coords[i] || coords[0];
                const bg = bgColors[i] || bgColors[0];

                return (
                  <div key={stage.label} className="absolute transform -translate-x-1/2 -translate-y-1/2 z-10" style={{ left: `${p.x}%`, top: `${p.y}%` }}>
                    <Link to="/candidates" className={cn("px-4 py-2 rounded-full text-white text-xs font-bold shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all flex items-center gap-1.5", bg)}>
                      {stage.label}
                      <span className="bg-white/30 px-1.5 py-0.5 rounded-full text-[10px] leading-none">{stage.count}</span>
                    </Link>
                  </div>
                );
              })}

              <div className="absolute transform -translate-x-1/2 -translate-y-1/2 z-0" style={{ left: '18%', top: '32.5%' }}>
                <img src="https://ui-avatars.com/api/?name=Alex&background=random" className="w-10 h-10 rounded-full border-2 border-white shadow-sm" alt="Avatar" />
              </div>
              <div className="absolute transform -translate-x-1/2 -translate-y-1/2 z-0" style={{ left: '66%', top: '50%' }}>
                <img src="https://ui-avatars.com/api/?name=Sarah&background=random" className="w-12 h-12 rounded-full border-2 border-white shadow-sm" alt="Avatar" />
              </div>
              <div className="absolute transform -translate-x-1/2 -translate-y-1/2 z-0" style={{ left: '34%', top: '50%' }}>
                <div className="w-4 h-4 bg-[#3b82f6] rounded-full border-2 border-white shadow-sm"></div>
              </div>
              <div className="absolute transform -translate-x-1/2 -translate-y-1/2 z-0" style={{ left: '82%', top: '50%' }}>
                <div className="w-5 h-5 bg-[#fba975] rounded-full border-2 border-white shadow-sm"></div>
              </div>
            </div>

            <div className="mt-2 flex justify-between items-center p-3 bg-emerald-50/50 rounded-xl border border-emerald-100">
              <span className="text-xs font-bold text-slate-500">Conversion Rate</span>
              <span className="text-sm font-bold text-emerald-600">{conversionRate}% Overall Conversion</span>
            </div>
          </div>
        </Card>

        <Card className="xl:col-span-1 p-5 bg-white shadow-sm rounded-2xl border border-slate-100 flex flex-col h-full justify-between">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold text-slate-800">Today's Schedule</h3>
            <span className="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg cursor-pointer hover:bg-blue-100 transition-colors">View Calendar</span>
          </div>

          <div className="space-y-3 flex-1 flex flex-col justify-center">
            <div className="flex items-center gap-3 p-3 rounded-2xl border border-slate-100 hover:shadow-md transition-all group">
              <div className="flex flex-col items-center justify-center w-12 h-12 rounded-xl bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors shrink-0">
                <span className="text-[11px] font-black">10:30</span>
                <span className="text-[9px] font-bold opacity-80 uppercase tracking-widest mt-0.5">AM</span>
              </div>
              <div className="flex-1">
                <div className="font-bold text-slate-800 text-[13px] mb-1 group-hover:text-blue-600 transition-colors">Technical Interview</div>
                <div className="text-[11px] font-medium text-slate-500 flex items-center gap-2">
                  <img src="https://ui-avatars.com/api/?name=John+Mathew&background=f1f5f9" alt="J" className="w-5 h-5 rounded-full" />
                  John Mathew <span className="text-slate-300">•</span> Full Stack
                </div>
              </div>
              <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-500 transition-colors">
                <Video className="w-4 h-4" />
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-2xl border border-slate-100 hover:shadow-md transition-all group">
              <div className="flex flex-col items-center justify-center w-12 h-12 rounded-xl bg-amber-50 text-amber-600 group-hover:bg-amber-500 group-hover:text-white transition-colors shrink-0">
                <span className="text-[11px] font-black">12:00</span>
                <span className="text-[9px] font-bold opacity-80 uppercase tracking-widest mt-0.5">PM</span>
              </div>
              <div className="flex-1">
                <div className="font-bold text-slate-800 text-[13px] mb-1 group-hover:text-amber-600 transition-colors">HR Round</div>
                <div className="text-[11px] font-medium text-slate-500 flex items-center gap-2">
                  <img src="https://ui-avatars.com/api/?name=Priya+Sharma&background=f1f5f9" alt="P" className="w-5 h-5 rounded-full" />
                  Priya Sharma <span className="text-slate-300">•</span> UI/UX
                </div>
              </div>
              <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-amber-50 group-hover:text-amber-500 transition-colors">
                <Video className="w-4 h-4" />
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-2xl border border-slate-100 hover:shadow-md transition-all group">
              <div className="flex flex-col items-center justify-center w-12 h-12 rounded-xl bg-purple-50 text-purple-600 group-hover:bg-purple-600 group-hover:text-white transition-colors shrink-0">
                <span className="text-[11px] font-black">03:00</span>
                <span className="text-[9px] font-bold opacity-80 uppercase tracking-widest mt-0.5">PM</span>
              </div>
              <div className="flex-1">
                <div className="font-bold text-slate-800 text-[13px] mb-1 group-hover:text-purple-600 transition-colors">Managerial Round</div>
                <div className="text-[11px] font-medium text-slate-500 flex items-center gap-2">
                  <img src="https://ui-avatars.com/api/?name=Rakesh+Kumar&background=f1f5f9" alt="R" className="w-5 h-5 rounded-full" />
                  Rakesh Kumar <span className="text-slate-300">•</span> DevOps
                </div>
              </div>
              <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-purple-50 group-hover:text-purple-500 transition-colors">
                <Video className="w-4 h-4" />
              </div>
            </div>
          </div>

          <button className="w-full mt-4 py-2.5 rounded-xl border border-slate-200 text-[13px] font-bold text-slate-600 hover:bg-slate-50 transition-colors flex justify-center items-center gap-2">
            View all interviews <ChevronRight className="w-4 h-4" />
          </button>
        </Card>

        {/* ROW 2 */}
        <div className="xl:col-span-2">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-full items-stretch">
            <Card className="p-5 bg-white shadow-sm rounded-2xl border border-slate-100 flex flex-col justify-between">
              <h3 className="text-sm font-bold text-slate-800 mb-4">Candidates by Source</h3>
              <div className="flex flex-col items-center">
                <div className="h-40 w-40 relative">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={sourceData}
                        innerRadius={50}
                        outerRadius={70}
                        paddingAngle={2}
                        dataKey="value"
                        stroke="none"
                      >
                        {sourceData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <RechartsTooltip />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-xl font-black text-slate-800">{counts.total}</span>
                    <span className="text-[10px] font-bold text-slate-400">Total</span>
                  </div>
                </div>
                <div className="w-full mt-2 space-y-1.5">
                  {sourceData.map(s => (
                    <div key={s.name} className="flex items-center justify-between text-[11px]">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: s.color }}></div>
                        <span className="font-semibold text-slate-600">{s.name}</span>
                      </div>
                      <span className="font-bold text-slate-900">{s.value}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </Card>

            <Card className="p-5 bg-white shadow-sm rounded-2xl border border-slate-100 flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-center mb-5">
                  <h3 className="text-sm font-bold text-slate-800">Top Skills in Demand</h3>
                  <span className="text-[10px] font-bold text-blue-600 cursor-pointer">View all</span>
                </div>
                <div className="space-y-4">
                  {skillsData.map(skill => (
                    <div key={skill.name}>
                      <div className="flex justify-between items-center text-[11px] mb-1.5">
                        <span className="font-bold text-slate-700">{skill.name}</span>
                        <span className="font-bold text-slate-900">{skill.pct}%</span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div className={cn("h-full rounded-full", skill.color)} style={{ width: `${skill.pct}%` }}></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Card>

            <Card className="p-5 bg-white shadow-sm rounded-2xl border border-slate-100 flex flex-col justify-between">
              <h3 className="text-sm font-bold text-slate-800 mb-4">Offer Status</h3>
              <div className="flex flex-col items-center">
                <div className="h-32 w-32 relative mb-5">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={offerData}
                        innerRadius={42}
                        outerRadius={58}
                        paddingAngle={3}
                        dataKey="value"
                        stroke="none"
                        cornerRadius={4}
                      >
                        {offerData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <RechartsTooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px -2px rgba(0,0,0,0.1)' }} itemStyle={{ fontSize: '12px', fontWeight: 'bold' }} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-2xl font-black text-slate-800 tracking-tight">{totalOffersVal}</span>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total</span>
                  </div>
                </div>
                <div className="w-full space-y-2">
                  {offerData.map(o => {
                    const percentage = totalOffersVal > 0 ? Math.round((o.value / totalOffersVal) * 100) : 0;
                    return (
                      <div key={o.name} className={cn("flex justify-between items-center p-2.5 rounded-xl border border-slate-50 transition-colors hover:border-slate-100", o.bg)}>
                        <div className="flex items-center gap-2.5">
                          <div className="w-2.5 h-2.5 rounded-full shadow-sm" style={{ backgroundColor: o.color }}></div>
                          <span className={cn("font-bold text-[12px]", o.text)}>{o.name}</span>
                        </div>
                        <div className="text-right flex items-center gap-3">
                          <span className={cn("font-black text-[13px]", o.text)}>{o.value}</span>
                          <span className={cn("text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-white/60", o.text)}>
                            {percentage}%
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </Card>
          </div>
        </div>

        <Card className="xl:col-span-1 p-5 bg-white shadow-sm rounded-2xl border border-slate-100 flex flex-col justify-between h-full">
          <div className="flex justify-between items-center mb-5">
            <h3 className="text-base font-bold text-slate-800">Alerts & Notifications</h3>
            <span className="text-xs font-bold text-blue-600 cursor-pointer">View all</span>
          </div>
          <div className="space-y-4 flex-1 flex flex-col justify-center">
            <div className="flex gap-3 items-start">
              <div className="w-8 h-8 rounded-full bg-amber-50 text-amber-500 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-4 h-4" />
              </div>
              <div className="flex-1">
                <div className="flex justify-between">
                  <span className="text-[13px] font-bold text-slate-800">3 Offers waiting for acceptance</span>
                  <span className="text-[10px] font-semibold text-slate-400">10m ago</span>
                </div>
                <div className="text-[11px] text-slate-500">Need follow-up</div>
              </div>
            </div>

            <div className="flex gap-3 items-start">
              <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center shrink-0">
                <CalendarCheck className="w-4 h-4" />
              </div>
              <div className="flex-1">
                <div className="flex justify-between">
                  <span className="text-[13px] font-bold text-slate-800">5 Interviews pending feedback</span>
                  <span className="text-[10px] font-semibold text-slate-400">20m ago</span>
                </div>
                <div className="text-[11px] text-slate-500">From managers</div>
              </div>
            </div>

            <div className="flex gap-3 items-start">
              <div className="w-8 h-8 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center shrink-0">
                <Users className="w-4 h-4" />
              </div>
              <div className="flex-1">
                <div className="flex justify-between">
                  <span className="text-[13px] font-bold text-slate-800">Duplicate Candidate Detected</span>
                  <span className="text-[10px] font-semibold text-slate-400">35m ago</span>
                </div>
                <div className="text-[11px] text-slate-500">2 new cases today</div>
              </div>
            </div>

            <div className="flex gap-3 items-start">
              <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-500 flex items-center justify-center shrink-0">
                <CheckCircle className="w-4 h-4" />
              </div>
              <div className="flex-1">
                <div className="flex justify-between">
                  <span className="text-[13px] font-bold text-slate-800">8 Candidates completed assessment</span>
                  <span className="text-[10px] font-semibold text-slate-400">1h ago</span>
                </div>
                <div className="text-[11px] text-slate-500">Ready for interview</div>
              </div>
            </div>
          </div>
        </Card>

        {/* ROW 3 */}
        <Card className="xl:col-span-2 p-5 bg-white shadow-sm rounded-2xl border border-slate-100 flex flex-col h-full">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-base font-bold text-slate-800">Recent Candidate Activity</h3>
            <Link to="/candidates" className="text-xs font-bold text-blue-600 flex items-center hover:underline">
              View all <ChevronRight className="w-3 h-3 ml-0.5" />
            </Link>
          </div>
          <div className="overflow-x-auto flex-1 flex flex-col justify-end">
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
                {recent.length > 0 ? recent.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-3 pr-4">
                      <div className="flex items-center gap-3">
                        <div className={cn("flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold text-white", STAGE_COLORS[c.stage] || "bg-slate-400")}>
                          {c.name.substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-bold text-slate-800 text-[13px]">{c.name}</div>
                          <div className="text-[11px] text-slate-400">{c.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 pr-4 text-[13px] font-semibold text-slate-600">{c.role}</td>
                    <td className="py-3 pr-4">
                      <span className={cn("px-2.5 py-1 rounded-md text-[10px] font-bold", STAGE_COLORS[c.stage] || "bg-slate-100 text-slate-600")}>
                        {c.stage}
                      </span>
                    </td>
                    <td className="py-3 pr-4">
                      <div className="flex items-center gap-2">
                        <img src={`https://ui-avatars.com/api/?name=${c.recruiter || 'HR'}&background=random`} alt="R" className="w-6 h-6 rounded-full" />
                        <span className="text-[12px] font-semibold text-slate-700">{c.recruiter || 'Priya Nair'}</span>
                      </div>
                    </td>
                    <td className="py-3 pr-4 text-[12px] font-semibold text-slate-500">
                      {new Date(c.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="py-3 text-right">
                      <button className="p-1 hover:bg-slate-100 rounded text-slate-400 transition-colors">
                        <MoreHorizontal className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                )) : (
                  <tr><td colSpan={6} className="py-8 text-center text-slate-400 text-sm">No recent activity found</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>

        <Card className="xl:col-span-1 p-5 bg-white shadow-sm rounded-2xl border border-slate-100 flex flex-col justify-between h-full">
          <h3 className="text-base font-bold text-slate-800 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-3 flex-1">
            <Link to="/candidates/new" className="p-3 bg-blue-50/50 hover:bg-blue-50 hover:shadow-sm rounded-xl border border-blue-100 flex flex-col items-center text-center gap-2 transition-all justify-center group">
              <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Plus className="w-5 h-5" />
              </div>
              <div>
                <div className="text-[12px] font-bold text-slate-800 leading-tight mb-0.5">Add Candidate</div>
                <div className="text-[10px] font-medium text-slate-500">Create profile</div>
              </div>
            </Link>
            <button className="p-3 bg-cyan-50/50 hover:bg-cyan-50 hover:shadow-sm rounded-xl border border-cyan-100 flex flex-col items-center text-center gap-2 transition-all justify-center group">
              <div className="w-10 h-10 rounded-full bg-cyan-100 text-cyan-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Upload className="w-5 h-5" />
              </div>
              <div>
                <div className="text-[12px] font-bold text-slate-800 leading-tight mb-0.5">Upload Resume</div>
                <div className="text-[10px] font-medium text-slate-500">Bulk upload</div>
              </div>
            </button>
            <Link to="/jobs/create" className="p-3 bg-amber-50/50 hover:bg-amber-50 hover:shadow-sm rounded-xl border border-amber-100 flex flex-col items-center text-center gap-2 transition-all justify-center group">
              <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Briefcase className="w-5 h-5" />
              </div>
              <div>
                <div className="text-[12px] font-bold text-slate-800 leading-tight mb-0.5">New Job</div>
                <div className="text-[10px] font-medium text-slate-500">Post opening</div>
              </div>
            </Link>
            <button className="p-3 bg-purple-50/50 hover:bg-purple-50 hover:shadow-sm rounded-xl border border-purple-100 flex flex-col items-center text-center gap-2 transition-all justify-center group">
              <div className="w-10 h-10 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <div className="text-[12px] font-bold text-slate-800 leading-tight mb-0.5">Reports</div>
                <div className="text-[10px] font-medium text-slate-500">Download data</div>
              </div>
            </button>
          </div>
        </Card>      </div>

    </motion.div>



  );
}

export default Dashboard;
