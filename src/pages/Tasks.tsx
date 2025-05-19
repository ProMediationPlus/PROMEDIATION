import { useState } from "react";
import { Layout } from "@/components/layout/layout";
import { TasksHeader } from "@/components/tasks/TasksHeader";
import { TasksSearch } from "@/components/tasks/TasksSearch";
import { TaskList } from "@/components/tasks/TaskList";
import { TasksProvider, useTasksContext } from "@/contexts/TasksContext";
import { useIsMobile } from "@/hooks/use-mobile";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { ListTodo, Clock, CheckCircle2, LayoutList } from "lucide-react";

const TasksContent = () => {
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const { tasks } = useTasksContext();
  const isMobile = useIsMobile();

  // Filter tasks based on active tab and search query
  const getFilteredTasks = () => {
    let filtered = [...tasks];
    
    // Filter by status based on active tab
    if (activeTab === "pending") {
      filtered = filtered.filter(task => task.status === "Pending");
    } else if (activeTab === "inProgress") {
      filtered = filtered.filter(task => task.status === "In Progress");
    } else if (activeTab === "completed") {
      filtered = filtered.filter(task => task.status === "Completed");
    }
    
    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(
        task => 
          task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          task.caseTitle.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    return filtered;
  };

  const filteredTasks = getFilteredTasks();
  const getTabTitle = () => {
    switch(activeTab) {
      case "pending": return "Pending";
      case "inProgress": return "In Progress";
      case "completed": return "Completed";
      default: return "All Tasks";
    }
  };

  return (
    <div className={`flex flex-col h-full ${isMobile ? "space-y-4" : "space-y-6"}`}>
      <TasksHeader />
      
      <Card className="h-[calc(100vh-200px)] flex flex-col overflow-hidden">
        <CardHeader className={`${isMobile ? "px-2 py-2" : "pb-0"}`}>
          <div className="flex justify-between items-center">
            <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className={`grid grid-cols-4 ${isMobile ? "w-full text-xs" : "w-[400px]"}`}>
                <TabsTrigger value="all" className="flex items-center gap-1">
                  <LayoutList className={`${isMobile ? "h-3 w-3" : "h-4 w-4"}`} />
                  All
                </TabsTrigger>
                <TabsTrigger value="pending" className="flex items-center gap-1">
                  <Clock className={`${isMobile ? "h-3 w-3" : "h-4 w-4"}`} />
                  Pending
                </TabsTrigger>
                <TabsTrigger value="inProgress" className="flex items-center gap-1">
                  <ListTodo className={`${isMobile ? "h-3 w-3" : "h-4 w-4"}`} />
                  {isMobile ? "In Prog" : "In Progress"}
                </TabsTrigger>
                <TabsTrigger value="completed" className="flex items-center gap-1">
                  <CheckCircle2 className={`${isMobile ? "h-3 w-3" : "h-4 w-4"}`} />
                  {isMobile ? "Done" : "Completed"}
                </TabsTrigger>
              </TabsList>
              
              <div className={`flex flex-col ${isMobile ? "gap-2" : "gap-0"} sm:flex-row sm:justify-between sm:items-center ${isMobile ? "mt-2 mb-1" : "mt-4 mb-2"}`}>
                <CardTitle className={isMobile ? "text-base" : ""}>{getTabTitle()}</CardTitle>
                <Input 
                  placeholder="Search tasks..." 
                  className={`${isMobile ? "text-sm h-8" : "max-w-xs"}`}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              
              <TabsContent value="all" className="m-0 overflow-hidden">
                <CardContent className="flex-1 overflow-y-auto overflow-x-hidden p-0">
                  <TaskList filteredTasks={filteredTasks} />
                </CardContent>
              </TabsContent>
              
              <TabsContent value="pending" className="m-0 overflow-hidden">
                <CardContent className="flex-1 overflow-y-auto overflow-x-hidden p-0">
                  <TaskList filteredTasks={filteredTasks} />
                </CardContent>
              </TabsContent>
              
              <TabsContent value="inProgress" className="m-0 overflow-hidden">
                <CardContent className="flex-1 overflow-y-auto overflow-x-hidden p-0">
                  <TaskList filteredTasks={filteredTasks} />
                </CardContent>
              </TabsContent>
              
              <TabsContent value="completed" className="m-0 overflow-hidden">
                <CardContent className="flex-1 overflow-y-auto overflow-x-hidden p-0">
                  <TaskList filteredTasks={filteredTasks} />
                </CardContent>
              </TabsContent>
            </Tabs>
          </div>
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
