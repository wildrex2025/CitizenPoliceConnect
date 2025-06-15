import OpenAI from 'openai';
import { GoogleGenerativeAI } from '@google/generative-ai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || '');

export class AIService {
  async analyzeComplaint(description: string): Promise<{
    category: string;
    priority: string;
    keywords: string[];
    sentiment: string;
  }> {
    try {
      const prompt = `Analyze this police complaint and provide:
1. Category (crime/traffic/corruption/other)
2. Priority (low/medium/high/urgent)
3. Key keywords
4. Sentiment (positive/neutral/negative)

Complaint: "${description}"

Respond in JSON format only.`;

      const response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.3,
      });

      const analysis = JSON.parse(response.choices[0].message.content || '{}');
      return analysis;
    } catch (error) {
      console.error('Error analyzing complaint:', error);
      return {
        category: 'other',
        priority: 'medium',
        keywords: [],
        sentiment: 'neutral'
      };
    }
  }

  async detectFakeEmergency(alertData: any): Promise<{
    isFake: boolean;
    confidence: number;
    reason: string;
  }> {
    try {
      const prompt = `Analyze this emergency alert for potential fake/false alarm indicators:
Location: ${JSON.stringify(alertData.location)}
Alert Type: ${alertData.alertType}
Time Pattern: Submitted at ${new Date().toISOString()}
Voice Activated: ${alertData.isVoiceActivated}
Silent Alert: ${alertData.isSilentAlert}

Check for:
1. Location consistency
2. Time patterns (repeated alerts)
3. Alert type appropriateness
4. Behavioral patterns

Respond with JSON: {"isFake": boolean, "confidence": 0-100, "reason": "explanation"}`;

      const response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.2,
      });

      return JSON.parse(response.choices[0].message.content || '{"isFake": false, "confidence": 0, "reason": "Analysis failed"}');
    } catch (error) {
      console.error('Error detecting fake emergency:', error);
      return { isFake: false, confidence: 0, reason: 'Analysis unavailable' };
    }
  }

  async generateSafeRouteRecommendations(startLocation: any, endLocation: any, timeOfDay: string): Promise<{
    routes: Array<{
      name: string;
      safetyRating: number;
      features: string[];
      estimatedTime: number;
    }>;
  }> {
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-pro" });
      
      const prompt = `Generate safe route recommendations for women traveling:
From: ${JSON.stringify(startLocation)}
To: ${JSON.stringify(endLocation)}
Time: ${timeOfDay}

Consider factors:
- Well-lit areas
- CCTV coverage
- Police patrol routes
- Crowded/busy areas
- Known safe zones

Provide 3 route options with safety ratings (1-5) and key safety features.
Respond in JSON format.`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      return JSON.parse(text);
    } catch (error) {
      console.error('Error generating safe routes:', error);
      return {
        routes: [{
          name: "Main Road Route",
          safetyRating: 4,
          features: ["well_lit", "crowded_area"],
          estimatedTime: 15
        }]
      };
    }
  }

  async analyzeCrimePattern(incidents: any[]): Promise<{
    hotspots: Array<{ location: any; riskLevel: string; crimeTypes: string[] }>;
    timePatterns: any;
    predictions: any;
  }> {
    try {
      const prompt = `Analyze these crime incidents for patterns:
${JSON.stringify(incidents.slice(0, 50))}

Identify:
1. Geographic hotspots
2. Time-based patterns
3. Crime type correlations
4. Risk predictions

Respond in JSON format with hotspots, timePatterns, and predictions.`;

      const response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.3,
      });

      return JSON.parse(response.choices[0].message.content || '{}');
    } catch (error) {
      console.error('Error analyzing crime patterns:', error);
      return {
        hotspots: [],
        timePatterns: {},
        predictions: {}
      };
    }
  }

  async detectCyberthreat(url: string, description: string): Promise<{
    isThreat: boolean;
    threatType: string;
    confidence: number;
    recommendations: string[];
  }> {
    try {
      const prompt = `Analyze this potential cyber threat:
URL: ${url}
Description: ${description}

Check for:
1. Phishing indicators
2. Malicious patterns
3. Social engineering tactics
4. Financial fraud signs

Provide threat assessment and safety recommendations.
Respond in JSON format.`;

      const response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.2,
      });

      return JSON.parse(response.choices[0].message.content || '{}');
    } catch (error) {
      console.error('Error detecting cyber threat:', error);
      return {
        isThreat: false,
        threatType: 'unknown',
        confidence: 0,
        recommendations: ['Unable to analyze threat']
      };
    }
  }

  async generateIncidentSummary(reports: any[]): Promise<string> {
    try {
      const prompt = `Generate a comprehensive incident summary for police dashboard:
${JSON.stringify(reports.slice(0, 20))}

Include:
- Total incidents by category
- Severity distribution
- Geographic spread
- Time patterns
- Key concerns requiring attention

Format as a professional police briefing in both English and Marathi.`;

      const response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.4,
      });

      return response.choices[0].message.content || 'Summary generation failed';
    } catch (error) {
      console.error('Error generating incident summary:', error);
      return 'Unable to generate summary at this time.';
    }
  }
}

export const aiService = new AIService();