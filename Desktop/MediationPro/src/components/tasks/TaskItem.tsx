import { CheckSquare, Briefcase, Calendar, Share2, Download, Trash } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { EditTaskDialog } from "@/components/dialogs/edit-task-dialog";
import { useTasksContext, Task } from "@/contexts/TasksContext";
import { useIsMobile } from "@/hooks/use-mobile";

interface TaskItemProps {
  task: Task;
}

export const TaskItem = ({ task }: TaskItemProps) => {
  const { 
    selectedTasks, 
    toggleSelectTask, 
    toggleTaskCompletion, 
    handleDeleteTask, 
    handleShareTask, 
    handleDownloadTask,
    handleSaveTask 
  } = useTasksContext();
  const isMobile = useIsMobile();

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: isMobile ? 'numeric' : 'short',
      day: 'numeric',
      year: isMobile ? '2-digit' : 'numeric',
    });
  };

  // Get priority color
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "High":
        return "text-red-500";
      case "Medium":
        return "text-amber-500";
      case "Low":
        return "text-green-500";
      default:
        return "text-gray-500";
    }
  };

  return (
    <div 
      className={`flex flex-col ${isMobile ? "p-2" : "p-4"} hover:bg-muted/50 transition-colors`}
    >
      {/* Top row: checkbox, task title, and action buttons */}
      <div className="flex justify-between">
        <div className="flex items-start">
          <Checkbox 
            checked={selectedTasks.includes(task.id)}
            onCheckedChange={() => toggleSelectTask(task.id)}
            className="mr-2 mt-1"
          />
          <div className="flex items-start">
            <button
              onClick={() => toggleTaskCompletion(task.id)}
              className="flex-shrink-0"
            >
              <CheckSquare 
                className={`${isMobile ? "h-4 w-4" : "h-5 w-5"} mt-0.5 ${
                  task.status === "Completed" ? "text-green-500" : "text-gray-400"
                }`} 
              />
            </button>
            <div className="ml-3">
              <p className={`${isMobile ? "text-xs" : "text-sm"} font-medium ${
                task.status === "Completed" ? "line-through text-muted-foreground" : ""
              }`}>
                {task.title}
              </p>
            </div>
          </div>
        </div>

        {/* Action buttons */}
        {isMobile ? (
          <div className="flex items-center space-x-0">
            <Button 
              variant="ghost" 
              size="sm"
              className="h-6 w-6"
              onClick={() => handleShareTask(task.id)}
              title="Share Task"
            >
              <Share2 className="h-3 w-3" />
            </Button>
            <EditTaskDialog 
              task={task}
              onSave={(updatedTask) => handleSaveTask({
                id: task.id,
                title: updatedTask.title || "",
                caseTitle: updatedTask.caseTitle || "",
                priority: updatedTask.priority || "",
                status: updatedTask.status || "",
                dueDate: updatedTask.dueDate || new Date(),
                assignedTo: updatedTask.assignedTo || "",
                description: updatedTask.description || ""
              })}
            />
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="ghost" size="sm" className="h-6 w-6">
                  <Trash className="h-3 w-3" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will permanently delete the task "{task.title}".
                    This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction 
                    onClick={() => handleDeleteTask(task.id)}
                  >
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        ) : (
          <div className="flex items-center space-x-1">
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => handleShareTask(task.id)}
              title="Share Task"
            >
              <Share2 className="h-4 w-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => handleDownloadTask(task.id)}
              title="Download Task"
            >
              <Download className="h-4 w-4" />
            </Button>
            <EditTaskDialog 
              task={task}
              onSave={(updatedTask) => handleSaveTask({
                id: task.id,
                title: updatedTask.title || "",
                caseTitle: updatedTask.caseTitle || "",
                priority: updatedTask.priority || "",
                status: updatedTask.status || "",
                dueDate: updatedTask.dueDate || new Date(),
                assignedTo: updatedTask.assignedTo || "",
                description: updatedTask.description || ""
              })}
            />
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Trash className="h-4 w-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will permanently delete the task "{task.title}".
                    This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction 
                    onClick={() => handleDeleteTask(task.id)}
                  >
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        )}
      </div>

      {/* Metadata row: all information stacked together under the task title */}
      <div className="ml-11 mt-1">
        <div className="flex flex-wrap items-center text-xs text-muted-foreground">
          <div className="flex items-center mr-3">
            <Calendar className={isMobile ? "h-2.5 w-2.5 mr-0.5" : "h-3 w-3 mr-1"} />
            <span className={isMobile ? "text-[0.65rem]" : "text-xs"}>Due: {formatDate(task.dueDate)}</span>
          </div>
          
          <div className="flex items-center mr-3">
            <span className="mr-1">•</span>
            <span className={`${
              task.status === "Completed" 
                ? "text-green-500" 
                : task.status === "In Progress" 
                ? "text-blue-500" 
                : "text-amber-500"
            } ${isMobile ? "text-[0.65rem]" : "text-xs"}`}>
              {task.status}
            </span>
          </div>
          
          <div className="flex items-center mr-3">
            <span className="mr-1">•</span>
            <Briefcase className={`${isMobile ? "h-2.5 w-2.5 mr-0.5" : "h-3 w-3 mr-1"}`} />
            <span className={isMobile ? "text-[0.65rem]" : "text-xs"}>{task.caseTitle}</span>
          </div>
          
          <div className="flex items-center">
            <span className="mr-1">•</span>
            <span className={`${getPriorityColor(task.priority)} ${isMobile ? "text-[0.65rem]" : "text-xs"}`}>
              {task.priority} Priority
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
