import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Clock, FileText } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { getAllItems } from "@/services/localDbService";

// Mock data for upcoming mediations
const upcomingMediationsMock = [
  {
    id: 1,
    title: "Smith vs. Johnson Mediation",
    date: "2023-06-15T10:00:00",
    participants: ["John Smith", "Sarah Johnson"],
    location: "Conference Room A",
    caseFileNumber: "CF-2023-001"
  },
  {
    id: 2,
    title: "Property Dispute Resolution",
    date: "2023-06-16T14:30:00",
    participants: ["Michael Brown", "Jennifer Davis"],
    location: "Virtual Meeting",
    caseFileNumber: "CF-2023-002"
  },
  {
    id: 3,
    title: "Employment Contract Negotiation",
    date: "2023-06-18T09:00:00",
    participants: ["Robert Wilson", "Emily Taylor", "Corporate Rep"],
    location: "Conference Room B",
    caseFileNumber: "CF-2023-003"
  },
];

export function UpcomingMediations() {
  const isMobile = useIsMobile();
  const [upcomingMediations, setUpcomingMediations] = useState(upcomingMediationsMock);
  const [matters, setMatters] = useState<any[]>([]);

  // Load matters from IndexedDB to get the ID for each caseFileNumber
  useEffect(() => {
    const loadMatters = async () => {
      try {
        const mattersData = await getAllItems('matters');
        setMatters(mattersData);
      } catch (error) {
        console.error('Error loading matters:', error);
      }
    };
    loadMatters();
  }, []);

  // Format date in a readable way
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  // Format time from date string
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  // Find the case ID by caseFileNumber
  const getCaseIdByCaseFileNumber = (caseFileNumber: string) => {
    const matter = matters.find(m => m.caseFileNumber === caseFileNumber);
    return matter ? matter.id : null;
  };

  return (
    <Card>
      <CardHeader className={isMobile ? "pb-2" : ""}>
        <CardTitle className={isMobile ? "text-lg" : ""}>Upcoming Mediations</CardTitle>
        <CardDescription>Your scheduled mediation sessions</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {upcomingMediations.map((mediation) => {
            const caseId = getCaseIdByCaseFileNumber(mediation.caseFileNumber);
            return (
              <Link 
                to={`/case-files/${caseId}/summary`}
                key={mediation.id}
                className="block"
              >
                <div
                  className={`flex flex-col rounded-lg border ${isMobile ? 'p-2' : 'p-4'} hover:bg-muted/50 cursor-pointer transition-colors`}
                >
                  <h3 className={`font-medium ${isMobile ? 'text-sm' : ''}`}>
                    {mediation.title}
                  </h3>
                  <div className="flex flex-wrap items-center gap-2 mt-1">
                    <div className={`flex items-center ${isMobile ? 'text-xs' : 'text-sm'} text-muted-foreground gap-1`}>
                      <Calendar className={`${isMobile ? 'h-3 w-3' : 'h-4 w-4'}`} />
                      <span>{formatDate(mediation.date)}</span>
                    </div>
                    <div className={`flex items-center ${isMobile ? 'text-xs' : 'text-sm'} text-muted-foreground gap-1`}>
                      <Clock className={`${isMobile ? 'h-3 w-3' : 'h-4 w-4'}`} />
                      <span>{formatTime(mediation.date)}</span>
                    </div>
                    <div className={`flex items-center ${isMobile ? 'text-xs' : 'text-sm'} text-muted-foreground gap-1`}>
                      <FileText className={`${isMobile ? 'h-3 w-3' : 'h-4 w-4'}`} />
                      <span>{mediation.caseFileNumber}</span>
                    </div>
                  </div>
                  
                  {/* Only show participants and location on desktop */}
                  {!isMobile && (
                    <div className="flex flex-col sm:flex-row justify-between mt-2">
                      <div className="text-sm text-muted-foreground">
                        {mediation.participants.length} participants
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {mediation.location}
                      </div>
                    </div>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
