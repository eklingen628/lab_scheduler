import type { SampleTest } from "./types";


export function uniqueField(tests: SampleTest[], field: keyof SampleTest): string[] {
  return [...new Set(tests.map(st => st[field]).filter((v): v is string => v !== null))];
}
