
import { useEffect, useState } from "react";
import { Layout } from "@/components/layout/layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { 
  FolderArchive, 
  Search, 
  Plus, 
  FileText, 
  FileImage, 
  File, 
  MoreVertical, 
  Upload, 
  FolderPlus,
  HardDrive,
  ChevronDown,
  ChevronRight,
  Share,
  Pencil,
  Trash,
  Download
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { EditDocumentDialog } from "@/components/dialogs/edit-document-dialog";
import { toast } from "sonner";
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

// Define interfaces for files and folders
interface Document {
  id: number;
  name: string;
  type: string;
  size: string;
  lastModified: string;
  case: string;
}

interface Folder {
  id: number;
  name: string;
  files: number;
  subfolders?: Folder[];
  isOpen?: boolean;
}

// Mock data for files
const allFiles: Document[] = [
  {
    id: 1,
    name: "Settlement Agreement - Smith.pdf",
    type: "pdf",
    size: "1.2 MB",
    lastModified: "2023-06-10T15:30:00",
    case: "Smith vs. Johnson",
  },
  {
    id: 2,
    name: "Property Photos.jpg",
    type: "image",
    size: "3.8 MB",
    lastModified: "2023-06-09T11:00:00",
    case: "Property Dispute",
  },
  {
    id: 3,
    name: "Employment Contract.docx",
    type: "document",
    size: "0.5 MB",
    lastModified: "2023-06-07T09:45:00",
    case: "Employment Contract",
  },
  {
    id: 4,
    name: "Meeting Notes - June 5.txt",
    type: "text",
    size: "0.1 MB",
    lastModified: "2023-06-05T13:00:00",
    case: "Smith vs. Johnson",
  },
  {
    id: 5,
    name: "Financial Disclosure.xlsx",
    type: "spreadsheet",
    size: "0.7 MB",
    lastModified: "2023-06-01T10:30:00",
    case: "Business Partnership",
  },
  {
    id: 6,
    name: "Child Custody Agreement.pdf",
    type: "pdf",
    size: "0.9 MB",
    lastModified: "2023-05-28T14:15:00",
    case: "Family Mediation",
  },
  {
    id: 7,
    name: "Business Valuation Report.pdf",
    type: "pdf",
    size: "2.4 MB",
    lastModified: "2023-05-25T09:00:00",
    case: "Business Partnership",
  },
  {
    id: 8,
    name: "Audio Recording - Session 2.mp3",
    type: "audio",
    size: "15.2 MB",
    lastModified: "2023-05-20T11:30:00",
    case: "Employment Contract",
  },
];

// Folders structure with subfolders
const initialFolders: Folder[] = [
  { 
    id: 1, 
    name: "Active Cases", 
    files: 5,
    subfolders: [
      { id: 5, name: "Smith vs. Johnson", files: 3 },
      { id: 6, name: "Property Dispute", files: 2 }
    ]
  },
  { 
    id: 2, 
    name: "Completed Mediations", 
    files: 10,
    subfolders: [
      { id: 7, name: "2023 Cases", files: 7 },
      { id: 8, name: "2022 Cases", files: 3 }
    ]
  },
  { id: 3, name: "Templates", files: 8 },
  { 
    id: 4, 
    name: "Client Resources", 
    files: 15,
    subfolders: [
      { id: 9, name: "Forms", files: 5 },
      { id: 10, name: "Guides", files: 10 }
    ]
  },
];

