import { type Candidate } from "@/types/ats-types";
import { API_BASE_URL } from "@/config/api";

const API_URL = `${API_BASE_URL}/candidates/candidates.php`;

export async function fetchCandidatesAPI(): Promise<Candidate[]> {
  const r = await fetch(API_URL, { credentials: 'include' });
  if (!r.ok) throw new Error(await r.text());
  const data = await r.json();
  if (Array.isArray(data)) return data;
  return [];
}

export async function postCandidateAPI(cand: Candidate): Promise<void> {
  const res = await fetch(API_URL, { credentials: 'include', 
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(cand),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || "Failed to add candidate");
  }
}

export async function putCandidateAPI(c: Candidate): Promise<void> {
  const res = await fetch(`${API_URL}?id=${c.id}`, { credentials: 'include', 
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(c),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || "Failed to update database");
  }
}

export async function deleteCandidatesAPI(ids: string[]): Promise<void> {
  const res = await fetch(API_URL, { credentials: 'include', 
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ids }),
  });
  if (!res.ok) throw new Error("Failed to delete from database");
}

export async function bulkUndoSyncAPI(candidates: Candidate[]): Promise<void> {
  await fetch(API_URL, { credentials: 'include', 
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ bulk: true, candidates }),
  }).catch(console.error);
}
