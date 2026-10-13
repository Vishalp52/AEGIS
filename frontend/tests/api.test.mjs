import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import crypto from 'node:crypto';
import ts from 'typescript';
function load(file, dependencies = {}, globals = {}) {
  const exports = {};
  const code = ts.transpileModule(fs.readFileSync(file, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
  vm.runInNewContext(code, { exports, require: name => dependencies[name], process: { env: {} }, Buffer, Headers, Request, Response, URL, AbortSignal, fetch, ...globals });
  return exports;
}
function server() {
  return load('lib/server.ts', { 'node:crypto': crypto, 'next/headers': { cookies: async () => ({ get: () => undefined }) } });
}
test('client preserves Headers objects including bearer authorization', async () => {
  let sent;
  const api = load('lib/api.ts', {}, { fetch: async (_, options) => { sent = options.headers; return Response.json({ ok: true }); } });
  await api.request('/test', { headers: new Headers({ Authorization: 'Bearer test' }) });
  assert.equal(sent.get('Authorization'), 'Bearer test');
});
test('client reports a non-JSON upstream failure as an HTTP error', async () => {
  const api = load('lib/api.ts', {}, { fetch: async () => new Response('<html>gateway down</html>', { status: 502 }) });
  await assert.rejects(api.request('/test'), /502/);
});
test('proxy blocks cross-origin writes and anonymous employee requests', async () => {
  const routes = load('app/api/aegis/[...path]/route.ts', { '@/lib/server': server() });
  const context = path => ({ params: Promise.resolve({ path: path.split('/') }) });
  const response = await routes.POST(new Request('http://localhost/api/aegis/access/request', { method: 'POST', headers: { Origin: 'https://untrusted.example' }, body: '{}' }), context('access/request'));
  assert.equal(response.status, 403);
  assert.equal((await routes.GET(new Request('http://localhost/api/aegis/cases'), context('cases'))).status, 401);
});
test('oversized bodies return 413 before contacting the backend', async () => {
  let contacted = false;
  const routes = load('app/api/aegis/[...path]/route.ts', { '@/lib/server': server() }, { fetch: async () => { contacted = true; throw Error('Unexpected upstream request'); } });
  const response = await routes.POST(new Request('http://localhost/api/aegis/access/request', { method: 'POST', headers: { Origin: 'http://localhost' }, body: 'x'.repeat(32769) }), { params: Promise.resolve({ path: ['access', 'request'] }) });
  assert.equal(response.status, 413); assert.equal(contacted, false);
});
test('session rejects malformed JSON, null payloads and oversized login input', async () => {
  const routes = load('app/api/session/route.ts', { '@/lib/server': server(), 'next/headers': {} });
  for (const [body, expected] of [['{', 400], ['null', 400], ['x'.repeat(32769), 413]]) {
    const response = await routes.POST(new Request('http://localhost/api/session', { method: 'POST', headers: { Origin: 'http://localhost' }, body }));
    assert.equal(response.status, expected);
  }
});
