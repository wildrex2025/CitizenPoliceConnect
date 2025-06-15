import { Link } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Shield, 
  FileText, 
  Car, 
  Phone, 
  Users, 
  Baby, 
  Globe, 
  AlertTriangle,
  MapPin,
  MessageSquare,
  BarChart
} from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto p-6">
        {/* Header */}
        <div className="text-center py-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            अहिल्यानगर पोलीस नागरिक सेवा
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-2">
            Ahilyangara Police Citizen Services
          </p>
          <p className="text-gray-500 dark:text-gray-400">
            Your safety and security is our priority
          </p>
        </div>

        {/* Emergency Services */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-center mb-6 text-gray-900 dark:text-white">
            आपत्कालीन सेवा | Emergency Services
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 hover:shadow-lg transition-shadow">
              <CardContent className="p-6 text-center">
                <Shield className="h-12 w-12 text-red-600 dark:text-red-400 mx-auto mb-4" />
                <h3 className="font-bold text-red-800 dark:text-red-300 mb-2">SOS Emergency</h3>
                <p className="text-sm text-red-600 dark:text-red-400 mb-4">
                  Voice-activated emergency with AI verification
                </p>
                <Link href="/emergency">
                  <Button className="w-full bg-red-600 hover:bg-red-700 text-white">
                    Emergency System
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800 hover:shadow-lg transition-shadow">
              <CardContent className="p-6 text-center">
                <Users className="h-12 w-12 text-purple-600 dark:text-purple-400 mx-auto mb-4" />
                <h3 className="font-bold text-purple-800 dark:text-purple-300 mb-2">Women Safety</h3>
                <p className="text-sm text-purple-600 dark:text-purple-400 mb-4">
                  महिला सुरक्षा केंद्र व सुरक्षित मार्ग
                </p>
                <Link href="/women-safety">
                  <Button className="w-full bg-purple-600 hover:bg-purple-700 text-white">
                    Access Services
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 hover:shadow-lg transition-shadow">
              <CardContent className="p-6 text-center">
                <Baby className="h-12 w-12 text-blue-600 dark:text-blue-400 mx-auto mb-4" />
                <h3 className="font-bold text-blue-800 dark:text-blue-300 mb-2">Child Safety</h3>
                <p className="text-sm text-blue-600 dark:text-blue-400 mb-4">
                  बाल संरक्षण व ट्रॅकिंग सेवा
                </p>
                <Link href="/child-safety">
                  <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                    Child Protection
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Main Services */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-center mb-6 text-gray-900 dark:text-white">
            मुख्य सेवा | Main Services
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Link href="/complaints">
              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardContent className="p-6 text-center">
                  <FileText className="h-8 w-8 text-green-600 dark:text-green-400 mx-auto mb-3" />
                  <h3 className="font-semibold mb-2">File Complaint</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300">तक्रार नोंदवा</p>
                </CardContent>
              </Card>
            </Link>

            <Link href="/fir">
              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardContent className="p-6 text-center">
                  <AlertTriangle className="h-8 w-8 text-orange-600 dark:text-orange-400 mx-auto mb-3" />
                  <h3 className="font-semibold mb-2">FIR Registration</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300">FIR नोंदणी</p>
                </CardContent>
              </Card>
            </Link>

            <Link href="/traffic">
              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardContent className="p-6 text-center">
                  <Car className="h-8 w-8 text-blue-600 dark:text-blue-400 mx-auto mb-3" />
                  <h3 className="font-semibold mb-2">Traffic Services</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300">वाहतूक सेवा</p>
                </CardContent>
              </Card>
            </Link>

            <Link href="/cyber-crime">
              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardContent className="p-6 text-center">
                  <Globe className="h-8 w-8 text-purple-600 dark:text-purple-400 mx-auto mb-3" />
                  <h3 className="font-semibold mb-2">Cyber Crime</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300">सायबर गुन्हा</p>
                </CardContent>
              </Card>
            </Link>
          </div>
        </div>

        {/* Community Services */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-center mb-6 text-gray-900 dark:text-white">
            समुदायिक सेवा | Community Services
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Link href="/analytics">
              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardContent className="p-6 text-center">
                  <Users className="h-8 w-8 text-indigo-600 dark:text-indigo-400 mx-auto mb-3" />
                  <h3 className="font-semibold mb-2">AI Analytics</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300">डेटा विश्लेषण</p>
                </CardContent>
              </Card>
            </Link>

            <Link href="/feedback">
              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardContent className="p-6 text-center">
                  <MessageSquare className="h-8 w-8 text-green-600 dark:text-green-400 mx-auto mb-3" />
                  <h3 className="font-semibold mb-2">Feedback</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300">अभिप्राय</p>
                </CardContent>
              </Card>
            </Link>

            <Link href="/emergency-contacts">
              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardContent className="p-6 text-center">
                  <Phone className="h-8 w-8 text-red-600 dark:text-red-400 mx-auto mb-3" />
                  <h3 className="font-semibold mb-2">Emergency Contacts</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300">आपत्कालीन संपर्क</p>
                </CardContent>
              </Card>
            </Link>
          </div>
        </div>

        {/* Important Numbers */}
        <Card className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
          <CardHeader>
            <CardTitle className="text-center">महत्वाचे फोन नंबर | Important Phone Numbers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold">100</div>
                <div className="text-sm">Police Emergency</div>
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
    </div>
  );
}