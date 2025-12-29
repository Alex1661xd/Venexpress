export interface Beneficiary {
    id: number;
    fullName: string;
    documentId: string;
    bankName: string;
    accountNumber: string;
    accountType: 'ahorro' | 'corriente';
    phone?: string;
    clientColombia?: {
        id: number;
        name: string;
    };
    userApp?: {
        id: number;
        name: string;
    };
    createdAt: string;
    updatedAt: string;
}

export interface CreateBeneficiaryDto {
    fullName: string;
    documentId: string;
    bankName: string;
    accountNumber: string;
    accountType: string;
    phone?: string;
    clientColombiaId: number; // Obligatorio para vendedores
    userAppId?: number;
}

export interface UpdateBeneficiaryDto {
    fullName?: string;
    documentId?: string;
    bankName?: string;
    accountNumber?: string;
    accountType?: 'ahorro' | 'corriente';
    phone?: string;
    clientColombiaId?: number;
}
