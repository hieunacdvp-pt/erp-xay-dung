import { PrismaService } from '../prisma/prisma.service';
import { UpdateBankAccountDto } from './dto/update-bank-account.dto';
export declare class BankAccountsService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    create(data: any): import("@prisma/client").Prisma.Prisma__BankAccountClient<{
        id: number;
        createdAt: Date;
        name: string;
        type: string;
        accountNumber: string | null;
        bankName: string | null;
        openingBalance: number;
    }, never, import("@prisma/client/runtime/client").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
    findAll(): Promise<{
        balance: number;
        transactions: {
            id: number;
            date: Date;
            description: string | null;
            createdAt: Date;
            projectId: number | null;
            type: string;
            amount: number;
            bankFee: number;
            category: string;
            vatRate: number;
            vatAmount: number;
            accountId: number;
            personnelId: number | null;
            internalTransferId: number | null;
            subcontractorId: number | null;
            isDirectMaterial: boolean;
            invoiceNumber: string | null;
        }[];
        transfersOut: {
            id: number;
            date: Date;
            description: string;
            createdAt: Date;
            amount: number;
            fromAccountId: number;
            toAccountId: number;
            fee: number;
        }[];
        transfersIn: {
            id: number;
            date: Date;
            description: string;
            createdAt: Date;
            amount: number;
            fromAccountId: number;
            toAccountId: number;
            fee: number;
        }[];
        id: number;
        createdAt: Date;
        name: string;
        type: string;
        accountNumber: string | null;
        bankName: string | null;
        openingBalance: number;
    }[]>;
    findOne(id: number): Promise<{
        balance: number;
        transactions: {
            id: number;
            date: Date;
            description: string | null;
            createdAt: Date;
            projectId: number | null;
            type: string;
            amount: number;
            bankFee: number;
            category: string;
            vatRate: number;
            vatAmount: number;
            accountId: number;
            personnelId: number | null;
            internalTransferId: number | null;
            subcontractorId: number | null;
            isDirectMaterial: boolean;
            invoiceNumber: string | null;
        }[];
        transfersOut: {
            id: number;
            date: Date;
            description: string;
            createdAt: Date;
            amount: number;
            fromAccountId: number;
            toAccountId: number;
            fee: number;
        }[];
        transfersIn: {
            id: number;
            date: Date;
            description: string;
            createdAt: Date;
            amount: number;
            fromAccountId: number;
            toAccountId: number;
            fee: number;
        }[];
        id: number;
        createdAt: Date;
        name: string;
        type: string;
        accountNumber: string | null;
        bankName: string | null;
        openingBalance: number;
    } | null>;
    createInternalTransfer(data: {
        fromAccountId: number;
        toAccountId: number;
        amount: number;
        fee: number;
        description: string;
        date?: string;
    }): Promise<{
        id: number;
        date: Date;
        description: string;
        createdAt: Date;
        amount: number;
        fromAccountId: number;
        toAccountId: number;
        fee: number;
    }>;
    update(id: number, updateBankAccountDto: UpdateBankAccountDto): import("@prisma/client").Prisma.Prisma__BankAccountClient<{
        id: number;
        createdAt: Date;
        name: string;
        type: string;
        accountNumber: string | null;
        bankName: string | null;
        openingBalance: number;
    }, never, import("@prisma/client/runtime/client").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
    remove(id: number): import("@prisma/client").Prisma.Prisma__BankAccountClient<{
        id: number;
        createdAt: Date;
        name: string;
        type: string;
        accountNumber: string | null;
        bankName: string | null;
        openingBalance: number;
    }, never, import("@prisma/client/runtime/client").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
}
