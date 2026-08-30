# Cuándo un índice no ayuda (o perjudica)

- **Módulo:** Índices y rendimiento
- **Slug:** `cuando-un-indice-no-ayuda` (autogenerado del título)
- **Orden:** 340
- **Fuentes:** [Query Optimizer Overview](https://sqlite.org/optoverview.html) — ver `contenido/sql/TEMARIO.md` #34

---

## Qué es y para qué sirve

Un índice no es gratis, y no siempre se usa aunque exista — envolver la columna indexada en una función es una de las formas más comunes de anularlo sin darse cuenta.

```laboratorio
{
  "tipo": "comparador-antes-despues",
  "antes": "EXPLAIN QUERY PLAN\nSELECT * FROM usuarios WHERE UPPER(email) = 'A@B.COM';\n\n-- \"SCAN usuarios\" — el índice sobre email NO se usa",
  "despues": "EXPLAIN QUERY PLAN\nSELECT * FROM usuarios WHERE email = 'a@b.com';\n\n-- \"SEARCH usuarios USING COVERING INDEX idx_email (email=?)\"",
  "nota": "Verificado ejecutando las dos EXPLAIN QUERY PLAN reales: el índice existe sobre email, pero UPPER(email) calcula un valor NUEVO en cada fila — el motor no puede usar el índice para eso, tiene que recorrer la tabla entera."
}
```

## El coste real de un índice: no es gratis

```laboratorio
{
  "tipo": "roles",
  "titulo": "Todo índice tiene un coste, no solo un beneficio",
  "roles": [
    { "etiqueta": "Beneficio", "rol": "Lecturas más rápidas por esa columna", "descripcion": "SEARCH en vez de SCAN, como en la lección anterior." },
    { "etiqueta": "Coste en escritura", "rol": "Cada INSERT/UPDATE/DELETE también actualiza el índice", "descripcion": "Una tabla con muchos índices tarda más en escribir, porque cada índice necesita mantenerse sincronizado con los datos reales." },
    { "etiqueta": "Coste en espacio", "rol": "El índice ocupa espacio en disco por sí mismo", "descripcion": "No es enorme normalmente, pero en tablas muy grandes con muchos índices, sí es un factor real a tener en cuenta." }
  ]
}
```

## Errores típicos

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    { "titulo": "Envolver la columna indexada en una función dentro del WHERE.", "texto": "UPPER(email) = ..., LOWER(email) = ..., o DATE(fecha) = ... impiden que el motor use el índice normal — la alternativa real es un índice sobre una expresión (índice de expresión), fuera del alcance básico de esta lección." },
    { "titulo": "Crear un índice sobre cada columna \"por si acaso\", sin medir nada.", "texto": "Cada índice de más ralentiza las escrituras sin necesidad — la decisión correcta se basa en qué consultas reales se ejecutan con frecuencia, no en indexar todo preventivamente." }
  ]
}
```

## Practica

```laboratorio
{
  "tipo": "sql-en-vivo",
  "consigna": "Hay un índice sobre email. Escribe la consulta que SÍ puede aprovecharlo: busca el usuario con email exactamente 'ana@ejemplo.com' (sin envolverlo en ninguna función).",
  "esquemaSql": "CREATE TABLE usuarios (id INTEGER PRIMARY KEY, email TEXT);\nCREATE INDEX idx_email ON usuarios(email);\nINSERT INTO usuarios VALUES (1, 'ana@ejemplo.com'), (2, 'luis@ejemplo.com');",
  "consultaInicial": "",
  "consultaSolucion": "SELECT * FROM usuarios WHERE email = 'ana@ejemplo.com'"
}
```

## Para profundizar

```laboratorio
{
  "tipo": "recursos",
  "titulo": "Fuentes de esta lección",
  "recursos": [
    {
      "titulo": "Query Optimizer Overview",
      "descripcion": "Documentación oficial sobre cómo el optimizador de consultas de SQLite decide usar (o no) un índice.",
      "url": "https://sqlite.org/optoverview.html",
      "etiqueta": "SQLite"
    }
  ]
}
```
