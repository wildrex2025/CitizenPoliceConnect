import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Mic, MicOff, Phone, MapPin, Shield, Volume2 } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function EmergencySOS() {
  const [isListening, setIsListening] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [location, setLocation] = useState<{ lat: number; lng: number; address: string } | null>(null);
  const [emergencyForm, setEmergencyForm] = useState({
    alertType: "general",
    isSilentAlert: false,
    isVoiceActivated: false,
    medicalInfo: "",
    audioRecording: ""
  });
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  interface SOSResponse {
    fakeDetection?: {
      isFake?: boolean;
      confidence?: number;
      reason?: string;
    };
  }

  const sosAlertMutation = useMutation<SOSResponse, Error, any>({
    mutationFn: async (data: any): Promise<SOSResponse> => {
      const response = await apiRequest("/api/sos", "POST", data);
      return response as SOSResponse;
    },
    onSuccess: (response: SOSResponse) => {
      queryClient.invalidateQueries({ queryKey: ["/api/sos/active"] });
      toast({ 
        title: "Emergency Alert Sent!", 
        description: "Emergency services have been notified. Help is on the way."
      });
      
      // Show fraud detection results if available
      if (response.fakeDetection?.isFake && response.fakeDetection.confidence && response.fakeDetection.confidence > 70) {
        toast({
          title: "Alert Review Required",
          description: `This alert requires verification: ${response.fakeDetection.reason}`,
          variant: "destructive"
        });
      }
    },
  });

  // Get user's current location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setLocation({
            lat: latitude,
            lng: longitude,
            address: `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`
          });
        },
        (error) => {
          console.error("Error getting location:", error);
          toast({
            title: "Location Error",
            description: "Unable to get your location. Emergency services will be notified without location data.",
            variant: "destructive"
          });
        }
      );
    }
  }, [toast]);

  // Voice activation listener
  useEffect(() => {
    if (!isListening) return;

    const recognition = new (window as any).webkitSpeechRecognition || new (window as any).SpeechRecognition();
    if (!recognition) {
      toast({
        title: "Voice Recognition Not Supported",
        description: "Your browser doesn't support voice recognition.",
        variant: "destructive"
      });
      return;
    }

    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-IN';

    recognition.onresult = (event: any) => {
      const transcript = event.results[event.results.length - 1][0].transcript.toLowerCase();
      
      // Check for emergency keywords
      if (transcript.includes('help me') || transcript.includes('emergency') || transcript.includes('police')) {
        setEmergencyForm(prev => ({ ...prev, isVoiceActivated: true }));
        handleEmergencyAlert('general');
        setIsListening(false);
      }
    };

    recognition.start();

    return () => {
      recognition.stop();
    };
  }, [isListening]);

  const handleEmergencyAlert = (alertType: string) => {
    if (!location) {
      toast({
        title: "Location Required",
        description: "Please enable location services for emergency alerts.",
        variant: "destructive"
      });
      return;
    }

    const alertData = {
      userId: 1, // In production, this would be from authenticated user
      location,
      alertType,
      isSilentAlert: emergencyForm.isSilentAlert,
      isVoiceActivated: emergencyForm.isVoiceActivated,
      medicalInfo: emergencyForm.medicalInfo ? { info: emergencyForm.medicalInfo } : null,
      audioRecording: emergencyForm.audioRecording
    };

    sosAlertMutation.mutate(alertData);
  };

  const startVoiceActivation = () => {
    setIsListening(true);
    toast({
      title: "Voice Activation Started",
      description: "Say 'Help Me' to trigger emergency alert"
    });
  };

  const stopVoiceActivation = () => {
    setIsListening(false);
    toast({
      title: "Voice Activation Stopped"
    });
  };

  return (
    <div className="container mx-auto p-6 space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-red-600 dark:text-red-400 mb-2">
          🚨 Emergency SOS System
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          Advanced emergency response with AI-powered verification
        </p>
      </div>

      {/* Quick Emergency Buttons */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800">
          <CardContent className="p-6 text-center">
            <AlertTriangle className="h-12 w-12 text-red-600 dark:text-red-400 mx-auto mb-4" />
            <h3 className="font-bold text-red-800 dark:text-red-300 mb-2">Immediate Emergency</h3>
            <Button 
              onClick={() => handleEmergencyAlert('general')}
              className="w-full bg-red-600 hover:bg-red-700 text-white"
              disabled={sosAlertMutation.isPending}
            >
              {sosAlertMutation.isPending ? "Sending Alert..." : "SEND SOS"}
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800">
          <CardContent className="p-6 text-center">
            <Shield className="h-12 w-12 text-purple-600 dark:text-purple-400 mx-auto mb-4" />
            <h3 className="font-bold text-purple-800 dark:text-purple-300 mb-2">Women Emergency</h3>
            <Button 
              onClick={() => handleEmergencyAlert('women_safety')}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white"
              disabled={sosAlertMutation.isPending}
            >
              Women Safety Alert
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800">
          <CardContent className="p-6 text-center">
            <Phone className="h-12 w-12 text-orange-600 dark:text-orange-400 mx-auto mb-4" />
            <h3 className="font-bold text-orange-800 dark:text-orange-300 mb-2">Medical Emergency</h3>
            <Button 
              onClick={() => handleEmergencyAlert('medical')}
              className="w-full bg-orange-600 hover:bg-orange-700 text-white"
              disabled={sosAlertMutation.isPending}
            >
              Medical Alert
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Voice Activation */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mic className="h-5 w-5" />
              Voice-Activated Emergency
            </CardTitle>
            <CardDescription>
              Say "Help Me" to automatically trigger emergency alert
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center">
              {isListening ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-center">
                    <div className="animate-pulse bg-red-500 rounded-full h-16 w-16 flex items-center justify-center">
                      <Volume2 className="h-8 w-8 text-white" />
                    </div>
                  </div>
                  <p className="text-red-600 dark:text-red-400 font-medium">
                    Listening for emergency keywords...
                  </p>
                  <Button onClick={stopVoiceActivation} variant="outline">
                    <MicOff className="h-4 w-4 mr-2" />
                    Stop Listening
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <Button onClick={startVoiceActivation} className="w-full">
                    <Mic className="h-4 w-4 mr-2" />
                    Start Voice Activation
                  </Button>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Keywords: "Help Me", "Emergency", "Police"
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Silent Alert & Medical Info */}
        <Card>
          <CardHeader>
            <CardTitle>Advanced Emergency Options</CardTitle>
            <CardDescription>
              Additional options for emergency situations
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="silentAlert"
                checked={emergencyForm.isSilentAlert}
                onChange={(e) => setEmergencyForm(prev => ({ ...prev, isSilentAlert: e.target.checked }))}
                className="rounded"
              />
              <Label htmlFor="silentAlert">Silent Alert (No sound/vibration)</Label>
            </div>

            <div>
              <Label htmlFor="medicalInfo">Medical Information</Label>
              <Textarea
                id="medicalInfo"
                placeholder="Blood group, allergies, medical conditions..."
                value={emergencyForm.medicalInfo}
                onChange={(e) => setEmergencyForm(prev => ({ ...prev, medicalInfo: e.target.value }))}
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="alertType">Emergency Type</Label>
              <Select 
                value={emergencyForm.alertType} 
                onValueChange={(value) => setEmergencyForm(prev => ({ ...prev, alertType: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select emergency type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="general">General Emergency</SelectItem>
                  <SelectItem value="medical">Medical Emergency</SelectItem>
                  <SelectItem value="women_safety">Women Safety</SelectItem>
                  <SelectItem value="child_emergency">Child Emergency</SelectItem>
                  <SelectItem value="fire">Fire Emergency</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button 
              onClick={() => handleEmergencyAlert(emergencyForm.alertType)}
              className="w-full"
              disabled={sosAlertMutation.isPending}
            >
              Send Custom Emergency Alert
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Current Location */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Current Location
          </CardTitle>
        </CardHeader>
        <CardContent>
          {location ? (
            <div className="space-y-2">
              <Badge variant="outline" className="text-green-600">
                Location Detected
              </Badge>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Coordinates: {location.lat.toFixed(6)}, {location.lng.toFixed(6)}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Emergency services will be provided with your exact location
              </p>
            </div>
          ) : (
            <div className="text-center py-4">
              <p className="text-gray-500 dark:text-gray-400">Getting your location...</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Emergency Contacts */}
      <Card className="bg-gradient-to-r from-red-500 to-orange-600 text-white">
        <CardHeader>
          <CardTitle className="text-center">Emergency Contact Numbers</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold">100</div>
              <div className="text-sm">Police</div>
            </div>
            <div>
              <div className="text-2xl font-bold">108</div>
              <div className="text-sm">Ambulance</div>
            </div>
            <div>
              <div className="text-2xl font-bold">101</div>
              <div className="text-sm">Fire Brigade</div>
            </div>
            <div>
              <div className="text-2xl font-bold">1091</div>
              <div className="text-sm">Women Helpline</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}