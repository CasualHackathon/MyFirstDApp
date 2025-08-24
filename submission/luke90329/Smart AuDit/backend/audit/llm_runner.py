import os
from typing import Dict, Any, List


def _build_prompt(source_summary: str, issues: List[Dict[str, Any]]) -> str:
    # 將 issues 轉為可讀清單
    rendered: List[str] = []
    for i, it in enumerate(issues, start=1):
        title = it.get("check") or it.get("id") or f"Issue {i}"
        sev = it.get("severity") or it.get("impact") or "info"
        desc = it.get("description") or ""
        locs = it.get("locations") or []
        loc_str = "; ".join([f"{l.get('filename')}:{l.get('lineno')}" for l in locs if l])
        rendered.append(f"- [{sev}] {title} — {desc} ({loc_str})")
    rendered_text = "\n".join(rendered) if rendered else "(no slither issues)"

    lines = [
        "You are a senior smart contract auditor.",
        "Task:",
        "1) Review the Solidity source and Slither findings.",
        "2) Deduplicate and prioritize REAL vulnerabilities (Critical/High/Medium).",
        "3) For each real finding: explain root cause, risk, remediation, and point the exact location (file:lines).",
        "4) Identify false positives explicitly and give reasons.",
        "5) Add any missed findings not reported by Slither.",
        "6) Output must be concise and actionable.",
        "",
        "Solidity Source:",
        source_summary[:120000],
        "",
        "Slither Findings (normalized):",
        rendered_text[:4000],
    ]
    return "\n".join(lines)


def run_llm(source_summary: str, slither_json: Dict[str, Any]) -> Dict[str, Any]:
    api_key = os.getenv("OPENAI_API_KEY", "").strip()
    model = os.getenv("LLM_MODEL", "gpt-4o-mini").strip() or "gpt-4o-mini"
    base_url = os.getenv("OPENAI_BASE_URL", "").strip() or None
    organization = os.getenv("OPENAI_ORG", "").strip() or None

    issues = slither_json.get("issues", []) if isinstance(slither_json, dict) else []

    if not api_key:
        return {
            "summary": source_summary[:2000],
            "issues": issues,
            "observations": [
                "Degraded mode: no LLM key, returning static analysis only.",
            ],
            "llm_mode": "degraded",
        }

    try:
        from openai import OpenAI
        from openai import BadRequestError, APIConnectionError, AuthenticationError, RateLimitError

        client_kwargs = {"api_key": api_key}
        if base_url:
            client_kwargs["base_url"] = base_url
        if organization:
            client_kwargs["organization"] = organization
        client = OpenAI(**client_kwargs)

        prompt = _build_prompt(source_summary, issues)

        create_kwargs: Dict[str, Any] = {
            "model": model,
            "messages": [
                {"role": "system", "content": "You are a helpful and rigorous smart contract auditor."},
                {"role": "user", "content": prompt},
            ],
        }
        if model.startswith("gpt-5"):
            create_kwargs["max_completion_tokens"] = 900
            create_kwargs["temperature"] = 1
        else:
            create_kwargs["max_tokens"] = 900
            create_kwargs["temperature"] = 0.2

        resp = client.chat.completions.create(**create_kwargs)
        content = resp.choices[0].message.content if resp.choices else ""
        return {
            "summary": source_summary[:2000],
            "issues": issues,
            "llm_model": model,
            "llm_output": content,
            "observations": [
                "LLM mode: combined with static analysis.",
            ],
            "llm_mode": "llm",
        }
    except (BadRequestError, APIConnectionError, AuthenticationError, RateLimitError) as e:  # type: ignore[name-defined]
        return {
            "summary": source_summary[:2000],
            "issues": issues,
            "observations": [
                f"LLM error ({e.__class__.__name__}): {getattr(e, 'message', str(e))}",
                "Falling back to static analysis only.",
            ],
            "llm_error": str(e),
            "llm_model": model,
            "llm_mode": "error_degraded",
        }
    except Exception as e:
        return {
            "summary": source_summary[:2000],
            "issues": issues,
            "observations": [
                f"LLM error: {e}",
                "Falling back to static analysis only.",
            ],
            "llm_error": str(e),
            "llm_model": model,
            "llm_mode": "error_degraded",
        }
