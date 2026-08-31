declare module 'wasm-git/lg2_async.js' {
  interface OpcionesWasmGit {
    // El build lg2_async 0.0.17 declara `wasmBinary` en su glue de Emscripten
    // pero nunca lo lee (confirmado leyendo el fichero: `var wasmBinary;`
    // no se asigna nunca desde Module["wasmBinary"]) — el punto de extensión
    // real que sí respeta es `instantiateWasm`, que sustituye la
    // instanciación por defecto por completo. Ver motor.ts.
    instantiateWasm: (
      imports: WebAssembly.Imports,
      exito: (instancia: WebAssembly.Instance) => void,
    ) => void
  }

  export default function initGit(opciones: OpcionesWasmGit): Promise<unknown>
}
