export interface NotificationService {
  send(userId: string, message: string, payload?: any): Promise<void>;
}

export class InAppNotificationService implements NotificationService {
  async send(userId: string, message: string, payload?: any): Promise<void> {
    // In a real app, this would write to a Notifications table
    // or emit via WebSockets/Socket.io
    console.log(`[IN-APP NOTIFICATION] To: ${userId} | Message: ${message}`, payload);
  }
}

export class WhatsAppNotificationService implements NotificationService {
  async send(userId: string, message: string, payload?: any): Promise<void> {
    // Adapter for future WhatsApp integration (Twilio/Meta API)
    console.log(`[WHATSAPP NOTIFICATION] To: ${userId} | Message: ${message}`);
  }
}

export const notificationService = new InAppNotificationService();
