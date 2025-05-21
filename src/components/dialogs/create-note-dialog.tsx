import React, { useState, useEffect } from 'react';
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { FileText, Save, Check, ChevronsUpDown } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { cn } from "@/lib/utils";
import { Case, Note } from "@/types/models"; // MIGRATION: renamed from 'Matter' to 'Case'
import { getAllItems, addItem } from "@/services/localDbService";

interface CreateNoteDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CreateNoteDialog({ isOpen, onClose }: CreateNoteDialogProps) {
  const [cases, setCases] = useState<Case[]>([]); // MIGRATION: renamed from 'matters, setMatters' to 'cases, setCases'
  const [isLoadingCases, setIsLoadingCases] = useState(true); // MIGRATION: renamed from 'isLoadingMatters' to 'isLoadingCases'
  const [formData, setFormData] = useState({
    title: "",
    caseFileNumber: "",
    content: ""
  });

  useEffect(() => {
    if (isOpen) {
      const loadCases = async () => { // MIGRATION: renamed from 'loadMatters' to 'loadCases'
        setIsLoadingCases(true); // MIGRATION: renamed from 'setIsLoadingMatters' to 'setIsLoadingCases'
        try {
          const loadedCases = await getAllItems('cases'); // MIGRATION: renamed from 'loadedMatters' to 'loadedCases' and 'matters' to 'cases'
          setCases(loadedCases); // MIGRATION: renamed from 'setMatters' to 'setCases'
        } catch (error) {
          console.error('Error loading cases:', error); // MIGRATION: renamed from 'matters' to 'cases'
          toast({ title: "Error", description: "Failed to load case files for selection.", variant: "destructive" });
        } finally {
          setIsLoadingCases(false); // MIGRATION: renamed from 'setIsLoadingMatters' to 'setIsLoadingCases'
        }
      };
      loadCases(); // MIGRATION: renamed from 'loadMatters' to 'loadCases'
      setFormData({ title: "", caseFileNumber: "", content: "" });
    }
  }, [isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCaseFileSelect = (value: string) => {
    setFormData(prev => ({ ...prev, caseFileNumber: value }));
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    
    if (!formData.title.trim()) {
      toast({ title: "Required field missing", description: "Please enter a title for your note", variant: "destructive" });
      return;
    }
    if (!formData.caseFileNumber) {
      toast({ title: "Required field missing", description: "Please select a Case File Number", variant: "destructive" });
      return;
    }

    const noteData: Note = {
      id: `note-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      title: formData.title.trim(),
      caseFileNumber: formData.caseFileNumber,
      content: formData.content.trim(),
      tags: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    try {
      await addItem('notes', noteData);
      toast({
        title: "Note created",
        description: `"${noteData.title}" has been added to your notes.`,
      });
      onClose();
    } catch (error) {
      console.error("Failed to save note:", error);
      toast({ title: "Error", description: "Failed to save note. Please try again.", variant: "destructive" });
    }
  };

  if (!isOpen) return null;

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent className="max-w-lg mx-auto w-[calc(100%-2rem)]">
        <AlertDialogHeader>
          <AlertDialogTitle>Add New Note</AlertDialogTitle>
        </AlertDialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 max-h-[60vh] overflow-y-auto px-1 py-2">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              name="title"
              placeholder="Enter note title"
              value={formData.title}
              onChange={handleChange}
              required
            />
          </div>

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
                    ? cases.find(c => c.caseFileNumber === formData.caseFileNumber)?.caseFileNumber {/* MIGRATION: renamed from 'matters.find(m =>' to 'cases.find(c =>' */}
                    : "Select Case File..."}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                <Command filter={(value, search) => {
                    const case_ = cases.find(c => c.caseFileNumber.toLowerCase() === value.toLowerCase()); {/* MIGRATION: renamed from 'matter' to 'case_', 'matters' to 'cases', and 'm' to 'c' */}
                    if (!case_) return 0; {/* MIGRATION: renamed from 'matter' to 'case_' */}
                    const term = search.toLowerCase();
                    if (case_.caseFileNumber.toLowerCase().includes(term)) return 1; {/* MIGRATION: renamed from 'matter' to 'case_' */}
                    if (case_.title.toLowerCase().includes(term)) return 1; {/* MIGRATION: renamed from 'matter' to 'case_' */}
                    return 0;
                  }}>
                  <CommandInput placeholder="Search case number or title..." />
                  <CommandList>
                    <CommandEmpty>{isLoadingCases ? "Loading cases..." : "No matching case file found."}</CommandEmpty> {/* MIGRATION: renamed from 'isLoadingMatters' to 'isLoadingCases' */}
                    <CommandGroup>
                      {cases.map((case_) => ( {/* MIGRATION: renamed from 'matters.map((matter)' to 'cases.map((case_)' */}
                        <CommandItem
                          key={case_.id} {/* MIGRATION: renamed from 'matter.id' to 'case_.id' */}
                          value={case_.caseFileNumber} {/* MIGRATION: renamed from 'matter.caseFileNumber' to 'case_.caseFileNumber' */}
                          onSelect={() => {
                            handleCaseFileSelect(case_.caseFileNumber); {/* MIGRATION: renamed from 'matter.caseFileNumber' to 'case_.caseFileNumber' */}
                            document.dispatchEvent(new KeyboardEvent('keydown', {'key': 'Escape'}));
                          }}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              formData.caseFileNumber === case_.caseFileNumber ? "opacity-100" : "opacity-0" {/* MIGRATION: renamed from 'matter' to 'case_' */}
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

          <div className="space-y-2">
            <Label htmlFor="content">Note Content</Label>
            <Textarea
              id="content"
              name="content"
              placeholder="Enter note content"
              value={formData.content}
              onChange={handleChange}
              className="min-h-[150px]"
            />
          </div>
        </form>
        
        <AlertDialogFooter className="pt-4">
          <AlertDialogCancel onClick={onClose}>Cancel</AlertDialogCancel>
          <Button onClick={() => handleSubmit()} className="gap-2">
             <Save className="h-4 w-4" />
             Save Note
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
