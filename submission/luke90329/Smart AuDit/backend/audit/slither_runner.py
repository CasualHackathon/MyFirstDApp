import json
import os
import subprocess
from pathlib import Path
from typing import Dict, Any, List


def _basename(path: Any) -> Any:
    if not path or not isinstance(path, str):
        return path
    try:
        return Path(path).name
    except Exception:
        try:
            return path.split('/')[-1].split('\\')[-1]
        except Exception:
            return path


def _normalize_issues(slither_json: Dict[str, Any]) -> List[Dict[str, Any]]:
    issues: List[Dict[str, Any]] = []
    try:
        detectors = slither_json.get("results", {}).get("detectors", [])
        for d in detectors:
            check = d.get("check") or d.get("impact") or d.get("description") or "issue"
            impact = d.get("impact") or d.get("confidence") or "info"
            description = d.get("description") or d.get("markdown") or ""
            elements = d.get("elements") or []
            locations = []
            for e in elements:
                src = e.get("source_mapping", {})
                fn_abs = src.get("filename_absolute")
                fn_rel = src.get("filename_relative")
                fn = src.get("filename")
                filename = _basename(fn_abs or fn_rel or fn)
                locations.append({
                    "filename": filename,
                    "lineno": src.get("lines"),
                    "type": e.get("type"),
                    "name": e.get("name"),
                })
            issues.append({
                "check": str(check),
                "severity": str(impact),
                "description": str(description),
                "locations": locations,
                "raw": d,
            })
    except Exception:
        detectors = slither_json.get("results", {}).get("detectors", [])
        for d in detectors:
            issues.append({"check": d.get("check"), "severity": d.get("impact"), "description": d.get("description"), "raw": d})
    return issues


def _run(cmd: List[str], cwd: Path, log_path: Path) -> subprocess.CompletedProcess:
    proc = subprocess.run(cmd, cwd=str(cwd), capture_output=True, text=True)
    try:
        with open(log_path, "a", encoding="utf-8") as f:
            f.write("$ " + " ".join(cmd) + "\n")
            if proc.stdout:
                f.write(proc.stdout + "\n")
            if proc.stderr:
                f.write(proc.stderr + "\n")
    except Exception:
        pass
    return proc


def run_slither(target_dir: str, output_json: str) -> Dict[str, Any]:
    out_path = Path(output_json)
    out_path.parent.mkdir(parents=True, exist_ok=True)

    src_dir = Path(target_dir)
    sol_files = [p.name for p in src_dir.glob("*.sol")]
    log_path = src_dir / "slither.log"

    if not sol_files:
        out_path.write_text(json.dumps({"results": {"detectors": []}}), encoding="utf-8")
        return {"issues": [], "raw": {"results": {"detectors": []}}}

    # 僅保留最小參數：--json
    cmd = ["slither", *sol_files, "--json", str(out_path)]
    _run(cmd, cwd=src_dir, log_path=log_path)

    try:
        raw = json.loads(out_path.read_text(encoding="utf-8"))
    except Exception:
        raw = {"results": {"detectors": []}}

    normalized = {
        "issues": _normalize_issues(raw),
        "raw": raw,
    }
    return normalized
