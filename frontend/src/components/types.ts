
export interface Person {
  id: number;
  first_name: string;
  last_name: string;
}


export type Task = {
  id: number
  sample_test_group_id: number | null
  type: string | null
  name: string
  description: string | null
  equipment: string | null
  base_time: number
  time_per_replicate: number | null
  scheduled_date: string | null  // ISO date
  person_id: number | null
  position: number | null
  project: string | null
  test_name: string | null
  method: string | null
}

export interface SampleTest {
  id: number
  test_key: number
  group_id: number | null
  sample_id: string | null
  test_name: string | null
  project: string | null
  due_date: string | null
  status: string | null
  client: string | null
  spec_sheet: string | null
  other_testing_documents: string | null
  pr_comp: boolean | null
  number_of: number | null
  method: string | null
  available_date: string | null
  actual_start_date: string | null
}

export interface Template {
  id: number
  name: string | null
  description: string | null
  testNamePatters: (string | null)[]
}

export interface TemplateTask {
  id: number
  template_id: number
  type: string | null
  name: string | null
  description: string | null
  equipment: string | null
  base_time: number | null
  time_per_replicate: number | null
}

export interface TemplateTestNameAlias {
  id: number
  template_id: number
  test_name_pattern: string
}

export interface TemplateDocumentPattern {
  id: number
  template_id: number
  document_pattern: string
}

export interface SampleTestGroup {
  id: number
  tasks: Task[]
  sample_tests: SampleTest[]
}