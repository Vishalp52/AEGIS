"use client";
import Link from "next/link";
import Image from "next/image";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { api, post, type Customer, type Evaluation, type Scenario } from "@/lib/api";
import { connectWallet, networkName, signMessage } from "@/lib/wallet";

type Vault = { data: { title: string; records: { id: string; dataset: string; rows: number }[] } };
const readable = (error: unknown) => error instanceof Error ? error.message : "The request could not be completed.";

export type WalletSession = { address: string; controls: ReactNode; sign: (wallet: string, message: string) => Promise<string> };

export default function VaultHome({ session }: { session?: WalletSession }) {
  const revision = useRef(0);
  const [extensionWallet, setWallet] = useState("");
  const wallet = session ? session.address : extensionWallet;
  const sign = session ? session.sign : signMessage;
  const [mode, setMode] = useState<"live" | "demo">("live");
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [scenario, setScenario] = useState("A");
  const [result, setResult] = useState<Evaluation | null>(null);
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [vault, setVault] = useState<Vault | null>(null);
  const [busy, setBusy] = useState("");
  const [error, setError] = useState("");
  const [online, setOnline] = useState(false);

  useEffect(() => {
    api<{ status: string }>("/health").then(() => setOnline(true)).catch(() => setOnline(false));
    api<{ scenarios: Scenario[] }>("/demo/scenarios").then(value => { setScenarios(value.scenarios); setMode("demo"); }).catch(() => {});
  }, []);

  useEffect(() => {
    const reset = () => { revision.current++; setWallet(""); setToken(null); setVault(null); setResult(null); setCustomer(null); };
    if (session) return;
    window.ethereum?.on?.("accountsChanged", reset);
    window.ethereum?.on?.("chainChanged", reset);
    window.ethereum?.on?.("disconnect", reset);
    return () => { window.ethereum?.removeListener?.("accountsChanged", reset); window.ethereum?.removeListener?.("chainChanged", reset); window.ethereum?.removeListener?.("disconnect", reset); };
  }, [wallet, session]);

  async function task(label: string, action: () => Promise<void>) {
    setBusy(label); setError("");
    try { await action(); } catch (error) { setError(readable(error)); } finally { setBusy(""); }
  }
  function clear() { revision.current++; setResult(null); setCustomer(null); setToken(null); setVault(null); }
  async function evaluate() {
    clear();
    const current = revision.current;
    const address = wallet || (mode === "demo" ? scenarios.find(item => item.key === scenario)?.wallet : null);
    if (!address) throw new Error("Connect your wallet first.");
    let proof = {};
    if (wallet) {
      const nonce = await api<{ nonce: string; message: string }>(`/auth/nonce?wallet=${wallet}`);
      proof = { nonce: nonce.nonce, signature: await sign(wallet, nonce.message) };
    }
    const evaluation = await api<Evaluation>("/access/request", post({ wallet: address, resource_id: "research-vault", action: "read", ...proof, ...(mode === "demo" ? { demo_scenario: scenario } : {}) }));
    if (current !== revision.current) return;
    setResult(evaluation); setCustomer(evaluation.customer); setToken(evaluation.access_token);
  }
  async function verify() {
    if (!result || !wallet || wallet !== result.wallet.toLowerCase()) throw new Error("Connect the same wallet used for this request. For a demo challenge, connect first and run the scenario again.");
    const current = revision.current;
    const resume = customer?.decision === "RESOLVED";
    const challenge = await api<{ nonce: string; message: string }>(`/access/${result.request_id}/${resume ? "resume" : "challenge"}`);
    const verified = await api<Customer & { access_token: string }>(`/access/${result.request_id}/${resume ? "resume" : "verify"}`, post({ nonce: challenge.nonce, signature: await sign(wallet, challenge.message) }));
    if (current !== revision.current) return;
    setCustomer(verified); setToken(verified.access_token);
  }

  return <main className="shell">
    <header className="topbar"><Link href="/" className="brand"><Image className="brand-symbol" src="/brand/aegis-mark.svg" width={36} height={36} alt=""/><Image className="brand-wordmark" src="/brand/aegis-wordmark.svg" width={124} height={28} alt="AEGIS"/> <small>BEHAVIORAL SECURITY</small></Link><nav><span className={`status ${online ? "good" : "muted"}`}>{online ? "Security service online" : "Service offline"}</span><Link href="/employee">Employee console ↗</Link></nav></header>
    <section className="hero"><div><p className="eyebrow">MONAD · CONTINUOUS AUTHORIZATION</p><h1>Your wallet.<br/><span>A second layer of trust.</span></h1><p className="lede">Access a protected research vault through behavior-based security. Every decision has evidence, a clear next step, and a path to human review.</p></div><div className="identity-visual" aria-hidden="true"><span className="visual-label">AEGIS / SECURITY INFRASTRUCTURE</span><Image src="/brand/aegis-mark.svg" width={240} height={240} alt="" preload/><span className="visual-coordinate">WALLET PROOF + BEHAVIORAL INTELLIGENCE</span></div></section>
    <div className="workspace">
      <section className="panel"><div className="panel-heading"><div><p className="eyebrow">01 · REQUEST ACCESS</p><h2>Research Data Vault</h2></div><span className="chip">Protected resource</span></div>
        <p className="muted">{networkName} · Wallet signatures prove ownership. The security engine evaluates the evidence before granting access.</p>
        {scenarios.length > 0 && <div className="segmented" aria-label="Evidence mode"><button className={mode === "demo" ? "active" : ""} onClick={() => { setMode("demo"); clear(); }} disabled={!!busy}>Simulated replay</button><button className={mode === "live" ? "active" : ""} onClick={() => { setMode("live"); clear(); }} disabled={!!busy}>Live wallet</button></div>}
        {mode === "demo" && <div className="field"><label htmlFor="scenario">Choose a replay scenario</label><select id="scenario" value={scenario} disabled={!!busy} onChange={event => { setScenario(event.target.value); clear(); }}>{scenarios.map(item => <option key={item.key} value={item.key}>{item.key} · {item.name}</option>)}</select><p className="hint">SIMULATED · {scenarios.find(item => item.key === scenario)?.description}</p></div>}
        <div className="wallet-row"><span className="mono">{wallet ? `${wallet.slice(0, 8)}…${wallet.slice(-6)}` : "No wallet connected"}</span>{session ? session.controls : <button className="secondary" disabled={!!busy} onClick={() => task("Connecting wallet", async () => { const account = await connectWallet(); clear(); setWallet(account); })}>{wallet ? "Change wallet" : "Connect wallet"}</button>}</div>
        {mode === "demo" && !wallet && <p className="hint">Replay works without a wallet. Connect one before starting to complete a signature challenge.</p>}
        <button className="primary wide" disabled={!!busy || !online || (mode === "live" && !wallet)} onClick={() => task("Evaluating access", evaluate)}>{busy || "Request vault access →"}</button>
        {error && <p role="alert" className="error">{error}</p>}
      </section>
      <section className="panel decision-panel" aria-live="polite"><p className="eyebrow">02 · YOUR SECURITY STATUS</p>{customer ? <><span className={`decision ${customer.decision.toLowerCase()}`}>{customer.decision}</span><h2>{customer.title}</h2><p className="lede small">{customer.message}</p><p className="hint">Support code <strong>{customer.support_code}</strong>{result?.simulated ? " · Simulated evidence" : ""}</p>
        {customer.decision === "CHALLENGE" && <button className="primary" disabled={!!busy} onClick={() => task("Verifying signature", verify)}>Verify with wallet signature</button>}
        {(customer.decision === "REVIEW" || customer.decision === "RESTRICT") && <button className="secondary" disabled={!!busy} onClick={() => task("Checking review", async () => { const current = revision.current; if (result) { const status = await api<Customer>(`/customer/status/${result.request_id}`); if (current === revision.current) setCustomer(status); } })}>Refresh review status</button>}
        {customer.decision === "RESOLVED" && !token && <button className="primary" disabled={!!busy} onClick={() => task("Restoring reviewed access", verify)}>Sign to restore access</button>}
        {token && <button className="primary" disabled={!!busy} onClick={() => task("Opening vault", async () => { const current = revision.current; const content = await api<Vault>("/vault/research-vault", { headers: { Authorization: `Bearer ${token}` } }); if (current === revision.current) setVault(content); })}>Open protected vault →</button>}
      </> : <div className="empty"><span className="lock-icon" aria-hidden="true">◇</span><h2>Protected until approved</h2><p>Start an access request to see your security status and the next step.</p></div>}</section>
    </div>
    {vault && <section className="panel vault"><p className="eyebrow">03 · AUTHORIZED CONTENT</p><h2>{vault.data.title}</h2><p className="hint">Sample private resource returned by the protected API after token verification.</p><div className="records">{vault.data.records.map(row => <article key={row.id}><span className="chip">{row.id}</span><h3>{row.dataset}</h3><p>{row.rows.toLocaleString()} records</p></article>)}</div></section>}
    <section className="steps"><article><span>01</span><h3>Behavior as evidence</h3><p>Recent activity and application history reveal changes that a wallet signature alone cannot.</p></article><article><span>02</span><h3>Bounded AI interpretation</h3><p>Gemini interprets structured evidence. Deterministic rules control the final response.</p></article><article><span>03</span><h3>A reversible response</h3><p>Verification and analyst review provide a recovery path for unusual but legitimate activity.</p></article></section>
    <footer>AEGIS · Monad proof of concept <span>Public blockchain data stays public. This app gates a private API resource.</span></footer>
  </main>;
}
