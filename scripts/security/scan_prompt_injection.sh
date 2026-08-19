#!/usr/bin/env bash
# scan_prompt_injection.sh — Detect prompt injection attempts in project files
# Usage: bash scan_prompt_injection.sh [project_root]
#
# This script scans for hidden instructions, invisible characters, encoded payloads,
# and other content designed to manipulate AI coding agents that read the codebase.

set -euo pipefail

PROJECT_ROOT="${1:-.}"
FINDING_COUNT=0

# La mayoría de checks de este script dependen de `grep -P` (PCRE). El grep de
# BSD que trae macOS NO soporta -P: no falla de forma visible, simplemente
# devuelve 0 resultados. Es decir, en un Mac este scanner puede decir "todo
# limpio" mientras el CI (Ubuntu, GNU grep) encuentra hallazgos CRITICAL — pasó
# de verdad y tumbó el CI del PR #14 después de varias pasadas locales en verde.
# Preferimos ggrep si está (brew install grep) y, si no hay ningún grep con -P,
# abortamos en vez de dar un falso "sin hallazgos".
# Ojo con cómo se comprueba: `grep -qP '' /dev/null` NO sirve como test, porque
# un fichero vacío no tiene coincidencias y devuelve 1 igual que un grep sin -P.
# Hay que darle una entrada que sí case.
if printf 'x\n' | grep -qP 'x' 2>/dev/null; then
    GREP=grep
elif command -v ggrep >/dev/null 2>&1 && printf 'x\n' | ggrep -qP 'x' 2>/dev/null; then
    GREP=ggrep
else
    echo "ERROR: este scanner necesita un grep con soporte -P (PCRE)." >&2
    echo "       El grep de macOS no lo tiene. Instala GNU grep:  brew install grep" >&2
    echo "       Sin él, los checks devolverían 'sin hallazgos' aunque los haya." >&2
    exit 2
fi

RED='\033[0;31m'
YELLOW='\033[0;33m'
GREEN='\033[0;32m'
CYAN='\033[0;36m'
MAGENTA='\033[0;35m'
NC='\033[0m'

# NOTE: path-anchored --exclude-dir (a pattern containing "/", intended to match the full
# relative path rather than a bare directory basename) turned out to be unreliable across GNU
# grep versions — it worked with the GNU grep 3.12 installed locally for testing (`brew install
# grep`) but NOT on the actual GitHub Actions Ubuntu runner, which silently fell back to
# scanning scripts/security/ anyway. A bare "--exclude-dir=security" isn't safe either (see
# POST_EXCLUDE_FILES below — same class of bug: it would skip any unrelated future directory
# merely named "security", e.g. a hypothetical src/security/). So none of this tool's own
# directories/files are excluded via grep's own --exclude/--exclude-dir flags at all; everything
# goes through POST_EXCLUDE_FILES, a plain `grep -v` on the OUTPUT, which has no such trap and
# is directly testable against `grep -rn` output text rather than trusting an --exclude flag's
# internal path-matching behavior to be consistent.
EXCLUDE="--exclude-dir=.git --exclude-dir=node_modules --exclude-dir=vendor --exclude-dir=__pycache__ --exclude-dir=.venv --exclude-dir=venv --exclude-dir=dist --exclude-dir=build --exclude-dir=target"

# Strips result lines whose file is: this tool's own implementation and documentation, anywhere
# under ./security/ or ./scripts/security/ (including nested paths like security/reviews/ —
# both trees are 100% our own authored content, not any other directory merely named
# "security", e.g. a hypothetical src/security/ stays fully scanned); our own checklists
# specifically under .claude/agents/ or .claude/commands/ (NOT any file named security-*.md
# anywhere else in the repo); or a package-manager lockfile (long random-looking base64/hex
# integrity hashes routinely contain "//" or hex runs by pure chance, e.g. a sha512 hash
# containing "//" satisfies the base64-in-a-comment heuristic — excluded regardless of
# location, since lockfiles are machine-generated wherever they are); or the specific
# third-party skill directories under .agents/skills/ installed via `npx skills add` (see
# AGENTS.md). This is NOT a blanket exemption for .agents/skills/ — a differently-named skill
# added later is still fully scanned until someone reviews it the same way and adds it here by
# exact path. Each one listed was reviewed by hand:
# - supabase, supabase-postgres-best-practices: every flagged line is legitimate Postgres/RLS
#   security documentation from Supabase's official repo that happens to discuss bypass/override
#   mechanics as its subject matter (e.g. "SECURITY DEFINER functions bypass RLS"), the same
#   false-positive class as our own security docs above.
# - web-design-guidelines: flags on its own description of fetching UI guidelines from a URL at
#   review time (WebFetch) — legitimate design/a11y/perf checklist fetched fresh from Vercel's
#   public repo each use, not a hidden instruction. Note this one is NOT hash-pinned like the
#   Supabase skills (its content changes upstream between reviews by design), so "reviewed" here
#   means the SKILL.md wrapper, not a guarantee about whatever the fetched guidelines currently say.
POST_EXCLUDE_FILES='^\./(security|scripts/security)/|(^|/)(package-lock\.json|yarn\.lock|pnpm-lock\.yaml|bun\.lockb|Cargo\.lock|go\.sum|composer\.lock|Gemfile\.lock|poetry\.lock):|\.claude/(agents|commands)/security-[^/:]+\.md:|^\./\.agents/skills/(supabase|supabase-postgres-best-practices|web-design-guidelines)/'

