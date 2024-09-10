export function convertDateToISODateFormat(
  dateStr: string | undefined,
): string | null {
  if (!dateStr) return null;
  try {
    return new Date(dateStr).toISOString().split('T')[0];
  } catch {
    return null;
  }
}

export function convertStringToFloat(str: string | undefined): number | null {
  if (!str?.trim()) return null;
  const num = +str;
  return Number.isNaN(num) ? null : num;
}

export function convertStringToInteger(str: string | undefined): number | null {
  const num = convertStringToFloat(str);
  return num == null ? null : Math.floor(num);
}
