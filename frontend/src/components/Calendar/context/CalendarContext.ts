import { createContext } from "react";
import type { Person, SampleTest, Task } from "../../types";

export const CalendarContext = createContext({
  // ── Week data ────────────────────────────────────────────────────────────────
  // The 7 ISO date strings for the currently displayed week
  dates: [] as string[],

  // ── People & tasks ───────────────────────────────────────────────────────────
  // Full list of people from the backend
  people: [] as Person[],
  // Flat task list for the current week
  tasks: [] as Task[],
  // tasks indexed by [person_id][date] for fast cell lookup
  taskMap: {} as Record<number, Record<string, Task[]>>,

  // ── Day view selection ───────────────────────────────────────────────────────
  // The person and date currently open in the day view panel
  dayViewPerson: null as Person | null,
  dayViewDate: null as string | null,
  setDayViewPerson: (_: Person | null) => {},
  setDayViewDate: (_: string | null) => {},

  // Navigate the calendar to a specific person+date (switches week if needed)
  goToPersonDate: (_personId: number, _date: string) => {},

  // ── Task editing ─────────────────────────────────────────────────────────────
  onEditTask: (_: Task) => {},

  // ── Calendar person filter / sort ────────────────────────────────────────────
  // null means no filter (all people visible); a Set means only those IDs are shown
  personFilter: null as Set<number> | null,
  setPersonFilter: (_: React.SetStateAction<Set<number> | null>) => {},
  // null means default order; 'asc'/'desc' sorts by first name
  personSort: null as 'asc' | 'desc' | null,
  setPersonSort: (_: React.SetStateAction<'asc' | 'desc' | null>) => {},

  // ── Group highlight mode ─────────────────────────────────────────────────────
  // When set, task chips from this group are highlighted; all others are dimmed
  selectedGroupId: null as number | null,
  setSelectedGroupId: (_: React.SetStateAction<number | null>) => {},

  sampleTestsByGroup: new Map<number, SampleTest[]>,

})
