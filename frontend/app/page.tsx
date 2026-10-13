import WalletEntry from "@/components/wallet-entry";
export const dynamic = "force-dynamic";
export default function Home() {
  return <WalletEntry environmentId={process.env.DYNAMIC_ENVIRONMENT_ID || ""} />;
}
