import { Injectable, OnModuleInit, HttpException, HttpStatus } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as jwt from 'jsonwebtoken';

export interface LicensePayload {
  clientName: string;
  domain: string;
  type: 'TRIAL' | 'PAID';
  expiryDate: string; // ISO date string
}

export interface LicenseStatus {
  isValid: boolean;
  isExpired: boolean;
  daysLeft: number;
  type: 'TRIAL' | 'PAID' | 'NONE';
  clientName: string;
  shouldWarn: boolean;
  warningMessage?: string;
  expiryDate?: string;
}

const LICENSE_SECRET = process.env.JWT_SECRET || "CONST_ERP_MASTER_SECRET_KEY_2026_DO_NOT_SHARE";

@Injectable()
export class LicenseService implements OnModuleInit {
  constructor(private prisma: PrismaService) {}

  async onModuleInit() {
    // Auto-generate a trial license on first run if DB is empty
    const existing = await this.prisma.systemLicense.findFirst({ where: { status: 'ACTIVE' }});
    if (!existing) {
      const payload: LicensePayload = {
        clientName: 'Demo Client',
        domain: '*', // Allow any domain for initial trial
        type: 'TRIAL',
        expiryDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString() // 90 days from now
      };
      const token = jwt.sign(payload, LICENSE_SECRET);
      await this.prisma.systemLicense.create({
        data: {
          licenseKey: token,
          status: 'ACTIVE'
        }
      });
      console.log('✅ Generated Initial 90-Day Trial License');
    }
  }

  async getLicenseStatus(): Promise<LicenseStatus> {
    const license = await this.prisma.systemLicense.findFirst({
      where: { status: 'ACTIVE' },
      orderBy: { id: 'desc' }
    });

    if (!license) {
      return { isValid: false, isExpired: true, daysLeft: 0, type: 'NONE', clientName: '', shouldWarn: false };
    }

    try {
      const decoded = jwt.verify(license.licenseKey, LICENSE_SECRET) as LicensePayload;
      const expiryDate = new Date(decoded.expiryDate);
      const now = new Date();
      const diffTime = expiryDate.getTime() - now.getTime();
      const daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      const isExpired = daysLeft <= 0;
      
      let shouldWarn = false;
      let warningMessage = '';

      if (!isExpired && decoded.type === 'TRIAL') {
        // Warn every 10 days, or if less than 10 days left
        const totalTrialDays = 90; // Assuming 90 days trial, calculate days passed
        const daysPassed = totalTrialDays - daysLeft;
        
        if (daysLeft <= 10) {
          shouldWarn = true;
          warningMessage = `Phần mềm của bạn sắp hết hạn dùng thử (còn ${daysLeft} ngày). Ngày hết hạn: ${expiryDate.toLocaleDateString('vi-VN')}. Vui lòng liên hệ nhà cung cấp để mua bản quyền.`;
        } else if (daysPassed >= 0 && daysPassed % 10 === 0) {
          shouldWarn = true;
          warningMessage = `Bạn đang trong thời gian dùng thử (còn ${daysLeft} ngày). Hãy mua License Key để sử dụng lâu dài, phần mềm sẽ bị khóa sau ngày ${expiryDate.toLocaleDateString('vi-VN')} thử nghiệm.`;
        }
      }

      return {
        isValid: !isExpired,
        isExpired: isExpired,
        daysLeft: daysLeft > 0 ? daysLeft : 0,
        type: decoded.type,
        clientName: decoded.clientName,
        shouldWarn,
        warningMessage,
        expiryDate: expiryDate.toISOString()
      };
    } catch (err) {
      // Invalid token signature
      return { isValid: false, isExpired: true, daysLeft: 0, type: 'NONE', clientName: '', shouldWarn: false };
    }
  }

  async activateLicense(key: string): Promise<boolean> {
    try {
      // Verify first
      const decoded = jwt.verify(key, LICENSE_SECRET) as LicensePayload;
      
      // Invalidate all old licenses
      await this.prisma.systemLicense.updateMany({
        where: { status: 'ACTIVE' },
        data: { status: 'EXPIRED' }
      });

      // Insert new
      await this.prisma.systemLicense.create({
        data: {
          licenseKey: key,
          status: 'ACTIVE'
        }
      });

      return true;
    } catch (err) {
      throw new HttpException('Mã kích hoạt không hợp lệ hoặc đã bị can thiệp', HttpStatus.BAD_REQUEST);
    }
  }
}
