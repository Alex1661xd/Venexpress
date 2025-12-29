export interface ExchangeRate {
    id: number;
    saleRate: number; // tasa de venta principal
    purchaseRate?: number | null; // tasa de compra opcional
    createdBy: {
        id: number;
        name: string;
    };
    createdAt: string;
    updatedAt: string;
}
