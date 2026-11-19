#!/usr/bin/env bash
# Puerta automática de clean code (docs/clean-code.md). La ejecutan la CI de GitHub,
# Jenkins y cualquiera antes de abrir una PR: npm run clean-code
set -uo pipefail
cd "$(dirname "$0")/../.."

fallos=0
paso() {
    echo "== $1"
    shift
    if ! "$@"; then
        echo "   ✗ falla: $*"
        fallos=$((fallos + 1))
    fi
}

# Normas, complejidad y tamaño; lo anterior está congelado en eslint-suppressions.json.
paso "eslint (normas y complejidad)" npx eslint .
# Bloques repetidos (70 tokens y 8 líneas): ninguno nuevo respecto a jscpd-base.json.
paso "duplicados" node scripts/clean-code/duplicados.mjs
# Archivos, exportaciones y dependencias sin uso.
paso "código muerto" npx knip --no-progress

if [ "$fallos" -ne 0 ]; then
    echo "Clean code: $fallos comprobaciones fallan. Mira docs/clean-code.md."
    exit 1
fi
echo "Clean code: todo en orden."
