import React, { createContext, useContext, useState, useEffect } from 'react';

interface LanguageContextType {
  language: 'en' | 'mr';
  setLanguage: (lang: 'en' | 'mr') => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Translation dictionaries
const translations: Record<'en' | 'mr', Record<string, string>> = {
  en: {
    // Navigation
    'nav.home': 'Home',
    'nav.traffic_guard': 'Traffic Guard',
    'nav.emergency_sos': 'Emergency SOS',
    'nav.women_safety': 'Women Safety',
    'nav.child_safety': 'Child Safety',
    'nav.cyber_crime': 'Cyber Crime',
    'nav.community_policing': 'Community Policing',

    'nav.analytics': 'Analytics Dashboard',
    
    // App Title and Headers
    'app.title': 'AhilyaNagar TrafficGuard Pro',
    'app.subtitle': 'Advanced Police-Citizen Safety Platform',
    'app.welcome': 'Welcome to AhilyaNagar TrafficGuard Pro',
    'app.description': 'Comprehensive traffic management and citizen safety platform for AhilyaNagar district',
    
    // Traffic Guard
    'traffic.title': 'AI Traffic Violation Detection',
    'traffic.description': 'Report traffic violations using AI-powered image analysis',
    'traffic.capture_image': 'Capture Image',
    'traffic.upload_image': 'Upload Image',
    'traffic.analyzing': 'Analyzing image...',
    'traffic.violation_detected': 'Traffic Violation Detected',
    'traffic.no_violation': 'No violation detected',
    'traffic.submit_report': 'Submit Report',
    'traffic.location': 'Location',
    'traffic.description_label': 'Description',
    'traffic.violation_type': 'Violation Type',
    'traffic.speeding': 'Speeding',
    'traffic.red_light': 'Red Light Violation',
    'traffic.illegal_parking': 'Illegal Parking',
    'traffic.no_helmet': 'No Helmet',
    'traffic.phone_use': 'Phone Use While Driving',
    'traffic.other': 'Other',
    
    // Emergency SOS
    'emergency.title': 'Emergency SOS',
    'emergency.description': 'Immediate emergency assistance with AI voice verification',
    'emergency.call_police': 'Call Police (100)',
    'emergency.call_fire': 'Call Fire Brigade (101)',
    'emergency.call_ambulance': 'Call Ambulance (108)',
    'emergency.call_women_helpline': 'Women Helpline (1091)',
    'emergency.voice_verification': 'Voice Verification Active',
    'emergency.fake_call_detected': 'Fake Call Detected',
    'emergency.emergency_type': 'Emergency Type',
    'emergency.location_sharing': 'Location Sharing: Enabled',
    'emergency.panic_button': 'PANIC BUTTON',
    
    // Women Safety
    'women_safety.title': 'Women Safety Portal',
    'women_safety.description': 'Safe route planning and emergency reporting for women',
    'women_safety.report_incident': 'Report Incident',
    'women_safety.safe_routes': 'Safe Routes',
    'women_safety.emergency_contacts': 'Emergency Contacts',
    'women_safety.incident_type': 'Incident Type',
    'women_safety.harassment': 'Harassment',
    'women_safety.stalking': 'Stalking',
    'women_safety.assault': 'Assault',
    'women_safety.suspicious_activity': 'Suspicious Activity',
    'women_safety.route_from': 'From',
    'women_safety.route_to': 'To',
    'women_safety.time_preference': 'Preferred Time',
    'women_safety.find_safe_route': 'Find Safe Route',
    
    // Child Safety
    'child_safety.title': 'Child Safety Monitoring',
    'child_safety.description': 'Real-time child tracking and safety alerts',
    'child_safety.add_child': 'Add Child',
    'child_safety.track_child': 'Track Child',
    'child_safety.safety_alert': 'Safety Alert',
    'child_safety.child_name': 'Child Name',
    'child_safety.age': 'Age',
    'child_safety.school': 'School',
    'child_safety.emergency_contact': 'Emergency Contact',
    'child_safety.geofence_alert': 'Geofence Alert',
    'child_safety.safe_zone': 'Safe Zone',
    
    // Cyber Crime
    'cyber_crime.title': 'Cyber Crime Reporting',
    'cyber_crime.description': 'Report online fraud, scams and cyber crimes',
    'cyber_crime.report_crime': 'Report Cyber Crime',
    'cyber_crime.crime_type': 'Crime Type',
    'cyber_crime.online_fraud': 'Online Fraud',
    'cyber_crime.identity_theft': 'Identity Theft',
    'cyber_crime.cyberbullying': 'Cyberbullying',
    'cyber_crime.phishing': 'Phishing',
    'cyber_crime.ransomware': 'Ransomware',
    'cyber_crime.financial_fraud': 'Financial Fraud',
    'cyber_crime.evidence': 'Evidence (Screenshots, URLs)',
    'cyber_crime.amount_involved': 'Amount Involved (if applicable)',
    
    // Community Policing
    'community.title': 'Community Policing',
    'community.description': 'Neighborhood watch and community safety initiatives',
    'community.create_group': 'Create Neighborhood Watch',
    'community.join_group': 'Join Existing Group',
    'community.report_suspicious': 'Report Suspicious Activity',
    'community.group_name': 'Group Name',
    'community.coordinator': 'Coordinator',
    'community.area_coverage': 'Area Coverage',
    'community.member_count': 'Members',
    

    
    // Analytics Dashboard
    'analytics.title': 'Analytics Dashboard',
    'analytics.description': 'Crime statistics and pattern analysis',
    'analytics.total_incidents': 'Total Incidents',
    'analytics.resolved_cases': 'Resolved Cases',
    'analytics.active_alerts': 'Active Alerts',
    'analytics.response_time': 'Avg Response Time',
    'analytics.crime_trends': 'Crime Trends',
    'analytics.hotspots': 'Crime Hotspots',
    'analytics.recent_incidents': 'Recent Incidents',
    'analytics.time_patterns': 'Time Patterns',
    
    // Common UI
    'common.submit': 'Submit',
    'common.cancel': 'Cancel',
    'common.save': 'Save',
    'common.edit': 'Edit',
    'common.delete': 'Delete',
    'common.loading': 'Loading...',
    'common.error': 'Error',
    'common.success': 'Success',
    'common.confirm': 'Confirm',
    'common.close': 'Close',
    'common.back': 'Back',
    'common.next': 'Next',
    'common.previous': 'Previous',
    'common.language': 'Language',
    'common.english': 'English',
    'common.marathi': 'मराठी',
    
    // Status Messages
    'status.pending': 'Pending',
    'status.investigating': 'Investigating',
    'status.resolved': 'Resolved',
    'status.active': 'Active',
    'status.inactive': 'Inactive',
    'status.verified': 'Verified',
    'status.unverified': 'Unverified',
  },
  mr: {
    // Navigation - मराठी
    'nav.home': 'मुख्य पृष्ठ',
    'nav.traffic_guard': 'ट्रॅफिक गार्ड',
    'nav.emergency_sos': 'आणीबाणी SOS',
    'nav.women_safety': 'महिला सुरक्षा',
    'nav.child_safety': 'बाल सुरक्षा',
    'nav.cyber_crime': 'सायबर गुन्हे',
    'nav.community_policing': 'सामुदायिक पोलिसिंग',

    'nav.analytics': 'विश्लेषण डॅशबोर्ड',
    
    // App Title and Headers
    'app.title': 'अहिल्यानगर ट्रॅफिकगार्ड प्रो',
    'app.subtitle': 'प्रगत पोलिस-नागरिक सुरक्षा प्लॅटफॉर्म',
    'app.welcome': 'अहिल्यानगर ट्रॅफिकगार्ड प्रो मध्ये आपले स्वागत',
    'app.description': 'अहिल्यानगर जिल्ह्यासाठी सर्वसमावेशक वाहतूक व्यवस्थापन आणि नागरिक सुरक्षा प्लॅटफॉर्म',
    
    // Traffic Guard
    'traffic.title': 'AI ट्रॅफिक उल्लंघन शोध',
    'traffic.description': 'AI-चालित प्रतिमा विश्लेषण वापरून वाहतूक उल्लंघनाची तक्रार करा',
    'traffic.capture_image': 'प्रतिमा काढा',
    'traffic.upload_image': 'प्रतिमा अपलोड करा',
    'traffic.analyzing': 'प्रतिमेचे विश्लेषण करत आहे...',
    'traffic.violation_detected': 'ट्रॅफिक उल्लंघन आढळले',
    'traffic.no_violation': 'कोणते उल्लंघन आढळले नाही',
    'traffic.submit_report': 'अहवाल सबमिट करा',
    'traffic.location': 'स्थान',
    'traffic.description_label': 'वर्णन',
    'traffic.violation_type': 'उल्लंघनाचा प्रकार',
    'traffic.speeding': 'वेगवान चालवणे',
    'traffic.red_light': 'लाल सिग्नल उल्लंघन',
    'traffic.illegal_parking': 'बेकायदेशीर पार्किंग',
    'traffic.no_helmet': 'हेल्मेट नाही',
    'traffic.phone_use': 'ड्रायव्हिंग करताना फोन वापर',
    'traffic.other': 'इतर',
    
    // Emergency SOS
    'emergency.title': 'आणीबाणी SOS',
    'emergency.description': 'AI आवाज सत्यापनासह तत्काळ आणीबाणी सहाय्य',
    'emergency.call_police': 'पोलिसांना कॉल करा (100)',
    'emergency.call_fire': 'अग्निशामक दलाला कॉल करा (101)',
    'emergency.call_ambulance': 'रुग्णवाहिकेला कॉल करा (108)',
    'emergency.call_women_helpline': 'महिला हेल्पलाइन (1091)',
    'emergency.voice_verification': 'आवाज सत्यापन सक्रिय',
    'emergency.fake_call_detected': 'खोटा कॉल आढळला',
    'emergency.emergency_type': 'आणीबाणीचा प्रकार',
    'emergency.location_sharing': 'स्थान शेअरिंग: सक्षम',
    'emergency.panic_button': 'पॅनिक बटण',
    
    // Women Safety
    'women_safety.title': 'महिला सुरक्षा पोर्टल',
    'women_safety.description': 'महिलांसाठी सुरक्षित मार्ग नियोजन आणि आणीबाणी अहवाल',
    'women_safety.report_incident': 'घटनेची तक्रार करा',
    'women_safety.safe_routes': 'सुरक्षित मार्ग',
    'women_safety.emergency_contacts': 'आणीबाणी संपर्क',
    'women_safety.incident_type': 'घटनेचा प्रकार',
    'women_safety.harassment': 'छळवणूक',
    'women_safety.stalking': 'पाठलाग',
    'women_safety.assault': 'हल्ला',
    'women_safety.suspicious_activity': 'संशयास्पद क्रियाकलाप',
    'women_safety.route_from': 'पासून',
    'women_safety.route_to': 'पर्यंत',
    'women_safety.time_preference': 'प्राधान्य वेळ',
    'women_safety.find_safe_route': 'सुरक्षित मार्ग शोधा',
    
    // Child Safety
    'child_safety.title': 'बाल सुरक्षा निरीक्षण',
    'child_safety.description': 'रिअल-टाइम बाल ट्रॅकिंग आणि सुरक्षा अलर्ट',
    'child_safety.add_child': 'मूल जोडा',
    'child_safety.track_child': 'मुलाचा मागोवा घ्या',
    'child_safety.safety_alert': 'सुरक्षा अलर्ट',
    'child_safety.child_name': 'मुलाचे नाव',
    'child_safety.age': 'वय',
    'child_safety.school': 'शाळा',
    'child_safety.emergency_contact': 'आणीबाणी संपर्क',
    'child_safety.geofence_alert': 'जिओफेन्स अलर्ट',
    'child_safety.safe_zone': 'सुरक्षित क्षेत्र',
    
    // Cyber Crime
    'cyber_crime.title': 'सायबर गुन्हे तक्रार',
    'cyber_crime.description': 'ऑनलाइन फसवणूक, घोटाळे आणि सायबर गुन्ह्यांची तक्रार करा',
    'cyber_crime.report_crime': 'सायबर गुन्ह्याची तक्रार करा',
    'cyber_crime.crime_type': 'गुन्ह्याचा प्रकार',
    'cyber_crime.online_fraud': 'ऑनलाइन फसवणूक',
    'cyber_crime.identity_theft': 'ओळख चोरी',
    'cyber_crime.cyberbullying': 'सायबर गुंडगिरी',
    'cyber_crime.phishing': 'फिशिंग',
    'cyber_crime.ransomware': 'रॅन्समवेअर',
    'cyber_crime.financial_fraud': 'आर्थिक फसवणूक',
    'cyber_crime.evidence': 'पुरावा (स्क्रीनशॉट, URL)',
    'cyber_crime.amount_involved': 'गुंतलेली रक्कम (जर लागू असेल)',
    
    // Community Policing
    'community.title': 'सामुदायिक पोलिसिंग',
    'community.description': 'शेजारी पहारा आणि सामुदायिक सुरक्षा उपक्रम',
    'community.create_group': 'शेजारी पहारा तयार करा',
    'community.join_group': 'अस्तित्वात असलेल्या गटात सामील व्हा',
    'community.report_suspicious': 'संशयास्पद क्रियाकलापाची तक्रार करा',
    'community.group_name': 'गटाचे नाव',
    'community.coordinator': 'समन्वयक',
    'community.area_coverage': 'क्षेत्र कव्हरेज',
    'community.member_count': 'सदस्य',
    

    
    // Analytics Dashboard
    'analytics.title': 'विश्लेषण डॅशबोर्ड',
    'analytics.description': 'गुन्हेगारी आकडेवारी आणि पॅटर्न विश्लेषण',
    'analytics.total_incidents': 'एकूण घटना',
    'analytics.resolved_cases': 'सोडवलेली प्रकरणे',
    'analytics.active_alerts': 'सक्रिय अलर्ट',
    'analytics.response_time': 'सरासरी प्रतिसाद वेळ',
    'analytics.crime_trends': 'गुन्हेगारी प्रवृत्ती',
    'analytics.hotspots': 'गुन्हेगारी हॉटस्पॉट्स',
    'analytics.recent_incidents': 'अलीकडील घटना',
    'analytics.time_patterns': 'वेळेचे पॅटर्न',
    
    // Common UI
    'common.submit': 'सबमिट करा',
    'common.cancel': 'रद्द करा',
    'common.save': 'जतन करा',
    'common.edit': 'संपादित करा',
    'common.delete': 'हटवा',
    'common.loading': 'लोड होत आहे...',
    'common.error': 'त्रुटी',
    'common.success': 'यशस्वी',
    'common.confirm': 'पुष्टी करा',
    'common.close': 'बंद करा',
    'common.back': 'मागे',
    'common.next': 'पुढे',
    'common.previous': 'मागील',
    'common.language': 'भाषा',
    'common.english': 'English',
    'common.marathi': 'मराठी',
    
    // Status Messages
    'status.pending': 'प्रलंबित',
    'status.investigating': 'तपास करत आहे',
    'status.resolved': 'सोडवले',
    'status.active': 'सक्रिय',
    'status.inactive': 'निष्क्रिय',
    'status.verified': 'सत्यापित',
    'status.unverified': 'असत्यापित',
  }
};

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<'en' | 'mr'>(() => {
    const saved = localStorage.getItem('language');
    return (saved as 'en' | 'mr') || 'en';
  });

  useEffect(() => {
    localStorage.setItem('language', language);
    document.documentElement.lang = language;
  }, [language]);

  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};