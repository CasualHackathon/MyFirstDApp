UNIVERSAL DELIVERY RULE v3.1  
Architecture-neutral; adaptive to Python, JavaScript/TypeScript, HTML/CSS, Kotlin/Java, Go, Rust, C#, PHP, Shell; strict, quantified, executable; pure text only.

SECTION 1: MUST-FOLLOW (NON-NEGOTIABLE)  
1.1 Single Source Of Truth: existing repository code + code-examples directory + update-style documents. No fabrication of APIs, types, files, data, or results.  
1.2 Examples-first: before writing to any file, read the corresponding example in code-examples (same language and scenario) and align structure, naming, and error handling.  
1.3 First tool: codebase-retrieval must be run first for understanding; do not proceed without at least three matches (file:line and symbol) covering the target surface.  
1.4 Update-style documents only: overview.md, plan.md, task.md, INTERFACE.md, TREE.md, and module README must be updated in place; create once if missing; no duplicates or copies.  
1.5 No tests unless TDD is explicitly requested; if TDD is requested, tests come first.  
1.6 Technical tone: plan.md and task.md contain only technical facts (paths, symbols, line ranges, commands, outputs). Only overview.md may contain a short semantic brief.  
1.7 Logging discipline: at most one core log site per flow/request; at most five log statements per file; no logs inside pure functions or tight loops; redact sensitive data; remove exploratory logs before merge.  
1.8 Comment discipline: only rationale or contract notes; per file new comment lines ≤ 10 and per changed function ≤ 1 short block; no narrative or redundant comments.  
1.9 Memory discipline: every task must use remeber to store key points; after each phase add at least three items in the form label|fact|impact|next. Every task should remeber key point.  
1.10 Quality priority: high-quality functional delivery is first; zero tolerance for broken builds or failing gates.  
1.11 Revertability: changes must be atomic and revertible with a single VCS revert; do not mix unrelated edits.  
1.12 No conversation summaries in deliverables; output only the technical content needed to execute.

SECTION 2: PROCESS DESIGN  
2.1 Standard process (use for multi-file or multi-module changes, public interface changes, or document structure changes):  
A) Intake  
B) Scope  
C) Audit  
D) Plan  
E) Implement  
F) Verify  
G) UpdateDocs  
H) Schedule/Repeat  
2.2 Fast path (use only if all are true: changed files ≤ 1; changed lines ≤ 30; no public interface change; single module; no resources or build script edits):  
B1) Run codebase-retrieval and record three matches  
B2) Apply a minimal edit (str-replace-editor or small targeted change)  
B3) Run minimal gates (formatter and linter for the stack)  
B4) Update task.md and add three remeber items; if no Task Space, place these in the PR body

