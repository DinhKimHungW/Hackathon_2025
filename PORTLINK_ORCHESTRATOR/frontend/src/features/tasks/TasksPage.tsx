import { useNavigate } from 'react-router-dom';
import { TaskList } from './TaskList';
import type { Task } from './tasksSlice';

/**
 * Tasks Page Component
 * 
 * Wrapper for TaskList with navigation logic
 */
export default function TasksPage() {
  const navigate = useNavigate();

  const handleEditTask = (task: Task) => {
    // TODO: Navigate to edit page when implemented
    console.log('Edit task:', task.id);
    // navigate(`/tasks/${task.id}/edit`);
  };

  const handleViewTask = (task: Task) => {
    // TODO: Open detail modal
    console.log('View task:', task.id);
  };

  const handleAssignTask = (task: Task) => {
    // TODO: Implement assign task action
    console.log('Assign task:', task.id);
  };

  return (
    <TaskList
      onEditTask={handleEditTask}
      onViewTask={handleViewTask}
      onAssignTask={handleAssignTask}
    />
  );
}
