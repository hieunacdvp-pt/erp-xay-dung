import { Injectable } from '@nestjs/common';
import { CreateSubcontractorDto } from './dto/create-subcontractor.dto';
import { UpdateSubcontractorDto } from './dto/update-subcontractor.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SubcontractorsService {
  constructor(private prisma: PrismaService) {}

  create(createSubcontractorDto: any) {
    return this.prisma.subcontractor.create({
      data: createSubcontractorDto
    });
  }

  findAll() {
    return this.prisma.subcontractor.findMany({
      orderBy: { createdAt: 'desc' }
    });
  }

  findOne(id: number) {
    return this.prisma.subcontractor.findUnique({
      where: { id },
      include: { contracts: true, transactions: true }
    });
  }

  update(id: number, updateSubcontractorDto: any) {
    return this.prisma.subcontractor.update({
      where: { id },
      data: updateSubcontractorDto
    });
  }

  remove(id: number) {
    return this.prisma.subcontractor.update({
      where: { id },
      data: { status: 'INACTIVE' }
    });
  }
}
