"""Read-only live checks; never prints provider URLs or credentials."""
from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / 'backend'))
from app.api.settings import settings
from app.chain.envio import EnvioHyperSync
from app.chain.monad_rpc import MonadRPC
from app.chain.source import get_wallet_activity
from app.features.extractor import AppHistory, extract_features
from app.models.model_store import load_detector


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--wallet', required=True, help='Public Monad wallet with recent activity')
    args = parser.parse_args()
    from web3 import Web3
    if not Web3.is_address(args.wallet):
        parser.error('Provide a valid public EVM address')
    report = {'alchemy': {'configured': bool(settings.alchemy_rpc_url)},
              'envio': {'configured': bool(settings.envio_hypersync_url and settings.envio_api_token)},
              'dynamic': {'verified': False, 'note': 'Requires interactive browser wallet signing test'}}
    for name, check in report.items():
        if name == 'dynamic' or not check['configured']:
            continue
        try:
            if name == 'alchemy':
                rpc = MonadRPC()
                chain_id = rpc.chain_id()
                if chain_id != settings.monad_chain_id:
                    raise ValueError('Network mismatch')
                check.update(verified=True, chain_id=chain_id, latest_block=rpc.latest_block())
            else:
                activity = EnvioHyperSync().wallet_activity(args.wallet)
                check.update(verified=activity.complete_window, latest_block=activity.latest_block,
                             transaction_count=len(activity.txs), complete_window=activity.complete_window)
        except Exception as exc:
            check.update(verified=False, error_type=type(exc).__name__)
    if all(report[name].get('verified') for name in ('envio', 'alchemy')):
        activity = get_wallet_activity(args.wallet)
        bundle = extract_features(activity, 'research-vault', AppHistory(), load_detector().population)
        report['pipeline'] = {'source': bundle.data_source, 'history_confidence': bundle.history_confidence,
                              'features': bundle.features.model_dump(), 'notes': bundle.notes,
                              'verified': activity.source == 'envio' and any('Alchemy verified' in n for n in activity.notes)}
    print(json.dumps(report, indent=2))
    return 0 if report.get('pipeline', {}).get('verified') else 1


if __name__ == '__main__':
    raise SystemExit(main())
