import twilio from 'twilio';

const accountSid = process.env.TWILIO_ACCOUNT_SID || 'AC204cf53708838cf6fa8b84314145b9eb';
const authToken = process.env.TWILIO_AUTH_TOKEN || '67cd538b89146f332ef4661ae8f30322';
const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER || '+16813217852';

const client = twilio(accountSid, authToken);

export class TwilioService {
  async sendSMS(to: string, message: string): Promise<boolean> {
    try {
      const messageResponse = await client.messages.create({
        body: message,
        from: twilioPhoneNumber,
        to: to,
      });
      
      console.log(`SMS sent successfully: ${messageResponse.sid}`);
      return true;
    } catch (error) {
      console.error('Error sending SMS:', error);
      return false;
    }
  }

  async sendEmergencyAlert(phoneNumber: string, location: any, alertType: string): Promise<boolean> {
    const message = `🚨 EMERGENCY ALERT 🚨
Type: ${alertType.toUpperCase()}
Location: ${location.address || `${location.lat}, ${location.lng}`}
Time: ${new Date().toLocaleString('en-IN')}

Emergency services have been notified. Help is on the way.

Ahilyangara Police
Emergency: 100`;

    return await this.sendSMS(phoneNumber, message);
  }

  async sendWomenSafetyAlert(phoneNumber: string, incidentType: string, location: any): Promise<boolean> {
    const message = `🚺 WOMEN SAFETY ALERT
Incident: ${incidentType.replace('_', ' ').toUpperCase()}
Location: ${location.address || `${location.lat}, ${location.lng}`}
Time: ${new Date().toLocaleString('en-IN')}

Your safety report has been registered. Our women safety team will respond shortly.

Women Helpline: 1091
Ahilyangara Police`;

    return await this.sendSMS(phoneNumber, message);
  }

  async sendChildSafetyAlert(phoneNumber: string, childName: string, alertType: string, location: any): Promise<boolean> {
    const message = `👶 CHILD SAFETY ALERT
Child: ${childName}
Alert: ${alertType.replace('_', ' ').toUpperCase()}
Location: ${location?.address || 'Location not specified'}
Time: ${new Date().toLocaleString('en-IN')}

Child safety alert activated. Our response team is coordinating with local authorities.

Childline: 1098
Emergency: 100`;

    return await this.sendSMS(phoneNumber, message);
  }

  async sendComplaintConfirmation(phoneNumber: string, complaintId: number, category: string): Promise<boolean> {
    const message = `📋 COMPLAINT REGISTERED
ID: #${complaintId}
Category: ${category.toUpperCase()}
Status: Under Review

Your complaint has been registered and assigned to the appropriate department. You will receive updates on progress.

Track status: Visit our portal
Ahilyangara Police`;

    return await this.sendSMS(phoneNumber, message);
  }

  async sendStatusUpdate(phoneNumber: string, caseId: number, status: string, caseType: string): Promise<boolean> {
    const message = `📢 STATUS UPDATE
${caseType.toUpperCase()} #${caseId}
Status: ${status.toUpperCase()}
Updated: ${new Date().toLocaleString('en-IN')}

For more details, visit our citizen portal or contact your assigned officer.

Ahilyangara Police`;

    return await this.sendSMS(phoneNumber, message);
  }
}

export const twilioService = new TwilioService();