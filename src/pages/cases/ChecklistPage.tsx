import React, { useState, useEffect } from "react";
import { Layout } from "@/components/layout/layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link, useParams } from "react-router-dom";
import { ChevronLeft, CheckSquare, Plus } from "lucide-react"; // Changed icon
import { getItem } from "@/services/localDbService";
import { toast } from "sonner";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useIsMobile } from "@/hooks/use-mobile";
// Import other necessary components like Checkbox, Input etc. if needed for checklist items

interface Matter {
  id: string;
  title: string;
  status: string;
  caseFileNumber?: string;
}

// Mock data for checklist items (replace with actual data fetching/structure)
const checklistItems = [
  { id: "item1", text: "Initial client consultation scheduled", completed: true, category: "intake" },
  { id: "item2", text: "Agreement to Mediate signed by Party A", completed: false, category: "agreement" },
  { id: "item3", text: "Agreement to Mediate signed by Party B", completed: false, category: "agreement" },
  { id: "item4", text: "Financial disclosure received from Party A", completed: true, category: "disclosure" },
  { id: "item5", text: "Financial disclosure received from Party B", completed: false, category: "disclosure" },
  { id: "item6", text: "Mediation session 1 scheduled", completed: false, category: "session" },
];

const ChecklistPage = () => {
  const { id: caseId } = useParams<{ id: string }>();
  const [matter, setMatter] = useState<Matter | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const isMobile = useIsMobile();
  // Add state for checklist items if needed, e.g., const [items, setItems] = useState(checklistItems);

  useEffect(() => {
    const loadMatter = async () => {
      if (!caseId) {
        setError("No case ID provided.");
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        const matterData = await getItem('matters', caseId);
        if (matterData) {
          setMatter(matterData);
          setError(null);
          // Fetch checklist items specific to this caseId here
        } else {
          setError("Case not found.");
          setMatter(null);
        }
      } catch (e) {
        console.error("Error loading matter data:", e);
        setError("Failed to load case data.");
        setMatter(null);
      } finally {
        setIsLoading(false);
      }
    };

    loadMatter();
  }, [caseId]);

  // Add functions to handle checklist item changes (toggle completion, add new item, etc.)
  const handleToggleComplete = (itemId: string) => {
    console.log("Toggle complete for:", itemId);
    // Update state and potentially save to localDbService
    toast.info(`Checklist item ${itemId} status updated.`);
  };

  const handleAddItem = () => {
      console.log("Add new checklist item");
      // Logic to add a new item
      toast.success("New checklist item added (placeholder).");
  };

  if (isLoading) {
    return <Layout><div className="p-4 md:p-6">Loading checklist...</div></Layout>;
  }

  if (error || !matter) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center h-full p-4 md:p-6">
          <h1 className={`${isMobile ? "text-xl" : "text-2xl"} font-bold mb-2`}>{error || "Case Not Found"}</h1>
          <p className="text-muted-foreground mb-4">The case you're looking for doesn't exist or couldn't be loaded.</p>
          <Button size={isMobile ? "sm" : "default"} asChild>
            <Link to="/case-files">Back to Case Files</Link>
          </Button>
        </div>
      </Layout>
    );
  }

  // Helper for icon size
  const iconSizeClass = isMobile ? "h-3.5 w-3.5" : "h-4 w-4";

  return (
    <Layout>
      <div className={`flex flex-col ${isMobile ? "space-y-4" : "space-y-6"} p-4 md:p-6`}>
        {/* Header with back button */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 md:space-x-4">
            <Button variant="outline" size="icon" asChild>
              <Link to="/case-files">
                <ChevronLeft className={iconSizeClass} />
              </Link>
            </Button>
            <div>
              <h1 className={`${isMobile ? "text-xl" : "text-3xl"} font-bold tracking-tight`}>Checklist</h1>
              <div className={`${isMobile ? "text-xs" : "text-sm"} text-muted-foreground`}>
                {matter.title} • {matter.caseFileNumber || matter.id}
              </div>
            </div>
          </div>
          <Button size={isMobile ? "sm" : "default"} onClick={handleAddItem}>
            <Plus className={`${iconSizeClass} mr-1.5`} />
            {isMobile ? "Add" : "Add Item"}
          </Button>
        </div>

        <Separator className={isMobile ? "my-1.5" : ""} />

        {/* Checklist Content Area */}
        <Card>
          <CardHeader className={isMobile ? "p-4" : ""}>
            <CardTitle className={`flex items-center ${isMobile ? "text-base" : ""}`}>
              <CheckSquare className={`${isMobile ? "h-4 w-4" : "h-5 w-5"} mr-2 text-primary`} />
              Case Checklist
            </CardTitle>
            <CardDescription>Track the progress of key tasks for this case.</CardDescription>
          </CardHeader>
          <CardContent className={isMobile ? "p-4 pt-0" : ""}>
            <div className="space-y-3">
              {checklistItems.map(item => (
                <div key={item.id} className={`flex items-center justify-between ${isMobile ? "p-2 text-sm" : "p-3"} border rounded-md hover:bg-muted/50`}>
                  <div className="flex items-center space-x-2 md:space-x-3">
                    {/* Replace with actual Checkbox component */}
                    <input
                      type="checkbox"
                      id={`item-${item.id}`}
                      checked={item.completed}
                      onChange={() => handleToggleComplete(item.id)}
                      className={`${isMobile ? "h-3.5 w-3.5" : "h-4 w-4"} text-primary focus:ring-primary border-gray-300 rounded`}
                    />
                    <label
                      htmlFor={`item-${item.id}`}
                      className={`flex-1 ${isMobile ? "text-xs" : ""} ${item.completed ? 'line-through text-muted-foreground' : ''}`}
                    >
                      {item.text}
                    </label>
                  </div>
                  <Badge variant="outline" className={isMobile ? "text-[10px] px-1.5 py-0.5 h-5" : ""}>
                    {item.category}
                  </Badge>
                </div>
              ))}
              {checklistItems.length === 0 && (
                <p className={`text-muted-foreground text-center py-4 ${isMobile ? "text-xs" : ""}`}>
                  No checklist items yet.
                </p>
              )}
            </div>
          </CardContent>
          <CardFooter className={isMobile ? "p-4 pt-0" : ""}>
            {/* Optional: Add summary or actions */}
            <p className={`${isMobile ? "text-[10px]" : "text-xs"} text-muted-foreground`}>
              {checklistItems.filter(i => i.completed).length} of {checklistItems.length} items completed.
            </p>
          </CardFooter>
        </Card>
      </div>
    </Layout>
  );
};

export default ChecklistPage;
