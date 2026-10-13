type Provider = {
  request(args: { method: string; params?: unknown[] }): Promise<unknown>;
  on?: (event: string, callback: (...args: unknown[]) => void) => void;
  removeListener?: (event: string, callback: (...args: unknown[]) => void) => void;
};
declare global { interface Window { ethereum?: Provider } }
export const chainId = Number(process.env.NEXT_PUBLIC_MONAD_CHAIN_ID || "10143");
export const networkName = chainId === 143 ? "Monad Mainnet" : "Monad Testnet";
export function provider() {
  if (!window.ethereum) throw new Error("Open this page in a browser with an Ethereum-compatible wallet such as MetaMask installed, then reload. Embedded app browsers may not support wallet extensions.");
  return window.ethereum;
}
function walletError(error: unknown): Error {
  const code = Number((error as { code?: number | string })?.code);
  if (code === 4001) return new Error("Wallet request cancelled. Try again when you are ready.");
  if (code === -32002) return new Error("A wallet request is already pending. Open your wallet extension to approve or reject it.");
  return error instanceof Error ? error : new Error("The wallet could not complete the request. Open your wallet and try again.");
}
function account(value: unknown): string {
  const address = Array.isArray(value) ? value[0] : null;
  if (typeof address !== "string" || !/^0x[0-9a-fA-F]{40}$/.test(address)) throw new Error("No valid wallet account selected.");
  return address.toLowerCase();
}
export async function connectWallet() {
  const wallet = provider();
  const target = `0x${chainId.toString(16)}`;
  try {
    account(await wallet.request({ method: "eth_requestAccounts" }));
    if (Number(await wallet.request({ method: "eth_chainId" })) !== chainId) {
      try { await wallet.request({ method: "wallet_switchEthereumChain", params: [{ chainId: target }] }); }
      catch (error) {
        if (Number((error as { code?: number | string })?.code) !== 4902) throw error;
        await wallet.request({ method: "wallet_addEthereumChain", params: [{ chainId: target, chainName: networkName,
          nativeCurrency: { name: "Monad", symbol: "MON", decimals: 18 },
          rpcUrls: [chainId === 143 ? "https://rpc.monad.xyz" : "https://testnet-rpc.monad.xyz"],
          blockExplorerUrls: [chainId === 143 ? "https://monadscan.com" : "https://testnet.monadscan.com"],
        }] });
        await wallet.request({ method: "wallet_switchEthereumChain", params: [{ chainId: target }] });
      }
    }
    if (Number(await wallet.request({ method: "eth_chainId" })) !== chainId) throw new Error(`Switch your wallet to ${networkName}, then connect again.`);
    return account(await wallet.request({ method: "eth_accounts" }));
  } catch (error) { throw walletError(error); }
}
export async function assertWallet(wallet: string) {
  if (Number(await provider().request({ method: "eth_chainId" })) !== chainId) throw new Error(`Switch your wallet to ${networkName}.`);
  if (account(await provider().request({ method: "eth_accounts" })) !== wallet.toLowerCase()) throw new Error("Wallet account changed. Connect again.");
}
export async function signMessage(wallet: string, message: string) {
  try {
    await assertWallet(wallet);
    const hex = "0x" + Array.from(new TextEncoder().encode(message), byte => byte.toString(16).padStart(2, "0")).join("");
    const signature = await provider().request({ method: "personal_sign", params: [hex, wallet] });
    await assertWallet(wallet);
    if (typeof signature !== "string" || !/^0x[0-9a-fA-F]{130}$/.test(signature)) throw new Error("The wallet returned an invalid signature. Try signing again.");
    return signature;
  } catch (error) { throw walletError(error); }
}
