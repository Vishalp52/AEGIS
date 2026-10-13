export function createWalletGeneration() {
  let account: string | undefined;
  let network: number | undefined;
  let generation = 0;
  return {
    get current() { return generation; },
    account(value: string) {
      const next = value.toLowerCase();
      const changed = account !== undefined && account !== next;
      account = next;
      if (changed) { network = undefined; generation++; }
      return changed;
    },
    network(value: string | number) {
      const next = Number(value);
      const changed = network !== undefined && network !== next;
      network = next;
      if (changed) generation++;
      return changed;
    },
    logout() { account = ""; network = undefined; generation++; },
  };
}
