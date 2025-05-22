import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { CalendarIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useTasksContext } from "@/contexts/TasksContext"; // Removed Task import as it's not directly used for uniqueMatters
import { Matter } from "@/types/models"; // Import Matter type

const formSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  caseId: z.string().nonempty("Case selection is required"), // Changed from caseTitle
  priority: z.string().min(1, "Priority is required"),
  dueDate: z.date({
    required_error: "Due date is required",
  }),
  status: z.string().default("Pending"),
  assignedTo: z.string().default("Mediator"),
  description: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export function CreateTaskDialog() {
  const [open, setOpen] = useState(false);
  const { tasks, handleSaveTask } = useTasksContext();
  
  // Derive unique matters from tasks for the dropdown
  // In a real application, this would likely come from a dedicated MattersContext or service
  const uniqueMatters: Pick<Matter, 'id' | 'caseFileNumber' | 'title'>[] = Array.from(
    new Map(
      tasks.map(task => [
        task.caseId, 
        { id: task.caseId, caseFileNumber: task.caseFileNumber, title: task.caseTitle }
      ])
    ).values()
  );

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      caseId: "", // Changed from caseTitle
      priority: "Medium",
      status: "Pending",
      assignedTo: "Mediator",
      description: "",
    },
  });

  function onSubmit(values: FormValues) {
    // Find the next available ID.
    // Ensure correct parsing if IDs can be numeric strings.
    const numericTaskIds = tasks.map(task => typeof task.id === 'number' ? task.id : parseInt(task.id as string, 10)).filter(id => !isNaN(id));
    const nextId = numericTaskIds.length > 0 ? Math.max(0, ...numericTaskIds) + 1 : 1;
    
    const selectedMatter = uniqueMatters.find(m => m.id === values.caseId);

    if (!selectedMatter) {
      toast.error("Selected case not found. Please try again.");
      return;
    }

    const newTask = {
      id: nextId.toString(), // Ensure ID is a string if TasksContext expects string from models.ts
      title: values.title,
      caseId: selectedMatter.id,
      caseFileNumber: selectedMatter.caseFileNumber,
      caseTitle: selectedMatter.title, // This is the case title from the selected matter
      priority: values.priority as "Low" | "Medium" | "High", // Cast to match TaskFormValues
      status: values.status as 'Todo' | 'In Progress' | 'Done' | 'Blocked', // Cast to match Task model
      dueDate: values.dueDate, // Keep as Date object
      assignedTo: values.assignedTo,
      description: values.description || "",
      createdAt: new Date(), // Add createdAt
      updatedAt: new Date(), // Add updatedAt
    };
    
    // Call the task save function from context
    // Ensure the structure matches what handleSaveTask expects (TaskFormValues)
    handleSaveTask({
      ...newTask,
      dueDate: values.dueDate.toISOString(), // Convert Date to string for TaskFormValues
    });
    
    // Show success toast
    toast.success("Task created successfully");
    
    // Reset form and close dialog
    form.reset();
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <span className="mr-2">+</span>
          Create Task
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New Task</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Task Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter task title" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="caseId" // Changed from caseTitle to caseId
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Related Case</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select related case" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {uniqueMatters.map((matter) => (
                        <SelectItem key={matter.id} value={matter.id}>
                          {matter.caseFileNumber} - {matter.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="priority"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Priority</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select priority" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Low">Low</SelectItem>
                      <SelectItem value="Medium">Medium</SelectItem>
                      <SelectItem value="High">High</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="dueDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Due Date</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(field.value, "PPP")
                          ) : (
                            <span>Pick a date</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <DialogFooter>
              <Button type="submit">Create Task</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
