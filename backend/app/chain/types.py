"""Normalized chain data shared by the RPC, Envio, and demo-replay adapters."""
from __future__ import annotations

from dataclasses import dataclass, field
from typing import Optional


def chain_quantity(value) -> int:
    """Parse an EVM quantity without silently coercing missing or fractional data."""
    if isinstance(value, bool) or not isinstance(value, (int, str)):
        raise ValueError("Invalid chain quantity")
    number = int(value, 16 if value.lower().startswith("0x") else 10) if isinstance(value, str) else value
    if number < 0:
        raise ValueError("Negative chain quantity")
    return number


@dataclass(frozen=True)
class ChainTx:
    hash: str
    block_number: int
    timestamp: int
    from_addr: str
    to_addr: Optional[str]
    value_wei: int
    is_contract_call: bool

    def __post_init__(self):
        object.__setattr__(self, "from_addr", self.from_addr.lower())
        if self.to_addr is not None:
            object.__setattr__(self, "to_addr", self.to_addr.lower())


@dataclass
class WalletActivity:
    wallet: str
    source: str
    txs: list[ChainTx] = field(default_factory=list)
    latest_block: int = 0
    first_seen_block: Optional[int] = None
    nonce: Optional[int] = None
    window_seconds: int = 24 * 3600
    complete_window: bool = True
    notes: list[str] = field(default_factory=list)
    simulated: bool = False
    latest_block_hash: Optional[str] = None

    def __post_init__(self):
        self.wallet = self.wallet.lower()

    @property
    def outgoing(self) -> list[ChainTx]:
        w = self.wallet.lower()
        return [t for t in self.txs if t.from_addr == w]
