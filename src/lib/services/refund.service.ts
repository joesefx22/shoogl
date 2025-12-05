import { PrismaClient } from '@prisma/client';
import { getPaymobInstance } from '@/lib/integrations/paymob';

const prisma = new PrismaClient();

export interface RefundRequest {
  bookingId: string;
  reason: string;
  refundType: 'full' | 'partial' | 'deposit_only';
  partialAmount?: number;
  initiatedBy: string;
  initiatedByRole: 'admin' | 'owner' | 'player';
}

export interface RefundResponse {
  success: boolean;
  refundId?: string;
  amount: number;
  message: string;
  transactionId?: string;
}

export class RefundService {
  private paymob = getPaymobInstance();

  async calculateRefundAmount(bookingId: string, refundType: string): Promise<{
    eligible: boolean;
    amount: number;
    policy: string;
    message: string;
  }> {
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        payments: {
          where: {
            status: 'PAID',
          },
        },
      },
    });

    if (!booking) {
      return {
        eligible: false,
        amount: 0,
        policy: 'none',
        message: 'الحجز غير موجود',
      };
    }

    const bookingDate = new Date(booking.date);
    const now = new Date();
    const hoursUntilBooking = (bookingDate.getTime() - now.getTime()) / (1000 * 60 * 60);

    let refundPolicy = 'none';
    let refundPercentage = 0;

    // سياسة الاسترجاع بناءً على الوقت
    if (hoursUntilBooking > 24) {
      refundPolicy = 'full';
      refundPercentage = 100;
    } else if (hoursUntilBooking > 12) {
      refundPolicy = 'partial_50';
      refundPercentage = 50;
    } else if (hoursUntilBooking > 6) {
      refundPolicy = 'partial_25';
      refundPercentage = 25;
    } else {
      refundPolicy = 'none';
      refundPercentage = 0;
    }

    const totalPaid = booking.payments.reduce((sum, payment) => sum + payment.amount, 0);
    const refundAmount = (totalPaid * refundPercentage) / 100;

    return {
      eligible: refundPercentage > 0,
      amount: refundAmount,
      policy: refundPolicy,
      message: refundPercentage > 0 
        ? `يمكنك استرجاع ${refundPercentage}% من المبلغ (${refundAmount} ج.م)`
        : 'لا يمكن الاسترجاع (أقل من 6 ساعات للموعد)',
    };
  }

  async processRefund(request: RefundRequest): Promise<RefundResponse> {
    try {
      // 1. التحقق من الحجز والمدفوعات
      const booking = await prisma.booking.findUnique({
        where: { id: request.bookingId },
        include: {
          payments: {
            where: {
              status: 'PAID',
              refunded: false,
            },
          },
        },
      });

      if (!booking) {
        return {
          success: false,
          amount: 0,
          message: 'الحجز غير موجود',
        };
      }

      // 2. حساب مبلغ الاسترجاع
      let refundAmount = 0;
      const totalPaid = booking.payments.reduce((sum, p) => sum + p.amount, 0);

      if (request.refundType === 'full') {
        refundAmount = totalPaid;
      } else if (request.refundType === 'deposit_only') {
        refundAmount = booking.depositPaid || 0;
      } else if (request.refundType === 'partial' && request.partialAmount) {
        refundAmount = Math.min(request.partialAmount, totalPaid);
      }

      if (refundAmount <= 0) {
        return {
          success: false,
          amount: 0,
          message: 'مبلغ الاسترجاع غير صالح',
        };
      }

      // 3. تنفيذ الاسترجاع في معاملة واحدة
      const result = await prisma.$transaction(async (tx) => {
        // 3.1. إنشاء سجل الاسترجاع
        const refund = await tx.refund.create({
          data: {
            bookingId: request.bookingId,
            amount: refundAmount,
            reason: request.reason,
            status: 'PENDING',
            refundType: request.refundType,
            initiatedBy: request.initiatedBy,
            initiatedByRole: request.initiatedByRole,
          },
        });

        // 3.2. تحديث حالة الحجز
        await tx.booking.update({
          where: { id: request.bookingId },
          data: {
            status: 'CANCELLED',
            cancellationReason: request.reason,
            cancelledAt: new Date(),
          },
        });

        // 3.3. تحديث حالة المدفوعات
        await Promise.all(
          booking.payments.map(async (payment) => {
            await tx.payment.update({
              where: { id: payment.id },
              data: {
                refunded: true,
                refundAmount: payment.amount,
              },
            });
          })
        );

        // 3.4. إرجاع الساعات للجدولة
        await tx.slot.updateMany({
          where: {
            bookingId: request.bookingId,
          },
          data: {
            status: 'AVAILABLE',
            bookingId: null,
          },
        });

        return refund;
      });

      // 4. تنفيذ الاسترجاع المالي عبر Paymob (إذا كان الدفع إلكترونياً)
      let paymobTransactionId = null;
      if (booking.payments.some(p => p.paymentMethod === 'PAYMOB')) {
        try {
          const paymobResult = await this.paymob.processRefund({
            transactionId: booking.payments[0].transactionId!,
            amount: refundAmount,
            reason: request.reason,
          });

          if (paymobResult.success) {
            paymobTransactionId = paymobResult.refundId;
            
            // تحديث حالة الاسترجاع إلى مكتمل
            await prisma.refund.update({
              where: { id: result.id },
              data: {
                status: 'COMPLETED',
                transactionId: paymobTransactionId,
                completedAt: new Date(),
              },
            });
          }
        } catch (paymobError) {
          console.error('Paymob refund error:', paymobError);
          // نستمر في العملية حتى لو فشل الاسترجاع من Paymob
        }
      }

      // 5. إرسال إشعارات
      await this.sendRefundNotifications(request.bookingId, refundAmount);

      return {
        success: true,
        refundId: result.id,
        amount: refundAmount,
        transactionId: paymobTransactionId || undefined,
        message: 'تم معالجة الاسترجاع بنجاح',
      };

    } catch (error) {
      console.error('Refund processing error:', error);
      return {
        success: false,
        amount: 0,
        message: 'حدث خطأ في معالجة الاسترجاع',
      };
    }
  }

  private async sendRefundNotifications(bookingId: string, amount: number) {
    try {
      const booking = await prisma.booking.findUnique({
        where: { id: bookingId },
        include: {
          user: true,
          stadium: {
            include: {
              owner: true,
            },
          },
        },
      });

      if (!booking) return;

      // إرسال إشعار للمستخدم
      await prisma.notification.create({
        data: {
          userId: booking.userId,
          type: 'REFUND',
          title: 'تم استرجاع مبلغ الحجز',
          message: `تم استرجاع مبلغ ${amount} ج.م من حجزك في ${booking.stadium.name}`,
          data: {
            bookingId,
            amount,
            stadiumName: booking.stadium.name,
          },
        },
      });

      // إرسال إيميل للمستخدم
      // TODO: Implement email service

      // إشعار للمالك
      await prisma.notification.create({
        data: {
          userId: booking.stadium.ownerId,
          type: 'BOOKING_CANCELLED',
          title: 'تم إلغاء حجز واسترجاع المبلغ',
          message: `تم إلغاء حجز في ${booking.stadium.name} واسترجاع ${amount} ج.م`,
          data: {
            bookingId,
            amount,
          },
        },
      });

    } catch (error) {
      console.error('Notification error:', error);
    }
  }

  async getRefundHistory(bookingId: string) {
    return prisma.refund.findMany({
      where: { bookingId },
      orderBy: { createdAt: 'desc' },
      include: {
        booking: {
          include: {
            stadium: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    });
  }
}

// Singleton instance
let refundInstance: RefundService | null = null;

export function getRefundService(): RefundService {
  if (!refundInstance) {
    refundInstance = new RefundService();
  }
  return refundInstance;
}
