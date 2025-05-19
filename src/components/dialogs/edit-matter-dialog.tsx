
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Pencil } from "lucide-react";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// Define Matter interface consistent with other components
// Ideally, move this to a shared types file (e.g., src/types/matter.ts)
interface Matter {
  id: string;
  title: string;
  type: string;
  status: string;
  lastUpdated: string;
  clientName: string;
  description?: string; // Make optional consistent with schema
  caseFileNumber: string;
  caseFileName: string;
  // Add other fields from the shared definition if needed by the form
  participants?: string[];
  documents?: any[];
  tasks?: any[];
  meetingNotes?: any[];
  nextSession?: any | null;
  intakeForm?: any;
}

// Update schema to use string ID and match Matter interface fields
const formSchema = z.object({
  id: z.string(), // Changed to string
  title: z.string().min(2, "Matter title is required"),
  type: z.string().min(1, "Matter type is required"),
  status: z.string().min(1, "Status is required"),
  clientName: z.string().min(2, "Client name is required"),
  description: z.string().optional(),
  lastUpdated: z.string(), // Keep lastUpdated from the Matter object
  caseFileNumber: z.string().min(1, "Case file number is required"),
  caseFileName: z.string().min(1, "Case file name is required"),
  // Do not include fields not edited directly in this form (like intakeForm, participants etc.)
  // unless the dialog is intended to edit them too.
});

export type MatterFormValues = z.infer<typeof formSchema>;

// Props now use the consistent Matter interface
interface EditMatterDialogProps {
  matter: Matter; // Expect the full Matter object
  onSave: (matter: Matter) => void; // Pass back the full Matter object
}
export function EditMatterDialog({ matter: initialMatterData, onSave }: EditMatterDialogProps) {
  const [open, setOpen] = useState(false);

  
  // Initialize form with values from the passed Matter prop
  // Ensure only fields defined in formSchema are passed as defaultValues
  const form = useForm<MatterFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      id: initialMatterData.id,
      title: initialMatterData.title,
      type: initialMatterData.type,
      status: initialMatterData.status,
      clientName: initialMatterData.clientName,
      description: initialMatterData.description || "", // Handle optional description
      lastUpdated: initialMatterData.lastUpdated,
      caseFileNumber: initialMatterData.caseFileNumber,
      caseFileName: initialMatterData.caseFileName,
    },
  });

  function onSubmit(formValues: MatterFormValues) {
    // Merge form values with the original matter data to preserve fields not in the form
    const updatedMatter: Matter = {
      ...initialMatterData, // Start with original data
      ...formValues,       // Overwrite with form values
      lastUpdated: new Date().toISOString() // Update timestamp (use full ISO string)
    };

    // Save the complete updated matter object
    onSave(updatedMatter);

    // Show success toast
    toast.success("Matter updated successfully");
    
    // Close dialog
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon">
          <Pencil className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Matter</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Matter Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Smith vs. Johnson" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Matter Type</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select matter type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Divorce Mediation">Divorce Mediation</SelectItem>
                      <SelectItem value="Property Dispute">Property Dispute</SelectItem>
                      <SelectItem value="Employment">Employment</SelectItem>
                      <SelectItem value="Family Dispute">Family Dispute</SelectItem>
                      <SelectItem value="Contract">Contract</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Active">Active</SelectItem>
                      <SelectItem value="Pending">Pending</SelectItem>
                      <SelectItem value="Closed">Closed</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="clientName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Client Name</FormLabel>
                  <FormControl>
                    <Input placeholder="John Smith" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="caseFileNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Case File Number</FormLabel>
                  <FormControl>
                    <Input placeholder="CF-2023-001" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="caseFileName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Case File Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Smith vs Johnson Case File" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Enter matter details here..."
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <DialogFooter>
              <Button type="submit">Save Changes</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
