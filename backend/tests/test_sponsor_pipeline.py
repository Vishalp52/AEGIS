from dataclasses import replace
from types import SimpleNamespace

import pytest

from app.chain import source, monad_rpc
from app.chain.types import WalletActivity

WALLET = '0x' + 'a' * 40


def setup_sources(monkeypatch, chain=10143, block_hash=b'\x12' * 32, fail=False):
    monkeypatch.setattr(source, 'settings', replace(source.settings, enable_demo_env='false', data_source='auto',
                                                  alchemy_rpc_url='https://monad-testnet.g.alchemy.com/v2/private', monad_chain_id=10143))
    activity = WalletActivity(WALLET, 'envio', latest_block=10, latest_block_hash='0x' + '12' * 32)
    monkeypatch.setattr(source.envio, 'safe_wallet_activity', lambda *args, **kwargs: activity)
    def get_block(number):
        assert number == 10
        if fail:
            raise TimeoutError()
        return {'hash': block_hash}
    rpc = SimpleNamespace(chain_id=lambda: chain, nonce=lambda wallet: 9,
                          w3=SimpleNamespace(eth=SimpleNamespace(get_block=get_block)))
    monkeypatch.setattr(monad_rpc, 'MonadRPC', lambda: rpc)
    fallback = WalletActivity(WALLET, 'alchemy', complete_window=False)
    monkeypatch.setattr(monad_rpc, 'safe_wallet_activity', lambda wallet: fallback)
    return activity, fallback


def test_indexed_history_is_corroborated_by_alchemy(monkeypatch):
    activity, _ = setup_sources(monkeypatch)
    assert source.get_wallet_activity(WALLET) is activity
    assert activity.nonce == 9
    assert 'Alchemy verified Monad' in activity.notes[-1]


@pytest.mark.parametrize('kwargs', [{'chain': 1}, {'block_hash': b'\x34' * 32}, {'fail': True}])
def test_bad_or_unavailable_corroboration_uses_partial_rpc(monkeypatch, kwargs):
    _, fallback = setup_sources(monkeypatch, **kwargs)
    assert source.get_wallet_activity(WALLET) is fallback
    assert not fallback.complete_window


def test_missing_indexed_hash_is_not_verified(monkeypatch):
    activity, fallback = setup_sources(monkeypatch)
    activity.latest_block_hash = None
    assert source.get_wallet_activity(WALLET) is fallback


def test_rpc_rejects_wrong_chain_before_scanning(monkeypatch):
    rpc = monad_rpc.MonadRPC('https://unused')
    monkeypatch.setattr(rpc, 'chain_id', lambda: 1)
    with pytest.raises(ValueError, match='network'):
        rpc.wallet_activity(WALLET)