finding() {
    local severity="$1" category="$2" file="$3" detail="$4"
    FINDING_COUNT=$((FINDING_COUNT + 1))
    echo -e "  ${RED}[$severity]${NC} ${MAGENTA}$category${NC} | $file"
    echo "    $detail"
}

echo "=== Security Review: Prompt Injection Scanner ==="
echo "Project: $PROJECT_ROOT"
echo "Date: $(date -u +%Y-%m-%dT%H:%M:%SZ)"
echo ""
echo "This scanner detects content designed to manipulate AI coding agents."
echo "False positives are possible — review each finding in context."

# ═══════════════════════════════════════════════
# 1. INVISIBLE / ZERO-WIDTH CHARACTERS
# ═══════════════════════════════════════════════
echo -e "\n${CYAN}── [1/7] Invisible Unicode Characters ──${NC}"

# Scan all text files for zero-width and bidirectional control characters
# These are almost never legitimate in source code
ZWSP_PATTERN='[\x{200B}\x{200C}\x{200D}\x{2060}\x{FEFF}\x{00AD}]'
BIDI_PATTERN='[\x{200E}\x{200F}\x{202A}-\x{202E}\x{2066}-\x{2069}]'

while IFS= read -r file; do
    [ -z "$file" ] && continue
    # Check for zero-width characters
    # NOTE: -CSD forces UTF-8 decoding of std handles (S) and -n/-p input + open() (D),
    # WITHOUT the locale-dependent "L" that bare "-C" implies. Bare "-C" only decodes as
    # UTF-8 when the runtime locale is UTF-8; under LC_ALL=C/LANG=C (common on minimal CI
    # runners) it silently falls back to byte matching, and byte 0xAD — part of the UTF-8
    # encoding of many accented characters, e.g. "í" = 0xC3 0xAD — falsely triggers the
    # U+00AD soft-hyphen check on any non-English text. -CSD is locale-independent.
    if perl -CSD -ne "exit 1 if /$ZWSP_PATTERN/" "$file" 2>/dev/null; then
        : # no match
    else
        linenum=$(perl -CSD -ne "print \"\$.\n\" if /$ZWSP_PATTERN/" "$file" 2>/dev/null | head -1)
        finding "CRITICAL" "Invisible Chars" "$file" "Zero-width characters detected at line $linenum — may hide instructions from human review"
    fi
    # Check for bidirectional override characters (Trojan Source attack)
    if perl -CSD -ne "exit 1 if /$BIDI_PATTERN/" "$file" 2>/dev/null; then
        : # no match
    else
        linenum=$(perl -CSD -ne "print \"\$.\n\" if /$BIDI_PATTERN/" "$file" 2>/dev/null | head -1)
        finding "CRITICAL" "Bidi Override" "$file" "Bidirectional control characters at line $linenum — Trojan Source attack vector"
    fi
done < <(find "$PROJECT_ROOT" \( -name "*.js" -o -name "*.ts" -o -name "*.py" -o -name "*.rb" \
    -o -name "*.go" -o -name "*.java" -o -name "*.rs" -o -name "*.md" -o -name "*.txt" \
    -o -name "*.yaml" -o -name "*.yml" -o -name "*.json" -o -name "*.toml" -o -name "*.sh" \
    -o -name "*.jsx" -o -name "*.tsx" -o -name "*.html" -o -name "*.svg" -o -name "*.xml" \
    -o -name "*.css" -o -name "*.php" -o -name "*.cs" \) \
    -not -path "*/.git/*" -not -path "*/node_modules/*" -not -path "*/vendor/*" \
    -not -path "*/dist/*" -not -path "*/build/*" -not -path "*/target/*" \
    -size -1M 2>/dev/null)

