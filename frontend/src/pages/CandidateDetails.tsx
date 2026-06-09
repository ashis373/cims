import { Link, useNavigate, useParams } from "react-router-dom";
import { useState } from "react";
import { useAts } from "@/lib/ats-store";
import { INTERVIEW_TYPES, PIPELINE_STAGES, STAGE_COLORS, type InterviewType, type Stage } from "@/lib/ats-types";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Mail, Phone, Pencil, Trash2, Calendar, Clock, MessageSquare, Activity, FileText } from "lucide-react";
import { CandidateFormDialog } from "@/components/ats/CandidateFormDialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";
import { toast } from "sonner";


function CandidateProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { candidates, setStage, addNote, addInterview, remove } = useAts();
  const candidate = candidates.find((c) => c.id === id);

  const [edit, setEdit] = useState(false);
  const [del, setDel] = useState(false);
  const [note, setNote] = useState("");
  const [iv, setIv] = useState({ date: "", time: "10:00", type: "Online" as InterviewType, notes: "", outcome: "" });

  if (!candidate) {
    return (
      <div className="text-center py-16">
        <p className="text-muted-foreground">Candidate not found.</p>
        <Link to="/candidates" className="text-primary text-sm hover:underline">Back to list</Link>
      </div>
    );
  }

  const submitNote = () => {
    if (!note.trim()) return;
    addNote(candidate.id, note.trim());
    setNote("");
    toast.success("Note added");
  };

  const submitIv = () => {
    if (!iv.date) { toast.error("Pick a date"); return; }
    const dt = new Date(`${iv.date}T${iv.time || "10:00"}`);
    addInterview(candidate.id, { date: dt.toISOString(), type: iv.type, notes: iv.notes, outcome: iv.outcome || undefined });
    setIv({ date: "", time: "10:00", type: "Online", notes: "", outcome: "" });
    toast.success("Interview scheduled");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <Link to="/candidates" className="text-sm text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5">
          <ArrowLeft className="h-4 w-4" />Back to candidates
        </Link>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setEdit(true)}><Pencil className="mr-1.5 h-3.5 w-3.5" />Edit</Button>
          <Button variant="outline" size="sm" className="text-destructive hover:text-destructive" onClick={() => setDel(true)}><Trash2 className="mr-1.5 h-3.5 w-3.5" />Delete</Button>
        </div>
      </div>

      <Card className="p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10 text-primary text-lg font-semibold">
              {candidate.name.split(" ").map((n) => n[0]).slice(0, 2).join("")}
            </div>
            <div>
              <h1 className="text-2xl font-semibold tracking-tight">{candidate.name}</h1>
              <div className="text-sm text-muted-foreground">{candidate.role}</div>
              <div className="mt-2 flex flex-wrap gap-3 text-xs text-muted-foreground">
                <a href={`mailto:${candidate.email}`} className="inline-flex items-center gap-1.5 hover:text-foreground"><Mail className="h-3.5 w-3.5" />{candidate.email}</a>
                {candidate.phone && <span className="inline-flex items-center gap-1.5"><Phone className="h-3.5 w-3.5" />{candidate.phone}</span>}
                <span>Source: {candidate.source}</span>
                <span>Applied: {new Date(candidate.appliedAt).toLocaleDateString()}</span>
              </div>
              {candidate.tags.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {candidate.tags.map((t) => <Badge key={t} variant="secondary">{t}</Badge>)}
                </div>
              )}
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <Label className="text-xs text-muted-foreground">Current stage</Label>
            <Select value={candidate.stage} onValueChange={(v) => { setStage(candidate.id, v as Stage); toast.success(`Moved to ${v}`); }}>
              <SelectTrigger className={cn("w-[200px] border", STAGE_COLORS[candidate.stage])}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PIPELINE_STAGES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>
      </Card>

      <Tabs defaultValue="timeline" className="space-y-4">
        <TabsList>
          <TabsTrigger value="timeline"><Activity className="mr-1.5 h-3.5 w-3.5" />Timeline</TabsTrigger>
          <TabsTrigger value="interviews"><Calendar className="mr-1.5 h-3.5 w-3.5" />Interviews</TabsTrigger>
          <TabsTrigger value="notes"><MessageSquare className="mr-1.5 h-3.5 w-3.5" />Notes</TabsTrigger>
          <TabsTrigger value="applications"><FileText className="mr-1.5 h-3.5 w-3.5" />Applications</TabsTrigger>
        </TabsList>

        <TabsContent value="timeline">
          <Card className="p-5">
            <div className="space-y-4">
              {[...candidate.activity].reverse().map((a) => (
                <div key={a.id} className="flex gap-3">
                  <div className="mt-1 h-2 w-2 shrink-0 rounded-full bg-primary" />
                  <div className="flex-1">
                    <div className="text-sm">{a.message}</div>
                    <div className="text-xs text-muted-foreground inline-flex items-center gap-1 mt-0.5">
                      <Clock className="h-3 w-3" />{new Date(a.at).toLocaleString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="interviews">
          <div className="grid gap-4 md:grid-cols-2">
            <Card className="p-5 space-y-3">
              <div className="text-sm font-medium">Schedule new interview</div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Date</Label>
                  <Input type="date" value={iv.date} onChange={(e) => setIv({ ...iv, date: e.target.value })} />
                </div>
                <div>
                  <Label>Time</Label>
                  <Input type="time" value={iv.time} onChange={(e) => setIv({ ...iv, time: e.target.value })} />
                </div>
              </div>
              <div>
                <Label>Type</Label>
                <Select value={iv.type} onValueChange={(v) => setIv({ ...iv, type: v as InterviewType })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {INTERVIEW_TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Notes</Label>
                <Textarea rows={2} value={iv.notes} onChange={(e) => setIv({ ...iv, notes: e.target.value })} />
              </div>
              <div>
                <Label>Outcome (optional)</Label>
                <Input value={iv.outcome} onChange={(e) => setIv({ ...iv, outcome: e.target.value })} placeholder="e.g. Pass, Move forward, Pass on candidate" />
              </div>
              <Button onClick={submitIv} className="w-full">Schedule interview</Button>
            </Card>
            <Card className="p-5">
              <div className="text-sm font-medium mb-3">All interviews</div>
              <div className="space-y-3">
                {[...candidate.interviews].sort((a, b) => +new Date(b.date) - +new Date(a.date)).map((i) => (
                  <div key={i.id} className="rounded-lg border p-3">
                    <div className="flex items-center justify-between">
                      <div className="text-sm font-medium">{i.type}</div>
                      <div className="text-xs text-muted-foreground">{new Date(i.date).toLocaleString()}</div>
                    </div>
                    {i.notes && <div className="mt-1 text-xs text-muted-foreground">{i.notes}</div>}
                    {i.outcome && <Badge className="mt-2" variant="secondary">Outcome: {i.outcome}</Badge>}
                  </div>
                ))}
                {candidate.interviews.length === 0 && <div className="text-sm text-muted-foreground">No interviews yet.</div>}
              </div>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="notes">
          <Card className="p-5 space-y-3">
            <div className="text-sm font-medium">Add a note</div>
            <Textarea rows={3} value={note} onChange={(e) => setNote(e.target.value)} placeholder="Recruiter comments, feedback…" />
            <div className="flex justify-end"><Button onClick={submitNote}>Add note</Button></div>
            <div className="mt-2 space-y-2">
              {candidate.activity.filter((a) => a.kind === "note").reverse().map((n) => (
                <div key={n.id} className="rounded-md border bg-muted/30 p-3">
                  <div className="text-sm whitespace-pre-wrap">{n.message}</div>
                  <div className="text-xs text-muted-foreground mt-1">{new Date(n.at).toLocaleString()}</div>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="applications">
          <Card className="p-5">
            <div className="text-sm font-medium mb-3">Application history</div>
            <div className="divide-y">
              {candidate.applications.map((a, idx) => (
                <div key={idx} className="flex items-center justify-between py-2.5">
                  <div>
                    <div className="text-sm font-medium">{a.role}</div>
                    <div className="text-xs text-muted-foreground">via {a.source}</div>
                  </div>
                  <div className="text-xs text-muted-foreground">{new Date(a.appliedAt).toLocaleDateString()}</div>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>
      </Tabs>

      <CandidateFormDialog open={edit} onOpenChange={setEdit} candidate={candidate} />

      <AlertDialog open={del} onOpenChange={setDel}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this candidate?</AlertDialogTitle>
            <AlertDialogDescription>You can undo this from the top bar within the current session.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => { remove([candidate.id]); toast.success("Candidate deleted"); navigate("/candidates"); }}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export default CandidateProfile;
