export function formatDate(value) {
  if (!value) return '—';
  const [y, m, d] = String(value).slice(0, 10).split('-');
  if (!y || !m || !d) return String(value);
  return `${d}/${m}/${y}`;
}

export function formatDateTime(value) {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

export const formatNumber = (n) => (n === null || n === undefined || n === '' ? '—' : Number(n).toLocaleString('pt-BR'));

const localIso = (date) => new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString();
export const todayInput = () => localIso(new Date()).slice(0, 10); // valor para <input type="date">
export const nowInput = () => localIso(new Date()).slice(0, 16); // valor para <input type="datetime-local">

export function toInputDateTime(value) {
  const d = value ? new Date(value) : new Date();
  return Number.isNaN(d.getTime()) ? nowInput() : localIso(d).slice(0, 16);
}

export const toInputDate = (value) => (value ? String(value).slice(0, 10) : '');
export const firstLetter = (text, fallback = 'T') => (String(text || '').trim()[0] || fallback).toUpperCase();
