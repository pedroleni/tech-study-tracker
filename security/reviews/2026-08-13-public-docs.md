# Revisión de seguridad — documentación pública

**Fecha:** 2026-08-13  
**Alcance:** rama `feat/public-docs`: migración `0003`, RLS/privilegios,
sesiones y caché, comentarios/favoritos, renderizado Markdown, rutas públicas
y panel de administración.  
**Método:** recorrido secuencial de los 8 checklists
`.claude/agents/security-*.md`, revisión manual del flujo de datos y permisos,
skills vigentes de Supabase/Postgres y los 5 scanners de `scripts/security/`.

## Resumen ejecutivo

- **Riesgo detectado antes de corregir:** MEDIUM.
- **Risk score inicial:** **12/100** (0 CRITICAL, 0 HIGH, 4 MEDIUM, 0 LOW).
- **Riesgo residual local:** no quedan hallazgos High/Medium conocidos en el
  código revisado.
- **Estado remoto:** `0002` completa y `0003` aplicada estructuralmente. Falta
  contrastar grants por columna, configuración/ACL de funciones, roles de
  policies e índices con la versión local endurecida.
- **Gate aún abierto:** todavía no hay ninguna cuenta con rol `admin`; la
  validación real con visitante, usuario y admin sigue siendo obligatoria y no
  se sustituye por esta revisión estática.

Top 3 hallazgos corregidos:

1. La caché podía reutilizar borradores del admin tras perder la sesión.
2. Markdown permitía imágenes remotas usadas como píxeles de seguimiento.
3. Los privilegios de tabla permitían escribir IDs y fechas gestionados por
   el servidor.

## Hallazgos por severidad

### [MEDIUM] Borradores del admin reutilizables desde una caché pública — CWE-200

- **Archivos:** `src/lib/hooks/useAuth.ts:14`,
  `src/lib/hooks/useTechnologies.ts:15`, `src/lib/queries/queryKeys.ts:3`.
- **Descripción:** la lista y el detalle de tecnologías usaban la misma key de
  TanStack Query para visitante y admin. Solo el método manual `signOut()`
  limpiaba la caché; una expiración/revocación que llegara como evento de
  Supabase podía dejar un borrador ya descargado disponible en memoria y
  reutilizarlo en la vista pública durante su periodo de frescura.
- **Escenario:** un admin abre un borrador en un equipo compartido; la sesión
  expira fuera del botón de logout y la siguiente vista consulta la misma key.
- **Corrección:** keys separadas por identidad (`public` o UUID), queries
  deshabilitadas hasta resolver auth y `queryClient.clear()` también ante
  `SIGNED_OUT`. Cubierto por tests de caché e identidad.

### [MEDIUM] Seguimiento remoto almacenado mediante imágenes Markdown — CWE-200

- **Archivo:** `src/components/content/SafeMarkdown.tsx:8`.
- **Descripción:** `react-markdown` bloqueaba HTML crudo, pero su renderer por
  defecto seguía generando `<img>` para sintaxis Markdown. Cualquier usuario
  registrado podía publicar un comentario con una imagen alojada por él y
  hacer que el navegador de cada lector contactara su servidor.
- **Escenario:** `![x](https://attacker.example/pixel)` en un comentario revela
  al host externo metadatos de red/navegador de cada visitante de la ficha.
- **Corrección:** el renderer compartido omite imágenes y conserva solo su
  texto alternativo; los enlaces siguen limitados a `http:`/`https:`. Hay una
  regresión que confirma que no se crea ningún `<img>`.

### [MEDIUM] Asignación masiva de columnas gestionadas por el servidor — CWE-915

- **Archivo:** `supabase/migrations/0003_public_docs.sql:41` y
  `supabase/migrations/0003_public_docs.sql:254`.
- **Descripción:** los `GRANT INSERT/UPDATE` iniciales eran de tabla completa.
  Un usuario autenticado podía enviar `id`, `created_at` o columnas de relación
  aunque la UI no las incluyera; el trigger de comentarios tampoco declaraba
  inmutables `id` y `created_at`. Esto permitía falsear orden/identidad de
  contenido propio y usar colisiones como oráculo de integridad.
- **Escenario:** una llamada directa a PostgREST crea un comentario con fecha
  elegida o intenta cambiar su UUID, saltándose las allowlists del cliente.
- **Corrección:** permisos de escritura por columna en categorías,
  tecnologías, comentarios y favoritos; los IDs/timestamps solo los genera la
  base de datos. El trigger impide además cambiar identidad, propietario,
  relaciones o fecha de creación; solo `body` es actualizable.

### [MEDIUM] Oráculo de UUID de borrador en comentarios/favoritos — CWE-203

- **Archivo:** `supabase/migrations/0003_public_docs.sql:217` y
  `supabase/migrations/0003_public_docs.sql:279`.
- **Descripción:** el diseño owner-only inicial de favoritos aceptaba cualquier
  `technology_id`, y una edición de comentario podía cambiar relaciones. La
  diferencia entre éxito, RLS y FK permitía inferir si un UUID no público
  correspondía a un borrador existente.
- **Escenario:** un usuario prueba UUIDs en `favorites.technology_id` o mueve un
  comentario propio hacia otra ficha y compara la respuesta del Data API.
