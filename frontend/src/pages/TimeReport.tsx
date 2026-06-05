import { useEffect, useState } from 'react';

import '../components/Templates/Templates.css';
import { get } from '@/api';
import type { Person, Task } from '@/components/types';
import Select from 'react-select'
import { getMonday, getWeekDates } from '@/components/utils';



export default function TimeReport() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [people, setPeople] = useState<Person[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [weekDates, setWeekDates] = useState<string[] | null>(null)
  const [selectedPerson, setSelectedPerson] = useState<Person | null>(null)

  const options = people.map(p => {
    return {value: p.id,
      label: `${p.first_name} ${p.last_name}`,
    }
  })


  useEffect(() => {
    setLoading(true);
    setError(false);
    async function fetchData() {
      try {
        const [tasksData, peopleData] = await Promise.all([get('/tasks'), get('/people')])
        setTasks(tasksData);
        setPeople(peopleData);
        
      } catch {
        setError(true);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []); 

    function setWD(date: Date) {
      const monday = getMonday(date)
      const wd = getWeekDates(monday)
      setWeekDates(wd)
      
    }



    const rows = new Map<string, Map<string, number>>();

    if (selectedPerson && weekDates) {
      tasks
        .filter(t => t.person_id === selectedPerson.id && weekDates.includes(t.scheduled_date ?? ''))
        .forEach(t => {
          const proj = t.project ?? 'Unknown';
          if (!rows.has(proj)) rows.set(proj, new Map());
          const dateMap = rows.get(proj)!;
          dateMap.set(t.scheduled_date!, (dateMap.get(t.scheduled_date!) ?? 0) + t.base_time);
        });
    }

  


  return (
    <div className="tr-page">
      <h2 className="tr-form-title">Time Report</h2>
      {error && <span>Error Loading Data</span>}
      {loading && <span>Loading</span>}

      <p>Choose a person and date to display current time reporting</p>
      <Select options={options} onChange={e => setSelectedPerson(people.find(p => p.id === e?.value) ?? null)} />

      <p>Choose a date in the week to generate the report</p>

      <input type="date" onChange={e => setWD(new Date(e.target.value + 'T00:00:00'))} />




      {weekDates && selectedPerson &&
      
        <table> 
          <thead>
            <tr>
              <th>Project</th>
              {weekDates.map(d => <th scope="col" key={d}>{d}</th>)}
            </tr>
          </thead>
          <tbody>
            {[...rows.entries()].map(([proj, dateMap]) => (
              <tr key={proj}>
                <th scope="row">{proj}</th>
                {weekDates.map(d => <td key={d}>{dateMap.get(d) ?? 0}</td>)}
              </tr>
            ))}
          </tbody>
        </table>
      
      
      
      
      
      
      }







    </div>
  );
}
