// Código duplicado con jscpd (docs/clean-code.md), con deuda congelada: los bloques
// repetidos que ya existían están en jscpd-base.json y pueden desaparecer, pero no
// aparecer nuevos. Un bloque se identifica por el par de archivos donde está repetido
// (las líneas cambian con cualquier edición; el par de archivos no).
//
//   node scripts/clean-code/duplicados.mjs            # comprueba (lo usa la puerta)
//   node scripts/clean-code/duplicados.mjs --podar    # baja la base tras quitar duplicados
import { spawnSync } from "node:child_process";
import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";

const raiz = path.resolve(import.meta.dirname, "../..");
const rutaBase = path.join(raiz, "jscpd-base.json");

function paresActuales() {
  const carpeta = mkdtempSync(path.join(tmpdir(), "jscpd-"));
  try {
    const resultado = spawnSync("npx", ["jscpd", "--output", carpeta], { cwd: raiz, encoding: "utf8" });
    const informe = path.join(carpeta, "jscpd-report.json");
    if (resultado.error || !existsSync(informe)) {
      throw new Error(`No se ha podido ejecutar jscpd: ${resultado.error?.message ?? resultado.stderr}`);
    }
    const pares = {};
    for (const clon of JSON.parse(readFileSync(informe, "utf8")).duplicates) {
      const clave = [clon.firstFile.name, clon.secondFile.name].map((f) => path.relative(raiz, path.resolve(raiz, f))).sort().join(" ↔ ");
      pares[clave] = (pares[clave] ?? 0) + 1;
    }
    return pares;
  } finally {
    rmSync(carpeta, { recursive: true, force: true });
  }
}

const actuales = paresActuales();
const base = existsSync(rutaBase) ? JSON.parse(readFileSync(rutaBase, "utf8")) : {};

if (process.argv.includes("--podar")) {
  // Solo baja: un par nuevo o con más bloques no entra en la base por esta vía.
  const podada = Object.fromEntries(
    Object.entries(base)
      .map(([par, n]) => [par, Math.min(n, actuales[par] ?? 0)])
      .filter(([, n]) => n > 0),
  );
  writeFileSync(rutaBase, `${JSON.stringify(podada, null, 2)}\n`);
  console.log(`jscpd-base.json: ${Object.keys(base).length} → ${Object.keys(podada).length} pares.`);
  process.exit(0);
}

const nuevos = Object.entries(actuales).filter(([par, n]) => n > (base[par] ?? 0));
const congelados = Object.values(actuales).reduce((suma, n) => suma + n, 0);
if (nuevos.length > 0) {
  console.log("Código duplicado nuevo (no estaba en jscpd-base.json):");
  for (const [par, n] of nuevos) console.log(`  ${par}: ${n} bloque(s), antes ${base[par] ?? 0}`);
  console.log("Extrae el código común en vez de copiarlo (GEN-06). Detalle: npx jscpd --reporters console");
  process.exit(1);
}
console.log(`Sin duplicados nuevos (${congelados} bloques congelados en ${Object.keys(actuales).length} pares).`);
