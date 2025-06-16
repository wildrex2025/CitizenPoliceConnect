import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Search, 
  Car, 
  MapPin, 
  Clock,
  AlertTriangle,
  Shield,
  FileText,
  Phone,
  User,
  Calendar,
  Zap,
  Target,
  Eye,
  Navigation
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";

export default function VehicleTracking() {
  const { t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedVehicle, setSelectedVehicle] = useState<any>(null);
  const [trackingMode, setTrackingMode] = useState("live");

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: vehicleData = [] } = useQuery({
    queryKey: ["/api/vehicles/tracking"],
  });

  const { data: violationHistory = [] } = useQuery({
    queryKey: ["/api/vehicles/violations", selectedVehicle?.registrationNumber],
    enabled: !!selectedVehicle?.registrationNumber,
  });

  const trackVehicleMutation = useMutation({
    mutationFn: (regNumber: string) => apiRequest(`/api/vehicles/track/${regNumber}`, "GET"),
    onSuccess: (data) => {
      setSelectedVehicle(data);
      toast({ 
        title: "Vehicle Located", 
        description: `Found vehicle ${data.registrationNumber}` 
      });
    },
    onError: () => {
      toast({ 
        title: "Vehicle Not Found", 
        description: "No tracking data available for this vehicle",
        variant: "destructive" 
      });
    }
  });

  const vehicles = [
    {
      registrationNumber: "MH12AB1234",
      ownerName: "राज पाटील",
      vehicleType: "Car",
      model: "Maruti Swift",
      lastLocation: "Market Square, Ahilyangara",
      lastSeen: "5 mins ago",
      violationCount: 3,
      status: "active",
      insuranceStatus: "valid",
      pucStatus: "expired",
      coordinates: { lat: 19.8762, lng: 75.3433 }
    },
    {
      registrationNumber: "MH14XY5678",
      ownerName: "सुनीता शर्मा",
      vehicleType: "Two Wheeler",
      model: "Honda Activa",
      lastLocation: "Highway Junction",
      lastSeen: "12 mins ago",
      violationCount: 1,
      status: "active",
      insuranceStatus: "valid",
      pucStatus: "valid",
      coordinates: { lat: 19.8775, lng: 75.3445 }
    },
    {
      registrationNumber: "MH16PQ9012",
      ownerName: "अमित कुमार",
      vehicleType: "Commercial",
      model: "Tata Ace",
      lastLocation: "Bus Terminal",
      lastSeen: "1 hour ago",
      violationCount: 7,
      status: "flagged",
      insuranceStatus: "expired",
      pucStatus: "valid",
      coordinates: { lat: 19.8750, lng: 75.3420 }
    }
  ];

  const handleSearch = () => {
    if (searchQuery.trim()) {
      trackVehicleMutation.mutate(searchQuery.trim().toUpperCase());
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      case "flagged": return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
      case "offline": return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
      default: return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
    }
  };

  const getDocumentStatus = (status: string) => {
    return status === "valid" 
      ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
      : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
  };

  return (
    <div className="container mx-auto p-6 space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          {t('vehicle.title')}
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          {t('vehicle.description')}
        </p>
      </div>

      {/* Search Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            {t('vehicle.search_vehicle')}
          </CardTitle>
          <CardDescription>
            {t('vehicle.description')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1">
              <Input
                placeholder="Enter registration number (e.g., MH12AB1234)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value.toUpperCase())}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>
            <Button 
              onClick={handleSearch}
              disabled={trackVehicleMutation.isPending}
            >
              {trackVehicleMutation.isPending ? (
                <>
                  <Zap className="h-4 w-4 mr-2 animate-spin" />
                  Tracking...
                </>
              ) : (
                <>
                  <Target className="h-4 w-4 mr-2" />
                  Track Vehicle
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="live" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="live">Live Tracking</TabsTrigger>
          <TabsTrigger value="fleet">Fleet Overview</TabsTrigger>
          <TabsTrigger value="violations">Violation History</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        {/* Live Tracking Tab */}
        <TabsContent value="live" className="space-y-6">
          {selectedVehicle ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Vehicle Details */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Car className="h-5 w-5" />
                    Vehicle Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium">Registration</Label>
                      <div className="text-lg font-bold">{selectedVehicle.registrationNumber}</div>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Owner</Label>
                      <div>{selectedVehicle.ownerName}</div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium">Vehicle Type</Label>
                      <div>{selectedVehicle.vehicleType}</div>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Model</Label>
                      <div>{selectedVehicle.model}</div>
                    </div>
                  </div>

                  <div>
                    <Label className="text-sm font-medium">Status</Label>
                    <div className="mt-1">
                      <Badge className={getStatusColor(selectedVehicle.status)}>
                        {selectedVehicle.status}
                      </Badge>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Document Status</Label>
                    <div className="flex gap-2">
                      <Badge className={getDocumentStatus(selectedVehicle.insuranceStatus)}>
                        Insurance: {selectedVehicle.insuranceStatus}
                      </Badge>
                      <Badge className={getDocumentStatus(selectedVehicle.pucStatus)}>
                        PUC: {selectedVehicle.pucStatus}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Location & Activity */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    Current Location
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="aspect-video bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                    <div className="text-center">
                      <Navigation className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                      <div className="text-sm text-gray-500">Live GPS Tracking</div>
                      <div className="text-xs text-gray-400 mt-1">
                        {selectedVehicle.coordinates.lat}, {selectedVehicle.coordinates.lng}
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <Label className="text-sm font-medium">Last Known Location</Label>
                    <div className="flex items-center gap-2 mt-1">
                      <MapPin className="h-4 w-4 text-gray-500" />
                      <span>{selectedVehicle.lastLocation}</span>
                    </div>
                  </div>
                  
                  <div>
                    <Label className="text-sm font-medium">Last Seen</Label>
                    <div className="flex items-center gap-2 mt-1">
                      <Clock className="h-4 w-4 text-gray-500" />
                      <span>{selectedVehicle.lastSeen}</span>
                    </div>
                  </div>

                  <div>
                    <Label className="text-sm font-medium">Violation Count</Label>
                    <div className="flex items-center gap-2 mt-1">
                      <AlertTriangle className="h-4 w-4 text-red-500" />
                      <span className="text-red-600 font-medium">{selectedVehicle.violationCount} violations</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <Search className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">Search for a Vehicle</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Enter a registration number above to track vehicle location and view details
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Fleet Overview Tab */}
        <TabsContent value="fleet" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardContent className="p-4 text-center">
                <Car className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                <div className="text-2xl font-bold">{vehicles.length}</div>
                <div className="text-sm text-gray-600 dark:text-gray-300">Tracked Vehicles</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4 text-center">
                <AlertTriangle className="h-8 w-8 text-red-600 mx-auto mb-2" />
                <div className="text-2xl font-bold">
                  {vehicles.filter(v => v.status === 'flagged').length}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-300">Flagged Vehicles</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4 text-center">
                <FileText className="h-8 w-8 text-orange-600 mx-auto mb-2" />
                <div className="text-2xl font-bold">
                  {vehicles.filter(v => v.insuranceStatus === 'expired' || v.pucStatus === 'expired').length}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-300">Expired Documents</div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Vehicle Fleet Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {vehicles.map((vehicle) => (
                  <div 
                    key={vehicle.registrationNumber} 
                    className="border rounded-lg p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800"
                    onClick={() => setSelectedVehicle(vehicle)}
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <div className="font-semibold text-lg">{vehicle.registrationNumber}</div>
                        <div className="text-sm text-gray-600 dark:text-gray-300">
                          {vehicle.ownerName} • {vehicle.model}
                        </div>
                      </div>
                      <Badge className={getStatusColor(vehicle.status)}>
                        {vehicle.status}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <div className="text-gray-500">Location</div>
                        <div>{vehicle.lastLocation}</div>
                      </div>
                      <div>
                        <div className="text-gray-500">Last Seen</div>
                        <div>{vehicle.lastSeen}</div>
                      </div>
                      <div>
                        <div className="text-gray-500">Violations</div>
                        <div className="text-red-600">{vehicle.violationCount}</div>
                      </div>
                      <div>
                        <div className="text-gray-500">Documents</div>
                        <div className="flex gap-1">
                          <span className={`px-1 py-0.5 rounded text-xs ${
                            vehicle.insuranceStatus === 'valid' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            INS
                          </span>
                          <span className={`px-1 py-0.5 rounded text-xs ${
                            vehicle.pucStatus === 'valid' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            PUC
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Violations Tab */}
        <TabsContent value="violations" className="space-y-6">
          {selectedVehicle ? (
            <Card>
              <CardHeader>
                <CardTitle>Violation History - {selectedVehicle.registrationNumber}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    {
                      date: "2024-01-15",
                      type: "Signal Jumping",
                      location: "Highway Junction",
                      fine: 1000,
                      status: "paid"
                    },
                    {
                      date: "2024-01-10",
                      type: "No Helmet",
                      location: "Market Square",
                      fine: 1000,
                      status: "pending"
                    },
                    {
                      date: "2024-01-05",
                      type: "Overspeeding",
                      location: "College Road",
                      fine: 2000,
                      status: "paid"
                    }
                  ].map((violation, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <div className="font-semibold">{violation.type}</div>
                          <div className="text-sm text-gray-600 dark:text-gray-300">
                            {violation.location} • {violation.date}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold">₹{violation.fine}</div>
                          <Badge className={violation.status === 'paid' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-yellow-100 text-yellow-800'
                          }>
                            {violation.status}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">Select a Vehicle</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Choose a vehicle from the fleet overview to view violation history
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Vehicle Type Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { type: "Two Wheeler", count: 45, percentage: 60 },
                    { type: "Car", count: 20, percentage: 27 },
                    { type: "Commercial", count: 10, percentage: 13 }
                  ].map((item) => (
                    <div key={item.type} className="flex items-center gap-4">
                      <div className="w-20 text-sm">{item.type}</div>
                      <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full"
                          style={{ width: `${item.percentage}%` }}
                        ></div>
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-300 w-12">
                        {item.count}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Document Compliance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-600">87%</div>
                    <div className="text-sm text-gray-600 dark:text-gray-300">Valid Insurance</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-orange-600">73%</div>
                    <div className="text-sm text-gray-600 dark:text-gray-300">Valid PUC</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-600">92%</div>
                    <div className="text-sm text-gray-600 dark:text-gray-300">Overall Compliance</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}