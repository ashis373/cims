import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { FileSpreadsheet, FileText, FileBarChart2 } from "lucide-react";
import { exportXlsx, exportCsv, exportBossReport } from "@/lib/ats-export";
import type { Candidate } from "@/lib/ats-types";
import { toast } from "sonner";

interface Props {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  candidates: Candidate[];
  scope: "all" | "filtered" | "selected";
}

export function ExportDialog({ open, onOpenChange, candidates, scope }: Props) {
  const handle = (fn: () => void, label: string) => {
    if (candidates.length === 0) {
      toast.error("Nothing to export");
      return;
    }
    fn();
    toast.success(`${label} exported (${candidates.length})`);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Export candidates</DialogTitle>
          <DialogDescription>
            Exporting <span className="font-medium text-foreground">{candidates.length}</span>{" "}
            {scope === "all"
              ? "candidates (all)"
              : scope === "filtered"
                ? "candidates (filtered view)"
                : "selected candidates"}
            .
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-2">
          <Button
            variant="outline"
            className="justify-start h-auto py-3"
            onClick={() => handle(() => exportXlsx(candidates), "Excel")}
          >
            <FileSpreadsheet className="mr-3 h-5 w-5 text-emerald-600" />
            <div className="text-left">
              <div className="font-medium">Excel (.xlsx)</div>
              <div className="text-xs text-muted-foreground">Full candidate data, one sheet</div>
            </div>
          </Button>
          <Button
            variant="outline"
            className="justify-start h-auto py-3"
            onClick={() => handle(() => exportCsv(candidates), "CSV")}
          >
            <FileText className="mr-3 h-5 w-5 text-sky-600" />
            <div className="text-left">
              <div className="font-medium">CSV (.csv)</div>
              <div className="text-xs text-muted-foreground">Universal, opens anywhere</div>
            </div>
          </Button>
          <Button
            variant="outline"
            className="justify-start h-auto py-3"
            onClick={() => handle(() => exportBossReport(candidates), "Boss Report")}
          >
            <FileBarChart2 className="mr-3 h-5 w-5 text-violet-600" />
            <div className="text-left">
              <div className="font-medium">Boss Report (.xlsx)</div>
              <div className="text-xs text-muted-foreground">
                Summary + funnel + candidate detail
              </div>
            </div>
          </Button>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