# ═══════════════════════════════════════════════
# 2. AGENT-TARGETED INSTRUCTIONS IN COMMENTS/TEXT
# ═══════════════════════════════════════════════
echo -e "\n${CYAN}── [2/7] Agent-Targeted Instructions ──${NC}"

# Patterns that address AI assistants/agents directly
# NOTE: \b (word boundary) around the trigger verb is required on the loose verb+noun
# patterns (override/bypass/skip/disable) — without it, "skip.*check" matches inside
# ordinary camelCase identifiers like "skipLibCheck" (a real, common TS compiler option),
# since ".*" happily bridges across the middle of one contiguous word. \b only blocks a
# match when the verb is glued to more letters (identifiers); real natural-language
# instructions ("skip the validation check") keep matching normally.
AI_DIRECTIVE_PATTERNS=(
    'ignore.*previous.*instruction'
    'ignore.*above.*instruction'
    '\boverride\b.*(?:security|safety|restriction|permission|check)'
    'you are now'
    'new instruction'
    'system prompt'
    'forget.*(?:previous|above|earlier)'
    'disregard.*(?:previous|above|earlier|all)'
    'act as.*(?:admin|root|system|unrestricted)'
    'maintenance mode'
    '\bbypass\b.*(?:check|validation|security|auth|filter)'
    '\bskip\b.*(?:security|validation|check|auth|verification)'
    '\bdisable\b.*(?:security|validation|check|auth|logging)'
    'do not.*\b(?:log|report|alert|notify|check)\b'
    # Los \b aquí no son decorativos: sin ellos, 'AI' matchea dentro de
    # "await"/"email"/"failure" y 'send' dentro de "resend", así que una línea
    # tan inocente como `await resendCode(email)` se reportaba como CRITICAL
    # "Agent Directive". Pasó de verdad: tumbó el CI del PR #14 con 5 falsos
    # positivos, todos en código de auth legítimo. Verificado tras el cambio
    # que sigue detectando los ataques reales (ver tests abajo).
    '\b(?:AI|assistant|agent|model|Claude|GPT|LLM)\b.*\b(?:execute|run|download|fetch|curl|send)\b'
    'IMPORTANT.*\b(?:AI|assistant|agent|model)\b.*\b(?:ignore|override|skip|bypass)\b'
    '(?:hidden|secret).*instruction'
)

COMBINED_PATTERN=$(IFS='|'; echo "${AI_DIRECTIVE_PATTERNS[*]}")

results=$("$GREP" -rniP "$COMBINED_PATTERN" "$PROJECT_ROOT" \
    $EXCLUDE \
    --include="*.md" --include="*.txt" --include="*.rst" \
    --include="*.js" --include="*.ts" --include="*.py" --include="*.rb" \
    --include="*.go" --include="*.java" --include="*.rs" --include="*.yaml" \
    --include="*.yml" --include="*.json" --include="*.toml" --include="*.html" \
    --include="*.svg" --include="*.xml" --include="*.sh" --include="*.css" \
    --include="*.jsx" --include="*.tsx" --include="*.php" \
    2>/dev/null | head -50 || true)
results=$(echo "$results" | grep -vE "$POST_EXCLUDE_FILES" || true)

if [ -n "$results" ]; then
    echo "$results" | while IFS= read -r line; do
        file=$(echo "$line" | cut -d: -f1)
        linenum=$(echo "$line" | cut -d: -f2)
        content=$(echo "$line" | cut -d: -f3- | head -c 120)
        finding "CRITICAL" "Agent Directive" "$file:$linenum" "$content"
    done
else
    echo -e "  ${GREEN}✓${NC} No direct agent-targeted instructions found"
fi

# ═══════════════════════════════════════════════
# 3. CLAUDE.md AND AGENT CONFIG INTEGRITY
# ═══════════════════════════════════════════════
echo -e "\n${CYAN}── [3/7] Agent Configuration Files ──${NC}"

