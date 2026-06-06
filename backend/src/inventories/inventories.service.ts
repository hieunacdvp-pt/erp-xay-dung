import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateInventoryDto } from './dto/create-inventory.dto';
import { UpdateInventoryDto } from './dto/update-inventory.dto';

@Injectable()
export class InventoriesService {
  constructor(private readonly prisma: PrismaService) {}

  create(createInventoryDto: CreateInventoryDto) {
    return this.prisma.inventory.create({
      data: createInventoryDto,
    });
  }

  findAll() {
    return this.prisma.inventory.findMany({
      include: {
        project: true,
        material: true,
      }
    });
  }

  findAllMovements() {
    return this.prisma.inventoryMovement.findMany({
      include: {
        project: true,
        material: true,
      },
      orderBy: {
        date: 'desc'
      }
    });
  }

  findOne(id: number) {
    return this.prisma.inventory.findUnique({
      where: { id },
      include: {
        project: true,
        material: true,
      }
    });
  }

  update(id: number, updateInventoryDto: UpdateInventoryDto) {
    return this.prisma.inventory.update({
      where: { id },
      data: updateInventoryDto,
    });
  }

  remove(id: number) {
    return this.prisma.inventory.delete({
      where: { id },
    });
  }
}
