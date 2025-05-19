import React, { useState, useEffect } from "react";
import { Layout } from "@/components/layout/layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link, useParams } from "react-router-dom";
import { ChevronLeft, MessageSquare, Calendar, Clock, Users, Plus, MoreHorizontal, MapPin } from "lucide-react";
import { getItem, putItem, getItemsByIndex, deleteItem } from "@/services/localDbService";
import { toast } from "sonner";
import { Separator } from "@/components/ui/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { useIsMobile } from "@/hooks/use-mobile";

interface Meeting {
  id: string;
  caseId: string;
  title: string;
  date: string; // ISO date string
  time: string;
  duration: string;
  location: string;
  participants: string[];
  agenda: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

interface Matter {
  id: string;
  title: string;
  caseFileNumber?: string;
}

const MeetingsPage = () => {
  const { id: caseId } = useParams<{ id: string }>();
  const [matter, setMatter] = useState<Matter | null>(null);
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isNewMeetingDialogOpen, setIsNewMeetingDialogOpen] = useState(false);
  const [newMeeting, setNewMeeting] = useState<Partial<Meeting>>({
    caseId: caseId || '',
    title: '',
    date: new Date().toISOString().split('T')[0],
    time: '10:00',
    duration: '60',
    location: 'Virtual Meeting',
    participants: [],
    agenda: '',
    notes: '',
  });
  const isMobile = useIsMobile();

  // Load matter details
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

  // Load meetings for this case
  useEffect(() => {
    const loadMeetings = async () => {
      if (!caseId) return;
      
      try {
        // Assuming you have an index for meetings by caseId
        const meetingsData = await getItemsByIndex('meetings', 'by-caseId', caseId);
        
        // Sort meetings by date (newest first)
        const sortedMeetings = meetingsData.sort((a, b) => 
          new Date(b.date).getTime() - new Date(a.date).getTime()
        );
        
        setMeetings(sortedMeetings);
      } catch (e) {
        console.error("Error loading meetings:", e);
        toast.error("Failed to load meetings");
        setMeetings([]);
      }
    };
    
    loadMeetings();
  }, [caseId]);

  const handleCreateMeeting = async () => {
    if (!caseId) {
      console.error("Case ID is missing.");
      toast.error("Cannot create meeting: Case ID is missing.");
      return;
    }
    
    // Basic validation
    if (!newMeeting.title || !newMeeting.date || !newMeeting.time || !newMeeting.duration) {
      console.error("Validation failed: Missing required meeting details.", newMeeting);
      toast.error("Please fill in all required meeting details (Title, Date, Time, Duration).");
      return;
    }

    try {
      const now = new Date().toISOString();
      const meetingToCreate: Meeting = {
        id: crypto.randomUUID(),
        caseId,
        title: newMeeting.title || 'Untitled Meeting', // Provide default if empty
        date: newMeeting.date,
        time: newMeeting.time,
        duration: newMeeting.duration,
        location: newMeeting.location || 'Not specified', // Provide default
        participants: newMeeting.participants || [],
        agenda: newMeeting.agenda || '',
        notes: newMeeting.notes || '', // Ensure notes is always a string
        createdAt: now,
        updatedAt: now,
      };
      
      console.log("Attempting to put item into database:", meetingToCreate);
      await putItem('meetings', meetingToCreate);
      console.log("Item successfully put into database.");
      
      // Update the meetings list, maintaining sort order (newest first by date)
      setMeetings(prev => {
        const updatedMeetings = [meetingToCreate, ...prev];
        const sortedMeetings = updatedMeetings.sort((a, b) => 
          new Date(b.date).getTime() - new Date(a.date).getTime()
        );
        console.log("Meetings state updated and sorted:", sortedMeetings);
        return sortedMeetings;
      });
      
      // Reset form and close dialog
      setNewMeeting({
        caseId: caseId || '',
        title: '',
        date: new Date().toISOString().split('T')[0],
        time: '10:00',
        duration: '60',
        location: 'Virtual Meeting',
        participants: [],
        agenda: '',
        notes: '',
      });
      setIsNewMeetingDialogOpen(false);
      
      toast.success("Meeting created successfully");
    } catch (e) {
      console.error("Error creating meeting:", e);
      toast.error("Failed to create meeting");
    }
  };

