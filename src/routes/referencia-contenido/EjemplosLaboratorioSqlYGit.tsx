import { GitAnotado } from '@/components/bloques-laboratorio/GitAnotado'
import { GitEnVivo } from '@/components/bloques-laboratorio/GitEnVivo'
import { SqlAnotado } from '@/components/bloques-laboratorio/SqlAnotado'
import { SqlEnVivo } from '@/components/bloques-laboratorio/SqlEnVivo'

import { Referencia } from '@/routes/referencia-contenido/Referencia'

export function EjemplosSql() {
  return (
    <>
      <Referencia nombre="SqlAnotado">
        <SqlAnotado
          tipo="sql-anotado"
          motor="sqlite"
          esquemaSql={
            "CREATE TABLE departamentos (id INTEGER PRIMARY KEY, nombre TEXT);\nCREATE TABLE empleados (id INTEGER PRIMARY KEY, nombre TEXT, departamento_id INTEGER, salario REAL);\nINSERT INTO departamentos VALUES (1, 'Ingeniería'), (2, 'Ventas');\nINSERT INTO empleados VALUES (1, 'Ana', 1, 55000), (2, 'Luis', 1, 62000), (3, 'Marta', 2, 48000);"
          }
          consulta={
            'SELECT d.nombre AS departamento, COUNT(*) AS empleados\nFROM empleados e\nJOIN departamentos d ON d.id = e.departamento_id\nGROUP BY d.nombre'
          }
          anotaciones={[
            {
              fragmento: 'JOIN departamentos d ON d.id = e.departamento_id',
              nota: 'Une cada empleado con su departamento por id.',
            },
            {
              fragmento: 'GROUP BY d.nombre',
              nota: 'Agrupa antes de agregar — sin esto, COUNT trataría la tabla entera como un único grupo.',
            },
          ]}
        />
      </Referencia>

      <Referencia nombre="SqlEnVivo">
        <SqlEnVivo
          tipo="sql-en-vivo"
          motor="sqlite"
          consigna='Muestra el nombre y el salario de los empleados de "Ingeniería", ordenados de mayor a menor salario.'
          esquemaSql={
            "CREATE TABLE departamentos (id INTEGER PRIMARY KEY, nombre TEXT);\nCREATE TABLE empleados (id INTEGER PRIMARY KEY, nombre TEXT, departamento_id INTEGER, salario REAL);\nINSERT INTO departamentos VALUES (1, 'Ingeniería'), (2, 'Ventas');\nINSERT INTO empleados VALUES (1, 'Ana', 1, 55000), (2, 'Luis', 1, 62000), (3, 'Marta', 2, 48000);"
          }
          consultaInicial=""
          consultaSolucion="SELECT nombre, salario FROM empleados WHERE departamento_id = 1 ORDER BY salario DESC"
        />
      </Referencia>

      <Referencia nombre="SqlAnotado (motor postgres)">
        <SqlAnotado
          tipo="sql-anotado"
          motor="postgres"
          etiquetaSeccion="SQL anotado — motor postgres"
          etiquetaConsulta="Consulta SQL anotada — motor postgres"
          esquemaSql={
            "CREATE TABLE eventos (id serial primary key, datos jsonb); INSERT INTO eventos (datos) VALUES ('{\"tipo\": \"click\", \"x\": 10}'), ('{\"tipo\": \"scroll\"}');"
          }
          consulta="SELECT datos->>'tipo' AS tipo FROM eventos WHERE datos ? 'x'"
          anotaciones={[
            {
              fragmento: "datos->>'tipo'",
              nota: 'JSONB, no JSON: Postgres lo guarda en binario, no como texto — por eso admite índices GIN y operadores como ? (¿existe esta clave?).',
            },
          ]}
        />
      </Referencia>

      <Referencia nombre="SqlEnVivo (motor postgres + RLS con identidad simulada)">
        <SqlEnVivo
          tipo="sql-en-vivo"
          motor="postgres"
          etiquetaSeccion="SQL en vivo — motor postgres, RLS"
          consigna='Cambia de identidad arriba y comprueba que cada quien ve solo sus propios posts.'
          esquemaSql={
            "CREATE TABLE posts (id serial primary key, autor_id text not null, titulo text not null); " +
            "INSERT INTO posts (autor_id, titulo) VALUES ('ana', 'Post de Ana 1'), ('ana', 'Post de Ana 2'), ('roberto', 'Post de Roberto'); " +
            "CREATE OR REPLACE FUNCTION auth_uid() RETURNS text AS $$ SELECT current_setting('myapp.current_user_id', true); $$ LANGUAGE sql STABLE; " +
            "ALTER TABLE posts ENABLE ROW LEVEL SECURITY; " +
            "CREATE POLICY \"solo ver los propios posts\" ON posts FOR SELECT USING (autor_id = auth_uid()); " +
            "CREATE ROLE app_user NOSUPERUSER; GRANT USAGE ON SCHEMA public TO app_user; GRANT SELECT ON posts TO app_user;"
          }
          identidadSimulada={[
            { etiqueta: 'Ana', valor: 'ana' },
            { etiqueta: 'Roberto', valor: 'roberto' },
          ]}
          consultaInicial="SELECT titulo FROM posts ORDER BY titulo"
          consultaSolucion="SELECT titulo FROM posts ORDER BY titulo"
        />
      </Referencia>
    </>
  )
}

