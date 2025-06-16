import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Baby, MapPin, AlertCircle, Route, Phone, Clock } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import type { ChildSafetyAlert } from "@shared/schema";

export default function ChildSafety() {
  const { t } = useLanguage();
  const [isReporting, setIsReporting] = useState(false);
  const [alertForm, setAlertForm] = useState({
    childName: "",
    childAge: "",
    alertType: "",
    description: "",
    lastSeenAt: "",
    location: { lat: 0, lng: 0, address: "" }
  });
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: alerts = [] } = useQuery<ChildSafetyAlert[]>({
    queryKey: ["/api/child-safety/alerts"],
  });

  const createAlertMutation = useMutation({
    mutationFn: (data: any) => apiRequest("/api/child-safety/alerts", "POST", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/child-safety/alerts"] });
      toast({ title: "Child safety alert created successfully" });
      setIsReporting(false);
      setAlertForm({
        childName: "",
        childAge: "",
        alertType: "",
        description: "",
        lastSeenAt: "",
        location: { lat: 0, lng: 0, address: "" }
      });
    },
  });

  const handleSubmitAlert = () => {
    if (!alertForm.childName || !alertForm.childAge || !alertForm.alertType) {
      toast({ title: "Please fill all required fields", variant: "destructive" });
      return;
    }

    createAlertMutation.mutate({
      ...alertForm,
      childId: Math.floor(Math.random() * 10000), // In production, this would be from a child registration system
      parentId: 1, // In production, this would be from authenticated user
      childAge: parseInt(alertForm.childAge),
      lastSeenAt: alertForm.lastSeenAt ? new Date(alertForm.lastSeenAt) : null,
    });
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "critical": return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
      case "high": return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300";
      default: return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{t('child_safety.title')}</h1>
        <p className="text-gray-600 dark:text-gray-300">{t('child_safety.description')}</p>
      </div>

      {/* Emergency Actions */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800">
          <CardContent className="p-4 text-center">
            <AlertCircle className="h-8 w-8 text-red-600 dark:text-red-400 mx-auto mb-2" />
            <h3 className="font-semibold text-red-800 dark:text-red-300">{t('child_safety.safety_alert')}</h3>
            <Button className="mt-2 w-full bg-red-600 hover:bg-red-700 text-white">
              {t('emergency.panic_button')}
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
          <CardContent className="p-4 text-center">
            <Route className="h-8 w-8 text-blue-600 dark:text-blue-400 mx-auto mb-2" />
            <h3 className="font-semibold text-blue-800 dark:text-blue-300">Route Tracking</h3>
            <Button variant="outline" className="mt-2 w-full">
              Track Route
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
          <CardContent className="p-4 text-center">
            <Phone className="h-8 w-8 text-green-600 dark:text-green-400 mx-auto mb-2" />
            <h3 className="font-semibold text-green-800 dark:text-green-300">Childline 1098</h3>
            <Button variant="outline" className="mt-2 w-full">
              Call Now
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800">
          <CardContent className="p-4 text-center">
            <Baby className="h-8 w-8 text-purple-600 dark:text-purple-400 mx-auto mb-2" />
            <h3 className="font-semibold text-purple-800 dark:text-purple-300">Cyber Safety</h3>
            <Button variant="outline" className="mt-2 w-full">
              Report Bullying
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Create Alert */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              Create Child Safety Alert
            </CardTitle>
            <CardDescription>
              Report missing children, route deviations, or safety concerns
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!isReporting ? (
              <Button onClick={() => setIsReporting(true)} className="w-full">
                Create Safety Alert
              </Button>
            ) : (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="childName">Child Name</Label>
                  <Input
                    id="childName"
                    placeholder="Enter child's name"
                    value={alertForm.childName}
                    onChange={(e) => setAlertForm(prev => ({ ...prev, childName: e.target.value }))}
                  />
                </div>

                <div>
                  <Label htmlFor="childAge">Child Age</Label>
                  <Input
                    id="childAge"
                    type="number"
                    placeholder="Enter child's age"
                    value={alertForm.childAge}
                    onChange={(e) => setAlertForm(prev => ({ ...prev, childAge: e.target.value }))}
                  />
                </div>

                <div>
                  <Label htmlFor="alertType">Alert Type</Label>
                  <Select value={alertForm.alertType} onValueChange={(value) => 
                    setAlertForm(prev => ({ ...prev, alertType: value }))
                  }>
                    <SelectTrigger>
                      <SelectValue placeholder="Select alert type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="missing">Missing Child</SelectItem>
                      <SelectItem value="route_deviation">Route Deviation</SelectItem>
                      <SelectItem value="cyber_bullying">Cyber Bullying</SelectItem>
                      <SelectItem value="unsafe_contact">Unsafe Contact</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="lastSeenAt">Last Seen At</Label>
                  <Input
                    id="lastSeenAt"
                    type="datetime-local"
                    value={alertForm.lastSeenAt}
                    onChange={(e) => setAlertForm(prev => ({ ...prev, lastSeenAt: e.target.value }))}
                  />
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Describe the situation in detail..."
                    value={alertForm.description}
                    onChange={(e) => setAlertForm(prev => ({ ...prev, description: e.target.value }))}
                    rows={4}
                  />
                </div>

                <div className="flex gap-2">
                  <Button onClick={handleSubmitAlert} disabled={createAlertMutation.isPending}>
                    {createAlertMutation.isPending ? "Creating Alert..." : "Create Alert"}
                  </Button>
                  <Button variant="outline" onClick={() => setIsReporting(false)}>
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Safety Guidelines */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Baby className="h-5 w-5" />
              Child Safety Guidelines
            </CardTitle>
            <CardDescription>
              Important safety tips for children and parents
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="border-l-4 border-blue-500 pl-4">
                <h4 className="font-medium text-blue-800 dark:text-blue-300">School Route Safety</h4>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Always use the designated safe route to and from school. Inform parents of any route changes.
                </p>
              </div>
              
              <div className="border-l-4 border-green-500 pl-4">
                <h4 className="font-medium text-green-800 dark:text-green-300">Online Safety</h4>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Never share personal information online. Report any suspicious messages or contacts.
                </p>
              </div>
              
              <div className="border-l-4 border-orange-500 pl-4">
                <h4 className="font-medium text-orange-800 dark:text-orange-300">Emergency Contacts</h4>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Memorize important phone numbers including parents, school, and emergency services.
                </p>
              </div>
              
              <div className="border-l-4 border-purple-500 pl-4">
                <h4 className="font-medium text-purple-800 dark:text-purple-300">Stranger Awareness</h4>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Never accept gifts or go anywhere with strangers. Always stay in groups when possible.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Active Alerts */}
      <Card>
        <CardHeader>
          <CardTitle>Active Child Safety Alerts</CardTitle>
          <CardDescription>
            Current safety alerts in your area
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {alerts.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                No active alerts in your area
              </p>
            ) : (
              alerts.slice(0, 5).map((alert) => (
                <div key={alert.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className="font-medium">{alert.childName}</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        Age: {alert.childAge} • Type: {alert.alertType.replace('_', ' ')}
                      </p>
                      {alert.lastSeenAt && (
                        <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          Last seen: {new Date(alert.lastSeenAt).toLocaleString('en-IN')}
                        </p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Badge className={getPriorityColor(alert.priority)}>
                        {alert.priority}
                      </Badge>
                      <Badge variant="outline">
                        {alert.status}
                      </Badge>
                    </div>
                  </div>
                  {alert.description && (
                    <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
                      {alert.description}
                    </p>
                  )}
                  <div className="flex gap-2 mt-3">
                    <Button size="sm" variant="outline">
                      <MapPin className="h-3 w-3 mr-1" />
                      View Location
                    </Button>
                    <Button size="sm" variant="outline">
                      Contact Parent
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Emergency Contacts */}
      <Card className="bg-gradient-to-r from-green-500 to-blue-600 text-white">
        <CardHeader>
          <CardTitle className="text-center">बाल संरक्षण हेल्पलाइन | Child Protection Helplines</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold">1098</div>
              <div className="text-sm">Childline India</div>
            </div>
            <div>
              <div className="text-2xl font-bold">100</div>
              <div className="text-sm">Police Emergency</div>
            </div>
            <div>
              <div className="text-2xl font-bold">108</div>
              <div className="text-sm">Medical Emergency</div>
            </div>
            <div>
              <div className="text-2xl font-bold">181</div>
              <div className="text-sm">Women/Child Helpline</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}