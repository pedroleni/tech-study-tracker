# Range types: modelar un rango como un solo valor

- **Módulo:** Tipos de datos que SQLite no tiene
- **Slug:** `range-types` (autogenerado del título)
- **Orden:** 100
- **Fuentes:** [8.17. Range Types](https://www.postgresql.org/docs/current/rangetypes.html) — ver `contenido/postgresql/TEMARIO.md` #5

---

## Qué es y para qué sirve

Modelar "del 1 al 5 de enero" con dos columnas separadas (`fecha_inicio`, `fecha_fin`) funciona, pero deja toda la lógica de solapamiento ("¿se cruzan estas dos reservas?") a mano, con comparaciones propensas a errores. Postgres tiene un tipo real para esto: los **range types** — un único valor que representa un rango, con operadores propios para preguntar si se solapa con otro, si contiene un valor, etc.

```laboratorio
{
  "tipo": "sql-anotado",
  "motor": "postgres",
  "titulo": "Un rango de fechas como un único valor",
  "esquemaSql": "CREATE TABLE reservas (id serial primary key, sala text, periodo daterange);\nINSERT INTO reservas (sala, periodo) VALUES\n  ('Sala A', daterange('2026-03-01', '2026-03-05')),\n  ('Sala A', daterange('2026-03-10', '2026-03-15'));",
  "consulta": "SELECT sala, periodo, lower(periodo) AS desde, upper(periodo) AS hasta FROM reservas ORDER BY periodo",
  "anotaciones": [
    { "fragmento": "periodo daterange", "nota": "daterange es un tipo de rango ya incluido de serie (built-in) — Postgres también trae numrange, int4range, tsrange (rangos de fecha+hora) entre otros, uno por cada tipo base que tiene sentido acotar en un rango." },
    { "fragmento": "lower(periodo) AS desde, upper(periodo) AS hasta", "nota": "lower()/upper() extraen los dos extremos del rango — el límite inferior y superior — como valores normales del tipo base (date, en este caso)." }
  ]
}
```

## El operador que de verdad importa: `&&` (¿se solapan?)

```laboratorio
{
  "tipo": "sql-en-vivo",
  "motor": "postgres",
  "consigna": "Comprueba si una nueva reserva del 3 al 8 de marzo se solapa con alguna reserva ya existente en la Sala A. Usa el operador && entre rangos.",
  "esquemaSql": "CREATE TABLE reservas (id serial primary key, sala text, periodo daterange);\nINSERT INTO reservas (sala, periodo) VALUES\n  ('Sala A', daterange('2026-03-01', '2026-03-05')),\n  ('Sala A', daterange('2026-03-10', '2026-03-15'));",
  "consultaInicial": "",
  "consultaSolucion": "SELECT sala, periodo FROM reservas WHERE sala = 'Sala A' AND periodo && daterange('2026-03-03', '2026-03-08')"
}
```

```laboratorio
{
  "tipo": "callout",
  "variante": "info",
  "titulo": "Sin range types, esta misma pregunta necesita 4 comparaciones a mano",
  "contenido": "\"¿Se solapan A y B?\" sin range types se escribe como A.inicio < B.fin AND A.fin > B.inicio — fácil de escribir mal (con un < en vez de un <=, por ejemplo) y fácil de olvidar un caso límite. periodo && otro_rango expresa exactamente la misma pregunta, sin ese riesgo."
}
```

## Ejercicios

1. Ejecuta el segundo bloque y confirma que detecta el solapamiento con la reserva del 1-5 de marzo (aunque no coincida exactamente con sus fechas).
2. Cambia el rango de la consulta a uno que NO se solape con ninguna reserva existente (por ejemplo, del 20 al 25 de marzo) y confirma que el resultado sale vacío.

## Para profundizar

```laboratorio
{
  "tipo": "recursos",
  "titulo": "Fuentes de esta lección",
  "recursos": [
    {
      "titulo": "8.17. Range Types",
      "descripcion": "Documentación oficial completa de range types: tipos disponibles, operadores, funciones.",
      "url": "https://www.postgresql.org/docs/current/rangetypes.html",
      "etiqueta": "PostgreSQL"
    }
  ]
}
```
