# Specs por feature

Un documento por feature, autocontenido. La idea: cuando se implementa
una feature (normalmente lanzando a Codex una tarea acotada), el agente
lee **solo** el doc de esa feature en vez de los ~250 líneas de
`plan.md` donde el 80% no aplica a lo que está haciendo.

## Cómo se usa

Al empezar una feature, el agente lee **exactamente estos tres**:

1. `specs/features/<feature>.md` — qué construir y cómo (este directorio)
2. `AGENTS.md` — reglas del repo (seguridad, ramas, skills)
3. `specs/design-system.md` — solo si toca `src/components/`

`spec.md` y `plan.md` **no** hacen falta para implementar: el doc de
feature ya incluye lo relevante. Se consultan solo si hay que cambiar
una decisión global.

## Qué va en cada capa

| Documento | Contiene | Cambia... |
|---|---|---|
| `spec.md` | El **qué** y el **por qué** a nivel producto: alcance, modelo de datos, criterios de aceptación | Rara vez — solo si cambia el producto |
| `plan.md` | Decisiones **transversales** (stack, estructura de carpetas, convenciones de test) + índice de features | Rara vez |
| `features/<x>.md` | El **cómo** de una feature concreta: rutas, componentes, flujos, SQL, tests, checkpoints de seguridad | Una vez por feature, y se marca como cerrada |
| `design-system.md` | Paleta semántica, inventario de componentes UI | Al añadir un patrón visual nuevo |

## Convención

- Nombre: `<feature-corta>.md` en kebab-case (`auth.md`,
  `data-layer.md`, `dashboard.md`).
- Cada doc abre con **Estado** (`⏳ pendiente` / `🚧 en curso` /
  `✅ implementada en PR #N`) para saber de un vistazo qué queda.
- Cada doc incluye su propia sección de **checkpoints de seguridad**:
  qué revisar específicamente en esa feature, no el checklist genérico.
- Si una feature necesita configuración manual en Supabase/Vercel (algo
  que un agente sin red **no puede hacer**), va en una sección
  **Configuración manual requerida** bien visible al principio.

## Índice

| Feature | Doc | Estado |
|---|---|---|
| Autenticación completa (registro con verificación por código, login, recuperación de contraseña, tabla `profiles`) | [auth.md](auth.md) | 🚧 en curso |
| Capa de datos (`queries/`, hooks de React Query) | _pendiente de escribir_ | ⏳ |
| Dashboard (stats, lista de pendientes) | _pendiente de escribir_ | ⏳ |
| Categorías (índice + CRUD) | _pendiente de escribir_ | ⏳ |
| Tecnologías (ficha, formulario, badges) | _pendiente de escribir_ | ⏳ |
| 2FA con TOTP (segundo factor opcional en login) | _pendiente de escribir_ | ⏳ aplazada a propósito, ver [auth.md](auth.md#fuera-de-alcance-de-esta-feature) |
