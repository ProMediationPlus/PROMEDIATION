import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTasksContext } from "@/contexts/TasksContext";
import { useIsMobile } from "@/hooks/use-mobile";
import { ListTodo, Clock, CheckCircle2, LayoutList } from "lucide-react";

interface TaskTabsProps {
  activeTab: string;
  setActiveTab: (value: string) => void;
}

export const TaskTabs = ({ activeTab, setActiveTab }: TaskTabsProps) => {
  const { tasks } = useTasksContext();
  const isMobile = useIsMobile();
  
  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className={`grid grid-cols-4 ${isMobile ? "w-full text-xs" : "w-full"}`}>
        <TabsTrigger value="all" className="flex items-center gap-1">
          <LayoutList className={`${isMobile ? "h-3 w-3" : "h-4 w-4"}`} />
          All ({tasks.length})
        </TabsTrigger>
        <TabsTrigger value="pending" className="flex items-center gap-1">
          <Clock className={`${isMobile ? "h-3 w-3" : "h-4 w-4"}`} />
          {isMobile ? "Pending" : "Pending"} ({tasks.filter(t => t.status === "Pending").length})
        </TabsTrigger>
        <TabsTrigger value="inProgress" className="flex items-center gap-1">
          <ListTodo className={`${isMobile ? "h-3 w-3" : "h-4 w-4"}`} />
          {isMobile ? "In Prog" : "In Progress"} ({tasks.filter(t => t.status === "In Progress").length})
        </TabsTrigger>
        <TabsTrigger value="completed" className="flex items-center gap-1">
          <CheckCircle2 className={`${isMobile ? "h-3 w-3" : "h-4 w-4"}`} />
          {isMobile ? "Done" : "Completed"} ({tasks.filter(t => t.status === "Completed").length})
        </TabsTrigger>
      </TabsList>
    </Tabs>
  );
};
