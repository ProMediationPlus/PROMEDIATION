import React, { useState, useEffect } from "react"; // Added React import
import { Layout } from "@/components/layout/layout";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import {
  Briefcase,
  FileText,
  CheckSquare,
  MessageSquare,
  Clock,
  Calendar,
  Users,
  FileIcon,
  File,
  Plus,
  ArrowLeft,
  UserCheck, // Added for Intake Form tab
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useParams, Link, useNavigate } from "react-router-dom"; // Added useNavigate
import { toast } from "sonner";
import { MatterDetails } from "@/components/matters/MatterDetails";
import { getItem, getItemsByIndex, putItem, getNotesForCase } from "@/services/localDbService"; // Import DB service functions
import type { Matter as MatterType, CaseFileMetadata, Task, Note as NoteType } from "@/types/models"; // Import correct types
import { Folder, ChevronRight } from "lucide-react"; // Added Folder icon

// Use imported types directly
// Remove local interface definitions for Matter, Document, Task, MeetingNote, NextSession

// Remove mock data and localStorage helpers


const CaseDetailPage = () => {
  const [notes, setNotes] = useState<any[]>([]);

  useEffect(() => {
    if (!caseId) {
      setNotes([]);
      return;
    }
    getNotesForCase(caseId)
      .then(setNotes)
      .catch((error) => {
        console.error("Failed to load notes:", error);
        setNotes([]);
      });
  }, [caseId]);
  const { id: caseId } = useParams<{ id: string }>(); // Rename id to caseId for clarity
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");
  const [currentMatter, setCurrentMatter] = useState<MatterType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // State for folder navigation
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null); // null represents the root
  const [displayedItems, setDisplayedItems] = useState<CaseFileMetadata[]>([]);
  const [breadcrumbs, setBreadcrumbs] = useState<{ id: string | null; name: string }[]>([{ id: null, name: "Documents" }]);
  const [isLoadingFiles, setIsLoadingFiles] = useState(false);

  // Fetch Matter details
  useEffect(() => {
    const loadMatter = async () => {
      if (!caseId) {
        setError("No case ID provided.");
        setIsLoading(false);
        return;
      }
      setIsLoading(true);
      try {
        const matter = await getItem('matters', caseId);
        if (matter) {
          setCurrentMatter(matter);
          setError(null);
        } else {
          setError("Case not found.");
          setCurrentMatter(null);
        }
      } catch (e) {
        console.error("Error loading matter data:", e);
        setError("Failed to load case data.");
        setCurrentMatter(null);
      } finally {
        setIsLoading(false);
      }
    };
    loadMatter();
  }, [caseId]);

  // Fetch files/folders for the current folder
  useEffect(() => {
    const loadFolderContents = async () => {
      if (!caseId) return; // Don't fetch if caseId isn't available

      setIsLoadingFiles(true);
      try {
        // Use compound key for the index query: [caseId, parentId]
        // Use empty string "" to represent the root parentId in the query
        const parentIdQuery = currentFolderId === null ? "" : currentFolderId;
        const items = await getItemsByIndex('caseFiles', 'by-parent', [caseId, parentIdQuery]);
        // Sort folders first, then files, alphabetically
        items.sort((a, b) => {
            if (a.itemType === 'folder' && b.itemType !== 'folder') return -1;
            if (a.itemType !== 'folder' && b.itemType === 'folder') return 1;
            return a.name.localeCompare(b.name);
        });
        setDisplayedItems(items);
      } catch (e) {
        console.error(`Error loading items for folder ${currentFolderId}:`, e);
        toast.error("Failed to load folder contents.");
        setDisplayedItems([]); // Clear items on error
      } finally {
        setIsLoadingFiles(false);
      }
    };

    loadFolderContents();
  }, [caseId, currentFolderId]); // Re-fetch when caseId or currentFolderId changes

  // Updated save handler using localStorage
  const handleSaveMatter = (updatedMatterData: Partial<MatterType>) => {
    if (!caseId || !currentMatter) return;

    const matterToSave: MatterType = {
      ...currentMatter, // Start with existing data
      ...updatedMatterData, // Apply partial updates
      id: caseId, // Ensure ID is correct
      updatedAt: new Date(), // Update timestamp
    };

    // Save to localStorage
    localStorage.setItem(`matter_${caseId}`, JSON.stringify(matterToSave));

    setCurrentMatter(matterToSave); // Update local state
    toast.success("Client intake details saved successfully to local storage.");
  };


  // Format date
  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return "N/A";
    try {
        const date = new Date(dateString);
        // Check if date is valid before formatting
        if (isNaN(date.getTime())) {
            return "Invalid Date";
        }
        return date.toLocaleDateString('en-GB', { // Use en-GB for DD/MM/YYYY
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
        });
    } catch (e) {
        console.error("Error formatting date:", dateString, e);
        return "Invalid Date";
    }
  };

  // Helper function to get the appropriate icon based on file type
  // Updated getFileIcon to handle folders and use CaseFileMetadata type
  const getFileIcon = (item: CaseFileMetadata) => {
    if (item.itemType === 'folder') {
        return <Folder className="h-5 w-5 text-amber-500" />;
    }
    // Handle file types (optional: expand with more icons)
    switch (item.fileType?.split('/')[1]?.toUpperCase()) {
      case 'PDF':
        return <FileText className="h-5 w-5 text-red-500" />;
      case 'DOCX':
      case 'DOC':
        return <FileText className="h-5 w-5 text-blue-500" />;
      case 'XLSX':
      case 'XLS':
        return <FileText className="h-5 w-5 text-green-500" />;
      case 'PNG':
      case 'JPG':
      case 'JPEG':
      case 'GIF':
        return <FileText className="h-5 w-5 text-purple-500" />; // Example for images
      default:
        return <File className="h-5 w-5 text-gray-500" />;
    }
  };

  if (isLoading) {
    return <Layout><div className="p-6">Loading case details...</div></Layout>;
  }

  if (error || !currentMatter) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center h-full p-6">
          <h1 className="text-2xl font-bold mb-2">{error || "Case Not Found"}</h1>
          <p className="text-muted-foreground mb-4">The case you're looking for doesn't exist or couldn't be loaded.</p>
          <Button onClick={() => navigate('/case-files')}>Back to Case Files</Button>
        </div>
      </Layout>
    );
  }

  // Now use currentMatter for rendering
  const caseDetails = currentMatter;

  return (
    <Layout>
      <div className="flex flex-col space-y-6 p-4 md:p-6"> {/* Added padding */}
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="icon" asChild>
            <Link to="/case-files">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">{caseDetails.title}</h1>
            <div className="flex items-center text-sm text-muted-foreground">
              {/* Removed caseDetails.type as it's not in the imported MatterType */}
              <span className="mr-2">•</span>
              <span>{caseDetails.status}</span>
               <span className="mr-2 ml-2">•</span> {/* Added separator */}
               <span>Case ID: {caseDetails.id}</span> {/* Display ID */}
            </div>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          {/* Added Intake Form Tab */}
          <TabsList className="grid grid-cols-6 w-full"> {/* Adjusted grid columns */}
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="intake">Intake Form</TabsTrigger>
            <TabsTrigger value="documents">Documents</TabsTrigger>
            <TabsTrigger value="notes">Notes</TabsTrigger>
            <TabsTrigger value="tasks">Tasks</TabsTrigger>
            <TabsTrigger value="meetingNotes">Meeting Notes</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-4 mt-4"> {/* Added margin-top */}
            <Card>
              <CardHeader>
                <CardTitle>Case Details</CardTitle>
                <CardDescription>
                  Basic information about this case
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-medium mb-1">Description</h3>
                  <p className="text-sm text-muted-foreground">{caseDetails.description || "No description provided."}</p>
                </div>
                 <div>
                  <h3 className="font-medium mb-1">Case File Number</h3>
                  <p className="text-sm text-muted-foreground">{caseDetails.caseFileNumber || "N/A"}</p>
                </div>
                 <div>
                  <h3 className="font-medium mb-1">Case File Name</h3>
                  {/* Removed caseFileName, title or caseFileNumber can be used if needed */}
                  {/* <p className="text-sm text-muted-foreground">{caseDetails.title || "N/A"}</p> */}
                </div>
                <div>
                  <h3 className="font-medium mb-1">Last Updated</h3>
                  <p className="text-sm text-muted-foreground flex items-center">
                    <Clock className="mr-1 h-4 w-4" />
                    {/* Use updatedAt from the imported MatterType */}
                    {formatDate(caseDetails.updatedAt?.toISOString())}
                  </p>
                </div>
                <div>
                  <h3 className="font-medium mb-1">Participants</h3>
                  <div className="text-sm text-muted-foreground">
                    <div className="flex items-center">
                      <Users className="mr-1 h-4 w-4" />
                      {/* Use parties from the imported MatterType */}
                      <span>{caseDetails.parties?.length || 0} parties involved</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                      {/* Use parties from the imported MatterType */}
                      {caseDetails.parties?.map((party, index) => (
                        <div key={index} className="flex items-center p-2 bg-muted rounded-md">
                          {party}
                        </div>
                      ))}
                       {/* Use parties from the imported MatterType */}
                       {(!caseDetails.parties || caseDetails.parties.length === 0) && (
                           <p>No parties listed.</p>
                       )}
                    </div>
                  </div>
                </div>
                {/* Removed Next Session section as it's not part of the core MatterType */}
                 {/* Removed Linked Contacts section as it relied on separate mock data */}
              </CardContent>
            </Card>

            <div className="grid gap-4 md:grid-cols-3">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center">
                    <FileText className="h-4 w-4 mr-2 text-blue-500" />
                    Documents
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {/* TODO: Fetch actual counts from DB if needed, or remove */}
                  <div className="text-2xl font-bold">--</div>
                  <p className="text-xs text-muted-foreground">Total files/folders</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center">
                    <CheckSquare className="h-4 w-4 mr-2 text-green-500" />
                    Tasks
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {/* TODO: Fetch actual counts from DB */}
                  <div className="text-2xl font-bold">--</div>
                  <p className="text-xs text-muted-foreground">
                    -- active
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center">
                    <MessageSquare className="h-4 w-4 mr-2 text-purple-500" />
                    Meeting Notes
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {/* TODO: Fetch actual counts from DB */}
                  <div className="text-2xl font-bold">--</div>
                  <p className="text-xs text-muted-foreground">Session notes</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Intake Form Tab */}
          <TabsContent value="intake" className="mt-4"> {/* Added margin-top */}
             <Card>
                <CardHeader>
                    <CardTitle className="flex items-center">
                        <UserCheck className="h-5 w-5 mr-2" />
                        Client Intake Form
                    </CardTitle>
                    <CardDescription>
                        Fill in or update the detailed intake information for this matter.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {/* Render MatterDetails here, passing the loaded matter and save handler */}
                    <MatterDetails
                        // Ensure matter prop matches expected type in MatterDetails if needed
                        matter={caseDetails as any} // Cast needed if MatterDetails expects slightly different shape
                        onSave={handleSaveMatter} // No longer async, cast might not be needed depending on MatterDetails prop type
                    />
                </CardContent>
             </Card>
          </TabsContent>

          {/* Documents Tab - Updated to use displayedItems state */}
          <TabsContent value="documents" className="space-y-4 mt-4">
            {/* Breadcrumbs will go here */}
            <div className="flex items-center space-x-1 text-sm text-muted-foreground mb-2">
              {breadcrumbs.map((crumb, index) => (
                <React.Fragment key={crumb.id ?? 'root'}>
                  {index > 0 && <ChevronRight className="h-4 w-4" />}
                  <button
                    onClick={() => handleBreadcrumbClick(crumb.id, index)}
                    className={`hover:text-primary ${index === breadcrumbs.length - 1 ? 'font-medium text-foreground' : ''}`}
                    disabled={index === breadcrumbs.length - 1}
                  >
                    {crumb.name}
                  </button>
                </React.Fragment>
              ))}
            </div>

            <div className="flex justify-between items-center">
              <h2 className="text-lg font-medium">
                {breadcrumbs[breadcrumbs.length - 1].name} {/* Show current folder name */}
              </h2>
              {/* TODO: Add Folder/Document buttons */}
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Item
              </Button>
            </div>
            <Card>
              <CardContent className="p-0">
                {isLoadingFiles ? (
                  <div className="p-6 text-center text-muted-foreground">Loading items...</div>
                ) : (
                  <div className="divide-y">
                    {displayedItems.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between p-4 hover:bg-muted/50 cursor-pointer transition-colors"
                        onClick={() => handleItemClick(item)} // Add click handler
                      >
                        <div className="flex items-center">
                          {getFileIcon(item)}
                          <div className="ml-3">
                            <p className="text-sm font-medium">{item.name}</p>
                            <div className="flex items-center text-xs text-muted-foreground space-x-2">
                              {item.itemType === 'file' && (
                                <>
                                  <span>{formatDate(item.updatedAt?.toISOString())}</span>
                                  <span>•</span>
                                  <span>{item.fileType || 'Unknown'}</span>
                                  <span>•</span>
                                  <span>{item.fileSize ? `${(item.fileSize / 1024).toFixed(1)} KB` : 'N/A'}</span>
                                </>
                              )}
                              {item.itemType === 'folder' && (
                                <span>Folder</span>
                              )}
                            </div>
                          </div>
                        </div>
                        {/* TODO: Add item actions (rename, delete, etc.) */}
                        <Button variant="ghost" size="icon">
                          <FileIcon className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                    {!isLoadingFiles && displayedItems.length === 0 && (
                      <div className="p-6 text-center text-muted-foreground">
                        <p>This folder is empty.</p>
                        {/* TODO: Add Folder/Document buttons */}
                        <Button variant="link" className="mt-2">
                          + Add Item
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tasks Tab - TODO: Fetch tasks from DB */}
          <TabsContent value="tasks" className="space-y-4 mt-4">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-medium">Tasks</h2>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Task
              </Button>
            </div>
            <Card>
              <CardContent className="p-6 text-center text-muted-foreground">
                <p>Task list not yet implemented.</p>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Meeting Notes Tab - TODO: Fetch notes from DB */}
          <TabsContent value="meetingNotes" className="space-y-4 mt-4">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-medium">Meeting Notes</h2>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Note
              </Button>
            </div>
            <Card>
              <CardContent className="p-6 text-center text-muted-foreground">
                <p>Meeting notes list not yet implemented.</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default CaseDetailPage;

// TODO: Implement handleItemClick and handleBreadcrumbClick for folder navigation
// TODO: Implement Add Item functionality (create folder/upload file)
// TODO: Implement item actions (rename, delete, move)
// TODO: Fetch and display Tasks and Meeting Notes from DB in their respective tabs
// TODO: Update MatterDetails component to align with imported MatterType if necessary
