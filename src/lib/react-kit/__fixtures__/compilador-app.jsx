import { useState } from 'react'

function Fila({ nombre }) {
  return <li>{nombre}</li>
}

export default function App() {
  const [n, setN] = useState(0)
  const nombres = ['Pan', 'Leche']
  return (
    <main>
      <button onClick={() => setN(n + 1)}>Pulsado {n}</button>
      <ul>{nombres.map((x) => <Fila key={x} nombre={x} />)}</ul>
    </main>
  )
}
