"""Build verified public and optional private source archives."""
from pathlib import Path
import argparse
import hashlib
import os
import zipfile

ROOT = Path(__file__).resolve().parents[1]
SKIP = {'.git', 'node_modules', '.next', '.venv', '__pycache__', '.pytest_cache', '.pnpm-store', 'out', 'cache', 'broadcast'}

def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--private', action='store_true')
    args = parser.parse_args()
    private = {ROOT / 'backend/.env', ROOT / 'frontend/.env.local'}
    destination = ROOT.parent / ('AEGIS-final-private-configured.zip' if args.private else 'AEGIS-final-source.zip')
    with zipfile.ZipFile(destination, 'w', zipfile.ZIP_DEFLATED) as archive:
        for folder, directories, files in os.walk(ROOT):
            directories[:] = sorted(d for d in directories if d not in SKIP)
            for name in sorted(files):
                path = Path(folder) / name
                if path.is_symlink() or name == '.DS_Store' or path.suffix in {'.zip', '.pyc', '.db', '.sqlite', '.sqlite3', '.tsbuildinfo'} or '.db-' in name:
                    continue
                if name.startswith('.env') and name != '.env.example' and not (args.private and path in private):
                    continue
                archive.write(path, Path('AEGIS-final') / path.relative_to(ROOT))
    with zipfile.ZipFile(destination) as archive:
        assert archive.testzip() is None
        names = archive.namelist()
        assert 'AEGIS-final/backend/app/models/artifacts/isolation_forest.joblib' in names
        assert 'AEGIS-final/docs/AEGIS_Monad_Submission_and_User_Guide.docx' in names
        if not args.private:
            assert not any(Path(n).name.startswith('.env') and Path(n).name != '.env.example' for n in names)
            secrets = []
            for path in private:
                if path.exists():
                    for line in path.read_text().splitlines():
                        if '=' in line and not line.startswith('#'):
                            key, value = line.split('=', 1)
                            if any(word in key for word in ['KEY', 'SECRET']) and len(value) >= 24:
                                secrets.append(value.encode())
            for name in names:
                data = archive.read(name)
                assert not any(secret in data for secret in secrets), 'Configured secret found in ' + name
    if args.private:
        destination.chmod(0o600)
    print(destination.name, destination.stat().st_size, 'bytes', len(names), 'files')
    print('SHA256', hashlib.sha256(destination.read_bytes()).hexdigest())

if __name__ == '__main__':
    main()
