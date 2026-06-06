import { BankAccountsService } from './bank-accounts.service';
import { UpdateBankAccountDto } from './dto/update-bank-account.dto';
export declare class BankAccountsController {
    private readonly bankAccountsService;
    constructor(bankAccountsService: BankAccountsService);
    create(createBankAccountDto: any): import("@prisma/client").Prisma.Prisma__BankAccountClient<{
        id: number;
        createdAt: Date;
        name: string;
        type: string;
        accountNumber: string | null;
        bankName: string | null;
        openingBalance: number;
    }, never, import("@prisma/client/runtime/client").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
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
    findOne(id: string): Promise<{
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
    update(id: string, updateBankAccountDto: UpdateBankAccountDto): import("@prisma/client").Prisma.Prisma__BankAccountClient<{
        id: number;
        createdAt: Date;
        name: string;
        type: string;
        accountNumber: string | null;
        bankName: string | null;
        openingBalance: number;
    }, never, import("@prisma/client/runtime/client").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
    remove(id: string): import("@prisma/client").Prisma.Prisma__BankAccountClient<{
        id: number;
        createdAt: Date;
        name: string;
        type: string;
        accountNumber: string | null;
        bankName: string | null;
        openingBalance: number;
    }, never, import("@prisma/client/runtime/client").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
}
