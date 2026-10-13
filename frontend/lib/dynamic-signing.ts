import { chainId, networkName } from "./wallet";
export type DynamicSigner = {
  address: string;
  getNetwork(): Promise<string | number | undefined>;
  isConnected(): Promise<boolean>;
  signMessage(message: string): Promise<string | undefined>;
  connector: { getConnectedAccounts(): Promise<string[]> };
};
export async function signWithDynamic(signer: DynamicSigner, wallet: string, message: string, isCurrent: () => boolean) {
  async function assertCurrent() {
    if (!isCurrent() || !await signer.isConnected()) throw new Error("Wallet connection changed. Start again.");
    if (signer.address.toLowerCase() !== wallet.toLowerCase() ||
        !(await signer.connector.getConnectedAccounts()).some(address => address.toLowerCase() === wallet.toLowerCase())) {
      throw new Error("Wallet account changed. Start again.");
    }
    if (Number(await signer.getNetwork()) !== chainId) throw new Error(`Switch your wallet to ${networkName}, then try again.`);
    if (!isCurrent()) throw new Error("Wallet connection changed. Start again.");
  }
  await assertCurrent();
  const signature = await signer.signMessage(message);
  await assertCurrent();
  if (!signature || !/^0x[0-9a-fA-F]{130}$/.test(signature)) throw new Error("A standard wallet signature is required. Smart contract wallets are not supported yet.");
  return signature;
}
