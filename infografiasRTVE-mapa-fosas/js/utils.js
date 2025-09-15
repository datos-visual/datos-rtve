export const getParam = key => new URLSearchParams(location.search).get(key);

export async function fetchJSON(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${res.status} ${res.statusText} ⇒ ${url}`);
  return res.json();
}

export async function cargarJSON(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error("No se pudo cargar el archivo JSON");
  return res.json();
}

export function normId(id) {
  return String(parseInt(id, 10));
}