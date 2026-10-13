// REMEMBERS_ACTIVE controla si /recuerdos acepta cargas. Si no existe o está vacía se
// asume activa; cualquier valor distinto de "true" la desactiva.
export function isRemembersActive() {
  const value = process.env.REMEMBERS_ACTIVE?.trim();
  return !value || value.toLowerCase() === "true";
}
