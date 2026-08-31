# CTEs recursivas (WITH RECURSIVE)

- **Módulo:** Subconsultas y CTEs
- **Slug:** `ctes-recursivas` (autogenerado del título)
- **Orden:** 230
- **Fuentes:** [WITH clause](https://sqlite.org/lang_with.html) — ver `contenido/sql/TEMARIO.md` #23

---

## Qué es y para qué sirve

Una CTE recursiva se referencia **a sí misma** — útil para generar secuencias, o para recorrer estructuras jerárquicas (un empleado, su jefe, el jefe de su jefe...) sin saber de antemano cuántos niveles hay.

```laboratorio
{
  "tipo": "sql-anotado",
  "titulo": "Generar los números del 1 al 5, sin tabla de origen",
  "esquemaSql": "SELECT 1;",
  "consulta": "WITH RECURSIVE contador(n) AS (\n  SELECT 1\n  UNION ALL\n  SELECT n + 1 FROM contador WHERE n < 5\n)\nSELECT n FROM contador",
  "anotaciones": [
    { "fragmento": "SELECT 1", "nota": "El caso BASE: el punto de partida de la recursión — genera la primera fila, n = 1, sin depender de nada." },
    { "fragmento": "UNION ALL\n  SELECT n + 1 FROM contador WHERE n < 5", "nota": "El caso RECURSIVO: se ejecuta una y otra vez, cada vez sumando 1 al n anterior, hasta que la condición WHERE n < 5 deja de cumplirse — entonces la recursión para." }
  ]
}
```

## Las tres piezas de toda CTE recursiva

```laboratorio
{
  "tipo": "roles",
  "titulo": "Sin cualquiera de las tres, no funciona",
  "roles": [
    { "etiqueta": "Caso base", "rol": "El punto de partida", "descripcion": "Una consulta normal, sin referenciar la propia CTE — genera la(s) primera(s) fila(s)." },
    { "etiqueta": "UNION ALL", "rol": "Conecta el caso base con el recursivo", "descripcion": "Siempre UNION ALL, no UNION — la recursión suele generar filas que técnicamente no son \"duplicadas\" en sentido estricto, y UNION eliminaría rendimiento comprobándolo en vano." },
    { "etiqueta": "Caso recursivo", "rol": "Se referencia a sí mismo, con una condición de parada", "descripcion": "Sin algo como WHERE que eventualmente deje de cumplirse, la recursión no terminaría nunca — un límite de seguridad la cortaría, pero es un error de diseño real." }
  ]
}
```

## Errores típicos

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    { "titulo": "Olvidar la condición de parada en el caso recursivo.", "texto": "Sin algo como WHERE n < 5, la CTE seguiría generando filas indefinidamente — un bucle infinito real, no solo una consulta lenta." },
    { "titulo": "Usar UNION en vez de UNION ALL por costumbre.", "texto": "UNION comprueba duplicados entre cada paso de la recursión, lo cual es mucho más costoso y casi nunca lo que se necesita — UNION ALL es la forma estándar en una CTE recursiva." }
  ]
}
```

## Practica

```laboratorio
{
  "tipo": "sql-en-vivo",
  "consigna": "Genera, con una CTE recursiva llamada pares, los números pares del 2 al 10 (empieza en 2, suma de 2 en 2, para en 10).",
  "esquemaSql": "SELECT 1;",
  "consultaInicial": "",
  "consultaSolucion": "WITH RECURSIVE pares(n) AS (SELECT 2 UNION ALL SELECT n + 2 FROM pares WHERE n < 10) SELECT n FROM pares"
}
```

## Para profundizar

```laboratorio
{
  "tipo": "recursos",
  "titulo": "Fuentes de esta lección",
  "recursos": [
    {
      "titulo": "WITH clause",
      "descripcion": "Referencia oficial de la cláusula WITH, incluidas las CTEs recursivas.",
      "url": "https://sqlite.org/lang_with.html",
      "etiqueta": "SQLite"
    }
  ]
}
```