- **Corrección:** inserts solo hacia tecnologías `completado` cuyo propietario
  sea admin, relaciones del comentario inmutables, favoritos sin `UPDATE` y
  actualización de comentario limitada a `body`.

## Mejoras de defensa en profundidad y proceso

- `private.is_admin()` y los helpers de trigger viven en un esquema no expuesto;
  el helper privilegiado usa `security definer`, `search_path = ''`, referencias
  cualificadas y privilegio mínimo.
- Las políticas añadidas por `0003` declaran `TO anon/authenticated`; `GRANT` y
  RLS se tratan como controles independientes. La policy heredada
  `profiles_select_own` aún usa el rol implícito `PUBLIC`: su predicado y la
  ausencia de grants para `anon` impiden una lectura indebida, pero se
  normalizará a `TO authenticated` en la siguiente migración forward-only.
- Los índices compuestos siguen las queries reales:
  `(technology_id, created_at)` para comentarios y
  `(user_id, created_at desc)` para favoritos; se mantienen los índices de FK.
- El contenido público filtra `status = 'completado'` también en UI para que la
  vista privilegiada del admin no mezcle borradores en categorías/favoritos.
- `security/security-review-instructions.md`, `AGENTS.md` y los agentes de RLS e
  inyección ya describen el modelo público/admin vigente en vez del owner-only
  antiguo.
- No se introdujeron dependencias nuevas ni secretos.

### Corrección del diagnóstico de despliegue remoto

El primer `42P01` se produjo al ejecutar un bloque que incluía una consulta a
`public.profiles`; no demostraba por sí solo si la tabla existía antes o después
de ese momento. El preflight siguiente buscó
`to_regprocedure('public.handle_new_user()')` y devolvió `false`, pero esa
comprobación también era insuficiente: `0003` mueve deliberadamente el helper a
`private`.

El inventario definitivo consultó el destino real de `pg_trigger` y confirmó:

- 2 perfiles para 2 usuarios Auth, 0 usuarios sin perfil;
- columnas, RLS, policy, PK, FK de Auth y `CHECK(role)` presentes;
- `on_auth_user_created` apunta a `private.handle_new_user()`;
- esquema `private` y sus cuatro helpers presentes;
- `comments` y `favorites` presentes;
- las 16 policies esperadas de `0003` presentes;
- 0 filas previas en categorías/tecnologías y 0 perfiles admin.

Conclusión corregida: `0002` está completa y `0003` está aplicada al menos en
su estructura. No debe reejecutarse ninguna de ellas. La siguiente comprobación
es el diff de catálogo de solo lectura versionado en
`supabase/diagnostics/0003_catalog_audit.sql`; cualquier ajuste se hará en
`0004`.

## Evidencia de validación local

- `npm run test`: **117/117 tests**, 19 archivos.
- `npm run build`: correcto. Solo queda el aviso no-seguridad de bundle grande
  (778.98 kB minificado; 229.36 kB gzip).
- `npm run lint`: correcto.
- `scan_code_patterns.sh`: sin patrones vulnerables.
- `scan_configs.sh`: sin problemas de configuración.
- `scan_dependencies.sh`: 0 critical/high/moderate; lockfile y versiones exactas.
- `scan_prompt_injection.sh`: sin indicadores.
- `scan_secrets.sh`: 0 hallazgos.
- `npm audit --omit=dev --json`: 0 vulnerabilidades (185 dependencias de
  producción; 873 totales en el audit ejecutado).

No hay `psql` ni Supabase CLI local disponible; por eso esta evidencia no
pretende validar la ejecución real de la migración.

## Referencias verificadas

- [Row Level Security — Supabase](https://supabase.com/docs/guides/database/postgres/row-level-security)
- [Database Functions — Supabase](https://supabase.com/docs/guides/database/functions)
- [Helpers `security definer` privados dentro de policies](https://supabase.com/docs/guides/troubleshooting/do-i-need-to-expose-security-definer-functions-in-row-level-security-policies-iI0uOw)
- [Cambio de Data API: `GRANT` explícito](https://supabase.com/changelog/45329-breaking-change-tables-not-exposed-to-data-and-graphql-api-automatically)

## Prioridad de remediación

- **P0/P1:** ninguno pendiente.
- **P2:** los cuatro hallazgos MEDIUM fueron corregidos localmente antes de
  aplicar la migración.
- **Gate de despliegue:** contrastar el endurecimiento fino del remoto, aplicar
  una `0004` forward-only si existe drift, designar exactamente un admin y
  probar API directa con las tres identidades.

## Estado

- [x] Caché de borradores separada por identidad y limpiada en `SIGNED_OUT`
  (corregido localmente en `feat/public-docs`, sin commit/PR aún).
- [x] Imágenes Markdown remotas omitidas (corregido localmente, con test).
- [x] Escritura limitada por columna y campos de comentario inmutables en la
  migración local; pendiente confirmar que el remoto contiene esta revisión.
- [x] Oráculo de borradores cerrado en comentarios/favoritos en la migración
  local; pendiente confirmar que el remoto contiene esta revisión.
- [x] `0002` completa y estructura/policies de `0003` inventariadas en remoto.
- [ ] Comparar grants, funciones, roles e índices; corregir drift con `0004`.
- [ ] Validación remota con visitante, usuario y admin; bloqueada hasta
  designar explícitamente cuál de las dos cuentas será administradora.