  const handleDeleteMeeting = async (meetingId: string) => {
    try {
      // Delete the meeting from the database
      await deleteItem('meetings', meetingId);
      
      // Update the meetings list
      setMeetings(prev => prev.filter(meeting => meeting.id !== meetingId));
      
      toast.success("Meeting deleted");
    } catch (e) {
      console.error("Error deleting meeting:", e);
      toast.error("Failed to delete meeting");
    }
  };

  const formatDate = (dateString: string) => {
    try {
      const options: Intl.DateTimeFormatOptions = { 
        weekday: 'long',
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
    return <Layout><div className="p-4 md:p-6">Loading meetings...</div></Layout>;
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
              {/* Link back to the main case files list page */}
              <Link to="/case-files">
                <ChevronLeft className={iconSizeClass} />
              </Link>
            </Button>
            <div>
              <h1 className={`${isMobile ? "text-xl" : "text-3xl"} font-bold tracking-tight`}>Meetings</h1>
              <div className={`${isMobile ? "text-xs" : "text-sm"} text-muted-foreground`}>
                {matter.title} • {matter.caseFileNumber || matter.id}
              </div>
            </div>
          </div>
          <Dialog open={isNewMeetingDialogOpen} onOpenChange={setIsNewMeetingDialogOpen}>
            <DialogTrigger asChild>
              <Button size={isMobile ? "sm" : "default"}>
                <Plus className={`${iconSizeClass} mr-1.5`} />
                {isMobile ? "New" : "New Meeting"}
              </Button>
            </DialogTrigger>
            <DialogContent className={isMobile ? "max-w-[95vw] p-4" : "sm:max-w-[525px]"}>
              <DialogHeader>
                <DialogTitle className={isMobile ? "text-base" : ""}>Create New Meeting</DialogTitle>
                <DialogDescription>
                  Add a new meeting for this case file
                </DialogDescription>
              </DialogHeader>
              
              <div className={`grid ${isMobile ? "gap-3 py-3" : "gap-4 py-4"}`}>
                <div className="grid gap-1.5">
                  <Label htmlFor="title" className={isMobile ? "text-xs" : ""}>Title *</Label>
                  <Input
                    id="title"
                    value={newMeeting.title}
                    onChange={(e) => setNewMeeting(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="E.g., Initial Consultation"
                    className={`${isMobile ? "h-8 text-xs" : "h-9 text-sm"}`}
                    required // Add basic HTML validation
                  />
                </div>
                
                <div className={`grid grid-cols-2 ${isMobile ? "gap-2" : "gap-4"}`}>
                  <div className="grid gap-1.5">
                    <Label htmlFor="date" className={isMobile ? "text-xs" : ""}>Date *</Label>
                    <Input
                      id="date"
                      type="date"
                      value={newMeeting.date}
                      onChange={(e) => setNewMeeting(prev => ({ ...prev, date: e.target.value }))}
                      className={`${isMobile ? "h-8 text-xs" : "h-9 text-sm"}`}
                      required
                    />
                  </div>
                  <div className="grid gap-1.5">
                    <Label htmlFor="time" className={isMobile ? "text-xs" : ""}>Time *</Label>
                    <Input
                      id="time"
                      type="time"
                      value={newMeeting.time}
                      onChange={(e) => setNewMeeting(prev => ({ ...prev, time: e.target.value }))}
                      className={`${isMobile ? "h-8 text-xs" : "h-9 text-sm"}`}
                      required
                    />
                  </div>
                </div>
                
                <div className={`grid grid-cols-2 ${isMobile ? "gap-2" : "gap-4"}`}>
                  <div className="grid gap-1.5">
                    <Label htmlFor="duration" className={isMobile ? "text-xs" : ""}>Duration (minutes) *</Label>
                    <Input
                      id="duration"
                      type="number"
                      value={newMeeting.duration}
                      onChange={(e) => setNewMeeting(prev => ({ ...prev, duration: e.target.value }))}
                      className={`${isMobile ? "h-8 text-xs" : "h-9 text-sm"}`}
                      min="1" // Ensure positive duration
                      required
                    />
                  </div>
                  <div className="grid gap-1.5">
                    <Label htmlFor="location" className={isMobile ? "text-xs" : ""}>Location</Label>
                    <Input
                      id="location"
                      value={newMeeting.location}
                      onChange={(e) => setNewMeeting(prev => ({ ...prev, location: e.target.value }))}
                      placeholder="E.g., Office, Zoom, etc."
                      className={`${isMobile ? "h-8 text-xs" : "h-9 text-sm"}`}
                    />
                  </div>
                </div>
                
                <div className="grid gap-1.5">
                  <Label htmlFor="participants" className={isMobile ? "text-xs" : ""}>Participants (comma-separated)</Label>
                  <Input
                    id="participants"
                    value={newMeeting.participants?.join(', ') || ''}
                    onChange={(e) => setNewMeeting(prev => ({ 
                      ...prev, 
                      participants: e.target.value.split(',').map(p => p.trim()).filter(p => p)
                    }))}
                    placeholder="E.g., John Smith, Jane Doe"
                    className={`${isMobile ? "h-8 text-xs" : "h-9 text-sm"}`}
                  />
                </div>
                
                <div className="grid gap-1.5">
                  <Label htmlFor="agenda" className={isMobile ? "text-xs" : ""}>Agenda</Label>
                  <Textarea
                    id="agenda"
                    value={newMeeting.agenda}
                    onChange={(e) => setNewMeeting(prev => ({ ...prev, agenda: e.target.value }))}
                    placeholder="Meeting agenda items..."
                    className={`min-h-[${isMobile ? "60px" : "80px"}] ${isMobile ? "text-xs" : "text-sm"}`}
                  />
                </div>
              </div>
              
              <DialogFooter className={isMobile ? "flex-col space-y-2" : ""}>
                <Button variant="outline" size={isMobile ? "sm" : "default"} onClick={() => setIsNewMeetingDialogOpen(false)}>Cancel</Button>
                <Button size={isMobile ? "sm" : "default"} onClick={handleCreateMeeting}>Create Meeting</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Upcoming/Past Meetings */}
        <div className={isMobile ? "space-y-4" : "space-y-6"}>
          {/* Upcoming Meetings Section */}
          <div>
            <h2 className={`${isMobile ? "text-lg" : "text-xl"} font-semibold mb-3 md:mb-4`}>Upcoming Meetings</h2>
            <div className="grid gap-3 md:gap-4">
              {meetings
                .filter(meeting => new Date(meeting.date) >= new Date(new Date().setHours(0,0,0,0)))
                .length > 0 ? (
                meetings
                  .filter(meeting => new Date(meeting.date) >= new Date(new Date().setHours(0,0,0,0)))
                  .map(meeting => (
                    <Card key={meeting.id} className="transition-all hover:shadow-md">
                      <CardContent className="p-0">
                        <div className={`flex flex-col ${isMobile ? "" : "md:flex-row"}`}>
                          <div className={`bg-primary-50 text-primary ${isMobile ? "p-3" : "p-4"} text-center ${isMobile ? "" : "md:w-1/5"}`}>
                            <div className={`${isMobile ? "text-xs" : "text-sm"} font-medium`}>
                              {meeting.date ? new Date(meeting.date).toLocaleDateString('en-US', { month: 'short' }) : 'N/A'}
                            </div>
                            <div className={`${isMobile ? "text-xl" : "text-2xl"} font-bold`}>
                              {meeting.date ? new Date(meeting.date).getDate() : 'N/A'}
                            </div>
                            <div className={`${isMobile ? "text-xs" : "text-sm"}`}>
                              {meeting.time || 'N/A'}
                            </div>
                          </div>
                          <div className={`${isMobile ? "p-3" : "p-4"} flex-grow`}>
                            <div className="flex justify-between items-start">
                              <h3 className={`font-medium ${isMobile ? "text-sm" : "text-lg"}`}>{meeting.title}</h3>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size={isMobile ? "sm" : "icon"} className={isMobile ? "h-8 w-8 p-0" : ""}>
                                    <MoreHorizontal className={iconSizeClass} />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem>View Details</DropdownMenuItem>
                                  <DropdownMenuItem>Edit Meeting</DropdownMenuItem>
                                  <DropdownMenuItem 
                                    className="text-destructive"
                                    onClick={() => handleDeleteMeeting(meeting.id)}
                                  >
                                    Delete
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                            <div className={`space-y-1.5 ${isMobile ? "mt-1.5" : "mt-2"}`}>
                              <div className={`flex items-center ${isMobile ? "text-xs" : "text-sm"}`}>
                                <Clock className={`${iconSizeClass} mr-1.5 text-muted-foreground`} />
                                <span>Duration: {meeting.duration} minutes</span>
                              </div>
                              <div className={`flex items-center ${isMobile ? "text-xs" : "text-sm"}`}>
                                <MapPin className={`${iconSizeClass} mr-1.5 text-muted-foreground`} />
                                <span>{meeting.location}</span>
                              </div>
                              {meeting.participants && meeting.participants.length > 0 && (
                                <div className={`flex items-center ${isMobile ? "text-xs" : "text-sm"}`}>
                                  <Users className={`${iconSizeClass} mr-1.5 text-muted-foreground`} />
                                  <span className="line-clamp-1">{meeting.participants.join(', ')}</span>
                                </div>
                              )}
                              {meeting.agenda && (
                                <div>
                                  <div className={`${isMobile ? "text-[10px]" : "text-xs"} font-medium text-muted-foreground mt-1.5`}>AGENDA</div>
                                  <p className={`${isMobile ? "text-xs" : "text-sm"} line-clamp-2 mt-0.5`}>{meeting.agenda}</p>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
              ) : (
                <div className={`text-center ${isMobile ? "p-4" : "p-6"} bg-muted rounded-md`}>
                  <p className={`text-muted-foreground ${isMobile ? "text-xs" : ""}`}>No upcoming meetings scheduled</p>
                  <Button 
                    variant="outline" 
                    size={isMobile ? "sm" : "default"}
                    className="mt-2"
                    onClick={() => setIsNewMeetingDialogOpen(true)}
                  >
                    <Plus className={`${iconSizeClass} mr-1.5`} />
                    Schedule Meeting
                  </Button>
                </div>
              )}
            </div>
          </div>
          
          <Separator className="my-1.5" />
          
          {/* Past Meetings Section */}
          <div>
            <h2 className={`${isMobile ? "text-lg" : "text-xl"} font-semibold mb-3 md:mb-4`}>Past Meetings</h2>
            <div className="grid gap-3 md:gap-4">
              {meetings
                .filter(meeting => new Date(meeting.date) < new Date(new Date().setHours(0,0,0,0)))
                .length > 0 ? (
                meetings
                  .filter(meeting => new Date(meeting.date) < new Date(new Date().setHours(0,0,0,0)))
                  .map(meeting => (
                    <Card key={meeting.id} className="bg-muted/50">
                      <CardContent className="p-0">
                        <div className={`flex flex-col ${isMobile ? "" : "md:flex-row"}`}>
                          <div className={`bg-muted ${isMobile ? "p-3" : "p-4"} text-center ${isMobile ? "" : "md:w-1/5"}`}>
                            <div className={`${isMobile ? "text-xs" : "text-sm"} font-medium`}>
                              {meeting.date ? new Date(meeting.date).toLocaleDateString('en-US', { month: 'short' }) : 'N/A'}
                            </div>
                            <div className={`${isMobile ? "text-xl" : "text-2xl"} font-bold`}>
                              {meeting.date ? new Date(meeting.date).getDate() : 'N/A'}
                            </div>
                            <div className={`${isMobile ? "text-xs" : "text-sm"}`}>
                              {meeting.time || 'N/A'}
                            </div>
                          </div>
                          <div className={`${isMobile ? "p-3" : "p-4"} flex-grow`}>
                            <div className="flex justify-between items-start">
                              <h3 className={`font-medium ${isMobile ? "text-sm" : "text-lg"}`}>{meeting.title}</h3>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size={isMobile ? "sm" : "icon"} className={isMobile ? "h-8 w-8 p-0" : ""}>
                                    <MoreHorizontal className={iconSizeClass} />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem>View Details</DropdownMenuItem>
                                  <DropdownMenuItem>View Notes</DropdownMenuItem>
                                  <DropdownMenuItem 
                                    className="text-destructive"
                                    onClick={() => handleDeleteMeeting(meeting.id)}
                                  >
                                    Delete
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                            <div className={`${isMobile ? "mt-1.5" : "mt-2"} space-y-1.5`}>
                              {meeting.notes ? (
                                <div>
                                  <div className={`${isMobile ? "text-[10px]" : "text-xs"} font-medium text-muted-foreground`}>MEETING NOTES</div>
                                  <p className={`${isMobile ? "text-xs" : "text-sm"} mt-0.5 line-clamp-2`}>{meeting.notes}</p>
                                </div>
                              ) : (
                                <Button variant="link" className={`p-0 h-auto ${isMobile ? "text-xs" : "text-sm"}`}>
                                  + Add meeting notes
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
              ) : (
                <div className={`text-center ${isMobile ? "p-4" : "p-6"} bg-muted rounded-md`}>
                  <p className={`text-muted-foreground ${isMobile ? "text-xs" : ""}`}>No past meetings</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default MeetingsPage;