import React from 'react';
import { Card } from "@/components/ui/card";
import { type Candidate, DEPARTMENTS } from "@/types/ats-types";
import { Activity } from "lucide-react";

interface Props {
  candidates: Candidate[];
}

export default function DepartmentReport({ candidates }: Props) {
  const data = DEPARTMENTS.map(dept => {
    const deptCands = candidates.filter(c => c.department === dept);
    const applied = deptCands.length;
    const shortlisted = deptCands.filter(c => c.stage !== 'New Applicant' && c.stage !== 'Rejected').length;
    const interviews = deptCands.filter(c => c.stage.includes('Interview') || c.stage === 'Offer Released' || c.stage === 'Offer Accepted' || c.stage === 'Joined').length;
    const offers = deptCands.filter(c => c.stage === 'Offer Released' || c.stage === 'Offer Accepted' || c.stage === 'Joined').length;
    const hired = deptCands.filter(c => c.stage === 'Joined').length;
    const hirePct = applied > 0 ? ((hired / applied) * 100).toFixed(1) : '0.0';
    return { name: dept, applied, shortlisted, interviews, offers, hired, hirePct };
  }).filter(d => d.applied > 0).sort((a,b) => b.applied - a.applied);

  return (
    <Card className="p-6 bg-white shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border border-slate-100 rounded-3xl h-full">
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
            <Activity className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900">Department Summary</h2>
            <p className="text-[10px] text-slate-500 font-medium mt-0.5">Performance by department.</p>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-[11px]">
          <thead className="border-b border-slate-100 text-slate-500 font-bold tracking-wider">
            <tr>
              <th className="pb-3">Department</th>
              <th className="pb-3 text-center">Applications</th>
              <th className="pb-3 text-center">Shortlisted</th>
              <th className="pb-3 text-center">Interviews</th>
              <th className="pb-3 text-center">Offers</th>
              <th className="pb-3 text-center">Hired</th>
              <th className="pb-3 text-right">Hire %</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50 font-semibold text-slate-700">
            {data.map(d => (
              <tr key={d.name} className="hover:bg-slate-50/50 transition-colors">
                <td className="py-3">{d.name}</td>
                <td className="py-3 text-center">{d.applied}</td>
                <td className="py-3 text-center">{d.shortlisted}</td>
                <td className="py-3 text-center">{d.interviews}</td>
                <td className="py-3 text-center">{d.offers}</td>
                <td className="py-3 text-center">{d.hired}</td>
                <td className="py-3 text-right text-blue-600">{d.hirePct}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
