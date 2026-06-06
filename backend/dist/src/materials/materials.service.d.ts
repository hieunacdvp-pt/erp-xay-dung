import { PrismaService } from '../prisma/prisma.service';
import { CreateMaterialDto } from './dto/create-material.dto';
import { UpdateMaterialDto } from './dto/update-material.dto';
export declare class MaterialsService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    create(createMaterialDto: CreateMaterialDto): import("@prisma/client").Prisma.Prisma__MaterialClient<{
        id: number;
        description: string | null;
        createdAt: Date;
        name: string;
        price: number;
        unit: string;
    }, never, import("@prisma/client/runtime/client").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
    findAll(): import("@prisma/client").Prisma.PrismaPromise<{
        id: number;
        description: string | null;
        createdAt: Date;
        name: string;
        price: number;
        unit: string;
    }[]>;
    findOne(id: number): import("@prisma/client").Prisma.Prisma__MaterialClient<{
        id: number;
        description: string | null;
        createdAt: Date;
        name: string;
        price: number;
        unit: string;
    } | null, null, import("@prisma/client/runtime/client").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
    update(id: number, updateMaterialDto: UpdateMaterialDto): import("@prisma/client").Prisma.Prisma__MaterialClient<{
        id: number;
        description: string | null;
        createdAt: Date;
        name: string;
        price: number;
        unit: string;
    }, never, import("@prisma/client/runtime/client").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
    remove(id: number): import("@prisma/client").Prisma.Prisma__MaterialClient<{
        id: number;
        description: string | null;
        createdAt: Date;
        name: string;
        price: number;
        unit: string;
    }, never, import("@prisma/client/runtime/client").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
}
