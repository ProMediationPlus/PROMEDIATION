
import { createContext, useContext, useState, ReactNode } from "react";
import { toast } from "sonner";

export interface Task {
  id: number;
  title: string;
  caseTitle: string;
  status: string;
  priority: string;
  dueDate: string;
  assignedTo: string;
  description: string;
}

export interface TaskFormValues {
  id: number;
  title: string;
  caseTitle: string;
  status: string;
  priority: string;
  dueDate: Date | string;
  assignedTo: string;
  description: string;
}

interface TasksContextType {
  tasks: Task[];
  selectedTasks: number[];
  toggleTaskCompletion: (id: number) => void;
  toggleSelectTask: (id: number) => void;
  handleSaveTask: (updatedTask: TaskFormValues) => void;
  handleDeleteTask: (id: number) => void;
  handleBulkDelete: () => void;
  handleShareTask: (id: number) => void;
  handleDownloadTask: (id: number) => void;
}

const TasksContext = createContext<TasksContextType | undefined>(undefined);

// Initial mock data for tasks
const initialTasks = [
  {
    id: 1,
    title: "Review settlement agreement",
    caseTitle: "Smith vs. Johnson",
    status: "In Progress",
    priority: "High",
    dueDate: "2023-06-20",
    assignedTo: "Mediator",
    description: "Review the draft settlement agreement and provide feedback",
  },
  {
    id: 2,
    title: "Schedule follow-up meeting",
    caseTitle: "Smith vs. Johnson",
    status: "Pending",
    priority: "Medium",
    dueDate: "2023-06-18",
    assignedTo: "Mediator",
    description: "Set up a follow-up meeting with all parties",
  },
  {
    id: 3,
    title: "Request additional financial documents",
    caseTitle: "Smith vs. Johnson",
    status: "Completed",
    priority: "Medium",
    dueDate: "2023-06-05",
    assignedTo: "Mediator",
    description: "Contact client for additional financial statements",
  },
  {
    id: 4,
    title: "Review historical survey records",
    caseTitle: "Property Dispute Resolution",
    status: "In Progress",
    priority: "Medium",
    dueDate: "2023-06-22",
    assignedTo: "Mediator",
    description: "Analyze historical property surveys",
  },
  {
    id: 5,
    title: "Draft boundary agreement",
    caseTitle: "Property Dispute Resolution",
    status: "Pending",
    priority: "High",
    dueDate: "2023-06-25",
    assignedTo: "Mediator",
    description: "Prepare initial draft of boundary agreement",
  },
  {
    id: 6,
    title: "Request employee performance records",
    caseTitle: "Brown Employment Dispute",
    status: "Pending",
    priority: "Medium",
    dueDate: "2023-06-18",
    assignedTo: "Mediator",
    description: "Obtain employee performance records from HR",
  },
  {
    id: 7,
    title: "Schedule initial meeting",
    caseTitle: "Brown Employment Dispute",
    status: "Completed",
    priority: "High",
    dueDate: "2023-06-10",
    assignedTo: "Mediator",
    description: "Set up initial consultation with both parties",
  },
  {
    id: 8,
    title: "Review company policies",
    caseTitle: "Brown Employment Dispute",
    status: "In Progress",
    priority: "Low",
    dueDate: "2023-06-15",
    assignedTo: "Mediator",
    description: "Review company policies relevant to the dispute",
  },
  {
    id: 9,
    title: "Draft agenda for first session",
    caseTitle: "Brown Employment Dispute",
    status: "In Progress",
    priority: "Medium",
    dueDate: "2023-06-12",
    assignedTo: "Mediator",
    description: "Create detailed agenda for first mediation session",
  },
  {
    id: 10,
    title: "Contact third party witnesses",
    caseTitle: "Brown Employment Dispute",
    status: "Pending",
    priority: "Low",
    dueDate: "2023-06-20",
    assignedTo: "Mediator",
    description: "Reach out to potential witnesses",
  },
];

export function TasksProvider({ children }: { children: ReactNode }) {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [selectedTasks, setSelectedTasks] = useState<number[]>([]);

  // Toggle task completion
  const toggleTaskCompletion = (id: number) => {
    setTasks(prev => 
      prev.map(task => {
        if (task.id === id) {
          const newStatus = task.status === "Completed" ? "Pending" : "Completed";
          toast.success(`Task ${newStatus.toLowerCase()}: ${task.title}`);
          return {
            ...task,
            status: newStatus
          };
        }
        return task;
      })
    );
  };

  // Toggle task selection
  const toggleSelectTask = (id: number) => {
    setSelectedTasks(prev => 
      prev.includes(id) 
        ? prev.filter(taskId => taskId !== id) 
        : [...prev, id]
    );
  };

  // Handle saving edited task
  const handleSaveTask = (updatedTask: TaskFormValues) => {
    setTasks(prev => 
      prev.map(task => 
        task.id === updatedTask.id 
          ? { 
              ...task,
              title: updatedTask.title,
              caseTitle: updatedTask.caseTitle,
              status: updatedTask.status,
              priority: updatedTask.priority,
              dueDate: updatedTask.dueDate instanceof Date 
                ? updatedTask.dueDate.toISOString().split('T')[0] 
                : updatedTask.dueDate,
              assignedTo: updatedTask.assignedTo,
              description: updatedTask.description
            } 
          : task
      )
    );
  };

  // Handle deleting task
  const handleDeleteTask = (id: number) => {
    setTasks(prev => prev.filter(task => task.id !== id));
    setSelectedTasks(prev => prev.filter(taskId => taskId !== id));
    toast.success("Task deleted successfully");
  };

  // Handle bulk delete
  const handleBulkDelete = () => {
    setTasks(prev => prev.filter(task => !selectedTasks.includes(task.id)));
    toast.success(`${selectedTasks.length} tasks deleted`);
    setSelectedTasks([]);
  };

  // Handle sharing task
  const handleShareTask = (id: number) => {
    const task = tasks.find(t => t.id === id);
    if (task) {
      toast.success(`Shared task: ${task.title}`);
    }
  };

  // Handle downloading task
  const handleDownloadTask = (id: number) => {
    const task = tasks.find(t => t.id === id);
    if (task) {
      // In a real app, would create a file for download
      const taskData = JSON.stringify(task, null, 2);
      const blob = new Blob([taskData], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = `${task.title.replace(/\s+/g, '_')}_task.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast.success(`Downloaded task: ${task.title}`);
    }
  };

  return (
    <TasksContext.Provider
      value={{
        tasks,
        selectedTasks,
        toggleTaskCompletion,
        toggleSelectTask,
        handleSaveTask,
        handleDeleteTask,
        handleBulkDelete,
        handleShareTask,
        handleDownloadTask
      }}
    >
      {children}
    </TasksContext.Provider>
  );
}

export const useTasksContext = () => {
  const context = useContext(TasksContext);
  if (context === undefined) {
    throw new Error("useTasksContext must be used within a TasksProvider");
  }
  return context;
};
