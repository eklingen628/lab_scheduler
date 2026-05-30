import { createContext } from 'react';
import type { Person, SampleTest } from '../../types';

export const TaskEditContext = createContext({
  people: [] as Person[],
  sampleTestsByGroup: new Map<number, SampleTest[]>(),
});
