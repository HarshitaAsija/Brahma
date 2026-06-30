const BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8001/api/v1";;

export interface Paper {
  id: number;
  title: string;
  abstract: string;
  full_text: string | null;
  authors: string[] | Record<string, unknown> | string;
  journal: string;
  publication_date: string;
  doi: string | null;
  pmid: string | null;
  url: string;
  source: string | null;
  open_access: string | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface PaperListResponse {
  total: number;
  page: number;
  page_size: number;
  results: Paper[];
}

export async function fetchPapers(
  page = 1,
  pageSize = 50
): Promise<PaperListResponse> {
  const res = await fetch(`${BASE_URL}/papers/?page=${page}&page_size=${pageSize}`);

  if (!res.ok) {
    throw new Error(`Failed to fetch papers: ${res.status}`);
  }

  return res.json();
}

export async function fetchPaperById(id: number): Promise<Paper> {
  const res = await fetch(`${BASE_URL}/papers/${id}`);

  if (!res.ok) {
    throw new Error(`Failed to fetch paper ${id}: ${res.status}`);
  }

  return res.json();
}
export interface PaperEntity {
  entity_id: number;
  canonical_name: string;
  entity_type: string;
  section: string;
  evidence_text: string;
}

export async function extractEntities(paperId: number) {
  const res = await fetch(`${BASE_URL}/papers/${paperId}/extract-entities`, {
    method: "POST",
  });

  if (!res.ok) {
    throw new Error(`Failed to extract entities: ${res.status}`);
  }

  return res.json();
}

export async function fetchPaperEntities(paperId: number): Promise<PaperEntity[]> {
  const res = await fetch(`${BASE_URL}/papers/${paperId}/entities`);

  if (!res.ok) {
    throw new Error(`Failed to fetch entities: ${res.status}`);
  }

  return res.json();
}
