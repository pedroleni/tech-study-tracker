# Funciones de fecha y hora

- **Módulo:** Vistas y funciones auxiliares
- **Slug:** `funciones-de-fecha-y-hora` (autogenerado del título)
- **Orden:** 410
- **Fuentes:** [Date And Time Functions](https://sqlite.org/lang_datefunc.html) — ver `contenido/sql/TEMARIO.md` #41

---

## Qué es y para qué sirve

SQLite no tiene un tipo `DATE` nativo (módulo 1, lección 3) — las fechas se guardan como texto en formato ISO 8601 (`'2026-08-31'`), y un conjunto de funciones reales las interpreta, calcula y da formato.

```laboratorio
{
  "tipo": "sql-anotado",
  "titulo": "Tres funciones básicas de fecha",
  "esquemaSql": "SELECT 1;",
  "consulta": "SELECT\n  date('2026-08-15') AS solo_fecha,\n  strftime('%Y', '2026-08-15') AS solo_anio,\n  date('2026-08-15', '+1 month') AS mes_siguiente",
  "anotaciones": [
    { "fragmento": "date('2026-08-15')", "nota": "Normaliza el texto a formato YYYY-MM-DD — útil para quedarse solo con la fecha de un valor que también trae hora." },
    { "fragmento": "strftime('%Y', '2026-08-15')", "nota": "strftime da formato personalizado — %Y es el año con cuatro dígitos, hay muchos más códigos (%m mes, %d día, %H hora...)." },
    { "fragmento": "date('2026-08-15', '+1 month')", "nota": "El segundo argumento es un \"modificador\" — suma o resta tiempo a la fecha base." }
  ]
}
```

## Un gotcha real: sumar un mes al último día del mes

```laboratorio
{
  "tipo": "predice-el-resultado",
  "lenguaje": "html",
  "codigo": "<script>\nSELECT date('2026-08-31', '+1 month');\n</script>",
  "opciones": [
    "'2026-09-30' (el último día de septiembre)",
    "'2026-10-01' (se desborda a octubre)",
    "Un error, porque \"31 de septiembre\" no existe"
  ],
  "correcta": 1,
  "explicacion": "Verificado ejecutándolo de verdad: septiembre no tiene día 31, así que SQLite no lo redondea al último día del mes — desborda al mes siguiente, dando '2026-10-01'. Es un comportamiento real y documentado, no un error: cualquier cálculo de fechas cerca de fin de mes merece probarse con casos límite reales antes de confiar en él."
}
```

## Errores típicos

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    { "titulo": "Guardar fechas en un formato que no sea ISO 8601 (YYYY-MM-DD).", "texto": "Las funciones de fecha de SQLite esperan ese formato — guardar '31/08/2026' (formato de calendario en español) hace que las comparaciones y cálculos dejen de funcionar como se espera." },
    { "titulo": "No probar los cálculos de fecha cerca de fin de mes o de año.", "texto": "Como se vio arriba, sumar meses o años puede desbordar de formas no evidentes — vale la pena probar explícitamente los días 28, 29, 30 y 31 antes de confiar en un cálculo así en producción." }
  ]
}
```

## Practica

```laboratorio
{
  "tipo": "sql-en-vivo",
  "consigna": "Muestra la fecha exacta de 7 días después del 2026-08-15.",
  "esquemaSql": "SELECT 1;",
  "consultaInicial": "",
  "consultaSolucion": "SELECT date('2026-08-15', '+7 days')"
}
```

## Para profundizar

```laboratorio
{
  "tipo": "recursos",
  "titulo": "Fuentes de esta lección",
  "recursos": [
    {
      "titulo": "Date And Time Functions",
      "descripcion": "Referencia oficial completa de las funciones de fecha y hora de SQLite.",
      "url": "https://sqlite.org/lang_datefunc.html",
      "etiqueta": "SQLite"
    }
  ]
}
```
