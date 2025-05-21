
import { useState, useEffect } from "react"; // Added useEffect
import { useNavigate, useLocation } from "react-router-dom";
import { Layout } from "@/components/layout/layout";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast"; // Assuming this is the correct toast import
import { FileText, Save, ArrowLeft, Check, ChevronsUpDown } from "lucide-react"; // Added Check, ChevronsUpDown
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"; // Added Popover
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"; // Added Command
import { cn } from "@/lib/utils"; // Added cn
import { Case, Note } from "@/types/models"; // MIGRATION: renamed from 'Matter' to 'Case'
import { getAllItems } from "@/services/localDbService"; // Added DB service

const NewNotePage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const existingNote: Note | undefined = location.state?.note; // Type existingNote
  const isEditing = !!existingNote;
  const [cases, setCases] = useState<Case[]>([]); // MIGRATION: renamed from 'matters, setMatters' to 'cases, setCases' and 'Matter' to 'Case'
  const [isLoadingCases, setIsLoadingCases] = useState(true); // MIGRATION: renamed from 'isLoadingMatters' to 'isLoadingCases'

  const [formData, setFormData] = useState({
    title: existingNote?.title || "",
    // Use caseFileNumber from the updated Note type
    caseFileNumber: existingNote?.caseFileNumber || "",
    // Removed category as it's not in the Note type
    content: existingNote?.content || "" // Use content directly
  });

  // Fetch cases for autocomplete // MIGRATION: renamed from 'matters' to 'cases'
  useEffect(() => {
    const loadCases = async () => { // MIGRATION: renamed from 'loadMatters' to 'loadCases'
      setIsLoadingCases(true); // MIGRATION: renamed from 'setIsLoadingMatters' to 'setIsLoadingCases'
      try {
        const loadedCases = await getAllItems('cases'); // MIGRATION: renamed from 'loadedMatters' to 'loadedCases' and 'matters' to 'cases'
        setCases(loadedCases); // MIGRATION: renamed from 'setMatters' to 'setCases' and 'loadedMatters' to 'loadedCases'
      } catch (error) {
        console.error('Error loading cases:', error); // MIGRATION: renamed from 'matters' to 'cases'
        toast({ title: "Error", description: "Failed to load case files for selection.", variant: "destructive" });
      } finally {
        setIsLoadingCases(false); // MIGRATION: renamed from 'setIsLoadingMatters' to 'setIsLoadingCases'
      }
    };
    loadCases(); // MIGRATION: renamed from 'loadMatters' to 'loadCases'
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Removed handleCategorySelectChange as category field is removed

  const handleCaseFileSelect = (value: string) => {
    setFormData(prev => ({ ...prev, caseFileNumber: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (!formData.title.trim()) {
      toast({
        title: "Required field missing",
        description: "Please enter a title for your note",
        variant: "destructive"
      });
      return;
    }

    // Validate caseFileNumber selection
    if (!formData.caseFileNumber) {
      toast({
        title: "Required field missing",
        description: "Please select or enter a Case File Number",
        variant: "destructive"
      });
      return;
    }
    // Optional: Add validation for the CF format if needed here too
    if (!/^CF[\w-]+$/i.test(formData.caseFileNumber)) {
       toast({
           title: "Invalid Format",
           description: `Case File Number "${formData.caseFileNumber}" must start with CF and contain letters, numbers, or hyphens.`,
           variant: "destructive"
       });
       return;
    }

    // Prepare the note data
    // Prepare the note data using the updated Note type structure
    const noteData: Note = {
      id: existingNote?.id || `note-${Date.now()}-${Math.random()}`, // Use existing ID or generate a new string ID
      title: formData.title,
      caseFileNumber: formData.caseFileNumber, // Use the selected case file number
      content: formData.content,
      // Removed category
      tags: existingNote?.tags || [], // Preserve existing tags or initialize
      createdAt: existingNote?.createdAt || new Date(),
      updatedAt: new Date(),
    };

    // Show success message
    toast({
      title: isEditing ? "Note updated" : "Note created",
      description: `"${formData.title}" has been ${isEditing ? 'updated' : 'added to your notes'}`,
    });

    // Navigate back to the notes page with the new/updated note data
    navigate("/notes", { 
      state: { 
        [isEditing ? 'updatedNote' : 'newNote']: noteData
      }
    });
  };

  const handleCancel = () => {
    navigate("/notes");
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{isEditing ? 'Edit Note' : 'New Note'}</h1>
            <p className="text-muted-foreground">
              {isEditing ? 'Update your existing note' : 'Create a new case note or record'}
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={handleCancel} className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Notes
          </Button>
        </div>

        <form onSubmit={handleSubmit}>
          <Card>
            <CardHeader>
              <CardTitle>{isEditing ? 'Edit Note Details' : 'Note Details'}</CardTitle>
              <CardDescription>
                {isEditing ? 'Update the information for this note' : 'Fill in the information for your new note'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  name="title"
                  placeholder="Enter note title"
                  value={formData.title}
                  onChange={handleChange}
                />
              </div>

              {/* Case File Number Autocomplete */}
              <div className="space-y-2">
                <Label>Case File Number</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      className={cn(
                        "w-full justify-between",
                        !formData.caseFileNumber && "text-muted-foreground"
                      )}
                      disabled={isLoadingCases} {/* MIGRATION: renamed from 'isLoadingMatters' to 'isLoadingCases' */}
                    >
                      {formData.caseFileNumber
                        ? cases.find( // MIGRATION: renamed from 'matters' to 'cases'
                            (case_) => case_.caseFileNumber === formData.caseFileNumber // MIGRATION: renamed from 'matter' to 'case_'
                          )?.caseFileNumber // Display selected number
                        : "Select Case File..."}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                    <Command filter={(value, search) => {
                        // Custom filter to match caseFileNumber or title
                        const case_ = cases.find(c => c.caseFileNumber.toLowerCase() === value.toLowerCase()); // MIGRATION: renamed from 'matter' to 'case_', 'matters' to 'cases', and 'm' to 'c'
                        if (!case_) return 0; // MIGRATION: renamed from 'matter' to 'case_'
                        const term = search.toLowerCase();
                        if (case_.caseFileNumber.toLowerCase().includes(term)) return 1; // MIGRATION: renamed from 'matter' to 'case_'
                        if (case_.title.toLowerCase().includes(term)) return 1; // MIGRATION: renamed from 'matter' to 'case_'
                        return 0;
                      }}>
                      <CommandInput placeholder="Search case number or title..." />
                      <CommandList>
                        <CommandEmpty>No matching case file found.</CommandEmpty>
                        <CommandGroup>
                          {cases.map((case_) => ( // MIGRATION: renamed from 'matters' to 'cases' and 'matter' to 'case_'
                            <CommandItem
                              key={case_.id} // MIGRATION: renamed from 'matter' to 'case_'
                              value={case_.caseFileNumber} // Use caseFileNumber as the value for selection // MIGRATION: renamed from 'matter' to 'case_'
                              onSelect={() => {
                                handleCaseFileSelect(case_.caseFileNumber); // MIGRATION: renamed from 'matter' to 'case_'
                                // Close popover manually if needed, depends on Command behavior
                                document.dispatchEvent(new KeyboardEvent('keydown', {'key': 'Escape'}));
                              }}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  formData.caseFileNumber === case_.caseFileNumber // MIGRATION: renamed from 'matter' to 'case_'
                                    ? "opacity-100"
                                    : "opacity-0"
                                )}
                              />
                              <div>
                                <div className="font-medium">{case_.caseFileNumber}</div> {/* MIGRATION: renamed from 'matter' to 'case_' */}
                                <div className="text-xs text-muted-foreground">{case_.title}</div> {/* MIGRATION: renamed from 'matter' to 'case_' */}
                              </div>
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>

              {/* Category Field Removed */}

              <div className="space-y-2">
                <Label htmlFor="content">Note Content</Label>
                <Textarea
                  id="content"
                  name="content"
                  placeholder="Enter note content"
                  value={formData.content}
                  onChange={handleChange}
                  className="min-h-[200px]"
                />
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button type="button" variant="outline" onClick={handleCancel}>
                Cancel
              </Button>
              <Button type="submit" className="gap-2">
                {isEditing ? <Save className="h-4 w-4" /> : <FileText className="h-4 w-4" />}
                {isEditing ? 'Update Note' : 'Save Note'}
              </Button>
            </CardFooter>
          </Card>
        </form>
      </div>
    </Layout>
  );
};

export default NewNotePage;
