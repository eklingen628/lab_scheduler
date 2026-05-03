export interface Task {
  id: number;
  name: string;
  base_time: number;
  scheduled_date: string;
  person_id: number;
  position?: number | null;
}

export interface Person {
  id: number;
  first_name: string;
  last_name: string;
}
