function parseNumber(variable: string | undefined) {
  if (variable === undefined) return false;
  return parseInt(variable);
}

function intParse(str: string, def: number) {
  const parsed = parseInt(str, 10);
  return Number.isNaN(parsed) ? def : parsed;
}

export const util = {
  parseNumber,
  intParse,
}