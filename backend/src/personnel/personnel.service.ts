import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePersonnelDto } from './dto/create-personnel.dto';
import { UpdatePersonnelDto } from './dto/update-personnel.dto';

@Injectable()
export class PersonnelService {
  constructor(private readonly prisma: PrismaService) {}

  create(createPersonnelDto: CreatePersonnelDto) {
    return this.prisma.personnel.create({
      data: {
        ...createPersonnelDto,
        salaryPerDay: createPersonnelDto.salaryPerDay || 0,
      },
    });
  }

  findAll() {
    return this.prisma.personnel.findMany();
  }

  findOne(id: number) {
    return this.prisma.personnel.findUnique({
      where: { id },
    });
  }

  findByPhone(phone: string) {
    return this.prisma.personnel.findFirst({
      where: { phone },
    });
  }

  update(id: number, updatePersonnelDto: UpdatePersonnelDto) {
    return this.prisma.personnel.update({
      where: { id },
      data: updatePersonnelDto,
    });
  }

  remove(id: number) {
    return this.prisma.personnel.delete({
      where: { id },
    });
  }
}
