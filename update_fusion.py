from __future__ import annotations

import argparse
import hashlib
import os
import time
from pathlib import Path


PROJECT_ROOT = Path(__file__).resolve().parent
DEFAULT_OUTPUT = PROJECT_ROOT / "fusion.txt"

IGNORED_DIRS = {
    ".git",
    ".hg",
    ".idea",
    ".mypy_cache",
    ".next",
    ".pytest_cache",
    ".ruff_cache",
    ".svn",
    ".vscode",
    "__pycache__",
    "build",
    "coverage",
    "dist",
    "node_modules",
    "venv",
}

IGNORED_FILES = {
    "fusion.txt",
    "package-lock.json",
    "update_fusion.py",
}

SOURCE_EXTENSIONS = {
    ".bat",
    ".cfg",
    ".css",
    ".dart",
    ".env",
    ".gradle",
    ".html",
    ".ini",
    ".java",
    ".js",
    ".json",
    ".jsx",
    ".kt",
    ".md",
    ".properties",
    ".ps1",
    ".py",
    ".scss",
    ".sh",
    ".sql",
    ".toml",
    ".ts",
    ".tsx",
    ".txt",
    ".xml",
    ".yaml",
    ".yml",
}

SOURCE_FILENAMES = {
    "Dockerfile",
    "Makefile",
}


def is_source_file(path: Path) -> bool:
    return path.name in SOURCE_FILENAMES or path.suffix.lower() in SOURCE_EXTENSIONS


def iter_source_files(root: Path, output: Path) -> list[Path]:
    files: list[Path] = []
    output = output.resolve()

    for current_root, dirnames, filenames in os.walk(root):
        current_path = Path(current_root)
        dirnames[:] = sorted(name for name in dirnames if name not in IGNORED_DIRS)

        for filename in sorted(filenames):
            path = current_path / filename
            if filename in IGNORED_FILES:
                continue
            if path.resolve() == output:
                continue
            if not is_source_file(path):
                continue
            files.append(path)

    return sorted(files, key=lambda file_path: file_path.relative_to(root).as_posix())


def read_text(path: Path) -> str:
    try:
        return path.read_text(encoding="utf-8")
    except UnicodeDecodeError:
        return path.read_text(encoding="utf-8", errors="replace")


def build_architecture(root: Path, files: list[Path]) -> list[str]:
    tree: dict[str, dict] = {}

    for path in files:
        current_level = tree
        for part in path.relative_to(root).parts:
            current_level = current_level.setdefault(part, {})

    def walk(level: dict[str, dict], prefix: str = "") -> list[str]:
        lines: list[str] = []
        items = sorted(level.items(), key=lambda item: (bool(item[1]), item[0].lower()))

        for index, (name, children) in enumerate(items):
            is_last = index == len(items) - 1
            connector = "`-- " if is_last else "|-- "
            lines.append(f"{prefix}{connector}{name}")

            if children:
                extension = "    " if is_last else "|   "
                lines.extend(walk(children, prefix + extension))

        return lines

    return [root.name, *walk(tree)]


def build_fusion(root: Path, output: Path) -> str:
    source_files = iter_source_files(root, output)
    lines = [
        "# Fusion du code source",
        f"# Racine du projet: {root}",
        f"# Genere automatiquement par: {Path(__file__).name}",
        "",
        "## Architecture du projet",
        "",
        "```text",
        *build_architecture(root, source_files),
        "```",
        "",
    ]

    for path in source_files:
        relative_path = path.relative_to(root).as_posix()
        lines.extend(
            [
                "",
                "=" * 88,
                f"FICHIER: {relative_path}",
                "=" * 88,
                "",
                read_text(path).rstrip(),
                "",
            ]
        )

    return "\n".join(lines).rstrip() + "\n"


def write_if_changed(root: Path, output: Path) -> bool:
    content = build_fusion(root, output)
    old_content = output.read_text(encoding="utf-8") if output.exists() else ""

    if content == old_content:
        return False

    output.parent.mkdir(parents=True, exist_ok=True)
    output.write_text(content, encoding="utf-8")
    return True


def snapshot(root: Path, output: Path) -> str:
    digest = hashlib.sha256()

    for path in iter_source_files(root, output):
        stat = path.stat()
        relative_path = path.relative_to(root).as_posix()
        digest.update(relative_path.encode("utf-8"))
        digest.update(str(stat.st_mtime_ns).encode("ascii"))
        digest.update(str(stat.st_size).encode("ascii"))

    return digest.hexdigest()


def watch(root: Path, output: Path, interval: float) -> None:
    last_snapshot = ""

    while True:
        current_snapshot = snapshot(root, output)
        if current_snapshot != last_snapshot:
            changed = write_if_changed(root, output)
            if changed:
                print(f"fusion.txt mis a jour: {output}")
            last_snapshot = current_snapshot
        time.sleep(interval)


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Regroupe le code source du projet dans fusion.txt et le maintient a jour."
    )
    parser.add_argument(
        "--root",
        type=Path,
        default=PROJECT_ROOT,
        help=f"Racine du projet a surveiller (defaut: {PROJECT_ROOT})",
    )
    parser.add_argument(
        "--output",
        type=Path,
        default=DEFAULT_OUTPUT,
        help=f"Fichier fusion a generer (defaut: {DEFAULT_OUTPUT})",
    )
    parser.add_argument(
        "--once",
        action="store_true",
        help="Genere fusion.txt une seule fois puis quitte.",
    )
    parser.add_argument(
        "--interval",
        type=float,
        default=1.0,
        help="Delai en secondes entre deux verifications en mode temps reel.",
    )
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    root = args.root.resolve()
    output = args.output.resolve()

    if not root.exists():
        raise SystemExit(f"Racine introuvable: {root}")

    if args.once:
        changed = write_if_changed(root, output)
        status = "mis a jour" if changed else "deja a jour"
        print(f"{output} {status}")
        return

    print(f"Surveillance de {root}")
    print(f"Sortie: {output}")
    watch(root, output, args.interval)


if __name__ == "__main__":
    main()
