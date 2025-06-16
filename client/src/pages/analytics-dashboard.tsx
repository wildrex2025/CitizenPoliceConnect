import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { 
  BarChart, 
  LineChart, 
  Activity, 
  AlertTriangle, 
  Shield, 
  Users, 
  Brain,
  MapPin,
  TrendingUp,
  Clock
} from "lucide-react";

interface DashboardData {
  totalIncidents: number;
  activeEmergencies: number;
  womenSafetyReports: number;
  childSafetyAlerts: number;
  cyberCrimeReports: number;
  crimeAnalysis: any;
  summary: any;
  recentIncidents: any[];
}

export default function AnalyticsDashboard() {
  const { t } = useLanguage();
  const { data: dashboardData, isLoading } = useQuery<DashboardData>({
    queryKey: ["/api/analytics/dashboard"],
  });

  const { data: crimeHeatmap } = useQuery<any[]>({
    queryKey: ["/api/analytics/crime-heatmap"],
  });

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <Activity className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p>{t('common.loading')}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          {t('analytics.title')}
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          {t('analytics.description')}
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm">{t('analytics.total_incidents')}</p>
                <p className="text-3xl font-bold">{dashboardData?.totalIncidents || 0}</p>
              </div>
              <BarChart className="h-8 w-8 text-blue-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-red-500 to-red-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-red-100 text-sm">{t('analytics.active_alerts')}</p>
                <p className="text-3xl font-bold">{dashboardData?.activeEmergencies || 0}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm">{t('nav.women_safety')}</p>
                <p className="text-3xl font-bold">{dashboardData?.womenSafetyReports || 0}</p>
              </div>
              <Shield className="h-8 w-8 text-purple-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm">{t('nav.child_safety')}</p>
                <p className="text-3xl font-bold">{dashboardData?.childSafetyAlerts || 0}</p>
              </div>
              <Users className="h-8 w-8 text-green-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100 text-sm">{t('nav.cyber_crime')}</p>
                <p className="text-3xl font-bold">{dashboardData?.cyberCrimeReports || 0}</p>
              </div>
              <Brain className="h-8 w-8 text-orange-200" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* AI Crime Analysis */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5" />
              {t('analytics.crime_trends')}
            </CardTitle>
            <CardDescription>
              {t('analytics.hotspots')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {dashboardData && dashboardData.crimeAnalysis?.hotspots?.length > 0 ? (
              <div className="space-y-4">
                <h4 className="font-medium text-sm text-gray-700 dark:text-gray-300">{t('analytics.hotspots')}</h4>
                {dashboardData.crimeAnalysis.hotspots.slice(0, 3).map((hotspot: any, index: number) => (
                  <div key={index} className="border rounded-lg p-3">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-red-500" />
                        <span className="font-medium text-sm">High Risk Area {index + 1}</span>
                      </div>
                      <Badge variant={hotspot.riskLevel === 'high' ? 'destructive' : 'secondary'}>
                        {hotspot.riskLevel}
                      </Badge>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {hotspot.crimeTypes?.map((type: string, i: number) => (
                        <Badge key={i} variant="outline" className="text-xs">
                          {type}
                        </Badge>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                {t('common.loading')}
              </p>
            )}
          </CardContent>
        </Card>

        {/* AI Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              {t('analytics.title')}
            </CardTitle>
            <CardDescription>
              {t('analytics.description')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="prose dark:prose-invert max-w-none">
              {dashboardData?.summary ? (
                <div className="space-y-4">
                  {/* Overview Section */}
                  {dashboardData.summary.overview && (
                    <div className="text-sm leading-relaxed">
                      <h5 className="font-medium mb-2">{t('analytics.description')}</h5>
                      <p className="text-gray-700 dark:text-gray-300">
                        {typeof dashboardData.summary.overview === 'string' 
                          ? dashboardData.summary.overview 
                          : t('common.loading')}
                      </p>
                    </div>
                  )}
                  
                  {/* Trends Section */}
                  {dashboardData.summary.trends && Array.isArray(dashboardData.summary.trends) && dashboardData.summary.trends.length > 0 && (
                    <div className="text-sm">
                      <h5 className="font-medium mb-2">{t('analytics.crime_trends')}</h5>
                      <ul className="space-y-1 text-gray-700 dark:text-gray-300">
                        {dashboardData.summary.trends.map((trend: string, index: number) => (
                          <li key={index} className="flex items-start gap-2">
                            <span className="text-blue-500 mt-1">•</span>
                            {trend}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {/* Insights Section */}
                  {dashboardData.summary.insights && Array.isArray(dashboardData.summary.insights) && dashboardData.summary.insights.length > 0 && (
                    <div className="text-sm">
                      <h5 className="font-medium mb-2">{t('analytics.time_patterns')}</h5>
                      <ul className="space-y-1 text-gray-700 dark:text-gray-300">
                        {dashboardData.summary.insights.map((insight: string, index: number) => (
                          <li key={index} className="flex items-start gap-2">
                            <span className="text-green-500 mt-1">•</span>
                            {insight}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {/* Fallback if summary is a string */}
                  {typeof dashboardData.summary === 'string' && (
                    <div className="text-sm leading-relaxed text-gray-700 dark:text-gray-300">
                      {dashboardData.summary}
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                  {t('common.loading')}
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Incidents */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            {t('analytics.recent_incidents')}
          </CardTitle>
          <CardDescription>
            {t('analytics.description')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {dashboardData && dashboardData.recentIncidents?.length > 0 ? (
              dashboardData.recentIncidents.map((incident: any, index: number) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className="font-medium">
                        {incident.title || incident.incidentType || incident.alertType || 'Incident'}
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        {incident.description?.slice(0, 100)}...
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Badge variant="outline" className="capitalize">
                        {incident.type.replace('_', ' ')}
                      </Badge>
                      {incident.priority && (
                        <Badge 
                          variant={incident.priority === 'high' || incident.priority === 'critical' ? 'destructive' : 'secondary'}
                        >
                          {incident.priority}
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="flex justify-between items-center text-sm text-gray-500 dark:text-gray-400">
                    <span>
                      {new Date(incident.createdAt || incident.timeOfIncident).toLocaleString('en-IN')}
                    </span>
                    <Badge variant="outline" className="text-xs">
                      {incident.status}
                    </Badge>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                {t('common.loading')}
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-4 justify-center">
        <Button className="bg-blue-600 hover:bg-blue-700">
          <BarChart className="h-4 w-4 mr-2" />
          {t('common.submit')}
        </Button>
        <Button variant="outline">
          <MapPin className="h-4 w-4 mr-2" />
          {t('analytics.hotspots')}
        </Button>
        <Button variant="outline">
          <Brain className="h-4 w-4 mr-2" />
          {t('analytics.time_patterns')}
        </Button>
        <Button variant="outline">
          <Activity className="h-4 w-4 mr-2" />
          {t('analytics.crime_trends')}
        </Button>
      </div>
    </div>
  );
}