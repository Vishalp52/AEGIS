"use client";
import { useRef, useState } from "react";
import { DynamicContextProvider, DynamicWidget, useDynamicContext, useDynamicEvents } from "@dynamic-labs/sdk-react-core";
import { EthereumWalletConnectors } from "@dynamic-labs/ethereum";
import VaultHome from "./vault-home";
import { signWithDynamic } from "@/lib/dynamic-signing";
import { createWalletGeneration } from "@/lib/wallet-generation";

function ConnectedVault() {
  const { primaryWallet } = useDynamicContext();
  const generation = useRef(createWalletGeneration());
  const [revision, setRevision] = useState(0);
  useDynamicEvents("primaryWalletChanged", wallet => {
    if (generation.current.account(wallet.address)) setRevision(generation.current.current);
  });
  useDynamicEvents("primaryWalletNetworkChanged", network => {
    if (generation.current.network(network)) setRevision(generation.current.current);
  });
  useDynamicEvents("userWalletsChanged", event => {
    if (generation.current.account(event.primaryWallet?.address || "")) setRevision(generation.current.current);
  });
  useDynamicEvents("logout", () => {
    generation.current.logout(); setRevision(generation.current.current);
  });
  const address = primaryWallet?.address.toLowerCase() || "";
  return <VaultHome key={`${address}:${revision}`} session={{
    address,
    controls: <DynamicWidget />,
    sign: async (wallet, message) => {
      if (!primaryWallet) throw new Error("Connect your wallet first.");
      generation.current.account(wallet);
      const current = generation.current.current;
      return signWithDynamic(primaryWallet, wallet, message, () => generation.current.current === current);
    },
  }} />;
}
export default function DynamicHome({ environmentId }: { environmentId: string }) {
  return <DynamicContextProvider settings={{ environmentId, walletConnectors: [EthereumWalletConnectors] }}>
    <ConnectedVault />
  </DynamicContextProvider>;
}