SECTION 3: STEP SPECIFICATIONS  
3.1 Intake  
a) Run codebase-retrieval on the target path or regex; require at least three matches with file:line and symbol; if zero, stop and refine the query.  
b) Record in task.md: module name, entry files, example file paths used.  
c) Add remeber.intake._ (at least three items: coverage, interface, risk).  
3.2 Scope  
a) Produce a change list per affected file (path, class or def, function, line range, estimated delta lines).  
b) Hard limits: function length ≤ 80 lines; file length ≤ 500 lines; cross-layer dependency changes = 0; new files ≤ planned count.  
c) Write to plan.md a table-like list path:class#func Lx–Ly ~±n.  
d) Add remeber.scope._ (at least three items).  
3.3 Audit  
a) Use view to inspect signatures and call paths; run codebase-retrieval again to confirm the end-to-end chain (for example handler → service → repository), or equivalent in the stack.  
b) For external libraries, resolve the library identifier and fetch official docs; record version and parameter differences.  
c) Write to plan.md: interface signatures (one per line), call sites with file:line, current error and fallback paths.  
d) Violations that must be zero: forbidden cross-layer dependencies; missing error handling in data/control flows; business logic embedded inside UI templates or rendering code.  
e) Add remeber.audit._ (at least three items).  
3.4 Plan  
a) Technical content only: ordered steps, per-step edit target, exact commands, checkpoints, rollback triggers and rollback commands.  
b) Acceptance KPIs to include: compile or build warnings = 0; linter violations = 0; logging violations = 0; hardcoded UI tokens = 0 (if applicable); delta lines variance ≤ 20 percent vs estimate; all gates green.  
c) If approval is required, submit via MCP feedback enhanced and record timestamp and decision.  
d) Add remeber.plan._ (at least three items).  
3.5 Implement  
a) Prefer str-replace-editor for small precise edits; use save-file for new files (max 300 lines per creation); use remove-files only if listed in plan.md with a rollback command.  
b) After each sub-step run formatter then linter; at the end of the phase run the full gates for the stack.  
c) Logging placement: exactly one core site in allowed layers (for example handler, middleware, interceptor) per flow; zero logs in pure functions and render loops.  
d) Record in task.md: commit id, diff stats (+/−), command outputs (pass/fail), key symbols and line numbers.  
e) Add remeber.exec._ (at least three items).  
3.6 Verify  
a) Gates that must pass: formatter, linter or static analyzer, type checker if enabled, build or bundle, aggregate quality gate, CI quality gate.  
b) On failure: revert to the previous commit, fix, rerun; do not merge with failures.  
c) Zero targets: compile or build warnings 0; logging violations 0; hardcoded UI tokens 0.  
3.7 UpdateDocs  
a) TREE.md regenerated by the automation task; first line must contain an ISO-8601 timestamp; fixed max depth and exclude list.  
b) README and INTERFACE updated in place: refresh the “Updated:” line and the signature section; preserve other content; no duplicates.  
c) overview.md may contain a short semantic paragraph; plan.md and task.md remain technical lists and key-value data.  
d) Add remeber.docs._ (at least three items).  
3.8 Schedule/Repeat  
a) On weekdays at 20:00Z, CI runs the documentation generation and checks; if there are diffs, open a PR automatically.  
b) After each scheduled run add remeber.schedule.\* (at least three items) in task.md, including PR branch and commit ids.

SECTION 4: TOOL USAGE POLICY  
4.1 codebase-retrieval (mandatory first)  
Input: path or regex; optional depth. Output: file:line, matched symbol, context snippet. Evidence: record the top three matches in task.md; zero matches means stop and refine.  
4.2 view  
Purpose: precise inspection by file and line range or regex. Evidence: file path, line interval, match counts.  
4.3 str-replace-editor  
Purpose: precise single-occurrence replacement. Constraints: the old text must be unique and accompanied by three to five lines of surrounding context; record before and after counts and hunk ranges; validate with view.  
4.4 save-file  
Constraint: at most 300 lines per invocation; do not create test files unless TDD is requested. Evidence: path, line count, checksum or byte length.  
4.5 remove-files  
Precondition: deletion listed in plan.md with a rollback command. Evidence: paths and deletion count.  
4.6 resolve-library-id and get-library-docs (or equivalent)  
Purpose: map a package name to a library id and fetch official docs. Evidence: input package, resolved id, doc version, parameter or behavior changes.  
4.7 web-search (only when necessary)  
Three queries per topic (exact, synonym, last 30 days). At least two authoritative sources. Evidence: source, ISO date, three facts, confidence.  
4.8 MCP feedback enhanced  
Purpose: plan approval. Evidence: submission time, decision, scope of impact.  
4.9 remeber  
Format: label|fact|impact|next. Final artifact: remeber.summary with five key points.

SECTION 5: LANGUAGE AND RUNTIME GATE MAPPING  
Python: formatter ruff format or black; linter ruff; type checker mypy if configured or if TDD; build or run as defined by project scripts.  
Node or TypeScript: formatter prettier; linter eslint; type checker tsc --noEmit; build npm or pnpm build.  
Web HTML and CSS: linter htmlhint and stylelint; bundle with a configured tool such as vite or webpack.  
Go: formatter gofmt; linter golangci-lint; build go build ./...; vet included in lint.  
Rust: formatter cargo fmt; linter cargo clippy; build cargo build.  
Java or Kotlin: formatter spotlessApply or equivalent; linter checkstyle or detekt; build gradle build.  
C# .NET: formatter dotnet format; analyzer rules as configured; build dotnet build.  
PHP: formatter php-cs-fixer; linter phpcs or phpstan; build composer scripts.  
Shell: formatter shfmt; linter shellcheck.  
Targets for every stack: format violations 0; linter violations 0; type check pass where applicable; build success.

