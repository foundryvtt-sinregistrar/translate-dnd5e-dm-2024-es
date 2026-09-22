#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
build_release.py — Build a clean FoundryVTT module ZIP using `git archive`.

Key points:
- Reads `id` + `version` from module.json (repo root)
- Generates a ZIP from HEAD (committed content), not from the working tree
- Respects `.gitattributes` rules (export-ignore) automatically
- Writes output into ./dist/ by default
- Optionally fails if working tree is dirty (recommended for releases)

Usage:
-Uso recomendado (release “limpia”)
  python dev-tools/buildScripts/build_release.py

-Uso solo el versionado
  python dev-tools/buildScripts/build_release.py --no-alias

  python dev-tools/buildScripts/build_release.py --dist dist --ref HEAD

- Si estás en develop con cambios locales y quieres probar igual
  python dev-tools/buildScripts/build_release.py --allow-dirty

  python dev-tools/buildScripts/build_release.py --name translate-dnd5e-sdr2-es

Extra:
- Also creates a non-versioned alias ZIP: <id>.zip (same content as the versioned one)
"""

from __future__ import annotations

import argparse
import json
import subprocess
import sys
from pathlib import Path


def run(cmd: list[str], cwd: Path, capture: bool = True) -> str:
    p = subprocess.run(
        cmd,
        cwd=str(cwd),
        check=True,
        text=True,
        stdout=subprocess.PIPE if capture else None,
        stderr=subprocess.PIPE if capture else None,
    )
    return (p.stdout or "").strip()


def git_repo_root(start: Path) -> Path:
    try:
        out = run(["git", "rev-parse", "--show-toplevel"], cwd=start)
        return Path(out).resolve()
    except Exception as e:
        raise RuntimeError("No parece un repo Git (o Git no está disponible).") from e


def ensure_clean_worktree(repo_root: Path) -> None:
    status = run(["git", "status", "--porcelain"], cwd=repo_root)
    if status.strip():
        raise RuntimeError(
            "Working tree no está limpio (hay cambios sin commitear). "
            "Haz commit/stash, o usa --allow-dirty si quieres continuar."
        )


def load_module_meta(module_json_path: Path) -> tuple[str, str]:
    if not module_json_path.exists():
        raise FileNotFoundError(f"No existe: {module_json_path}")

    with module_json_path.open("r", encoding="utf-8") as f:
        data = json.load(f)

    mod_id = str(data.get("id", "")).strip()
    version = str(data.get("version", "")).strip()

    if not mod_id:
        raise ValueError("module.json no contiene 'id'.")
    if not version:
        raise ValueError("module.json no contiene 'version'.")

    return mod_id, version


def build_zip(repo_root: Path, ref: str, zip_path: Path, prefix: str) -> None:
    zip_path.parent.mkdir(parents=True, exist_ok=True)
    subprocess.run(
        ["git", "archive", "--format=zip", f"--prefix={prefix}/", "-o", str(zip_path), ref],
        cwd=str(repo_root),
        check=True,
    )


def main() -> int:
    ap = argparse.ArgumentParser(description="Build a clean FoundryVTT module ZIP using git archive.")
    ap.add_argument("--dist", default="dist", help="Directorio de salida (relativo al repo root).")
    ap.add_argument("--ref", default="HEAD", help="Git ref a empaquetar (HEAD, tag, commit, etc.).")
    ap.add_argument("--name", default="", help="Nombre base del ZIP (si vacío usa module.json:id).")
    ap.add_argument(
        "--allow-dirty",
        action="store_true",
        help="Permite generar el ZIP aunque haya cambios sin commitear.",
    )
    ap.add_argument(
        "--no-alias",
        action="store_true",
        help="No genera el ZIP adicional sin versión (<id>.zip).",
    )

    args = ap.parse_args()

    try:
        repo_root = git_repo_root(Path.cwd())
        module_json = repo_root / "module.json"
        mod_id, version = load_module_meta(module_json)

        if not args.allow_dirty:
            ensure_clean_worktree(repo_root)

        base_name = args.name.strip() if args.name.strip() else mod_id
        dist_dir = (repo_root / args.dist).resolve()
        dist_dir.mkdir(parents=True, exist_ok=True)

        # 1) Versioned ZIP: <id>-<version>.zip
        zip_versioned = dist_dir / f"{base_name}-{version}.zip"
        build_zip(repo_root=repo_root, ref=args.ref, zip_path=zip_versioned, prefix=base_name)

        # 2) Alias ZIP: <id>.zip (same content)
        zip_alias = dist_dir / f"{base_name}.zip"
        if not args.no_alias:
            build_zip(repo_root=repo_root, ref=args.ref, zip_path=zip_alias, prefix=base_name)

        # Print result
        def print_zip(p: Path, label: str) -> None:
            size_mb = p.stat().st_size / (1024 * 1024)
            print(f"{label}: {p}  ({size_mb:.2f} MB)")

        print_zip(zip_versioned, "OK (versioned)")
        if not args.no_alias:
            print_zip(zip_alias, "OK (alias)")
        print(f"Ref: {args.ref}")
        print(f"Prefix: {base_name}/")
        return 0

    except subprocess.CalledProcessError as e:
        err = ""
        try:
            err = e.stderr.decode() if isinstance(e.stderr, (bytes, bytearray)) else (e.stderr or "")
        except Exception:
            err = ""
        msg = err.strip() or str(e)
        print(f"ERROR (git): {msg}", file=sys.stderr)
        return 2

    except Exception as e:
        print(f"ERROR: {e}", file=sys.stderr)
        return 1


if __name__ == "__main__":
    raise SystemExit(main())