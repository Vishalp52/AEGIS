"use client";
import dynamic from "next/dynamic";
import VaultHome from "./vault-home";
const DynamicHome = dynamic(() => import("./dynamic-home"), {
  ssr: false,
  loading: () => <main className="shell"><p role="status">Loading secure wallet connection…</p></main>,
});
export default function WalletEntry({ environmentId }: { environmentId: string }) {
  return environmentId ? <DynamicHome environmentId={environmentId} /> : <VaultHome />;
}
