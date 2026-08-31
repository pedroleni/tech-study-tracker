# Por qué existe VACUUM (MVCC deja "tuplas muertas" detrás)

- **Módulo:** Mantenimiento: VACUUM
- **Slug:** `por-que-existe-vacuum` (autogenerado del título)
- **Orden:** 320
- **Fuentes:** [24.1. Routine Vacuuming](https://www.postgresql.org/docs/current/routine-vacuuming.html) — ver `contenido/postgresql/TEMARIO.md` #12

---

## Qué es y para qué sirve

En el Módulo 8 de este temario viste que un `UPDATE` en Postgres no modifica una fila en el sitio — crea una versión nueva y marca la vieja como obsoleta (su `xmax`). Esas versiones viejas ("tuplas muertas") no desaparecen solas: siguen ocupando espacio en disco hasta que algo las limpia de verdad. Ese algo es **VACUUM**.

```laboratorio
{
  "tipo": "sql-anotado",
  "motor": "postgres",
  "titulo": "Un UPDATE mueve la fila de sitio de verdad — la posición vieja queda atrás",
  "esquemaSql": "CREATE TABLE contador (id serial primary key, valor int);\nINSERT INTO contador (valor) VALUES (0);\nUPDATE contador SET valor = 1 WHERE id = 1;",
  "consulta": "SELECT ctid, xmin, xmax, valor FROM contador WHERE id = 1",
  "anotaciones": [
    { "fragmento": "ctid", "nota": "La posición física real de esta versión de la fila dentro del fichero de la tabla (página, posición dentro de la página). Tras el UPDATE, el ctid ya NO es (0,1) — la fila se movió a una posición nueva, y la posición vieja quedó como una tupla muerta, todavía ocupando espacio." },
    { "fragmento": "xmax", "nota": "0 en esta versión — es la versión VIGENTE. La versión anterior (la que tenía valor = 0) sigue físicamente en el fichero, con su propio xmax ya distinto de 0, marcada como obsoleta pero sin borrar todavía." }
  ]
}
```

## Compruébalo tú: VACUUM se ejecuta sin tocar ningún dato vivo

```laboratorio
{
  "tipo": "sql-en-vivo",
  "motor": "postgres",
  "consigna": "Ejecuta VACUUM contador; tal cual — confirma que no da ningún error. VACUUM limpia espacio muerto por detrás, nunca toca las filas vivas.",
  "esquemaSql": "CREATE TABLE contador (id serial primary key, valor int);\nINSERT INTO contador (valor) VALUES (0);\nUPDATE contador SET valor = 1 WHERE id = 1;\nUPDATE contador SET valor = 2 WHERE id = 1;",
  "consultaInicial": "",
  "consultaSolucion": "VACUUM contador"
}
```

```laboratorio
{
  "tipo": "callout",
  "variante": "info",
  "titulo": "VACUUM no devuelve ninguna fila — y eso es lo correcto",
  "contenido": "A diferencia de un SELECT, VACUUM es un comando de mantenimiento: no consulta ni modifica los DATOS visibles de la tabla, solo limpia espacio muerto por detrás. Que el resultado salga vacío, sin ningún error, ES la confirmación de que funcionó."
}
```

## Qué hace VACUUM de verdad

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    { "titulo": "Marca el espacio de las tuplas muertas como reutilizable.", "texto": "No lo devuelve al sistema operativo de inmediato (eso es VACUUM FULL, próxima lección) — lo marca como libre DENTRO del propio fichero de la tabla, para que futuros INSERT/UPDATE lo reutilicen sin que el fichero siga creciendo sin parar." },
    { "titulo": "Actualiza las estadísticas del planificador.", "texto": "VACUUM (y ANALYZE, que suele ir junto en la práctica) mantienen al día justo la información que el Módulo 7 de este temario mostró que el planificador necesita para decidir bien." },
    { "titulo": "Sin VACUUM, una tabla con muchas escrituras crece sin límite.", "texto": "El fenómeno real se llama \"table bloat\" — un fichero de tabla mucho más grande de lo que sus datos vivos justificarían, porque acumula tuplas muertas sin límite." }
  ]
}
```

## Ejercicios

1. Ejecuta el primer bloque y confirma que el `ctid` real ya no es `(0,1)` tras el `UPDATE` — la fila se movió de verdad.
2. En tus propias palabras: ¿por qué una tabla con MUCHOS UPDATEs sobre las mismas filas (un contador de visitas, por ejemplo) genera más tuplas muertas, y por tanto necesita VACUUM con más frecuencia, que una tabla de solo lectura?

## Para profundizar

```laboratorio
{
  "tipo": "recursos",
  "titulo": "Fuentes de esta lección",
  "recursos": [
    {
      "titulo": "24.1. Routine Vacuuming",
      "descripcion": "Documentación oficial completa sobre VACUUM y su necesidad.",
      "url": "https://www.postgresql.org/docs/current/routine-vacuuming.html",
      "etiqueta": "PostgreSQL"
    }
  ]
}
```
