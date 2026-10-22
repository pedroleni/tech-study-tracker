// `process` mínimo para el worker: varias dependencias lo leen al cargar.
export const process = {
  env: { NODE_ENV: 'production' },
  platform: 'browser',
  cwd: () => '/',
  version: 'v22.0.0',
  versions: {},
  argv: [],
  emitWarning: () => {},
  nextTick: (f, ...a) => queueMicrotask(() => f(...a)),
  stdout: { isTTY: false },
  stderr: { isTTY: false },
}
