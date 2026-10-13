"""Create private local configuration without overwriting existing secrets."""
import argparse
import os
import secrets
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]

def write_private(path, contents):
    fd = os.open(path, os.O_WRONLY | os.O_CREAT | os.O_EXCL, 0o600)
    with os.fdopen(fd, 'w') as handle:
        handle.write(contents)

def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--mode', choices=['demo', 'live'], default='demo')
    args = parser.parse_args()
    backend = ROOT / 'backend/.env'
    if not backend.exists():
        text = (ROOT / 'backend/.env.example').read_text()
        replacements = {
            'GEMINI_API_KEY': os.getenv('GEMINI_API_KEY', ''),
            'AEGIS_ADMIN_KEY': secrets.token_urlsafe(32),
            'AEGIS_EMPLOYEE_KEYS': 'local:' + secrets.token_urlsafe(32),
            'TOKEN_SECRET': secrets.token_urlsafe(48),
            'GEMINI_MODE': 'mock' if args.mode == 'demo' else 'auto',
            'DATA_SOURCE': 'none' if args.mode == 'demo' else 'auto',
            'ENABLE_DEMO': 'true' if args.mode == 'demo' else 'false',
            'REQUIRE_WALLET_SIGNATURE': 'false' if args.mode == 'demo' else 'true',
        }
        lines = []
        for line in text.splitlines():
            name = line.split('=', 1)[0]
            lines.append(name + '=' + replacements[name] if name in replacements else line)
        write_private(backend, '\n'.join(lines) + '\n')
        print('Created backend/.env. Read its local employee/admin key to sign in; never publish it.')
    else:
        print('Kept existing backend/.env unchanged.')
    frontend = ROOT / 'frontend/.env.local'
    if not frontend.exists():
        text = (ROOT / 'frontend/.env.example').read_text().replace('SESSION_SECRET=', 'SESSION_SECRET=' + secrets.token_urlsafe(48))
        write_private(frontend, text)
        print('Created frontend/.env.local.')
    else:
        print('Kept existing frontend/.env.local unchanged.')

if __name__ == '__main__':
    main()
