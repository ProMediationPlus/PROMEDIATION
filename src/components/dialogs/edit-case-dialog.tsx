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

// Define Case interface consistent with other components // MIGRATION: renamed from 'Matter' to 'Case'
// Ideally, move this to a shared types file (e.g., src/types/case.ts) // MIGRATION: renamed from 'matter.ts' to 'case.ts'
interface Case { // MIGRATION: renamed from 'Matter' to 'Case'
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

// Update schema to use string ID and match Case interface fields // MIGRATION: renamed from 'Matter' to 'Case'
const formSchema = z.object({
  id: z.string(), // Changed to string
  title: z.string().min(2, "Case title is required"), // MIGRATION: renamed from 'Matter title' to 'Case title'
  type: z.string().min(1, "Case type is required"), // MIGRATION: renamed from 'Matter type' to 'Case type'
  status: z.string().min(1, "Status is required"),
  clientName: z.string().min(2, "Client name is required"),
  description: z.string().optional(),
  lastUpdated: z.string(), // Keep lastUpdated from the Case object // MIGRATION: renamed from 'Matter' to 'Case'
  caseFileNumber: z.string().min(1, "Case file number is required"),
  caseFileName: z.string().min(1, "Case file name is required"),
  // Do not include fields not edited directly in this form (like intakeForm, participants etc.)
  // unless the dialog is intended to edit them too.
});

export type CaseFormValues = z.infer<typeof formSchema>; // MIGRATION: renamed from 'MatterFormValues' to 'CaseFormValues'

// Props now use the consistent Case interface // MIGRATION: renamed from 'Matter' to 'Case'
interface EditCaseDialogProps { // MIGRATION: renamed from 'EditMatterDialogProps' to 'EditCaseDialogProps'
  case: Case; // Expect the full Case object // MIGRATION: renamed from 'matter: Matter' to 'case: Case'
  onSave: (case_: Case) => void; // Pass back the full Case object // MIGRATION: renamed from 'matter: Matter' to 'case_: Case'
}
export function EditCaseDialog({ case: initialCaseData, onSave }: EditCaseDialogProps) { // MIGRATION: renamed from 'EditMatterDialog' to 'EditCaseDialog' and 'matter: initialMatterData' to 'case: initialCaseData'
  const [open, setOpen] = useState(false);

  
  // Initialize form with values from the passed Case prop // MIGRATION: renamed from 'Matter' to 'Case'
  // Ensure only fields defined in formSchema are passed as defaultValues
  const form = useForm<CaseFormValues>({ // MIGRATION: renamed from 'MatterFormValues' to 'CaseFormValues'
    resolver: zodResolver(formSchema),
    defaultValues: {
      id: initialCaseData.id, // MIGRATION: renamed from 'initialMatterData' to 'initialCaseData'
      title: initialCaseData.title, // MIGRATION: renamed from 'initialMatterData' to 'initialCaseData'
      type: initialCaseData.type, // MIGRATION: renamed from 'initialMatterData' to 'initialCaseData'
      status: initialCaseData.status, // MIGRATION: renamed from 'initialMatterData' to 'initialCaseData'
      clientName: initialCaseData.clientName, // MIGRATION: renamed from 'initialMatterData' to 'initialCaseData'
      description: initialCaseData.description || "", // Handle optional description // MIGRATION: renamed from 'initialMatterData' to 'initialCaseData'
      lastUpdated: initialCaseData.lastUpdated, // MIGRATION: renamed from 'initialMatterData' to 'initialCaseData'
      caseFileNumber: initialCaseData.caseFileNumber, // MIGRATION: renamed from 'initialMatterData' to 'initialCaseData'
      caseFileName: initialCaseData.caseFileName, // MIGRATION: renamed from 'initialMatterData' to 'initialCaseData'
    },
  });

  function onSubmit(formValues: CaseFormValues) { // MIGRATION: renamed from 'MatterFormValues' to 'CaseFormValues'
    // Merge form values with the original case data to preserve fields not in the form // MIGRATION: renamed from 'matter' to 'case'
    const updatedCase: Case = { // MIGRATION: renamed from 'updatedMatter: Matter' to 'updatedCase: Case'
      ...initialCaseData, // Start with original data // MIGRATION: renamed from 'initialMatterData' to 'initialCaseData'
      ...formValues,       // Overwrite with form values
      lastUpdated: new Date().toISOString() // Update timestamp (use full ISO string)
    };

    // Save the complete updated case object // MIGRATION: renamed from 'matter' to 'case'
    onSave(updatedCase); // MIGRATION: renamed from 'updatedMatter' to 'updatedCase'

    // Show success toast
    toast.success("Case updated successfully"); // MIGRATION: renamed from 'Matter' to 'Case'
    
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
          <DialogTitle>Edit Case</DialogTitle> {/* MIGRATION: renamed from 'Edit Matter' to 'Edit Case' */}
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Case Title</FormLabel> {/* MIGRATION: renamed from 'Matter Title' to 'Case Title' */}
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
                  <FormLabel>Case Type</FormLabel> {/* MIGRATION: renamed from 'Matter Type' to 'Case Type' */}
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select case type" /> {/* MIGRATION: renamed from 'Select matter type' to 'Select case type' */}
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
                      placeholder="Enter case details here..." // MIGRATION: renamed from 'Enter matter details here...' to 'Enter case details here...'
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