# Check CLAUDE.md files
for claudemd in $(find "$PROJECT_ROOT" -name "CLAUDE.md" -not -path "*/.git/*" -not -path "*/node_modules/*" 2>/dev/null); do
    echo "  Analyzing: $claudemd"

    # Check for auto-approve / skip-permission patterns
    if $GREP -qiP '(?:always.*approve|auto.*(?:execute|approve|accept)|skip.*(?:confirm|permission|approval))' "$claudemd" 2>/dev/null; then
        finding "CRITICAL" "Agent Config" "$claudemd" "Contains auto-approve/skip-confirmation directive"
    fi

    # Check for encoded content
    if $GREP -qP '(?:[A-Za-z0-9+/]{4}){12,}={0,2}' "$claudemd" 2>/dev/null; then
        finding "HIGH" "Agent Config" "$claudemd" "Contains base64-encoded block — decode and verify content"
    fi

    # Check for external URL references for "more instructions"
    if $GREP -qiP '(?:additional|more|extra|further).*instruction.*https?://' "$claudemd" 2>/dev/null; then
        finding "CRITICAL" "Agent Config" "$claudemd" "References external URL for additional instructions"
    fi

    # Check for shell modification directives
    if $GREP -qiP '(?:bashrc|zshrc|profile|shell.*config|PATH.*export)' "$claudemd" 2>/dev/null; then
        finding "HIGH" "Agent Config" "$claudemd" "References shell configuration modification"
    fi

    # Check for permission expansion
    if $GREP -qiP 'dangerously-skip-permissions' "$claudemd" 2>/dev/null; then
        finding "CRITICAL" "Agent Config" "$claudemd" "References --dangerously-skip-permissions flag"
    fi
done

# Check .cursorrules
for cursorrules in $(find "$PROJECT_ROOT" -name ".cursorrules" -not -path "*/.git/*" 2>/dev/null); do
    echo "  Analyzing: $cursorrules"
    if $GREP -qiP '(?:ignore|override|bypass|skip).*(?:security|check|validation)' "$cursorrules" 2>/dev/null; then
        finding "HIGH" "Agent Config" "$cursorrules" "Contains directive to bypass security checks"
    fi
done

# Check .claude/ directory
if [ -d "$PROJECT_ROOT/.claude" ]; then
    echo "  Analyzing: .claude/ directory"

    if [ -f "$PROJECT_ROOT/.claude/settings.json" ]; then
        # Check for overly permissive settings
        if $GREP -qP '"dangerously' "$PROJECT_ROOT/.claude/settings.json" 2>/dev/null; then
            finding "CRITICAL" "Agent Config" ".claude/settings.json" "Contains dangerous permission override"
        fi
    fi

    # Check custom commands
    for cmd in $(find "$PROJECT_ROOT/.claude/commands" -type f 2>/dev/null); do
        if $GREP -qiP '(?:curl|wget|\bnc\b|eval|exec|bash -c)' "$cmd" 2>/dev/null; then
            finding "HIGH" "Agent Config" "$cmd" "Custom command executes potentially dangerous operations"
        fi
    done
fi

if [ ! -f "$PROJECT_ROOT/CLAUDE.md" ] && [ ! -d "$PROJECT_ROOT/.claude" ]; then
    echo -e "  ${YELLOW}ℹ${NC} No CLAUDE.md or .claude/ config found (consider adding security boundaries)"
fi

# ═══════════════════════════════════════════════
# 4. ENCODED PAYLOADS IN COMMENTS
# ═══════════════════════════════════════════════
echo -e "\n${CYAN}── [4/7] Encoded Payloads in Comments ──${NC}"

# Look for suspiciously long base64 strings in comments
results=$("$GREP" -rnP '(?://|#|/\*|\*|<!--)\s*.*(?:[A-Za-z0-9+/]{4}){15,}={0,2}' "$PROJECT_ROOT" \
    $EXCLUDE \
    --include="*.js" --include="*.ts" --include="*.py" --include="*.rb" \
    --include="*.go" --include="*.java" --include="*.rs" --include="*.sh" \
    --include="*.html" --include="*.xml" --include="*.yaml" --include="*.yml" \
    2>/dev/null | head -20 || true)
results=$(echo "$results" | grep -vE "$POST_EXCLUDE_FILES" || true)

if [ -n "$results" ]; then
    echo "$results" | while IFS= read -r line; do
        file=$(echo "$line" | cut -d: -f1)
        linenum=$(echo "$line" | cut -d: -f2)
        finding "HIGH" "Encoded Payload" "$file:$linenum" "Suspicious base64 block in comment — decode and verify"
    done
else
    echo -e "  ${GREEN}✓${NC} No suspicious encoded payloads in comments"
fi

