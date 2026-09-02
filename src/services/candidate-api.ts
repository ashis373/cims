import { type Candidate } from "@/types/ats-types";
import { API_BASE_URL } from "@/config/api";

const API_URL = `${API_BASE_URL}/candidates/candidates.php`;

export function getAuthHeaders(includeContentType = true) {
  const headers: Record<string, string> = {};
  if (includeContentType) headers["Content-Type"] = "application/json";
  try {
    const token = localStorage.getItem("cims_token");
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
  } catch (e) { }
  return headers;
}

export async function fetchCandidatesAPI(): Promise<Candidate[]> {
  const r = await fetch(API_URL, {
    credentials: 'include',
    headers: getAuthHeaders(false)
  });
  if (!r.ok) {
    const err = await r.json().catch(() => ({}));
    throw new Error(err.message || err.error || "Failed to load candidates");
  }
  const data = await r.json();
  if (Array.isArray(data)) return data;
  return [];
}

export async function postCandidateAPI(cand: Candidate): Promise<void> {
  const res = await fetch(API_URL, {
    credentials: 'include',
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(cand),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || err.error || "Failed to add candidate");
  }
}

export async function putCandidateAPI(c: Candidate): Promise<void> {
  const res = await fetch(`${API_URL}?id=${c.id}`, {
    credentials: 'include',
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify(c),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || err.error || "Failed to update database");
  }
}

export async function deleteCandidatesAPI(ids: string[]): Promise<void> {
  const res = await fetch(API_URL, {
    credentials: 'include',
    method: "DELETE",
    headers: getAuthHeaders(),
    body: JSON.stringify({ ids }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || err.error || "Failed to delete from database");
  }
}

export async function bulkUndoSyncAPI(candidates: Candidate[]): Promise<void> {
  await fetch(API_URL, {
    credentials: 'include',
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({ bulk: true, candidates }),
  }).catch(console.error);
}

export async function postInterviewAPI(interview: any): Promise<void> {
  const res = await fetch(`${API_BASE_URL}/candidates/interviews.php`, {
    credentials: 'include',
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(interview),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || err.error || "Failed to add interview");
  }
}

export async function putInterviewAPI(id: string, patch: any): Promise<void> {
  const res = await fetch(`${API_BASE_URL}/candidates/interviews.php?id=${id}`, {
    credentials: 'include',
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify(patch),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || err.error || "Failed to update interview");
  }
}
