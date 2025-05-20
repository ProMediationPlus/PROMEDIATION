import React, { useState, useEffect } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
// Assuming these form components exist and are correctly imported
// import { AgreementToMediateForm } from "@/components/forms/AgreementToMediateForm";
// import { BillingForm } from "@/components/forms/BillingForm";
// import { ClientEnquiryForm } from "@/components/forms/ClientEnquiryForm";
// import { StatementOfMeansForm } from "@/components/forms/StatementOfMeansForm";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from "@/components/ui/accordion";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Baby,
  Banknote,
  BookOpen,
  Briefcase,
  Calendar,
  Check,
  CheckSquare,
  Clock,
  DollarSign,
  ExternalLink,
  FileEdit,
  FileText,
  Heart,
  Home,
  Link2,
  MessageSquare,
  School,
  StickyNote,
  UserCircle,
  Users,
} from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger
} from "@/components/ui/collapsible";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";

// --- Schemas (assuming these are correct and potentially shared) ---
const clientIntakeSchema = z.object({
  name: z.string().optional(),
  address: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().optional(),
  dateOfBirth: z.string().optional(),
  dateOfMarriage: z.string().optional(),
  placeOfMarriage: z.string().optional(),
  dateOfSeparation: z.string().optional(),
  previousMarriage: z.boolean().optional(),
  previousMarriageDetails: z.string().optional(),
  mediatorRoleExplained: z.boolean().optional(),
  mediatorConcerns: z.string().optional(),
  termsOfMediationExplained: z.boolean().optional(),
  termsAndConditionsSigned: z.boolean().optional(),
  agreementToMediateSigned: z.boolean().optional(),
  solicitor: z.boolean().optional(),
  solicitorDetails: z.string().optional(),
  courtOrder: z.boolean().optional(),
  courtOrderDetails: z.string().optional(),
  occupation: z.string().optional(),
  employer: z.string().optional(),
  salary: z.string().optional(),
  otherAssets: z.string().optional(),
  proposalReSettlement: z.string().optional(),
  pensionDetails: z.string().optional(),
  pensionProposal: z.string().optional(),
});

const childrenSchema = z.object({
  childrenDetails: z.array(
    z.object({
      name: z.string().optional(),
      dateOfBirth: z.string().optional(),
      education: z.string().optional(),
      specialNeeds: z.string().optional(),
    })
  ).optional(),
  currentArrangements: z.string().optional(),
  futureNeeds: z.string().optional(),
  maintenanceArrangements: z.string().optional(),
  educationalCosts: z.string().optional(),
  notes: z.string().optional(),
  homeAddress: z.string().optional(),
  balanceTermRepayments: z.string().optional(),
  institution: z.string().optional(),
  equity: z.string().optional(),
  settlementProposal: z.string().optional(),
  secondPropertyDetails: z.string().optional(),
  secondPropertyProposal: z.string().optional(),
});

const fullIntakeSchema = z.object({
  caseFileNumber: z.string(),
  caseFileName: z.string(),
  partyA: clientIntakeSchema,
  partyB: clientIntakeSchema,
  children: childrenSchema,
});
// --- End Schemas ---

// --- Interfaces ---
interface Matter {
  id: string;
  title: string;
  type: string;
  status: string;
  lastUpdated: string;
  clientName: string;
  description: string;
  caseFileNumber: string;
  caseFileName: string;
  intakeForm?: z.infer<typeof fullIntakeSchema>; // Include the intake form data
}

export interface Meeting {
  id: number;
  title: string;
  date: string;
  time: string;
  duration: string;
  notes: string;
  content?: string;
}
// --- End Interfaces ---

// --- Mock Data (Keep or replace with actual data fetching) ---
const mockMeetings: Meeting[] = [
  { id: 1, title: "Initial Consultation", date: "2023-06-15", time: "10:00 AM", duration: "1 hour", notes: "Discussed division of assets and custody arrangements." },
  { id: 2, title: "Follow-up Meeting", date: "2023-06-22", time: "2:00 PM", duration: "45 minutes", notes: "Reviewed initial proposal and discussed next steps." }
];

