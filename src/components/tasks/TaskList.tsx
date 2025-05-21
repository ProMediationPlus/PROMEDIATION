import { CreateTaskDialog } from "@/components/dialogs/create-task-dialog";
import { TaskItem } from "./TaskItem";
import { useTasksContext, Task } from "@/contexts/TasksContext";
import { useIsMobile } from "@/hooks/use-mobile";

interface TaskListProps {
  filteredTasks: Task[];
  showCreateButton?: boolean;
  caseFilter?: string; // MIGRATION: renamed from 'matterFilter' to 'caseFilter'
}

export const TaskList = ({ filteredTasks, showCreateButton = true, caseFilter }: TaskListProps) { // MIGRATION: renamed from 'matterFilter' to 'caseFilter'
  const isMobile = useIsMobile();
  
  const displayTasks = caseFilter // MIGRATION: renamed from 'matterFilter' to 'caseFilter' 
    ? filteredTasks.filter(task => task.caseTitle.toLowerCase().includes(caseFilter.toLowerCase())) // MIGRATION: renamed from 'matterFilter' to 'caseFilter'
    : filteredTasks;

  return (
    <div className="divide-y">
      {displayTasks.length > 0 ? (
        displayTasks.map((task) => (
          <TaskItem key={task.id} task={task} />
        ))
      ) : (
        <div className={`${isMobile ? "p-4 text-sm" : "p-6"} text-center text-muted-foreground`}>
          <p>No tasks found matching your criteria.</p>
          {showCreateButton && <CreateTaskDialog />}
        </div>
      )}
    </div>
  );
};
