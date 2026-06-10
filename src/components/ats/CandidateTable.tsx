import { Link } from "react-router-dom";
import { useAts } from "@/lib/ats-store";
import { PIPELINE_STAGES, STAGE_COLORS, type Candidate, type Stage } from "@/lib/ats-types";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

interface Props {
  candidates: Candidate[];
  selected: string[];
  onSelectedChange: (ids: string[]) => void;
}

export function CandidateTable({ candidates, selected, onSelectedChange }: Props) {
  const { setStage } = useAts();
  const allSelected = candidates.length > 0 && selected.length === candidates.length;

  const toggle = (id: string) => {
    onSelectedChange(selected.includes(id) ? selected.filter((s) => s !== id) : [...selected, id]);
  };

  return (
    <div className="overflow-x-auto rounded-xl border bg-card scrollbar-thin">
      <table className="w-full text-sm">
        <thead className="bg-muted/50 text-xs uppercase tracking-wide text-muted-foreground">
          <tr>
            <th className="w-10 px-3 py-2.5">
              <Checkbox
                checked={allSelected}
                onCheckedChange={(v) => onSelectedChange(v ? candidates.map((c) => c.id) : [])}
              />
            </th>
            <th className="px-3 py-2.5 text-left font-medium">Name</th>
            <th className="px-3 py-2.5 text-left font-medium">Role</th>
            <th className="px-3 py-2.5 text-left font-medium">Stage</th>
            <th className="px-3 py-2.5 text-left font-medium">Source</th>
            <th className="px-3 py-2.5 text-left font-medium">Tags</th>
            <th className="px-3 py-2.5 text-left font-medium">Applied</th>
            <th className="px-3 py-2.5 text-left font-medium">Updated</th>
          </tr>
        </thead>
        <tbody>
          {candidates.map((c) => (
            <tr key={c.id} className="border-t hover:bg-muted/40 transition-colors">
              <td className="px-3 py-2.5">
                <Checkbox checked={selected.includes(c.id)} onCheckedChange={() => toggle(c.id)} />
              </td>
              <td className="px-3 py-2.5">
                <Link to={`/candidates/${c.id}`} className="block">
                  <div className="font-medium">{c.name}</div>
                  <div className="text-xs text-muted-foreground">{c.email}</div>
                </Link>
              </td>
              <td className="px-3 py-2.5">{c.role}</td>
              <td className="px-3 py-2.5">
                <Select value={c.stage} onValueChange={(v) => setStage(c.id, v as Stage)}>
                  <SelectTrigger
                    className={cn("h-7 w-[170px] text-xs border", STAGE_COLORS[c.stage])}
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PIPELINE_STAGES.map((s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </td>
              <td className="px-3 py-2.5 text-muted-foreground">{c.source}</td>
              <td className="px-3 py-2.5">
                <div className="flex flex-wrap gap-1">
                  {c.tags.slice(0, 3).map((t) => (
                    <Badge key={t} variant="secondary" className="text-[10px]">
                      {t}
                    </Badge>
                  ))}
                </div>
              </td>
              <td className="px-3 py-2.5 text-muted-foreground">
                {new Date(c.appliedAt).toLocaleDateString()}
              </td>
              <td className="px-3 py-2.5 text-muted-foreground">
                {new Date(c.updatedAt).toLocaleDateString()}
              </td>
            </tr>
          ))}
          {candidates.length === 0 && (
            <tr>
              <td colSpan={8} className="py-16 text-center text-sm text-muted-foreground">
                No candidates match your filters.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
