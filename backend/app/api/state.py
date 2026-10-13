"""In-process state for the API (cases, access log, flagged wallets) plus
persistence through the teammate's SQLAlchemy models/repository.

Threat memory itself is the teammate's ThreatStore; confirmed incidents are
also written to the `incidents` table and re-loaded on startup.
"""
from __future__ import annotations

import logging
import math
import threading
import time
from collections import defaultdict
from dataclasses import dataclass, field
from datetime import datetime, timezone
from typing import Any, Optional

from sqlalchemy import create_engine, inspect, text
from sqlalchemy.orm import sessionmaker
from fastapi import HTTPException
from fastapi.encoders import jsonable_encoder
from app.db.snapshots import CaseSnapshot, FeatureSnapshot, RiskEvaluation, TriageRecord, EmployeeReview, AttemptRecord

from app.api import teammate as tm
from app.api.settings import BACKEND_DIR, settings
from app.chain.demo_replay import FLAGGED_COUNTERPARTIES
from app.features.schemas import MODEL_FEATURES, VECTOR_VERSION

log = logging.getLogger("aegis.state")

FAILED_DECISIONS = {"CHALLENGE", "REVIEW", "RESTRICT", "AUTH_FAILED"}


@dataclass
class AccessAttempt:
    request_id: str
    wallet: str
    resource_id: str
    ts: float
    decision: str


@dataclass
class Store:
    cases: dict[str, dict[str, Any]] = field(default_factory=dict)
    attempts: dict[str, list[AccessAttempt]] = field(default_factory=lambda: defaultdict(list))
    flagged_wallets: set[str] = field(default_factory=set)
    incident_meta: dict[str, dict[str, Any]] = field(default_factory=dict)
    threat_store: Any = None
    lock: threading.RLock = field(default_factory=threading.RLock)

    # ---- access log -------------------------------------------------
    def record_attempt(self, a: AccessAttempt) -> None:
        with self.lock:
            a.wallet = a.wallet.lower()
            self.attempts[a.wallet].append(a)
            with SessionLocal() as session:
                session.add(AttemptRecord(**a.__dict__))
                session.commit()

    def app_counts(self, wallet: str, now: Optional[float] = None) -> tuple[int, int]:
        """(access requests in last 10m, failed/held attempts in last 1h) BEFORE the current request."""
        now = time.time() if now is None else now
        with self.lock:
            hist = self.attempts.get(wallet.lower(), [])
            req_10m = sum(1 for a in hist if 0 <= now - a.ts <= 600)
            failed_1h = sum(1 for a in hist if 0 <= now - a.ts <= 3600 and a.decision in FAILED_DECISIONS)
        return req_10m, failed_1h

    def flagged_counterparties(self) -> set[str]:
        with self.lock:
            return set(self.flagged_wallets) | (set(FLAGGED_COUNTERPARTIES) if settings.demo_enabled else set())

    def latest_case_for(self, wallet: str) -> Optional[dict[str, Any]]:
        with self.lock:
            cs = [c for c in self.cases.values() if c["wallet"] == wallet.lower()]
        return max(cs, key=lambda c: c["created_at_ts"]) if cs else None

    def reset(self) -> None:
        with self.lock:
            self.cases.clear()
            self.attempts.clear()
            self.flagged_wallets.clear()
            self.incident_meta.clear()
            self.threat_store = tm.ThreatStore()


store = Store(threat_store=tm.ThreatStore())

# ---------------------------------------------------------------- database
_db_url = settings.database_url
if _db_url.startswith("sqlite:///./"):
    _db_url = "sqlite:///" + str(BACKEND_DIR / _db_url[len("sqlite:///./"):])
engine = create_engine(_db_url, connect_args={"check_same_thread": False} if _db_url.startswith("sqlite") else {})
SessionLocal = sessionmaker(bind=engine, expire_on_commit=False)


def init_db() -> None:
    tm.Base.metadata.create_all(engine)


    if "source" not in {c["name"] for c in inspect(engine).get_columns("incidents")}:
        with engine.begin() as connection:
            connection.execute(text("ALTER TABLE incidents ADD COLUMN source JSON"))


def persist_cases() -> None:
    try:
        with store.lock, SessionLocal() as session:
            for case in store.cases.values():
                rid, bundle, scored = case['request_id'], case['bundle'], case['scored']
                payload = jsonable_encoder(case)
                payload['response'].pop('access_token', None)
                session.merge(CaseSnapshot(request_id=rid, payload=payload, updated_at=datetime.now(timezone.utc)))
                session.merge(FeatureSnapshot(request_id=rid, feature_json=bundle['features'],
                    baseline_json=bundle['baselines'], vector_version=VECTOR_VERSION))
                session.merge(RiskEvaluation(request_id=rid, component_scores=scored['breakdown'],
                    risk_score=case['response']['risk_score'], decision=case['decision'],
                    reason_codes=scored['reason_codes'], expiry=case['expires_at_ts']))
                session.merge(TriageRecord(request_id=rid, payload=payload['scored']['triage'],
                    prompt_version=scored.get('prompt_version'), status=scored['gemini_status']))
                for index, review in enumerate(case['reviews']):
                    session.merge(EmployeeReview(review_id=f'{rid}:{index}', case_id=rid, payload=review))
            session.commit()
    except Exception as exc:
        log.error('case persistence failed (%s)', type(exc).__name__)
        raise HTTPException(503, 'evaluation could not be saved; please retry') from exc


