import { useEffect, useState } from "react";
import { useAts } from "@/lib/ats-store";
import { PIPELINE_STAGES, SOURCES, DEPARTMENTS, type Candidate, type Department, type Source, type Stage } from "@/lib/ats-types";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

interface Props {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  candidate?: Candidate;
}

const empty = {
  name: "",
  email: "",
  phone: "",
  role: "",
  department: "Engineering" as Department,
  source: "Website" as Source,
  stage: "New Applicant" as Stage,
  resume: "",
  notes: "",
  tags: "",
  appliedAt: new Date().toISOString().slice(0, 10),
};

export function CandidateFormDialog({ open, onOpenChange, candidate }: Props) {
  const { add, update, findDuplicate, reapply } = useAts();
  const navigate = useNavigate();
  const [form, setForm] = useState(empty);
  const [dup, setDup] = useState<Candidate | null>(null);

  useEffect(() => {
    if (candidate) {
      setForm({
        name: candidate.name,
        email: candidate.email,
        phone: candidate.phone,
        role: candidate.role,
        department: candidate.department,
        source: candidate.source,
        stage: candidate.stage,
        resume: candidate.resume || "",
        notes: candidate.notes || "",
        tags: candidate.tags.join(", "),
        appliedAt: candidate.appliedAt.slice(0, 10),
      });
    } else {
      setForm(empty);
    }
  }, [candidate, open]);

  const set = <K extends keyof typeof form>(k: K, v: (typeof form)[K]) => setForm((f) => ({ ...f, [k]: v }));

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim() || !form.role.trim()) {
      toast.error("Name, email and role are required");
      return;
    }

    if (!candidate) {
      const existing = findDuplicate(form.email, form.phone);
      if (existing) {
        setDup(existing);
        return;
      }
    }

    persist();
  };

  const persist = () => {
    const tags = form.tags.split(",").map((t) => t.trim()).filter(Boolean);
    if (candidate) {
      update(
        candidate.id,
        {
          name: form.name,
          email: form.email,
          phone: form.phone,
          role: form.role,
          department: form.department,
          source: form.source,
          stage: form.stage,
          resume: form.resume,
          notes: form.notes,
          tags,
          appliedAt: new Date(form.appliedAt).toISOString(),
        },
        "Profile edited"
      );
      toast.success("Candidate updated");
    } else {
      const c = add({
        name: form.name,
        email: form.email,
        phone: form.phone,
        role: form.role,
        department: form.department,
        source: form.source,
        resume: form.resume,
        notes: form.notes,
        stage: form.stage,
        tags,
        appliedAt: new Date(form.appliedAt).toISOString(),
      });
      toast.success("Candidate added");
      onOpenChange(false);
      navigate(`/candidates/${c.id }`);
      return;
    }
    onOpenChange(false);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{candidate ? "Edit candidate" : "Add candidate"}</DialogTitle>
            <DialogDescription>
              {candidate ? "Update the candidate's profile." : "Capture a new applicant. Duplicates by email or phone will be detected."}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={submit} className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="md:col-span-2">
              <Label htmlFor="name">Full name</Label>
              <Input id="name" value={form.name} onChange={(e) => set("name", e.target.value)} required maxLength={120} />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={form.email} onChange={(e) => set("email", e.target.value)} required maxLength={255} />
            </div>
            <div>
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" value={form.phone} onChange={(e) => set("phone", e.target.value)} maxLength={40} />
            </div>
            <div>
              <Label htmlFor="role">Applied role</Label>
              <Input id="role" value={form.role} onChange={(e) => set("role", e.target.value)} required maxLength={120} />
            </div>
            <div>
              <Label>Department</Label>
              <Select value={form.department} onValueChange={(v) => set("department", v as Department)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {DEPARTMENTS.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Source</Label>
              <Select value={form.source} onValueChange={(v) => set("source", v as Source)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {SOURCES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Stage</Label>
              <Select value={form.stage} onValueChange={(v) => set("stage", v as Stage)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {PIPELINE_STAGES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="appliedAt">Application date</Label>
              <Input id="appliedAt" type="date" value={form.appliedAt} onChange={(e) => set("appliedAt", e.target.value)} />
            </div>
            <div className="md:col-span-2">
              <Label htmlFor="tags">Tags (comma separated)</Label>
              <Input id="tags" value={form.tags} onChange={(e) => set("tags", e.target.value)} placeholder="React, Senior, Urgent" />
            </div>
            <div className="md:col-span-2">
              <Label htmlFor="resume">Resume link</Label>
              <Input id="resume" value={form.resume} onChange={(e) => set("resume", e.target.value)} placeholder="https://..." />
            </div>
            <div className="md:col-span-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea id="notes" rows={3} value={form.notes} onChange={(e) => set("notes", e.target.value)} maxLength={2000} />
            </div>
            <DialogFooter className="md:col-span-2">
              <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
              <Button type="submit">{candidate ? "Save changes" : "Add candidate"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!dup} onOpenChange={(o) => !o && setDup(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Existing candidate found</AlertDialogTitle>
            <AlertDialogDescription>
              <span className="font-medium text-foreground">{dup?.name}</span> already exists ({dup?.email}). They previously applied for <span className="font-medium text-foreground">{dup?.role}</span>. Add this as a new application on their profile, or create a separate record?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <Button
              variant="outline"
              onClick={() => {
                if (!dup) return;
                setDup(null);
                onOpenChange(false);
                persist();
              }}
            >
              Create new record
            </Button>
            <AlertDialogAction
              onClick={() => {
                if (!dup) return;
                reapply(dup.id, form.role, form.source);
                toast.success("Application added to existing candidate");
                const id = dup.id;
                setDup(null);
                onOpenChange(false);
                navigate(`/candidates/${id}`);
              }}
            >
              Update existing
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
