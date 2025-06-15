import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  MapPin, 
  Car, 
  AlertTriangle, 
  Clock,
  Activity,
  Camera,
  Radio,
  Zap,
  Eye,
  Target,
  TrendingUp,
  BarChart3,
  Navigation
} from "lucide-react";

export default function RealTimeTrafficMonitor() {
  const [selectedArea, setSelectedArea] = useState("all");
  const [liveData, setLiveData] = useState({
    totalVehicles: 0,
    activeViolations: 0,
    trafficDensity: "medium",
    averageSpeed: 0
  });

  const { data: trafficData = [] } = useQuery({
    queryKey: ["/api/traffic/live-monitoring"],
  });

  const { data: cameraFeeds = [] } = useQuery({
    queryKey: ["/api/traffic/camera-feeds"],
  });

  const { data: signalStatus = [] } = useQuery({
    queryKey: ["/api/traffic/signals/status"],
  });

  // Simulate real-time data updates
  useEffect(() => {
    const interval = setInterval(() => {
      setLiveData(prev => ({
        totalVehicles: Math.floor(Math.random() * 500) + 200,
        activeViolations: Math.floor(Math.random() * 15) + 2,
        trafficDensity: ["low", "medium", "high", "congested"][Math.floor(Math.random() * 4)],
        averageSpeed: Math.floor(Math.random() * 40) + 20
      }));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const trafficAreas = [
    { id: "market", name: "Market Square", vehicles: 145, violations: 3, density: "high" },
    { id: "highway", name: "Highway Junction", vehicles: 287, violations: 7, density: "congested" },
    { id: "station", name: "Railway Station", vehicles: 198, violations: 2, density: "medium" },
    { id: "college", name: "College Road", vehicles: 89, violations: 1, density: "low" },
    { id: "hospital", name: "Hospital Area", vehicles: 156, violations: 4, density: "medium" }
  ];

  const recentViolations = [
    {
      id: 1,
      type: "Signal Jump",
      location: "Highway Junction",
      time: "2 mins ago",
      vehicle: "MH12AB1234",
      confidence: 94,
      status: "verified"
    },
    {
      id: 2,
      type: "No Helmet",
      location: "Market Square",
      time: "5 mins ago",
      vehicle: "MH14XY5678",
      confidence: 87,
      status: "pending"
    },
    {
      id: 3,
      type: "Mobile Phone",
      location: "College Road",
      time: "8 mins ago",
      vehicle: "MH16PQ9012",
      confidence: 91,
      status: "verified"
    }
  ];

  const getDensityColor = (density: string) => {
    switch (density) {
      case "low": return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      case "medium": return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
      case "high": return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300";
      case "congested": return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
      default: return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "verified": return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      case "pending": return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
      case "rejected": return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
      default: return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Real-Time Traffic Monitoring
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          लाइव ट्रॅफिक निरीक्षण | Live Traffic Command Center
        </p>
      </div>

      {/* Live Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <Car className="h-8 w-8 text-blue-600 mx-auto mb-2" />
            <div className="text-2xl font-bold">{liveData.totalVehicles}</div>
            <div className="text-sm text-gray-600 dark:text-gray-300">Active Vehicles</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <AlertTriangle className="h-8 w-8 text-red-600 mx-auto mb-2" />
            <div className="text-2xl font-bold">{liveData.activeViolations}</div>
            <div className="text-sm text-gray-600 dark:text-gray-300">Live Violations</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <Activity className="h-8 w-8 text-green-600 mx-auto mb-2" />
            <div className="text-lg font-bold capitalize">{liveData.trafficDensity}</div>
            <div className="text-sm text-gray-600 dark:text-gray-300">Traffic Density</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <TrendingUp className="h-8 w-8 text-purple-600 mx-auto mb-2" />
            <div className="text-2xl font-bold">{liveData.averageSpeed}</div>
            <div className="text-sm text-gray-600 dark:text-gray-300">Avg Speed (km/h)</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="live" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="live">Live Monitor</TabsTrigger>
          <TabsTrigger value="cameras">Camera Feeds</TabsTrigger>
          <TabsTrigger value="signals">Traffic Signals</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        {/* Live Monitor Tab */}
        <TabsContent value="live" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Traffic Areas */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Traffic Areas Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {trafficAreas.map((area) => (
                    <div key={area.id} className="flex justify-between items-center p-3 border rounded-lg">
                      <div>
                        <div className="font-medium">{area.name}</div>
                        <div className="text-sm text-gray-600 dark:text-gray-300">
                          {area.vehicles} vehicles • {area.violations} violations
                        </div>
                      </div>
                      <Badge className={getDensityColor(area.density)}>
                        {area.density}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Recent Violations */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="h-5 w-5" />
                  Recent Violations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentViolations.map((violation) => (
                    <div key={violation.id} className="border rounded-lg p-3">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <div className="font-medium">{violation.type}</div>
                          <div className="text-sm text-gray-600 dark:text-gray-300">
                            {violation.location} • {violation.vehicle}
                          </div>
                        </div>
                        <div className="text-xs text-gray-500">{violation.time}</div>
                      </div>
                      <div className="flex justify-between items-center">
                        <div className="text-sm">
                          AI Confidence: {violation.confidence}%
                        </div>
                        <Badge className={getStatusColor(violation.status)}>
                          {violation.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Camera Feeds Tab */}
        <TabsContent value="cameras" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {["Market Square", "Highway Junction", "Railway Station", "College Road", "Hospital Area", "Bus Terminal"].map((location, index) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-sm">
                    <Camera className="h-4 w-4" />
                    {location}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="aspect-video bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center mb-3">
                    <div className="text-center">
                      <Camera className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                      <div className="text-sm text-gray-500">Live Feed</div>
                      <div className="w-3 h-3 bg-green-500 rounded-full mx-auto mt-2 animate-pulse"></div>
                    </div>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-green-600">Online</span>
                    <span>AI Detection: Active</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Traffic Signals Tab */}
        <TabsContent value="signals" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { name: "Market Square Signal", status: "operational", timing: "90s cycle" },
              { name: "Highway Junction", status: "maintenance", timing: "Manual override" },
              { name: "Railway Crossing", status: "operational", timing: "120s cycle" },
              { name: "College Gate", status: "operational", timing: "60s cycle" },
              { name: "Hospital Junction", status: "operational", timing: "100s cycle" },
              { name: "Bus Terminal", status: "offline", timing: "System down" }
            ].map((signal, index) => (
              <Card key={index}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="font-medium">{signal.name}</div>
                    <div className={`w-3 h-3 rounded-full ${
                      signal.status === 'operational' ? 'bg-green-500' :
                      signal.status === 'maintenance' ? 'bg-yellow-500' : 'bg-red-500'
                    }`}></div>
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                    Status: {signal.status}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-300">
                    {signal.timing}
                  </div>
                  {signal.status !== 'operational' && (
                    <Button size="sm" className="mt-3 w-full">
                      {signal.status === 'maintenance' ? 'Resume Auto' : 'Restart System'}
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Hourly Traffic Pattern
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {["06:00", "09:00", "12:00", "15:00", "18:00", "21:00"].map((time, index) => (
                    <div key={time} className="flex items-center gap-4">
                      <div className="w-12 text-sm">{time}</div>
                      <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full"
                          style={{ width: `${Math.random() * 80 + 20}%` }}
                        ></div>
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-300 w-16">
                        {Math.floor(Math.random() * 300 + 100)} vehicles
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Violation Breakdown
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { type: "Signal Jumping", count: 45, percentage: 35 },
                    { type: "No Helmet", count: 38, percentage: 30 },
                    { type: "Mobile Phone", count: 25, percentage: 20 },
                    { type: "Overspeeding", count: 19, percentage: 15 }
                  ].map((violation) => (
                    <div key={violation.type} className="flex items-center gap-4">
                      <div className="w-20 text-sm">{violation.type}</div>
                      <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div 
                          className="bg-red-600 h-2 rounded-full"
                          style={{ width: `${violation.percentage}%` }}
                        ></div>
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-300 w-12">
                        {violation.count}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>AI Performance Metrics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">94.2%</div>
                  <div className="text-sm text-gray-600 dark:text-gray-300">Detection Accuracy</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">2.3s</div>
                  <div className="text-sm text-gray-600 dark:text-gray-300">Avg Processing Time</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">89.7%</div>
                  <div className="text-sm text-gray-600 dark:text-gray-300">License Plate Recognition</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">156</div>
                  <div className="text-sm text-gray-600 dark:text-gray-300">Processed Today</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}