def load_cases_into_memory() -> int:
    from app.ai.schemas import GeminiTriage
    with store.lock, SessionLocal() as session:
        store.cases.clear()
        store.attempts.clear()
        simulated_ids = set()
        for row in session.query(CaseSnapshot).all():
            case = row.payload
            if case.get('activity', {}).get('simulated') and not settings.demo_enabled:
                simulated_ids.add(row.request_id)
                continue
            triage = case['scored'].get('triage')
            if triage is not None:
                case['scored']['triage'] = GeminiTriage.model_validate(triage)
            store.cases[row.request_id] = case
        for row in session.query(AttemptRecord).filter(AttemptRecord.ts >= time.time() - 86400).all():
            if row.request_id in simulated_ids:
                continue
            store.attempts[row.wallet].append(AccessAttempt(row.request_id, row.wallet, row.resource_id, row.ts, row.decision))
    return len(store.cases)


def db_clear_cases() -> None:
    with SessionLocal() as session:
        for model in (CaseSnapshot, FeatureSnapshot, RiskEvaluation, TriageRecord, EmployeeReview, AttemptRecord):
            session.query(model).delete()
        session.commit()


def _safe(fn, *args, **kwargs):
    try:
        with SessionLocal() as s:
            return fn(tm.Repository(s), s, *args, **kwargs)
    except Exception as exc:
        log.warning("db write failed: %s", exc)
        return None


def db_save_request(request_id: str, wallet: str, resource_id: str, action: str) -> None:
    _safe(lambda repo, s: repo.save_request(request_id, wallet, resource_id, action))


def db_audit(actor: str, event_type: str, object_id: str, payload: dict) -> str:
    h = tm.AuditService.hash_payload(payload)
    _safe(lambda repo, s: repo.record_audit(actor, event_type, object_id, h))
    return h


def db_save_incident(incident_id: str, vector: list[float], category: str, disposition: str, evidence_hash: str,
                     confirmed_by: str, source: Optional[dict] = None) -> bool:
    def _w(repo, s):
        s.merge(tm.IncidentModel(incident_id=incident_id, vector=vector, category=category, disposition=disposition,
                                 evidence_hash=evidence_hash, confirmed_by=confirmed_by, source=source))
        s.commit()
        return True
    return _safe(_w) is True


def db_clear_incidents() -> None:
    def _w(repo, s):
        s.query(tm.IncidentModel).delete()
        s.commit()
    _safe(_w)


def load_incidents_into_memory() -> int:
    """Restore validated, reviewed signatures and their provenance without duplicates."""
    loaded = 0
    try:
        with store.lock, SessionLocal() as s:
            for row in s.query(tm.IncidentModel).all():
                vec = row.vector or []
                source = row.source if isinstance(row.source, dict) else {}
                if row.incident_id in store.incident_meta:
                    continue
                if row.disposition not in {"CONFIRMED_INCIDENT", "SIMULATED_ATTACK"}:
                    continue
                if source.get("vector_version", VECTOR_VERSION) != VECTOR_VERSION:
                    continue
                if not isinstance(vec, list) or len(vec) != len(MODEL_FEATURES) or not all(
                    isinstance(v, (int, float)) and not isinstance(v, bool) and math.isfinite(v) for v in vec
                ) or not any(vec):
                    log.warning("skipping incompatible incident signature: %s", row.incident_id)
                    continue
                simulated = source.get("simulated", True if row.disposition == "SIMULATED_ATTACK" else None)
                if simulated and not settings.demo_enabled:
                    continue
                store.threat_store.insert_incident(row.incident_id, vec, row.category or "", row.disposition or "", row.evidence_hash or "")
                wallet = source.get("wallet")
                wallet = wallet.lower() if isinstance(wallet, str) else None
                store.incident_meta[row.incident_id] = {
                    "incident_id": row.incident_id,
                    "confirmed_by": row.confirmed_by,
                    "confirmed_at": (row.confirmed_at or datetime.now(timezone.utc)).isoformat(),
                    "source_case": source.get("source_case"), "wallet": wallet, "simulated": simulated,
                }
                if wallet:
                    store.flagged_wallets.add(wallet)
                loaded += 1
    except Exception as exc:
        log.warning("could not load incidents: %s", exc)
    return loaded
