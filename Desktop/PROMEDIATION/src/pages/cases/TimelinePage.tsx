import React, { useState, useEffect } from "react";
import { Layout } from "@/components/layout/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link, useParams } from "react-router-dom";
import { ChevronLeft, Clock, Plus, Calendar, MessageSquare, FileText, CheckSquare, User } from "lucide-react";
import { getItem } from "@/services/localDbService";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useIsMobile } from "@/hooks/use-mobile";

interface Matter {
  id: string;
  title: string;
  status: string;
  caseFileNumber?: string;
}

// Mock data for timeline events
const mockTimelineEvents = [
  {
    id: "event-1",
    type: "meeting",
    title: "Initial Consultation",
    date: "2025-03-15",
    description: "First meeting with client to discuss the case.",
    icon: "MessageSquare"
  },
  {
    id: "event-2",
    type: "document",
    title: "Agreement to Mediate Signed",
    date: "2025-03-20",
    description: "Client signed the agreement to mediate document.",
    icon: "FileText"
  },
  {
    id: "event-3",
    type: "task",
    title: "Financial Disclosure Requested",
    date: "2025-03-25",
    description: "Requested financial documents from client.",
    icon: "CheckSquare"
  },
  {
    id: "event-4",
    type: "meeting",
    title: "Joint Session",
    date: "2025-04-05",
    description: "Joint mediation session with all parties.",
    icon: "MessageSquare"
  },
  {
    id: "event-5",
    type: "document",
    title: "Statement of Means Received",
    date: "2025-04-10",
    description: "Received completed Statement of Means from client.",
    icon: "FileText"
  }
];

