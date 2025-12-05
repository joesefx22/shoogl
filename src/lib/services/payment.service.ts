import { api } from '@/lib/api';

export interface PaymentRequest {
  bookingId: string;
  amount: number;
  items: Array<{
    name: string;
    amount: number;
    description?: string;
  }>;
  customer?: {
    name: string;
    phone: string;
    email?: string;
  };
}

export interface PaymentResponse {
  success: boolean;
  message?: string;
  paymentUrl?: string;
  transactionId?: string;
  data?: any;
}

export interface VoucherPaymentRequest {
  bookingId: string;
  voucherCode: string;
  amount: number;
}

class PaymentService {
  // Paymob Integration
  async createPaymobOrder(request: PaymentRequest): Promise<PaymentResponse> {
    try {
      const response = await api.post('/api/payments/create-order', request);
      return response;
    } catch (error) {
      console.error('Paymob order error:', error);
      return {
        success: false,
        message: 'حدث خطأ في إنشاء طلب الدفع',
      };
    }
  }

  // Voucher/Code Payment
  async payWithVoucher(request: VoucherPaymentRequest): Promise<PaymentResponse> {
    try {
      const response = await api.post('/api/payments/use-voucher', request);
      return response;
    } catch (error) {
      console.error('Voucher payment error:', error);
      return {
        success: false,
        message: 'حدث خطأ في استخدام الكود',
      };
    }
  }

  // Cash Payment
  async markAsCashPayment(bookingId: string): Promise<PaymentResponse> {
    try {
      const response = await api.post(`/api/bookings/${bookingId}/cash-payment`);
      return response;
    } catch (error) {
      console.error('Cash payment error:', error);
      return {
        success: false,
        message: 'حدث خطأ في تأكيد الدفع النقدي',
      };
    }
  }

  // Validate Voucher
  async validateVoucher(code: string, amount: number) {
    try {
      const response = await api.post('/api/payments/validate-voucher', {
        code,
        amount,
      });
      return response;
    } catch (error) {
      console.error('Voucher validation error:', error);
      return {
        valid: false,
        message: 'حدث خطأ في التحقق من الكود',
      };
    }
  }

  // Verify Payment
  async verifyPayment(transactionId: string) {
    try {
      const response = await api.post('/api/payments/verify', { transactionId });
      return response;
    } catch (error) {
      console.error('Payment verification error:', error);
      return {
        success: false,
        message: 'حدث خطأ في التحقق من الدفع',
      };
    }
  }

  // Get Payment Status
  async getPaymentStatus(bookingId: string) {
    try {
      const response = await api.get(`/api/payments/status/${bookingId}`);
      return response;
    } catch (error) {
      console.error('Get payment status error:', error);
      return {
        status: 'unknown',
      };
    }
  }
}

export const paymentService = new PaymentService();
