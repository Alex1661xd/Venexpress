export interface Client {
    id: number;
    name: string;
    phone: string;
    documentId?: string;
    vendedor?: {
        id: number;
        name: string;
    };
    createdAt: string;
    updatedAt: string;
}

export interface CreateClientDto {
    name: string;
    phone: string;
    documentId?: string;
}

export interface UpdateClientDto {
    name?: string;
    phone?: string;
    documentId?: string;
}