const TimelinePage = () => {
  const { id: caseId } = useParams<{ id: string }>();
  const [matter, setMatter] = useState<Matter | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timelineEvents, setTimelineEvents] = useState(mockTimelineEvents);
  const [isNewEventDialogOpen, setIsNewEventDialogOpen] = useState(false);
  const [newEvent, setNewEvent] = useState({
    type: "meeting",
    title: "",
    date: new Date().toISOString().split('T')[0],
    description: ""
  });
  const isMobile = useIsMobile();

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

  const handleAddEvent = () => {
    const eventIcon = 
      newEvent.type === "meeting" ? "MessageSquare" :
      newEvent.type === "document" ? "FileText" :
      newEvent.type === "task" ? "CheckSquare" : "Calendar";

    const event = {
      id: `event-${Date.now()}`,
      ...newEvent,
      icon: eventIcon
    };

    setTimelineEvents(prev => [...prev, event].sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    ));
    
    setNewEvent({
      type: "meeting",
      title: "",
      date: new Date().toISOString().split('T')[0],
      description: ""
    });

    setIsNewEventDialogOpen(false);
    toast.success("Event added to timeline");
  };

  const getEventIcon = (iconName: string) => {
    switch (iconName) {
      case "MessageSquare":
        return <MessageSquare className="h-5 w-5 text-green-500" />;
      case "FileText":
        return <FileText className="h-5 w-5 text-blue-500" />;
      case "CheckSquare":
        return <CheckSquare className="h-5 w-5 text-purple-500" />;
      case "User":
        return <User className="h-5 w-5 text-orange-500" />;
      default:
        return <Calendar className="h-5 w-5 text-gray-500" />;
    }
  };

  const formatDate = (dateString: string) => {
    try {
      const options: Intl.DateTimeFormatOptions = { 
        day: 'numeric', 
        month: 'long', 
        year: 'numeric' 
      };
      return new Date(dateString).toLocaleDateString(undefined, options);
    } catch (e) {
      return "Invalid date";
    }
  };

  if (isLoading) {
    return <Layout><div className="p-4 md:p-6">Loading timeline...</div></Layout>;
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

  const iconSizeClass = isMobile ? "h-3.5 w-3.5" : "h-4 w-4";
  const timelineIconSizeClass = isMobile ? "h-4 w-4" : "h-5 w-5";

  return (
    <Layout>
      <div className={`flex flex-col ${isMobile ? "space-y-4" : "space-y-6"} p-4 md:p-6`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 md:space-x-4">
            <Button variant="outline" size="icon" asChild>
              <Link to="/case-files">
                <ChevronLeft className={iconSizeClass} />
              </Link>
            </Button>
            <div>
              <h1 className={`${isMobile ? "text-xl" : "text-3xl"} font-bold tracking-tight`}>Timeline</h1>
              <div className={`${isMobile ? "text-xs" : "text-sm"} text-muted-foreground`}>
                {matter.title} • {matter.caseFileNumber || matter.id}
              </div>
            </div>
          </div>
          <Dialog open={isNewEventDialogOpen} onOpenChange={setIsNewEventDialogOpen}>
            <DialogTrigger asChild>
              <Button size={isMobile ? "sm" : "default"}>
                <Plus className={`${iconSizeClass} mr-1.5`} />
                {isMobile ? "Add" : "Add Event"}
              </Button>
            </DialogTrigger>
            <DialogContent className={isMobile ? "max-w-[95vw] p-4" : "sm:max-w-[525px]"}>
              <DialogHeader>
                <DialogTitle className={isMobile ? "text-base" : ""}>Add Timeline Event</DialogTitle>
                <DialogDescription>
                  Add a new event to the case timeline
                </DialogDescription>
              </DialogHeader>
              
              <div className={`grid ${isMobile ? "gap-3 py-3" : "gap-4 py-4"}`}>
                <div className="grid gap-1.5">
                  <Label htmlFor="eventType" className={isMobile ? "text-xs" : ""}>Event Type</Label>
                  <Select 
                    value={newEvent.type} 
                    onValueChange={(value) => setNewEvent(prev => ({ ...prev, type: value }))}
                  >
                    <SelectTrigger className={`${isMobile ? "h-8 text-xs" : "h-9 text-sm"}`}>
                      <SelectValue placeholder="Select event type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="meeting">Meeting</SelectItem>
                      <SelectItem value="document">Document</SelectItem>
                      <SelectItem value="task">Task</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="grid gap-1.5">
                  <Label htmlFor="title" className={isMobile ? "text-xs" : ""}>Event Title</Label>
                  <Input
                    id="title"
                    value={newEvent.title}
                    onChange={(e) => setNewEvent(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="E.g., Initial Consultation"
                    className={`${isMobile ? "h-8 text-xs" : "h-9 text-sm"}`}
                  />
                </div>
                
                <div className="grid gap-1.5">
                  <Label htmlFor="date" className={isMobile ? "text-xs" : ""}>Date</Label>
                  <Input
                    id="date"
                    type="date"
                    value={newEvent.date}
                    onChange={(e) => setNewEvent(prev => ({ ...prev, date: e.target.value }))}
                    className={`${isMobile ? "h-8 text-xs" : "h-9 text-sm"}`}
                  />
                </div>
                
                <div className="grid gap-1.5">
                  <Label htmlFor="description" className={isMobile ? "text-xs" : ""}>Description</Label>
                  <Textarea
                    id="description"
                    value={newEvent.description}
                    onChange={(e) => setNewEvent(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Briefly describe this event..."
                    className={`min-h-[${isMobile ? "60px" : "80px"}] ${isMobile ? "text-xs" : "text-sm"}`}
                  />
                </div>
              </div>
              
              <DialogFooter className={isMobile ? "flex-col space-y-2" : ""}>
                <Button variant="outline" size={isMobile ? "sm" : "default"} onClick={() => setIsNewEventDialogOpen(false)}>Cancel</Button>
                <Button size={isMobile ? "sm" : "default"} onClick={handleAddEvent}>Add to Timeline</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardHeader className={isMobile ? "p-4" : ""}>
            <CardTitle className={`flex items-center ${isMobile ? "text-base" : ""}`}>
              <Clock className={`${timelineIconSizeClass} mr-2`} />
              Case Timeline
            </CardTitle>
          </CardHeader>
          <CardContent className={isMobile ? "p-4 pt-0" : ""}>
            <div className={`relative ${isMobile ? "pl-6" : "pl-8"} border-l-2 border-border ${isMobile ? "space-y-6" : "space-y-8"} py-2`}>
              {timelineEvents.map((event, index) => (
                <div key={event.id} className="relative">
                  <div className={`absolute ${isMobile ? "-left-[20px]" : "-left-[25px]"} p-1 rounded-full bg-background border-2 border-border`}>
                    {isMobile ? (
                      <div className="h-4 w-4 flex items-center justify-center">
                        {getEventIcon(event.icon)}
                      </div>
                    ) : (
                      getEventIcon(event.icon)
                    )}
                  </div>
                  
                  <div className={`bg-muted/40 rounded-lg ${isMobile ? "p-3" : "p-4"} hover:shadow-sm transition-shadow`}>
                    <div className={`${isMobile ? "text-xs" : "text-sm"} font-normal text-muted-foreground`}>
                      {formatDate(event.date)}
                    </div>
                    <h3 className={`${isMobile ? "text-sm" : "text-lg"} font-semibold mt-1`}>{event.title}</h3>
                    <p className={`${isMobile ? "text-xs" : "text-sm"} mt-1`}>{event.description}</p>
                  </div>
                </div>
              ))}
              
              {timelineEvents.length > 0 && (
                <div className={`absolute top-0 ${isMobile ? "-left-[5px] h-3 w-3" : "-left-[7px] h-4 w-4"} rounded-full bg-primary`}></div>
              )}
              
              <div className={`absolute bottom-0 ${isMobile ? "-left-[5px] h-3 w-3" : "-left-[7px] h-4 w-4"} rounded-full bg-destructive`}></div>
            </div>
            
            {timelineEvents.length === 0 && (
              <div className={`text-center ${isMobile ? "p-4" : "p-6"}`}>
                <p className={`text-muted-foreground ${isMobile ? "text-xs" : ""}`}>No timeline events yet</p>
                <Button 
                  variant="outline" 
                  size={isMobile ? "sm" : "default"}
                  className="mt-2"
                  onClick={() => setIsNewEventDialogOpen(true)}
                >
                  <Plus className={`${iconSizeClass} mr-1.5`} />
                  Add First Event
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default TimelinePage;