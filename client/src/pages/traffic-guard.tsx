import { useState, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Camera, 
  MapPin, 
  Car, 
  AlertTriangle, 
  Star, 
  Trophy,
  Shield,
  Clock,
  Eye,
  Upload,
  Video,
  Zap,
  Target
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function TrafficGuard() {
  const [isReporting, setIsReporting] = useState(false);
  const [selectedViolationType, setSelectedViolationType] = useState("");
  const [capturedImages, setCapturedImages] = useState<string[]>([]);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  
  const [violationForm, setViolationForm] = useState({
    registrationNumber: "",
    description: "",
    location: { lat: 0, lng: 0, address: "" },
    weatherConditions: "",
    trafficConditions: "",
    witnessDetails: "",
    isAnonymous: false
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: violationTypes = [] } = useQuery({
    queryKey: ["/api/traffic/violation-types"],
  });

  interface RewardsData {
    totalPoints: number;
    currentLevel: string;
    monthlyRank: string;
  }

  const { data: myRewards } = useQuery<RewardsData>({
    queryKey: ["/api/traffic/rewards/1"], // user ID 1 for demo
  });

  const { data: recentViolations = [] } = useQuery<any[]>({
    queryKey: ["/api/traffic/violations"],
  });

  interface ViolationResponse {
    aiAnalysis?: {
      violationType?: string;
      confidence?: number;
    };
    rewardPoints?: number;
  }

  const submitViolationMutation = useMutation<ViolationResponse, Error, any>({
    mutationFn: async (data: any): Promise<ViolationResponse> => {
      const response = await apiRequest("/api/traffic/violations", "POST", data);
      return response as ViolationResponse;
    },
    onSuccess: (response: ViolationResponse) => {
      queryClient.invalidateQueries({ queryKey: ["/api/traffic/violations"] });
      queryClient.invalidateQueries({ queryKey: ["/api/traffic/rewards/1"] });
      
      toast({ 
        title: "Violation Reported Successfully!", 
        description: `AI Analysis: ${response.aiAnalysis?.violationType || 'Processing'} - Confidence: ${response.aiAnalysis?.confidence || 0}%`
      });
      
      // Show reward points earned
      if (response.rewardPoints && response.rewardPoints > 0) {
        toast({
          title: `+${response.rewardPoints} Points Earned!`,
          description: "Thank you for helping keep our roads safe."
        });
      }
      
      setIsReporting(false);
      setCapturedImages([]);
      setVideoFile(null);
    },
  });

  const violationCategories = {
    standard: [
      { id: 'mobile_phone', name: 'Mobile Phone Usage', fine: 1000, points: 10 },
      { id: 'no_helmet', name: 'No Helmet', fine: 1000, points: 10 },
      { id: 'signal_jump', name: 'Signal Jumping', fine: 1000, points: 15 },
      { id: 'wrong_side', name: 'Wrong Side Driving', fine: 1000, points: 15 },
      { id: 'overspeeding', name: 'Over Speeding', fine: 2000, points: 20 },
      { id: 'drunk_driving', name: 'Drunk Driving', fine: 10000, points: 30 },
      { id: 'triple_riding', name: 'Triple Riding', fine: 1000, points: 10 },
      { id: 'illegal_parking', name: 'Illegal Parking', fine: 500, points: 5 }
    ],
    rural_specific: [
      { id: 'cattle_highway', name: 'Cattle on Highway', fine: 2000, points: 15 },
      { id: 'tractor_violation', name: 'Tractor on Main Road', fine: 3000, points: 20 },
      { id: 'overloaded_vehicle', name: 'Overloaded Vehicle', fine: 5000, points: 25 },
      { id: 'illegal_modification', name: 'Illegal Vehicle Modification', fine: 3000, points: 20 },
      { id: 'vendor_blocking', name: 'Street Vendor Blocking Traffic', fine: 1000, points: 10 }
    ]
  };

  const handleImageCapture = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      const newImages: string[] = [];
      Array.from(files).forEach(file => {
        const reader = new FileReader();
        reader.onload = (e) => {
          newImages.push(e.target?.result as string);
          if (newImages.length === files.length) {
            setCapturedImages(prev => [...prev, ...newImages]);
          }
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const handleVideoCapture = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setVideoFile(file);
    }
  };

  const handleSubmitViolation = () => {
    if (!selectedViolationType || capturedImages.length === 0) {
      toast({ 
        title: "Missing Information", 
        description: "Please select violation type and capture at least one photo.",
        variant: "destructive" 
      });
      return;
    }

    const violationData = {
      reporterId: 1, // Demo user ID
      violationTypeId: selectedViolationType,
      registrationNumber: violationForm.registrationNumber,
      description: violationForm.description,
      location: violationForm.location,
      evidencePhotos: capturedImages,
      evidenceVideo: videoFile ? URL.createObjectURL(videoFile) : null,
      timestamp: new Date().toISOString(),
      weatherConditions: violationForm.weatherConditions,
      trafficConditions: violationForm.trafficConditions,
      witnessDetails: violationForm.witnessDetails,
      isAnonymous: violationForm.isAnonymous
    };

    submitViolationMutation.mutate(violationData);
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
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          AhilyaNagar TrafficGuard Pro
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          AI-Powered Traffic Violation Detection & Citizen Reporting
        </p>
      </div>

      <Tabs defaultValue="report" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="report">Report Violation</TabsTrigger>
          <TabsTrigger value="rewards">My Rewards</TabsTrigger>
          <TabsTrigger value="violations">Recent Reports</TabsTrigger>
          <TabsTrigger value="analytics">Traffic Analytics</TabsTrigger>
        </TabsList>

        {/* Report Violation Tab */}
        <TabsContent value="report" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Camera className="h-5 w-5" />
                Report Traffic Violation
              </CardTitle>
              <CardDescription>
                Capture evidence and help make roads safer with AI-powered verification
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Violation Type Selection */}
              <div className="space-y-4">
                <Label className="text-base font-medium">Standard Violations</Label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {violationCategories.standard.map((violation) => (
                    <Card 
                      key={violation.id}
                      className={`cursor-pointer transition-colors ${
                        selectedViolationType === violation.id 
                          ? 'bg-blue-50 border-blue-500 dark:bg-blue-900/20' 
                          : 'hover:bg-gray-50 dark:hover:bg-gray-800'
                      }`}
                      onClick={() => setSelectedViolationType(violation.id)}
                    >
                      <CardContent className="p-3 text-center">
                        <div className="text-sm font-medium">{violation.name}</div>
                        <div className="text-xs text-gray-500">₹{violation.fine}</div>
                        <div className="text-xs text-blue-600">{violation.points} pts</div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                <Label className="text-base font-medium">Rural-Specific Violations</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {violationCategories.rural_specific.map((violation) => (
                    <Card 
                      key={violation.id}
                      className={`cursor-pointer transition-colors ${
                        selectedViolationType === violation.id 
                          ? 'bg-orange-50 border-orange-500 dark:bg-orange-900/20' 
                          : 'hover:bg-gray-50 dark:hover:bg-gray-800'
                      }`}
                      onClick={() => setSelectedViolationType(violation.id)}
                    >
                      <CardContent className="p-3 text-center">
                        <div className="text-sm font-medium">{violation.name}</div>
                        <div className="text-xs text-gray-500">₹{violation.fine}</div>
                        <div className="text-xs text-orange-600">{violation.points} pts</div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Evidence Capture */}
              <div className="space-y-4">
                <Label className="text-base font-medium">Capture Evidence</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Button 
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full"
                      variant="outline"
                    >
                      <Camera className="h-4 w-4 mr-2" />
                      Capture Photos ({capturedImages.length})
                    </Button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      multiple
                      capture="environment"
                      onChange={handleImageCapture}
                      className="hidden"
                    />
                  </div>
                  
                  <div>
                    <Button 
                      onClick={() => videoInputRef.current?.click()}
                      className="w-full"
                      variant="outline"
                    >
                      <Video className="h-4 w-4 mr-2" />
                      {videoFile ? 'Video Captured' : 'Record Video (30s)'}
                    </Button>
                    <input
                      ref={videoInputRef}
                      type="file"
                      accept="video/*"
                      capture="environment"
                      onChange={handleVideoCapture}
                      className="hidden"
                    />
                  </div>
                </div>
                
                {capturedImages.length > 0 && (
                  <div className="grid grid-cols-3 gap-2">
                    {capturedImages.map((image, index) => (
                      <img 
                        key={index} 
                        src={image} 
                        alt={`Evidence ${index + 1}`}
                        className="w-full h-20 object-cover rounded"
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Additional Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="regNumber">Vehicle Registration Number</Label>
                  <Input
                    id="regNumber"
                    placeholder="MH12AB1234"
                    value={violationForm.registrationNumber}
                    onChange={(e) => setViolationForm(prev => ({ 
                      ...prev, 
                      registrationNumber: e.target.value.toUpperCase() 
                    }))}
                  />
                </div>
                
                <div>
                  <Label htmlFor="weather">Weather Conditions</Label>
                  <Select onValueChange={(value) => setViolationForm(prev => ({ ...prev, weatherConditions: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select weather" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="clear">Clear</SelectItem>
                      <SelectItem value="cloudy">Cloudy</SelectItem>
                      <SelectItem value="rainy">Rainy</SelectItem>
                      <SelectItem value="foggy">Foggy</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="description">Violation Description</Label>
                <Textarea
                  id="description"
                  placeholder="Describe what you observed..."
                  value={violationForm.description}
                  onChange={(e) => setViolationForm(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                />
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="anonymous"
                  checked={violationForm.isAnonymous}
                  onChange={(e) => setViolationForm(prev => ({ ...prev, isAnonymous: e.target.checked }))}
                  className="rounded"
                />
                <Label htmlFor="anonymous">Submit anonymously</Label>
              </div>

              <Button 
                onClick={handleSubmitViolation}
                disabled={submitViolationMutation.isPending}
                className="w-full"
              >
                {submitViolationMutation.isPending ? (
                  <>
                    <Zap className="h-4 w-4 mr-2 animate-spin" />
                    AI Processing Evidence...
                  </>
                ) : (
                  <>
                    <Target className="h-4 w-4 mr-2" />
                    Submit Violation Report
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Rewards Tab */}
        <TabsContent value="rewards" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white">
              <CardContent className="p-6 text-center">
                <Trophy className="h-12 w-12 mx-auto mb-4" />
                <h3 className="text-2xl font-bold">{myRewards?.totalPoints || 0}</h3>
                <p className="text-yellow-100">Total Points</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6 text-center">
                <Star className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                <h3 className="text-2xl font-bold">{myRewards?.currentLevel || 'Bronze'}</h3>
                <p className="text-gray-600 dark:text-gray-300">Current Level</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6 text-center">
                <Shield className="h-12 w-12 text-green-600 mx-auto mb-4" />
                <h3 className="text-2xl font-bold">{myRewards?.monthlyRank || '-'}</h3>
                <p className="text-gray-600 dark:text-gray-300">Monthly Rank</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Available Rewards</CardTitle>
              <CardDescription>Redeem your points for exclusive benefits</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border rounded-lg p-4">
                  <h4 className="font-medium mb-2">Fine Waiver (500 pts)</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-300">Waive your next traffic fine</p>
                  <Button className="mt-2" size="sm">Redeem</Button>
                </div>
                <div className="border rounded-lg p-4">
                  <h4 className="font-medium mb-2">Fuel Voucher ₹200 (800 pts)</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-300">Get fuel voucher at partner stations</p>
                  <Button className="mt-2" size="sm">Redeem</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Recent Violations Tab */}
        <TabsContent value="violations" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent Violation Reports</CardTitle>
              <CardDescription>Track your submitted reports and their status</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentViolations.length === 0 ? (
                  <p className="text-center text-gray-500 dark:text-gray-400 py-8">
                    No violations reported yet
                  </p>
                ) : (
                  recentViolations.slice(0, 10).map((violation: any, index: number) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h4 className="font-medium">{violation.violationType || 'Traffic Violation'}</h4>
                          <p className="text-sm text-gray-600 dark:text-gray-300">
                            {violation.registrationNumber} • {new Date(violation.timestamp).toLocaleDateString('en-IN')}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Badge className={getSeverityColor(violation.severityLevel)}>
                            {violation.severityLevel}
                          </Badge>
                          <Badge variant="outline">
                            {violation.status}
                          </Badge>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        {violation.description}
                      </p>
                      <div className="flex justify-between items-center mt-3 text-sm">
                        <span className="flex items-center gap-1">
                          <Eye className="h-3 w-3" />
                          AI Confidence: {violation.verificationScore || 0}%
                        </span>
                        {violation.rewardPoints > 0 && (
                          <span className="text-green-600">+{violation.rewardPoints} points</span>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardContent className="p-6 text-center">
                <Car className="h-8 w-8 text-blue-600 mx-auto mb-3" />
                <h3 className="text-2xl font-bold">2,847</h3>
                <p className="text-gray-600 dark:text-gray-300">Total Violations</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6 text-center">
                <AlertTriangle className="h-8 w-8 text-red-600 mx-auto mb-3" />
                <h3 className="text-2xl font-bold">156</h3>
                <p className="text-gray-600 dark:text-gray-300">This Month</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6 text-center">
                <Clock className="h-8 w-8 text-green-600 mx-auto mb-3" />
                <h3 className="text-2xl font-bold">89%</h3>
                <p className="text-gray-600 dark:text-gray-300">Verification Rate</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Traffic Hotspots</CardTitle>
              <CardDescription>AI-identified high violation areas</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 border rounded">
                  <div>
                    <h4 className="font-medium">Main Market Square</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-300">Illegal parking, Triple riding</p>
                  </div>
                  <Badge variant="destructive">High Risk</Badge>
                </div>
                <div className="flex justify-between items-center p-3 border rounded">
                  <div>
                    <h4 className="font-medium">Highway Junction</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-300">Overspeeding, Signal jumping</p>
                  </div>
                  <Badge className="bg-orange-100 text-orange-800">Medium Risk</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}