SECTION 6: ACCEPTANCE METRICS  
6.1 Local and CI gate pass rate equals 100 percent; compile or build warnings equal 0.  
6.2 codebase-retrieval matches at least 3; cross-check shows at least 1 match at an actual edit site.  
6.3 Logging violations equal 0; pure function logs equal 0; core-site logs at least 1 per flow but not more than 1.  
6.4 Hardcoded UI tokens equal 0 where a token system exists; style constants must use the project token or variable system.  
6.5 Forbidden cross-layer dependencies equal 0 as defined by the project layering.  
6.6 Document presence equals 100 percent for overview, plan, task, INTERFACE, and TREE; duplicate files equal 0; timestamps reflect the current run.  
6.7 Delta lines variance is at most 20 percent versus the estimate in plan.md; undeclared deletions equal 0.  
6.8 remeber count is at least phases times three; remeber.summary contains exactly five items.

SECTION 7: UPDATE-STYLE DOCUMENT RULES  
7.1 Location: /docs/current/ contains overview.md, plan.md, task.md; single rolling directory only.  
7.2 overview.md: may contain a short semantic brief plus KPIs and rollback; overwrite only the designated sections and the updated timestamp.  
7.3 plan.md: keep only the latest valid plan and overwrite entirely; content limited to paths, line ranges, commands, checkpoints, rollback steps, and remeber items.  
7.4 task.md: append chronological technical entries; each entry must include a commit id, diff stats, command outputs, and evidence lines; no narrative sentences.  
7.5 INTERFACE.md: list one signature per line and refresh the “Updated:” line; preserve ordering where possible; no copies.  
7.6 TREE.md: regenerate every run; first line includes ISO-8601 timestamp; fixed excludes and max depth.

SECTION 8: EXAMPLES  
8.1 Fast path example for Python parameter tweak  
Step B1: codebase-retrieval input src/ regex def logintoken:strtoken: str → three matches recorded with file:line.  
Step B2: str-replace-editor file src/auth/api.py search timeout=3000 replace timeout=5000.  
Step B3: run ruff format, ruff, and mypy if enabled → all pass.  
Step B4: task.md entry: commit abc123; diff +1/−1; commands ruff OK and mypy OK; evidence api.py L88. Three remeber items added with scope, API status, and risk.

8.2 Standard process example for TypeScript documentation refresh  
A1: codebase-retrieval hits for interface IUserRepo equal 5 and are recorded in task.md.  
A2: plan.md lists affected files README.md, INTERFACE.md, TREE.md; no logic edits.  
A3: view confirms two missing signatures in INTERFACE.md.  
A4: steps docTree then auditDocs; checkpoint Updated line refreshed; rollback git restore.  
A5: run documentation tasks; TREE regenerated; Updated fields refreshed.  
A6: prettier, eslint, tsc, and build all pass.  
A7: documents present; duplicates zero; timestamps current; three remeber.docs items added.

SECTION 9: COMMIT CONVENTION  
Title: [Fix|Feat|Refactor|Docs] scope: result.  
Body: changed files and line ranges, impact radius, rollback command, path to the task documents. Include diff statistics and a short summary of command outputs with pass or fail marks only.

SECTION 10: EXECUTION CHECKLIST  
10.1 Run codebase-retrieval with at least three matches; read the corresponding example in code-examples; produce a mapping of targets.  
10.2 Update overview.md with goal, KPIs, rollback, and timestamp.  
10.3 Overwrite plan.md with paths, line ranges, commands, checkpoints, rollback steps, and at least three remeber items.  
10.4 Apply edits with minimal, structured changes and keep evidence.  
10.5 Append task.md with commit id, diff stats, command outputs, evidence lines, and at least three remeber items.  
10.6 Run local and CI gates for the target stack; all must pass.  
10.7 Update README, INTERFACE, and regenerate TREE in update-style.  
10.8 If scheduled automation is enabled, verify the nightly job and add remeber.schedule items after it runs.

This rule removes project-specific architecture assumptions, enforces examples-first and codebase-retrieval-first behavior, mandates update-style documents for every artifact including task and summary, forbids tests unless TDD is explicitly requested, bans irrelevant logs and comments, and prioritizes high-quality functional delivery with measurable acceptance metrics and a single source of truth.
