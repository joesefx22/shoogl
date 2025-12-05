import crypto from 'crypto';

export interface PaymobConfig {
  apiKey: string;
  integrationId: number;
  iframeId: number;
  hmacSecret: string;
}

export interface PaymobOrderRequest {
  amount: number;
  currency: string;
  items: Array<{
    name: string;
    amount: number;
    description?: string;
  }>;
  billingData: {
    first_name: string;
    last_name: string;
    phone_number: string;
    email?: string;
  };
  metadata: Record<string, any>;
}

export class PaymobIntegration {
  private config: PaymobConfig;

  constructor(config: PaymobConfig) {
    this.config = config;
  }

  async createOrder(request: PaymobOrderRequest) {
    try {
      // Step 1: Get authentication token
      const authToken = await this.getAuthToken();
      
      // Step 2: Create order
      const order = await this.createOrderRequest(authToken, request);
      
      // Step 3: Get payment key
      const paymentKey = await this.getPaymentKey(authToken, order.id, request);
      
      // Step 4: Generate iframe URL
      const iframeUrl = this.generateIframeUrl(paymentKey);
      
      return {
        success: true,
        orderId: order.id,
        paymentKey,
        iframeUrl,
        paymentUrl: iframeUrl,
      };
    } catch (error) {
      console.error('Paymob integration error:', error);
      throw error;
    }
  }

  private async getAuthToken(): Promise<string> {
    const response = await fetch('https://accept.paymob.com/api/auth/tokens', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        api_key: this.config.apiKey,
      }),
    });

    const data = await response.json();
    return data.token;
  }

  private async createOrderRequest(token: string, request: PaymobOrderRequest) {
    const response = await fetch('https://accept.paymob.com/api/ecommerce/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        amount_cents: request.amount * 100, // Convert to cents
        currency: request.currency || 'EGP',
        items: request.items,
      }),
    });

    return response.json();
  }

  private async getPaymentKey(token: string, orderId: number, request: PaymobOrderRequest) {
    const response = await fetch('https://accept.paymob.com/api/acceptance/payment_keys', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        amount_cents: request.amount * 100,
        expiration: 3600,
        order_id: orderId,
        billing_data: request.billingData,
        currency: request.currency || 'EGP',
        integration_id: this.config.integrationId,
        lock_order_when_paid: true,
        metadata: request.metadata,
      }),
    });

    const data = await response.json();
    return data.token;
  }

  private generateIframeUrl(paymentKey: string): string {
    return `https://accept.paymob.com/api/acceptance/iframes/${this.config.iframeId}?payment_token=${paymentKey}`;
  }

  verifyHMAC(amount: string, hmac: string, orderId: string): boolean {
    const data = `amount_cents=${amount}&created_at=${new Date().toISOString()}&currency=EGP&error_occured=false&has_parent_transaction=false&id=${orderId}&integration_id=${this.config.integrationId}&is_3d_secure=false&is_auth=false&is_capture=false&is_refunded=false&is_standalone_payment=true&is_voided=false&order=${orderId}&owner=${this.config.integrationId}&pending=false&source_data.pan=XXXX&source_data.sub_type=Card&source_data.type=card&success=true`;
    
    const generatedHMAC = crypto
      .createHmac('sha512', this.config.hmacSecret)
      .update(data)
      .digest('hex');

    return generatedHMAC === hmac;
  }

  async handleWebhook(payload: any): Promise<{
    success: boolean;
    transactionId: string;
    bookingId: string;
    amount: number;
  }> {
    try {
      // Verify HMAC
      const isValid = this.verifyHMAC(
        payload.amount_cents,
        payload.hmac,
        payload.order.id.toString()
      );

      if (!isValid) {
        throw new Error('Invalid HMAC signature');
      }

      // Extract booking ID from metadata
      const bookingId = payload.obj.order.metadata?.bookingId;

      if (!bookingId) {
        throw new Error('Booking ID not found in metadata');
      }

      return {
        success: payload.success,
        transactionId: payload.id.toString(),
        bookingId,
        amount: parseFloat(payload.amount_cents) / 100,
      };
    } catch (error) {
      console.error('Paymob webhook error:', error);
      throw error;
    }
  }
}

// Singleton instance
let paymobInstance: PaymobIntegration | null = null;

export function getPaymobInstance(): PaymobIntegration {
  if (!paymobInstance) {
    const config: PaymobConfig = {
      apiKey: process.env.PAYMOB_API_KEY || '',
      integrationId: parseInt(process.env.PAYMOB_INTEGRATION_ID || '0'),
      iframeId: parseInt(process.env.PAYMOB_IFRAME_ID || '0'),
      hmacSecret: process.env.PAYMOB_HMAC_SECRET || '',
    };

    if (!config.apiKey || !config.integrationId || !config.iframeId) {
      throw new Error('Paymob configuration is missing');
    }

    paymobInstance = new PaymobIntegration(config);
  }

  return paymobInstance;
}
