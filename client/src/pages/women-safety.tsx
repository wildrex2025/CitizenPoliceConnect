import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Shield, MapPin, AlertTriangle, Route, Users, Phone } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { WomenSafetyReport, SafeRoute } from "@shared/schema";

export default function WomenSafety() {
  const [isReporting, setIsReporting] = useState(false);
  const [reportForm, setReportForm] = useState({
    incidentType: "",
    description: "",
    timeOfIncident: "",
    severityLevel: "",
    isAnonymous: false,
    location: { lat: 0, lng: 0, address: "" }
  });
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: reports = [] } = useQuery<WomenSafetyReport[]>({
    queryKey: ["/api/women-safety/reports"],
  });

  const { data: safeRoutes = [] } = useQuery<SafeRoute[]>({
    queryKey: ["/api/safe-routes", "night"],
  });

  const createReportMutation = useMutation({
    mutationFn: (data: any) => apiRequest("/api/women-safety/reports", "POST", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/women-safety/reports"] });
      toast({ title: "Report submitted successfully" });
      setIsReporting(false);
      setReportForm({
        incidentType: "",
        description: "",
        timeOfIncident: "",
        severityLevel: "",
        isAnonymous: false,
        location: { lat: 0, lng: 0, address: "" }
      });
    },
  });

  const handleSubmitReport = () => {
    if (!reportForm.incidentType || !reportForm.description) {
      toast({ title: "Please fill all required fields", variant: "destructive" });
      return;
    }

    createReportMutation.mutate({
      ...reportForm,
      timeOfIncident: new Date(reportForm.timeOfIncident),
      location: reportForm.location,
    });
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical": return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
      case "high": return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300";
      case "medium": return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
      default: return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">महिला सुरक्षा केंद्र</h1>
        <p className="text-gray-600 dark:text-gray-300">Women Safety Center - Your safety is our priority</p>
      </div>

      {/* Emergency Actions */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800">
          <CardContent className="p-4 text-center">
            <Shield className="h-8 w-8 text-red-600 dark:text-red-400 mx-auto mb-2" />
            <h3 className="font-semibold text-red-800 dark:text-red-300">Emergency SOS</h3>
            <Button className="mt-2 w-full bg-red-600 hover:bg-red-700 text-white">
              Send Alert
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
          <CardContent className="p-4 text-center">
            <Route className="h-8 w-8 text-blue-600 dark:text-blue-400 mx-auto mb-2" />
            <h3 className="font-semibold text-blue-800 dark:text-blue-300">Safe Routes</h3>
            <Button variant="outline" className="mt-2 w-full">
              Find Route
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
          <CardContent className="p-4 text-center">
            <Users className="h-8 w-8 text-green-600 dark:text-green-400 mx-auto mb-2" />
            <h3 className="font-semibold text-green-800 dark:text-green-300">Women Helpdesk</h3>
            <Button variant="outline" className="mt-2 w-full">
              Connect
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800">
          <CardContent className="p-4 text-center">
            <Phone className="h-8 w-8 text-purple-600 dark:text-purple-400 mx-auto mb-2" />
            <h3 className="font-semibold text-purple-800 dark:text-purple-300">Helpline 1091</h3>
            <Button variant="outline" className="mt-2 w-full">
              Call Now
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Report Incident */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Report Safety Incident
            </CardTitle>
            <CardDescription>
              Report harassment, stalking, or unsafe situations
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!isReporting ? (
              <Button onClick={() => setIsReporting(true)} className="w-full">
                Report Incident
              </Button>
            ) : (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="incidentType">Incident Type</Label>
                  <Select value={reportForm.incidentType} onValueChange={(value) => 
                    setReportForm(prev => ({ ...prev, incidentType: value }))
                  }>
                    <SelectTrigger>
                      <SelectValue placeholder="Select incident type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="harassment">Harassment</SelectItem>
                      <SelectItem value="stalking">Stalking</SelectItem>
                      <SelectItem value="inappropriate_behavior">Inappropriate Behavior</SelectItem>
                      <SelectItem value="unsafe_area">Unsafe Area</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="severityLevel">Severity Level</Label>
                  <Select value={reportForm.severityLevel} onValueChange={(value) => 
                    setReportForm(prev => ({ ...prev, severityLevel: value }))
                  }>
                    <SelectTrigger>
                      <SelectValue placeholder="Select severity" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="critical">Critical</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="timeOfIncident">Time of Incident</Label>
                  <Input
                    id="timeOfIncident"
                    type="datetime-local"
                    value={reportForm.timeOfIncident}
                    onChange={(e) => setReportForm(prev => ({ ...prev, timeOfIncident: e.target.value }))}
                  />
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Describe the incident in detail..."
                    value={reportForm.description}
                    onChange={(e) => setReportForm(prev => ({ ...prev, description: e.target.value }))}
                    rows={4}
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="anonymous"
                    checked={reportForm.isAnonymous}
                    onChange={(e) => setReportForm(prev => ({ ...prev, isAnonymous: e.target.checked }))}
                    className="rounded"
                  />
                  <Label htmlFor="anonymous">Report anonymously</Label>
                </div>

                <div className="flex gap-2">
                  <Button onClick={handleSubmitReport} disabled={createReportMutation.isPending}>
                    {createReportMutation.isPending ? "Submitting..." : "Submit Report"}
                  </Button>
                  <Button variant="outline" onClick={() => setIsReporting(false)}>
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Safe Routes */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Route className="h-5 w-5" />
              Safe Routes for Night Travel
            </CardTitle>
            <CardDescription>
              Well-lit and monitored routes for safe travel
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {safeRoutes.length === 0 ? (
                <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                  No safe routes available for your area
                </p>
              ) : (
                safeRoutes.map((route) => (
                  <div key={route.id} className="border rounded-lg p-3">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-medium">{route.routeName}</h4>
                      <Badge variant="outline" className="text-xs">
                        {route.safetyRating}/5 ⭐
                      </Badge>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {(route.features as string[])?.map((feature, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {feature.replace('_', ' ')}
                        </Badge>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>
            <Button className="w-full mt-4" variant="outline">
              <MapPin className="h-4 w-4 mr-2" />
              Plan Safe Route
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Recent Reports */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Safety Reports</CardTitle>
          <CardDescription>
            Track the status of safety incidents in your area
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {reports.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                No reports available
              </p>
            ) : (
              reports.slice(0, 5).map((report) => (
                <div key={report.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className="font-medium capitalize">
                        {report.incidentType.replace('_', ' ')}
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        {new Date(report.timeOfIncident).toLocaleDateString('en-IN')}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Badge className={getSeverityColor(report.severityLevel)}>
                        {report.severityLevel}
                      </Badge>
                      <Badge variant="outline">
                        {report.status}
                      </Badge>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
                    {report.description}
                  </p>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}