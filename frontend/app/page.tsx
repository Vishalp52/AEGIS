
"use client";

import { useState } from "react";
import { requestAccess, type AccessEvaluation, type DemoScenario } from "./lib/api";

const demoAssets = [
  { symbol: "MON", name: "Monad", price: "$2.84", holdings: "4,280.50", value: "$12,156.62", color: "from-violet-500 to-purple-700", icon: "M" },
  { symbol: "ETH", name: "Ethereum", price: "$3,120.00", holdings: "2.15", value: "$6,708.00", color: "from-blue-400 to-indigo-600", icon: "◆" },
  { symbol: "USDC", name: "USD Coin", price: "$1.00", holdings: "4,250.00", value: "$4,250.00", color: "from-sky-400 to-blue-600", icon: "$" },
  { symbol: "BTC", name: "Bitcoin", price: "$102,240.00", holdings: "0.0124", value: "$1,267.78", color: "from-orange-400 to-amber-600", icon: "₿" },
];

const demoActivity = [
  { title: "Received MON", detail: "0xc0ffee...e01", amount: "+24.50 MON", time: "12 min ago", color: "text-emerald-400", icon: "↓" },
  { title: "Swapped ETH", detail: "Uniswap · Demo", amount: "-0.18 ETH", time: "1 hour ago", color: "text-rose-400", icon: "⇄" },
  { title: "Received USDC", detail: "0xc0ffee...e02", amount: "+350 USDC", time: "Yesterday", color: "text-emerald-400", icon: "↑" },
];

const scenarioOptions: { value: DemoScenario; label: string }[] = [
  { value: "A", label: "A · Normal activity" },
  { value: "B", label: "B · Unusual activity" },
  { value: "C", label: "C · High-risk behavior" },
  { value: "D", label: "D · Suspicious pattern" },
  { value: "E", label: "E · Review scenario" },
  { value: "F", label: "F · Additional demo case" },
];

function Icon({
  name,
  size = 20,
}: {
  name: string;
  size?: number;
}) {
  const common = {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.7,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true as const,
  };

  const paths: Record<string, React.ReactNode> = {
    home: <><path d="m3 10 9-7 9 7" /><path d="M5 9v11h14V9" /><path d="M9 20v-7h6v7" /></>,
    wallet: <><rect x="3" y="5" width="18" height="15" rx="3" /><path d="M3 9h18" /><path d="M16 14h2" /></>,
    transfer: <><path d="M7 7h13l-4-4" /><path d="m20 7-4 4" /><path d="M17 17H4l4 4" /><path d="m4 17 4-4" /></>,
    shield: <><path d="M12 22s8-4 8-11V5l-8-3-8 3v6c0 7 8 11 8 11Z" /><path d="m9 12 2 2 4-4" /></>,
    clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>,
    settings: <><circle cx="12" cy="12" r="3" /><path d="m19.4 15 .1.1 1.2 1-1.4 2.4-1.5-.5a8 8 0 0 1-1.8 1l-.3 1.6h-2.8l-.3-1.6a8 8 0 0 1-1.8-1l-1.5.5-1.4-2.4 1.2-1a7 7 0 0 1 0-2l-1.2-1 1.4-2.4 1.5.5a8 8 0 0 1 1.8-1l.3-1.6h2.8l.3 1.6a8 8 0 0 1 1.8 1l1.5-.5 1.4 2.4-1.2 1a7 7 0 0 1 0 2Z" transform="translate(-1 -1) scale(1.08)" /></>,
    arrow: <><path d="M5 12h14" /><path d="m13 6 6 6-6 6" /></>,
    download: <><path d="M12 3v12" /><path d="m7 10 5 5 5-5" /><path d="M4 20h16" /></>,
    eye: <><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" /><circle cx="12" cy="12" r="3" /></>,
    bell: <><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" /><path d="M10 21h4" /></>,
  };

  return <svg {...common}>{paths[name] ?? paths.shield}</svg>;
}

function Panel({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={`rounded-2xl border border-slate-800/90 bg-[#071226]/90 shadow-[0_12px_45px_rgba(0,0,0,0.12)] ${className}`}>
      {children}
    </section>
  );
}