# Hex-encoded strings in comments
results=$("$GREP" -rnP '(?://|#|/\*|\*|<!--)\s*.*(?:0x[0-9a-fA-F]{2}\s*){10,}' "$PROJECT_ROOT" \
    $EXCLUDE \
    --include="*.js" --include="*.ts" --include="*.py" --include="*.rb" \
    --include="*.go" --include="*.java" --include="*.rs" \
    2>/dev/null | head -10 || true)
results=$(echo "$results" | grep -vE "$POST_EXCLUDE_FILES" || true)

if [ -n "$results" ]; then
    echo "$results" | while IFS= read -r line; do
        file=$(echo "$line" | cut -d: -f1)
        linenum=$(echo "$line" | cut -d: -f2)
        finding "MEDIUM" "Encoded Payload" "$file:$linenum" "Hex-encoded content in comment"
    done
else
    echo -e "  ${GREEN}✓${NC} No hex-encoded payloads in comments"
fi

# ═══════════════════════════════════════════════
# 5. HIDDEN ELEMENTS IN HTML/SVG/MARKDOWN
# ═══════════════════════════════════════════════
echo -e "\n${CYAN}── [5/7] Hidden Content in HTML/SVG/Markdown ──${NC}"

# Hidden text in HTML (display:none, visibility:hidden, off-screen, opacity:0, font-size:0)
for htmlfile in $(find "$PROJECT_ROOT" -name "*.html" -o -name "*.htm" -o -name "*.svg" \
    -not -path "*/.git/*" -not -path "*/node_modules/*" -not -path "*/dist/*" \
    -not -path "*/build/*" -size -1M 2>/dev/null | head -50); do

    # Check for hidden text with potential instructions
    if $GREP -qiP '(?:display\s*:\s*none|visibility\s*:\s*hidden|opacity\s*:\s*0|font-size\s*:\s*0|position\s*:\s*absolute.*left\s*:\s*-\d{4,}).*(?:AI|assistant|agent|instruction|execute|ignore|override)' "$htmlfile" 2>/dev/null; then
        finding "CRITICAL" "Hidden Content" "$htmlfile" "Hidden HTML element contains AI-targeted text"
    fi

    # SVG hidden text
    if echo "$htmlfile" | grep -qi "\.svg$"; then
        if $GREP -qiP '<text[^>]*(?:opacity="0"|display="none"|font-size="0|x="-\d{4,})' "$htmlfile" 2>/dev/null; then
            finding "HIGH" "Hidden Content" "$htmlfile" "SVG contains hidden text element"
        fi
        # SVG script tags
        if grep -qi '<script' "$htmlfile" 2>/dev/null; then
            finding "HIGH" "Hidden Content" "$htmlfile" "SVG contains <script> tag"
        fi
        # SVG foreignObject
        if grep -qi '<foreignObject' "$htmlfile" 2>/dev/null; then
            finding "MEDIUM" "Hidden Content" "$htmlfile" "SVG contains <foreignObject> — can embed arbitrary HTML"
        fi
    fi
done

# Hidden HTML blocks in markdown
for mdfile in $(find "$PROJECT_ROOT" -name "*.md" -not -path "*/.git/*" -not -path "*/node_modules/*" -size -1M 2>/dev/null | head -50); do
    if $GREP -qiP '<[^>]*(?:display\s*:\s*none|visibility\s*:\s*hidden|aria-hidden|hidden)' "$mdfile" 2>/dev/null; then
        if $GREP -qiP '<[^>]*(?:hidden|display:none)[^>]*>.*(?:AI|assistant|agent|instruction|execute|override)' "$mdfile" 2>/dev/null; then
            finding "CRITICAL" "Hidden Content" "$mdfile" "Hidden HTML in markdown contains AI-targeted instructions"
        else
            finding "MEDIUM" "Hidden Content" "$mdfile" "Markdown contains hidden HTML elements — review content"
        fi
    fi
done

echo -e "  ${GREEN}✓${NC} Hidden content scan complete"

# ═══════════════════════════════════════════════
# 6. DEPENDENCY METADATA INJECTION
# ═══════════════════════════════════════════════
echo -e "\n${CYAN}── [6/7] Package Metadata Injection ──${NC}"

