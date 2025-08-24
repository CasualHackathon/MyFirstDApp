import os
import json
from pathlib import Path
from typing import Dict, Any, List

BASE = os.getenv("REPORT_ROOT", "./reports")


def _to_markdown(report: Dict[str, Any]) -> str:
    job_id = report.get("job_id")
    summary = report.get("summary", "")
    issues: List[Dict[str, Any]] = report.get("issues", []) or []
    observations: List[str] = report.get("observations", []) or []
    report_hash = report.get("report_hash", "")
    llm_output = report.get("llm_output", "")
    lines: List[str] = []
    lines.append(f"# Audit Report — Job {job_id}")
    lines.append("")
    lines.append("## Summary")
    if summary:
        lines.append("```solidity")
        lines.append(summary)
        lines.append("```")
    else:
        lines.append("(no summary)")
    lines.append("")
    lines.append("## Findings")
    if not issues:
        lines.append("- No issues detected by static analysis / LLM.")
    else:
        for i, issue in enumerate(issues, start=1):
            title = issue.get("check", issue.get("id", f"Issue {i}"))
            severity = issue.get("severity") or issue.get("impact") or "info"
            detail = issue.get("description") or issue.get("msg") or ""
            lines.append(f"- [{severity}] {title}")
            if detail:
                lines.append(f"  - {detail}")
            locs = issue.get("locations") or []
            for loc in locs:
                fn = loc.get("filename")
                ln = loc.get("lineno")
                if fn or ln:
                    lines.append(f"  - location: {fn or '-'} : {ln or '-'}")
    lines.append("")
    if llm_output:
        lines.append("## LLM Output")
        lines.append(llm_output)
        lines.append("")
    # Observations 區塊不再輸出於 Markdown
    if report_hash:
        lines.append(f"---\nReport Hash: `{report_hash}`")
    return "\n".join(lines)


def save_report(job_id: int, report: Dict[str, Any]) -> str:
    base = Path(BASE)
    base.mkdir(parents=True, exist_ok=True)

    # JSON 檔
    json_path = base / f"{job_id}.json"
    json_path.write_text(json.dumps(report, ensure_ascii=False, separators=(",", ":")), encoding="utf-8")

    # Markdown 檔
    md_path = base / f"{job_id}.md"
    md_path.write_text(_to_markdown(report), encoding="utf-8")

    return f"/reports/{job_id}"
