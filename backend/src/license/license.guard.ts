import { CanActivate, ExecutionContext, Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { LicenseService } from './license.service';

@Injectable()
export class LicenseGuard implements CanActivate {
  constructor(private readonly licenseService: LicenseService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const url = request.url;

    // Bỏ qua kiểm tra License đối với các API đăng nhập và kiểm tra trạng thái License
    if (url.includes('/auth/login') || url.includes('/license')) {
      return true;
    }

    const licenseStatus = await this.licenseService.getLicenseStatus();
    
    if (licenseStatus.isExpired) {
      throw new HttpException({
        isLocked: true,
        message: 'Phần mềm đã hết hạn bản quyền hoặc dùng thử. Vui lòng liên hệ nhà cung cấp.',
        status: licenseStatus
      }, HttpStatus.PAYMENT_REQUIRED); // Mã lỗi 402
    }

    return true;
  }
}
