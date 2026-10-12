const API_URL =
  process.env.NEXT_PUBLIC_POTUS_API_URL?.replace(/\/$/, "") ??
  "http://127.0.0.1:8000";

export type DemoScenario = "A" | "B" | "C" | "D" | "E" | "F";

export type AccessRequest = {
  wallet: string;
  resource_id?: string;
  action?: string;
  session?: Record<string, string>;
  demo_scenario?: DemoScenario;
  simulate_ai_outage?: boolean;
};

export type CustomerPayload = {
  request_id: string;
  decision: string;
  status: string;
  title: string;
  message: string;
  next_action: string;
  support_code: string;
};

export type Signals = {
  anomaly_score: number;
  rule_score: number;
  pattern_similarity: number;
  gemini: {
    category: string;
    confidence: number;
    semantic_risk: number;
  } | null;
  gemini_status: string;
};

export type AccessEvaluation = {
  request_id: string;
  wallet: string;
  resource_id: string;
  action: string;
  risk_score: number;
  decision: "ALLOW" | "CHALLENGE" | "REVIEW" | "RESTRICT";
  expires_at: string;
  signals: Signals;
  reason_codes: string[];
  customer: CustomerPayload;
  evidence_hash: string;
  onchain: Record<string, unknown>;
  simulated: boolean;
  wallet_verified: boolean;
  access_token: string | null;
};

export type WalletNonce = {
  wallet: string;
  nonce: string;
  message: string;
  expires_at: string;
};

export type AccessChallenge = {
  request_id: string;
  nonce: string;
  message: string;
  expires_at: string;
};

export type ChallengeVerification = {
  nonce: string;
  signature: string;
};

async function apiRequest<T>(
  path: string,
  init: RequestInit = {},
): Promise<T> {
  let response: Response;

  try {
    response = await fetch(`${API_URL}${path}`, {
      ...init,
      headers: {
        "Content-Type": "application/json",
        ...init.headers,
      },
      cache: "no-store",
    });
  } catch {
    throw new Error(
      `Cannot reach the POTUS API at ${API_URL}. Check that the backend is running and allows requests from this frontend.`,
    );
  }

  if (!response.ok) {
    const body = await response.json().catch(() => null);
    const detail = body?.detail;

    throw new Error(
      typeof detail === "string"
        ? detail
        : `POTUS API request failed (${response.status})`,
    );
  }

  return (await response.json()) as T;
}

export function requestAccess(
  request: AccessRequest,
): Promise<AccessEvaluation> {
  return apiRequest<AccessEvaluation>("/access/request", {
    method: "POST",
    body: JSON.stringify(request),
  });
}

export function getWalletNonce(
  wallet: string,
): Promise<WalletNonce> {
  return apiRequest<WalletNonce>(
    `/auth/nonce?wallet=${encodeURIComponent(wallet)}`,
    { method: "GET" },
  );
}

export function getAccessChallenge(
  requestId: string,
): Promise<AccessChallenge> {
  return apiRequest<AccessChallenge>(
    `/access/${encodeURIComponent(requestId)}/challenge`,
    { method: "GET" },
  );
}

export function verifyAccessChallenge(
  requestId: string,
  verification: ChallengeVerification,
): Promise<Record<string, unknown>> {
  return apiRequest<Record<string, unknown>>(
    `/access/${encodeURIComponent(requestId)}/verify`,
    {
      method: "POST",
      body: JSON.stringify(verification),
    },
  );
}
