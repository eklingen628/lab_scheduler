import { createContext } from "react";
import type { Person, Task } from "../types";

export const CalendarContext = createContext({
  setPerson: (_: Person | null) => {},
  setCurrentDate: (_: string | null) => {},
  onEditTask: (_: Task) => {},
  people: [] as Person[],
  goToPersonDate: (_personId: number, _date: string) => {},
  personFilter: null as Set<number> | null,
  setPersonFilter: (_: React.SetStateAction<Set<number> | null>) => {},
  personSort: null as 'asc' | 'desc' | null,
  setPersonSort: (_: React.SetStateAction<'asc' | 'desc' | null>) => {},
})
