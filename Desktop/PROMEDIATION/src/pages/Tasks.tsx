import { useState } from "react";
import { Layout } from "@/components/layout/layout";
import { TasksHeader } from "@/components/tasks/TasksHeader";
import { TasksSearch } from "@/components/tasks/TasksSearch";
import { TaskList } from "@/components/tasks/TaskList";
import { TasksProvider, useTasksContext, Task } from "@/contexts/TasksContext";
import { useIsMobile } from "@/hooks/use-mobile";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { ListTodo, Clock, CheckCircle2, LayoutList } from "lucide-react";
import { TaskTabs } from "@/components/tasks/TaskTabs";

const TasksContent = () => {
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const { tasks } = useTasksContext();
  const isMobile = useIsMobile();

  const getFilteredTasks = (): Task[] => {
    let tasksToDisplay = tasks;
    if (searchQuery) {
      tasksToDisplay = tasksToDisplay.filter(task => 
        task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.caseTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.caseFileNumber.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (activeTab === "all") {
      return tasksToDisplay;
    }
    return tasksToDisplay.filter(task => {
      if (activeTab === "inProgress") return task.status === "In Progress";
      if (activeTab === "done") return task.status === "Done";
      return true; // Should not happen with current tabs
    });
  };

  const filteredTasks = getFilteredTasks();

  const getTabTitle = (tab: string) => {
    switch(tab) {
      case "inProgress": return "In Progress Tasks";
      case "done": return "Done Tasks";
      default: return "All Tasks";
    }
  };

  return (
    <div className={`flex flex-col h-full ${isMobile ? "space-y-4" : "space-y-6"}`}>
      <TasksHeader />
      
      <Card className="h-[calc(100vh-200px)] flex flex-col overflow-hidden">
        <CardHeader className={`${isMobile ? "px-2 py-2" : "pb-0"}`}>
          {/* Replace existing Tabs with TaskTabs component - Note: TaskTabs itself uses Tabs from shadcn */}
          <TaskTabs activeTab={activeTab} setActiveTab={setActiveTab} />
              
          <div className={`flex flex-col ${isMobile ? "gap-2" : "gap-0"} sm:flex-row sm:justify-between sm:items-center ${isMobile ? "mt-2 mb-1" : "mt-4 mb-2"}`}>
            <CardTitle className={isMobile ? "text-base" : ""}>{getTabTitle(activeTab)}</CardTitle>
            <Input 
              placeholder="Search tasks..." 
              className={`${isMobile ? "text-sm h-8" : "max-w-xs"}`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          {/* Render TaskList directly based on filteredTasks, TabsContent managed by TaskTabs logic if needed or simplify here */}
          <CardContent className="flex-1 overflow-y-auto overflow-x-hidden p-0 mt-4">
            <TaskList filteredTasks={filteredTasks} />
          </CardContent>
        </CardHeader>
      </Card>
    </div>
  );
};

const TasksPage = () => {
  return (
    <Layout>
      <TasksProvider>
        <TasksContent />
      </TasksProvider>
    </Layout>
  );
};

export default TasksPage;
