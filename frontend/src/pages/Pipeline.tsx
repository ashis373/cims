
import { useAts } from "@/lib/ats-store";
import { KanbanBoard } from "@/components/ats/KanbanBoard";


function Pipeline() {
  const { candidates } = useAts();
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Pipeline</h1>
        <p className="text-sm text-muted-foreground">Drag cards between columns to update stage.</p>
      </div>
      <KanbanBoard candidates={candidates} />
    </div>
  );
}

export default Pipeline;