const mockChecklist = [
  { id: 1, title: "Review settlement agreement", caseTitle: "Smith vs. Johnson", priority: "High", dueDate: "Jun 20, 2023", status: "In Progress", completed: false, },
  { id: 2, title: "Prepare financial disclosure", caseTitle: "Smith vs. Johnson", priority: "Medium", dueDate: "Jun 25, 2023", status: "Not Started", completed: false, },
];
// --- End Mock Data ---


interface MatterDetailsProps {
  matter: Matter;
  onSave?: (updatedMatter: Matter) => void; // Optional save function prop
}

// --- Component ---
export function MatterDetails({ matter, onSave }: MatterDetailsProps) {
  const [activeTab, setActiveTab] = useState("details");
  const isMobile = useIsMobile();

  // Format date for display
  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "Invalid Date";
      // Using locale 'en-GB' for dd/mm/yyyy format
      return date.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      });
    } catch (e) {
      console.error("Error formatting date:", e);
      return "Invalid Date";
    }
  };

  // Helper function for consistent mobile/desktop class application
  const getResponsiveClasses = (mobileClass: string, desktopClass: string) => {
    return isMobile ? mobileClass : desktopClass;
  };

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      {/* Tabs List: Reduced bottom margin on mobile */}
      <TabsList className={`grid ${getResponsiveClasses("grid-cols-3 gap-1 p-1 mb-4", "grid-cols-6 mb-4")} w-full h-auto`}>
        {/* Using helper for cleaner class definitions */}
        <TabsTrigger value="details" className={getResponsiveClasses("text-xs py-1.5 px-1 flex flex-col items-center h-auto", "py-2")}>
          {isMobile && <Users className="h-4 w-4 mb-1" />}
          Client Details
        </TabsTrigger>
        <TabsTrigger value="meetings" className={getResponsiveClasses("text-xs py-1.5 px-1 flex flex-col items-center h-auto", "py-2")}>
          {isMobile && <Calendar className="h-4 w-4 mb-1" />}
          Meetings
        </TabsTrigger>
        <TabsTrigger value="forms" className={getResponsiveClasses("text-xs py-1.5 px-1 flex flex-col items-center h-auto", "py-2")}>
          {isMobile && <FileText className="h-4 w-4 mb-1" />}
          Forms
        </TabsTrigger>
        <TabsTrigger value="timeline" className={getResponsiveClasses("text-xs py-1.5 px-1 flex flex-col items-center h-auto", "py-2")}>
          {isMobile && <Clock className="h-4 w-4 mb-1" />}
          Timeline
        </TabsTrigger>
        <TabsTrigger value="templates" className={getResponsiveClasses("text-xs py-1.5 px-1 flex flex-col items-center h-auto", "py-2")}>
          {isMobile && <BookOpen className="h-4 w-4 mb-1" />}
          Templates
        </TabsTrigger>
        <TabsTrigger value="checklist" className={getResponsiveClasses("text-xs py-1.5 px-1 flex flex-col items-center h-auto", "py-2")}>
          {isMobile && <CheckSquare className="h-4 w-4 mb-1" />}
          Checklist
        </TabsTrigger>
      </TabsList>

      {/* --- Tab Content Sections --- */}
      {/* Removed px-[5px] from TabsContent, relying on Card padding */}

      {/* Client Details Tab */}
      <TabsContent value="details" className="space-y-6">
        <Card>
          <CardHeader className={getResponsiveClasses("pb-2 px-3 py-3", "pb-2")}>
            <CardTitle className={`flex items-center justify-between ${getResponsiveClasses("mt-1", "")}`}>
              <div className="flex items-center gap-2">
                <Users className={`${getResponsiveClasses("h-4 w-4", "h-5 w-5")} text-primary`} />
                <span className={getResponsiveClasses("text-sm", "")}>Client Details Summary</span>
              </div>
              <Button variant="outline" size={getResponsiveClasses("sm", "default")} className={`${getResponsiveClasses("px-1.5 py-0.5 h-auto", "")} flex items-center gap-1`} asChild>
                <Link to={`/case-files/${matter.id}/client-details`}>
                  <ExternalLink className={getResponsiveClasses("h-2.5 w-2.5", "h-4 w-4")} />
                  <span className={getResponsiveClasses("text-[11px]", "text-xs")}>View Full Page</span>
                </Link>
              </Button>
            </CardTitle>
            <CardDescription className={getResponsiveClasses("text-xs", "")}>Overview of client information</CardDescription>
          </CardHeader>
          <CardContent className={getResponsiveClasses("p-3", "")}>
            <div className="space-y-4">
              {/* Party A/B: Stack on mobile, side-by-side on sm+ */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-medium mb-1">Party A</h4>
                  <p className="text-sm text-muted-foreground">{matter?.intakeForm?.partyA?.name || "Not provided"}</p>
                  <p className="text-xs text-muted-foreground">{matter?.intakeForm?.partyA?.email || "No email"}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium mb-1">Party B</h4>
                  <p className="text-sm text-muted-foreground">{matter?.intakeForm?.partyB?.name || "Not provided"}</p>
                  <p className="text-xs text-muted-foreground">{matter?.intakeForm?.partyB?.email || "No email"}</p>
                </div>
              </div>
              {/* Case File Info */}
              <div>
                <h4 className="text-sm font-medium mb-1">Case File Information</h4>
                <div className="flex gap-2 items-center flex-wrap">
                  <Badge variant="outline" className={getResponsiveClasses("text-[10px] px-1.5 py-0.5", "text-xs")}>{matter?.caseFileNumber || "No case #"}</Badge>
                  <Badge variant="outline" className={getResponsiveClasses("text-[10px] px-1.5 py-0.5", "text-xs")}>{matter?.status || "Unknown"}</Badge>
                  <Badge variant="outline" className={getResponsiveClasses("text-[10px] px-1.5 py-0.5", "text-xs")}>Updated: {formatDate(matter?.lastUpdated)}</Badge>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className={`${getResponsiveClasses("text-xs px-3 py-2", "text-xs")} text-muted-foreground`}>
            <p>Full details available on Client Details page</p>
          </CardFooter>
        </Card>
      </TabsContent>

      {/* Meetings Tab */}
      <TabsContent value="meetings">
        <Card>
          <CardHeader className={getResponsiveClasses("pb-2 px-3 py-3", "pb-2")}>
             <CardTitle className={`flex items-center justify-between ${getResponsiveClasses("mt-1", "")}`}>
              <div className="flex items-center gap-2">
                <Calendar className={`${getResponsiveClasses("h-4 w-4", "h-5 w-5")} text-primary`} />
                <span className={getResponsiveClasses("text-sm", "")}>Meetings Summary</span>
              </div>
              <Button variant="outline" size={getResponsiveClasses("sm", "default")} className={`${getResponsiveClasses("px-1.5 py-0.5 h-auto", "")} flex items-center gap-1`} asChild>
                <Link to={`/case-files/${matter.id}/meetings`}>
                  <ExternalLink className={getResponsiveClasses("h-2.5 w-2.5", "h-4 w-4")} />
                  <span className={getResponsiveClasses("text-[11px]", "text-xs")}>View Full Page</span>
                </Link>
              </Button>
            </CardTitle>
            <CardDescription className={getResponsiveClasses("text-xs", "")}>Summary of upcoming and recent meetings</CardDescription>
          </CardHeader>
          <CardContent className={getResponsiveClasses("p-3", "")}>
            {/* Example Content - Replace with actual data mapping */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium">Upcoming</h4>
                  <p className="text-sm text-muted-foreground">Next: {mockMeetings[0]?.date ? formatDate(mockMeetings[0].date) : 'N/A'}</p>
                </div>
                <Badge className={`${getResponsiveClasses("text-[10px] px-1.5 py-0.5", "text-xs")} bg-blue-100 text-blue-700`}>{mockMeetings.length} scheduled</Badge>
              </div>
              <div className="space-y-2">
                {mockMeetings.slice(0, 2).map(meeting => ( // Show first 2 meetings
                   <div key={meeting.id} className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    <div className="text-sm">
                      <span className="font-medium">{meeting.title}</span>
                      <span className="text-muted-foreground ml-2">{meeting.time}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
          <CardFooter className={`${getResponsiveClasses("text-xs px-3 py-2", "text-xs")} text-muted-foreground`}>
            <p>Full schedule available on Meetings page</p>
          </CardFooter>
        </Card>
      </TabsContent>

      {/* Forms Tab */}
      <TabsContent value="forms" className="space-y-4">
         <Card>
          <CardHeader className={getResponsiveClasses("pb-2 px-3 py-3", "pb-2")}>
            <CardTitle className={`flex items-center justify-between ${getResponsiveClasses("mt-1", "")}`}>
              <div className="flex items-center gap-2">
                <FileText className={`${getResponsiveClasses("h-4 w-4", "h-5 w-5")} text-primary`} />
                <span className={getResponsiveClasses("text-sm", "")}>Forms Status</span>
              </div>
              <Button variant="outline" size={getResponsiveClasses("sm", "default")} className={`${getResponsiveClasses("px-1.5 py-0.5 h-auto", "")} flex items-center gap-1`} asChild>
                <Link to={`/case-files/${matter.id}/forms`}>
                  <ExternalLink className={getResponsiveClasses("h-2.5 w-2.5", "h-4 w-4")} />
                  <span className={getResponsiveClasses("text-[11px]", "text-xs")}>View Full Page</span>
                </Link>
              </Button>
            </CardTitle>
            <CardDescription className={getResponsiveClasses("text-xs", "")}>Summary of form completion status</CardDescription>
          </CardHeader>
          <CardContent className={getResponsiveClasses("p-3", "")}>
            {/* Example Content - Replace with actual form status logic */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500" />
                  <span className="text-sm">Client Enquiry Form</span>
                </div>
                <Badge variant="outline" className={`${getResponsiveClasses("text-[10px] px-1.5 py-0.5", "text-xs")} bg-green-50 text-green-700 border-green-200`}>Completed</Badge>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-amber-500" />
                  <span className="text-sm">Agreement To Mediate</span>
                </div>
                <Badge variant="outline" className={`${getResponsiveClasses("text-[10px] px-1.5 py-0.5", "text-xs")} bg-amber-50 text-amber-700 border-amber-200`}>Pending</Badge>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-gray-500" />
                  <span className="text-sm">Statement Of Means</span>
                </div>
                <Badge variant="outline" className={getResponsiveClasses("text-[10px] px-1.5 py-0.5", "text-xs")}>Not started</Badge>
              </div>
               <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-gray-500" />
                  <span className="text-sm">Billing Form</span>
                </div>
                <Badge variant="outline" className={getResponsiveClasses("text-[10px] px-1.5 py-0.5", "text-xs")}>Not started</Badge>
              </div>
            </div>
          </CardContent>
          <CardFooter className={`${getResponsiveClasses("text-xs px-3 py-2", "text-xs")} text-muted-foreground`}>
            <p>Full forms available on Forms page</p>
          </CardFooter>
        </Card>
      </TabsContent>

      {/* Timeline Tab */}
      <TabsContent value="timeline" className="space-y-4">
        <Card>
          <CardHeader className={getResponsiveClasses("pb-2 px-3 py-3", "pb-2")}>
            <CardTitle className={`flex items-center justify-between ${getResponsiveClasses("mt-1", "")}`}>
              <div className="flex items-center gap-2">
                <Clock className={`${getResponsiveClasses("h-4 w-4", "h-5 w-5")} text-primary`} />
                <span className={getResponsiveClasses("text-sm", "")}>Timeline Highlights</span>
              </div>
              <Button variant="outline" size={getResponsiveClasses("sm", "default")} className={`${getResponsiveClasses("px-1.5 py-0.5 h-auto", "")} flex items-center gap-1`} asChild>
                <Link to={`/case-files/${matter.id}/timeline`}>
                  <ExternalLink className={getResponsiveClasses("h-2.5 w-2.5", "h-4 w-4")} />
                  <span className={getResponsiveClasses("text-[11px]", "text-xs")}>View Full Page</span>
                </Link>
              </Button>
            </CardTitle>
            <CardDescription className={getResponsiveClasses("text-xs", "")}>Recent timeline events</CardDescription>
          </CardHeader>
          <CardContent className={getResponsiveClasses("p-3", "")}>
            {/* Example Content - Replace with actual timeline data */}
            <div className="space-y-3">
              <div className="relative pl-6 border-l border-dashed border-gray-200">
                <div className="absolute h-3 w-3 bg-primary rounded-full -left-[6.5px] top-1 border-2 border-background"></div>
                <div>
                  <p className="text-sm font-medium">Case Created</p>
                  <p className="text-xs text-muted-foreground">{formatDate(matter?.lastUpdated)}</p>
                </div>
              </div>
              <div className="relative pl-6 border-l border-dashed border-gray-200">
                <div className="absolute h-3 w-3 bg-blue-400 rounded-full -left-[6.5px] top-1 border-2 border-background"></div>
                <div>
                  <p className="text-sm font-medium">First Meeting Scheduled</p>
                  <p className="text-xs text-muted-foreground">20/04/2025</p> {/* Example Date */}
                </div>
              </div>
              <div className="relative pl-6"> {/* No border-l needed for last item */}
                <div className="absolute h-3 w-3 bg-green-400 rounded-full -left-[6.5px] top-1 border-2 border-background"></div>
                <div>
                  <p className="text-sm font-medium">Form Submitted</p>
                  <p className="text-xs text-muted-foreground">22/04/2025</p> {/* Example Date */}
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className={`${getResponsiveClasses("text-xs px-3 py-2", "text-xs")} text-muted-foreground`}>
            <p>View complete case timeline on Timeline page</p>
          </CardFooter>
        </Card>
      </TabsContent>

      {/* Templates Tab */}
      <TabsContent value="templates" className="space-y-4">
         <Card>
          <CardHeader className={getResponsiveClasses("pb-2 px-3 py-3", "pb-2")}>
            <CardTitle className={`flex items-center justify-between ${getResponsiveClasses("mt-1", "")}`}>
              <div className="flex items-center gap-2">
                <BookOpen className={`${getResponsiveClasses("h-4 w-4", "h-5 w-5")} text-primary`} />
                <span className={getResponsiveClasses("text-sm", "")}>Templates</span>
              </div>
              <Button variant="outline" size={getResponsiveClasses("sm", "default")} className={`${getResponsiveClasses("px-1.5 py-0.5 h-auto", "")} flex items-center gap-1`} asChild>
                {/* Link should ideally go to a templates page filtered for this matter, or the general templates page */}
                <Link to={`/templates`}>
                  <ExternalLink className={getResponsiveClasses("h-2.5 w-2.5", "h-4 w-4")} />
                  <span className={getResponsiveClasses("text-[11px]", "text-xs")}>View Templates</span>
                </Link>
              </Button>
            </CardTitle>
            <CardDescription className={getResponsiveClasses("text-xs", "")}>Available document templates</CardDescription>
          </CardHeader>
          <CardContent className={getResponsiveClasses("p-3", "")}>
             {/* Example Content - Replace with actual template data/logic */}
            <div className="space-y-3">
              <div className="flex justify-between items-center p-2 bg-muted/50 rounded-md">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  <span className="text-sm">Separation Agreement</span>
                </div>
                <Badge variant="outline" className={getResponsiveClasses("text-[10px] px-1.5 py-0.5", "text-xs")}>Use Template</Badge>
              </div>
              <div className="flex justify-between items-center p-2 bg-muted/50 rounded-md">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  <span className="text-sm">Parenting Agreement</span>
                </div>
                 <Badge variant="outline" className={getResponsiveClasses("text-[10px] px-1.5 py-0.5", "text-xs")}>Use Template</Badge>
              </div>
               <div className="flex justify-between items-center p-2 bg-muted/50 rounded-md">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  <span className="text-sm">Mediation Agreement</span>
                </div>
                 <Badge variant="outline" className={getResponsiveClasses("text-[10px] px-1.5 py-0.5", "text-xs")}>Use Template</Badge>
              </div>
            </div>
          </CardContent>
          <CardFooter className={`${getResponsiveClasses("text-xs px-3 py-2", "text-xs")} text-muted-foreground`}>
            <p>Manage all templates on the main Templates page</p>
          </CardFooter>
        </Card>
      </TabsContent>

      {/* Checklist Tab */}
      <TabsContent value="checklist" className="space-y-4">
        <Card>
          <CardHeader className={getResponsiveClasses("pb-2 px-3 py-3", "pb-2")}>
            <CardTitle className={`flex items-center justify-between ${getResponsiveClasses("mt-1", "")}`}>
              <div className="flex items-center gap-2">
                <CheckSquare className={`${getResponsiveClasses("h-4 w-4", "h-5 w-5")} text-primary`} />
                <span className={getResponsiveClasses("text-sm", "")}>Checklist Progress</span>
              </div>
              <Button variant="outline" size={getResponsiveClasses("sm", "default")} className={`${getResponsiveClasses("px-1.5 py-0.5 h-auto", "")} flex items-center gap-1`} asChild>
                <Link to={`/case-files/${matter.id}/checklist`}>
                  <ExternalLink className={getResponsiveClasses("h-2.5 w-2.5", "h-4 w-4")} />
                  <span className={getResponsiveClasses("text-[11px]", "text-xs")}>View Full Page</span>
                </Link>
              </Button>
            </CardTitle>
            <CardDescription className={getResponsiveClasses("text-xs", "")}>Case checklist progress</CardDescription>
          </CardHeader>
          <CardContent className={getResponsiveClasses("p-3", "")}>
            {/* Example Content - Replace with actual checklist data/logic */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                 {/* Example Progress Bar */}
                <div className="flex items-center gap-2">
                   <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div className="bg-green-500 h-full w-1/4"></div> {/* Example 25% */}
                  </div>
                  <span className="text-sm text-muted-foreground">25% complete</span>
                </div>
                <Badge variant="secondary" className={getResponsiveClasses("text-[10px] px-1.5 py-0.5", "text-xs")}>3 of 12 tasks</Badge>
              </div>
              <div className="space-y-2">
                {mockChecklist.slice(0, 4).map(item => ( // Show first 4 items
                  <div key={item.id} className="flex items-center gap-2">
                    <Checkbox checked={item.completed} id={`checklist-${item.id}`} className="data-[state=checked]:bg-green-500 data-[state=checked]:border-green-500" />
                    <label htmlFor={`checklist-${item.id}`} className="text-sm">{item.title}</label>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
          <CardFooter className={`${getResponsiveClasses("text-xs px-3 py-2", "text-xs")} text-muted-foreground`}>
            <p>View and complete all checklist items on Checklist page</p>
          </CardFooter>
        </Card>
      </TabsContent>

    </Tabs>
  );
}