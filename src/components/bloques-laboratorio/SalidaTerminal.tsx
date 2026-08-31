export function SalidaTerminal({
  comando,
  salida,
  error,
}: {
  comando: string
  salida?: string
  error?: string
}) {
  return (
    <div className="overflow-x-auto rounded-lg bg-neutral-950 p-3 font-mono text-sm text-neutral-100">
      <p>
        <span className="text-green-400">$</span> git {comando}
      </p>
      {salida !== undefined && (
        <pre className="mt-1 whitespace-pre-wrap text-neutral-300">{salida}</pre>
      )}
      {error !== undefined && (
        <pre className="mt-1 whitespace-pre-wrap text-red-400">{error}</pre>
      )}
    </div>
  )
}
