import hashlib
from typing import Dict, Any, List


def build_report(job_id: int, analysis: Dict[str, Any]) -> Dict[str, Any]:
    issues: List[Dict[str, Any]] = analysis.get("issues", [])
    summary = analysis.get("summary", "")
    llm_output = analysis.get("llm_output", "")
    content = {
        "job_id": job_id,
        "summary": summary,
        "issues": issues,
        "observations": analysis.get("observations", []),
        "llm_model": analysis.get("llm_model"),
        "llm_output": llm_output,
    }
    blob = str(content).encode("utf-8")
    content["report_hash"] = hashlib.sha256(blob).hexdigest()
    return content
