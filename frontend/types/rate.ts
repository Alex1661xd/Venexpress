export enum RateType {
    ACTUAL = 'actual',
    PAYPAL = 'paypal',
    ZELLE = 'zelle',
    DOLARES = 'dolares',
    BANCO_CENTRAL = 'banco_central',
}

export interface ExchangeRate {
    id: number;
    rateType: RateType;
    saleRate: number; // tasa de venta principal
    purchaseRate?: number | null; // tasa de compra opcional
    createdBy: {
        id: number;
        name: string;
    };
    createdAt: string;
    updatedAt: string;
}
