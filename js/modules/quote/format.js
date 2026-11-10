// FEITURA · formatação e máscaras de entrada.
// Funções puras: recebem valores, devolvem texto ou número. Nenhuma toca o DOM.

const LOCALE = "pt-BR";
const MONEY_MAX = 9999.99;
const INTEGER_MAX = 9999;
const TIME_MAX_SECONDS = 9999 * 60 + 99;

const digitsOf = (value, limit) => String(value ?? "").replace(/\D/g, "").slice(0, limit);

export const esc = value =>
  String(value ?? "").replace(/[&<>"']/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[char]));

export const upper = value => String(value ?? "").toLocaleUpperCase(LOCALE);

export const number = value =>
  new Intl.NumberFormat(LOCALE, { maximumFractionDigits: 2 }).format(Number(value) || 0);

// ---------- dinheiro ----------

/** Arredonda para cima no centavo. Nunca devolve -0. */
export const ceilMoney = value => {
  const n = Math.max(0, Number(value) || 0);
  return Math.max(0, Math.ceil((n - 1e-9) * 100) / 100);
};

export const money = value =>
  new Intl.NumberFormat(LOCALE, { style: "currency", currency: "BRL" }).format(Number(value) || 0);

/** "1.234,56" → máscara por dígitos: 4 → 0,04 → 0,45 → 4,50 */
export const parseMoneyInput = value => {
  const digits = digitsOf(value, 6);
  return digits ? Math.min(MONEY_MAX, Number(digits) / 100) : 0;
};

export const formatMoneyInput = value =>
  ceilMoney(value).toLocaleString(LOCALE, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

// ---------- tempo (MIN:SEG) ----------

/** Dígitos → minutos decimais. "530" → 5:30 → 5,5 min */
export const parseTimeInput = value => {
  const digits = digitsOf(value, 6);
  if (!digits) return 0;
  const padded = digits.padStart(3, "0");
  const seconds = Number(padded.slice(-2));
  const minutes = Number(padded.slice(0, -2));
  return Math.min(TIME_MAX_SECONDS, minutes * 60 + seconds) / 60;
};

/** Máscara durante a digitação: preserva os segundos como digitados. */
export const maskTimeInput = value => {
  const digits = digitsOf(value, 6);
  if (!digits) return "0:00";
  const padded = digits.padStart(3, "0");
  return `${Number(padded.slice(0, -2)).toLocaleString(LOCALE)}:${padded.slice(-2)}`;
};

/** Minutos decimais → "M:SS" */
export const minSec = minutes => {
  const total = Math.max(0, Math.round((Number(minutes) || 0) * 60));
  return `${Math.floor(total / 60).toLocaleString(LOCALE)}:${String(total % 60).padStart(2, "0")}`;
};

/** Segundos → "H:MM:SS" */
export const duration = totalSeconds => {
  const s = Math.max(0, Math.round(Number(totalSeconds) || 0));
  const pad = n => String(n).padStart(2, "0");
  return `${Math.floor(s / 3600)}:${pad(Math.floor((s % 3600) / 60))}:${pad(s % 60)}`;
};

// ---------- inteiros ----------

export const parseIntegerInput = value => {
  const digits = digitsOf(value, 4);
  return Math.min(INTEGER_MAX, digits ? Number(digits) : 0);
};

// ---------- datas ----------

export const localDateTime = date =>
  new Intl.DateTimeFormat(LOCALE, { dateStyle: "short", timeStyle: "medium" }).format(date);

// ---------- máscaras por tipo de campo ----------
// parse: texto digitado → valor do estado
// mask:  texto digitado → texto exibido durante a digitação
// show:  valor do estado → texto exibido

export const MASKS = {
  money:   { parse: v => ceilMoney(parseMoneyInput(v)), mask: v => formatMoneyInput(parseMoneyInput(v)), show: formatMoneyInput },
  time:    { parse: parseTimeInput, mask: maskTimeInput, show: minSec },
  integer: { parse: parseIntegerInput, mask: v => String(parseIntegerInput(v)), show: v => String(parseIntegerInput(v)) },
  text:    { parse: v => v, mask: v => v, show: v => String(v ?? "") }
};
