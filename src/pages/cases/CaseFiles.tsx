import React, { useState, useEffect } from "react"; // Added React import
import { Layout } from "@/components/layout/layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Briefcase, Search, Filter, Trash, Download, Share2 } from "lucide-react";
import { CreateCaseDialog } from "@/components/dialogs/create-case-dialog"; // MIGRATION: renamed from CreateMatterDialog to CreateCaseDialog
import { EditCaseDialog } from "@/components/dialogs/edit-case-dialog"; // MIGRATION: renamed from EditMatterDialog to EditCaseDialog
import { CaseDetails } from "@/components/cases/CaseDetails"; // MIGRATION: renamed from MatterDetails to CaseDetails and updated import path
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import { getAllItems, putItem, deleteItem, getNotesForCase } from "@/services/localDbService";
import { useIsMobile } from "@/hooks/use-mobile"; // Import the mobile hook

// Define Case interface (consistent with CaseDetail and CaseDetails) // MIGRATION: renamed from 'Matter' to 'Case'
interface Case { // MIGRATION: renamed from 'Matter' to 'Case'
  id: string; // Changed to string
  title: string;
  type: string;
  status: string;
  lastUpdated: string;
  clientName: string;
  description: string;
  caseFileNumber: string;
  caseFileName: string;
  intakeForm?: any; // Keep intakeForm optional
  participants?: string[];
  documents?: any[];
  tasks?: any[];
  meetingNotes?: any[];
  nextSession?: any | null;
}

// Mock data (only used if local storage is empty) - IDs are now strings
const initialCasesData: { [key: string]: Case } = { // MIGRATION: renamed from 'initialMattersData' to 'initialCasesData' and 'Matter' to 'Case'
  "case-1": {
    id: "case-1",
    title: "Smith vs. Johnson",
    type: "Divorce Mediation",
    status: "Active",
    lastUpdated: "2023-06-15",
    clientName: "John Smith",
    description: "Divorce mediation case involving property division and custody arrangements.",
    caseFileNumber: "CF-2023-001",
    caseFileName: "Smith-Johnson Divorce Case File",
    participants: ["John Smith", "Sarah Johnson"],
    documents: [], tasks: [], meetingNotes: [], nextSession: null,
  },
  "case-2": {
    id: "case-2",
    title: "Property Dispute Resolution",
    type: "Property Dispute",
    status: "Active",
    lastUpdated: "2023-06-16",
    clientName: "Sarah Johnson",
    description: "Boundary dispute between neighboring properties.",
    caseFileNumber: "CF-2023-002",
    caseFileName: "Johnson Property Dispute File",
    participants: ["Sarah Johnson", "Michael Brown"],
    documents: [], tasks: [], meetingNotes: [], nextSession: null,
  },
   "case-3": {
    id: "case-3",
    title: "Brown Employment Dispute",
    type: "Employment",
    status: "Active",
    lastUpdated: "2023-06-10",
    clientName: "Robert Brown",
    description: "Workplace discrimination claim against employer.",
    caseFileNumber: "CF-2023-003",
    caseFileName: "Brown Employment Case File",
    participants: ["Robert Brown", "Tech Solutions HR"],
    documents: [], tasks: [], meetingNotes: [], nextSession: null,
  },
   "case-4": {
    id: "case-4",
    title: "Wilson Family Mediation",
    type: "Family Dispute",
    status: "Pending",
    lastUpdated: "2023-06-05",
    clientName: "Emma Wilson",
    description: "Family inheritance dispute between siblings.",
    caseFileNumber: "CF-2023-004",
    caseFileName: "Wilson Family Mediation File",
    participants: ["Emma Wilson", "David Wilson"],
    documents: [], tasks: [], meetingNotes: [], nextSession: null,
  },
   "case-5": {
    id: "case-5",
    title: "Corporate Contract Negotiations",
    type: "Contract",
    status: "Closed",
    lastUpdated: "2023-05-20",
    clientName: "Tech Solutions Inc.",
    description: "Negotiation of service agreement between two businesses.",
    caseFileNumber: "CF-2023-005",
    caseFileName: "Tech Solutions Contract File",
    participants: ["Tech Solutions Rep", "Client Co Rep"],
    documents: [], tasks: [], meetingNotes: [], nextSession: null,
  }
};

