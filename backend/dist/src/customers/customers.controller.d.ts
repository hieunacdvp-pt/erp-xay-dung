import { CustomersService } from './customers.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
export declare class CustomersController {
    private readonly customersService;
    constructor(customersService: CustomersService);
    create(createCustomerDto: CreateCustomerDto): import("@prisma/client").Prisma.Prisma__CustomerClient<{
        id: number;
        createdAt: Date;
        name: string;
        phone: string | null;
        address: string | null;
        taxCode: string | null;
    }, never, import("@prisma/client/runtime/client").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
    findAll(): import("@prisma/client").Prisma.PrismaPromise<({
        debts: {
            id: number;
            createdAt: Date;
            type: string;
            amount: number;
            vendorId: number | null;
            customerId: number | null;
            status: string;
        }[];
    } & {
        id: number;
        createdAt: Date;
        name: string;
        phone: string | null;
        address: string | null;
        taxCode: string | null;
    })[]>;
    findOne(id: string): import("@prisma/client").Prisma.Prisma__CustomerClient<({
        debts: {
            id: number;
            createdAt: Date;
            type: string;
            amount: number;
            vendorId: number | null;
            customerId: number | null;
            status: string;
        }[];
    } & {
        id: number;
        createdAt: Date;
        name: string;
        phone: string | null;
        address: string | null;
        taxCode: string | null;
    }) | null, null, import("@prisma/client/runtime/client").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
    update(id: string, updateCustomerDto: UpdateCustomerDto): import("@prisma/client").Prisma.Prisma__CustomerClient<{
        id: number;
        createdAt: Date;
        name: string;
        phone: string | null;
        address: string | null;
        taxCode: string | null;
    }, never, import("@prisma/client/runtime/client").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
    remove(id: string): import("@prisma/client").Prisma.Prisma__CustomerClient<{
        id: number;
        createdAt: Date;
        name: string;
        phone: string | null;
        address: string | null;
        taxCode: string | null;
    }, never, import("@prisma/client/runtime/client").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
}