const StoragePage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentView, setCurrentView] = useState("all");
  const [folders, setFolders] = useState<Folder[]>(initialFolders);
  const [files, setFiles] = useState<Document[]>(allFiles);

  // Initialize the folders with isOpen property
  useEffect(() => {
    const initializeFolders = (folderList: Folder[]): Folder[] => {
      return folderList.map(folder => ({
        ...folder,
        isOpen: false,
        subfolders: folder.subfolders ? initializeFolders(folder.subfolders) : undefined
      }));
    };
    
    setFolders(initializeFolders(initialFolders));
  }, []);

  // Format date in a readable way
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric',
      month: 'short', 
      day: 'numeric' 
    });
  };

  // Toggle folder open/close
  const toggleFolder = (folderId: number) => {
    const updateFolders = (folderList: Folder[]): Folder[] => {
      return folderList.map(folder => {
        if (folder.id === folderId) {
          return { ...folder, isOpen: !folder.isOpen };
        }
        if (folder.subfolders) {
          return { 
            ...folder, 
            subfolders: updateFolders(folder.subfolders) 
          };
        }
        return folder;
      });
    };
    
    setFolders(updateFolders(folders));
  };

  // Filter files based on search term
  const filteredFiles = files.filter(file => 
    searchTerm === "" || 
    file.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    file.case.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Get icon based on file type
  const getFileIcon = (type: string) => {
    switch (type) {
      case 'pdf':
        return <FileText className="h-10 w-10 text-red-500" />; // Using FileText with red color for PDFs
      case 'image':
        return <FileImage className="h-10 w-10 text-blue-500" />;
      case 'document':
        return <FileText className="h-10 w-10 text-indigo-500" />;
      case 'text':
        return <FileText className="h-10 w-10 text-gray-500" />;
      case 'spreadsheet':
        return <FileText className="h-10 w-10 text-green-500" />;
      case 'audio':
        return <File className="h-10 w-10 text-purple-500" />;
      default:
        return <File className="h-10 w-10 text-gray-400" />;
    }
  };

  // Handle file operations
  const handleDeleteFile = (id: number) => {
    setFiles(prevFiles => prevFiles.filter(file => file.id !== id));
    toast.success("File deleted successfully");
  };

  const handleUpdateFile = (updatedFile: Document) => {
    setFiles(prevFiles => prevFiles.map(file => 
      file.id === updatedFile.id ? updatedFile : file
    ));
    toast.success("File updated successfully");
  };

  // Handle folder operations
  const handleDeleteFolder = (id: number) => {
    const deleteFolderById = (folderList: Folder[]): Folder[] => {
      return folderList.filter(folder => {
        if (folder.id === id) {
          return false;
        }
        if (folder.subfolders) {
          folder.subfolders = deleteFolderById(folder.subfolders);
        }
        return true;
      });
    };
    
    setFolders(deleteFolderById(folders));
    toast.success("Folder deleted successfully");
  };

  // Render a folder with its subfolders
  const renderFolder = (folder: Folder, depth = 0) => {
    return (
      <div key={folder.id} className="mb-2">
        <Card className={`overflow-hidden hover:border-mediator-300 transition-colors cursor-pointer ${depth > 0 ? 'ml-6' : ''}`}>
          <CardContent className="p-4 flex items-center gap-3">
            <div 
              className="cursor-pointer" 
              onClick={() => toggleFolder(folder.id)}
            >
              {folder.subfolders?.length ? (
                folder.isOpen ? 
                  <ChevronDown className="h-5 w-5" /> : 
                  <ChevronRight className="h-5 w-5" />
              ) : null}
            </div>
            <FolderArchive className="h-12 w-12 text-mediator-400" />
            <div className="flex-1" onClick={() => toggleFolder(folder.id)}>
              <h3 className="font-medium">{folder.name}</h3>
              <p className="text-sm text-muted-foreground">{folder.files} files</p>
            </div>
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="icon" title="Share" onClick={(e) => {
                e.stopPropagation();
                toast.success(`Shared folder: ${folder.name}`);
              }}>
                <Share className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" title="Edit" onClick={(e) => {
                e.stopPropagation();
                toast.success(`Editing folder: ${folder.name}`);
              }}>
                <Pencil className="h-4 w-4" />
              </Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="text-destructive" 
                    title="Delete"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Trash className="h-4 w-4" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will permanently delete the folder "{folder.name}" and all its contents.
                      This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={() => handleDeleteFolder(folder.id)}>
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </CardContent>
        </Card>
        
        {folder.isOpen && folder.subfolders?.map(subfolder => (
          renderFolder(subfolder, depth + 1)
        ))}
      </div>
    );
  };

  return (
    <Layout>
      <div className="flex flex-col space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Storage</h1>
            <p className="text-muted-foreground">
              Manage and organize your mediation documents.
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="flex gap-2">
              <FolderPlus className="h-4 w-4" />
              New Folder
            </Button>
            <Button className="flex gap-2">
              <Upload className="h-4 w-4" />
              Upload
            </Button>
          </div>
        </div>
        
        {/* Storage usage */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle>Storage Overview</CardTitle>
            <CardDescription>Monitor your storage usage</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-8">
              <div className="flex-1">
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium">Used Storage</span>
                  <span className="text-sm text-muted-foreground">250 MB of 5 GB</span>
                </div>
                <Progress value={5} className="h-2" />
                <p className="text-xs text-muted-foreground mt-2">
                  You're using 5% of your storage space
                </p>
              </div>
              <div className="flex-1">
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 rounded-full bg-blue-500"></div>
                    <span className="text-sm">Documents (40%)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 rounded-full bg-green-500"></div>
                    <span className="text-sm">Images (25%)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 rounded-full bg-purple-500"></div>
                    <span className="text-sm">Audio (20%)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 rounded-full bg-gray-500"></div>
                    <span className="text-sm">Other (15%)</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* File browser */}
        <Card>
          <CardHeader>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <CardTitle>Files</CardTitle>
                <CardDescription>Browse and manage your files</CardDescription>
              </div>
              <div className="relative w-full md:w-64">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search files..."
                  className="w-full pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2 mb-6">
              <Button
                variant={currentView === "all" ? "default" : "outline"}
                size="sm"
                onClick={() => setCurrentView("all")}
              >
                All Files
              </Button>
              <Button
                variant={currentView === "recent" ? "default" : "outline"}
                size="sm"
                onClick={() => setCurrentView("recent")}
              >
                Recent
              </Button>
              <Button
                variant={currentView === "folders" ? "default" : "outline"}
                size="sm"
                onClick={() => setCurrentView("folders")}
              >
                Folders
              </Button>
            </div>
            
            {currentView === "folders" ? (
              <div className="space-y-2">
                {folders.map(folder => renderFolder(folder))}
                <Card className="overflow-hidden border-dashed hover:border-mediator-300 transition-colors cursor-pointer">
                  <CardContent className="p-4 flex flex-col items-center justify-center h-full">
                    <FolderPlus className="h-12 w-12 text-muted-foreground mb-2" />
                    <p className="text-sm font-medium">New Folder</p>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <>
                {filteredFiles.length > 0 ? (
                  <div className="rounded-md border">
                    <div className="grid grid-cols-12 gap-2 p-4 bg-muted/50 text-sm font-medium">
                      <div className="col-span-6">Name</div>
                      <div className="col-span-2">Size</div>
                      <div className="col-span-3">Last Modified</div>
                      <div className="col-span-1"></div>
                    </div>
                    <div className="divide-y">
                      {filteredFiles.map((file) => (
                        <div key={file.id} className="grid grid-cols-12 gap-2 p-4 items-center hover:bg-muted/50 transition-colors">
                          <div className="col-span-6 flex items-center gap-3">
                            {getFileIcon(file.type)}
                            <div>
                              <div className="font-medium">{file.name}</div>
                              <div className="text-xs text-muted-foreground">{file.case}</div>
                            </div>
                          </div>
                          <div className="col-span-2 text-sm text-muted-foreground">
                            {file.size}
                          </div>
                          <div className="col-span-3 text-sm text-muted-foreground">
                            {formatDate(file.lastModified)}
                          </div>
                          <div className="col-span-1 flex justify-end">
                            <div className="flex items-center gap-1">
                              <Button variant="ghost" size="icon" title="Share" onClick={() => {
                                toast.success(`Shared file: ${file.name}`);
                              }}>
                                <Share className="h-4 w-4" />
                              </Button>
                              <EditDocumentDialog 
                                document={{
                                  id: file.id,
                                  name: file.name,
                                  type: file.type,
                                  matter: file.case,
                                  size: file.size,
                                  createdAt: file.lastModified,
                                }}
                                onSave={(updatedDoc) => handleUpdateFile({
                                  ...file,
                                  name: updatedDoc.name,
                                  type: updatedDoc.type,
                                  case: updatedDoc.matter
                                })}
                                onDelete={handleDeleteFile}
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-10 text-muted-foreground">
                    <HardDrive className="mx-auto h-10 w-10 mb-2" />
                    <h3 className="font-medium">No files found</h3>
                    <p className="text-sm mt-1">
                      {searchTerm ? "Try adjusting your search term." : "Upload your first file to get started."}
                    </p>
                    {!searchTerm && (
                      <Button className="mt-4">
                        <Upload className="mr-2 h-4 w-4" />
                        Upload Files
                      </Button>
                    )}
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default StoragePage;
