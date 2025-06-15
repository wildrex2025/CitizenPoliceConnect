import { useState, useRef } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Camera, 
  MapPin, 
  AlertTriangle, 
  Phone,
  Clock,
  Users,
  Car,
  Ambulance,
  Shield,
  Upload,
  Video,
  FileText
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function TrafficAccidentReporting() {
  const [accidentData, setAccidentData] = useState({
    location: { lat: 0, lng: 0, address: "" },
    accidentType: "",
    severity: "",
    vehiclesInvolved: [],
    casualties: 0,
    description: "",
    weatherConditions: "",
    roadConditions: "",
    trafficConditions: "",
    ambulanceRequired: false,
    policeRequired: true,
    fireServiceRequired: false,
    reporterName: "",
    reporterContact: "",
    witnessDetails: "",
    isAnonymous: false
  });

  const [evidencePhotos, setEvidencePhotos] = useState<string[]>([]);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const submitAccidentMutation = useMutation({
    mutationFn: (data: any) => apiRequest("/api/traffic/accidents", "POST", data),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ["/api/traffic/accidents"] });
      
      toast({ 
        title: "Accident Reported Successfully!", 
        description: "Emergency services have been notified. Help is on the way."
      });
      
      // Reset form
      setAccidentData({
        location: { lat: 0, lng: 0, address: "" },
        accidentType: "",
        severity: "",
        vehiclesInvolved: [],
        casualties: 0,
        description: "",
        weatherConditions: "",
        roadConditions: "",
        trafficConditions: "",
        ambulanceRequired: false,
        policeRequired: true,
        fireServiceRequired: false,
        reporterName: "",
        reporterContact: "",
        witnessDetails: "",
        isAnonymous: false
      });
      setEvidencePhotos([]);
      setVideoFile(null);
    },
  });

  const handleImageCapture = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      const newImages: string[] = [];
      Array.from(files).forEach(file => {
        const reader = new FileReader();
        reader.onload = (e) => {
          newImages.push(e.target?.result as string);
          if (newImages.length === files.length) {
            setEvidencePhotos(prev => [...prev, ...newImages]);
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

  const handleSubmitAccident = () => {
    if (!accidentData.accidentType || !accidentData.location.address) {
      toast({ 
        title: "Missing Information", 
        description: "Please provide accident type and location details.",
        variant: "destructive" 
      });
      return;
    }

    const accidentReport = {
      ...accidentData,
      evidencePhotos,
      evidenceVideo: videoFile ? URL.createObjectURL(videoFile) : null,
      timestamp: new Date().toISOString(),
      status: 'reported'
    };

    submitAccidentMutation.mutate(accidentReport);
  };

  return (
    <div className="container mx-auto p-6 space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Traffic Accident Reporting
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          अपघात नोंदणी | Emergency Accident Reporting System
        </p>
      </div>

      <Card className="border-red-200 dark:border-red-800">
        <CardHeader className="bg-red-50 dark:bg-red-900/20">
          <CardTitle className="flex items-center gap-2 text-red-800 dark:text-red-300">
            <AlertTriangle className="h-5 w-5" />
            Emergency Accident Report
          </CardTitle>
          <CardDescription className="text-red-600 dark:text-red-400">
            Immediate assistance will be dispatched based on your report
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 pt-6">
          {/* Emergency Services Required */}
          <div className="space-y-4">
            <Label className="text-base font-medium text-red-700 dark:text-red-300">
              Emergency Services Required
            </Label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="ambulance"
                  checked={accidentData.ambulanceRequired}
                  onCheckedChange={(checked) => 
                    setAccidentData(prev => ({ ...prev, ambulanceRequired: checked as boolean }))
                  }
                />
                <Label htmlFor="ambulance" className="flex items-center gap-2">
                  <Ambulance className="h-4 w-4 text-red-600" />
                  Ambulance (रुग्णवाहिका)
                </Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="police"
                  checked={accidentData.policeRequired}
                  onCheckedChange={(checked) => 
                    setAccidentData(prev => ({ ...prev, policeRequired: checked as boolean }))
                  }
                />
                <Label htmlFor="police" className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-blue-600" />
                  Police (पोलीस)
                </Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="fire"
                  checked={accidentData.fireServiceRequired}
                  onCheckedChange={(checked) => 
                    setAccidentData(prev => ({ ...prev, fireServiceRequired: checked as boolean }))
                  }
                />
                <Label htmlFor="fire" className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-orange-600" />
                  Fire Service (अग्निशामक)
                </Label>
              </div>
            </div>
          </div>

          {/* Accident Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="accidentType">Accident Type</Label>
              <Select onValueChange={(value) => setAccidentData(prev => ({ ...prev, accidentType: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select accident type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="vehicle_collision">Vehicle Collision</SelectItem>
                  <SelectItem value="pedestrian_hit">Pedestrian Hit</SelectItem>
                  <SelectItem value="single_vehicle">Single Vehicle Accident</SelectItem>
                  <SelectItem value="motorcycle_accident">Motorcycle Accident</SelectItem>
                  <SelectItem value="hit_and_run">Hit and Run</SelectItem>
                  <SelectItem value="overturn">Vehicle Overturn</SelectItem>
                  <SelectItem value="fire_explosion">Fire/Explosion</SelectItem>
                  <SelectItem value="animal_collision">Animal Collision</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="severity">Severity Level</Label>
              <Select onValueChange={(value) => setAccidentData(prev => ({ ...prev, severity: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select severity" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="minor">Minor (Property damage only)</SelectItem>
                  <SelectItem value="moderate">Moderate (Minor injuries)</SelectItem>
                  <SelectItem value="serious">Serious (Major injuries)</SelectItem>
                  <SelectItem value="fatal">Fatal (Life-threatening)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="casualties">Number of Casualties</Label>
              <Input
                id="casualties"
                type="number"
                min="0"
                value={accidentData.casualties}
                onChange={(e) => setAccidentData(prev => ({ 
                  ...prev, 
                  casualties: parseInt(e.target.value) || 0 
                }))}
              />
            </div>

            <div>
              <Label htmlFor="location">Accident Location</Label>
              <Input
                id="location"
                placeholder="Enter exact location/landmark"
                value={accidentData.location.address}
                onChange={(e) => setAccidentData(prev => ({ 
                  ...prev, 
                  location: { ...prev.location, address: e.target.value }
                }))}
              />
            </div>
          </div>

          {/* Conditions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="weather">Weather Conditions</Label>
              <Select onValueChange={(value) => setAccidentData(prev => ({ ...prev, weatherConditions: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Weather" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="clear">Clear</SelectItem>
                  <SelectItem value="rainy">Rainy</SelectItem>
                  <SelectItem value="foggy">Foggy</SelectItem>
                  <SelectItem value="stormy">Stormy</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="road">Road Conditions</Label>
              <Select onValueChange={(value) => setAccidentData(prev => ({ ...prev, roadConditions: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Road condition" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="dry">Dry</SelectItem>
                  <SelectItem value="wet">Wet</SelectItem>
                  <SelectItem value="icy">Icy</SelectItem>
                  <SelectItem value="muddy">Muddy</SelectItem>
                  <SelectItem value="pothole">Potholes</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="traffic">Traffic Conditions</Label>
              <Select onValueChange={(value) => setAccidentData(prev => ({ ...prev, trafficConditions: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Traffic" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">Light</SelectItem>
                  <SelectItem value="moderate">Moderate</SelectItem>
                  <SelectItem value="heavy">Heavy</SelectItem>
                  <SelectItem value="congested">Congested</SelectItem>
                </SelectContent>
              </Select>
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
                  Take Photos ({evidencePhotos.length})
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
                  {videoFile ? 'Video Captured' : 'Record Video'}
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
            
            {evidencePhotos.length > 0 && (
              <div className="grid grid-cols-4 gap-2">
                {evidencePhotos.map((image, index) => (
                  <img 
                    key={index} 
                    src={image} 
                    alt={`Evidence ${index + 1}`}
                    className="w-full h-20 object-cover rounded border"
                  />
                ))}
              </div>
            )}
          </div>

          {/* Description */}
          <div>
            <Label htmlFor="description">Accident Description</Label>
            <Textarea
              id="description"
              placeholder="Describe what happened in detail..."
              value={accidentData.description}
              onChange={(e) => setAccidentData(prev => ({ ...prev, description: e.target.value }))}
              rows={4}
            />
          </div>

          {/* Reporter Information */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="anonymous"
                checked={accidentData.isAnonymous}
                onCheckedChange={(checked) => 
                  setAccidentData(prev => ({ ...prev, isAnonymous: checked as boolean }))
                }
              />
              <Label htmlFor="anonymous">Report anonymously</Label>
            </div>

            {!accidentData.isAnonymous && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="reporterName">Your Name</Label>
                  <Input
                    id="reporterName"
                    value={accidentData.reporterName}
                    onChange={(e) => setAccidentData(prev => ({ ...prev, reporterName: e.target.value }))}
                  />
                </div>
                
                <div>
                  <Label htmlFor="reporterContact">Contact Number</Label>
                  <Input
                    id="reporterContact"
                    type="tel"
                    value={accidentData.reporterContact}
                    onChange={(e) => setAccidentData(prev => ({ ...prev, reporterContact: e.target.value }))}
                  />
                </div>
              </div>
            )}
          </div>

          <Button 
            onClick={handleSubmitAccident}
            disabled={submitAccidentMutation.isPending}
            className="w-full bg-red-600 hover:bg-red-700 text-white text-lg py-3"
          >
            {submitAccidentMutation.isPending ? (
              <>
                <Clock className="h-4 w-4 mr-2 animate-spin" />
                Dispatching Emergency Services...
              </>
            ) : (
              <>
                <AlertTriangle className="h-4 w-4 mr-2" />
                Report Accident - Send Help Now
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Emergency Contacts */}
      <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-800 dark:text-blue-300">
            <Phone className="h-5 w-5" />
            Emergency Contacts
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">108</div>
              <div className="text-sm">Ambulance</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">100</div>
              <div className="text-sm">Police</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">101</div>
              <div className="text-sm">Fire Service</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}