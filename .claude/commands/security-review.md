---
allowed-tools: Bash(git diff:*), Bash(git status:*), Bash(git log:*), Bash, Read, Glob, Grep, LS, Task
description: Auditoría de seguridad completa del proyecto usando los 8 subagentes especializados
---

# Auditoría de seguridad completa

Ejecuta una revisión de seguridad multi-dominio de este proyecto. $ARGUMENTS

## Paso 0: Contexto de cambios pendientes

```
!`git status`
```

```
!`git diff HEAD`
```

Si hay diff pendiente, cada subagente debe centrarse en lo introducido por ese diff (más el
contexto del repo necesario para juzgarlo). Si no hay diff pendiente, es una auditoría
completa del código actual.

## Paso 1: Descubrimiento del proyecto

```bash
echo "=== Project Discovery ==="
for ext in ts tsx js jsx sql; do
  count=$(find . -name "*.$ext" -not -path "*/node_modules/*" -not -path "*/dist/*" 2>/dev/null | wc -l)
  [ "$count" -gt 0 ] && echo "  .$ext: $count files"
done
echo ""
for f in package.json vercel.json supabase/config.toml AGENTS.md CLAUDE.md .env.example; do
  [ -e "$f" ] && echo "  ✓ $f"
done
[ -d ".github/workflows" ] && echo "  ✓ .github/workflows/"
[ -d "supabase/migrations" ] && echo "  ✓ supabase/migrations/"
```

## Paso 2: Lanzar los 8 subagentes de seguridad

Delega en TODOS estos subagentes (`.claude/agents/security-*.md`). Lánzalos en paralelo, cada
uno con su propio contexto limpio:

1. **security-agent-env** — integridad de CLAUDE.md/AGENTS.md, `.claude/`, hooks, MCP, permisos
2. **security-secrets** — claves hardcodeadas, especialmente `SUPABASE_SERVICE_ROLE_KEY`
3. **security-code-vulns** — OWASP Top 10 y patrones específicos de React/TypeScript
4. **security-supply-chain** — dependencias npm, lockfile, pinning, typosquatting
5. **security-injection** — XSS en `notes`, URLs inseguras en `resources`, SSRF si aplica
6. **security-auth-crypto** — Supabase Auth y **RLS** (capa de autorización principal)
7. **security-infrastructure** — Vercel, config de Supabase en migraciones, GitHub Actions si existen
8. **security-prompt-injection** — instrucciones ocultas dirigidas a agentes IA

Dile a cada subagente que use los scripts de `scripts/security/` si existen para el escaneo
automatizado inicial, y que lea `security/security-review-instructions.md` para los
precedentes específicos de este proyecto antes de reportar.

Si `$ARGUMENTS` pide un área concreta (p. ej. "solo secretos", "solo RLS"), ejecuta solo el/los
subagente(s) relevante(s) en vez de los 8.

## Paso 3: Sintetizar el informe

Tras recibir los resultados de todos los subagentes:

1. **Recopila** todos los hallazgos.
2. **Deduplica** — mismo archivo + línea + categoría = un hallazgo (conserva la severidad más alta).
3. **Ordena** por severidad: CRITICAL → HIGH → MEDIUM → LOW → INFO.
4. **Calcula el risk score**: CRITICAL×25 + HIGH×10 + MEDIUM×3 + LOW×1 (tope 100).

Presenta el informe así:

### Resumen ejecutivo
- Nivel de riesgo global (CRITICAL/HIGH/MEDIUM/LOW)
- Risk score: X/100
- Conteo de hallazgos por severidad
- Top 3 hallazgos más críticos (una línea cada uno)

### Hallazgos por severidad

Para cada uno:
- **[SEVERIDAD]** Título — CWE/ASI ID
- Archivo: `ruta/al/archivo:línea`
- Descripción (qué falla y por qué importa)
- Recomendación (fix concreto, copiable)

### Prioridad de remediación
- P0 (inmediato): hallazgos CRITICAL
- P1 (este sprint): hallazgos HIGH
- P2 (siguiente sprint): hallazgos MEDIUM

## Paso 4: Guardar el informe

Escribe el informe completo (el mismo contenido del paso 3, con una sección final **Estado**
donde cada hallazgo empieza como `- [ ] pendiente`) en
`security/reviews/YYYY-MM-DD-<tema-corto>.md` (fecha real de hoy; `<tema-corto>` describe el
alcance — `full-audit` para una auditoría completa, o el área si `$ARGUMENTS` acotó la revisión,
p. ej. `auth-rls`). Sigue la convención de `security/reviews/README.md` y añade la fila
correspondiente a su tabla de índice. No lo dejes solo en la respuesta del chat — el chat no
queda versionado ni buscable.

## Paso 5: Siguientes pasos

Tras presentar el informe y guardarlo:
1. Ofrece **arreglar automáticamente** los hallazgos CRITICAL y HIGH donde sea seguro hacerlo.
   Si arreglas alguno, actualiza su casilla en la sección Estado del archivo guardado
   (`- [x] arreglado, <commit/PR>`) en vez de dejarla pendiente.
2. Recuerda que Codex puede correr la misma auditoría siguiendo `AGENTS.md` (no tiene
   subagentes de Claude, pero puede leer cada `.claude/agents/security-*.md` como checklist y
   ejecutar los scripts de `scripts/security/` directamente) — y que también debe guardar su
   informe en `security/reviews/` siguiendo la misma convención.
