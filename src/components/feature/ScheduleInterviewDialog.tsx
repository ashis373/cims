import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { INTERVIEW_TYPES, type Candidate } from "@/types/ats-types";
import { useAts } from "@/services/ats-store";
import { toast } from "sonner";
import { Calendar, CheckCircle2, User, Clock, Video } from "lucide-react";

interface ScheduleInterviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  candidate: Candidate | null;
  mode?: "schedule" | "complete" | "update" | "feedback";
  existingInterview?: any | null;
  onSuccess?: () => void;
}

export function ScheduleInterviewDialog({
  open,
  onOpenChange,
  candidate,
  mode = "schedule",
  existingInterview = null,
  onSuccess,
}: ScheduleInterviewDialogProps) {
  const { addInterview, updateInterview, refresh } = useAts();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Helpers for current date & time
  const getNowFormatted = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    const hours = String(now.getHours()).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");
    
    // Default end time +1 hour
    const endHour = String((now.getHours() + 1) % 24).padStart(2, "0");

    return {
      date: `${year}-${month}-${day}`,
      time: `${hours}:${minutes}`,
      endTime: `${endHour}:${minutes}`
    };
  };

  const [form, setForm] = useState(() => {
    const nowInit = getNowFormatted();
    return {
      type: "Technical",
      status: mode === "complete" ? "Completed" : "Scheduled",
      date: nowInit.date,
      time: nowInit.time,
      end_time: nowInit.endTime,
      mode: "Online",
      interviewers: "",
      meeting_link: "",
      location: "",
      result: "Passed",
      feedback: "",
      comments: "",
      rating: 4,
      recommendation: "Strong Hire",
      notes: "",
    };
  });

  useEffect(() => {
    if (open) {
      const nowDefaults = getNowFormatted();
      if (existingInterview) {
        let dateVal = "";
        let timeVal = nowDefaults.time;
        if (existingInterview.interviewDate || existingInterview.date) {
          const raw = existingInterview.interviewDate || existingInterview.date;
          try {
            const d = new Date(raw);
            if (!isNaN(d.getTime())) {
              const yr = d.getFullYear();
              const mo = String(d.getMonth() + 1).padStart(2, "0");
              const da = String(d.getDate()).padStart(2, "0");
              const hr = String(d.getHours()).padStart(2, "0");
              const mi = String(d.getMinutes()).padStart(2, "0");
              dateVal = `${yr}-${mo}-${da}`;
              timeVal = `${hr}:${mi}`;
            }
          } catch (e) {}
        }
        if (!dateVal) dateVal = nowDefaults.date;

        setForm({
          type: existingInterview.type || "Technical",
          status: mode === "complete" ? "Completed" : (existingInterview.status || "Scheduled"),
          date: dateVal,
          time: timeVal,
          end_time: existingInterview.end_time || nowDefaults.endTime,
          mode: existingInterview.mode || "Online",
          interviewers: existingInterview.interviewers || existingInterview.interviewer || "",
          meeting_link: existingInterview.meeting_link || "",
          location: existingInterview.location || "",
          result: existingInterview.result || (existingInterview.recommendation === "Do Not Hire" ? "Failed" : "Passed"),
          feedback: existingInterview.feedback || "",
          comments: existingInterview.comments || "",
          rating: existingInterview.rating ? Number(existingInterview.rating) : 4,
          recommendation: existingInterview.recommendation || "Strong Hire",
          notes: existingInterview.notes || "",
        });
      } else {
        setForm({
          type: "Technical",
          status: mode === "complete" ? "Completed" : "Scheduled",
          date: nowDefaults.date,
          time: nowDefaults.time,
          end_time: nowDefaults.endTime,
          mode: "Online",
          interviewers: candidate?.recruiter || "",
          meeting_link: "",
          location: "",
          result: "Passed",
          feedback: "",
          comments: "",
          rating: 4,
          recommendation: "Strong Hire",
          notes: "",
        });
      }
    }
  }, [open, candidate, mode, existingInterview]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!candidate) return;

    if (!form.date) {
      toast.error("Please select an interview date");
      return;
    }

    // Validation rule: When scheduling a new interview, do not allow dates in the past
    if (!existingInterview && mode === "schedule") {
      const todayStr = getNowFormatted().date;
      if (form.date < todayStr) {
        toast.error("Interview date cannot be set in the past. Please select today or a future date.");
        return;
      }
    }

    if (!form.interviewers.trim()) {
      toast.error("Please specify at least one interviewer");
      return;
    }

    setIsSubmitting(true);
    try {
      const fullDateTime = `${form.date}T${form.time || "10:00"}:00`;
      
      const payload = {
        type: form.type,
        interviewDate: fullDateTime,
        date: fullDateTime,
        end_time: form.end_time ? `${form.date}T${form.end_time}:00` : undefined,
        mode: form.mode,
        interviewers: form.interviewers,
        interviewer: form.interviewers,
        meeting_link: form.meeting_link,
        location: form.location,
        notes: form.notes,
        status: mode === "feedback" ? "Completed" : form.status,
        result: form.result,
        feedback: form.feedback,
        comments: form.comments,
        rating: form.rating,
        recommendation: form.recommendation,
      };

      if (existingInterview?.id) {
        await updateInterview(candidate.id, String(existingInterview.id), payload);
        toast.success(
          mode === "feedback"
            ? `Feedback saved for ${candidate.name}!`
            : mode === "complete" || form.status === "Completed"
            ? `Interview completed for ${candidate.name}!`
            : `Interview updated successfully!`
        );
      } else {
        await addInterview(candidate.id, payload);
        toast.success(`Interview scheduled for ${candidate.name}!`);
      }

      await refresh();
      onOpenChange(false);
      if (onSuccess) onSuccess();
    } catch (err: any) {
      toast.error(err.message || "Failed to save interview details");
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFeedbackOnly = mode === "feedback";
  const isCompletedMode = mode === "complete" || form.status === "Completed" || isFeedbackOnly;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl p-6 bg-white rounded-3xl shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
        <DialogHeader className="pb-3 border-b border-slate-100">
          <DialogTitle className="text-lg font-black text-slate-900 flex items-center gap-2">
            {isFeedbackOnly ? (
              <>
                <CheckCircle2 className="w-5 h-5 text-purple-600" />
                Add Interview Feedback
              </>
            ) : isCompletedMode ? (
              <>
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                Update / Complete Interview
              </>
            ) : (
              <>
                <Calendar className="w-5 h-5 text-indigo-600" />
                Schedule Interview
              </>
            )}
          </DialogTitle>
        </DialogHeader>

        {candidate && (
          <form onSubmit={handleSubmit} className="space-y-4 pt-2">
            {/* Candidate summary banner */}
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between text-xs">
              <div>
                <span className="font-bold text-slate-900 text-sm block">{candidate.name}</span>
                <span className="text-slate-500 font-medium">{candidate.role} {candidate.department ? `• ${candidate.department}` : ''}</span>
              </div>
              <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-100 px-2.5 py-1 rounded-md">
                Current: {candidate.stage}
              </span>
            </div>

            {/* If in Feedback-Only mode, show original interview details as protected read-only card */}
            {isFeedbackOnly ? (
              <div className="p-4 bg-slate-50/80 rounded-2xl border border-slate-100 space-y-3 text-[12px]">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Interview Details (Protected)</span>
                  <span className="text-[10px] font-bold bg-purple-50 text-purple-700 px-2 py-0.5 rounded-full border border-purple-100">
                    {form.status || "Completed"}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-slate-700">
                  <div>
                    <span className="text-[10px] font-semibold text-slate-400 block">Stage & Round</span>
                    <strong className="text-slate-900">{form.type} Round</strong>
                  </div>
                  <div>
                    <span className="text-[10px] font-semibold text-slate-400 block">Date & Time</span>
                    <strong className="text-slate-900">{form.date} at {form.time}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] font-semibold text-slate-400 block">Mode</span>
                    <strong className="text-slate-900">{form.mode}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] font-semibold text-slate-400 block">Interviewer</span>
                    <strong className="text-slate-900">{form.interviewers || "Unassigned"}</strong>
                  </div>
                  {form.meeting_link && (
                    <div className="col-span-2">
                      <span className="text-[10px] font-semibold text-slate-400 block">Meeting Link / Location</span>
                      <span className="text-blue-600 font-bold truncate block">{form.meeting_link}</span>
                    </div>
                  )}
                  {form.notes && (
                    <div className="col-span-2">
                      <span className="text-[10px] font-semibold text-slate-400 block">Internal Notes</span>
                      <span className="text-slate-600 font-medium block">{form.notes}</span>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                {/* Interview Stage */}
                <div className="space-y-1.5">
                  <Label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">Interview Stage</Label>
                  <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v })}>
                    <SelectTrigger className="h-9 text-[12px] font-semibold bg-white border-slate-200">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {INTERVIEW_TYPES.map((t) => (
                        <SelectItem key={t} value={t} className="text-[12px] font-medium">
                          {t}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Status */}
                <div className="space-y-1.5">
                  <Label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">Status</Label>
                  <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                    <SelectTrigger className="h-9 text-[12px] font-semibold bg-white border-slate-200">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Scheduled" className="text-[12px]">Scheduled</SelectItem>
                      <SelectItem value="Completed" className="text-[12px]">Completed</SelectItem>
                      <SelectItem value="Rescheduled" className="text-[12px]">Rescheduled</SelectItem>
                      <SelectItem value="Cancelled" className="text-[12px]">Cancelled</SelectItem>
                      <SelectItem value="No Show" className="text-[12px]">No Show</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Interview Date */}
                <div className="space-y-1.5">
                  <Label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">Interview Date *</Label>
                  <Input
                    type="date"
                    required
                    min={mode === "schedule" && !existingInterview ? getNowFormatted().date : undefined}
                    value={form.date}
                    onChange={(e) => setForm({ ...form, date: e.target.value })}
                    className="h-9 text-[12px] font-semibold bg-white border-slate-200"
                  />
                </div>

                {/* Interview Time */}
                <div className="space-y-1.5">
                  <Label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">Time</Label>
                  <Input
                    type="time"
                    value={form.time}
                    onChange={(e) => setForm({ ...form, time: e.target.value })}
                    className="h-9 text-[12px] font-semibold bg-white border-slate-200"
                  />
                </div>

                {/* Mode */}
                <div className="space-y-1.5">
                  <Label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">Mode</Label>
                  <Select value={form.mode} onValueChange={(v) => setForm({ ...form, mode: v })}>
                    <SelectTrigger className="h-9 text-[12px] font-semibold bg-white border-slate-200">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Online" className="text-[12px]">Online</SelectItem>
                      <SelectItem value="Offline" className="text-[12px]">Offline</SelectItem>
                      <SelectItem value="Phone" className="text-[12px]">Phone</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Interviewers */}
                <div className="space-y-1.5">
                  <Label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">Interviewer(s) *</Label>
                  <Input
                    required
                    value={form.interviewers}
                    onChange={(e) => setForm({ ...form, interviewers: e.target.value })}
                    placeholder="e.g. John Doe, Sarah Smith"
                    className="h-9 text-[12px] font-semibold bg-white border-slate-200"
                  />
                </div>

                {/* Meeting Link / Location */}
                <div className="col-span-2 space-y-1.5">
                  <Label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">Meeting Link / Location</Label>
                  <Input
                    value={form.meeting_link || form.location}
                    onChange={(e) => setForm({ ...form, meeting_link: e.target.value, location: e.target.value })}
                    placeholder="Zoom / Google Meet link or Conference Room A"
                    className="h-9 text-[12px] font-semibold bg-white border-slate-200"
                  />
                </div>

                {/* Internal Notes */}
                <div className="col-span-2 space-y-1.5">
                  <Label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">Internal Notes</Label>
                  <Textarea
                    value={form.notes}
                    onChange={(e) => setForm({ ...form, notes: e.target.value })}
                    placeholder="Notes for HR and hiring team..."
                    className="h-16 text-[12px] font-medium bg-white border-slate-200 resize-none"
                  />
                </div>
              </div>
            )}

            {/* Evaluation & Feedback Section (Editable) */}
            {isCompletedMode && (
              <div className="pt-2 border-t border-slate-100 space-y-3">
                <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Interview Evaluation</div>
                <div className="grid grid-cols-3 gap-3">
                  {/* Result */}
                  <div className="space-y-1.5">
                    <Label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">Result</Label>
                    <Select value={form.result} onValueChange={(v) => setForm({ ...form, result: v })}>
                      <SelectTrigger className="h-9 text-[12px] font-semibold bg-white border-slate-200">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Passed" className="text-[12px] font-semibold text-emerald-600">Passed</SelectItem>
                        <SelectItem value="Failed" className="text-[12px] font-semibold text-red-600">Failed</SelectItem>
                        <SelectItem value="Pending" className="text-[12px] font-semibold text-amber-600">Pending</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Recommendation */}
                  <div className="space-y-1.5">
                    <Label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">Recommendation</Label>
                    <Select value={form.recommendation} onValueChange={(v) => setForm({ ...form, recommendation: v })}>
                      <SelectTrigger className="h-9 text-[12px] font-semibold bg-white border-slate-200">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Strong Hire" className="text-[12px]">Strong Hire</SelectItem>
                        <SelectItem value="Hire" className="text-[12px]">Hire</SelectItem>
                        <SelectItem value="Hold" className="text-[12px]">Hold</SelectItem>
                        <SelectItem value="Do Not Hire" className="text-[12px]">Do Not Hire</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Rating */}
                  <div className="space-y-1.5">
                    <Label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">Rating (Stars)</Label>
                    <Select value={String(form.rating)} onValueChange={(v) => setForm({ ...form, rating: Number(v) })}>
                      <SelectTrigger className="h-9 text-[12px] font-semibold bg-white border-slate-200">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="5" className="text-[12px]">⭐⭐⭐⭐⭐ (5)</SelectItem>
                        <SelectItem value="4" className="text-[12px]">⭐⭐⭐⭐ (4)</SelectItem>
                        <SelectItem value="3" className="text-[12px]">⭐⭐⭐ (3)</SelectItem>
                        <SelectItem value="2" className="text-[12px]">⭐⭐ (2)</SelectItem>
                        <SelectItem value="1" className="text-[12px]">⭐ (1)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">Feedback Summary</Label>
                  <Input
                    value={form.feedback}
                    onChange={(e) => setForm({ ...form, feedback: e.target.value })}
                    placeholder="Brief summary of candidate performance..."
                    className="h-9 text-[12px] font-semibold bg-white border-slate-200"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">Interviewer Comments</Label>
                  <Textarea
                    value={form.comments}
                    onChange={(e) => setForm({ ...form, comments: e.target.value })}
                    placeholder="Detailed feedback and interview scorecard notes..."
                    className="h-20 text-[12px] font-medium bg-white border-slate-200 resize-none"
                  />
                </div>
              </div>
            )}

            <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="text-xs font-bold rounded-xl"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="btn-primary hover:opacity-95 text-white text-xs font-bold rounded-xl px-5"
              >
                {isSubmitting
                  ? "Saving..."
                  : isFeedbackOnly
                  ? "Save Feedback"
                  : isCompletedMode
                  ? "Save Changes"
                  : "Schedule Interview"}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
