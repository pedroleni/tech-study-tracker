# NEW y OLD dentro de un trigger

- **Módulo:** Triggers
- **Slug:** `new-y-old` (autogenerado del título)
- **Orden:** 380
- **Fuentes:** [37. Triggers](https://www.postgresql.org/docs/current/triggers.html) — ver `contenido/postgresql/TEMARIO.md` #14

---

## Qué es y para qué sirve

Dentro de una función de trigger `FOR EACH ROW`, Postgres da acceso a dos variables especiales: **`NEW`** (la fila después del cambio) y **`OLD`** (la fila antes del cambio). Qué combinación está disponible depende del evento: `INSERT` solo tiene `NEW`, `DELETE` solo tiene `OLD`, `UPDATE` tiene los dos a la vez — pudiendo comparar qué cambió de verdad.

```laboratorio
{
  "tipo": "sql-anotado",
  "motor": "postgres",
  "titulo": "Un trigger BEFORE UPDATE que valida el cambio comparando OLD y NEW",
  "esquemaSql": "CREATE TABLE productos (id serial primary key, nombre text, precio numeric);\nINSERT INTO productos (nombre, precio) VALUES ('Teclado', 45.99);\nCREATE FUNCTION evitar_bajada_brusca() RETURNS trigger AS $$\nBEGIN\n  IF NEW.precio < OLD.precio * 0.5 THEN\n    RAISE EXCEPTION 'bajada de precio sospechosa: de % a %', OLD.precio, NEW.precio;\n  END IF;\n  RETURN NEW;\nEND;\n$$ LANGUAGE plpgsql;\nCREATE TRIGGER trg_validar_precio\n  BEFORE UPDATE ON productos\n  FOR EACH ROW\n  EXECUTE FUNCTION evitar_bajada_brusca();",
  "consulta": "UPDATE productos SET precio = 40.00 WHERE id = 1 RETURNING precio",
  "anotaciones": [
    { "fragmento": "IF NEW.precio < OLD.precio * 0.5 THEN", "nota": "OLD.precio es el valor ANTES del UPDATE (45.99); NEW.precio es el valor que se está intentando poner (40.00 en esta consulta, mucho menos en el ejercicio de abajo). Comparar los dos es exactamente lo que un trigger BEFORE UPDATE puede hacer y un CHECK normal no — un CHECK no tiene acceso al valor ANTERIOR." },
    { "fragmento": "RETURNING precio", "nota": "RETURNING devuelve el valor real tras el UPDATE (y tras pasar por el trigger BEFORE, que pudo haberlo modificado) — aquí simplemente confirma que 40.00 sí se aceptó, por no ser una bajada \"sospechosa\"." }
  ]
}
```

## El error real cuando SÍ dispara la validación

```laboratorio
{
  "tipo": "sql-en-vivo",
  "motor": "postgres",
  "consigna": "Intenta bajar el precio de 45.99 a 5.00 (más de la mitad) y lee el error real que lanza el trigger.",
  "esquemaSql": "CREATE TABLE productos (id serial primary key, nombre text, precio numeric);\nINSERT INTO productos (nombre, precio) VALUES ('Teclado', 45.99);\nCREATE FUNCTION evitar_bajada_brusca() RETURNS trigger AS $$\nBEGIN\n  IF NEW.precio < OLD.precio * 0.5 THEN\n    RAISE EXCEPTION 'bajada de precio sospechosa: de % a %', OLD.precio, NEW.precio;\n  END IF;\n  RETURN NEW;\nEND;\n$$ LANGUAGE plpgsql;\nCREATE TRIGGER trg_validar_precio\n  BEFORE UPDATE ON productos\n  FOR EACH ROW\n  EXECUTE FUNCTION evitar_bajada_brusca();",
  "consultaInicial": "UPDATE productos SET precio = 5.00 WHERE id = 1",
  "consultaSolucion": "UPDATE productos SET precio = 40.00 WHERE id = 1"
}
```

## Ejercicios

1. Ejecuta el primer bloque y confirma que un `UPDATE` moderado (45.99 a 40.00) se acepta sin problema.
2. Ejecuta el segundo bloque tal cual (bajando a 5.00) y lee el mensaje de error exacto — ¿qué dos valores concretos incluye?

## Para profundizar

```laboratorio
{
  "tipo": "recursos",
  "titulo": "Fuentes de esta lección",
  "recursos": [
    {
      "titulo": "37. Triggers",
      "descripcion": "Capítulo completo de triggers, incluida la sección sobre NEW/OLD.",
      "url": "https://www.postgresql.org/docs/current/triggers.html",
      "etiqueta": "PostgreSQL"
    }
  ]
}
```
