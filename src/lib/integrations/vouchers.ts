import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface Voucher {
  code: string;
  type: 'percentage' | 'fixed' | 'full';
  value: number;
  maxUses: number;
  usedCount: number;
  minAmount?: number;
  expiresAt: Date;
  createdAt: Date;
  createdBy: string;
  isActive: boolean;
}

export interface VoucherValidationResult {
  valid: boolean;
  discountAmount: number;
  message?: string;
  voucher?: Voucher;
}

export class VoucherSystem {
  async validateVoucher(code: string, amount: number, userId?: string): Promise<VoucherValidationResult> {
    try {
      // Find voucher
      const voucher = await prisma.voucher.findUnique({
        where: { code },
      });

      if (!voucher) {
        return {
          valid: false,
          discountAmount: 0,
          message: 'كود الخصم غير صحيح',
        };
      }

      // Check if active
      if (!voucher.isActive) {
        return {
          valid: false,
          discountAmount: 0,
          message: 'كود الخصم غير فعال',
        };
      }

      // Check expiration
      if (voucher.expiresAt && new Date() > voucher.expiresAt) {
        return {
          valid: false,
          discountAmount: 0,
          message: 'كود الخصم منتهي الصلاحية',
        };
      }

      // Check max uses
      if (voucher.maxUses > 0 && voucher.usedCount >= voucher.maxUses) {
        return {
          valid: false,
          discountAmount: 0,
          message: 'تم استخدام هذا الكود للعدد الأقصى',
        };
      }

      // Check min amount
      if (voucher.minAmount && amount < voucher.minAmount) {
        return {
          valid: false,
          discountAmount: 0,
          message: `الحد الأدنى للطلب ${voucher.minAmount} ج.م`,
        };
      }

      // Calculate discount
      let discountAmount = 0;

      switch (voucher.type) {
        case 'percentage':
          discountAmount = (amount * voucher.value) / 100;
          break;
        case 'fixed':
          discountAmount = Math.min(voucher.value, amount);
          break;
        case 'full':
          discountAmount = amount;
          break;
      }

      // Check if discount exceeds amount
      if (discountAmount > amount) {
        discountAmount = amount;
      }

      // Check user restrictions if any
      if (voucher.userId && voucher.userId !== userId) {
        return {
          valid: false,
          discountAmount: 0,
          message: 'هذا الكود غير متاح لك',
        };
      }

      return {
        valid: true,
        discountAmount,
        voucher,
      };
    } catch (error) {
      console.error('Voucher validation error:', error);
      return {
        valid: false,
        discountAmount: 0,
        message: 'حدث خطأ في التحقق من الكود',
      };
    }
  }

  async useVoucher(code: string, bookingId: string, userId: string): Promise<{
    success: boolean;
    discountAmount: number;
    message?: string;
  }> {
    try {
      const transaction = await prisma.$transaction(async (tx) => {
        // Get and lock voucher
        const voucher = await tx.voucher.findUnique({
          where: { code },
          select: {
            id: true,
            type: true,
            value: true,
            usedCount: true,
            maxUses: true,
          },
        });

        if (!voucher) {
          throw new Error('الكود غير موجود');
        }

        // Check if can be used
        if (voucher.maxUses > 0 && voucher.usedCount >= voucher.maxUses) {
          throw new Error('تم استخدام الكود للعدد الأقصى');
        }

        // Increment used count
        await tx.voucher.update({
          where: { code },
          data: {
            usedCount: voucher.usedCount + 1,
          },
        });

        // Create voucher usage record
        await tx.voucherUsage.create({
          data: {
            voucherId: voucher.id,
            bookingId,
            userId,
            discountAmount: voucher.value, // Store the value used
            usedAt: new Date(),
          },
        });

        return voucher;
      });

      return {
        success: true,
        discountAmount: transaction.value,
        message: 'تم استخدام الكود بنجاح',
      };
    } catch (error) {
      console.error('Voucher usage error:', error);
      return {
        success: false,
        discountAmount: 0,
        message: error instanceof Error ? error.message : 'حدث خطأ في استخدام الكود',
      };
    }
  }

  async createVoucher(data: {
    code: string;
    type: 'percentage' | 'fixed' | 'full';
    value: number;
    maxUses?: number;
    minAmount?: number;
    expiresAt?: Date;
    userId?: string;
    createdBy: string;
  }) {
    try {
      const voucher = await prisma.voucher.create({
        data: {
          code: data.code.toUpperCase(),
          type: data.type,
          value: data.value,
          maxUses: data.maxUses || 0,
          minAmount: data.minAmount,
          expiresAt: data.expiresAt,
          userId: data.userId,
          createdBy: data.createdBy,
          isActive: true,
          usedCount: 0,
        },
      });

      return {
        success: true,
        voucher,
        message: 'تم إنشاء الكود بنجاح',
      };
    } catch (error) {
      console.error('Create voucher error:', error);
      return {
        success: false,
        message: 'حدث خطأ في إنشاء الكود',
      };
    }
  }

  async deactivateVoucher(code: string) {
    try {
      await prisma.voucher.update({
        where: { code },
        data: { isActive: false },
      });

      return {
        success: true,
        message: 'تم تعطيل الكود بنجاح',
      };
    } catch (error) {
      console.error('Deactivate voucher error:', error);
      return {
        success: false,
        message: 'حدث خطأ في تعطيل الكود',
      };
    }
  }

  async getVoucherStats(code: string) {
    try {
      const voucher = await prisma.voucher.findUnique({
        where: { code },
        include: {
          usages: {
            include: {
              booking: true,
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                },
              },
            },
            orderBy: {
              usedAt: 'desc',
            },
            take: 10,
          },
        },
      });

      if (!voucher) {
        return null;
      }

      const totalDiscount = voucher.usages.reduce(
        (sum, usage) => sum + usage.discountAmount,
        0
      );

      return {
        voucher,
        stats: {
          totalUses: voucher.usedCount,
          totalDiscount,
          remainingUses: voucher.maxUses > 0 ? voucher.maxUses - voucher.usedCount : 'غير محدود',
          isExpired: voucher.expiresAt ? new Date() > voucher.expiresAt : false,
          isActive: voucher.isActive,
        },
        recentUses: voucher.usages,
      };
    } catch (error) {
      console.error('Get voucher stats error:', error);
      return null;
    }
  }
}

// Singleton instance
let voucherInstance: VoucherSystem | null = null;

export function getVoucherSystem(): VoucherSystem {
  if (!voucherInstance) {
    voucherInstance = new VoucherSystem();
  }
  return voucherInstance;
}
