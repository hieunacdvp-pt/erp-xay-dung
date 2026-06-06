export declare class CreateTransactionDto {
    projectId: number;
    type: string;
    amount: number;
    category: string;
    date?: Date;
    description?: string;
    accountId?: number;
    bankFee?: number;
    vatRate?: number;
    personnelId?: number;
    isDirectMaterial?: boolean;
    invoiceNumber?: string;
}
