import type { Person, Task } from './types';
import TaskChip from './TaskChip';

interface Props {
  person: Person;
  date: string;
  tasks: Task[];
}

export default function CalendarCell({ tasks }: Props) {
  return (
    <div className="calendar-cell">
      {tasks.map(task => (
        <TaskChip key={task.id} task={task} />
      ))}
    </div>
  );
}
