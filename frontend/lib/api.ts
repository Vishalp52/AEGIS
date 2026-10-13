export type DemoScenario = "A" | "B" | "C" | "D" | "E" | "F";
export type Decision = "ALLOW" | "CHALLENGE" | "REVIEW" | "RESTRICT" | "RESOLVED";
export type Customer = { request_id: string; decision: Decision; status: string; title: string; message: string; next_action: string; support_code: string };
export type Evaluation = { request_id: string; wallet: string; decision: Decision; customer: Customer; access_token: string | null; simulated: boolean };
export type Scenario = { key: DemoScenario; name: string; wallet: string; description: string; expected: string; simulated: boolean };
export type CaseRow = { case_id: string; wallet: string; created_at: string; decision: Decision; risk_score: number; status: string; scenario: string | null };
export type Triage = { category: string; confidence: number; semantic_risk: number; supporting_indicators: string[]; benign_explanations: string[]; employee_summary: string; requires_human_review: boolean };
export type CasePacket = {
  case_header: CaseRow & { simulated: boolean; ttl_seconds: number; resource_id: string; timestamp: string };
  summary_card: string;
  risk_summary: { risk_score: number; severity: string; components: Record<string, { value_100: number; weight: number; points: number }> };
  behavior_deltas: { feature: string; value: number; baseline: number; ratio: number | null; population_z: number }[];
  hard_flags: string[]; gemini_triage: Triage | null; gemini_status: string;
  threat_memory: { closest_incident: string | null; similarity: number; simulated: boolean | null };
  policy_trace: { reason_codes: string[]; guardrails: string[]; thresholds: Record<string, number>; weights: Record<string, number> };
  timeline: { data_source: string; notes: string[]; recent_transactions: Record<string, unknown>[]; access_attempts: { at: string; decision: string }[] };
  evidence: { evidence_hash: string; onchain: { status?: string; tx_hash?: string; explorer_url?: string; error?: string } };
  audit: { reviews: { reviewer: string; disposition: string; note: string; at: string }[]; events: { actor: string; event: string; at: string }[] };
  customer_view: Customer; actions: string[];
};

export async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const response = await fetch(path, { ...init, headers: { "Content-Type": "application/json", ...init.headers }, cache: "no-store" });
  const body = await response.json();
  if (!response.ok) throw new Error(typeof body.detail === "string" ? body.detail : `Request failed (${response.status})`);
  return body as T;
}
export const api = <T,>(path: string, init?: RequestInit) => request<T>(`/api/aegis${path}`, init);
export const post = (body: unknown): RequestInit => ({ method: "POST", body: JSON.stringify(body) });