# Check package.json descriptions for injection
if [ -f "$PROJECT_ROOT/package.json" ]; then
    desc=$(python3 -c "
import json, sys
try:
    with open('$PROJECT_ROOT/package.json') as f:
        pkg = json.load(f)
    desc = pkg.get('description', '')
    keywords = ['AI', 'assistant', 'agent', 'instruction', 'execute', 'run', 'curl', 'wget', 'bash']
    flagged = [k for k in keywords if k.lower() in desc.lower()]
    if flagged:
        print(f'Suspicious keywords in description: {flagged}')
        print(f'Description: {desc[:200]}')
except Exception as e:
    pass
" 2>/dev/null || true)

    if [ -n "$desc" ]; then
        finding "MEDIUM" "Metadata Injection" "package.json" "$desc"
    fi
fi

# Check pyproject.toml descriptions
if [ -f "$PROJECT_ROOT/pyproject.toml" ]; then
    if $GREP -qiP 'description\s*=\s*"[^"]*(?:AI|assistant|agent|instruction|execute|curl|bash)' "$PROJECT_ROOT/pyproject.toml" 2>/dev/null; then
        finding "MEDIUM" "Metadata Injection" "pyproject.toml" "Suspicious content in description field"
    fi
fi

echo -e "  ${GREEN}✓${NC} Package metadata scan complete"

# ═══════════════════════════════════════════════
# 7. GIT HOOKS INTEGRITY
# ═══════════════════════════════════════════════
echo -e "\n${CYAN}── [7/7] Git Hooks Integrity ──${NC}"

if [ -d "$PROJECT_ROOT/.git/hooks" ]; then
    for hook in $(find "$PROJECT_ROOT/.git/hooks" -type f -executable 2>/dev/null | grep -v "\.sample$"); do
        echo "  Analyzing: $hook"

        # Check for network access
        if $GREP -qiP '(?:curl|wget|\bnc\b|ncat|fetch|http|ssh|scp|rsync)' "$hook" 2>/dev/null; then
            finding "HIGH" "Git Hook" "$hook" "Hook accesses network — verify this is intended"
        fi

        # Check for encoded execution
        if $GREP -qiP '(?:base64.*decode|eval|exec.*\$)' "$hook" 2>/dev/null; then
            finding "CRITICAL" "Git Hook" "$hook" "Hook contains encoded execution pattern"
        fi

        # Check for environment variable exfiltration
        if $GREP -qiP '(?:printenv|env\b|\$\{?(?:API|SECRET|KEY|TOKEN|PASSWORD|AWS))' "$hook" 2>/dev/null; then
            finding "HIGH" "Git Hook" "$hook" "Hook accesses environment variables or secrets"
        fi

        # Check for file modification outside project
        if $GREP -qiP '(?:~\/|/home/|/root/|/etc/|/tmp/)' "$hook" 2>/dev/null; then
            finding "MEDIUM" "Git Hook" "$hook" "Hook references paths outside project directory"
        fi
    done
else
    echo -e "  ${YELLOW}ℹ${NC} No .git/hooks directory found (not a git repository or hooks not set up)"
fi

# Also check Husky hooks
if [ -d "$PROJECT_ROOT/.husky" ]; then
    for hook in $(find "$PROJECT_ROOT/.husky" -type f -executable 2>/dev/null | grep -v "_"); do
        echo "  Analyzing Husky hook: $hook"
        if $GREP -qiP '(?:curl|wget|\bnc\b|ncat|eval|base64|exec.*\$)' "$hook" 2>/dev/null; then
            finding "HIGH" "Git Hook" "$hook" "Husky hook contains suspicious patterns"
        fi
    done
fi

# ═══════════════════════════════════════════════
# SUMMARY
# ═══════════════════════════════════════════════
echo -e "\n========================================="
echo "=== Prompt Injection Scan Summary ==="
echo "========================================="
if [ $FINDING_COUNT -eq 0 ]; then
    echo -e "${GREEN}No prompt injection indicators detected.${NC}"
    echo "This does not guarantee safety — sophisticated attacks may evade pattern matching."
else
    echo -e "${RED}Found $FINDING_COUNT potential prompt injection indicators.${NC}"
    echo ""
    echo "IMPORTANT: Review each finding manually. Not all findings are malicious —"
    echo "some may be legitimate security documentation or testing fixtures."
    echo "However, any file that contains instructions addressed to AI agents"
    echo "should be carefully reviewed for intent."
fi
echo ""
echo "Recommendations:"
echo "  1. Add security boundaries to CLAUDE.md (see Module 1 reference)"
echo "  2. Set up pre-commit hooks to catch injection patterns"
echo "  3. Review all findings with a human security reviewer"
echo "  4. Consider file integrity monitoring for critical config files"
