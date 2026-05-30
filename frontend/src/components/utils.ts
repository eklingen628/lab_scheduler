import type { SampleTest } from "./types";


export function uniqueField(tests: SampleTest[], field: keyof SampleTest): string[] {
  return [...new Set(tests.map(st => st[field]).filter((v): v is string => v !== null))];
}


export function localDateStr(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function getMonday(d: Date): Date {
  const day = d.getDay();
  const monday = new Date(d);
  monday.setDate(d.getDate() - (day === 0 ? 6 : day - 1));
  return monday
}

export function getWeekDates(monday: Date, offset = 0): string[] {
  const start = new Date(monday)
  start.setDate(start.getDate() + offset * 7);
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    return localDateStr(d);
  });
}