const CaseFilesPage = () => {
  const [cases, setCases] = useState<{ [key: string]: Case }>({}); // MIGRATION: renamed from 'matters' to 'cases' and 'Matter' to 'Case'
  const [isLoading, setIsLoading] = useState(true);
  const isMobile = useIsMobile(); // Use the mobile hook

  // Load cases from IndexedDB on initial render // MIGRATION: renamed from 'matters' to 'cases'
  useEffect(() => {
    const loadCasesFromDb = async () => { // MIGRATION: renamed from 'loadMattersFromDb' to 'loadCasesFromDb'
      setIsLoading(true);
      try {
        const dbCasesArray = await getAllItems('cases'); // MIGRATION: renamed from 'dbMattersArray' to 'dbCasesArray' and 'matters' to 'cases'
        if (dbCasesArray.length > 0) { // MIGRATION: renamed from 'dbMattersArray' to 'dbCasesArray'
          const casesObject = dbCasesArray.reduce((acc, case_) => { // MIGRATION: renamed from 'mattersObject' to 'casesObject', 'dbMattersArray' to 'dbCasesArray', and 'matter' to 'case_'
            acc[case_.id] = case_; // MIGRATION: renamed from 'matter' to 'case_'
            return acc;
          }, {} as { [key: string]: Case }); // MIGRATION: renamed from 'Matter' to 'Case'
          console.log('Loaded cases from IndexedDB:', casesObject); // MIGRATION: renamed from 'matters' to 'cases' and 'mattersObject' to 'casesObject'
          setCases(casesObject); // MIGRATION: renamed from 'setMatters' to 'setCases' and 'mattersObject' to 'casesObject'
        } else {
          console.log('No cases found in IndexedDB, populating with initial data.'); // MIGRATION: renamed from 'matters' to 'cases'
          const initialDataPromises = Object.values(initialCasesData).map(case_ => // MIGRATION: renamed from 'initialMattersData' to 'initialCasesData' and 'matter' to 'case_'
            putItem('cases', case_) // MIGRATION: renamed from 'matters' to 'cases' and 'matter' to 'case_'
          );
          await Promise.all(initialDataPromises);
          console.log('Populated IndexedDB with initial cases.'); // MIGRATION: renamed from 'matters' to 'cases'
          setCases(initialCasesData); // MIGRATION: renamed from 'setMatters' to 'setCases' and 'initialMattersData' to 'initialCasesData'
        }
      } catch (error) {
        console.error('Error loading cases from IndexedDB:', error); // MIGRATION: renamed from 'matters' to 'cases'
        toast.error("Failed to load case files.");
      } finally {
        setIsLoading(false);
      }
    };
    loadCasesFromDb(); // MIGRATION: renamed from 'loadMattersFromDb' to 'loadCasesFromDb'
  }, []);

  const [activeTab, setActiveTab] = useState("active");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCases, setSelectedCases] = useState<string[]>([]); // MIGRATION: renamed from 'selectedMatters' to 'selectedCases'
  const [selectedCaseDetailId, setSelectedCaseDetailId] = useState<string | null>("case-1"); // MIGRATION: renamed from 'selectedMatterDetailId' to 'selectedCaseDetailId'
  const [notes, setNotes] = useState<any[]>([]);

  useEffect(() => {
    if (!selectedCaseDetailId) { // MIGRATION: renamed from 'selectedMatterDetailId' to 'selectedCaseDetailId'
      setNotes([]);
      return;
    }
    getNotesForCase(selectedCaseDetailId) // MIGRATION: renamed from 'selectedMatterDetailId' to 'selectedCaseDetailId'
      .then(setNotes)
      .catch((error) => {
        console.error("Failed to load notes:", error);
        setNotes([]);
      });
  }, [selectedCaseDetailId]); // MIGRATION: renamed from 'selectedMatterDetailId' to 'selectedCaseDetailId'

  const formatDate = (dateString: string | undefined) => {
     if (!dateString) return "N/A";
     try {
         const date = new Date(dateString);
         if (isNaN(date.getTime())) return "Invalid Date";
         return date.toLocaleDateString('en-GB', {
             day: '2-digit',
             month: '2-digit',
             year: 'numeric',
         });
     } catch (e) {
         console.error("Error formatting date:", dateString, e);
         return "Invalid Date";
     }
  };

  const casesArray = Object.values(cases); // MIGRATION: renamed from 'mattersArray' to 'casesArray' and 'matters' to 'cases'

  const filteredCases = casesArray.filter(case_ => { // MIGRATION: renamed from 'filteredMatters' to 'filteredCases', 'mattersArray' to 'casesArray', and 'matter' to 'case_'
    if (!case_) return false; // MIGRATION: renamed from 'matter' to 'case_'
    const matchesSearch =
      searchTerm === "" ||
      case_.title?.toLowerCase().includes(searchTerm.toLowerCase()) || // MIGRATION: renamed from 'matter' to 'case_'
      case_.clientName?.toLowerCase().includes(searchTerm.toLowerCase()) || // MIGRATION: renamed from 'matter' to 'case_'
      case_.type?.toLowerCase().includes(searchTerm.toLowerCase()) || // MIGRATION: renamed from 'matter' to 'case_'
      case_.caseFileNumber?.toLowerCase().includes(searchTerm.toLowerCase()); // MIGRATION: renamed from 'matter' to 'case_'

    if (activeTab === "active") return matchesSearch && case_.status === "Active"; // MIGRATION: renamed from 'matter' to 'case_'
    if (activeTab === "pending") return matchesSearch && case_.status === "Pending"; // MIGRATION: renamed from 'matter' to 'case_'
    if (activeTab === "closed") return matchesSearch && case_.status === "Closed"; // MIGRATION: renamed from 'matter' to 'case_'

    return false;
  });

  const toggleSelectCase = (id: string) => { // MIGRATION: renamed from 'toggleSelectMatter' to 'toggleSelectCase'
    setSelectedCases(prev => // MIGRATION: renamed from 'setSelectedMatters' to 'setSelectedCases'
      prev.includes(id)
        ? prev.filter(caseId => caseId !== id) // MIGRATION: renamed from 'matterId' to 'caseId'
        : [...prev, id]
    );
  };

  const toggleCaseDetails = (id: string) => { // MIGRATION: renamed from 'toggleMatterDetails' to 'toggleCaseDetails'
    setSelectedCaseDetailId(prev => prev === id ? null : id); // MIGRATION: renamed from 'setSelectedMatterDetailId' to 'setSelectedCaseDetailId'
  };

  const handleSaveCase = async (updatedCaseData: Case) => { // MIGRATION: renamed from 'handleSaveMatter' to 'handleSaveCase' and 'updatedMatterData: Matter' to 'updatedCaseData: Case'
    try {
      const caseToSave: Case = { // MIGRATION: renamed from 'matterToSave: Matter' to 'caseToSave: Case'
        ...updatedCaseData, // MIGRATION: renamed from 'updatedMatterData' to 'updatedCaseData'
        lastUpdated: new Date().toISOString(),
      };
      await putItem('cases', caseToSave); // MIGRATION: renamed from 'matters' to 'cases' and 'matterToSave' to 'caseToSave'
      setCases(prev => ({ // MIGRATION: renamed from 'setMatters' to 'setCases'
        ...prev,
        [caseToSave.id]: caseToSave, // MIGRATION: renamed from 'matterToSave' to 'caseToSave'
      }));
      console.log('Case saved successfully to IndexedDB:', caseToSave); // MIGRATION: renamed from 'Matter' to 'Case' and 'matterToSave' to 'caseToSave'
      toast.success("Case file updated");
    } catch (error) {
      console.error('Error saving case to IndexedDB:', error); // MIGRATION: renamed from 'matter' to 'case'
      toast.error('Failed to save case file');
    }
  };

  const handleDeleteCase = async (id: string) => { // MIGRATION: renamed from 'handleDeleteMatter' to 'handleDeleteCase'
    try {
      await deleteItem('cases', id); // MIGRATION: renamed from 'matters' to 'cases'
      setCases(prev => { // MIGRATION: renamed from 'setMatters' to 'setCases'
        const newState = { ...prev };
        delete newState[id];
        return newState;
      });
      setSelectedCases(prev => prev.filter(caseId => caseId !== id)); // MIGRATION: renamed from 'setSelectedMatters' to 'setSelectedCases' and 'matterId' to 'caseId'
      if (selectedCaseDetailId === id) { // MIGRATION: renamed from 'selectedMatterDetailId' to 'selectedCaseDetailId'
        setSelectedCaseDetailId(null); // MIGRATION: renamed from 'setSelectedMatterDetailId' to 'setSelectedCaseDetailId'
      }
      toast.success("Case file deleted successfully");
    } catch (error) {
      console.error(`Error deleting case ${id} from IndexedDB:`, error); // MIGRATION: renamed from 'matter' to 'case'
      toast.error("Failed to delete case file");
    }
  };

  const handleBulkDelete = async () => {
    const count = selectedCases.length; // MIGRATION: renamed from 'selectedMatters' to 'selectedCases'
    if (count === 0) return;

    const deletePromises = selectedCases.map(id => deleteItem('cases', id)); // MIGRATION: renamed from 'selectedMatters' to 'selectedCases' and 'matters' to 'cases'

    try {
      await Promise.all(deletePromises);
      setCases(prev => { // MIGRATION: renamed from 'setMatters' to 'setCases'
        const newState = { ...prev };
        selectedCases.forEach(id => { // MIGRATION: renamed from 'selectedMatters' to 'selectedCases'
          delete newState[id];
        });
        return newState;
      });
      if (selectedCaseDetailId && selectedCases.includes(selectedCaseDetailId)) { // MIGRATION: renamed from 'selectedMatterDetailId' to 'selectedCaseDetailId' and 'selectedMatters' to 'selectedCases'
        setSelectedCaseDetailId(null); // MIGRATION: renamed from 'setSelectedMatterDetailId' to 'setSelectedCaseDetailId'
      }
      toast.success(`${count} case file${count > 1 ? 's' : ''} deleted`);
      setSelectedCases([]); // MIGRATION: renamed from 'setSelectedMatters' to 'setSelectedCases'
    } catch (error) {
      console.error('Error during bulk delete from IndexedDB:', error);
      toast.error("Failed to delete selected case files");
    }
  };

  const handleShareCase = (id: string) => { // MIGRATION: renamed from 'handleShareMatter' to 'handleShareCase'
    const case_ = cases[id]; // MIGRATION: renamed from 'matter' to 'case_' and 'matters' to 'cases'
    if (case_) { // MIGRATION: renamed from 'matter' to 'case_'
      navigator.clipboard.writeText(`${window.location.origin}/case-files/${id}`)
        .then(() => toast.success(`Link for "${case_.title}" copied to clipboard.`)) // MIGRATION: renamed from 'matter' to 'case_'
        .catch(() => toast.error("Failed to copy link."));
    }
  };

  const handleDownloadCase = (id: string) => { // MIGRATION: renamed from 'handleDownloadMatter' to 'handleDownloadCase'
    const case_ = cases[id]; // MIGRATION: renamed from 'matter' to 'case_' and 'matters' to 'cases'
    if (case_) { // MIGRATION: renamed from 'matter' to 'case_'
      const caseData = JSON.stringify(case_, null, 2); // MIGRATION: renamed from 'matterData' to 'caseData' and 'matter' to 'case_'
      const blob = new Blob([caseData], { type: 'application/json' }); // MIGRATION: renamed from 'matterData' to 'caseData'
      const url = URL.createObjectURL(blob);

      const a = document.createElement('a');
      a.href = url;
      a.download = `${case_.title?.replace(/[\s\/]/g, '_') || 'case'}_file_${id}.json`; // MIGRATION: renamed from 'matter' to 'case_'
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.success(`Downloaded case file: ${case_.title}`); // MIGRATION: renamed from 'matter' to 'case_'
    }
  };

  const handleCreateCase = async (newCaseData: Omit<Case, 'id' | 'lastUpdated'>) => { // MIGRATION: renamed from 'handleCreateMatter' to 'handleCreateCase' and 'newMatterData: Omit<Matter' to 'newCaseData: Omit<Case'
    try {
      const newId = crypto.randomUUID();
      const caseToAdd: Case = { // MIGRATION: renamed from 'matterToAdd: Matter' to 'caseToAdd: Case'
        ...newCaseData, // MIGRATION: renamed from 'newMatterData' to 'newCaseData'
        id: newId,
        lastUpdated: new Date().toISOString(),
        participants: newCaseData.participants || [], // MIGRATION: renamed from 'newMatterData' to 'newCaseData'
        documents: newCaseData.documents || [], // MIGRATION: renamed from 'newMatterData' to 'newCaseData'
        tasks: newCaseData.tasks || [], // MIGRATION: renamed from 'newMatterData' to 'newCaseData'
        meetingNotes: newCaseData.meetingNotes || [], // MIGRATION: renamed from 'newMatterData' to 'newCaseData'
        nextSession: newCaseData.nextSession || null, // MIGRATION: renamed from 'newMatterData' to 'newCaseData'
        intakeForm: newCaseData.intakeForm || undefined, // MIGRATION: renamed from 'newMatterData' to 'newCaseData'
      };
      await putItem('cases', caseToAdd); // MIGRATION: renamed from 'matters' to 'cases' and 'matterToAdd' to 'caseToAdd'
      setCases(prev => ({ // MIGRATION: renamed from 'setMatters' to 'setCases'
        ...prev,
        [newId]: caseToAdd, // MIGRATION: renamed from 'matterToAdd' to 'caseToAdd'
      }));
      toast.success("Case file created successfully");
    } catch (error) {
      console.error("Error creating case in IndexedDB:", error); // MIGRATION: renamed from 'matter' to 'case'
      toast.error("Failed to create case file");
    }
  };

  return (
    <Layout>
      <div className="flex flex-col space-y-4 p-2 md:space-y-6 md:p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-4">
          <div>
            <h1 className={`${isMobile ? "text-xl" : "text-3xl"} font-bold tracking-tight`}>Case Files</h1>
            <p className="text-muted-foreground mt-1 text-sm">
              Manage all your legal matters and cases
            </p>
          </div>
          <div className="flex gap-2 w-full sm:w-auto mt-2 sm:mt-0">
            {selectedCases.length > 0 && ( // MIGRATION: renamed from 'selectedMatters' to 'selectedCases'
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" className="w-full sm:w-auto" size={isMobile ? "sm" : "default"}>
                    <Trash className={`${isMobile ? "h-3 w-3 mr-1" : "mr-2 h-4 w-4"}`} />
                    Delete ({selectedCases.length}) {/* MIGRATION: renamed from 'selectedMatters' to 'selectedCases' */}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent className={isMobile ? "max-w-[90vw] p-4" : ""}>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will permanently delete the selected {selectedCases.length} case file(s). {/* MIGRATION: renamed from 'selectedMatters' to 'selectedCases' */}
                      This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleBulkDelete}>
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
            <CreateCaseDialog onSave={handleCreateCase} /> {/* MIGRATION: renamed from 'CreateMatterDialog' to 'CreateCaseDialog' and 'handleCreateMatter' to 'handleCreateCase' */}
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-2 md:gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder={isMobile ? "Search..." : "Search by title, client, type, case number..."}
              className="w-full bg-background py-2 pl-8 pr-4 text-sm border rounded-md h-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button variant="outline" 
            className="flex gap-2 w-full md:w-auto h-10"
            size={isMobile ? "sm" : "default"}>
            <Filter className={`${isMobile ? "h-3 w-3" : "h-4 w-4"}`} />
            Filter
          </Button>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-3 w-full">
            <TabsTrigger value="active" className={isMobile ? "text-xs py-1.5" : ""}>
              Active ({Object.values(cases).filter(c => c.status === "Active").length}) {/* MIGRATION: renamed from 'matters' to 'cases' and 'm' to 'c' */}
            </TabsTrigger>
            <TabsTrigger value="pending" className={isMobile ? "text-xs py-1.5" : ""}>
              Pending ({Object.values(cases).filter(c => c.status === "Pending").length}) {/* MIGRATION: renamed from 'matters' to 'cases' and 'm' to 'c' */}
            </TabsTrigger>
            <TabsTrigger value="closed" className={isMobile ? "text-xs py-1.5" : ""}>
              Closed ({Object.values(cases).filter(c => c.status === "Closed").length}) {/* MIGRATION: renamed from 'matters' to 'cases' and 'm' to 'c' */}
            </TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="mt-4 md:mt-6">
            <Card>
              <CardContent className="p-0">
                <div className="divide-y">
                  {filteredCases.length > 0 ? ( // MIGRATION: renamed from 'filteredMatters' to 'filteredCases'
                    filteredCases.map((case_) => ( // MIGRATION: renamed from 'filteredMatters' to 'filteredCases' and 'matter' to 'case_'
                      <div key={case_.id}> {/* MIGRATION: renamed from 'matter' to 'case_' */}
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-2 sm:p-4 hover:bg-muted/50 transition-colors">
                          <div className="flex items-start flex-grow mb-2 sm:mb-0">
                            <Checkbox
                              checked={selectedCases.includes(case_.id)} {/* MIGRATION: renamed from 'selectedMatters' to 'selectedCases' and 'matter' to 'case_' */}
                              onCheckedChange={() => toggleSelectCase(case_.id)} {/* MIGRATION: renamed from 'toggleSelectMatter' to 'toggleSelectCase' and 'matter' to 'case_' */}
                              className="mr-2 sm:mr-3 mt-1 flex-shrink-0"
                              aria-label={`Select case ${case_.title}`} {/* MIGRATION: renamed from 'matter' to 'case' and 'matter' to 'case_' */}
                            />
                            <Briefcase className={`h-4 sm:h-5 w-4 sm:w-5 mt-0.5 flex-shrink-0 ${
                              case_.status === "Active" ? "text-blue-500" : // MIGRATION: renamed from 'matter' to 'case_'
                              case_.status === "Pending" ? "text-amber-500" : "text-gray-500" // MIGRATION: renamed from 'matter' to 'case_'
                            }`} />
                            <div className="ml-2 sm:ml-3 flex-grow">
                               <span 
                                 onClick={() => toggleCaseDetails(case_.id)} // MIGRATION: renamed from 'toggleMatterDetails' to 'toggleCaseDetails' and 'matter' to 'case_'
                                 className={`${isMobile ? "text-xs" : "text-base"} font-medium hover:underline cursor-pointer text-blue-600`}
                               >
                                {case_.title || "Untitled Case"} {/* MIGRATION: renamed from 'matter' to 'case_' and "Untitled Matter" to "Untitled Case" */}
                               </span>
                              <div className={`flex items-center ${isMobile ? "text-[10px]" : "text-xs"} text-muted-foreground space-x-1 sm:space-x-2 mt-0.5 sm:mt-1 flex-wrap`}>
                                <span>{case_.type || "N/A"}</span> {/* MIGRATION: renamed from 'matter' to 'case_' */}
                                <span>•</span>
                                <span>{case_.clientName || "N/A"}</span> {/* MIGRATION: renamed from 'matter' to 'case_' */}
                                <span>•</span>
                                {case_.caseFileNumber ? ( // MIGRATION: renamed from 'matter' to 'case_'
                                  <Link
                                    to={`/case-files/${case_.id}`} // MIGRATION: renamed from 'matter' to 'case_'
                                    className="text-blue-600 hover:underline"
                                    title={`View Case File ${case_.caseFileNumber}`} // MIGRATION: renamed from 'matter' to 'case_'
                                  >
                                    {case_.caseFileNumber} {/* MIGRATION: renamed from 'matter' to 'case_' */}
                                  </Link>
                                ) : (
                                  <span>N/A</span>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center text-xs text-muted-foreground ml-8 sm:ml-4 flex-shrink-0">
                            <span className="mr-2 hidden md:inline">Last updated: {formatDate(case_.lastUpdated)}</span> {/* MIGRATION: renamed from 'matter' to 'case_' */}
                            <div className="flex items-center space-x-0">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleShareCase(case_.id)} // MIGRATION: renamed from 'handleShareMatter' to 'handleShareCase' and 'matter' to 'case_'
                                title="Share Case File"
                                className={`${isMobile ? "h-7 w-7" : "h-8 w-8"}`}
                              >
                                <Share2 className={`${isMobile ? "h-3 w-3" : "h-4 w-4"}`} />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleDownloadCase(case_.id)} // MIGRATION: renamed from 'handleDownloadMatter' to 'handleDownloadCase' and 'matter' to 'case_'
                                title="Download Case File"
                                className={`${isMobile ? "h-7 w-7" : "h-8 w-8"}`}
                              >
                                <Download className={`${isMobile ? "h-3 w-3" : "h-4 w-4"}`} />
                              </Button>
                              <EditCaseDialog // MIGRATION: renamed from 'EditMatterDialog' to 'EditCaseDialog'
                                case={case_} // MIGRATION: renamed from 'matter={matter}' to 'case={case_}'
                                onSave={handleSaveCase} // MIGRATION: renamed from 'handleSaveMatter' to 'handleSaveCase'
                                iconSize={isMobile ? "small" : "default"}
                                buttonSize={isMobile ? "h-7 w-7" : "h-8 w-8"}
                              />
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    className={`${isMobile ? "h-7 w-7" : "h-8 w-8"} text-destructive hover:text-destructive`}
                                  >
                                    <Trash className={`${isMobile ? "h-3 w-3" : "h-4 w-4"}`} />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent className={isMobile ? "max-w-[90vw] p-4" : ""}>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      This will permanently delete the case file "{case_.title}". {/* MIGRATION: renamed from 'matter' to 'case_' */}
                                      This action cannot be undone.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => handleDeleteCase(case_.id)} // MIGRATION: renamed from 'handleDeleteMatter' to 'handleDeleteCase' and 'matter' to 'case_'
                                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                    >
                                      Delete
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                               <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => toggleCaseDetails(case_.id)} // MIGRATION: renamed from 'toggleMatterDetails' to 'toggleCaseDetails' and 'matter' to 'case_'
                                title={selectedCaseDetailId === case_.id ? "Hide Details" : "Show Details"} // MIGRATION: renamed from 'selectedMatterDetailId' to 'selectedCaseDetailId' and 'matter' to 'case_'
                                className={`${isMobile ? "h-7 w-7" : "h-8 w-8"}`}
                              >
                                {selectedCaseDetailId === case_.id ? <ChevronUp className={`${isMobile ? "h-3 w-3" : "h-4 w-4"}`} /> : <ChevronDown className={`${isMobile ? "h-3 w-3" : "h-4 w-4"}`} />} {/* MIGRATION: renamed from 'selectedMatterDetailId' to 'selectedCaseDetailId' and 'matter' to 'case_' */}
                              </Button>
                            </div>
                          </div>
                        </div>

                        {selectedCaseDetailId === case_.id && ( // MIGRATION: renamed from 'selectedMatterDetailId' to 'selectedCaseDetailId' and 'matter' to 'case_'
                          <div className="border-t bg-muted/20">
                            <CaseDetails // MIGRATION: renamed from 'MatterDetails' to 'CaseDetails'
                              case={case_} // MIGRATION: renamed from 'matter={matter}' to 'case={case_}'
                              onSave={handleSaveCase} // MIGRATION: renamed from 'handleSaveMatter' to 'handleSaveCase'
                            />
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className={`${isMobile ? "p-4" : "p-6"} text-center text-muted-foreground`}>
                      <p>No case files found matching your criteria.</p>
                       <CreateCaseDialog onSave={handleCreateCase} triggerText="Create New Case File" /> {/* MIGRATION: renamed from 'CreateMatterDialog' to 'CreateCaseDialog' and 'handleCreateMatter' to 'handleCreateCase' */}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

import { ChevronDown, ChevronUp } from "lucide-react";

export default CaseFilesPage;