import React, { useState, useEffect } from "react";
import { Layout } from "@/components/layout/layout";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Link, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Users, 
  MessageSquare, 
  FileText, 
  Clock, 
  FileCheck, 
  CheckSquare, 
  ChevronRight 
} from "lucide-react";
import { getItem } from "@/services/localDbService";
import type { Matter } from "../../types/models"; // Import Matter from global types

const CaseFileSummaryPage = () => {
  const { id: caseId } = useParams<{ id: string }>();
  const [matter, setMatter] = useState<Matter | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("clientDetails");

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

  if (isLoading) {
    return <Layout><div className="p-6">Loading case summary...</div></Layout>;
  }

  if (error || !matter) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center h-full p-6">
          <h1 className="text-2xl font-bold mb-2">{error || "Case Not Found"}</h1>
          <p className="text-muted-foreground mb-4">The case you're looking for doesn't exist or couldn't be loaded.</p>
          <Button asChild>
            <Link to="/case-files">Back to Case Files</Link>
          </Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="flex flex-col space-y-6 p-4 md:p-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">{matter.title}</h1>
          <div className="flex items-center text-sm text-muted-foreground">
            <span>{matter.status}</span>
            <span className="mx-2">•</span>
            <span>Case ID: {matter.caseFileNumber || matter.id}</span>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 md:grid-cols-6 mb-4">
            <TabsTrigger value="clientDetails">Client Details</TabsTrigger>
            <TabsTrigger value="meetings">Meetings</TabsTrigger>
            <TabsTrigger value="forms">Forms</TabsTrigger>
            <TabsTrigger value="timeline">Timeline</TabsTrigger>
            <TabsTrigger value="templates">Templates</TabsTrigger>
            <TabsTrigger value="checklist">Checklist</TabsTrigger>
          </TabsList>

          <TabsContent value="clientDetails">
            <Card className="transition-all hover:shadow-md">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-medium flex items-center">
                  <Users className="h-5 w-5 mr-2 text-blue-500" />
                  Client Details
                </CardTitle>
                <CardDescription>
                  Client information and contact details
                </CardDescription>
              </CardHeader>
              <CardContent>
                {/* Mock Data Added Below */}
                <div className="space-y-2 text-sm">
                  <p><strong>Name:</strong> John Doe</p>
                  <p><strong>Email:</strong> john.doe@example.com</p>
                  <p><strong>Phone:</strong> (555) 123-4567</p>
                  <p><strong>Address:</strong> 123 Main St, Anytown, USA</p>
                  <p className="text-muted-foreground pt-2">
                    View and manage client personal information, contact details, and related parties.
                  </p>
                </div>
              </CardContent>
              <CardFooter>
                <Button asChild variant="outline" className="w-full">
                  <Link to={`/case-files/${caseId}/client-details`}>
                    View Details
                    <ChevronRight className="ml-1 h-4 w-4" />
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="meetings">
            <Card className="transition-all hover:shadow-md">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-medium flex items-center">
                  <MessageSquare className="h-5 w-5 mr-2 text-green-500" />
                  Meetings
                </CardTitle>
                <CardDescription>
                  Schedule and manage meetings
                </CardDescription>
              </CardHeader>
              <CardContent>
                {/* Mock Data Added Below */}
                <div className="space-y-2 text-sm">
                  <p><strong>Upcoming Meeting:</strong> Initial Consultation</p>
                  <p><strong>Date:</strong> 2025-06-15</p>
                  <p><strong>Time:</strong> 10:00 AM</p>
                  <p><strong>Location:</strong> Virtual Meeting Room</p>
                  <p className="text-muted-foreground pt-2">
                    Create, view and manage all meetings related to this case, including agendas and notes.
                  </p>
                </div>
              </CardContent>
              <CardFooter>
                <Button asChild variant="outline" className="w-full">
                  <Link to={`/case-files/${caseId}/meetings`}>
                    View Meetings
                    <ChevronRight className="ml-1 h-4 w-4" />
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="forms">
            <Card className="transition-all hover:shadow-md">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-medium flex items-center">
                  <FileText className="h-5 w-5 mr-2 text-amber-500" />
                  Forms
                </CardTitle>
                <CardDescription>
                  Case-related forms and documents
                </CardDescription>
              </CardHeader>
              <CardContent>
                {/* Mock Data Added Below */}
                <div className="space-y-2 text-sm">
                  <p><strong>Intake Form:</strong> Completed</p>
                  <p><strong>Agreement to Mediate:</strong> Signed by Party A, Pending Party B</p>
                  <p><strong>Financial Disclosure:</strong> Submitted</p>
                  <p className="text-muted-foreground pt-2">
                    Access intake forms, agreements to mediate, and other important documentation.
                  </p>
                </div>
              </CardContent>
              <CardFooter>
                <Button asChild variant="outline" className="w-full">
                  <Link to={`/case-files/${caseId}/forms`}>
                    View Forms
                    <ChevronRight className="ml-1 h-4 w-4" />
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="timeline">
            <Card className="transition-all hover:shadow-md">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-medium flex items-center">
                  <Clock className="h-5 w-5 mr-2 text-purple-500" />
                  Timeline
                </CardTitle>
                <CardDescription>
                  Case progression timeline
                </CardDescription>
              </CardHeader>
              <CardContent>
                {/* Mock Data Added Below */}
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li><strong>2025-05-20:</strong> Case Opened</li>
                  <li><strong>2025-05-22:</strong> Intake Form Submitted by Client</li>
                  <li><strong>2025-05-28:</strong> Initial Consultation Scheduled</li>
                </ul>
                <p className="text-muted-foreground pt-2">
                  View a chronological timeline of case events, milestones, and important dates.
                </p>
              </CardContent>
              <CardFooter>
                <Button asChild variant="outline" className="w-full">
                  <Link to={`/case-files/${caseId}/timeline`}>
                    View Timeline
                    <ChevronRight className="ml-1 h-4 w-4" />
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="templates">
            <Card className="transition-all hover:shadow-md">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-medium flex items-center">
                  <FileCheck className="h-5 w-5 mr-2 text-red-500" />
                  Templates
                </CardTitle>
                <CardDescription>
                  Document templates for this case
                </CardDescription>
              </CardHeader>
              <CardContent>
                {/* Mock Data Added Below */}
                <div className="space-y-2 text-sm">
                  <p><strong>Mediation Agreement Template:</strong> Available</p>
                  <p><strong>Parenting Plan Template:</strong> Available</p>
                  <p><strong>Asset Division Worksheet:</strong> Not Applicable</p>
                  <p className="text-muted-foreground pt-2">
                    Access and use document templates specific to this case type.
                  </p>
                </div>
              </CardContent>
              <CardFooter>
                <Button asChild variant="outline" className="w-full">
                  <Link to={`/case-files/${caseId}/templates`}>
                    View Templates
                    <ChevronRight className="ml-1 h-4 w-4" />
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="checklist">
            <Card className="transition-all hover:shadow-md">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-medium flex items-center">
                  <CheckSquare className="h-5 w-5 mr-2 text-teal-500" />
                  Checklist
                </CardTitle>
                <CardDescription>
                  Case progress checklist
                </CardDescription>
              </CardHeader>
              <CardContent>
                {/* Mock Data Added Below */}
                <ul className="space-y-1 text-sm">
                  <li><input type="checkbox" checked readOnly className="mr-2" /> Gather client information</li>
                  <li><input type="checkbox" checked readOnly className="mr-2" /> Send Agreement to Mediate</li>
                  <li><input type="checkbox" className="mr-2" /> Schedule first joint session</li>
                  <li><input type="checkbox" className="mr-2" /> Prepare draft settlement</li>
                </ul>
                <p className="text-muted-foreground pt-2">
                  Track required tasks and procedural steps for this case.
                </p>
              </CardContent>
              <CardFooter>
                <Button asChild variant="outline" className="w-full">
                  <Link to={`/case-files/${caseId}/checklist`}>
                    View Checklist
                    <ChevronRight className="ml-1 h-4 w-4" />
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default CaseFileSummaryPage;