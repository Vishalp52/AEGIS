import time
import pytest
from eth_account import Account
from eth_account.messages import encode_defunct
from fastapi import HTTPException
from app.api import state
from app.api.state import store
from app.db.snapshots import CaseSnapshot, FeatureSnapshot, RiskEvaluation, TriageRecord, EmployeeReview


def test_cases_and_reviews_survive_memory_reload(client, scenarios, monkeypatch):
    result = client.post('/access/request', json={'wallet': scenarios['C']['wallet']}).json()
    rid = result['request_id']
    assert client.post(f'/cases/{rid}/review', json={'disposition': 'NEEDS_MORE_EVIDENCE', 'note': 'Check supporting evidence'}).status_code == 200
    before = client.get(f'/cases/{rid}').json()
    store.reset()
    assert state.load_cases_into_memory() == 1
    after = client.get(f'/cases/{rid}').json()
    assert after['gemini_triage'] == before['gemini_triage']
    assert after['audit'] == before['audit']
    assert len(store.attempts[result['wallet']]) == 1
    with state.SessionLocal() as session:
        for model in (CaseSnapshot, FeatureSnapshot, RiskEvaluation, TriageRecord, EmployeeReview):
            assert session.query(model).count() == 1
        assert 'access_token' not in session.get(CaseSnapshot, rid).payload['response']
    from types import SimpleNamespace
    monkeypatch.setattr(state, 'settings', SimpleNamespace(demo_enabled=False))
    assert state.load_cases_into_memory() == 0
    assert not any(store.attempts.values())


def test_vault_grant_and_revocation_survive_reload(client):
    wallet = '0x' + 'a' * 40
    allowed = client.post('/access/request', json={'wallet': wallet, 'demo_scenario': 'A'}).json()
    headers = {'Authorization': 'Bearer ' + allowed['access_token']}
    store.reset(); state.load_cases_into_memory()
    assert client.get('/vault/research-vault', headers=headers).status_code == 200
    client.post('/access/request', json={'wallet': wallet, 'demo_scenario': 'C'})
    store.reset(); state.load_cases_into_memory()
    assert client.get('/vault/research-vault', headers=headers).status_code == 403


def test_case_persistence_failure_is_explicit(monkeypatch):
    def fail(): raise RuntimeError('storage offline')
    monkeypatch.setattr(state, 'SessionLocal', fail)
    with pytest.raises(HTTPException) as error:
        state.persist_cases()
    assert error.value.status_code == 503


def test_review_recovery_requires_fresh_wallet_proof(client):
    account = Account.create()
    result = client.post('/access/request', json={'wallet': account.address, 'demo_scenario': 'C'}).json()
    rid = result['request_id']
    assert client.get(f'/access/{rid}/resume').status_code == 409
    assert client.post(f'/cases/{rid}/review', json={'disposition': 'CUSTOMER_VERIFIED'}).status_code == 200
    proof = client.get(f'/access/{rid}/resume').json()
    signature = '0x' + account.sign_message(encode_defunct(text=proof['message'])).signature.hex().removeprefix('0x')
    body = {'nonce': proof['nonce'], 'signature': signature}
    recovered = client.post(f'/access/{rid}/resume', json=body)
    assert recovered.status_code == 200
    token = recovered.json()['access_token']
    assert client.get('/vault/research-vault', headers={'Authorization': 'Bearer ' + token}).status_code == 200
    assert client.post(f'/access/{rid}/resume', json=body).status_code == 401
    store.cases[rid]['revoked'] = True
    assert client.get(f'/access/{rid}/resume').status_code == 409


def test_reset_clears_persisted_cases(client, scenarios):
    client.post('/access/request', json={'wallet': scenarios['A']['wallet']})
    assert client.post('/demo/reset').status_code == 200
    assert state.load_cases_into_memory() == 0
