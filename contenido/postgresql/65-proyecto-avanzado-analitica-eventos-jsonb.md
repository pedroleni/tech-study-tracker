# Proyecto avanzado: analítica de eventos con JSONB

- **Módulo:** Proyectos
- **Slug:** `proyecto-avanzado-analitica-de-eventos-con-jsonb` (autogenerado del título)
- **Orden:** 650
- **Repositorio:** [github.com/pedroleni/postgresql-proyectos](https://github.com/pedroleni/postgresql-proyectos) (carpeta `analitica-eventos-jsonb`)
- **Requiere:** Módulo 3 (JSON frente a JSONB) y la lección 40-41 (Vistas materializadas) de este mismo temario

---

## Qué vas a construir

Un sistema de tracking de eventos de producto (piensa en analítica tipo Mixpanel, en miniatura): cada evento llega con un `payload` JSONB de forma libre — distintos eventos, distintas claves, sin migrar el esquema cada vez — indexado con GIN, y agregado en un resumen diario mediante una vista materializada refrescable.

```laboratorio
{
  "tipo": "callout",
  "variante": "info",
  "titulo": "El repositorio",
  "contenido": "github.com/pedroleni/postgresql-proyectos (carpeta analitica-eventos-jsonb) — rama main con el esquema (JSONB + GIN, vista materializada de resumen diario) y toda la aplicación completos; solo las dos consultas de búsqueda por payload en src/eventos.ts están recortadas. Rama solucion con las consultas completas."
}
```

## El punto de partida: dos consultas que nunca encuentran nada

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<script>\n// buscarPorCampoPayload: deberia usar payload ->> $1 = $2\nwhere $1::text is null and $2::text is null\n\n// contarPorClaveExistente: deberia usar payload ? $1\nwhere $1::text is null\n</script>",
  "anotaciones": [
    { "fragmento": "payload ->> $1 = $2", "nota": "->> extrae un valor de un JSONB COMO TEXTO — comparar ese texto con un valor exacto encuentra los eventos donde esa clave vale justo eso, ni más ni menos." },
    { "fragmento": "payload ? $1", "nota": "? comprueba si una clave EXISTE en el JSONB, sin importar su valor — distinto de ->>, que compara el valor. Es la diferencia entre 'tiene la clave plan' y 'tiene plan = pro' exactamente." }
  ]
}
```

## La pieza que ya está resuelta: eventos con forma completamente distinta entre sí

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<script>\nawait registrarEvento(pool, {\n  tipo: 'compra_completada',\n  usuarioId: usuario1,\n  payload: { monto: 49.99, moneda: 'EUR', plan: 'pro' },\n});\nawait registrarEvento(pool, {\n  tipo: 'clic_boton',\n  usuarioId: usuario2,\n  payload: { boton: 'cta_hero', pagina: '/precios' },\n});\n</script>",
  "anotaciones": [
    { "fragmento": "payload: { monto: 49.99, moneda: 'EUR', plan: 'pro' }", "nota": "Dos eventos, dos formas de payload completamente distintas, en la MISMA columna JSONB de la MISMA tabla — sin añadir columnas nuevas ni migrar nada para soportar un tipo de evento futuro con claves distintas otra vez." }
  ]
}
```

## Pruébalo tú, de verdad

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    { "titulo": "Levanta Postgres, migra y siembra eventos reales.", "texto": "Clona postgresql-proyectos, entra en analitica-eventos-jsonb/ y ejecuta docker compose up -d, npm install, npm run migrate, npm run seed — 45 eventos de 3 tipos distintos, con payloads variados y repartidos en varios días." },
    { "titulo": "Ejecuta los tests tal cual — 2 de 4 deben fallar.", "texto": "Los tests de buscarPorCampoPayload y contarPorClaveExistente fallan; los del resumen diario pasan igual, porque no dependen de estas dos consultas." },
    { "titulo": "Completa los dos WHERE y confirma los 4.", "texto": "Sustituye los placeholders por payload ->> $1 = $2 y payload ? $1 respectivamente, y vuelve a correr npm test." }
  ]
}
```

## Un gotcha real de este proyecto

```laboratorio
{
  "tipo": "callout",
  "variante": "aviso",
  "titulo": "Dos índices distintos, para dos formas distintas de consultar",
  "contenido": "El proyecto trae DOS índices sobre eventos: uno GIN sobre payload completo (para -> /->>/? contra cualquier clave del JSONB) y uno normal sobre (tipo, ocurrido_en) (para las agregaciones del resumen diario). Un solo índice GIN no habría sido la mejor opción para filtrar por tipo y rango de fechas — cada tipo de consulta tiene el índice que de verdad usa el planificador, el mismo criterio del módulo 5 de este track."
}
```

## Retos para ampliarlo

1. Añade una función `buscarPorPayloadParcial(pool, filtro)` que reciba un objeto parcial (por ejemplo `{ plan: 'pro' }`) y use el operador `@>` (contiene) en vez de `->>`, para poder filtrar por varias claves a la vez sin construir el WHERE a mano por cada una.
2. Añade una segunda vista materializada `top_eventos_por_usuario` que muestre, por `usuario_id`, cuál es su tipo de evento más frecuente — combina agregación JSONB con `DISTINCT ON` o una función de ventana (módulo 45 del track de SQL).
3. Combínalo con el proyecto del buscador de artículos (lección 63): añade un campo `payload jsonb` a los artículos para metadatos flexibles (etiquetas, autor, tiempo de lectura) sin tocar el esquema de búsqueda de texto completo.

## Para profundizar

```laboratorio
{
  "tipo": "recursos",
  "titulo": "Repositorio y referencias",
  "recursos": [
    {
      "titulo": "postgresql-proyectos/analitica-eventos-jsonb (rama main — punto de partida)",
      "descripcion": "Clona el repo entero y entra en analitica-eventos-jsonb/ para hacer el proyecto tú mismo.",
      "url": "https://github.com/pedroleni/postgresql-proyectos/tree/main/analitica-eventos-jsonb",
      "etiqueta": "GitHub"
    },
    {
      "titulo": "postgresql-proyectos/analitica-eventos-jsonb (rama solucion)",
      "descripcion": "La implementación completa, para comparar si te atascas.",
      "url": "https://github.com/pedroleni/postgresql-proyectos/tree/solucion/analitica-eventos-jsonb",
      "etiqueta": "GitHub"
    },
    {
      "titulo": "9.16. JSON Functions and Operators",
      "descripcion": "Referencia oficial de Postgres sobre los operadores JSONB (->>, ?, @>), ya usados en el módulo 3 de este track.",
      "url": "https://www.postgresql.org/docs/current/functions-json.html",
      "etiqueta": "PostgreSQL"
    }
  ]
}
```
