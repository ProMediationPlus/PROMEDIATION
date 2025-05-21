import React, { useState, useEffect } from "react";
import { Layout } from "@/components/layout/layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link, useParams, useNavigate } from "react-router-dom";
import { ChevronLeft, Users, Phone, Mail, MapPin, Edit, Plus } from "lucide-react";
import { getItem, putItem } from "@/services/localDbService";
import { useIsMobile } from "@/hooks/use-mobile";
import { toast } from "sonner";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CaseDetails } from "@/components/cases/casesform"; // MIGRATION: renamed from 'MatterDetails' to 'CaseDetails' and updated import path

interface Case { // MIGRATION: renamed from 'Matter' to 'Case'
  id: string;
  title: string;
  status: string;
  clientName: string;
  description?: string;
  caseFileNumber?: string;
  intakeForm?: any; // This would be more specifically typed in a real app
  parties?: string[];
  email?: string;
  phone?: string;
  address?: string;
  // Any other client-specific fields
}

const ClientDetailsPage = () => {
  const { id: caseId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [case_, setCase] = useState<Case | null>(null); // MIGRATION: renamed from 'matter, setMatter' to 'case_, setCase' and 'Matter' to 'Case'
  const isMobile = useIsMobile();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("personal");

  // Helper for icon size
  const iconSizeClass = isMobile ? "h-3.5 w-3.5" : "h-4 w-4";

  useEffect(() => {
    const loadCase = async () => { // MIGRATION: renamed from 'loadMatter' to 'loadCase'
      if (!caseId) {
        setError("No case ID provided.");
        setIsLoading(false);
        return;
      }
      
      setIsLoading(true);
      try {
        const caseData = await getItem('cases', caseId); // MIGRATION: renamed from 'matterData' to 'caseData' and 'matters' to 'cases'
        if (caseData) { // MIGRATION: renamed from 'matterData' to 'caseData'
          setCase(caseData); // MIGRATION: renamed from 'setMatter' to 'setCase' and 'matterData' to 'caseData'
          setError(null);
        } else {
          setError("Case not found.");
          setCase(null); // MIGRATION: renamed from 'setMatter' to 'setCase'
        }
      } catch (e) {
        console.error("Error loading case data:", e); // MIGRATION: renamed from 'matter' to 'case'
        setError("Failed to load case data.");
        setCase(null); // MIGRATION: renamed from 'setMatter' to 'setCase'
      } finally {
        setIsLoading(false);
      }
    };
    
    loadCase(); // MIGRATION: renamed from 'loadMatter' to 'loadCase'
  }, [caseId]);

  const handleSaveCase = async (updatedCaseData: Partial<Case>) => { // MIGRATION: renamed from 'handleSaveMatter' to 'handleSaveCase' and 'updatedMatterData: Partial<Matter>' to 'updatedCaseData: Partial<Case>'
    if (!caseId || !case_) return; // MIGRATION: renamed from 'matter' to 'case_'

    try {
      const caseToSave = { // MIGRATION: renamed from 'matterToSave' to 'caseToSave'
        ...case_, // MIGRATION: renamed from 'matter' to 'case_'
        ...updatedCaseData, // MIGRATION: renamed from 'updatedMatterData' to 'updatedCaseData'
        lastUpdated: new Date().toISOString()
      };

      await putItem('cases', caseToSave); // MIGRATION: renamed from 'matters' to 'cases' and 'matterToSave' to 'caseToSave'
      setCase(caseToSave); // MIGRATION: renamed from 'setMatter' to 'setCase' and 'matterToSave' to 'caseToSave'
      toast.success("Client details updated successfully");
    } catch (error) {
      console.error("Error saving case:", error); // MIGRATION: renamed from 'matter' to 'case'
      toast.error("Failed to update client details");
    }
  };

  if (isLoading) {
    return <Layout><div className={`${isMobile ? "p-4" : "p-6"}`}>Loading client details...</div></Layout>;
  }

  if (error || !case_) { // MIGRATION: renamed from 'matter' to 'case_'
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

  return (
    <Layout>
      <div className={`flex flex-col h-full ${isMobile ? "space-y-3 p-4" : "space-y-6 p-6"}`}>
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
          <div className="flex items-center space-x-4">
            <Button variant="outline" size={isMobile ? "sm" : "icon"} asChild>
              <Link to="/case-files">
                <ChevronLeft className={iconSizeClass} />
              </Link>
            </Button>
            <div>
              <h1 className={`${isMobile ? "text-xl" : "text-3xl"} font-bold tracking-tight`}>Client Details</h1>
              <div className={`${isMobile ? "text-xs" : "text-sm"} text-muted-foreground`}>
                {case_.title} • {case_.caseFileNumber || case_.id} {/* MIGRATION: renamed from 'matter' to 'case_' */}
              </div>
            </div>
          </div>
          <Button size={isMobile ? "sm" : "default"}>
            <Edit className={`${iconSizeClass} mr-2`} />
            Edit Details
          </Button>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full flex-1 flex flex-col">
          <TabsList className={`
            grid ${isMobile ? "grid-cols-3" : "grid-cols-3"}
            w-full
            h-auto p-1
            bg-muted rounded-lg
            gap-1
            ${!isMobile ? 'md:w-auto md:inline-grid' : ''} // Adjust width behavior on desktop
          `}>
            <TabsTrigger
              value="personal"
              className={`
                flex items-center justify-center gap-1.5
                ${isMobile ? 'text-xs px-2 py-1.5' : 'text-sm px-3 py-1.5'}
                rounded-md
                data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm
              `}
            >
              <Users className={iconSizeClass} /> Personal
            </TabsTrigger>
            <TabsTrigger
              value="contact"
              className={`
                flex items-center justify-center gap-1.5
                ${isMobile ? 'text-xs px-2 py-1.5' : 'text-sm px-3 py-1.5'}
                rounded-md
                data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm
              `}
            >
              <Phone className={iconSizeClass} /> Contact
            </TabsTrigger>
            <TabsTrigger
              value="related"
              className={`
                flex items-center justify-center gap-1.5
                ${isMobile ? 'text-xs px-2 py-1.5' : 'text-sm px-3 py-1.5'}
                rounded-md
                data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm
              `}
            >
              <Users className={iconSizeClass} /> Related
            </TabsTrigger>
          </TabsList>
          
          <div className="flex-1 overflow-y-auto mt-4">
            <TabsContent value="personal" className="mt-0 space-y-1.5">
              <Card>
                <CardHeader className={isMobile ? "p-4" : ""}>
                  <CardTitle className={`flex items-center ${isMobile ? "text-base" : ""}`}>
                    <Users className={`${iconSizeClass} mr-2`} />
                    Personal Details
                  </CardTitle>
                  <CardDescription>Client personal information</CardDescription>
                </CardHeader>
                <CardContent className={`space-y-${isMobile ? '3' : '4'} ${isMobile ? "p-4 pt-0" : ""}`}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-1.5">
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground mb-1">Client Name</h3>
                      <p className={`${isMobile ? "text-xs" : "text-sm"}`}>{case_.clientName || "Not provided"}</p> {/* MIGRATION: renamed from 'matter' to 'case_' */}
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground mb-1">Case Type</h3>
                      <p className={`${isMobile ? "text-xs" : "text-sm"}`}>{case_.type || "Not specified"}</p> {/* MIGRATION: renamed from 'matter' to 'case_' */}
                    </div>
                  </div>
                  <Separator />
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">Description</h3>
                    <p className={`${isMobile ? "text-xs" : "text-sm"}`}>{case_.description || "No description provided"}</p> {/* MIGRATION: renamed from 'matter' to 'case_' */}
                  </div>
                  
                  {case_.intakeForm && ( // MIGRATION: renamed from 'matter' to 'case_'
                    <>
                      <Separator />
                      <div>
                        <h3 className={`${isMobile ? "text-sm" : ""} font-medium mb-2`}>Intake Form Details</h3>
                        {Object.entries(case_.intakeForm).map(([key, value]) => ( // MIGRATION: renamed from 'matter' to 'case_'
                          <div key={key} className="mb-1.5">
                            <h4 className={`${isMobile ? "text-[10px]" : "text-xs"} font-medium text-muted-foreground`}>{key}</h4>
                            <p className={`${isMobile ? "text-xs" : "text-sm"}`}>{String(value)}</p>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="contact" className="mt-0 space-y-1.5">
              <Card>
                <CardHeader className={isMobile ? "p-4" : ""}>
                  <CardTitle className={`flex items-center ${isMobile ? "text-base" : ""}`}>
                    <Phone className={`${iconSizeClass} mr-2`} />
                    Contact Information
                  </CardTitle>
                  <CardDescription>Client contact details</CardDescription>
                </CardHeader>
                <CardContent className={`space-y-${isMobile ? '3' : '4'} ${isMobile ? "p-4 pt-0" : ""}`}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-1.5">
                    <div className="flex items-start">
                      <Mail className={`${iconSizeClass} mr-2 text-muted-foreground mt-0.5`} />
                      <div>
                        <h3 className={`${isMobile ? "text-xs" : "text-sm"} font-medium mb-1`}>Email Address</h3>
                        <p className={`${isMobile ? "text-xs" : "text-sm"}`}>{case_.email || "No email provided"}</p> {/* MIGRATION: renamed from 'matter' to 'case_' */}
                      </div>
                    </div>
                    <div className="flex items-start">
                      <Phone className={`${iconSizeClass} mr-2 text-muted-foreground mt-0.5`} />
                      <div>
                        <h3 className={`${isMobile ? "text-xs" : "text-sm"} font-medium mb-1`}>Phone Number</h3>
                        <p className={`${isMobile ? "text-xs" : "text-sm"}`}>{case_.phone || "No phone provided"}</p> {/* MIGRATION: renamed from 'matter' to 'case_' */}
                      </div>
                    </div>
                  </div>
                  <Separator />
                  <div className="flex items-start">
                    <MapPin className={`${iconSizeClass} mr-2 text-muted-foreground mt-0.5`} />
                    <div>
                      <h3 className={`${isMobile ? "text-xs" : "text-sm"} font-medium mb-1`}>Address</h3>
                      <p className={`${isMobile ? "text-xs" : "text-sm"} whitespace-pre-line`}>{case_.address || "No address provided"}</p> {/* MIGRATION: renamed from 'matter' to 'case_' */}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="related" className="mt-0 space-y-1.5">
              <Card>
                <CardHeader className={isMobile ? "p-4" : ""}>
                  <CardTitle className={`flex items-center ${isMobile ? "text-base" : ""}`}>
                    <Users className={`${iconSizeClass} mr-2`} />
                    Related Parties
                  </CardTitle>
                  <CardDescription>People related to this case</CardDescription>
                </CardHeader>
                <CardContent className={`space-y-${isMobile ? '3' : '4'} ${isMobile ? "p-4 pt-0" : ""}`}>
                  {case_.parties && case_.parties.length > 0 ? ( // MIGRATION: renamed from 'matter' to 'case_'
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-1.5">
                      {case_.parties.map((party, index) => ( // MIGRATION: renamed from 'matter' to 'case_'
                        <div key={index} className={`${isMobile ? "p-2" : "p-3"} bg-muted rounded-md`}>
                          <p className={`${isMobile ? "text-xs" : ""} font-medium`}>{party}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center p-4 text-muted-foreground">
                      <p className={`${isMobile ? "text-xs" : ""}`}>No related parties have been added to this case.</p>
                      <Button variant="outline" size={isMobile ? "sm" : "default"} className="mt-2">
                        <Plus className={iconSizeClass} className={`${iconSizeClass} mr-2`} />
                        Add Related Party
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </div>
        </Tabs>
        
        {/* Card above - likely has mobile styling */}
        {/* Assuming the card above has classes like 'mt-3' for mobile and 'mt-6' for desktop */}
        <Card className={`mt-${isMobile ? '3' : '6'}`}>
          <CardHeader className={isMobile ? "p-4" : ""}>
            <CardTitle className={isMobile ? "text-base" : ""}>Update Client Information</CardTitle>
            <CardDescription>
              Edit or update the client's information using the form below
            </CardDescription>
          </CardHeader>
          <CardContent className={isMobile ? "p-4 pt-0" : ""}>
            <CaseDetails // MIGRATION: renamed from 'MatterDetails' to 'CaseDetails'
              case={case_} // MIGRATION: renamed from 'matter={matter}' to 'case={case_}'
              onSave={handleSaveCase} // MIGRATION: renamed from 'handleSaveMatter' to 'handleSaveCase'
            />
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default ClientDetailsPage;