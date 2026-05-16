import { createContext } from "react";
import type { Person, Task } from "../types";

export const CalendarContext = createContext({
  setPerson: (_: Person | null) => {},
  setCurrentDate: (_: string | null) => {},
  onEditTask: (_: Task) => {},
  people: [] as Person[],
  goToPersonDate: (_personId: number, _date: string) => {},

})

