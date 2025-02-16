import webpush from 'web-push';

// Configure web push with your VAPID keys
const vapidKeys = {
  publicKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || '',
  privateKey: process.env.VAPID_PRIVATE_KEY || ''
};

webpush.setVapidDetails(
  'mailto:' + (process.env.VAPID_CONTACT_EMAIL || 'example@yourdomain.com'),
  vapidKeys.publicKey,
  vapidKeys.privateKey
);

export const webPush = {
  /**
   * Send a push notification
   */
  async send(subscription: PushSubscription, payload: any) {
    try {
      await webpush.sendNotification(
        subscription,
        typeof payload === 'string' ? payload : JSON.stringify(payload)
      );
      return true;
    } catch (error) {
      console.error('Push notification error:', error);
      return false;
    }
  },

  /**
   * Get the public VAPID key
   */
  getPublicKey() {
    return vapidKeys.publicKey;
  }
}; 