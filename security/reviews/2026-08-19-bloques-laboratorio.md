# Revisión de seguridad — bloques de laboratorio en lecciones

**Alcance:** `specs/features/laboratorios.md` — sistema de bloques
interactivos embebidos en Markdown (`predice-el-resultado`,
`codigo-anotado`, `comparador-antes-despues`). Revisión completa, no
un vistazo rápido, porque toca `SafeMarkdown.tsx`, compartido con
`comments.body` (contenido de cualquier usuario registrado, no solo
admin).

## El riesgo real de esta feature

`SafeMarkdown` se usa en tres sitios con modelos de autoría distintos:
lecciones (admin), notas de tecnología (admin) y comentarios
(cualquier usuario autenticado). Sin una barrera explícita, activar la
intercepción de bloques `laboratorio` para los tres por igual habría
dejado que cualquier usuario registrado consiguiera que su JSON se
renderizara como componente interactivo — con iframes en vivo — en la
página de todo el mundo que leyera ese comentario.

## Revisión del diseño final

- **`permitirLaboratorios` es `false` por defecto** en la firma de
  `SafeMarkdown` — cualquier uso nuevo del componente queda seguro sin
  tener que acordarse de nada. Solo `LeccionPage.tsx` lo pasa a
  `true`, verificado con `rg -n "permitirLaboratorios"` sobre todo
  `src/`: aparece en `SafeMarkdown.tsx` (definición) y en
  `LeccionPage.tsx` (el único uso real) — ni `TechnologyPage.tsx` ni
  `CommentsSection.tsx` lo tocan.
- **Test explícito y verificado por mí, no solo confiado al informe
  de Codex**: `CommentsSection.test.tsx` monta el componente real con
  un comentario cuyo cuerpo contiene un bloque `laboratorio` válido
  (JSON bien formado, tipo real) y confirma que se renderiza como
  bloque de código (`role="region", name: "Bloque de código
  laboratorio"`) — nunca aparece el botón "Revelar resultado", ni
  inputs `radio`, ni el iframe con título "Resultado real del código
  HTML". Leí el test completo, no solo su resultado.
- **Ningún HTML crudo llega al documento principal**: el `codigo` de
  cada bloque pasa por `CodigoResaltado` (tokeniza y pinta como nodos
  de texto de React — mismo componente ya auditado y en producción
  desde el panel de admin) o por `iframe srcDoc` con `sandbox=""` — la
  prop `srcDoc` de React no es `dangerouslySetInnerHTML`, y el iframe
  sandboxeado sin `allow-scripts` no ejecuta nada aunque el contenido
  fuera hostil.
- **`JSON.parse` envuelto en `try/catch`** dentro de
  `BloqueLaboratorio.tsx`, y `esquemaBloqueLaboratorio.safeParse` (no
  `.parse`) — un bloque mal formado nunca lanza una excepción que
  tumbe el render de toda la lección, cae a código plano.
- **Registro cerrado** (`registroBloquesLaboratorio`): el campo
  `tipo` del JSON solo puede seleccionar uno de tres componentes
  conocidos en tiempo de compilación — nunca un nombre de módulo o
  componente arbitrario.
- **`scan_code_patterns.sh` en verde** sobre el diff completo — ya
  verificado con el propio scanner arreglado en esta misma sesión
  (`2026-08-19-scanners-grep-macos.md`), así que esta vez la
  verificación local es real, no un placebo.

## Hallazgos

Ninguno de severidad High/Medium.

## Estado

- Sin hallazgos pendientes.
- Verificado además con datos reales en producción: las dos lecciones
  piloto de HTML actualizadas y comprobadas visualmente (capturas
  reales, toggle antes/después probado en ambos estados) tras login
  real como admin.
