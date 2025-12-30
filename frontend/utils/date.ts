/**
 * Obtiene la fecha actual en formato YYYY-MM-DD en la zona horaria local
 * Evita problemas con toISOString() que devuelve la fecha en UTC
 */
export function getLocalDateString(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Obtiene la fecha de hace N días en formato YYYY-MM-DD
 */
export function getDateDaysAgo(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return getLocalDateString(date);
}

/**
 * Obtiene el primer día del mes actual en formato YYYY-MM-DD
 */
export function getFirstDayOfMonth(): string {
  const date = new Date();
  date.setDate(1);
  return getLocalDateString(date);
}

