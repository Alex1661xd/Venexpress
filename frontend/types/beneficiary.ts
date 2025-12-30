export interface Beneficiary {
    id: number;
    fullName: string;
    documentId: string;
    bankName: string;
    accountNumber?: string;
    accountType?: 'ahorro' | 'corriente';
    phone?: string;
    isPagoMovil: boolean;
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
    accountNumber?: string;
    accountType?: string;
    phone?: string;
    isPagoMovil?: boolean;
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
    isPagoMovil?: boolean;
    clientColombiaId?: number;
}
