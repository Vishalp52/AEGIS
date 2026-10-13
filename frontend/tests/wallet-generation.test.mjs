import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
const exports = {};
vm.runInNewContext(ts.transpileModule(fs.readFileSync('lib/wallet-generation.ts', 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText, { exports });
test('wallet refresh notifications preserve an in-flight signature', () => {
  const state = exports.createWalletGeneration();
  state.account('0xAbC'); state.network(10143);
  const current = state.current;
  assert.equal(state.account('0xabc'), false);
  assert.equal(state.network('10143'), false);
  assert.equal(state.current, current);
});
test('real account, chain and logout changes invalidate signatures', () => {
  const state = exports.createWalletGeneration();
  state.account('0xabc'); state.network(10143);
  assert.equal(state.network(1), true);
  assert.equal(state.current, 1);
  assert.equal(state.account('0xdef'), true);
  assert.equal(state.current, 2);
  state.logout();
  assert.equal(state.current, 3);
});
