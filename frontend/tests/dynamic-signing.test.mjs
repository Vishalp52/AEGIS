import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
const exports = {};
const script = ts.transpileModule(fs.readFileSync('lib/dynamic-signing.ts', 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText;
vm.runInNewContext(script, { exports, require: () => ({ chainId: 10143, networkName: 'Monad Testnet' }) });
const address = '0x' + 'a'.repeat(40);
const signature = '0x' + 'b'.repeat(130);
function signer(overrides = {}) {
  return { address, getNetwork: async () => 10143, isConnected: async () => true,
    connector: { getConnectedAccounts: async () => [address] }, signMessage: async () => signature, ...overrides };
}
test('Dynamic signs the actual backend nonce message', async () => {
  let message;
  const result = await exports.signWithDynamic(signer({ signMessage: async text => { message = text; return signature; } }), address, 'AEGIS nonce 123', () => true);
  assert.equal(message, 'AEGIS nonce 123'); assert.equal(result, signature);
});
test('Dynamic rejects wrong networks and disconnected wallets before signing', async () => {
  for (const overrides of [{ getNetwork: async () => 1 }, { isConnected: async () => false }, { connector: { getConnectedAccounts: async () => [] } }]) {
    let signed = false;
    await assert.rejects(exports.signWithDynamic(signer({ ...overrides, signMessage: async () => { signed = true; return signature; } }), address, 'nonce', () => true));
    assert.equal(signed, false);
  }
});
test('Dynamic rejects signatures returned after account, chain or session changes', async () => {
  let current = true;
  await assert.rejects(exports.signWithDynamic(signer({ signMessage: async () => { current = false; return signature; } }), address, 'nonce', () => current), /changed/);
});
test('Dynamic rejects unsupported contract-wallet signatures', async () => {
  await assert.rejects(exports.signWithDynamic(signer({ signMessage: async () => '0x1234' }), address, 'nonce', () => true), /standard wallet signature/);
});
