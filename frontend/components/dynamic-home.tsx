"use client";
import { useCallback, useRef, useState } from "react";
import { DynamicContextProvider, DynamicWidget, useDynamicContext, useDynamicEvents } from "@dynamic-labs/sdk-react-core";
import { EthereumWalletConnectors } from "@dynamic-labs/ethereum";
import VaultHome from "./vault-home";
import { signWithDynamic } from "@/lib/dynamic-signing";

function ConnectedVault() {
  const { primaryWallet } = useDynamicContext();
  const generation = useRef(0);
  const [revision, setRevision] = useState(0);
  const invalidate = useCallback(() => { generation.current++; setRevision(generation.current); }, []);
  useDynamicEvents("primaryWalletChanged", invalidate);
  useDynamicEvents("primaryWalletNetworkChanged", invalidate);
  useDynamicEvents("userWalletsChanged", invalidate);
  useDynamicEvents("logout", invalidate);
  const address = primaryWallet?.address.toLowerCase() || "";
  return <VaultHome key={`${address}:${revision}`} session={{
    address,
    controls: <DynamicWidget />,
    sign: async (wallet, message) => {
      if (!primaryWallet) throw new Error("Connect your wallet first.");
      const current = generation.current;
      return signWithDynamic(primaryWallet, wallet, message, () => generation.current === current);
    },
  }} />;
}
export default function DynamicHome({ environmentId }: { environmentId: string }) {
  return <DynamicContextProvider settings={{ environmentId, walletConnectors: [EthereumWalletConnectors] }}>
    <ConnectedVault />
  </DynamicContextProvider>;
}
