# EXPLAIN QUERY PLAN: ver qué hace el motor de verdad

- **Módulo:** Índices y rendimiento
- **Slug:** `explain-query-plan` (autogenerado del título)
- **Orden:** 350
- **Fuentes:** [EXPLAIN QUERY PLAN](https://sqlite.org/eqp.html) — ver `contenido/sql/TEMARIO.md` #35

---

## Qué es y para qué sirve

`EXPLAIN QUERY PLAN` antepuesto a cualquier consulta muestra, en vez de ejecutarla, la estrategia real que el motor piensa usar: qué tablas escanea, qué índices aprovecha, en qué orden resuelve un JOIN.

```laboratorio
{
  "tipo": "sql-anotado",
  "titulo": "El plan real de un JOIN entre dos tablas",
  "esquemaSql": "CREATE TABLE departamentos (id INTEGER PRIMARY KEY, nombre TEXT);\nCREATE TABLE empleados (id INTEGER PRIMARY KEY, departamento_id INTEGER);\nINSERT INTO departamentos VALUES (1, 'Ingeniería');\nINSERT INTO empleados VALUES (1, 1);",
  "consulta": "EXPLAIN QUERY PLAN\nSELECT * FROM empleados e\nJOIN departamentos d ON d.id = e.departamento_id",
  "anotaciones": [
    { "fragmento": "SCAN e", "nota": "Verificado ejecutándolo: el motor recorre TODA la tabla empleados (alias e) — no hay índice que ayude a filtrarla aquí." },
    { "fragmento": "EXPLAIN QUERY PLAN", "nota": "No ejecuta la consulta de verdad — devuelve una descripción del PLAN, mucho más rápida de obtener que correr la consulta entera sobre una tabla grande." }
  ]
}
```

## Cómo leer las columnas del resultado

```laboratorio
{
  "tipo": "roles",
  "titulo": "Cuatro columnas, pero solo una importa para leerlo a simple vista",
  "roles": [
    { "etiqueta": "detail", "rol": "La descripción legible: qué hace ese paso", "descripcion": "SCAN tabla (recorre todas las filas) o SEARCH tabla USING INDEX... (usa un índice) son las dos palabras clave más importantes de toda la lección." },
    { "etiqueta": "id / parent", "rol": "Identifican cada paso y su relación con otros", "descripcion": "Útiles para consultas con subconsultas anidadas — para la mayoría de casos del día a día, basta con leer detail de arriba a abajo." }
  ]
}
```

## Errores típicos

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    { "titulo": "Confiar en que el formato exacto de detail no cambiará nunca entre versiones.", "texto": "La propia documentación de SQLite avisa: el formato de salida puede cambiar entre versiones — sirve para depurar de forma interactiva, no para que un programa lo analice automáticamente." },
    { "titulo": "Ejecutar EXPLAIN (sin QUERY PLAN) esperando el mismo resultado legible.", "texto": "EXPLAIN a secas devuelve el código de bajo nivel de la máquina virtual de SQLite (bytecode) — mucho más detallado y mucho menos legible que EXPLAIN QUERY PLAN." }
  ]
}
```

## Practica

```laboratorio
{
  "tipo": "sql-en-vivo",
  "consigna": "Usa EXPLAIN QUERY PLAN para ver el plan de una consulta que busca por email (hay un índice sobre esa columna).",
  "esquemaSql": "CREATE TABLE usuarios (id INTEGER PRIMARY KEY, email TEXT);\nCREATE INDEX idx_email ON usuarios(email);\nINSERT INTO usuarios VALUES (1, 'ana@ejemplo.com');",
  "consultaInicial": "",
  "consultaSolucion": "EXPLAIN QUERY PLAN SELECT * FROM usuarios WHERE email = 'ana@ejemplo.com'"
}
```

## Para profundizar

```laboratorio
{
  "tipo": "recursos",
  "titulo": "Fuentes de esta lección",
  "recursos": [
    {
      "titulo": "EXPLAIN QUERY PLAN",
      "descripcion": "Documentación oficial completa sobre EXPLAIN QUERY PLAN.",
      "url": "https://sqlite.org/eqp.html",
      "etiqueta": "SQLite"
    }
  ]
}
```
