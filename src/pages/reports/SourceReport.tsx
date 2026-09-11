import React from 'react';
import { Card } from "@/components/ui/card";
import { type Candidate, SOURCES } from "@/types/ats-types";
import { Share2 } from "lucide-react";

interface Props {
  candidates: Candidate[];
}

export default function SourceReport({ candidates }: Props) {
  const data = SOURCES.map(src => {
    const srcCands = candidates.filter(c => c.source === src);
    const applied = srcCands.length;
    const shortlisted = srcCands.filter(c => c.stage !== 'New Applicant' && c.stage !== 'Rejected').length;
    const interviews = srcCands.filter(c => c.stage.includes('Interview') || c.stage === 'Offer Released' || c.stage === 'Offer Accepted' || c.stage === 'Joined').length;
    const offers = srcCands.filter(c => c.stage === 'Offer Released' || c.stage === 'Offer Accepted' || c.stage === 'Joined').length;
    const hired = srcCands.filter(c => c.stage === 'Joined').length;
    const hirePct = applied > 0 ? ((hired / applied) * 100).toFixed(1) : '0.0';
    return { name: src, applied, shortlisted, interviews, offers, hired, hirePct };
  }).filter(d => d.applied > 0).sort((a,b) => b.applied - a.applied);

  return (
    <Card className="p-6 bg-white shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border border-slate-100 rounded-3xl h-full">
      <div className="flex items-start gap-3 mb-6">
        <div className="h-10 w-10 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center">
          <Share2 className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-sm font-bold text-slate-900">Source Performance</h2>
          <p className="text-[10px] text-slate-500 font-medium mt-0.5">Candidate source wise conversion.</p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-[11px]">
          <thead className="border-b border-slate-100 text-slate-500 font-bold tracking-wider">
            <tr>
              <th className="pb-3">Source</th>
              <th className="pb-3 text-center">Applications</th>
              <th className="pb-3 text-center">Shortlisted</th>
              <th className="pb-3 text-center">Interviews</th>
              <th className="pb-3 text-center">Offers</th>
              <th className="pb-3 text-center">Hired</th>
              <th className="pb-3 text-right">Hire %</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50 font-semibold text-slate-700">
            {data.map((d, i) => {
               const iconColors = ["bg-purple-100 text-purple-600", "bg-blue-100 text-blue-600", "bg-orange-100 text-orange-600", "bg-sky-100 text-sky-600", "bg-red-100 text-red-600"];
               return (
                <tr key={d.name} className="hover:bg-slate-50/50 transition-colors">
                  <td className="py-3 flex items-center gap-2">
                     <div className={`h-5 w-5 rounded-full flex items-center justify-center text-[8px] font-black ${iconColors[i % iconColors.length]}`}>
                        {(d.name || "S").charAt(0)}
                     </div>
                     {d.name}
                  </td>
                  <td className="py-3 text-center">{d.applied}</td>
                  <td className="py-3 text-center">{d.shortlisted}</td>
                  <td className="py-3 text-center">{d.interviews}</td>
                  <td className="py-3 text-center">{d.offers}</td>
                  <td className="py-3 text-center">{d.hired}</td>
                  <td className="py-3 text-right text-blue-600">{d.hirePct}%</td>
                </tr>
               )
            })}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
