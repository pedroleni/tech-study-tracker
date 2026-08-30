# Restricciones: NOT NULL, UNIQUE, CHECK, DEFAULT

- **Módulo:** Diseño de esquema
- **Slug:** `restricciones` (autogenerado del título)
- **Orden:** 290
- **Fuentes:** [CREATE TABLE](https://sqlite.org/lang_createtable.html) — ver `contenido/sql/TEMARIO.md` #29

---

## Qué es y para qué sirve

Una restricción declara una regla que el motor **hace cumplir de verdad** — si un `INSERT` o `UPDATE` la viola, la operación falla en vez de guardar un dato inconsistente.

```laboratorio
{
  "tipo": "sql-anotado",
  "titulo": "Un precio que no puede ser negativo",
  "esquemaSql": "CREATE TABLE productos (id INTEGER PRIMARY KEY, precio REAL CHECK (precio > 0));",
  "consulta": "INSERT INTO productos (precio) VALUES (-5)",
  "anotaciones": [
    { "fragmento": "precio REAL CHECK (precio > 0)", "nota": "CHECK declara una condición que todo valor de esa columna debe cumplir — aquí, que sea mayor que cero." },
    { "fragmento": "INSERT INTO productos (precio) VALUES (-5)", "nota": "Falla de verdad con \"CHECK constraint failed: precio > 0\" (verificado ejecutándolo) — el motor rechaza la fila, no la guarda a medias." }
  ]
}
```

## Las cuatro restricciones más usadas

```laboratorio
{
  "tipo": "roles",
  "titulo": "Cada una hace cumplir una regla distinta",
  "roles": [
    { "etiqueta": "NOT NULL", "rol": "La columna nunca puede quedar vacía", "descripcion": "Sin ella, cualquier columna acepta NULL por defecto." },
    { "etiqueta": "UNIQUE", "rol": "El valor no se puede repetir entre filas", "descripcion": "A diferencia de PRIMARY KEY, una tabla puede tener varias columnas UNIQUE distintas (un email único, un username único, cada uno por su lado)." },
    { "etiqueta": "CHECK", "rol": "Una condición arbitraria que el valor debe cumplir", "descripcion": "precio > 0, edad >= 18, o cualquier expresión booleana válida." },
    { "etiqueta": "DEFAULT", "rol": "Un valor de partida si no se indica ninguno", "descripcion": "No es, en sentido estricto, una restricción que rechace datos — pero se declara junto a las demás en CREATE TABLE." }
  ]
}
```

## Errores típicos

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    { "titulo": "Confundir UNIQUE con PRIMARY KEY.", "texto": "Una tabla solo puede tener UNA clave primaria, pero puede tener varias columnas UNIQUE distintas — ambas evitan duplicados, pero PRIMARY KEY además identifica la fila." },
    { "titulo": "Validar una regla solo en la aplicación, sin CHECK en la base de datos.", "texto": "Si dos aplicaciones distintas (o un script de mantenimiento) escriben en la misma tabla, una regla que solo vive en el código de una de ellas no protege a las demás — CHECK la hace cumplir siempre, sin importar quién escriba." }
  ]
}
```

## Practica

```laboratorio
{
  "tipo": "sql-en-vivo",
  "consigna": "La tabla exige precio > 0. Inserta un producto llamado \"Cuaderno\" con precio 5, y termina con un SELECT * para comprobar que se guardó.",
  "esquemaSql": "CREATE TABLE productos (id INTEGER PRIMARY KEY, nombre TEXT NOT NULL, precio REAL CHECK (precio > 0));",
  "consultaInicial": "",
  "consultaSolucion": "INSERT INTO productos (nombre, precio) VALUES ('Cuaderno', 5); SELECT * FROM productos;"
}
```

## Para profundizar

```laboratorio
{
  "tipo": "recursos",
  "titulo": "Fuentes de esta lección",
  "recursos": [
    {
      "titulo": "CREATE TABLE",
      "descripcion": "Referencia oficial de CREATE TABLE, incluidas las restricciones de columna.",
      "url": "https://sqlite.org/lang_createtable.html",
      "etiqueta": "SQLite"
    }
  ]
}
```
