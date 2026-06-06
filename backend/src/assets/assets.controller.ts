import { Controller, Get, Post, Body } from '@nestjs/common';
import { AssetsService } from './assets.service';

@Controller('assets')
export class AssetsController {
  constructor(private readonly service: AssetsService) {}

  @Get()
  getAssets() { return this.service.getAssets(); }

  @Post()
  createAsset(@Body() body: any) { return this.service.createAsset(body); }

  @Get('allocations')
  getAllocations() { return this.service.getAllocations(); }

  @Post('allocations')
  createAllocation(@Body() data: any) {
    return this.service.createAllocation(data);
  }

  @Post('depreciate')
  runMonthlyDepreciation(@Body() data: { assetId: number, projectId: number, month: string }) {
    return this.service.runMonthlyDepreciation(data.assetId, data.projectId, data.month);
  }
}
