# Operadores y funciones JSONB

- **Módulo:** JSON de verdad: JSONB
- **Slug:** `operadores-y-funciones-jsonb` (autogenerado del título)
- **Orden:** 120
- **Fuentes:** [9.16. JSON Functions and Operators](https://www.postgresql.org/docs/current/functions-json.html) — ver `contenido/postgresql/TEMARIO.md` #6

---

## Qué es y para qué sirve

`jsonb` trae su propio conjunto de operadores para leer y modificar datos sin tener que reconstruir el JSON entero a mano. Ya usaste `->>` en el módulo anterior del temario — aquí van los que de verdad marcan la diferencia frente a tratar JSON como texto plano.

```laboratorio
{
  "tipo": "sql-anotado",
  "motor": "postgres",
  "titulo": "Los operadores más usados, todos a la vez",
  "esquemaSql": "CREATE TABLE productos (id serial primary key, datos jsonb);\nINSERT INTO productos (datos) VALUES\n  ('{\"nombre\": \"Teclado\", \"precio\": 45, \"specs\": {\"switches\": \"mecanicos\", \"rgb\": true}}');",
  "consulta": "SELECT\n  datos->'specs' AS specs_como_jsonb,\n  datos->>'nombre' AS nombre_como_texto,\n  datos->'specs'->>'switches' AS switches,\n  datos ? 'precio' AS tiene_precio,\n  datos @> '{\"specs\": {\"rgb\": true}}' AS es_rgb\nFROM productos",
  "anotaciones": [
    { "fragmento": "datos->'specs'", "nota": "-> (flecha simple) devuelve el valor como jsonb — útil para seguir navegando dentro de una estructura anidada." },
    { "fragmento": "datos->>'nombre'", "nota": "->> (flecha doble) devuelve el valor como texto plano — la que usarías para el resultado final, no para seguir navegando." },
    { "fragmento": "datos->'specs'->>'switches'", "nota": "Encadenar -> y ->> es la forma normal de bajar varios niveles: jsonb hasta el penúltimo paso, texto solo en el último." },
    { "fragmento": "datos ? 'precio'", "nota": "? pregunta \"¿existe esta clave de primer nivel?\" — no busca el VALOR, solo si la clave está presente." },
    { "fragmento": "datos @> '{\"specs\": {\"rgb\": true}}'", "nota": "@> (\"contiene\") pregunta si el jsonb de la izquierda contiene, en cualquier profundidad, la estructura de la derecha — el operador más potente para filtrar por contenido anidado." }
  ]
}
```

## Modificar un jsonb sin reescribirlo entero

```laboratorio
{
  "tipo": "sql-en-vivo",
  "motor": "postgres",
  "consigna": "Actualiza el precio del producto a 39 (en vez de 45) usando jsonb_set, sin tocar el resto de las claves.",
  "esquemaSql": "CREATE TABLE productos (id serial primary key, datos jsonb);\nINSERT INTO productos (datos) VALUES ('{\"nombre\": \"Teclado\", \"precio\": 45}');",
  "consultaInicial": "",
  "consultaSolucion": "UPDATE productos SET datos = jsonb_set(datos, '{precio}', '39') WHERE id = 1"
}
```

```laboratorio
{
  "tipo": "callout",
  "variante": "info",
  "titulo": "jsonb_set() recibe una ruta como array de texto",
  "contenido": "'{precio}' es la ruta hacia la clave a cambiar (un array de un solo elemento, para un campo de primer nivel — '{specs,rgb}' llegaría a un campo anidado). El tercer argumento, '39', es el nuevo valor, ya en formato jsonb — por eso va entre comillas simples como el resto de literales jsonb de esta lección."
}
```

## Ejercicios

1. Ejecuta el primer bloque y confirma: `tiene_precio` da `true`, `es_rgb` da `true`.
2. Cambia la condición `@>` del primer bloque para preguntar por `{"specs": {"rgb": false}}` — ¿qué esperas que devuelva `es_rgb` ahora, y por qué?

## Para profundizar

```laboratorio
{
  "tipo": "recursos",
  "titulo": "Fuentes de esta lección",
  "recursos": [
    {
      "titulo": "9.16. JSON Functions and Operators",
      "descripcion": "Referencia completa de operadores y funciones JSON/JSONB.",
      "url": "https://www.postgresql.org/docs/current/functions-json.html",
      "etiqueta": "PostgreSQL"
    }
  ]
}
```