export function EjemplosGit() {
  return (
    <>
      <Referencia nombre="GitAnotado">
        <GitAnotado
          tipo="git-anotado"
          esquemaGit={[
            'init .',
            { escribir: { ruta: 'a.txt', contenido: 'hola\n' } },
            'add a.txt',
            "commit -m 'primer commit'",
          ]}
          comando="log --oneline"
          mostrarGrafo={false}
          anotaciones={[
            {
              fragmento: 'log',
              nota: 'log --oneline muestra el historial real, hash corto + mensaje por línea.',
            },
          ]}
        />
      </Referencia>

      <Referencia nombre="GitEnVivo (con conflicto real resuelto)">
        <GitEnVivo
          tipo="git-en-vivo"
          consigna="master y feature cambiaron la misma línea de config.txt desde que se separaron. Ya se intentó fusionar feature en master y hay un conflicto real sin resolver: ¿qué comando te dice qué ficheros están en conflicto?"
          esquemaGit={[
            'init .',
            { escribir: { ruta: 'config.txt', contenido: 'puerto=8080\n' } },
            'add config.txt',
            'commit -m base',
            'checkout -b feature',
            { escribir: { ruta: 'config.txt', contenido: 'puerto=3000\n' } },
            'add config.txt',
            'commit -m feature-cambia-puerto',
            'checkout master',
            { escribir: { ruta: 'config.txt', contenido: 'puerto=9090\n' } },
            'add config.txt',
            'commit -m master-tambien-cambia-puerto',
            // wasm-git ("lg2 merge") deja marcadores de conflicto reales en
            // el fichero y termina con código 0 — no lanza excepción, solo
            // informa por stderr. Por eso el intento de merge se ejecuta
            // aquí, en silencio, como paso de guion: lo interactivo es que
            // el alumno descubra qué comando muestra el conflicto real.
            'merge feature',
          ]}
          comandoInicial=""
          comandoSolucion="status"
          mostrarGrafo={false}
        />
      </Referencia>

      <Referencia nombre="GitAnotado (con GrafoCommits)">
        <GitAnotado
          tipo="git-anotado"
          esquemaGit={[
            'init .',
            { escribir: { ruta: 'a.txt', contenido: 'base\n' } },
            'add a.txt',
            'commit -m base',
            'checkout -b feature',
            { escribir: { ruta: 'b.txt', contenido: 'x\n' } },
            'add b.txt',
            'commit -m feature-commit',
            'checkout master',
            { escribir: { ruta: 'c.txt', contenido: 'y\n' } },
            'add c.txt',
            'commit -m master-commit',
          ]}
          comando="log --oneline"
          mostrarGrafo={true}
          anotaciones={[{ fragmento: 'log', nota: 'feature divergió de master en el mismo commit base.' }]}
          etiquetaSeccion="Git anotado (con grafo)"
        />
      </Referencia>
    </>
  )
}
