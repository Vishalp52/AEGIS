import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
const address = '0x' + 'a'.repeat(40);
const signature = '0x' + 'b'.repeat(130);
function load(request) {
  const exports = {};
  const script = ts.transpileModule(fs.readFileSync('lib/wallet.ts', 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText;
  vm.runInNewContext(script, { exports, process: { env: {} }, window: request ? { ethereum: { request } } : {}, TextEncoder });
  return exports;
}
test('connect asks for accounts before switching, adds unknown network and switches again', async () => {
  const calls = []; let chain = '0x1', added = false;
  const wallet = load(async ({ method }) => {
    calls.push(method);
    if (method === 'eth_requestAccounts' || method === 'eth_accounts') return [address];
    if (method === 'eth_chainId') return chain;
    if (method === 'wallet_addEthereumChain') { added = true; return null; }
    if (method === 'wallet_switchEthereumChain') { if (!added) throw { code: 4902 }; chain = '0x279f'; return null; }
  });
  assert.equal(await wallet.connectWallet(), address);
  assert.equal(calls[0], 'eth_requestAccounts');
  assert.equal(calls.filter(x => x === 'wallet_switchEthereumChain').length, 2);
});
test('does not claim connection when network switch silently fails', async () => {
  const wallet = load(async ({ method }) => method.includes('Accounts') || method === 'eth_accounts' ? [address] : method === 'eth_chainId' ? '0x1' : null);
  await assert.rejects(wallet.connectWallet(), /Switch your wallet/);
});
test('missing extension explains embedded browser limitation', async () => {
  await assert.rejects(load().connectWallet(), /Embedded app browsers/);
});
test('cancelled and pending wallet requests have actionable errors', async () => {
  for (const [code, message] of [[4001, /cancelled/], [-32002, /already pending/]]) {
    await assert.rejects(load(async () => { throw { code }; }).connectWallet(), message);
  }
});
test('signing rejects an account change while approval is pending', async () => {
  let signed = false;
  const wallet = load(async ({ method }) => {
    if (method === 'eth_chainId') return '0x279f';
    if (method === 'eth_accounts') return [signed ? '0x' + 'c'.repeat(40) : address];
    if (method === 'personal_sign') { signed = true; return signature; }
  });
  await assert.rejects(wallet.signMessage(address, 'AEGIS access'), /account changed/);
});
test('signing uses EIP-191 message order and validates signature', async () => {
  let params;
  const wallet = load(async request => {
    if (request.method === 'eth_chainId') return '0x279f';
    if (request.method === 'eth_accounts') return [address];
    params = request.params; return signature;
  });
  assert.equal(await wallet.signMessage(address, 'Hi'), signature);
  assert.equal(params[0], '0x4869'); assert.equal(params[1], address);
});
