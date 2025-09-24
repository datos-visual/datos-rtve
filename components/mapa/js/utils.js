/** Devuelve el valor de ?param o null */
export const getParam = (key) => new URLSearchParams(location.search).get(key);

/** fetch JSON con manejo de errores */
export async function fetchJSON(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${res.status} ${res.statusText} ⇒ ${url}`);
  return res.json();
}

export function normId(id) {
  // Quita ceros a la izquierda y fuerza a string (ej: "00001" => "1")
  const n = parseInt(id, 10);
  if (!Number.isFinite(n)) return null;
  return String(n);
}

//export const padId = raw => raw.toString().padStart(5, '0'); //normalizar ID que llega por URL
