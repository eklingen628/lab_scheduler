
export interface Person {
  id: number;
  first_name: string;
  last_name: string;
}


export type Task = {
  id: number
  sample_test_group_id: number
  type: string | null
  name: string
  description: string | null
  equipment: string | null
  base_time: number
  time_per_replicate: number | null
  min_step: number | null
  max_step: number | null
  scheduled_date: string | null  // ISO date
  person_id: number | null
  position: number | null
}

export interface SampleTest {
  id: number
  sample_id: string | null
  test_name: string | null
  project: string | null
  status: string | null
}

export interface SampleTestGroup {
  id: number
  tasks: Task[]
  sample_tests: SampleTest[]
}