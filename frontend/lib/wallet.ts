type Provider = {
  request(args: { method: string; params?: unknown[] }): Promise<unknown>;
  on?: (event: string, callback: (...args: unknown[]) => void) => void;
  removeListener?: (event: string, callback: (...args: unknown[]) => void) => void;
};
declare global { interface Window { ethereum?: Provider } }
export const chainId = Number(process.env.NEXT_PUBLIC_MONAD_CHAIN_ID || "10143");
export const networkName = chainId === 143 ? "Monad Mainnet" : "Monad Testnet";
export function provider() {
  if (!window.ethereum) throw new Error("Install an Ethereum-compatible wallet such as MetaMask, then reload this page.");
  return window.ethereum;
}
export async function connectWallet() {
  const wallet = provider();
  const target = `0x${chainId.toString(16)}`;
  try { await wallet.request({ method: "wallet_switchEthereumChain", params: [{ chainId: target }] }); }
  catch (error) {
    if ((error as { code?: number }).code !== 4902) throw error;
    await wallet.request({ method: "wallet_addEthereumChain", params: [{ chainId: target, chainName: networkName,
      nativeCurrency: { name: "Monad", symbol: "MON", decimals: 18 },
      rpcUrls: [chainId === 143 ? "https://rpc.monad.xyz" : "https://testnet-rpc.monad.xyz"],
      blockExplorerUrls: [chainId === 143 ? "https://monadscan.com" : "https://testnet.monadscan.com"],
    }] });
  }
  const accounts = await wallet.request({ method: "eth_requestAccounts" }) as string[];
  if (!accounts[0]) throw new Error("No wallet account selected.");
  return accounts[0].toLowerCase();
}
export async function signMessage(wallet: string, message: string) {
  const chain = await provider().request({ method: "eth_chainId" });
  if (Number(chain) !== chainId) throw new Error(`Switch your wallet to ${networkName}.`);
  const accounts = await provider().request({ method: "eth_accounts" }) as string[];
  if (accounts[0]?.toLowerCase() !== wallet.toLowerCase()) throw new Error("Wallet account changed. Connect again.");
  const hex = "0x" + Array.from(new TextEncoder().encode(message), byte => byte.toString(16).padStart(2, "0")).join("");
  return await provider().request({ method: "personal_sign", params: [hex, wallet] }) as string;
}
