declare module 'wasm-git/lg2_async.js' {
  interface OpcionesWasmGit {
    wasmBinary: ArrayBuffer
  }

  export default function initGit(opciones: OpcionesWasmGit): Promise<unknown>
}
