import { c as _c } from "react/compiler-runtime";
import { useState } from 'react';
function Fila(t0) {
  const $ = _c(2);
  const {
    nombre
  } = t0;
  let t1;
  if ($[0] !== nombre) {
    t1 = <li>{nombre}</li>;
    $[0] = nombre;
    $[1] = t1;
  } else {
    t1 = $[1];
  }
  return t1;
}
export default function App() {
  const $ = _c(9);
  const [n, setN] = useState(0);
  let t0;
  if ($[0] === Symbol.for("react.memo_cache_sentinel")) {
    t0 = ["Pan", "Leche"];
    $[0] = t0;
  } else {
    t0 = $[0];
  }
  const nombres = t0;
  let t1;
  if ($[1] !== n) {
    t1 = () => setN(n + 1);
    $[1] = n;
    $[2] = t1;
  } else {
    t1 = $[2];
  }
  let t2;
  if ($[3] !== n || $[4] !== t1) {
    t2 = <button onClick={t1}>Pulsado {n}</button>;
    $[3] = n;
    $[4] = t1;
    $[5] = t2;
  } else {
    t2 = $[5];
  }
  let t3;
  if ($[6] === Symbol.for("react.memo_cache_sentinel")) {
    t3 = <ul>{nombres.map(_temp)}</ul>;
    $[6] = t3;
  } else {
    t3 = $[6];
  }
  let t4;
  if ($[7] !== t2) {
    t4 = <main>{t2}{t3}</main>;
    $[7] = t2;
    $[8] = t4;
  } else {
    t4 = $[8];
  }
  return t4;
}
function _temp(x) {
  return <Fila key={x} nombre={x} />;
}