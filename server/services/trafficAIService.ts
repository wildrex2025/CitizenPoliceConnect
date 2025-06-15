import OpenAI from 'openai';
import { GoogleGenerativeAI } from '@google/generative-ai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || '');

export class TrafficAIService {
  async analyzeTrafficViolation(imageUrl: string, description: string): Promise<{
    violationType: string;
    confidence: number;
    licensePlate: string | null;
    vehicleType: string;
    speed: number | null;
    helmetDetected: boolean;
    severityLevel: string;
    aiAnalysis: any;
  }> {
    try {
      const prompt = `Analyze this traffic violation image and provide detailed assessment:
Image: ${imageUrl}
Description: ${description}

Analyze for:
1. Violation type (mobile_phone, no_helmet, overspeeding, signal_jump, wrong_side, illegal_parking, triple_riding, drunk_driving)
2. License plate number (if visible)
3. Vehicle type (two_wheeler, car, truck, bus, tractor, auto_rickshaw)
4. Estimated speed (if overspeeding)
5. Helmet detection for two-wheelers
6. Severity level (low, medium, high, critical)
7. Additional observations

Respond in JSON format only.`;

      const response = await openai.chat.completions.create({
        model: "gpt-4-vision-preview",
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: prompt },
              { type: "image_url", image_url: { url: imageUrl } }
            ]
          }
        ],
        temperature: 0.2,
        max_tokens: 500,
      });

      const analysis = JSON.parse(response.choices[0].message.content || '{}');
      
      return {
        violationType: analysis.violationType || 'unknown',
        confidence: analysis.confidence || 0,
        licensePlate: analysis.licensePlate || null,
        vehicleType: analysis.vehicleType || 'unknown',
        speed: analysis.speed || null,
        helmetDetected: analysis.helmetDetected || false,
        severityLevel: analysis.severityLevel || 'medium',
        aiAnalysis: analysis
      };
    } catch (error) {
      console.error('Error analyzing traffic violation:', error);
      return {
        violationType: 'unknown',
        confidence: 0,
        licensePlate: null,
        vehicleType: 'unknown',
        speed: null,
        helmetDetected: false,
        severityLevel: 'medium',
        aiAnalysis: { error: 'Analysis failed' }
      };
    }
  }

  async detectLicensePlate(imageUrl: string): Promise<{
    plateNumber: string | null;
    confidence: number;
    state: string | null;
    vehicleType: string;
  }> {
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-pro-vision" });
      
      const prompt = `Extract license plate information from this vehicle image:
1. License plate number (format: MH12AB1234)
2. State code (MH, DL, KA, etc.)
3. Vehicle type identification
4. Confidence level (0-100)

Provide response in JSON format.`;

      // Note: In production, you'd convert imageUrl to proper format for Gemini
      const result = await model.generateContent([prompt]);
      const response = await result.response;
      const text = response.text();
      
      const analysis = JSON.parse(text);
      
      return {
        plateNumber: analysis.plateNumber || null,
        confidence: analysis.confidence || 0,
        state: analysis.state || null,
        vehicleType: analysis.vehicleType || 'unknown'
      };
    } catch (error) {
      console.error('Error detecting license plate:', error);
      return {
        plateNumber: null,
        confidence: 0,
        state: null,
        vehicleType: 'unknown'
      };
    }
  }

  async calculateTrafficDensity(imageUrl: string, location: any): Promise<{
    density: string;
    vehicleCount: number;
    recommendations: string[];
  }> {
    try {
      const prompt = `Analyze traffic density in this image:
Location: ${JSON.stringify(location)}

Count and categorize:
1. Total vehicles visible
2. Traffic density level (low/medium/high/congested)
3. Traffic flow recommendations
4. Signal timing suggestions

Respond in JSON format.`;

      const response = await openai.chat.completions.create({
        model: "gpt-4-vision-preview",
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: prompt },
              { type: "image_url", image_url: { url: imageUrl } }
            ]
          }
        ],
        temperature: 0.3,
      });

      const analysis = JSON.parse(response.choices[0].message.content || '{}');
      
      return {
        density: analysis.density || 'medium',
        vehicleCount: analysis.vehicleCount || 0,
        recommendations: analysis.recommendations || []
      };
    } catch (error) {
      console.error('Error calculating traffic density:', error);
      return {
        density: 'medium',
        vehicleCount: 0,
        recommendations: ['Unable to analyze traffic density']
      };
    }
  }

  async predictTrafficFlow(historicalData: any[], currentConditions: any): Promise<{
    predictions: Array<{
      timeSlot: string;
      expectedDensity: string;
      recommendations: string[];
    }>;
    hotspots: Array<{
      location: any;
      riskLevel: string;
      timePattern: string;
    }>;
  }> {
    try {
      const prompt = `Analyze traffic patterns and predict flow:
Historical Data: ${JSON.stringify(historicalData.slice(0, 20))}
Current Conditions: ${JSON.stringify(currentConditions)}

Provide:
1. Hourly traffic predictions for next 8 hours
2. Potential hotspot identification
3. Route optimization suggestions
4. Event-based traffic impact

Respond in JSON format.`;

      const response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.3,
      });

      return JSON.parse(response.choices[0].message.content || '{}');
    } catch (error) {
      console.error('Error predicting traffic flow:', error);
      return {
        predictions: [],
        hotspots: []
      };
    }
  }

  async generateViolationReport(violations: any[]): Promise<string> {
    try {
      const prompt = `Generate comprehensive traffic violation report:
${JSON.stringify(violations.slice(0, 50))}

Include:
1. Violation statistics by type
2. Hotspot analysis
3. Time-based patterns
4. Enforcement recommendations
5. Revenue collection summary

Format as professional police report in English and Marathi.`;

      const response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.4,
      });

      return response.choices[0].message.content || 'Report generation failed';
    } catch (error) {
      console.error('Error generating violation report:', error);
      return 'Unable to generate violation report at this time.';
    }
  }

  async verifyViolationEvidence(photos: string[], description: string): Promise<{
    isValid: boolean;
    confidence: number;
    issues: string[];
    suggestions: string[];
  }> {
    try {
      const prompt = `Verify traffic violation evidence quality:
Photos: ${photos.length} images
Description: ${description}

Check for:
1. Image clarity and visibility
2. License plate visibility
3. Violation clearly captured
4. Timestamp and location data
5. Multiple angle coverage
6. Evidence tampering indicators

Provide validation score and improvement suggestions.`;

      const response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.2,
      });

      return JSON.parse(response.choices[0].message.content || '{}');
    } catch (error) {
      console.error('Error verifying evidence:', error);
      return {
        isValid: false,
        confidence: 0,
        issues: ['Unable to verify evidence'],
        suggestions: []
      };
    }
  }
}

export const trafficAIService = new TrafficAIService();