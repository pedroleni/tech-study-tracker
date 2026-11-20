// Informe completo de clean code (docs/clean-code.md) en Markdown por la salida estándar:
// deuda congelada en eslint-suppressions.json, duplicados contando los tests y código muerto.
// Lo usa la revisión semanal de GitHub y el agente clean-code en modo auditoria.
import { spawnSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";

const raiz = path.resolve(import.meta.dirname, "../..");

function ejecutar(orden, argumentos) {
  return spawnSync(orden, argumentos, { cwd: raiz, encoding: "utf8" });
}

function deudaCongelada() {
  const supresiones = JSON.parse(readFileSync(path.join(raiz, "eslint-suppressions.json"), "utf8"));
  const porRegla = new Map();
  const porArchivo = [];
  for (const [archivo, reglas] of Object.entries(supresiones)) {
    let total = 0;
    for (const [regla, { count }] of Object.entries(reglas)) {
      porRegla.set(regla, (porRegla.get(regla) ?? 0) + count);
      total += count;
    }
    porArchivo.push([archivo, total]);
  }
  porArchivo.sort((a, b) => b[1] - a[1]);
  const total = [...porRegla.values()].reduce((suma, n) => suma + n, 0);
  const lineas = [
    `## Deuda congelada (ESLint)`,
    "",
    `**${total}** excepciones en ${porArchivo.length} archivos.`,
    "",
    "| Regla | Excepciones |",
    "|---|---|",
    ...[...porRegla.entries()].sort((a, b) => b[1] - a[1]).map(([r, n]) => `| \`${r}\` | ${n} |`),
    "",
    "Archivos con más deuda:",
    "",
    ...porArchivo.slice(0, 10).map(([archivo, n]) => `- \`${archivo}\`: ${n}`),
  ];
  return { total, texto: lineas.join("\n") };
}

function duplicados() {
  const carpeta = mkdtempSync(path.join(tmpdir(), "jscpd-"));
  const configuracion = path.join(carpeta, "jscpd.json");
  // Los mismos umbrales que la puerta (.jscpd.json), pero contando también los tests.
  const base = JSON.parse(readFileSync(path.join(raiz, ".jscpd.json"), "utf8"));
  writeFileSync(
    configuracion,
    JSON.stringify({
      ...base,
      path: base.path.map((ruta) => path.join(raiz, ruta)),
      ignore: [],
      // Aquí solo se informa: sin umbral que corte la ejecución.
      threshold: 100,
      reporters: ["json"],
      output: carpeta,
      silent: true,
    }),
  );
  const resultado = ejecutar("npx", ["jscpd", "--config", configuracion]);
  if (resultado.error || resultado.status === null) {
    rmSync(carpeta, { recursive: true, force: true });
    return `## Duplicados\n\nNo se ha podido ejecutar jscpd: ${resultado.error?.message ?? resultado.stderr}`;
  }
  try {
    const informe = JSON.parse(readFileSync(path.join(carpeta, "jscpd-report.json"), "utf8"));
    const { total } = informe.statistics;
    const clones = informe.duplicates.slice(0, 10).map(
      (clon) =>
        `- \`${path.relative(raiz, clon.firstFile.name)}:${clon.firstFile.start}\` ↔ ` +
        `\`${path.relative(raiz, clon.secondFile.name)}:${clon.secondFile.start}\` (${clon.lines} líneas)`,
    );
    return [
      "## Duplicados (contando los tests)",
      "",
      `**${total.clones}** bloques repetidos, ${total.duplicatedLines} líneas (${Number(total.percentage).toFixed(1)} %).`,
      "Aquí cuentan también los tests. La puerta solo bloquea duplicados nuevos fuera de los tests (los existentes están en `jscpd-base.json`).",
      "",
      ...clones,
    ].join("\n");
  } finally {
    rmSync(carpeta, { recursive: true, force: true });
  }
}

function codigoMuerto() {
  const resultado = ejecutar("npx", ["knip", "--no-progress", "--reporter", "compact"]);
  const salida = `${resultado.stdout}${resultado.stderr}`.trim();
  return ["## Código muerto (knip)", "", salida ? "```\n" + salida + "\n```" : "Sin hallazgos."].join(
    "\n",
  );
}

const deuda = deudaCongelada();
console.log(
  [
    "# Informe de clean code de Tech Study Tracker",
    "",
    `Generado el ${new Date().toISOString().slice(0, 10)} sobre \`${ejecutar("git", ["rev-parse", "--short", "HEAD"]).stdout.trim()}\`.`,
    "",
    deuda.texto,
    "",
    duplicados(),
    "",
    codigoMuerto(),
  ].join("\n"),
);
