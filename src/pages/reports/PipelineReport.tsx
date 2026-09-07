import React from 'react';
import { Card } from "@/components/ui/card";
import { type Candidate, PIPELINE_STAGES } from "@/types/ats-types";
import { Activity } from "lucide-react";

interface Props {
  candidates: Candidate[];
}

export default function PipelineReport({ candidates }: Props) {
  const byStage = PIPELINE_STAGES.reduce<Record<string, number>>((acc, s) => {
    acc[s] = candidates.filter((c) => c.stage === s).length;
    return acc;
  }, {});

  const stages = PIPELINE_STAGES.map(s => {
    const name = s.replace(" Scheduled", "").replace(" Completed", "").replace(" Released", "");
    return { name, value: byStage[s] };
  });

  const total = candidates.length;

  return (
    <Card className="p-6 bg-white shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border border-slate-100 rounded-3xl">
      <div className="flex items-center gap-3 mb-6">
        <div className="h-10 w-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
          <Activity className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-sm font-bold text-slate-900">Pipeline Report</h2>
          <p className="text-[10px] text-slate-500 font-medium">Track candidate movement across each stage and conversion rates.</p>
        </div>
      </div>

      <div className="flex w-full gap-4 overflow-x-auto pb-2 scrollbar-thin">
        {stages.map((stage, i) => {
          const rate = total > 0 ? ((stage.value / total) * 100).toFixed(1) : "0.0";
          return (
             <div key={stage.name} className="flex-1 min-w-[120px] bg-slate-50/30 rounded-2xl p-4 border border-slate-100 text-center flex flex-col justify-center gap-2">
                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{stage.name}</div>
                <div className="text-2xl font-black text-slate-900">{stage.value}</div>
                <div className="text-[11px] font-bold text-blue-600">{rate}%</div>
             </div>
          );
        })}
      </div>
    </Card>
  );
}
