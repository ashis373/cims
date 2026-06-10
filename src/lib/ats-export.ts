import * as XLSX from "xlsx";
import type { Candidate } from "./ats-types";

function flatten(c: Candidate) {
  const nextIv = [...c.interviews].sort((a, b) => +new Date(b.date) - +new Date(a.date))[0];
  return {
    Name: c.name,
    Email: c.email,
    Phone: c.phone,
    Role: c.role,
    Department: c.department,
    Source: c.source,
    Stage: c.stage,
    Tags: c.tags.join(", "),
    "Applied At": new Date(c.appliedAt).toLocaleDateString(),
    "Last Updated": new Date(c.updatedAt).toLocaleDateString(),
    "Applications Count": c.applications.length,
    "Interviews Count": c.interviews.length,
    "Latest Interview": nextIv ? `${nextIv.type} – ${new Date(nextIv.date).toLocaleString()}` : "",
    "Latest Outcome": nextIv?.outcome || "",
    Notes: c.notes || "",
    Resume: c.resume || "",
  };
}

export function exportXlsx(candidates: Candidate[], filename = "candidates.xlsx") {
  const ws = XLSX.utils.json_to_sheet(candidates.map(flatten));
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Candidates");
  XLSX.writeFile(wb, filename);
}

export function exportCsv(candidates: Candidate[], filename = "candidates.csv") {
  const ws = XLSX.utils.json_to_sheet(candidates.map(flatten));
  const csv = XLSX.utils.sheet_to_csv(ws);
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
  URL.revokeObjectURL(link.href);
}

export function exportBossReport(candidates: Candidate[], filename = "hiring-report.xlsx") {
  const wb = XLSX.utils.book_new();

  // Summary
  const byStage = candidates.reduce<Record<string, number>>((acc, c) => {
    acc[c.stage] = (acc[c.stage] || 0) + 1;
    return acc;
  }, {});
  const bySource = candidates.reduce<Record<string, number>>((acc, c) => {
    acc[c.source] = (acc[c.source] || 0) + 1;
    return acc;
  }, {});
  const byRole = candidates.reduce<Record<string, number>>((acc, c) => {
    acc[c.role] = (acc[c.role] || 0) + 1;
    return acc;
  }, {});

  const summaryRows = [
    ["Hiring Pipeline Report"],
    ["Generated", new Date().toLocaleString()],
    [],
    ["Total Candidates", candidates.length],
    [],
    ["By Stage"],
    ...Object.entries(byStage).map(([k, v]) => [k, v]),
    [],
    ["By Source"],
    ...Object.entries(bySource).map(([k, v]) => [k, v]),
    [],
    ["By Role"],
    ...Object.entries(byRole).map(([k, v]) => [k, v]),
  ];
  const summary = XLSX.utils.aoa_to_sheet(summaryRows);
  summary["!cols"] = [{ wch: 32 }, { wch: 18 }];
  XLSX.utils.book_append_sheet(wb, summary, "Summary");

  const detail = XLSX.utils.json_to_sheet(candidates.map(flatten));
  detail["!cols"] = Object.keys(flatten(candidates[0] || ({} as Candidate))).map(() => ({
    wch: 22,
  }));
  XLSX.utils.book_append_sheet(wb, detail, "Candidates");

  XLSX.writeFile(wb, filename);
}