function SectionTitle({
  icon,
  children,
  right,
}: {
  icon: string;
  children: React.ReactNode;
  right?: React.ReactNode;
}) {
  return (
    <div className="mb-5 flex items-center justify-between gap-3">
      <h2 className="flex items-center gap-2.5 text-sm font-semibold text-slate-100">
        <span className="text-violet-300"><Icon name={icon} size={19} /></span>
        {children}
      </h2>
      {right}
    </div>
  );
}

function DecisionBadge({ decision }: { decision: string }) {
  const styles: Record<string, string> = {
    ALLOW: "border-emerald-500/30 bg-emerald-500/10 text-emerald-300",
    CHALLENGE: "border-amber-500/30 bg-amber-500/10 text-amber-300",
    REVIEW: "border-orange-500/30 bg-orange-500/10 text-orange-300",
    RESTRICT: "border-rose-500/30 bg-rose-500/10 text-rose-300",
    RESOLVED: "border-emerald-500/30 bg-emerald-500/10 text-emerald-300",
  };

  return (
    <span className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-bold tracking-wide ${styles[decision] ?? "border-slate-700 bg-slate-800 text-slate-200"}`}>
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {decision}
    </span>
  );
}

function PortfolioChart() {
  return (
    <div className="relative mt-5 h-32 w-full overflow-hidden">
      <div className="absolute inset-0 flex flex-col justify-between">
        {[0, 1, 2, 3].map((line) => (
          <div key={line} className="border-t border-slate-800/60" />
        ))}
      </div>
      <svg viewBox="0 0 700 130" preserveAspectRatio="none" className="relative h-full w-full">
        <defs>
          <linearGradient id="portfolioFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#8b5cf6" stopOpacity=".34" />
            <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path
          d="M0 103 L18 96 L32 99 L47 86 L65 90 L81 78 L97 83 L112 75 L128 81 L145 65 L163 72 L179 57 L196 63 L214 54 L232 60 L249 46 L266 54 L283 39 L300 47 L318 34 L336 41 L354 30 L370 39 L387 22 L404 35 L420 29 L437 39 L453 24 L471 29 L487 19 L504 25 L521 15 L539 23 L555 12 L572 20 L590 8 L606 17 L624 5 L642 12 L661 3 L681 7 L700 1 L700 130 L0 130 Z"
          fill="url(#portfolioFill)"
        />
        <path
          d="M0 103 L18 96 L32 99 L47 86 L65 90 L81 78 L97 83 L112 75 L128 81 L145 65 L163 72 L179 57 L196 63 L214 54 L232 60 L249 46 L266 54 L283 39 L300 47 L318 34 L336 41 L354 30 L370 39 L387 22 L404 35 L420 29 L437 39 L453 24 L471 29 L487 19 L504 25 L521 15 L539 23 L555 12 L572 20 L590 8 L606 17 L624 5 L642 12 L661 3 L681 7 L700 1"
          stroke="#8b5cf6"
          strokeWidth="2.5"
          fill="none"
          vectorEffect="non-scaling-stroke"
        />
      </svg>
    </div>
  );
}

export default function Home() {
  const [scenario, setScenario] = useState<DemoScenario>("A");
  const [evaluation, setEvaluation] = useState<AccessEvaluation | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [period, setPeriod] = useState("1D");
  const [showTechnical, setShowTechnical] = useState(false);
  const [activeNav, setActiveNav] = useState("Dashboard");

  async function runSecurityCheck() {
    setLoading(true);
    setError("");

    try {
      const result = await requestAccess({
        wallet: "0x0000000000000000000000000000000000000001",
        resource_id: "trading-account",
        action: "transfer",
        demo_scenario: scenario,
      });

      setEvaluation(result);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to reach the POTUS API. Check that your backend is running."
      );
    } finally {
      setLoading(false);
    }
  }

  const navItems = [
    { name: "Dashboard", icon: "home" },
    { name: "Portfolio", icon: "wallet" },
    { name: "Transfer", icon: "transfer" },
    { name: "Security", icon: "shield" },
    { name: "Activity", icon: "clock" },
    { name: "Settings", icon: "settings" },
  ];

  return (
    <main className="min-h-screen bg-[#030918] text-slate-100 selection:bg-violet-500/30">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -left-40 top-20 h-96 w-96 rounded-full bg-violet-700/10 blur-[120px]" />
        <div className="absolute right-0 top-0 h-96 w-96 rounded-full bg-blue-600/10 blur-[140px]" />
      </div>

      <div className="relative flex min-h-screen">
        {/* Sidebar */}
        <aside className="hidden w-56 shrink-0 flex-col border-r border-slate-800/80 bg-[#050d1d]/95 px-4 py-6 lg:flex">
          <div className="mb-10 flex items-center gap-3 px-2">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-violet-400/30 bg-violet-500/10 text-violet-300 shadow-[0_0_28px_rgba(139,92,246,0.16)]">
              <Icon name="shield" size={27} />
            </div>
            <div>
              <div className="text-xl font-black tracking-[0.12em]">POTUS</div>
              <div className="text-[9px] font-semibold tracking-[0.14em] text-slate-400">AI SECURITY FOR CRYPTO</div>
            </div>
          </div>

          <nav className="space-y-2">
            {navItems.map((item) => (
              <button
                key={item.name}
                onClick={() => setActiveNav(item.name)}
                className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm transition ${
                  activeNav === item.name
                    ? "bg-gradient-to-r from-violet-600/90 to-indigo-600/80 font-semibold text-white shadow-lg shadow-violet-950/30"
                    : "text-slate-400 hover:bg-slate-800/60 hover:text-white"
                }`}
              >
                <Icon name={item.icon} size={19} />
                {item.name}
              </button>
            ))}
          </nav>

          <div className="mt-auto rounded-xl border border-violet-500/30 bg-gradient-to-br from-violet-500/10 to-transparent p-4">
            <div className="mb-2 text-violet-300"><Icon name="shield" size={23} /></div>
            <div className="text-sm font-semibold">Protected by POTUS</div>
            <p className="mt-1 text-xs leading-5 text-slate-400">Behavior-based security for your demo wallet.</p>
            <div className="mt-3 flex items-center gap-2 text-xs text-emerald-300">
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
              Demo environment
            </div>
          </div>
        </aside>

        {/* Main dashboard */}
        <div className="min-w-0 flex-1">
          <header className="sticky top-0 z-10 flex h-[70px] items-center justify-between border-b border-slate-800/80 bg-[#030918]/90 px-5 backdrop-blur-xl sm:px-8">
            <div className="flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-2 text-xs font-medium text-emerald-300">
              <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_10px_#34d399]" />
              Simulated environment
            </div>
            <div className="flex items-center gap-3 sm:gap-5">
              <div className="hidden items-center gap-2 rounded-full border border-slate-700 bg-slate-900/80 px-3 py-2 text-xs text-slate-300 sm:flex">
                <span className="text-violet-300"><Icon name="wallet" size={16} /></span>
                0x0000...0001
                <span className="rounded bg-slate-800 px-1.5 py-0.5 text-[9px] text-slate-400">DEMO</span>
              </div>
              <button aria-label="Notifications" className="text-slate-400 transition hover:text-white">
                <Icon name="bell" />
              </button>
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 font-semibold shadow-lg shadow-violet-900/30">
                D
              </div>
            </div>
          </header>

          <div className="mx-auto max-w-[1600px] space-y-6 p-4 sm:p-6 lg:p-7">
            {/* Hero */}
            <section className="relative overflow-hidden rounded-2xl border border-indigo-500/25 bg-gradient-to-r from-[#11113b] via-[#10163b] to-[#061b32] p-6 sm:p-8">
              <div className="pointer-events-none absolute inset-0 opacity-40">
                <div className="absolute -right-10 top-0 h-48 w-2/3 rounded-full border border-violet-500/40 blur-[1px]" />
                <div className="absolute -right-4 top-6 h-40 w-3/5 rounded-full border border-indigo-400/40" />
                <div className="absolute right-10 top-12 h-32 w-1/2 rounded-full border border-blue-400/30" />
              </div>
              <div className="relative flex flex-col justify-between gap-6 sm:flex-row sm:items-center">
                <div>
                  <div className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-violet-300">Your crypto command center</div>
                  <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Good morning, Demo User <span>👋</span></h1>
                  <p className="mt-3 max-w-xl text-sm leading-6 text-slate-300 sm:text-base">
                    Your wallet security, made smarter. POTUS evaluates activity before access is granted.
                  </p>
                </div>
                <div className="flex items-center gap-4 self-start rounded-xl border border-emerald-400/20 bg-emerald-400/5 px-4 py-3 sm:self-auto">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-emerald-400/40 bg-emerald-400/10 text-emerald-300 shadow-[0_0_28px_rgba(16,185,129,0.12)]">
                    <Icon name="shield" size={34} />
                  </div>
                  <div>
                    <div className="font-bold tracking-wide text-emerald-300">POTUS</div>
                    <div className="mt-1 text-xs text-emerald-200/80">Security layer demo</div>
                  </div>
                </div>
              </div>
            </section>

            {/* Main columns */}
            <div className="grid grid-cols-1 items-start gap-5 xl:grid-cols-[minmax(0,1.65fr)_minmax(300px,1fr)]">
              <div className="min-w-0 space-y-5">
                {/* Portfolio */}
                <Panel className="p-5 sm:p-6">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2 text-sm text-slate-300">
                        <span className="text-violet-300"><Icon name="wallet" size={18} /></span>
                        Total portfolio value
                        <span className="text-slate-500"><Icon name="eye" size={15} /></span>
                      </div>
                      <div className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">$24,382.40</div>
                      <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
                        <span className="font-semibold text-emerald-400">↗ 2.4% (24h)</span>
                        <span className="text-slate-500">Illustrative balance · Simulated assets</span>
                      </div>
                    </div>
                    <div className="flex rounded-lg bg-slate-900/80 p-1">
                      {["1D", "1W", "1M", "1Y"].map((item) => (
                        <button
                          key={item}
                          onClick={() => setPeriod(item)}
                          className={`rounded-md px-3 py-1.5 text-xs font-medium transition ${period === item ? "bg-violet-600 text-white shadow" : "text-slate-400 hover:text-white"}`}
                        >
                          {item}
                        </button>
                      ))}
                    </div>
                  </div>

                  <PortfolioChart />

                  <div className="mt-5 grid grid-cols-3 gap-2">
                    <button onClick={() => setActiveNav("Transfer")} className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-3 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-950/30 transition hover:brightness-110">
                      <Icon name="transfer" size={17} /> <span className="hidden sm:inline">Send / Transfer</span><span className="sm:hidden">Send</span>
                    </button>
                    <button onClick={() => setActiveNav("Portfolio")} className="flex items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-900/70 px-3 py-3 text-sm text-slate-200 transition hover:border-violet-500/50 hover:bg-slate-800">
                      <Icon name="download" size={17} /> Receive
                    </button>
                    <button onClick={() => setActiveNav("Portfolio")} className="flex items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-900/70 px-3 py-3 text-sm text-slate-200 transition hover:border-violet-500/50 hover:bg-slate-800">
                      <Icon name="transfer" size={17} /> Swap
                    </button>
                  </div>
                  {activeNav === "Transfer" && (
                    <p className="mt-3 text-xs text-violet-200">Demo transfer selected. No real transaction will be submitted.</p>
                  )}
                </Panel>

                {/* Assets */}
                <Panel className="overflow-hidden p-5 sm:p-6">
                  <SectionTitle icon="wallet" right={<span className="text-xs text-slate-500">4 demo assets</span>}>
                    Your assets
                  </SectionTitle>
                  <p className="-mt-3 mb-4 text-xs text-slate-500">Example token holdings for the interface demo.</p>

                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[510px] text-left text-sm">
                      <thead>
                        <tr className="border-b border-slate-800 text-xs text-slate-400">
                          <th className="pb-3 font-medium">Asset</th>
                          <th className="pb-3 font-medium">Price</th>
                          <th className="pb-3 font-medium">Holdings</th>
                          <th className="pb-3 text-right font-medium">Value</th>
                        </tr>
                      </thead>
                      <tbody>
                        {demoAssets.map((asset, index) => (
                          <tr key={asset.symbol} className={index !== demoAssets.length - 1 ? "border-b border-slate-800/80" : ""}>
                            <td className="py-3.5">
                              <div className="flex items-center gap-3">
                                <div className={`flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br ${asset.color} text-sm font-bold text-white shadow-lg`}>
                                  {asset.icon}
                                </div>
                                <div>
                                  <div className="font-semibold text-slate-100">{asset.symbol}</div>
                                  <div className="text-xs text-slate-500">{asset.name}</div>
                                </div>
                              </div>
                            </td>
                            <td className="py-3.5 text-slate-300">{asset.price}</td>
                            <td className="py-3.5 text-slate-300">{asset.holdings}</td>
                            <td className="py-3.5 text-right">
                              <div className="font-medium text-slate-100">{asset.value}</div>
                              <div className="mt-1 text-[11px] text-emerald-400">↗ Demo change</div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </Panel>

                {/* Recent activity */}
                <Panel className="p-5 sm:p-6">
                  <SectionTitle icon="clock" right={
                    <button onClick={() => setActiveNav("Activity")} className="flex items-center gap-1 text-xs text-violet-300 hover:text-violet-200">
                      View all <Icon name="arrow" size={14} />
                    </button>
                  }>
                    Recent activity
                  </SectionTitle>
                  <p className="-mt-3 mb-4 text-xs text-slate-500">Illustrative activity only. These are not real blockchain transactions.</p>
                  <div>
                    {demoActivity.map((activity, index) => (
                      <div key={activity.title} className={`flex items-center justify-between gap-3 py-4 ${index !== demoActivity.length - 1 ? "border-b border-slate-800/80" : ""}`}>
                        <div className="flex min-w-0 items-center gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-slate-700 bg-slate-900 text-lg text-violet-300">{activity.icon}</div>
                          <div className="min-w-0">
                            <div className="text-sm font-medium text-slate-100">{activity.title}</div>
                            <div className="mt-1 truncate text-xs text-slate-500">{activity.detail}</div>
                          </div>
                        </div>
                        <div className="shrink-0 text-right">
                          <div className={`text-sm font-semibold ${activity.color}`}>{activity.amount}</div>
                          <div className="mt-1 text-xs text-slate-500">{activity.time}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </Panel>
              </div>

              {/* Right column */}
              <div className="min-w-0 space-y-5">
                {/* Wallet details */}
                <Panel className="p-5">
                  <SectionTitle icon="wallet">Wallet details</SectionTitle>
                  <div className="rounded-xl border border-slate-800 bg-[#050d1d] p-3.5">
                    <div className="text-xs text-slate-400">Demo wallet</div>
                    <div className="mt-2 break-all font-mono text-xs text-slate-200">0x0000000000000000000000000000000000000001</div>
                  </div>
                  <div className="mt-4 space-y-4">
                    <div className="flex items-center justify-between gap-3 text-sm">
                      <span className="text-slate-400">Network</span>
                      <span className="flex items-center gap-2 text-slate-200"><span className="h-2 w-2 rounded-full bg-violet-400" /> Monad · Demo</span>
                    </div>
                    <div className="border-t border-slate-800" />
                    <div className="flex items-center justify-between gap-3 text-sm">
                      <span className="text-slate-400">Security layer</span>
                      <span className="flex items-center gap-2 text-emerald-300"><Icon name="shield" size={16} /> POTUS demo</span>
                    </div>
                  </div>
                </Panel>

                {/* POTUS Security */}
                <Panel className="relative overflow-hidden border-violet-500/60 bg-gradient-to-br from-[#17103b] via-[#0a122a] to-[#071226] p-5 shadow-[0_0_35px_rgba(124,58,237,0.08)] sm:p-6">
                  <div className="pointer-events-none absolute -right-12 -top-16 h-48 w-48 rounded-full bg-violet-600/10 blur-3xl" />
                  <div className="relative">
                    <div className="mb-5 flex items-center gap-3 border-b border-violet-400/15 pb-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-violet-400/50 bg-violet-500/10 text-violet-300">
                        <Icon name="shield" size={29} />
                      </div>
                      <div>
                        <h2 className="font-bold tracking-wide text-white">POTUS SECURITY</h2>
                        <p className="mt-1 text-xs text-violet-300">Adaptive threat intelligence</p>
                      </div>
                    </div>

                    <h3 className="text-base font-semibold">Before you transfer</h3>
                    <p className="mt-2 text-sm leading-6 text-slate-300">
                      POTUS evaluates activity, scores risk, and recommends an access decision before a protected action proceeds.
                    </p>

                    <div className="my-5 space-y-4">
                      {[
                        ["Behavior analysis", "Looks for unusual activity", "activity"],
                        ["Risk scoring", "Combines signals and rules", "score"],
                        ["AI assessment", "Gemini provides advisory triage", "ai"],
                      ].map(([title, description, key]) => (
                        <div key={key} className="flex items-center gap-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-full border border-violet-400/20 bg-violet-500/15 text-violet-300">
                            <Icon name={key === "activity" ? "clock" : key === "score" ? "shield" : "settings"} size={17} />
                          </div>
                          <div>
                            <div className="text-sm font-medium text-slate-100">{title}</div>
                            <div className="mt-1 text-xs text-slate-400">{description}</div>
                          </div>
                        </div>
                      ))}
                    </div>

                    <details className="mb-4 rounded-xl border border-slate-700/80 bg-[#050d1d]/80 p-3">
                      <summary className="cursor-pointer text-xs font-medium text-slate-300">
                        Demo controls · For presentation use
                      </summary>
                      <div className="mt-3">
                        <label htmlFor="scenario" className="mb-2 block text-xs text-slate-400">Select a synthetic scenario</label>
                        <select
                          id="scenario"
                          value={scenario}
                          onChange={(event) => setScenario(event.target.value as DemoScenario)}
                          className="w-full rounded-lg border border-slate-700 bg-[#0b1427] px-3 py-2.5 text-sm text-slate-100 outline-none focus:border-violet-500"
                        >
                          {scenarioOptions.map((option) => (
                            <option key={option.value} value={option.value}>{option.label}</option>
                          ))}
                        </select>
                      </div>
                    </details>

                    <button
                      onClick={runSecurityCheck}
                      disabled={loading}
                      className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-4 py-3.5 text-sm font-semibold text-white shadow-lg shadow-violet-950/40 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {loading ? (
                        <>
                          <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                          Evaluating activity...
                        </>
                      ) : (
                        <>Run POTUS security check <Icon name="arrow" size={17} /></>
                      )}
                    </button>
                    <p className="mt-3 text-[11px] leading-5 text-slate-400">
                      Demo only. No cryptocurrency is sent and no real transfer is made.
                    </p>
                  </div>
                </Panel>

                {/* Assessment result */}
                <Panel className="p-5">
                  <SectionTitle icon="shield">Security assessment</SectionTitle>

                  {error && (
                    <div role="alert" className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-4 text-sm text-rose-200">
                      <div className="font-semibold">Security check failed</div>
                      <p className="mt-2 break-words text-xs leading-5">{error}</p>
                      <p className="mt-2 text-xs text-rose-200/70">Check that the backend is running and the API URL is correct.</p>
                    </div>
                  )}

                  {!error && !evaluation && (
                    <div className="rounded-xl border border-slate-800 bg-[#050d1d]/80 p-4">
                      <div className="flex items-start gap-3">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-emerald-400/30 bg-emerald-400/10 text-emerald-300">
                          <Icon name="shield" size={27} />
                        </div>
                        <div>
                          <div className="font-semibold text-slate-100">Ready to evaluate</div>
                          <p className="mt-2 text-xs leading-5 text-slate-400">
                            Run a check to see the backend's decision and recommended next step. Technical signals are available for your demo.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {evaluation && (
                    <div aria-live="polite" className="space-y-4">
                      <div className="rounded-xl border border-slate-800 bg-[#050d1d] p-4">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <span className="text-sm font-semibold">POTUS decision</span>
                          <DecisionBadge decision={evaluation.decision} />
                        </div>
                        <div className="mt-4 flex items-end justify-between gap-3">
                          <div>
                            <div className="text-xs text-slate-400">Risk score</div>
                            <div className="mt-1 text-3xl font-bold">{evaluation.risk_score}<span className="ml-1 text-sm font-normal text-slate-500">/100</span></div>
                          </div>
                          <div className="text-right text-xs text-slate-500">
                            {evaluation.simulated ? "Synthetic demo result" : "Backend evaluation"}
                          </div>
                        </div>
                        <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-800">
                          <div
                            className={`h-full rounded-full transition-all ${evaluation.risk_score >= 75 ? "bg-rose-400" : evaluation.risk_score >= 55 ? "bg-orange-400" : evaluation.risk_score >= 35 ? "bg-amber-300" : "bg-emerald-400"}`}
                            style={{ width: `${Math.max(0, Math.min(100, evaluation.risk_score))}%` }}
                          />
                        </div>
                      </div>

                      <div>
                        <div className="text-sm font-semibold text-slate-100">
                          {evaluation.customer?.title ?? "Evaluation complete"}
                        </div>
                        <p className="mt-2 text-sm leading-6 text-slate-300">
                          {evaluation.customer?.message ?? "POTUS has completed the requested security evaluation."}
                        </p>
                        {evaluation.customer?.next_action && (
                          <div className="mt-3 rounded-lg border border-violet-500/20 bg-violet-500/5 p-3">
                            <div className="text-[10px] font-semibold uppercase tracking-wider text-violet-300">Recommended next step</div>
                            <p className="mt-1 text-sm leading-5 text-slate-200">{evaluation.customer.next_action}</p>
                          </div>
                        )}
                      </div>

                      <button
                        onClick={() => setShowTechnical((current) => !current)}
                        className="flex w-full items-center justify-between rounded-lg border border-slate-800 px-3 py-3 text-xs font-medium text-slate-300 hover:bg-slate-800/40"
                      >
                        Technical details
                        <span>{showTechnical ? "−" : "+"}</span>
                      </button>

                      {showTechnical && (
                        <div className="space-y-3 rounded-xl border border-slate-800 bg-[#050d1d] p-3 text-xs">
                          <div className="flex justify-between gap-3">
                            <span className="text-slate-500">Anomaly score</span>
                            <span className="text-slate-200">{evaluation.signals?.anomaly_score ?? "N/A"}</span>
                          </div>
                          <div className="flex justify-between gap-3">
                            <span className="text-slate-500">Rule score</span>
                            <span className="text-slate-200">{evaluation.signals?.rule_score ?? "N/A"}</span>
                          </div>
                          <div className="flex justify-between gap-3">
                            <span className="text-slate-500">Pattern similarity</span>
                            <span className="text-slate-200">{evaluation.signals?.pattern_similarity ?? "N/A"}</span>
                          </div>
                          <div className="flex justify-between gap-3">
                            <span className="text-slate-500">Gemini status</span>
                            <span className="max-w-[60%] break-words text-right text-slate-200">{evaluation.signals?.gemini_status ?? "N/A"}</span>
                          </div>
                          {evaluation.signals?.gemini && (
                            <>
                              <div className="flex justify-between gap-3">
                                <span className="text-slate-500">AI category</span>
                                <span className="max-w-[60%] break-words text-right text-slate-200">{evaluation.signals.gemini.category}</span>
                              </div>
                              <div className="flex justify-between gap-3">
                                <span className="text-slate-500">AI confidence</span>
                                <span className="text-slate-200">{evaluation.signals.gemini.confidence}</span>
                              </div>
                            </>
                          )}
                          <div className="border-t border-slate-800 pt-3">
                            <div className="text-slate-500">Reason codes</div>
                            <div className="mt-2 flex flex-wrap gap-2">
                              {evaluation.reason_codes?.length ? evaluation.reason_codes.map((code) => (
                                <span key={code} className="rounded-md border border-slate-700 bg-slate-800/60 px-2 py-1 text-slate-300">{code}</span>
                              )) : <span className="text-slate-400">None returned</span>}
                            </div>
                          </div>
                          <div className="border-t border-slate-800 pt-3">
                            <div className="text-slate-500">Request ID</div>
                            <div className="mt-1 break-all font-mono text-slate-300">{evaluation.request_id}</div>
                          </div>
                          <div className="border-t border-slate-800 pt-3">
                            <div className="text-slate-500">Evidence hash</div>
                            <div className="mt-1 break-all font-mono text-slate-300">{evaluation.evidence_hash}</div>
                          </div>
                          <div className="text-[11px] leading-5 text-slate-500">
                            Gemini provides advisory interpretation. The backend risk engine determines the final decision.
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </Panel>
              </div>
            </div>

            <footer className="flex flex-col justify-between gap-2 border-t border-slate-800/80 py-5 text-[11px] text-slate-500 sm:flex-row sm:items-center">
              <p>POTUS · Adaptive wallet security demo · Monad Metropolis 2026</p>
              <p>Portfolio, prices, activity, and scenario data are illustrative. No real transfers are submitted.</p>
            </footer>
          </div>
        </div>
      </div>
    </main>
  );
}
